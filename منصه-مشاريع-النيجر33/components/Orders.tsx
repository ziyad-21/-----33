
import React, { useState } from 'react';
import { Plus, Printer, Trash2, ChevronDown, MoreHorizontal, X } from 'lucide-react';
import { Language, Order, OrderStatus, Customer, Product, Expense } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface OrdersProps {
  lang: Language;
  customers: Customer[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  showNotification: (msg: string, type: 'success'|'error') => void;
}

const Orders: React.FC<OrdersProps> = ({ lang, customers, orders, setOrders, products, setProducts, expenses, setExpenses, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Order | null>(null);

  const [formData, setFormData] = useState({ 
    customerId: '', 
    productId: '',
    quantity: 0,
    status: OrderStatus.PENDING 
  });

  // دالة تسجيل الدخل - فحص محلي
  const recordIncome = (order: Order) => {
      const orderId = order.id;
      const amount = order.totalAmount;
      const description = `OrderIncome_Ref_${orderId}`; 
      const displayDesc = lang === Language.AR ? `دخل فاتورة مبيعات رقم #${orderId}` : `Revenu commande #${orderId}`;

      const exists = expenses.some(e => e.description === description);
      if (exists) return;

      const newExpense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'income',
          category: 'Sales',
          description: description, // Tag for finding later
          amount: amount,
          date: order.date
      };

      // We modify description for display after the check
      const displayExpense = { ...newExpense, description: displayDesc };
      
      // Store the tag actually, or handle finding it differently. 
      // For simplicity in mock mode, we'll store the tag but maybe display it nicer if needed?
      // Let's store the tag as description to make removeIncome work easily.
      setExpenses(prev => [newExpense, ...prev]);
  };

  const removeIncome = (orderId: string) => {
      const searchTag = `OrderIncome_Ref_${orderId}`;
      setExpenses(prev => prev.filter(e => e.description !== searchTag));
  };

  const handleSaveOrder = () => {
    const customer = customers.find(c => c.id === formData.customerId);
    const product = products.find(p => p.id === formData.productId);

    if (!customer || !product || formData.quantity <= 0) return;

    if (formData.status === OrderStatus.COMPLETED && product.quantity < formData.quantity) {
        showNotification(t('insufficientStock'), 'error');
        return;
    }

    const total = product.price * formData.quantity;
    
    const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        customerId: customer.id,
        customerName: customer.name,
        totalAmount: total,
        date: new Date().toISOString().split('T')[0],
        status: formData.status,
        items: [{
            productId: product.id,
            productName: lang === Language.AR ? product.nameAr : product.nameFr,
            quantity: formData.quantity,
            unitPrice: product.price,
            total: total
        }]
    };

    setOrders(prev => [newOrder, ...prev]);
    
    if (formData.status === OrderStatus.COMPLETED) {
        const newStock = product.quantity - formData.quantity;
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newStock } : p));
        recordIncome(newOrder);
    }

    setIsModalOpen(false);
    showNotification(t('success'), 'success');
    setFormData({ customerId: '', productId: '', quantity: 0, status: OrderStatus.PENDING });
  };

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order || order.status === newStatus) return;

    const oldStatus = order.status;

    // الحالة أ: الانتقال إلى "مكتمل" (خصم مخزون + إضافة دخل)
    if (newStatus === OrderStatus.COMPLETED) {
        for (const item of order.items) {
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                if (prod.quantity < item.quantity) {
                    showNotification(t('insufficientStock'), 'error');
                    return; // Stop if stock low
                }
                const updatedQty = prod.quantity - item.quantity;
                setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, quantity: updatedQty } : p));
            }
        }
        recordIncome(order);
    }

    // الحالة ب: التراجع من "مكتمل" إلى حالة أخرى (إرجاع مخزون + حذف دخل)
    else if (oldStatus === OrderStatus.COMPLETED) {
        for (const item of order.items) {
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                const restoredQty = prod.quantity + item.quantity;
                setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, quantity: restoredQty } : p));
            }
        }
        removeIncome(id);
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showNotification(t('success'), 'success');
  };

  const handleDelete = (id: string) => {
    if(confirm(lang === Language.AR ? 'هل أنت متأكد؟ سيتم حذف السجل المالي وإرجاع المخزون إذا كان الطلب مكتملاً.' : 'Confirmer ? Le stock sera restauré et le revenu supprimé.')) {
        const order = orders.find(o => o.id === id);
        if (order && order.status === OrderStatus.COMPLETED) {
            for (const item of order.items) {
                const prod = products.find(p => p.id === item.productId);
                if (prod) {
                    const restoredQty = prod.quantity + item.quantity;
                    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, quantity: restoredQty } : p));
                }
            }
            removeIncome(id);
        }
        setOrders(prev => prev.filter(o => o.id !== id));
        showNotification(t('success'), 'success');
    }
  };

  const handlePrint = () => window.print();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
       {showInvoice && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 print:bg-white print:fixed print:inset-0">
               <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                    <button onClick={handlePrint} className="bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 flex items-center gap-2 font-bold">
                        <Printer size={20} /> {t('printInvoice')}
                    </button>
                    <button onClick={() => setShowInvoice(null)} className="bg-white text-slate-900 rounded-full p-3 shadow-lg hover:bg-slate-200">
                        <X size={20} />
                    </button>
               </div>
               <div className="bg-white w-[350px] md:w-[500px] p-10 shadow-2xl rounded-sm text-slate-900 print:shadow-none print:w-full">
                   <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                       <h2 className="text-2xl font-bold uppercase tracking-widest">{lang === Language.AR ? 'مصنع كرتون اطباق البيض' : 'USINE DE CARTON D\'OEUFS'}</h2>
                       <p className="text-xs text-slate-500 mt-1">Industrial City, Saudi Arabia</p>
                   </div>
                   <div className="flex justify-between text-sm mb-8">
                       <div><p className="text-slate-500 text-[10px] uppercase font-bold">{t('invoice')} #</p><p className="font-mono font-bold text-lg">{showInvoice.id.slice(0, 8).toUpperCase()}</p></div>
                       <div className="text-right"><p className="text-slate-500 text-[10px] uppercase font-bold">{t('date')}</p><p className="font-mono font-bold text-lg">{showInvoice.date}</p></div>
                   </div>
                   <div className="mb-8 p-4 bg-slate-50 border-l-4 border-blue-600"><p className="text-slate-500 text-[10px] uppercase font-bold mb-1">{t('customer')}</p><p className="font-bold text-xl">{showInvoice.customerName}</p></div>
                   <table className="w-full text-sm mb-8">
                       <thead className="border-b-2 border-slate-200">
                           <tr className={`text-xs uppercase text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                               <th className="py-3">{t('item')}</th>
                               <th className="py-3 text-center">{t('quantity')}</th>
                               <th className="py-3 text-right">{t('total')}</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {showInvoice.items.map((item, idx) => (
                               <tr key={idx}><td className="py-4 font-medium">{item.productName}</td><td className="py-4 text-center">{item.quantity}</td><td className="py-4 text-right font-mono">{item.total.toFixed(2)}</td></tr>
                           ))}
                       </tbody>
                   </table>
                   <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-2xl font-black">
                       <span>{t('total')}</span><span className="font-mono">{showInvoice.totalAmount.toFixed(2)} SAR</span>
                   </div>
                   <div className="mt-12 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 uppercase">
                       <p>{lang === Language.AR ? 'شكراً لتعاملكم معنا' : 'Merci pour votre confiance'}</p>
                   </div>
               </div>
           </div>
       )}

       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>{t('orders')}</h2>
        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"><Plus size={18} /><span>{lang === Language.AR ? 'طلب جديد' : 'Nouvelle Commande'}</span></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-32">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('customer')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('amount')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className={`px-6 py-4 text-sm font-medium text-slate-900 ${isRTL ? 'text-right' : 'text-left'}`}>{order.customerName}</td>
                      <td className={`px-6 py-4 text-sm font-bold text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>{order.totalAmount} SAR</td>
                      <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="relative inline-block">
                             <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)} className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}>
                                <option value={OrderStatus.PENDING}>{t('status_PENDING')}</option>
                                <option value={OrderStatus.PROCESSING}>{t('status_PROCESSING')}</option>
                                <option value={OrderStatus.COMPLETED}>{t('status_COMPLETED')}</option>
                                <option value={OrderStatus.CANCELLED}>{t('status_CANCELLED')}</option>
                             </select>
                             <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'left-0 pl-2' : 'right-0 pr-2'} flex items-center px-2 text-gray-700`}><ChevronDown size={12} /></div>
                          </div>
                      </td>
                      <td className={`px-6 py-4 text-sm text-slate-400 relative ${isRTL ? 'text-right' : 'text-left'}`}>
                         <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === order.id ? null : order.id); }} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
                         {activeMenuId === order.id && (
                               <div className={`absolute z-20 ${isRTL ? 'left-8' : 'right-8'} top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 overflow-hidden`}>
                                   <button onClick={(e) => { e.stopPropagation(); setShowInvoice(order); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2"><Printer size={14} /> {t('printInvoice')}</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> {t('delete')}</button>
                                </div>
                           )}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={lang === Language.AR ? 'طلب جديد' : 'Nouvelle Commande'} isRTL={isRTL}>
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t('customer')}</label>
             <select value={formData.customerId} onChange={(e) => setFormData({...formData, customerId: e.target.value})} className="w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900">
                <option value="">{t('selectCustomer')}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('finishedGoods')}</label>
               <select value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} className="w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900">
                <option value="">{t('selectProduct')}</option>
                {products.map(p => <option key={p.id} value={p.id}>{lang === Language.AR ? p.nameAr : p.nameFr} ({p.price} SAR)</option>)}
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t('quantity')}</label>
             <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">{t('cancel')}</button>
            <button onClick={handleSaveOrder} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('save')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
