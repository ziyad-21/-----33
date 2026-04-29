
import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Plus, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutDashboard,
  Calculator,
  Info,
  Trash2,
  UserPlus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import { Language, GoldTransaction, Shareholder, CapitalTransaction } from '../types';
import { TRANSLATIONS, MOCK_CAPITAL_TRANSACTIONS } from '../constants';
import Modal from './Modal';

interface MakhGoldProps {
  lang: Language;
  onLogout: () => void;
  goldTransactions: GoldTransaction[];
  setGoldTransactions: (t: GoldTransaction[]) => void;
  shareholders: Shareholder[];
  setShareholders: (s: Shareholder[]) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const MakhGold: React.FC<MakhGoldProps> = ({ 
  lang, onLogout, goldTransactions, setGoldTransactions, shareholders, setShareholders, showNotification 
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  
  // =========================================
  // حالة البيانات (State)
  // =========================================
  const [activeTab, setActiveTab] = useState<'dashboard' | 'program' | 'shares'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareholderModalOpen, setIsShareholderModalOpen] = useState(false); // مودال المساهمين
  
  // بيانات محاكاة للسوق المباشر
  const [goldPrice, setGoldPrice] = useState(245.50);
  const [priceHistory, setPriceHistory] = useState<{time: string, price: number}[]>([]);
  
  // بيانات رأس المال
  const [capitalTransactions] = useState<CapitalTransaction[]>(() => {
    const saved = localStorage.getItem('np_capital_tx');
    return saved ? JSON.parse(saved) : MOCK_CAPITAL_TRANSACTIONS;
  });

  // محاكاة تحديث السعر
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.5;
      setGoldPrice(prev => {
        const newPrice = Number((prev + change).toFixed(2));
        setPriceHistory(hist => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'});
            
            const newHist = [...hist, { time: timeStr, price: newPrice }];
            if (newHist.length > 20) newHist.shift();
            return newHist;
        });
        return newPrice;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // نموذج العملية الجديدة (الذهب) - القيم فارغة (undefined/null) بدلاً من 0
  const [txForm, setTxForm] = useState<Partial<GoldTransaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amountRiyal: undefined,
    goldWeight: undefined,
    karat: undefined,
    exchangeRate: undefined,
    type: 'purchase'
  });

  // نموذج المساهم الجديد
  const [shareholderForm, setShareholderForm] = useState({
    name: '',
    phone: '',
    capitalAmount: '',
    numberOfShares: ''
  });

  // حساب الكارة - قيمة فارغة مبدئياً
  const [karahValue, setKarahValue] = useState<number | string>('');
  const [exchangeRateXOF, setExchangeRateXOF] = useState<number>(160);

  // حساب المبلغ تلقائياً بناءً على الوزن والكارة
  useEffect(() => {
    const weight = Number(txForm.goldWeight);
    const karah = Number(karahValue);
    if(weight > 0 && karah > 0) {
        const total = weight * karah;
        setTxForm(prev => ({...prev, amountRiyal: total}));
    }
  }, [txForm.goldWeight, karahValue]);

  const totalExpenses = capitalTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // =========================================
  // دوال المعالجة (Handlers)
  // =========================================

  // إضافة عملية ذهب جديدة
  const handleAddTransaction = () => {
    if(!txForm.amountRiyal || !txForm.description) {
        showNotification(isRTL ? 'يرجى إكمال البيانات' : 'Please complete data', 'error');
        return;
    }
    const newTx: GoldTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: txForm.date || new Date().toISOString().split('T')[0],
      description: txForm.description,
      amountRiyal: Number(txForm.amountRiyal),
      goldWeight: Number(txForm.goldWeight) || 0,
      karat: Number(txForm.karat) || 21,
      exchangeRate: Number(txForm.exchangeRate) || 3.75,
      type: 'purchase'
    };
    setGoldTransactions([newTx, ...goldTransactions]);
    setIsModalOpen(false);
    // تصفية النموذج بالكامل
    setTxForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amountRiyal: undefined,
        goldWeight: undefined,
        karat: undefined,
        exchangeRate: undefined,
        type: 'purchase'
    });
    setKarahValue('');
    showNotification(t('success'), 'success');
  };

  // إضافة مساهم جديد
  const handleAddShareholder = () => {
      if(!shareholderForm.name || !shareholderForm.capitalAmount) {
          showNotification(isRTL ? 'الاسم ورأس المال مطلوبان' : 'Name and Capital required', 'error');
          return;
      }

      const newShareholder: Shareholder = {
          id: Math.random().toString(36).substr(2, 9),
          name: shareholderForm.name,
          phone: shareholderForm.phone,
          capitalAmount: Number(shareholderForm.capitalAmount),
          numberOfShares: Number(shareholderForm.numberOfShares) || 0,
          // قيم افتراضية للحسابات
          operatingMonths: 0,
          percentage: 0,
          operatorPercentage: 0,
          mediatorPercentage: 0,
          profitShare: 0,
          operatorProfit: 0,
          mediatorProfit: 0
      };

      setShareholders([...shareholders, newShareholder]);
      setIsShareholderModalOpen(false);
      setShareholderForm({ name: '', phone: '', capitalAmount: '', numberOfShares: '' });
      showNotification(t('success'), 'success');
  };

  // حذف عملية
  const handleDeleteTx = (id: string) => {
      if(confirm(isRTL ? 'هل أنت متأكد من حذف هذه العملية؟' : 'Are you sure you want to delete this transaction?')) {
          setGoldTransactions(goldTransactions.filter(t => t.id !== id));
          showNotification(t('success'), 'success');
      }
  };

  const ExchangeRateCard = ({ curr, rate, flag }: any) => (
      <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3">
              <span className="text-2xl">{flag}</span>
              <div>
                  <p className="text-slate-400 text-xs font-bold">{curr}</p>
                  <p className="text-white font-mono font-bold">{rate}</p>
              </div>
          </div>
          <ArrowUpRight className="text-emerald-500" size={16} />
      </div>
  );

  return (
    <div className={`min-h-screen bg-[#0f172a] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* الترويسة */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-500 text-amber-950 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Coins size={28} />
               </div>
               <div>
                  <h1 className="text-2xl font-black tracking-tight text-white">{isRTL ? 'ماخ بامب للذهب' : 'Makh Pump Gold'}</h1>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{isRTL ? 'نظام الاستثمار المتقدم' : 'Advanced Investment System'}</p>
               </div>
            </div>
            
            <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
                    { id: 'program', icon: TrendingUp, label: t('goldProgram') },
                    { id: 'shares', icon: Users, label: t('shareholders') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <button onClick={onLogout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors text-slate-300">
                {t('backToHub')}
            </button>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* لوحة المعلومات (DASHBOARD) */}
        {activeTab === 'dashboard' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* رسم بياني للسعر */}
                  <div className="lg:col-span-2 bg-slate-800 rounded-3xl p-6 border border-slate-700 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h3 className="text-slate-400 font-bold text-sm uppercase flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  {isRTL ? 'سعر الذهب المباشر' : 'Live Gold Price'} (24K)
                              </h3>
                              <div className="flex items-baseline gap-4 mt-2">
                                  <h2 className="text-5xl font-black text-white">{goldPrice.toFixed(2)}</h2>
                                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                                      <ArrowUpRight size={16} /> +0.25%
                                  </span>
                              </div>
                              <p className="text-slate-500 text-xs mt-1">Global Market Average (USD/g)</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2">
                              <ExchangeRateCard curr="USD/SAR" rate="3.75" flag="🇺🇸" />
                              <ExchangeRateCard curr="SAR/XOF" rate="160.5" flag="🇳🇪" />
                          </div>
                      </div>
                      
                      <div className="h-64 w-full pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priceHistory} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis 
                                  dataKey="time" 
                                  stroke="#475569" 
                                  tick={{fill: '#94a3b8', fontSize: 10}}
                                  minTickGap={30}
                                />
                                <YAxis 
                                  domain={['auto', 'auto']} 
                                  stroke="#475569" 
                                  tick={{fill: '#94a3b8', fontSize: 10}}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fbbf24' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="price" 
                                  stroke="#f59e0b" 
                                  strokeWidth={3} 
                                  fillOpacity={1} 
                                  fill="url(#colorPrice)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </div>

                  {/* إحصائيات سريعة وزر إضافة */}
                  <div className="space-y-6">
                      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 text-left group transition-all">
                          <div className="flex justify-between items-center mb-2">
                              <span className="p-3 bg-rose-500/20 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                  <ArrowDownRight size={24} />
                              </span>
                              <span className="text-slate-500 text-xs font-bold uppercase">{t('expenses')}</span>
                          </div>
                          <h3 className="text-3xl font-black text-white group-hover:text-rose-400 transition-colors">
                              {totalExpenses.toLocaleString()} <span className="text-sm text-slate-500">SAR</span>
                          </h3>
                      </div>
                      
                      <button 
                        onClick={() => {
                            setTxForm({
                                date: new Date().toISOString().split('T')[0],
                                description: '',
                                amountRiyal: undefined,
                                goldWeight: undefined,
                                karat: undefined,
                                exchangeRate: undefined,
                                type: 'purchase'
                            });
                            setKarahValue('');
                            setIsModalOpen(true);
                        }}
                        className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                      >
                          <Plus size={20} />
                          {isRTL ? 'شراء ذهب جديد' : 'New Gold Purchase'}
                      </button>
                  </div>
              </div>
           </div>
        )}

        {/* برنامج الذهب (GOLD PROGRAM) */}
        {activeTab === 'program' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">{isRTL ? 'برنامج شراء الذهب' : 'Gold Purchase Program'}</h3>
                    <button 
                      onClick={() => {
                          setTxForm({
                            date: new Date().toISOString().split('T')[0],
                            description: '',
                            amountRiyal: undefined,
                            goldWeight: undefined,
                            karat: undefined,
                            exchangeRate: undefined,
                            type: 'purchase'
                        });
                        setKarahValue('');
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                    >
                       <Plus size={18} /> {isRTL ? 'عملية جديدة' : 'Add Transaction'}
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                       <thead className="bg-slate-900 text-slate-500 font-bold uppercase text-xs">
                          <tr>
                             <th className="px-6 py-4 text-center">{t('date')}</th>
                             <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('description')}</th>
                             <th className="px-6 py-4 text-center">{t('weight')}</th>
                             <th className="px-6 py-4 text-center">{t('karat')}</th>
                             <th className="px-6 py-4 text-center">{t('exchangeRate')}</th>
                             <th className="px-6 py-4 text-center">{isRTL ? 'المبلغ (ريال)' : 'Amount (SAR)'}</th>
                             <th className="px-6 py-4 text-center"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-700">
                          {goldTransactions.map((tx) => (
                             <tr key={tx.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-center font-mono text-slate-400">{tx.date}</td>
                                <td className={`px-6 py-4 font-bold text-white ${isRTL ? 'text-right' : 'text-left'}`}>{tx.description}</td>
                                <td className="px-6 py-4 text-center font-bold text-amber-400 font-mono">{tx.goldWeight}</td>
                                <td className="px-6 py-4 text-center text-slate-400 font-mono">{tx.karat}</td>
                                <td className="px-6 py-4 text-center text-slate-400 font-mono">{tx.exchangeRate}</td>
                                <td className="px-6 py-4 text-center font-black text-white font-mono">{tx.amountRiyal.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDeleteTx(tx.id)} className="text-slate-500 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {/* المساهمين (SHAREHOLDERS) */}
        {activeTab === 'shares' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                 <div className="p-6 bg-amber-600/10 border-b border-amber-600/20 flex justify-between items-center">
                     <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest">{isRTL ? 'توزيع أرباح المدارس على المساهمين' : 'Shareholder Profit Distribution'}</h3>
                     <button 
                        onClick={() => {
                            setShareholderForm({ name: '', phone: '', capitalAmount: '', numberOfShares: '' });
                            setIsShareholderModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
                     >
                        <UserPlus size={18} /> {isRTL ? 'إضافة مساهم' : 'Add Shareholder'}
                     </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-center text-slate-300">
                        <thead className="bg-slate-900 text-xs font-bold uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-4" rowSpan={2}>#</th>
                                <th className="px-4 py-4 text-right" rowSpan={2}>{isRTL ? 'المساهم' : 'Shareholder'}</th>
                                <th className="px-4 py-4" rowSpan={2}>{t('phone')}</th>
                                <th className="px-4 py-4 bg-slate-800" colSpan={3}>{isRTL ? 'رأس المال والأسهم' : 'Capital & Shares'}</th>
                                <th className="px-4 py-4 bg-slate-900" colSpan={3}>{isRTL ? 'توزيع النسب' : 'Percentage Split'}</th>
                                <th className="px-4 py-4 bg-slate-800" colSpan={3}>{isRTL ? 'توزيع الأرباح' : 'Profit Distribution'}</th>
                            </tr>
                            <tr>
                                <th className="px-2 py-2 bg-slate-800/50 text-amber-400">{t('capital')}</th>
                                <th className="px-2 py-2 bg-slate-800/50">{t('sharesCount')}</th>
                                <th className="px-2 py-2 bg-slate-800/50">{isRTL ? 'الشهور' : 'Months'}</th>
                                <th className="px-2 py-2 bg-slate-900/50">{t('percentage')}</th>
                                <th className="px-2 py-2 bg-slate-900/50">{t('operator')}</th>
                                <th className="px-2 py-2 bg-slate-900/50">{t('mediator')}</th>
                                <th className="px-2 py-2 bg-slate-800/50 text-emerald-400">{t('profitShare')}</th>
                                <th className="px-2 py-2 bg-slate-800/50">{t('operator')}</th>
                                <th className="px-2 py-2 bg-slate-800/50">{t('mediator')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {shareholders.map((sh, idx) => (
                                <tr key={sh.id} className="hover:bg-slate-700/30">
                                    <td className="px-4 py-4 font-mono">{idx + 1}</td>
                                    <td className="px-4 py-4 text-right font-bold text-white">{sh.name}</td>
                                    <td className="px-4 py-4 font-mono text-xs">{sh.phone}</td>
                                    <td className="px-4 py-4 font-mono font-bold text-amber-400">{sh.capitalAmount.toLocaleString()}</td>
                                    <td className="px-4 py-4 font-mono">{sh.numberOfShares}</td>
                                    <td className="px-4 py-4 font-mono">{sh.operatingMonths}</td>
                                    <td className="px-4 py-4 font-bold font-mono">{sh.percentage}%</td>
                                    <td className="px-4 py-4 font-mono">{sh.operatorPercentage}%</td>
                                    <td className="px-4 py-4 font-mono">{sh.mediatorPercentage}%</td>
                                    <td className="px-4 py-4 font-mono font-black text-emerald-400">{sh.profitShare.toLocaleString()}</td>
                                    <td className="px-4 py-4 font-mono text-blue-400">{sh.operatorProfit.toLocaleString()}</td>
                                    <td className="px-4 py-4 font-mono text-purple-400">{sh.mediatorProfit.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

      </main>

      {/* مودال الشراء (GOLD PURCHASE MODAL) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isRTL ? 'عملية شراء ذهب' : 'Gold Purchase'} 
        isRTL={isRTL}
        contentClassName="bg-slate-900 text-white border border-slate-700"
      >
         <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3">
                <Info size={18} className="text-amber-500" />
                <p className="text-[10px] font-bold text-amber-200">
                    {isRTL ? 'المعادلة: الوزن × الكاره = الإجمالي' : 'Formula: Weight × Karah = Total'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1">{t('date')}</label>
                   <input 
                      type="date" 
                      value={txForm.date}
                      onChange={(e) => setTxForm({...txForm, date: e.target.value})}
                      className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none font-mono text-center"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1">{t('karat')} (العيار)</label>
                   <input 
                      type="number" 
                      value={txForm.karat || ''}
                      onChange={(e) => setTxForm({...txForm, karat: Number(e.target.value)})}
                      className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none font-mono text-center"
                      placeholder=""
                      dir="ltr"
                   />
                </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-400 mb-1">{t('description')}</label>
               <input 
                  type="text" 
                  value={txForm.description}
                  onChange={(e) => setTxForm({...txForm, description: e.target.value})}
                  className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder={isRTL ? "مثال: شراء من يعقوب" : "e.g. Purchase from Yaqoub"}
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                   <label className="block text-xs font-bold text-amber-500 mb-2">{t('weight')} (الوزن)</label>
                   <input 
                      type="number" 
                      value={txForm.goldWeight || ''}
                      onChange={(e) => setTxForm({...txForm, goldWeight: Number(e.target.value)})}
                      className="w-full border-b border-slate-600 bg-transparent py-2 text-xl font-black text-white focus:border-amber-500 transition-all outline-none font-mono text-center"
                      placeholder=""
                      dir="ltr"
                   />
                </div>
                 <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                   <label className="block text-xs font-bold text-amber-500 mb-2">{isRTL ? 'الكاره (السعر)' : 'Karah (Price)'}</label>
                   <input 
                      type="number" 
                      value={karahValue}
                      onChange={(e) => setKarahValue(e.target.value)}
                      className="w-full border-b border-slate-600 bg-transparent py-2 text-xl font-black text-white focus:border-amber-500 transition-all outline-none font-mono text-center"
                      placeholder=""
                      dir="ltr"
                   />
                </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Calculator size={40} />
                </div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{isRTL ? 'الإجمالي النهائي (ريال)' : 'Final Total (SAR)'}</label>
                <div className="flex items-baseline gap-2 justify-end" dir="ltr">
                    <span className="text-4xl font-black text-white font-mono">{txForm.amountRiyal?.toLocaleString() || '0'}</span>
                    <span className="text-sm font-bold text-slate-500">SAR</span>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Exchange Rate</label>
                  <input 
                    type="number" 
                    value={txForm.exchangeRate || ''}
                    onChange={(e) => setTxForm({...txForm, exchangeRate: Number(e.target.value)})}
                    className="w-full bg-transparent border-b border-slate-600 font-mono text-white text-center focus:border-blue-500 outline-none"
                    placeholder=""
                    dir="ltr"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">Equivalent XOF (CFA)</label>
                   <p className="text-sm font-mono text-emerald-400 font-bold text-center">
                      {((txForm.amountRiyal || 0) * (exchangeRateXOF / (txForm.exchangeRate || 3.75))).toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </p>
               </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors">{t('cancel')}</button>
               <button onClick={handleAddTransaction} className="px-8 py-3 rounded-xl font-black bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all active:scale-95">{t('save')}</button>
            </div>
         </div>
      </Modal>

      {/* مودال إضافة مساهم (SHAREHOLDER MODAL) */}
      <Modal 
        isOpen={isShareholderModalOpen} 
        onClose={() => setIsShareholderModalOpen(false)} 
        title={isRTL ? 'إضافة مساهم جديد' : 'New Shareholder'} 
        isRTL={isRTL}
        contentClassName="bg-slate-900 text-white border border-slate-700"
      >
         <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 mb-1">{isRTL ? 'اسم المساهم' : 'Shareholder Name'}</label>
               <input 
                  type="text" 
                  value={shareholderForm.name}
                  onChange={(e) => setShareholderForm({...shareholderForm, name: e.target.value})}
                  className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 mb-1">{t('phone')}</label>
               <input 
                  type="text" 
                  value={shareholderForm.phone}
                  onChange={(e) => setShareholderForm({...shareholderForm, phone: e.target.value})}
                  className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none font-mono text-center"
                  dir="ltr"
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-amber-500 mb-1">{t('capital')}</label>
                   <input 
                      type="number" 
                      value={shareholderForm.capitalAmount}
                      onChange={(e) => setShareholderForm({...shareholderForm, capitalAmount: e.target.value})}
                      className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none font-mono text-center"
                      placeholder=""
                      dir="ltr"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1">{t('sharesCount')}</label>
                   <input 
                      type="number" 
                      value={shareholderForm.numberOfShares}
                      onChange={(e) => setShareholderForm({...shareholderForm, numberOfShares: e.target.value})}
                      className="w-full border border-slate-700 bg-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none font-mono text-center"
                      placeholder=""
                      dir="ltr"
                   />
                </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
               <button onClick={() => setIsShareholderModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors">{t('cancel')}</button>
               <button onClick={handleAddShareholder} className="px-8 py-3 rounded-xl font-black bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all active:scale-95">{t('save')}</button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default MakhGold;
