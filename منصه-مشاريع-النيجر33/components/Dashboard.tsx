
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Wallet, Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Language, Order, Staff, Expense, RawMaterial, Product } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface DashboardProps {
  lang: Language;
  setCurrentView: (view: string) => void;
  orders?: Order[];
  staff?: Staff[];
  expenses?: Expense[];
  materials?: RawMaterial[];
  products?: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ lang, setCurrentView, orders = [], expenses = [], materials = [], products = [] }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // --- Calculations for Real Data ---

  // 1. Finance Card Data
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // 2. Chart Data: Daily Performance (Last 7 Days)
  const dailyData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Sum income/expenses for this day
        const dayIncome = expenses
            .filter(e => e.type === 'income' && e.date === dateStr)
            .reduce((sum, e) => sum + e.amount, 0);
            
        const dayExpense = expenses
            .filter(e => e.type === 'expense' && e.date === dateStr)
            .reduce((sum, e) => sum + e.amount, 0);

        const dayName = d.toLocaleDateString(lang === Language.AR ? 'ar-SA' : 'fr-FR', { weekday: 'short' });
        
        data.push({
            name: dayName,
            income: dayIncome,
            expense: dayExpense
        });
    }
    return data;
  }, [expenses, lang]);

  // 3. Chart Data: Monthly Overview
  const monthlyData = useMemo(() => {
      const data: {[key: string]: {name: string, income: number, expense: number}} = {};
      
      expenses.forEach(e => {
          const d = new Date(e.date);
          const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
          const monthName = d.toLocaleDateString(lang === Language.AR ? 'ar-SA' : 'fr-FR', { month: 'short' });
          
          if (!data[monthKey]) {
              data[monthKey] = { name: monthName, income: 0, expense: 0 };
          }
          
          if (e.type === 'income') data[monthKey].income += e.amount;
          else data[monthKey].expense += e.amount;
      });
      
      return Object.values(data);
  }, [expenses, lang]);


  const StatCard = ({ title, value, icon, color, subtext, onClick, customContent }: any) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div>
        <p className={`text-sm text-slate-500 mb-1 ${isRTL ? 'font-cairo' : 'font-sans'}`}>{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {customContent ? customContent : (
             <p className={`text-xs mt-2 ${color.text} flex items-center gap-1`}>
                {subtext}
             </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color.bg} ${color.iconText}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
          {t('dashboard')}
        </h2>
        <button 
          onClick={() => setIsCalendarOpen(true)}
          className="text-sm text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-600 px-3 py-1 rounded-full border shadow-sm flex items-center gap-2 transition-colors"
        >
          <CalendarIcon size={16} />
          {new Date().toLocaleDateString(lang === Language.AR ? 'ar-SA' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalProduction')} 
          value="24,500" 
          icon={<Package />} 
          color={{ bg: 'bg-blue-50', iconText: 'text-blue-600', text: 'text-green-600' }}
          subtext="+12% vs last week"
          onClick={() => setCurrentView('production')}
        />
        <StatCard 
          title={t('totalSales')} 
          value={`${totalIncome} SAR`} 
          icon={<TrendingUp />} 
          color={{ bg: 'bg-green-50', iconText: 'text-green-600', text: 'text-green-600' }}
          subtext="Total Revenue"
          onClick={() => setCurrentView('orders')}
        />
        <StatCard 
          title={t('lowStock')} 
          value="2 Items" 
          icon={<AlertTriangle />} 
          color={{ bg: 'bg-amber-50', iconText: 'text-amber-600', text: 'text-red-600' }}
          subtext="Urgent action required"
          onClick={() => setCurrentView('inventory')}
        />
        
        {/* OPTIMISTIC FINANCE CARD */}
        <StatCard 
          title={t('netProfit')} 
          value={`${netProfit} SAR`} 
          icon={<Wallet />} 
          color={{ bg: 'bg-purple-50', iconText: 'text-purple-600', text: 'text-slate-500' }}
          onClick={() => setCurrentView('finance')}
          customContent={
              <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUpCircle size={14} />
                      <span>+{totalIncome}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">
                      <ArrowDownCircle size={14} />
                      <span>-{totalExpenses}</span>
                  </div>
              </div>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Daily Performance (Income vs Expense) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className={`text-lg font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
            {t('dailyPerformance')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name={t('income')} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name={t('expenses')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Monthly Overview (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className={`text-lg font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
            {t('monthlyOverview')}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('income')} />
                <Bar dataKey="expense" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('expenses')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      <Modal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        title={t('calendarEvents')}
        isRTL={isRTL}
      >
        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-2 border-b pb-2 border-slate-200">{t('salaryDate')}</h4>
                <ul className="space-y-2">
                    <li className="flex justify-between text-sm">
                        <span>Upcoming Salary Cycle</span>
                        <span className="font-bold text-blue-600">30th of Month</span>
                    </li>
                </ul>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-800 mb-2 border-b pb-2 border-slate-200">{t('orders')}</h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {orders.slice(0, 5).map(o => (
                        <li key={o.id} className="flex justify-between text-sm items-center">
                            <span>#{o.id} - {o.customerName}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-slate-700">{o.date}</span>
                        </li>
                    ))}
                    {orders.length === 0 && <li className="text-sm text-slate-400">No upcoming orders</li>}
                </ul>
            </div>
            <div className="text-center pt-2">
                <button 
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-blue-600 hover:underline text-sm"
                >
                    {t('cancel')}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
