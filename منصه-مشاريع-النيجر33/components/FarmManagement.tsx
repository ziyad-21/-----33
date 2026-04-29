
import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  Tractor, 
  Leaf, 
  Plus, 
  DollarSign, 
  Weight, 
  FileText, 
  Trash2, 
  Download,
  Wheat,
  Sun,
  TrendingDown,
  TrendingUp,
  Droplets,
  Package
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

// تحديث نوع البيانات ليشمل النوع (إنتاج/استهلاك)
export interface FarmRecord {
  id: string;
  type: 'production' | 'consumption'; // تحديد نوع السجل
  date: string;
  item: string;          // المحصول (في الإنتاج) أو المادة (في الاستهلاك)
  quantity: number;      // الوزن أو العدد
  unit: string;          // طن، كيلو، لتر، حبة
  unitPrice: number;     // سعر الوحدة
  totalPrice: number;    // الإجمالي
  notes: string;         // التفاصيل/ملاحظات
  season: string;        // الموسم
}

interface FarmManagementProps {
  lang: Language;
  onLogout: () => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
  farmData: FarmRecord[];
  setFarmData: (data: FarmRecord[]) => void;
}

const FarmManagement: React.FC<FarmManagementProps> = ({ lang, onLogout, showNotification, farmData, setFarmData }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  // حالة التبويب النشط (إنتاج أو استهلاك)
  const [activeTab, setActiveTab] = useState<'production' | 'consumption'>('production');

  // حالة المودال
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FarmRecord>>({
    date: new Date().toISOString().split('T')[0],
    item: '',
    quantity: 0,
    unit: 'Ton',
    unitPrice: 0,
    notes: '',
    season: '2025',
    type: 'production'
  });

  // تصفية البيانات حسب التبويب
  const filteredData = useMemo(() => {
    return farmData.filter(item => item.type === activeTab);
  }, [farmData, activeTab]);

  // حساب الإجماليات
  const stats = useMemo(() => {
    const totalProduction = farmData.filter(i => i.type === 'production').reduce((sum, item) => sum + item.totalPrice, 0);
    const totalConsumption = farmData.filter(i => i.type === 'consumption').reduce((sum, item) => sum + item.totalPrice, 0);
    const netProfit = totalProduction - totalConsumption;
    
    // إجمالي الوزن للإنتاج فقط
    const productionWeight = farmData.filter(i => i.type === 'production').reduce((sum, item) => sum + item.quantity, 0);

    return { totalProduction, totalConsumption, netProfit, productionWeight };
  }, [farmData]);

  // =========================================
  // العمليات
  // =========================================

  const handleOpenModal = () => {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        item: '',
        quantity: 0,
        unit: activeTab === 'production' ? 'Ton' : 'Kg', // وحدة افتراضية حسب النوع
        unitPrice: activeTab === 'production' ? 595 : 0,
        notes: '',
        season: '2025',
        type: activeTab // نفتح المودال بناء على التبويب الحالي
      });
      setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.item || !formData.quantity || !formData.unitPrice) {
        showNotification(isRTL ? 'يرجى تعبئة الحقول الأساسية' : 'Please fill required fields', 'error');
        return;
    }

    const total = Number(formData.quantity) * Number(formData.unitPrice);

    const newItem: FarmRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: formData.date || new Date().toISOString().split('T')[0],
        type: formData.type || 'production',
        item: formData.item,
        quantity: Number(formData.quantity),
        unit: formData.unit || 'Ton',
        unitPrice: Number(formData.unitPrice),
        totalPrice: total,
        notes: formData.notes || '',
        season: formData.season || '2025'
    };

    setFarmData([newItem, ...farmData]);
    setIsModalOpen(false);
    showNotification(t('success'), 'success');
  };

  const handleDelete = (id: string) => {
      if(confirm(isRTL ? 'حذف هذا السجل؟' : 'Delete record?')) {
          setFarmData(farmData.filter(d => d.id !== id));
      }
  };

  // بطاقة إحصائيات
  const StatCard = ({ title, value, unit, icon: Icon, gradient, subValue }: any) => (
      <div className={`relative overflow-hidden rounded-[2rem] p-6 border border-white/10 shadow-xl group ${gradient}`}>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
              <div>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">{title}</p>
                  <h3 className="text-3xl font-black text-white font-mono tracking-tight" dir="ltr">
                      {value} <span className="text-sm font-bold opacity-60">{unit}</span>
                  </h3>
                  {subValue && <p className="text-[10px] mt-2 font-bold text-white/50">{subValue}</p>}
              </div>
              <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-sm shadow-sm">
                  <Icon size={24} />
              </div>
          </div>
      </div>
  );

  return (
    <div className={`min-h-screen bg-[#02040a] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* خلفية الطبيعة */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* الترويسة */}
      <header className="relative z-10 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 p-6 sticky top-0">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-800 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 ring-1 ring-white/20">
                     <Tractor size={30} />
                 </div>
                 <div>
                     <h1 className="text-2xl font-black tracking-tight text-white">{isRTL ? 'إدارة المزرعة والإنتاج' : 'Farm Management System'}</h1>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider border border-white/10" dir="ltr">
                            Season 2025
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold">| Integrated DB System</span>
                     </div>
                 </div>
             </div>
             <button onClick={onLogout} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black text-slate-300 transition-all border border-white/5 shadow-sm">
                 {t('backToHub')}
             </button>
         </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10 space-y-10 animate-fade-in-up">
          
          {/* قسم الإحصائيات العلوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title={isRTL ? 'صافي الأرباح' : 'Net Profit'} 
                value={stats.netProfit.toLocaleString()} 
                unit="SAR" 
                icon={DollarSign} 
                gradient="bg-gradient-to-br from-blue-900 to-slate-900" 
                subValue={isRTL ? '(الإيرادات - المصروفات)' : '(Revenue - Expenses)'}
              />
              <StatCard 
                title={isRTL ? 'إجمالي الإيرادات (الإنتاج)' : 'Total Revenue'} 
                value={stats.totalProduction.toLocaleString()} 
                unit="SAR" 
                icon={TrendingUp} 
                gradient="bg-gradient-to-br from-emerald-800 to-green-900" 
              />
              <StatCard 
                title={isRTL ? 'إجمالي المصروفات (الاستهلاك)' : 'Total Expenses'} 
                value={stats.totalConsumption.toLocaleString()} 
                unit="SAR" 
                icon={TrendingDown} 
                gradient="bg-gradient-to-br from-orange-800 to-red-900" 
              />
          </div>

          {/* الحاوية الرئيسية */}
          <div className="bg-[#0a0c14] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative min-h-[600px]">
              
              {/* شريط التبويبات والأدوات */}
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-slate-900/50 to-transparent flex flex-wrap justify-between items-center gap-6">
                  
                  {/* أزرار التبديل */}
                  <div className="flex bg-black/20 p-1.5 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => setActiveTab('production')}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'production' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                      >
                          <Leaf size={16} /> {isRTL ? 'سجل الإنتاج' : 'Production'}
                      </button>
                      <button 
                        onClick={() => setActiveTab('consumption')}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'consumption' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                      >
                          <Droplets size={16} /> {isRTL ? 'سجل الاستهلاك' : 'Consumption'}
                      </button>
                  </div>

                  <div className="flex gap-3">
                      <button className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all border border-white/5">
                          <Download size={16} /> {isRTL ? 'تصدير' : 'Export'}
                      </button>
                      <button 
                          onClick={handleOpenModal}
                          className={`px-6 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all border border-white/10 ${activeTab === 'production' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/20' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/20'}`}
                      >
                          <Plus size={16} /> {isRTL ? (activeTab === 'production' ? 'إضافة إنتاج' : 'إضافة مصروف') : 'New Entry'}
                      </button>
                  </div>
              </div>

              {/* الجدول */}
              <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                      <thead className="bg-[#0f121a] text-slate-500 font-black uppercase tracking-widest text-[10px]">
                          <tr>
                              <th className="px-6 py-6 text-center text-white/40">{t('date')}</th>
                              <th className="px-6 py-6 text-white/40">{isRTL ? (activeTab === 'production' ? 'المحصول' : 'المادة / المصروف') : 'Item'}</th>
                              <th className="px-6 py-6 text-center text-white/40">{isRTL ? 'الكمية' : 'Qty'}</th>
                              <th className="px-6 py-6 text-center text-white/40">{isRTL ? 'الوحدة' : 'Unit'}</th>
                              <th className="px-6 py-6 text-center text-white/40">{isRTL ? 'سعر الوحدة' : 'Price'}</th>
                              <th className={`px-6 py-6 text-center ${activeTab === 'production' ? 'text-emerald-400' : 'text-orange-400'}`}>{isRTL ? 'الإجمالي (SAR)' : 'Total'}</th>
                              <th className="px-6 py-6 w-1/4 text-white/40">{isRTL ? 'التفاصيل / ملاحظات' : 'Details'}</th>
                              <th className="px-6 py-6 text-center"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                          {filteredData.map((item) => (
                              <tr key={item.id} className={`transition-colors group ${activeTab === 'production' ? 'hover:bg-green-500/5' : 'hover:bg-orange-500/5'}`}>
                                  <td className="px-6 py-5 text-center text-slate-400" dir="ltr">{item.date}</td>
                                  <td className="px-6 py-5 font-bold text-white font-sans text-base flex items-center gap-2">
                                      {activeTab === 'production' ? <Wheat size={16} className="text-amber-600" /> : <Package size={16} className="text-slate-400" />}
                                      {item.item}
                                  </td>
                                  <td className="px-6 py-5 text-center font-bold text-slate-200" dir="ltr">
                                      {item.quantity.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-5 text-center font-sans text-xs font-bold text-slate-500">
                                      {item.unit}
                                  </td>
                                  <td className="px-6 py-5 text-center text-slate-400" dir="ltr">
                                      {item.unitPrice.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                      <span className={`px-3 py-1 rounded-lg font-black border dir-ltr inline-block ${activeTab === 'production' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`} dir="ltr">
                                        {item.totalPrice.toLocaleString()}
                                      </span>
                                  </td>
                                  <td className="px-6 py-5 text-slate-500 font-sans text-xs italic">{item.notes}</td>
                                  <td className="px-6 py-5 text-center">
                                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {filteredData.length === 0 && (
                              <tr>
                                  <td colSpan={8} className="py-24 text-center">
                                      <div className="flex flex-col items-center justify-center opacity-30">
                                          {activeTab === 'production' ? <Leaf size={48} className="mb-4 text-green-500" /> : <Droplets size={48} className="mb-4 text-orange-500" />}
                                          <p className="font-black uppercase tracking-widest text-xs">{isRTL ? 'لا توجد سجلات لعرضها' : 'No records found'}</p>
                                      </div>
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </main>

      {/* نافذة الإضافة الموحدة (Modal) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isRTL ? (activeTab === 'production' ? 'تسجيل إنتاج جديد' : 'تسجيل مصروف/استهلاك') : 'New Entry'} 
        isRTL={isRTL} 
        contentClassName={`bg-[#0f121a] text-white border ${activeTab === 'production' ? 'border-green-500/20' : 'border-orange-500/20'}`}
      >
          <div className="space-y-5">
              
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${activeTab === 'production' ? 'bg-green-900/20 border-green-500/20' : 'bg-orange-900/20 border-orange-500/20'}`}>
                  <FileText className={activeTab === 'production' ? 'text-green-500' : 'text-orange-500'} size={18} />
                  <div>
                      <p className={`text-xs font-bold ${activeTab === 'production' ? 'text-green-200' : 'text-orange-200'}`}>
                          {isRTL ? (activeTab === 'production' ? 'بيانات الإنتاج' : 'بيانات الاستهلاك') : 'Data Entry'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">يتم احتساب الإجمالي تلقائياً (الكمية × السعر) - الأرقام بالإنجليزية.</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'الموسم' : 'Season'}</label>
                    <div className="relative">
                        <input type="text" value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} className="w-full bg-[#1a1d26] border border-white/5 p-3 pl-10 rounded-xl outline-none font-bold text-white focus:border-slate-500 transition-colors" dir="ltr" />
                        <Sun size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'التاريخ' : 'Date'}</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#1a1d26] border border-white/5 p-3 rounded-xl outline-none font-mono text-center text-white focus:border-slate-500 transition-colors" dir="ltr" />
                </div>
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      {isRTL ? (activeTab === 'production' ? 'نوع المحصول' : 'نوع المادة / المصروف') : 'Item Name'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.item} 
                    onChange={e => setFormData({...formData, item: e.target.value})} 
                    className="w-full bg-[#1a1d26] border border-white/5 p-3 rounded-xl outline-none font-bold text-white focus:border-slate-500 transition-colors placeholder:text-slate-600" 
                    placeholder={isRTL ? (activeTab === 'production' ? "مثال: برسيم، قمح" : "مثال: ديزل، أسمدة، عمالة") : "..."}
                  />
              </div>

              <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1d26] p-3 rounded-xl border border-white/5 col-span-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">{isRTL ? 'الكمية' : 'Qty'}</label>
                      <input 
                        type="number" 
                        value={formData.quantity || ''} 
                        onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} 
                        className="w-full bg-transparent border-b border-white/10 py-1 outline-none font-mono font-black text-lg text-white text-center focus:border-white transition-colors" 
                        placeholder="0"
                        dir="ltr"
                      />
                  </div>
                   <div className="bg-[#1a1d26] p-3 rounded-xl border border-white/5 col-span-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">{isRTL ? 'الوحدة' : 'Unit'}</label>
                      <input 
                        type="text" 
                        value={formData.unit || ''} 
                        onChange={e => setFormData({...formData, unit: e.target.value})} 
                        className="w-full bg-transparent border-b border-white/10 py-1 outline-none font-bold text-sm text-slate-300 text-center focus:border-white transition-colors" 
                        placeholder={isRTL ? "طن" : "Ton"}
                      />
                  </div>
                  <div className="bg-[#1a1d26] p-3 rounded-xl border border-white/5 col-span-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 text-center">{isRTL ? 'السعر' : 'Price'}</label>
                      <input 
                        type="number" 
                        value={formData.unitPrice || ''} 
                        onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} 
                        className={`w-full bg-transparent border-b border-white/10 py-1 outline-none font-mono font-black text-lg text-center focus:border-white transition-colors ${activeTab === 'production' ? 'text-emerald-400' : 'text-orange-400'}`}
                        placeholder="0"
                        dir="ltr"
                      />
                  </div>
              </div>

              {/* حقل الإجمالي المحسوب */}
              <div className={`p-5 rounded-2xl flex justify-between items-center border shadow-inner ${activeTab === 'production' ? 'bg-green-900/20 border-green-500/20' : 'bg-orange-900/20 border-orange-500/20'}`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'production' ? 'text-green-200' : 'text-orange-200'}`}>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-3xl font-black text-white font-mono tracking-tight drop-shadow-lg" dir="ltr">
                      {((formData.quantity || 0) * (formData.unitPrice || 0)).toLocaleString()} <span className="text-xs font-bold opacity-60">SAR</span>
                  </span>
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{isRTL ? 'تفاصيل / ملاحظات' : 'Details'}</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                    className="w-full bg-[#1a1d26] border border-white/5 p-3 rounded-xl outline-none font-bold text-white focus:border-slate-500 transition-colors h-20 resize-none" 
                    placeholder={isRTL ? "أي تفاصيل إضافية..." : "Details..."}
                  />
              </div>

              <button onClick={handleSave} className={`w-full py-4 text-white rounded-2xl font-black mt-2 transition-all shadow-lg active:scale-95 border ${activeTab === 'production' ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/20 shadow-green-900/50' : 'bg-gradient-to-r from-orange-600 to-red-600 border-orange-400/20 shadow-orange-900/50'}`}>
                  {isRTL ? 'حفظ السجل في قاعدة البيانات' : 'Save Record to DB'}
              </button>
          </div>
      </Modal>
    </div>
  );
};

export default FarmManagement;
