
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Wallet, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Calculator,
  ArrowRightLeft,
  Banknote,
  PieChart,
  UserPlus,
  CheckCircle2,
  ArrowDownCircle,
  Percent
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

// واجهات البيانات الخاصة بالتقدم
interface TaqaddumTransaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  category: 'bank' | 'cash' | 'loan'; 
  amount: number;
  notes?: string;
  beneficiary?: string; 
}

interface TaqaddumShareholder {
  id: string;
  name: string;
  capital: number;
  shares: number; // سيتم حسابه تلقائياً
  months: number;
  operatorPercent: number; 
  mediatorPercent: number; 
  shareholderPercent: number; 
  // profitRatio removed from calculation logic, now derived from global profit
}

interface ProfitPayment {
  id: string;
  shareholderId: string;
  shareholderName: string;
  amount: number;
  date: string;
  notes?: string;
}

interface LoanRecord {
  id: string;
  name: string;
  amount: number;
  date: string;
  notes: string;
  isPaid: boolean;
}

interface AlTaqaddumProps {
  lang: Language;
  onLogout: () => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const AlTaqaddum: React.FC<AlTaqaddumProps> = ({ lang, onLogout, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  // =========================================
  // الحالة (State)
  // =========================================
  const [activeTab, setActiveTab] = useState<'accounting' | 'shareholders'>('accounting');
  
  // حالة صافي الربح العام للمشروع (الديناميكي)
  const [globalNetProfit, setGlobalNetProfit] = useState<number>(5117568);

  // بيانات المحاسبة
  const [transactions, setTransactions] = useState<TaqaddumTransaction[]>([
    { id: 't1', date: '2022-01-01', description: 'رصيد الافتتاح للعام', type: 'income', category: 'bank', amount: 2133114, notes: 'رصيد مرحل' },
    { id: 't2', date: '2022-01-01', description: 'رصيد الافتتاح نقدي', type: 'income', category: 'cash', amount: 350000, notes: 'رصيد مرحل' },
    { id: 't3', date: '2022-01-01', description: 'سحب من البنك شراء 500 بيض + رواتب', type: 'expense', category: 'bank', amount: 275000, notes: 'مصاريف المزرعة' },
  ]);

  // بيانات السلف
  const [loans, setLoans] = useState<LoanRecord[]>([
    { id: 'l1', name: 'أحمد العماري', amount: 3000, date: '2022-01-05', notes: 'سلفة لشركة التقدم', isPaid: false },
    { id: 'l2', name: 'علي حسين', amount: 8000, date: '2022-01-10', notes: 'سلفة لشركة التقدم', isPaid: false },
    { id: 'l3', name: 'علي حسين', amount: 4000, date: '2022-01-15', notes: 'سلفة إضافية', isPaid: false },
    { id: 'l4', name: 'سليمان', amount: 9515424, date: '2022-01-01', notes: 'سلفة لسليمان على الشركة (فارق حسابات)', isPaid: false },
  ]);

  // بيانات المساهمين
  const [shareholders, setShareholders] = useState<TaqaddumShareholder[]>([
    { id: 'sh1', name: 'إبراهيم يحيى إبراهيم أبو بكر', capital: 3300, shares: 3.3, months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 },
    { id: 'sh2', name: 'أحمد إبراهيم أبو بكر عبد الله', capital: 15150, shares: 15.15, months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 },
    { id: 'sh3', name: 'أحمد محمد جبران العماري', capital: 54583, shares: 54.58, months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 },
    { id: 'sh4', name: 'إدريس إبراهيم أبو بكر عبد الله', capital: 6600, shares: 6.6, months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 },
  ]);

  // دفعات الأرباح
  const [profitPayments, setProfitPayments] = useState<ProfitPayment[]>([]);

  // المودالات
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isShModalOpen, setIsShModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // النماذج (Forms)
  const [txForm, setTxForm] = useState<Partial<TaqaddumTransaction>>({ date: new Date().toISOString().split('T')[0], type: 'income', category: 'bank', amount: 0, description: '' });
  const [shForm, setShForm] = useState<Partial<TaqaddumShareholder>>({ months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 });
  const [loanForm, setLoanForm] = useState<Partial<LoanRecord>>({ date: new Date().toISOString().split('T')[0], isPaid: false });
  const [paymentForm, setPaymentForm] = useState<Partial<ProfitPayment>>({ date: new Date().toISOString().split('T')[0], amount: 0 });

  // =========================================
  // الحسابات (Calculations)
  // =========================================
  const stats = useMemo(() => {
    const bankIncome = transactions.filter(t => t.category === 'bank' && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const bankExpense = transactions.filter(t => t.category === 'bank' && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const cashIncome = transactions.filter(t => t.category === 'cash' && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const cashExpense = transactions.filter(t => t.category === 'cash' && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const totalLoans = loans.filter(l => !l.isPaid).reduce((s, l) => s + l.amount, 0);

    return {
      bankBalance: bankIncome - bankExpense,
      cashBalance: cashIncome - cashExpense,
      totalIncome: bankIncome + cashIncome,
      totalExpense: bankExpense + cashExpense,
      totalLoans
    };
  }, [transactions, loans]);

  // =========================================================
  // CORE CALCULATION LOGIC: DYNAMIC GLOBAL PROFIT DISTRIBUTION
  // =========================================================
  const shareholderStats = useMemo(() => {
      let totalCapital = 0;
      let totalShares = 0;
      let grandTotalWeightedCapital = 0; // Total Adjusted Capital (Capital * Months/12)
      let totalTransferred = profitPayments.reduce((acc, curr) => acc + curr.amount, 0);

      // Step 1: Calculate Grand Totals
      shareholders.forEach(sh => {
          totalCapital += sh.capital;
          totalShares += (sh.capital / 1000);
          grandTotalWeightedCapital += sh.capital * (sh.months / 12);
      });

      // We will calculate individual profits inside the render loop or a new mapped array,
      // but here we just need the aggregates for the summary boxes.
      // However, to get "Total Net Shareholder Profit", we need to sum the distributed amounts.
      
      let totalDistributedShareholderProfit = 0;

      shareholders.forEach(sh => {
          const userWeightedCapital = sh.capital * (sh.months / 12);
          
          // Formula: (UserWeighted / GrandTotalWeighted) * GlobalProfit
          const grossProfit = grandTotalWeightedCapital > 0 
              ? (userWeightedCapital / grandTotalWeightedCapital) * globalNetProfit 
              : 0;
          
          const shareholderProfit = grossProfit * (sh.shareholderPercent / 100);
          totalDistributedShareholderProfit += shareholderProfit;
      });

      return {
          totalCapital,
          totalShares,
          grandTotalWeightedCapital,
          totalDistributedShareholderProfit,
          totalTransferred
      };
  }, [shareholders, profitPayments, globalNetProfit]);

  // =========================================
  // الدوال (Handlers)
  // =========================================
  
  const handleSaveTx = () => {
    if (!txForm.amount || !txForm.description) return;
    const newTx: TaqaddumTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      ...txForm as TaqaddumTransaction
    };
    setTransactions([newTx, ...transactions]);
    setIsTxModalOpen(false);
    setTxForm({ date: new Date().toISOString().split('T')[0], type: 'income', category: 'bank', amount: 0, description: '' });
    showNotification(t('success'), 'success');
  };

  const handleSaveShareholder = () => {
    if (!shForm.name || !shForm.capital) return;
    
    // حساب عدد الأسهم تلقائياً عند الحفظ
    const calculatedShares = shForm.capital / 1000;

    const newSh: TaqaddumShareholder = {
      id: shForm.id || Math.random().toString(36).substr(2, 9),
      ...shForm as TaqaddumShareholder,
      shares: calculatedShares
    };
    
    if (shForm.id) {
        setShareholders(shareholders.map(s => s.id === shForm.id ? newSh : s));
    } else {
        setShareholders([...shareholders, newSh]);
    }
    setIsShModalOpen(false);
    setShForm({ months: 12, operatorPercent: 0, mediatorPercent: 0, shareholderPercent: 100 });
    showNotification(t('success'), 'success');
  };

  const handleSaveLoan = () => {
      if (!loanForm.name || !loanForm.amount) return;
      const newLoan: LoanRecord = {
          id: Math.random().toString(36).substr(2, 9),
          ...loanForm as LoanRecord
      };
      setLoans([...loans, newLoan]);
      setIsLoanModalOpen(false);
      setLoanForm({ date: new Date().toISOString().split('T')[0], isPaid: false });
      showNotification(t('success'), 'success');
  };

  const handleSavePayment = () => {
      if(!paymentForm.shareholderId || !paymentForm.amount) return;
      
      const shareholder = shareholders.find(s => s.id === paymentForm.shareholderId);
      const newPayment: ProfitPayment = {
          id: Math.random().toString(36).substr(2, 9),
          shareholderId: paymentForm.shareholderId,
          shareholderName: shareholder?.name || 'Unknown',
          amount: Number(paymentForm.amount),
          date: paymentForm.date || new Date().toISOString().split('T')[0],
          notes: paymentForm.notes
      };
      
      setProfitPayments([...profitPayments, newPayment]);
      setIsPaymentModalOpen(false);
      setPaymentForm({ date: new Date().toISOString().split('T')[0], amount: 0 });
      showNotification(t('success'), 'success');
  };

  const deleteItem = (type: 'tx' | 'sh' | 'loan' | 'pay', id: string) => {
      if (!confirm('تأكيد الحذف؟')) return;
      if (type === 'tx') setTransactions(transactions.filter(t => t.id !== id));
      if (type === 'sh') setShareholders(shareholders.filter(s => s.id !== id));
      if (type === 'loan') setLoans(loans.filter(l => l.id !== id));
      if (type === 'pay') setProfitPayments(profitPayments.filter(p => p.id !== id));
      showNotification(t('success'), 'success');
  };

  // المكونات الفرعية للتصميم
  const StatBox = ({ title, val, color, icon: Icon, subTitle }: any) => (
      <div className={`p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-full bg-slate-900 shadow-xl relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
              <Icon size={64} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">{title}</p>
          <p className={`text-2xl font-black mt-2 font-Arial bold z-10 ${color.replace('bg-', 'text-')}`} dir="ltr">
              {val.toLocaleString('en-US')} <span className="text-[10px] text-slate-500">SAR</span>
          </p>
          {subTitle && <p className="text-[9px] text-slate-500 font-bold mt-1 z-10">{subTitle}</p>}
      </div>
  );

  return (
    <div className={`min-h-screen bg-[#02040a] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* الترويسة */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                     <Building2 size={30} />
                 </div>
                 <div>
                     <h1 className="text-2xl font-black tracking-tight text-white">{isRTL ? 'شركة التقدم' : 'Al-Taqaddum Co.'}</h1>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">نظام المحاسبة وإدارة المساهمين</p>
                 </div>
             </div>
             <button onClick={onLogout} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black text-slate-300 transition-all border border-white/5">
                 {t('backToHub')}
             </button>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-fade-in-up">
        
        {/* التبويبات */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
            <button 
            onClick={() => setActiveTab('accounting')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'accounting' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <Calculator size={16} /> {isRTL ? 'البرنامج المحاسبي' : 'Accounting'}
            </button>
            <button 
            onClick={() => setActiveTab('shareholders')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'shareholders' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <Users size={16} /> {isRTL ? 'مساهمو التقدم' : 'Shareholders'}
            </button>
        </div>

        {/* محتوى البرنامج المحاسبي */}
        {activeTab === 'accounting' && (
            <div className="space-y-8">
                {/* الإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title={isRTL ? 'رصيد البنك' : 'Bank Balance'} val={stats.bankBalance} color="text-blue-500" icon={Landmark} />
                    <StatBox title={isRTL ? 'رصيد الصندوق' : 'Cash Balance'} val={stats.cashBalance} color="text-emerald-500" icon={Wallet} />
                    <StatBox title={isRTL ? 'إجمالي المصروفات' : 'Total Expenses'} val={stats.totalExpense} color="text-rose-500" icon={TrendingDown} />
                    <StatBox title={isRTL ? 'إجمالي السلف والديون' : 'Total Loans'} val={stats.totalLoans} color="text-amber-500" icon={ArrowRightLeft} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* جدول العمليات */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-black text-white">{isRTL ? 'سجل العمليات اليومية' : 'Transactions Log'}</h3>
                            <button onClick={() => setIsTxModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                <Plus size={16} /> {isRTL ? 'عملية جديدة' : 'New Transaction'}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-5">{t('date')}</th>
                                        <th className="px-6 py-5">{isRTL ? 'البيان' : 'Description'}</th>
                                        <th className="px-6 py-5 text-center">{isRTL ? 'التصنيف' : 'Type'}</th>
                                        <th className="px-6 py-5">{isRTL ? 'وارد (دخل)' : 'Credit'}</th>
                                        <th className="px-6 py-5">{isRTL ? 'منصرف' : 'Debit'}</th>
                                        <th className="px-6 py-5 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-Arial bold">
                                    {transactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5 text-slate-500">{tx.date}</td>
                                            <td className="px-6 py-5 font-bold text-white font-sans">{tx.description} <span className="text-[10px] text-slate-500 block font-normal">{tx.notes}</span></td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tx.category === 'bank' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-emerald-400 font-black">{tx.type === 'income' ? tx.amount.toLocaleString('en-US') : '-'}</td>
                                            <td className="px-6 py-5 text-rose-400 font-black">{tx.type === 'expense' ? tx.amount.toLocaleString('en-US') : '-'}</td>
                                            <td className="px-6 py-5 text-center">
                                                <button onClick={() => deleteItem('tx', tx.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* قائمة السلف */}
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl h-fit">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-amber-900/10">
                            <h3 className="text-lg font-black text-amber-500">{isRTL ? 'السلف والديون' : 'Loans'}</h3>
                            <button onClick={() => setIsLoanModalOpen(true)} className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"><Plus size={16}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-start group">
                                    <div>
                                        <p className="font-black text-white">{loan.name}</p>
                                        <p className="text-[10px] text-slate-500">{loan.notes}</p>
                                        <p className="text-[10px] text-slate-600 mt-1 font-Arial bold">{loan.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-amber-500 font-Arial bold">{loan.amount.toLocaleString('en-US')}</p>
                                        <button onClick={() => deleteItem('loan', loan.id)} className="text-slate-600 hover:text-rose-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* محتوى المساهمين */}
        {activeTab === 'shareholders' && (
            <div className="space-y-12">
                 
                 {/* قسم إدخال صافي الربح العام (المحرك الديناميكي) */}
                 <div className="bg-[#111] p-8 rounded-[2.5rem] border border-amber-500/20 shadow-2xl shadow-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-500 text-amber-950 rounded-2xl flex items-center justify-center shadow-lg">
                            <TrendingUp size={36} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">{isRTL ? 'صافي أرباح المشروع' : 'Total Project Net Profit'}</h2>
                            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{isRTL ? 'أدخل المبلغ لتوزيعه تلقائياً على المساهمين' : 'Enter amount to auto-distribute'}</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full md:max-w-md">
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={globalNetProfit} 
                                onChange={(e) => setGlobalNetProfit(Number(e.target.value))} 
                                className="w-full bg-[#000] border-2 border-amber-500/30 text-amber-400 p-6 rounded-2xl text-4xl font-Arial bold text-center outline-none focus:border-amber-500 focus:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all"
                                dir="ltr"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm pointer-events-none">SAR</div>
                        </div>
                    </div>
                 </div>

                 {/* قسم الجدول */}
                 <div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-xl font-black text-white">{isRTL ? 'جدول توزيع الأرباح' : 'Distribution Table'}</h2>
                            <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{isRTL ? 'يعتمد على: رأس المال × مدة التشغيل' : 'Based on: Capital × Duration'}</p>
                        </div>
                        <button onClick={() => { setShForm({}); setIsShModalOpen(true); }} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-500/20">
                            <UserPlus size={18} /> {isRTL ? 'إضافة مساهم' : 'Add Shareholder'}
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center text-xs">
                                <thead className="bg-[#111] text-slate-400 font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-6" rowSpan={2}>#</th>
                                        <th className="px-4 py-6 text-right" rowSpan={2}>{isRTL ? 'اسم المساهم' : 'Name'}</th>
                                        <th className="px-4 py-6" colSpan={3}>{isRTL ? 'بيانات المساهمة' : 'Details'}</th>
                                        <th className="px-4 py-6 text-blue-400" colSpan={1}>{isRTL ? 'معدل التشغيل' : 'Operational'}</th>
                                        <th className="px-4 py-6 text-emerald-400" colSpan={3}>{isRTL ? 'توزيع النسب' : 'Percentages'}</th>
                                        <th className="px-4 py-6 text-amber-400" colSpan={3}>{isRTL ? 'توزيع الأرباح' : 'Profit Split'}</th>
                                        <th className="px-4 py-6" rowSpan={2}></th>
                                    </tr>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-2 py-3 text-white">المال</th>
                                        <th className="px-2 py-3 text-white">الأسهم</th>
                                        <th className="px-2 py-3 text-white">الشهور</th>
                                        <th className="px-2 py-3 text-blue-300">المبلغ المعدل</th>
                                        <th className="px-2 py-3 text-emerald-300">مشغل %</th>
                                        <th className="px-2 py-3 text-emerald-300">وسيط %</th>
                                        <th className="px-2 py-3 text-emerald-300">مساهم %</th>
                                        <th className="px-2 py-3 text-amber-300">للمشغل</th>
                                        <th className="px-2 py-3 text-amber-300">للوسيط</th>
                                        <th className="px-2 py-3 text-amber-300 font-black border-x border-white/10">ربح المساهم</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-Arial bold">
                                    {shareholders.map((sh, idx) => {
                                        // ==========================================
                                        // Dynamic Row Calculation
                                        // ==========================================
                                        const calculatedShares = sh.capital / 1000;
                                        const userAdjustedCapital = sh.capital * (sh.months / 12);
                                        
                                        // Calculate Share of Global Profit based on Weighted Capital
                                        // Formula: (UserAdjusted / GrandTotalAdjusted) * GlobalProfit
                                        const profitShareFraction = shareholderStats.grandTotalWeightedCapital > 0 
                                            ? (userAdjustedCapital / shareholderStats.grandTotalWeightedCapital) 
                                            : 0;
                                        
                                        const userGrossProfit = profitShareFraction * globalNetProfit;
                                        
                                        // Distribute User Gross Profit
                                        const operatorProfit = userGrossProfit * (sh.operatorPercent / 100);
                                        const mediatorProfit = userGrossProfit * (sh.mediatorPercent / 100);
                                        const shareholderProfit = userGrossProfit * (sh.shareholderPercent / 100);

                                        return (
                                            <tr key={sh.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-5 text-slate-600">{idx + 1}</td>
                                                <td className="px-4 py-5 text-right font-black text-white font-sans">{sh.name}</td>
                                                <td className="px-4 py-5 font-bold text-slate-300">{sh.capital.toLocaleString('en-US')}</td>
                                                <td className="px-4 py-5">{calculatedShares.toLocaleString('en-US', {maximumFractionDigits: 2})}</td>
                                                <td className="px-4 py-5">{sh.months}</td>
                                                <td className="px-4 py-5 font-bold text-blue-400 bg-blue-500/5">{userAdjustedCapital.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                                <td className="px-4 py-5 text-emerald-600">{sh.operatorPercent}%</td>
                                                <td className="px-4 py-5 text-emerald-600">{sh.mediatorPercent}%</td>
                                                <td className="px-4 py-5 text-emerald-400 font-bold">{sh.shareholderPercent}%</td>
                                                <td className="px-4 py-5 text-amber-600/70">{operatorProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                                <td className="px-4 py-5 text-amber-600/70">{mediatorProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                                <td className="px-4 py-5 font-black text-amber-400 text-lg bg-amber-500/10 border-x border-white/5">
                                                    {shareholderProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => { setShForm(sh); setIsShModalOpen(true); }} className="text-blue-500 hover:text-white"><Edit size={14} /></button>
                                                        <button onClick={() => deleteItem('sh', sh.id)} className="text-rose-500 hover:text-rose-400"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </div>

                 {/* مربعات الإجماليات (Totals Section) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title="إجمالي مبالغ المساهمين" val={shareholderStats.totalCapital} color="text-slate-400" icon={Wallet} />
                    <StatBox title="إجمالي عدد الأسهم" val={shareholderStats.totalShares} color="text-blue-400" icon={PieChart} subTitle="(Capital / 1000)" />
                    <StatBox title="إجمالي المبلغ (شهور التشغيل)" val={shareholderStats.grandTotalWeightedCapital} color="text-indigo-400" icon={TrendingUp} />
                    <StatBox title="إجمالي ربح المساهمين (الصافي)" val={shareholderStats.totalDistributedShareholderProfit} color="text-amber-400" icon={Banknote} subTitle="Distributed" />
                 </div>

                 {/* قسم تحويل الأرباح (Profit Transfers) */}
                 <div className="bg-[#0a0c14] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative mt-12">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-r from-emerald-900/20 to-transparent flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-emerald-500">{isRTL ? 'تحويلات الأرباح والدفعات' : 'Profit Transfers'}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Settle Shareholder Profits</p>
                        </div>
                        <button onClick={() => setIsPaymentModalOpen(true)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                            <Plus size={16} /> {isRTL ? 'تسجيل دفعة جديدة' : 'New Payment'}
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto p-6">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">التاريخ</th>
                                    <th className="px-6 py-4">المستفيد (المساهم)</th>
                                    <th className="px-6 py-4">المبلغ المحول</th>
                                    <th className="px-6 py-4">ملاحظات</th>
                                    <th className="px-6 py-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-Arial bold">
                                {profitPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-emerald-500/5 transition-colors">
                                        <td className="px-6 py-4 text-slate-400">{payment.date}</td>
                                        <td className="px-6 py-4 font-black text-white font-sans">{payment.shareholderName}</td>
                                        <td className="px-6 py-4 font-black text-emerald-400 text-base">{payment.amount.toLocaleString('en-US')} <small className="text-[10px] text-slate-500">SAR</small></td>
                                        <td className="px-6 py-4 text-slate-500 font-sans">{payment.notes || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => deleteItem('pay', payment.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {profitPayments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-600 font-sans">
                                            لا توجد دفعات مسجلة حتى الآن.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-emerald-900/10 border-t border-emerald-500/20">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-right font-black text-emerald-500 uppercase tracking-widest">إجمالي ما تم تحويله</td>
                                    <td className="px-6 py-4 font-black text-xl text-white font-Arial bold">{shareholderStats.totalTransferred.toLocaleString('en-US')} <small className="text-xs text-slate-500">SAR</small></td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                 </div>
            </div>
        )}

      </main>

      {/* مودال العمليات المحاسبية */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={isRTL ? 'إضافة عملية جديدة' : 'New Transaction'} isRTL={isRTL} contentClassName="bg-slate-900 text-white border border-white/10">
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">نوع العملية</label>
                <div className="flex gap-2">
                    <button onClick={() => setTxForm({...txForm, type: 'income'})} className={`flex-1 py-3 rounded-xl font-bold text-xs ${txForm.type === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>وارد (دخل)</button>
                    <button onClick={() => setTxForm({...txForm, type: 'expense'})} className={`flex-1 py-3 rounded-xl font-bold text-xs ${txForm.type === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>منصرف (خرج)</button>
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">التصنيف</label>
                <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value as any})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold">
                    <option value="bank">البنك (Bank)</option>
                    <option value="cash">الصندوق (Cash)</option>
                </select>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">المبلغ</label>
                <input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center text-lg focus:border-indigo-500" dir="ltr" />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">البيان</label>
                <input type="text" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
            <button onClick={handleSaveTx} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black mt-2">حفظ العملية</button>
        </div>
      </Modal>

      {/* مودال المساهمين (Refactored: Removed Profit Ratio) */}
      <Modal isOpen={isShModalOpen} onClose={() => setIsShModalOpen(false)} title={isRTL ? 'بيانات المساهم' : 'Shareholder Data'} isRTL={isRTL} contentClassName="bg-slate-900 text-white border border-white/10">
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">اسم المساهم</label>
                <input type="text" value={shForm.name} onChange={e => setShForm({...shForm, name: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">رأس المال</label>
                    <input type="number" value={shForm.capital} onChange={e => setShForm({...shForm, capital: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center" dir="ltr" />
                    <p className="text-[10px] text-slate-500 mt-1 text-center font-bold">سيتم احتساب عدد الأسهم تلقائياً (رأس المال / 1000)</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">مدة التشغيل (شهر)</label>
                    <input type="number" value={shForm.months} onChange={e => setShForm({...shForm, months: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center" dir="ltr" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                 <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">المساهم %</label>
                    <input type="number" value={shForm.shareholderPercent} onChange={e => setShForm({...shForm, shareholderPercent: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-2 rounded-xl outline-none font-Arial bold text-center text-xs" dir="ltr" />
                </div>
                 <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">المشغل %</label>
                    <input type="number" value={shForm.operatorPercent} onChange={e => setShForm({...shForm, operatorPercent: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-2 rounded-xl outline-none font-Arial bold text-center text-xs" dir="ltr" />
                </div>
                 <div>
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">الوسيط %</label>
                    <input type="number" value={shForm.mediatorPercent} onChange={e => setShForm({...shForm, mediatorPercent: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-2 rounded-xl outline-none font-Arial bold text-center text-xs" dir="ltr" />
                </div>
            </div>
            <button onClick={handleSaveShareholder} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black mt-2">حفظ البيانات</button>
        </div>
      </Modal>

      {/* مودال السلف */}
      <Modal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} title={isRTL ? 'إضافة سلفة' : 'Add Loan'} isRTL={isRTL} contentClassName="bg-slate-900 text-white border border-white/10">
          <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">اسم الدائن</label>
                <input type="text" value={loanForm.name} onChange={e => setLoanForm({...loanForm, name: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">المبلغ</label>
                <input type="number" value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center" dir="ltr" />
            </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">ملاحظات</label>
                <input type="text" value={loanForm.notes} onChange={e => setLoanForm({...loanForm, notes: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
            <button onClick={handleSaveLoan} className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black mt-2">حفظ السلفة</button>
          </div>
      </Modal>

      {/* مودال تسجيل دفعة أرباح */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={isRTL ? 'تسجيل دفعة أرباح' : 'Record Profit Payment'} isRTL={isRTL} contentClassName="bg-slate-900 text-white border border-white/10">
          <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">المستفيد (المساهم)</label>
                <select value={paymentForm.shareholderId} onChange={e => setPaymentForm({...paymentForm, shareholderId: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold">
                    <option value="">-- اختر المساهم --</option>
                    {shareholders.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">المبلغ</label>
                <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center" dir="ltr" />
            </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">التاريخ</label>
                <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-Arial bold text-center" dir="ltr" />
            </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">ملاحظات</label>
                <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
            <button onClick={handleSavePayment} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black mt-2">تأكيد الدفع</button>
          </div>
      </Modal>

    </div>
  );
};

export default AlTaqaddum;
