
import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Wallet, 
  TrendingUp, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowDownCircle,
  Calculator,
  Globe
} from 'lucide-react';
import { Language, BankPartner } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface BankPartnersProps {
  lang: Language;
  onLogout: () => void;
  partners: BankPartner[];
  setPartners: (partners: BankPartner[]) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
  totalPortfolioProfit: number;
  setTotalPortfolioProfit: (amount: number) => void;
}

const BankPartners: React.FC<BankPartnersProps> = ({ 
  lang, 
  onLogout, 
  partners, 
  setPartners, 
  showNotification,
  totalPortfolioProfit,
  setTotalPortfolioProfit
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  const EXCHANGE_RATE = 157.27786;

  // =========================================
  // State
  // =========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BankPartner>>({
    partner_name: '',
    capital_amount: 0,
    deposit_date: new Date().toISOString().split('T')[0],
    withdrawals: 0,
    notes: ''
  });

  // =========================================
  // Calculations (The Logic)
  // =========================================
  const stats = useMemo(() => {
    // A. Total Partners Capital
    const totalFund = partners.reduce((sum, p) => sum + p.capital_amount, 0);
    
    // Total Withdrawals
    const totalWithdrawals = partners.reduce((sum, p) => sum + p.withdrawals, 0);

    // B, C, D are calculated per row in the render map, 
    // but we can aggregate net balance here for top stats
    let totalNetBalance = 0;
    
    partners.forEach(p => {
        const share = totalFund > 0 ? p.capital_amount / totalFund : 0;
        const profit = totalPortfolioProfit * share;
        const net = p.capital_amount + profit - p.withdrawals;
        totalNetBalance += net;
    });

    return {
        totalFund,
        totalWithdrawals,
        totalNetBalance
    };
  }, [partners, totalPortfolioProfit]);

  // Helper for Currency Display (XOF & SAR)
  const CurrencyDisplay = ({ value, label }: { value: number, label?: string }) => (
      <div className="flex flex-col">
          <span className="font-black font-mono text-slate-100" dir="ltr">
              {value.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] text-slate-500">XOF</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 font-mono" dir="ltr">
              ≈ {(value / EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[9px]">SAR</span>
          </span>
          {label && <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">{label}</span>}
      </div>
  );

  // =========================================
  // Handlers
  // =========================================
  const handleSave = () => {
      if (!formData.partner_name || !formData.capital_amount) {
          showNotification(isRTL ? 'الاسم ورأس المال مطلوبان' : 'Name and Capital required', 'error');
          return;
      }

      const newPartner: BankPartner = {
          id: formData.id || Math.random().toString(36).substr(2, 9),
          partner_name: formData.partner_name!,
          capital_amount: Number(formData.capital_amount),
          deposit_date: formData.deposit_date || new Date().toISOString().split('T')[0],
          withdrawals: Number(formData.withdrawals) || 0,
          notes: formData.notes || ''
      };

      if (formData.id) {
          setPartners(partners.map(p => p.id === formData.id ? newPartner : p));
      } else {
          setPartners([...partners, newPartner]);
      }
      setIsModalOpen(false);
      setFormData({ partner_name: '', capital_amount: 0, deposit_date: new Date().toISOString().split('T')[0], withdrawals: 0, notes: '' });
      showNotification(t('success'), 'success');
  };

  const handleDelete = (id: string) => {
      if (confirm(t('confirm'))) {
          setPartners(partners.filter(p => p.id !== id));
          showNotification(t('success'), 'success');
      }
  };

  const openModal = (p?: BankPartner) => {
      if (p) setFormData(p);
      else setFormData({ partner_name: '', capital_amount: 0, deposit_date: new Date().toISOString().split('T')[0], withdrawals: 0, notes: '' });
      setIsModalOpen(true);
  };

  // =========================================
  // UI Components
  // =========================================
  const StatBox = ({ title, value, icon: Icon, color }: any) => (
      <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
          <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
              <CurrencyDisplay value={value} />
          </div>
          <div className={`p-4 rounded-2xl bg-white/5 ${color}`}>
              <Icon size={24} />
          </div>
      </div>
  );

  return (
    <div className={`min-h-screen bg-[#02040a] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-white/5">
                     <Landmark size={30} />
                 </div>
                 <div>
                     <h1 className="text-2xl font-black tracking-tight text-white">{isRTL ? 'شركاء مصرف الأمانة' : 'Al-Amanah Bank Partners'}</h1>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{isRTL ? 'نظام المحفظة الاستثمارية الإسلامية' : 'Islamic Portfolio Management'}</p>
                 </div>
             </div>
             <button onClick={onLogout} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black text-slate-300 transition-all border border-white/5">
                 {t('backToHub')}
             </button>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 animate-fade-in-up">
          
          {/* Global Settings & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input for Total Profit */}
              <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                      <TrendingUp size={20} className="text-emerald-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{isRTL ? 'أرباح المحفظة البنكية' : 'Total Portfolio Profit'}</h3>
                  </div>
                  <div className="relative group">
                      <input 
                        type="number" 
                        value={totalPortfolioProfit} 
                        onChange={(e) => setTotalPortfolioProfit(Number(e.target.value))}
                        className="w-full bg-black/30 border-2 border-emerald-900/30 text-emerald-400 p-4 rounded-xl text-2xl font-mono font-black text-center outline-none focus:border-emerald-500 transition-all"
                        dir="ltr"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">XOF</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 text-center font-bold">
                      {isRTL ? 'سيتم توزيع هذا المبلغ تلقائياً حسب نسب المساهمة' : 'This amount is auto-distributed based on share %'}
                  </p>
              </div>

              {/* Stats */}
              <StatBox title={isRTL ? 'إجمالي رأس المال' : 'Total Fund Capital'} value={stats.totalFund} icon={Wallet} color="text-blue-400" />
              <StatBox title={isRTL ? 'صافي رصيد الشركاء' : 'Net Partners Balance'} value={stats.totalNetBalance} icon={Calculator} color="text-amber-400" />
          </div>

          {/* Partners Table */}
          <div className="bg-[#0a0c14] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-slate-900/50 to-transparent flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-black text-white">{isRTL ? 'قائمة الشركاء والمحاصصة' : 'Partners & Allocation'}</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Exchange Rate: {EXCHANGE_RATE} XOF/SAR</p>
                  </div>
                  <button onClick={() => openModal()} className="px-6 py-3 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                      <Plus size={16} /> {isRTL ? 'إضافة شريك' : 'Add Partner'}
                  </button>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                      <thead className="bg-[#0f121a] text-slate-500 font-black uppercase tracking-widest">
                          <tr>
                              <th className="px-6 py-6 text-center">#</th>
                              <th className="px-6 py-6">{isRTL ? 'اسم الشريك' : 'Partner Name'}</th>
                              <th className="px-6 py-6">{isRTL ? 'تاريخ الإيداع' : 'Deposit Date'}</th>
                              <th className="px-6 py-6 text-blue-400">{isRTL ? 'رأس المال (المساهمة)' : 'Capital Amount'}</th>
                              <th className="px-6 py-6 text-center">{isRTL ? 'نسبة المساهمة' : 'Share %'}</th>
                              <th className="px-6 py-6 text-emerald-400">{isRTL ? 'حصة الربح' : 'Calculated Profit'}</th>
                              <th className="px-6 py-6 text-rose-400">{isRTL ? 'المسحوبات' : 'Withdrawals'}</th>
                              <th className="px-6 py-6 text-amber-400 bg-amber-500/5 border-x border-white/5">{isRTL ? 'صافي الرصيد' : 'Net Balance'}</th>
                              <th className="px-6 py-6 text-center">{isRTL ? 'إجراءات' : 'Actions'}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                          {partners.map((p, idx) => {
                              // Per Row Calculations
                              const sharePercentage = stats.totalFund > 0 ? (p.capital_amount / stats.totalFund) : 0;
                              const profit = totalPortfolioProfit * sharePercentage;
                              const netBalance = p.capital_amount + profit - p.withdrawals;

                              return (
                                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                      <td className="px-6 py-5 text-center text-slate-600">{idx + 1}</td>
                                      <td className="px-6 py-5 font-black text-white font-sans text-sm">
                                          {p.partner_name}
                                          <div className="text-[9px] text-slate-500 font-normal mt-1">{p.notes}</div>
                                      </td>
                                      <td className="px-6 py-5 text-slate-500 font-sans">{p.deposit_date}</td>
                                      
                                      <td className="px-6 py-5">
                                          <CurrencyDisplay value={p.capital_amount} />
                                      </td>
                                      
                                      <td className="px-6 py-5 text-center">
                                          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold">
                                              {(sharePercentage * 100).toFixed(2)}%
                                          </span>
                                      </td>
                                      
                                      <td className="px-6 py-5">
                                          <CurrencyDisplay value={profit} />
                                      </td>
                                      
                                      <td className="px-6 py-5">
                                          <span className="text-rose-400 font-bold block mb-1">
                                              -{p.withdrawals.toLocaleString()} XOF
                                          </span>
                                      </td>
                                      
                                      <td className="px-6 py-5 bg-amber-500/5 border-x border-white/5">
                                          <CurrencyDisplay value={netBalance} />
                                      </td>
                                      
                                      <td className="px-6 py-5 text-center">
                                          <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => openModal(p)} className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white text-blue-500 transition-all"><Edit size={14} /></button>
                                              <button onClick={() => handleDelete(p.id)} className="p-2 bg-slate-800 rounded-lg hover:bg-rose-600 hover:text-white text-rose-500 transition-all"><Trash2 size={14} /></button>
                                          </div>
                                      </td>
                                  </tr>
                              );
                          })}
                          {partners.length === 0 && (
                              <tr>
                                  <td colSpan={9} className="py-20 text-center text-slate-600 font-sans text-sm font-bold uppercase tracking-widest">
                                      {isRTL ? 'لا يوجد شركاء مسجلين' : 'No partners recorded yet'}
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? (isRTL ? 'تعديل بيانات الشريك' : 'Edit Partner') : (isRTL ? 'إضافة شريك جديد' : 'Add Partner')} isRTL={isRTL} contentClassName="bg-slate-900 text-white border border-white/10">
          <div className="space-y-4">
              <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'اسم الشريك' : 'Partner Name'}</label>
                  <input type="text" value={formData.partner_name} onChange={e => setFormData({...formData, partner_name: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'تاريخ الإيداع' : 'Deposit Date'}</label>
                      <input type="date" value={formData.deposit_date} onChange={e => setFormData({...formData, deposit_date: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-mono text-center" />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'رأس المال (XOF)' : 'Capital (XOF)'}</label>
                      <input type="number" value={formData.capital_amount} onChange={e => setFormData({...formData, capital_amount: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-mono font-bold text-center text-blue-400" dir="ltr" />
                  </div>
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'المسحوبات (XOF)' : 'Withdrawals (XOF)'}</label>
                  <input type="number" value={formData.withdrawals} onChange={e => setFormData({...formData, withdrawals: Number(e.target.value)})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-mono font-bold text-center text-rose-400" dir="ltr" />
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold h-20 resize-none" />
              </div>

              <button onClick={handleSave} className="w-full py-4 bg-slate-100 hover:bg-white text-slate-900 rounded-2xl font-black mt-2 transition-all">
                  {isRTL ? 'حفظ البيانات' : 'Save Partner'}
              </button>
          </div>
      </Modal>

    </div>
  );
};

export default BankPartners;
