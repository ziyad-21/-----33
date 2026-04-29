
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { Language, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface CustomersProps {
  lang: Language;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  showNotification: (msg: string, type: 'success'|'error') => void;
}

const Customers: React.FC<CustomersProps> = ({ lang, customers, setCustomers, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const handleOpenModal = (item?: Customer) => {
    if (item) {
      setEditItem(item);
      setFormData({ name: item.name, phone: item.phone, email: item.email, address: item.address });
    } else {
      setEditItem(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    try {
        if (editItem) {
            setCustomers(customers.map(c => c.id === editItem.id ? { ...c, ...formData } : c));
        } else {
            const newCustomer: Customer = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData
            };
            setCustomers([...customers, newCustomer]);
        }
        setIsModalOpen(false);
        showNotification(t('success'), 'success');
    } catch (e) {
        showNotification(t('error'), 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === Language.AR ? 'هل أنت متأكد؟' : 'Êtes-vous sûr ?')) {
        setCustomers(customers.filter(c => c.id !== id));
        showNotification(t('success'), 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>{t('customers')}</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"><Plus size={18} /><span>{t('newCustomer')}</span></button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('name')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('phone')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className={`px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={16} /></div>
                    {customer.name}
                  </td>
                  <td className={`px-6 py-4 text-sm text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>{customer.phone}</td>
                  <td className={`px-6 py-4 text-sm flex items-center gap-3 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                     <button onClick={() => handleOpenModal(customer)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit2 size={18} /></button>
                     <button onClick={() => handleDelete(customer.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? t('edit') : t('newCustomer')} isRTL={isRTL}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
            <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
            <input type="text" className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
            <input type="email" className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('address')}</label>
            <textarea className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">{t('cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('save')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
