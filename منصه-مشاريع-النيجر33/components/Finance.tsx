
import React, { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, Plus, Filter } from 'lucide-react';
import { Language, Expense, Order } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface FinanceProps {
  lang: Language;
  expenses: Expense[];
  setExpenses: (e: Expense[]) => void;
  orders: Order[];
  showNotification: (msg: string, type: 'success'|'error') => void;
}

const Finance: React.FC<FinanceProps> = ({ lang, expenses, setExpenses, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Stats Logic
  const filteredList = expenses.filter(e => {
      const typeMatch = filterType === 'all' || e.type === filterType;
      const categoryMatch = filterCategory === 'all' || e.category === filterCategory;
      return typeMatch && categoryMatch;
  });

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Utility', customType: '' });

  const handleAddExpense = () => {
      try {
        const finalDescription = newExpense.category === 'Other' && newExpense.customType 
            ? `${newExpense.customType} - ${newExpense.description}` 
            : newExpense.description;

        const newExp: Expense = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            description: finalDescription,
            amount: Number(newExpense.amount),
            category: newExpense.category
        };

        setExpenses([newExp, ...expenses]);
        setIsModalOpen(false);
        setNewExpense({ description: '', amount: 0, category: 'Utility', customType: '' });
        showNotification(t('success'), 'success');
      } catch(e) {
          showNotification(t('error'), 'error');
      }
  }

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'Utility': return t('utility');
          case 'Maintenance': return t('maintenance');
          case 'RawMaterial': return t('rawMaterials');
          case 'Salary': return t('staff');
          case 'Sales': return t('totalSales');
          default: return t('other');
      }
  };

  const StatCard = ({ title, value, color, icon }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value.toLocaleString()} SAR</h3>
      </div>
      <div className={`p-3 rounded-full bg-slate-50`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
          {t('finance')}
        </h2>
        <div className="flex gap-2">
            <div className="flex bg-white border rounded-lg p-1">
                <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t('all')}</button>
                <button onClick={() => setFilterType('income')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'income' ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t('income')}</button>
                <button onClick={() => setFilterType('expense')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterType === 'expense' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{t('expenses')}</button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('addExpense')}</span>
            </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title={t('income')} 
            value={totalIncome} 
            color="text-green-600" 
            icon={<TrendingUp className="text-green-600" />} 
        />
        <StatCard 
            title={t('expenses')} 
            value={totalExpenses} 
            color="text-red-600" 
            icon={<TrendingDown className="text-red-600" />} 
        />
        <StatCard 
            title={t('netProfit')} 
            value={netProfit} 
            color={netProfit >= 0 ? "text-blue-600" : "text-red-600"} 
            icon={<DollarSign className="text-slate-600" />} 
        />
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16} /> {t('all')}
            </h3>
            <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs border-slate-300 rounded-md bg-white p-1.5"
            >
                <option value="all">{t('all')}</option>
                <option value="Utility">{t('utility')}</option>
                <option value="Maintenance">{t('maintenance')}</option>
                <option value="RawMaterial">{t('rawMaterials')}</option>
                <option value="Salary">{t('staff')}</option>
                <option value="Sales">{t('totalSales')}</option>
            </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('date')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('category')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('description')}</th>
                    <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredList.length > 0 ? filteredList.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                            <td className={`px-6 py-4 text-sm text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>{exp.date}</td>
                            <td className={`px-6 py-4 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                                    {getCategoryLabel(exp.category)}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-sm text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>{exp.description}</td>
                            <td className={`px-6 py-4 text-sm font-bold ${exp.type === 'income' ? 'text-green-600' : 'text-red-600'} ${isRTL ? 'text-right' : 'text-left'}`}>
                                {exp.type === 'income' ? '+' : '-'}{exp.amount.toLocaleString()} SAR
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                {isRTL ? 'لا توجد عمليات مسجلة حالياً' : 'Aucune transaction enregistrée'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

       <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('addExpense')}
        isRTL={isRTL}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
            <select
                className="w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            >
                <option value="Utility">{t('utility')}</option>
                <option value="Maintenance">{t('maintenance')}</option>
                <option value="RawMaterial">{t('rawMaterials')}</option>
                <option value="Salary">{t('staff')}</option>
                <option value="Other">{t('other')}</option>
            </select>
          </div>
          
          {newExpense.category === 'Other' && (
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('specifyOther')}</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2"
                    value={newExpense.customType}
                    onChange={(e) => setNewExpense({...newExpense, customType: e.target.value})}
                    placeholder="e.g. Office Supplies"
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
            <input 
               type="text" 
               className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2"
               value={newExpense.description}
               onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            />
          </div>
          
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('amount')}</label>
            <input 
               type="number" 
               className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2"
               value={newExpense.amount}
               onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
              {t('cancel')}
            </button>
            <button onClick={handleAddExpense} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t('save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Finance;
