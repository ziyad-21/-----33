
import React, { useState, useMemo } from 'react';
import { 
  Church, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  HandCoins,
  FileText,
  Calendar,
  UserPlus,
  Send,
  CreditCard,
  History,
  TrendingUp,
  Briefcase,
  Building,
  Users,
  Wallet,
  Trash2,
  ChevronRight,
  Info,
  DollarSign,
  Edit3,
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { Language, MosqueData, MosqueTransaction, MosqueDonation, MosqueStaffReward } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface MosqueManagementProps {
  lang: Language;
  onLogout: () => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const MosqueManagement: React.FC<MosqueManagementProps> = ({ lang, onLogout, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  const [activeTab, setActiveTab] = useState<'mosques' | 'donations'>('mosques');
  const [selectedMosqueId, setSelectedMosqueId] = useState('m1');
  
  // Modals state
  const [isMosqueModalOpen, setIsMosqueModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  
  // Active Edit states
  const [txType, setTxType] = useState<'receipt' | 'payment' | 'expense'>('receipt');
  const [editItem, setEditItem] = useState<any | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  // Form States
  const [newMosqueName, setNewMosqueName] = useState('');
  const [txForm, setTxForm] = useState({ 
    desc: '', sar: '', xof: '', date: new Date().toISOString().split('T')[0], donor: '', mosqueId: 'm1'
  });
  const [staffForm, setStaffForm] = useState({ name: '', role: '', sar: '', xof: '' });

  // Main Data State
  const [mosques, setMosques] = useState<any[]>([
    {
      id: 'm1',
      name: isRTL ? 'مسجد الغامدي' : 'Mosquée Al-Ghamdi',
      receipts: [
        { id: 'r1', date: '2025-01-11', desc: 'الدفعة الأولى', sar: 30000, xof: 4900000, donor: 'الغامدي' },
        { id: 'r2', date: '2025-01-27', desc: 'الدفعة الثانية', sar: 25000, xof: 4100000, donor: 'الغامدي' },
      ],
      payments: [
        { id: 'p1', date: '2025-01-20', desc: 'الدفعة الأولى مقاول', amount: 2000000 },
      ],
      otherExpenses: [],
      suleimanShare: 1660000,
      suleimanReceived: [660000, 1000000]
    }
  ]);

  const [staffRewards, setStaffRewards] = useState<any[]>([
    { id: 'sr1', staffName: 'عيسى صلاح', role: 'إمام وخطيب ومدرس', amountSAR: 2500, amountXOF: 4300000 },
    { id: 'sr2', staffName: 'محمد مجيد', role: 'إمام وخطيب ومدرس', amountSAR: 1500, amountXOF: 2000000 },
  ]);

  const [payoutHistory, setPayoutHistory] = useState<any[]>([
    { id: 'h1', date: '2025-05-01', from: 'تبرعات عامة', to: 'عيسى صلاح', desc: 'راتب شهر مايو', sar: 2500, xof: 4300000 }
  ]);

  // Derived: Global Donors
  const globalDonors = useMemo(() => {
    const list: any[] = [];
    mosques.forEach(m => {
      m.receipts.forEach((r: any) => {
        list.push({ ...r, mosqueName: m.name, mosqueId: m.id });
      });
    });
    return list;
  }, [mosques]);

  const activeMosque = useMemo(() => mosques.find(m => m.id === selectedMosqueId), [mosques, selectedMosqueId]);

  const activeStats = useMemo(() => {
    if (!activeMosque) return null;
    const totalSAR = activeMosque.receipts.reduce((s: any, r: any) => s + r.sar, 0);
    const totalXOF = activeMosque.receipts.reduce((s: any, r: any) => s + r.xof, 0);
    const totalSpent = activeMosque.payments.reduce((s: any, p: any) => s + p.amount, 0) + 
                       activeMosque.otherExpenses.reduce((s: any, e: any) => s + e.amount, 0);
    
    return {
        totalSAR, totalXOF, totalSpent,
        balance: totalXOF - totalSpent,
        suleimanRemaining: activeMosque.suleimanShare - activeMosque.suleimanReceived.reduce((s:any, r:any) => s+r, 0)
    };
  }, [activeMosque]);

  // Handlers
  const handleAddMosque = () => {
    if (!newMosqueName.trim()) return;
    const newMosque = {
        id: Math.random().toString(36).substr(2, 9),
        name: newMosqueName,
        receipts: [],
        payments: [],
        otherExpenses: [],
        suleimanShare: 0,
        suleimanReceived: []
    };
    setMosques([...mosques, newMosque]);
    setNewMosqueName('');
    setIsMosqueModalOpen(false);
    showNotification(t('success'), 'success');
  };

  const handleAddTransaction = () => {
    const newEntry = { 
        id: editItem?.id || Math.random().toString(36).substr(2, 9), 
        date: txForm.date, 
        desc: txForm.desc, 
        sar: Number(txForm.sar) || 0, 
        xof: Number(txForm.xof) || 0,
        amount: Number(txForm.xof) || 0,
        donor: txForm.donor
    };

    // Use the selected mosque from form, or fallback to currently active view
    const targetMosqueId = txForm.mosqueId || selectedMosqueId;

    const updated = mosques.map(m => {
        if (m.id === targetMosqueId) {
            let receipts = [...m.receipts];
            let payments = [...m.payments];
            let otherExpenses = [...m.otherExpenses];

            if (editItem) {
                if (txType === 'receipt') receipts = receipts.map(r => r.id === editItem.id ? newEntry : r);
                else if (txType === 'payment') payments = payments.map(p => p.id === editItem.id ? newEntry : p);
                else otherExpenses = otherExpenses.map(e => e.id === editItem.id ? newEntry : e);
            } else {
                if (txType === 'receipt') receipts.push(newEntry);
                else if (txType === 'payment') payments.push(newEntry);
                else otherExpenses.push(newEntry);
            }
            return { ...m, receipts, payments, otherExpenses };
        }
        return m;
    });

    setMosques(updated);
    setIsTransactionModalOpen(false);
    setEditItem(null);
    showNotification(t('success'), 'success');
  };

  const handleSaveStaff = () => {
    const newS = {
        id: selectedStaff?.id || Math.random().toString(36).substr(2, 9),
        staffName: staffForm.name,
        role: staffForm.role,
        amountSAR: Number(staffForm.sar),
        amountXOF: Number(staffForm.xof)
    };
    if (selectedStaff) setStaffRewards(staffRewards.map(s => s.id === selectedStaff.id ? newS : s));
    else setStaffRewards([...staffRewards, newS]);
    setIsStaffModalOpen(false);
    setSelectedStaff(null);
    showNotification(t('success'), 'success');
  };

  const handleDeleteStaff = (id: string) => {
      if(confirm(isRTL ? 'حذف الموظف نهائياً؟' : 'Delete staff permanently?')) {
          setStaffRewards(staffRewards.filter(s => s.id !== id));
      }
  };

  const handleDeleteTx = (mId: string, type: string, id: string) => {
      if(confirm(t('confirm'))) {
          setMosques(mosques.map(m => {
              if (m.id === mId) {
                  return {
                      ...m,
                      [type]: m[type].filter((x: any) => x.id !== id)
                  };
              }
              return m;
          }));
      }
  };

  const StatCard = ({ title, value, unit, colorClass, icon: Icon }: any) => (
    <div className="bg-slate-900 border border-white/5 p-5 rounded-[1.8rem] flex flex-col gap-1 shadow-xl hover:bg-slate-800/50 transition-all group">
      <div className="flex justify-between items-center">
        <span className={`p-2 rounded-xl bg-opacity-10 transition-colors ${colorClass} group-hover:bg-opacity-20`}>
          <Icon size={18} className={colorClass.replace('bg-', 'text-').replace('/10', '')} />
        </span>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-1 font-mono">
        <h4 className="text-xl font-black text-white tracking-tighter">{value.toLocaleString('en-US')}</h4>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#050811] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Church size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{isRTL ? 'المحاسبة الموحدة للمساجد' : 'Unified Mosque Accounting'}</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{isRTL ? 'نظام المتابعة المالية الدقيق' : 'Precision Finance System'}</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('mosques')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${activeTab === 'mosques' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <Building size={14} /> {isRTL ? 'المساجد' : 'Mosques'}
            </button>
            <button onClick={() => setActiveTab('donations')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-3 ${activeTab === 'donations' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <Users size={14} /> {isRTL ? 'المتبرعون والعمليات' : 'Donors & Operations'}
            </button>
          </div>

          <button onClick={onLogout} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition-all text-slate-300 border border-white/5">
            {t('backToHub')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 animate-fade-in-up">
        
        {activeTab === 'mosques' && activeMosque && (
          <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {mosques.map((m) => (
                        <button key={m.id} onClick={() => setSelectedMosqueId(m.id)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 whitespace-nowrap ${selectedMosqueId === m.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/10' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-slate-700'}`}>
                            {m.name}
                        </button>
                    ))}
                    <button onClick={() => setIsMosqueModalOpen(true)} className="px-6 py-3 rounded-2xl text-xs font-black bg-slate-800 text-slate-400 border-2 border-dashed border-white/10 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                        <Plus size={16} className="inline mr-2" /> {isRTL ? 'إضافة مسجد' : 'New Mosque'}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => { setTxType('receipt'); setEditItem(null); setTxForm({desc:'', sar:'', xof:'', donor:'', date: new Date().toISOString().split('T')[0], mosqueId: selectedMosqueId}); setIsTransactionModalOpen(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        {isRTL ? 'تبرع وارد' : '+ Receipt'}
                    </button>
                    <button onClick={() => { setTxType('payment'); setEditItem(null); setTxForm({desc:'', sar:'', xof:'', donor:'', date: new Date().toISOString().split('T')[0], mosqueId: selectedMosqueId}); setIsTransactionModalOpen(true); }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        {isRTL ? 'دفعة مقاول' : '+ Payment'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={isRTL ? 'الوارد (SAR)' : 'Income SAR'} value={activeStats?.totalSAR} unit="SAR" colorClass="bg-blue-500/10" icon={TrendingUp} />
                <StatCard title={isRTL ? 'الوارد (XOF)' : 'Income XOF'} value={activeStats?.totalXOF} unit="XOF" colorClass="bg-emerald-500/10" icon={HandCoins} />
                <StatCard title={isRTL ? 'إجمالي المنصرف' : 'Total Spent'} value={activeStats?.totalSpent} unit="XOF" colorClass="bg-rose-500/10" icon={ArrowDownRight} />
                <StatCard title={isRTL ? 'الرصيد المتاح' : 'Available'} value={activeStats?.balance} unit="XOF" colorClass="bg-amber-500/10" icon={Wallet} />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Receipts */}
                <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-blue-500/5 flex justify-between items-center">
                        <h3 className="text-lg font-black text-blue-400">{isRTL ? 'سجل التبرعات الواردة' : 'Mosque Donations'}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-5">{t('date')}</th>
                                    <th className="px-6 py-5">{isRTL ? 'المتبرع' : 'Donor'}</th>
                                    <th className="px-6 py-5">SAR</th>
                                    <th className="px-6 py-5">XOF</th>
                                    <th className="px-6 py-5 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                                {activeMosque.receipts.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5 text-slate-500">{r.date}</td>
                                        <td className="px-6 py-5 font-black text-white font-sans">{r.donor}</td>
                                        <td className="px-6 py-5 text-blue-400 font-black">{r.sar.toLocaleString('en-US')}</td>
                                        <td className="px-6 py-5 text-slate-300">{r.xof.toLocaleString('en-US')}</td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => { setEditItem(r); setTxType('receipt'); setTxForm({desc:r.desc, sar:r.sar, xof:r.xof, donor:r.donor, date:r.date, mosqueId: selectedMosqueId}); setIsTransactionModalOpen(true); }} className="text-slate-500 hover:text-white"><Edit3 size={14}/></button>
                                                <button onClick={() => handleDeleteTx(activeMosque.id, 'receipts', r.id)} className="text-rose-500 hover:text-rose-400"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payments */}
                <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-rose-500/5 flex justify-between items-center">
                        <h3 className="text-lg font-black text-rose-400">{isRTL ? 'دفعات المقاول والمصروفات' : 'Expenditures'}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-5">{t('date')}</th>
                                    <th className="px-6 py-5">{isRTL ? 'البيان' : 'Desc'}</th>
                                    <th className="px-6 py-5">XOF</th>
                                    <th className="px-6 py-5 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                                {activeMosque.payments.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5 text-slate-500">{p.date}</td>
                                        <td className="px-6 py-5 font-black text-rose-200">{p.desc}</td>
                                        <td className="px-6 py-5 text-rose-400 font-black">{p.amount.toLocaleString('en-US')}</td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => { setEditItem(p); setTxType('payment'); setTxForm({desc:p.desc, sar:'0', xof:p.amount, donor:'', date:p.date, mosqueId: selectedMosqueId}); setIsTransactionModalOpen(true); }} className="text-slate-500 hover:text-white"><Edit3 size={14}/></button>
                                                <button onClick={() => handleDeleteTx(activeMosque.id, 'payments', p.id)} className="text-rose-500 hover:text-rose-400"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Unified View */}
        {activeTab === 'donations' && (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Donors List */}
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-blue-500/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-blue-400">{isRTL ? 'سجل المتبرعين الموحد' : 'Consolidated Donors'}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Global Income Tracking</p>
                            </div>
                            <button onClick={() => { 
                                setTxType('receipt'); 
                                setEditItem(null); 
                                setTxForm({
                                    desc:'', 
                                    sar:'', 
                                    xof:'', 
                                    donor:'', 
                                    date: new Date().toISOString().split('T')[0], 
                                    mosqueId: selectedMosqueId
                                }); 
                                setIsTransactionModalOpen(true); 
                            }} className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20" title={isRTL ? 'إضافة متبرع (تبرع جديد)' : 'Add New Donor'}>
                                <UserPlus size={18}/>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">{isRTL ? 'المتبرع' : 'Donor'}</th>
                                        <th className="px-8 py-5">{isRTL ? 'المسجد' : 'Mosque'}</th>
                                        <th className="px-8 py-5">SAR</th>
                                        <th className="px-8 py-5">XOF</th>
                                        <th className="px-8 py-5 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {globalDonors.map((donor, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors font-mono">
                                            <td className="px-8 py-6 font-black text-white font-sans">{donor.donor}</td>
                                            <td className="px-8 py-6 text-slate-500 text-[10px] font-sans">{donor.mosqueName}</td>
                                            <td className="px-8 py-6 font-black text-emerald-400">{donor.sar.toLocaleString('en-US')}</td>
                                            <td className="px-8 py-6 font-black text-blue-400">{donor.xof.toLocaleString('en-US')}</td>
                                            <td className="px-8 py-6 text-center">
                                                <button onClick={() => handleDeleteTx(donor.mosqueId, 'receipts', donor.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Disbursement & Salaries */}
                    <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-orange-500/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-orange-400">{isRTL ? 'كشوفات صرف التبرعات والرواتب' : 'Disbursements & Payroll'}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Staff Compensation Tracking</p>
                            </div>
                            <button onClick={() => { setSelectedStaff(null); setStaffForm({name:'', role:'', sar:'', xof:''}); setIsStaffModalOpen(true); }} className="p-3 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-all"><UserPlus size={18}/></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-black/20 text-slate-500 font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">{isRTL ? 'المستحق' : 'Payee'}</th>
                                        <th className="px-8 py-5">SAR</th>
                                        <th className="px-8 py-5">XOF</th>
                                        <th className="px-8 py-5 text-center">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {staffRewards.map(r => (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-white">{r.staffName}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{r.role}</p>
                                            </td>
                                            <td className="px-8 py-6 font-black text-emerald-400 font-mono">{r.amountSAR.toLocaleString('en-US')}</td>
                                            <td className="px-8 py-6 font-black text-orange-400 font-mono">{r.amountXOF.toLocaleString('en-US')}</td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => { setSelectedStaff(r); setStaffForm({name:r.staffName, role:r.role, sar:r.amountSAR, xof:r.amountXOF}); setIsStaffModalOpen(true); }} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white"><Edit3 size={14}/></button>
                                                    <button onClick={() => handleDeleteStaff(r.id)} className="p-2 bg-slate-800 text-rose-500 rounded-lg hover:bg-rose-500/20"><Trash2 size={14}/></button>
                                                    <button onClick={() => { setSelectedStaff(r); setIsPayoutModalOpen(true); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-[10px] font-black">{isRTL ? 'صرف' : 'Pay'}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Detailed Activity Log */}
                <div className="bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-10 bg-slate-800/50 border-b border-white/5 flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><History size={28}/></div>
                        <div>
                            <h3 className="text-xl font-black text-white">{isRTL ? 'سجل العمليات التفصيلي (النشاط المالي)' : 'Detailed Financial Activity Log'}</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Linking Donors to Recipients & Expenditures</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-black/30 text-slate-500 font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">التاريخ</th>
                                    <th className="px-8 py-6">المصدر (من المتبرع)</th>
                                    <th className="px-8 py-6">الوجهة (المستحق/البيان)</th>
                                    <th className="px-8 py-6 text-emerald-400">SAR</th>
                                    <th className="px-8 py-6 text-blue-400">XOF</th>
                                    <th className="px-8 py-6">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                                {payoutHistory.map(h => (
                                    <tr key={h.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6 text-slate-500">{h.date}</td>
                                        <td className="px-8 py-6 font-sans font-bold text-blue-400">{h.from}</td>
                                        <td className="px-8 py-6 font-sans font-bold text-emerald-400">{h.to}</td>
                                        <td className="px-8 py-6 text-emerald-400 font-black">{h.sar.toLocaleString('en-US')}</td>
                                        <td className="px-8 py-6 text-blue-400 font-black">{h.xof.toLocaleString('en-US')}</td>
                                        <td className="px-8 py-6 font-sans text-slate-400 text-[10px]">{h.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* Modals */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={selectedStaff ? (isRTL ? 'تعديل بيانات موظف' : 'Edit Staff') : (isRTL ? 'إضافة موظف/مستحق' : 'Add Payee')} isRTL={isRTL} contentClassName="bg-slate-900 text-white">
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الاسم الكامل</label>
                <input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none focus:border-orange-500 font-bold" />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الوظيفة / الدور</label>
                <input type="text" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none focus:border-orange-500 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الراتب الأساسي (ريال)</label>
                    <input type="number" value={staffForm.sar} onChange={e => setStaffForm({...staffForm, sar: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500 font-mono" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الراتب الأساسي (فرنك)</label>
                    <input type="number" value={staffForm.xof} onChange={e => setStaffForm({...staffForm, xof: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none focus:border-orange-500 font-mono" />
                </div>
            </div>
            <button onClick={handleSaveStaff} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black mt-4 transition-all">
                {isRTL ? 'حفظ البيانات' : 'Save Payee'}
            </button>
        </div>
      </Modal>

      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title={txType === 'receipt' ? (isRTL ? 'تسجيل تبرع' : 'New Donation') : (isRTL ? 'تسجيل مصروف' : 'New Expense')} isRTL={isRTL} contentClassName="bg-slate-900 text-white">
        <div className="space-y-4">
            {/* Mosque Selection Dropdown */}
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">{isRTL ? 'المسجد' : 'Mosque'}</label>
                <select 
                    value={txForm.mosqueId} 
                    onChange={e => setTxForm({...txForm, mosqueId: e.target.value})} 
                    className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold text-white cursor-pointer"
                >
                    {mosques.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            
            {txType === 'receipt' && (
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">اسم المتبرع</label>
                    <input type="text" value={txForm.donor} onChange={e => setTxForm({...txForm, donor: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
                </div>
            )}
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">البيان / الوصف</label>
                <input type="text" value={txForm.desc} onChange={e => setTxForm({...txForm, desc: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4 font-mono">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">ريال سعودي</label>
                    <input type="number" value={txForm.sar} onChange={e => setTxForm({...txForm, sar: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none text-blue-400" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">فرنك غرب أفريقيا</label>
                    <input type="number" value={txForm.xof} onChange={e => setTxForm({...txForm, xof: e.target.value})} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none text-orange-400" />
                </div>
            </div>
            <button onClick={handleAddTransaction} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black mt-4 transition-all">
                {isRTL ? 'تأكيد وحفظ' : 'Confirm & Save'}
            </button>
        </div>
      </Modal>

      {/* مودال إضافة مسجد جديد */}
      <Modal isOpen={isMosqueModalOpen} onClose={() => setIsMosqueModalOpen(false)} title={isRTL ? 'إضافة مسجد جديد' : 'Add New Mosque'} isRTL={isRTL} contentClassName="bg-slate-900 text-white">
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'اسم المسجد' : 'Mosque Name'}</label>
                <input type="text" value={newMosqueName} onChange={e => setNewMosqueName(e.target.value)} className="w-full bg-slate-800 border border-white/5 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold" />
            </div>
            <button onClick={handleAddMosque} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black mt-4 transition-all">
                {isRTL ? 'حفظ المسجد' : 'Save Mosque'}
            </button>
        </div>
      </Modal>

      <footer className="max-w-7xl mx-auto mt-12 mb-10 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
        Niger Projects Group • Unified Accounting v7.0
      </footer>
    </div>
  );
};

export default MosqueManagement;
