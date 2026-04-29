
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { Language, RawMaterial, Product, Expense } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface InventoryProps {
  lang: Language;
  materials: RawMaterial[];
  setMaterials: (m: RawMaterial[]) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  showNotification: (msg: string, type: 'success'|'error') => void;
  onRestockMaterial: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ lang, materials, setMaterials, products, setProducts, expenses, setExpenses, showNotification, onRestockMaterial }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  const [activeTab, setActiveTab] = useState<'raw' | 'finished'>('raw');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [restockItem, setRestockItem] = useState<RawMaterial | null>(null);
  
  const [formData, setFormData] = useState({ 
    nameAr: '', 
    nameFr: '', 
    quantity: 0, 
    maxQuantity: 0,
    unit: 'kg',
    unitPrice: 0,
    supplier: '' 
  });

  const [restockData, setRestockData] = useState({ quantity: 0, totalCost: 0 });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData({
        nameAr: item.nameAr,
        nameFr: item.nameFr,
        quantity: item.quantity,
        maxQuantity: item.maxQuantity || 0,
        unit: item.unit || 'kg',
        unitPrice: item.price || 0,
        supplier: item.supplier || ''
      });
    } else {
      setEditItem(null);
      setFormData({ 
          nameAr: '', nameFr: '', quantity: 0, maxQuantity: 100, unit: activeTab === 'raw' ? 'kg' : 'plate', unitPrice: 0, supplier: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenRestock = (item: RawMaterial) => {
      setRestockItem(item);
      setRestockData({ quantity: 0, totalCost: 0 });
      setIsRestockModalOpen(true);
  }

  // تحديث التكلفة الإجمالية تلقائياً بناءً على سعر الوحدة المخزن
  const handleRestockQtyChange = (val: number) => {
      const price = restockItem?.price || 0;
      setRestockData({ quantity: val, totalCost: val * price });
  }

  const handleRestockSubmit = () => {
    if (!restockItem || restockData.quantity <= 0) return;

    try {
      const newQuantity = restockItem.quantity + Number(restockData.quantity);
      
      // 1. تحديث المخزون محلياً
      setMaterials(materials.map(m => m.id === restockItem.id ? { ...m, quantity: newQuantity } : m));

      // 2. تسجيل المصروف في المالية محلياً
      const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'expense',
        category: 'RawMaterial',
        description: `${lang === Language.AR ? 'شراء/تجديد مخزون' : 'Achat/Réappro'}: ${restockItem.nameAr}`,
        amount: restockData.totalCost,
        date: new Date().toISOString().split('T')[0]
      };

      setExpenses(prev => [newExpense, ...prev]);
      onRestockMaterial(); 
      
      setIsRestockModalOpen(false);
      showNotification(t('success'), 'success');
    } catch (e) {
      showNotification(t('error'), 'error');
    }
  };

  const handleSave = () => {
    try {
        if (activeTab === 'raw') {
            const newItemData = {
                nameAr: formData.nameAr,
                nameFr: formData.nameFr,
                quantity: Number(formData.quantity),
                maxQuantity: Number(formData.maxQuantity),
                unit: formData.unit,
                price: Number(formData.unitPrice),
                supplier: formData.supplier,
                minLevel: 10,
                lastUpdated: new Date().toISOString().split('T')[0]
            };

            if (editItem) {
                setMaterials(materials.map(m => m.id === editItem.id ? { ...m, ...newItemData } : m));
            } else {
                const newMaterial: RawMaterial = {
                    id: Math.random().toString(36).substr(2, 9),
                    ...newItemData
                };
                setMaterials([...materials, newMaterial]);
                
                // إذا أضاف كمية أولية، نسجلها كمصروف فوراً
                if (Number(formData.quantity) > 0) {
                    setExpenses(prev => [{
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'expense',
                        category: 'RawMaterial',
                        description: `${lang === Language.AR ? 'رصيد أول المدة' : 'Stock Initial'}: ${formData.nameAr}`,
                        amount: Number(formData.quantity) * Number(formData.unitPrice),
                        date: new Date().toISOString().split('T')[0]
                    }, ...prev]);
                }
            }
        } else {
            const newItemData = {
                nameAr: formData.nameAr,
                nameFr: formData.nameFr,
                quantity: Number(formData.quantity),
                maxQuantity: Number(formData.maxQuantity),
                unit: formData.unit,
                price: Number(formData.unitPrice),
                minLevel: 10,
                lastUpdated: new Date().toISOString().split('T')[0]
            };
            if (editItem) {
                setProducts(products.map(p => p.id === editItem.id ? { ...p, ...newItemData } : p));
            } else {
                const newProduct: Product = {
                    id: Math.random().toString(36).substr(2, 9),
                    ...newItemData
                };
                setProducts([...products, newProduct]);
            }
        }
        onRestockMaterial(); 
        setIsModalOpen(false);
        showNotification(t('success'), 'success');
    } catch (e) {
        showNotification(t('error'), 'error');
    }
  };

  const handleDelete = (id: string) => {
      if(confirm(lang === Language.AR ? 'هل أنت متأكد؟' : 'Êtes-vous sûr ?')){
          try {
            if(activeTab === 'raw') setMaterials(materials.filter(m => m.id !== id));
            else setProducts(products.filter(p => p.id !== id));
            onRestockMaterial();
            showNotification(t('success'), 'success');
          } catch(e) {
             showNotification(t('error'), 'error'); 
          }
      }
  }

  const getStatus = (current: number, max: number) => {
      if(!max || max === 0) return { color: 'bg-gray-100 text-gray-800', label: t('unknown'), level: 'unknown' };
      const pct = (current / max) * 100;
      if(pct >= 85) return { color: 'bg-green-100 text-green-800', label: t('available'), level: 'high' };
      if(pct >= 55) return { color: 'bg-blue-100 text-blue-800', label: t('good'), level: 'med' };
      if(pct >= 25) return { color: 'bg-orange-100 text-orange-800', label: t('low'), level: 'low' };
      return { color: 'bg-red-100 text-red-800', label: t('critical'), level: 'critical' };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>{t('inventory')}</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm">
          <Plus size={18} /><span>{t('add')}</span>
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab('raw')} className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'raw' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
          {t('rawMaterials')}{activeTab === 'raw' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button onClick={() => setActiveTab('finished')} className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'finished' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
          {t('finishedGoods')}{activeTab === 'finished' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('name')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('quantity')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('status')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'raw' ? materials : products).map((item: any) => {
                const status = getStatus(item.quantity, item.maxQuantity);
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${status.level === 'critical' ? 'bg-red-50' : ''}`}>
                    <td className={`px-6 py-4 text-sm font-medium text-slate-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {lang === Language.AR ? item.nameAr : item.nameFr}
                        {status.level === 'critical' && <div className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10}/> {t('critical')}</div>}
                    </td>
                    <td className={`px-6 py-4 text-sm text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>{item.quantity} <span className="text-xs opacity-60">{item.unit}</span></td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                       {activeTab === 'raw' && (
                           <button onClick={() => handleOpenRestock(item)} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1.5 rounded-md hover:bg-green-100 transition-colors" title={t('purchaseMaterial')}>
                               <ShoppingCart size={14} /><span className="text-xs font-bold">{lang === Language.AR ? 'شراء' : 'Acheter'}</span>
                           </button>
                       )}
                       <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800 p-1.5"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة التجديد (شراء مواد خام) */}
      <Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title={t('purchaseMaterial')} isRTL={isRTL}>
          <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                  <p className="font-bold">{lang === Language.AR ? `تجديد: ${restockItem?.nameAr}` : `Restock: ${restockItem?.nameFr}`}</p>
                  <p className="opacity-80 text-xs">{lang === Language.AR ? 'سيتم إضافة الكمية للمخزون وتسجيل التكلفة في المصروفات.' : 'La quantité sera ajoutée et le coût sera enregistré.'}</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('addedQuantity')} ({restockItem?.unit})</label>
                  <input type="number" className="w-full border border-slate-300 rounded-md p-2" value={restockData.quantity} onChange={(e) => handleRestockQtyChange(Number(e.target.value))} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('totalCost')} (SAR)</label>
                  <input type="number" className="w-full border border-slate-300 rounded-md p-2" value={restockData.totalCost} onChange={(e) => setRestockData({...restockData, totalCost: Number(e.target.value)})} />
                  <p className="text-[10px] text-slate-500 mt-1">{lang === Language.AR ? '* محسوب بناءً على سعر الوحدة المسجل' : '* Calculé sur le prix unitaire enregistré'}</p>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                  <button onClick={() => setIsRestockModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">{t('cancel')}</button>
                  <button onClick={handleRestockSubmit} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-bold shadow-lg">{t('save')}</button>
              </div>
          </div>
      </Modal>

      {/* نافذة الإضافة/التعديل العامة */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? t('edit') : t('add')} isRTL={isRTL}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name (Arabic)</label>
            <input type="text" className="w-full border border-slate-300 rounded-md p-2" value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name (French)</label>
            <input type="text" className="w-full border border-slate-300 rounded-md p-2" value={formData.nameFr} onChange={(e) => setFormData({...formData, nameFr: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('quantity')}</label>
              <input type="number" className="w-full border border-slate-300 rounded-md p-2" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('maxQuantity')}</label>
              <input type="number" className="w-full border border-slate-300 rounded-md p-2" value={formData.maxQuantity} onChange={(e) => setFormData({...formData, maxQuantity: Number(e.target.value)})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('unit')}</label>
                <select className="w-full border border-slate-300 rounded-md p-2 bg-white" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value as any})}>
                    <option value="kg">KG</option><option value="l">Liters</option><option value="pcs">Pieces</option><option value="roll">Rolls</option><option value="plate">Plate</option><option value="carton">Carton</option>
                </select>
              </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{lang === Language.AR ? 'سعر الوحدة' : 'Prix Unitaire'}</label>
                <input type="number" step="0.01" className="w-full border border-slate-300 rounded-md p-2" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">{t('cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md">{t('save')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
