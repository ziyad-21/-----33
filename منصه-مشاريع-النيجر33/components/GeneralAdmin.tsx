
import React, { useState, useMemo } from 'react';
import { 
  Building2,
  Users,
  Calendar,
  Plus,
  MapPin,
  Clock,
  Trash2,
  ClipboardList,
  Edit,
  ChevronRight,
  CheckCircle2,
  History,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Database
} from 'lucide-react';
import { Language, Expense, GoldTransaction, Order, Staff, Appointment, EntityType } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';
import DatabaseManagement from './DatabaseManagement';

interface GeneralAdminProps {
  lang: Language;
  onLogout: () => void;
  expenses: Expense[];
  goldTransactions: GoldTransaction[];
  orders: Order[];
  staff: Staff[];
  setStaff: (s: Staff[]) => void;
  appointments: Appointment[];
  setAppointments: (a: Appointment[]) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
  currentUser: Staff | null;
}

const GeneralAdmin: React.FC<GeneralAdminProps> = ({ 
    lang, onLogout, expenses, goldTransactions, orders, 
    staff, setStaff, appointments, setAppointments, showNotification, currentUser 
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  
  // =========================================
  // حالة التحكم في التبويبات والمودالات
  // =========================================
  // تم حذف 'overview' من التبويبات
  const [activeTab, setActiveTab] = useState<'users' | 'appointments' | 'database'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'appointment' | 'finishAppointment'>('appointment');

  // الموعد أو العنصر المختار للعمليات
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // حالات خاصة بإدارة المستخدمين
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);

  // نماذج الإدخال
  const [userForm, setUserForm] = useState<Partial<Staff>>({ 
      id: '', 
      name: '', 
      roleAr: '', 
      salary: 0, 
      allowedEntity: 'FACTORY', 
      password: '' 
  });

  const [aptForm, setAptForm] = useState<Partial<Appointment>>({ 
    title: '', date: '', time: '09:00 AM', location: '', notes: '', tasks: [], isFinished: false, summary: '' 
  });
  const [currentTask, setCurrentTask] = useState('');
  const [meetingSummary, setMeetingSummary] = useState('');

  // =========================================
  // منطق المواعيد
  // =========================================
  const timeOptions = useMemo(() => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h % 12 || 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        const minute = m === 0 ? '00' : '30';
        const timeStr = `${hour < 10 ? '0' + hour : hour}:${minute} ${ampm}`;
        times.push(timeStr);
      }
    }
    return times;
  }, []);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { weekday: 'long' });
  };

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(a => !a.isFinished)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const finishedAppointments = useMemo(() => {
    return appointments
      .filter(a => a.isFinished)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments]);

  // =========================================
  // دوال المعالجة (Handlers)
  // =========================================

  // حفظ المستخدم (إضافة أو تعديل)
  const handleSaveUser = () => {
    if(!userForm.name || !userForm.password) {
        showNotification('يرجى ملء كافة البيانات المطلوبة', 'error');
        return;
    }

    if (userForm.id) {
        const updatedStaff = staff.map(s => s.id === userForm.id ? { ...s, ...userForm } as Staff : s);
        setStaff(updatedStaff);
        showNotification('تم تحديث بيانات المستخدم وصلاحياته بنجاح', 'success');
    } else {
        const newUser: Staff = {
            id: Math.random().toString(36).substr(2, 9),
            name: userForm.name!,
            roleAr: userForm.roleAr || 'موظف',
            roleFr: 'Employee',
            salary: Number(userForm.salary) || 0,
            lastPaymentDate: '-',
            advanceTaken: 0,
            allowedEntity: userForm.allowedEntity || 'FACTORY',
            password: userForm.password,
            loginCount: 0,
            loginHistory: []
        };
        setStaff([...staff, newUser]);
        showNotification('تم إضافة المستخدم الجديد بنجاح', 'success');
    }
    setIsModalOpen(false);
    setUserForm({ allowedEntity: 'FACTORY', salary: 0, name: '', roleAr: '', password: '' }); 
  };

  const handleEditUserClick = (user: Staff) => {
      setUserForm({ ...user });
      setModalType('user');
      setIsModalOpen(true);
      setActiveUserMenu(null);
  };

  const handleSaveAppointment = () => {
    if(!aptForm.title || !aptForm.date) return;
    
    if (selectedItem) {
        setAppointments(appointments.map(a => a.id === selectedItem.id ? { ...a, ...aptForm } as Appointment : a));
        showNotification('تم تحديث الاجتماع بنجاح', 'success');
    } else {
        const newApt: Appointment = {
            id: Math.random().toString(36).substr(2, 9),
            title: aptForm.title!,
            date: aptForm.date!,
            time: aptForm.time || '09:00 AM',
            location: aptForm.location || '',
            notes: aptForm.notes || '',
            tasks: aptForm.tasks || [],
            isFinished: false
        };
        setAppointments([...appointments, newApt]);
        showNotification('تمت جدولة الاجتماع بنجاح', 'success');
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteAppointment = (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذا الاجتماع نهائياً؟')) {
          setAppointments(appointments.filter(a => a.id !== id));
          showNotification('تم الحذف بنجاح', 'success');
      }
  };

  const handleFinishMeeting = () => {
      if (!selectedItem) return;
      setAppointments(appointments.map(a => 
        a.id === selectedItem.id ? { ...a, isFinished: true, summary: meetingSummary } : a
      ));
      setIsModalOpen(false);
      setMeetingSummary('');
      setSelectedItem(null);
      showNotification('تم إنهاء الاجتماع وأرشفته', 'success');
  };

  const addTask = () => {
      if(!currentTask.trim()) return;
      setAptForm({ ...aptForm, tasks: [...(aptForm.tasks || []), currentTask] });
      setCurrentTask('');
  };

  return (
    <div className={`min-h-screen bg-[#050811] text-slate-100 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'} onClick={() => setActiveUserMenu(null)}>
        {/* الشريط العلوي */}
        <header className="bg-slate-900 border-b border-white/5 p-6 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-slate-950 rounded-xl flex items-center justify-center shadow-lg">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">الإدارة العامة</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">المجموعة البرمجية الموحدة</p>
                    </div>
                </div>
                
                <nav className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg flex-wrap">
                    <button onClick={() => setActiveTab('database')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'database' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        قاعدة البيانات
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        إدارة المستخدمين
                    </button>
                    <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        المواعيد
                    </button>
                </nav>

                <button onClick={onLogout} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                    تسجيل الخروج
                </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-8 space-y-16 animate-fade-in-up">
            
            {/* ==========================
               1. إدارة المستخدمين (Users)
               ========================== */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white">إدارة المستخدمين والصلاحيات</h2>
                        <button 
                            onClick={() => { 
                                setModalType('user'); 
                                setUserForm({ 
                                    id: '', name: '', roleAr: '', salary: 0, 
                                    allowedEntity: 'FACTORY', 
                                    password: '' 
                                }); 
                                setIsModalOpen(true); 
                            }} 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <Plus size={16} /> إضافة موظف
                        </button>
                    </div>
                    <div className="bg-[#0a0f1d] rounded-[2.5rem] border border-white/5 overflow-hidden min-h-[400px]">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-[#1a1e2b] text-xs font-black uppercase text-slate-500 tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">الموظف</th>
                                    <th className="px-8 py-5">الصلاحية (الشركة)</th>
                                    <th className="px-8 py-5">الدور الوظيفي</th>
                                    <th className="px-8 py-5 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {staff.map(s => (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors relative">
                                        <td className="px-8 py-6 font-black text-white">{s.name}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border border-white/10 ${
                                                s.allowedEntity === 'MASTER' ? 'bg-rose-500/10 text-rose-400' :
                                                s.allowedEntity === 'GENERAL_ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {s.allowedEntity || 'FACTORY'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400">{isRTL ? s.roleAr : s.roleFr}</td>
                                        <td className="px-8 py-6 text-center relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveUserMenu(activeUserMenu === s.id ? null : s.id); }} 
                                                className={`p-2 rounded-lg transition-colors ${activeUserMenu === s.id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                <MoreHorizontal size={20}/>
                                            </button>
                                            
                                            {/* القائمة المنسدلة */}
                                            {activeUserMenu === s.id && (
                                                <div className="absolute left-8 top-10 z-50 w-56 bg-white rounded-xl shadow-2xl py-2 flex flex-col gap-1 text-right border border-slate-200 animate-in fade-in zoom-in duration-200 origin-top-right">
                                                    <div className="px-4 py-2 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        خيارات المستخدم
                                                    </div>
                                                    <button onClick={() => handleEditUserClick(s)} className="w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                                        <Edit size={16} className="text-blue-500"/> تعديل البيانات والصلاحيات
                                                    </button>
                                                    <button onClick={() => setShowPasswordId(showPasswordId === s.id ? null : s.id)} className="w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                                        {showPasswordId === s.id ? <EyeOff size={16} className="text-slate-400"/> : <Eye size={16} className="text-slate-400"/>}
                                                        {showPasswordId === s.id ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                                    </button>
                                                    
                                                    {showPasswordId === s.id && (
                                                        <div className="mx-4 my-2 p-3 bg-slate-100 rounded-lg text-center font-mono font-bold text-slate-800 tracking-widest text-lg border border-slate-200">
                                                            {s.password}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ==========================
               2. المواعيد (Appointments)
               ========================== */}
            {activeTab === 'appointments' && (
                <div className="space-y-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">جدول اجتماعات خطة عمل المجموعة</h2>
                            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest opacity-70">Strategic Group Planning Schedule</p>
                        </div>
                        <button 
                            onClick={() => { setSelectedItem(null); setAptForm({title:'', date:'', time:'09:00 AM', location:'', notes:'', tasks:[]}); setModalType('appointment'); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus size={18} /> جدولة اجتماع جديد
                        </button>
                    </div>

                    {/* جدول المواعيد القادمة بتصميم معرب بالكامل */}
                    <div className="bg-[#0a0f1d] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="bg-[#1a1e2b]">
                                        <th className="px-6 py-8 border-r border-white/5">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-[#8b4146] px-8 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    التاريخ <Calendar size={12} />
                                                </div>
                                                <div className="w-full h-0.5 bg-[#8b4146]/30"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-8 border-r border-white/5">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-[#56634c] px-8 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    الاجتماع <Users size={12} />
                                                </div>
                                                <div className="w-full h-0.5 bg-[#56634c]/30"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-8 border-r border-white/5">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-[#4a5463] px-8 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    الموقع <MapPin size={12} />
                                                </div>
                                                <div className="w-full h-0.5 bg-[#4a5463]/30"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-8 border-r border-white/5">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-[#5c6853] px-8 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    الوقت <Clock size={12} />
                                                </div>
                                                <div className="w-full h-0.5 bg-[#5c6853]/30"></div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-8">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-[#6b755d] px-8 py-2 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    المهام <ClipboardList size={12} />
                                                </div>
                                                <div className="w-full h-0.5 bg-[#6b755d]/30"></div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingAppointments.map((apt) => (
                                        <tr key={apt.id} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors relative">
                                            <td className="px-6 py-10 border-r border-white/5">
                                                <p className="text-white text-sm font-black font-mono">{apt.date.split('-').reverse().join('/')}</p>
                                                <p className="text-[10px] text-rose-400 font-bold uppercase mt-1">{getDayName(apt.date)}</p>
                                            </td>
                                            <td className="px-6 py-10 border-r border-white/5">
                                                <h4 className="text-white text-sm font-black mb-1">{apt.title}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase italic">{apt.notes || 'بدون ملاحظات إضافية'}</p>
                                            </td>
                                            <td className="px-6 py-10 border-r border-white/5">
                                                <p className="text-slate-400 text-sm font-bold">{apt.location}</p>
                                            </td>
                                            <td className="px-6 py-10 border-r border-white/5 font-mono text-sm font-black text-slate-300">
                                                {apt.time}
                                            </td>
                                            <td className="px-10 py-10 text-left relative min-w-[300px]">
                                                <ul className="space-y-2">
                                                    {(apt.tasks || []).map((task, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                                                            <ChevronRight size={14} className="mt-0.5 text-[#6b755d]" />
                                                            <span className="font-bold">{task}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setSelectedItem(apt); setModalType('finishAppointment'); setIsModalOpen(true); }} className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="إنهاء الاجتماع"><CheckCircle2 size={14}/></button>
                                                    <button onClick={() => { setSelectedItem(apt); setAptForm({...apt}); setModalType('appointment'); setIsModalOpen(true); }} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={14}/></button>
                                                    <button onClick={() => handleDeleteAppointment(apt.id)} className="p-2 bg-rose-600/20 text-rose-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {upcomingAppointments.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">
                                                لا توجد اجتماعات قادمة مجدولة حالياً
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* سجل الاجتماعات المنتهية */}
                    <div className="space-y-6 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <History size={24} className="text-slate-500" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">أرشيف الاجتماعات والنتائج السابقة</h3>
                        </div>

                        <div className="bg-[#050811] rounded-[2rem] border border-white/5 overflow-hidden">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-[#111624] text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">التاريخ واليوم</th>
                                        <th className="px-8 py-5">عنوان الاجتماع</th>
                                        <th className="px-8 py-5">الملخص والقرارات المتخذة</th>
                                        <th className="px-8 py-5 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {finishedAppointments.map((apt) => (
                                        <tr key={apt.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="text-slate-400 font-mono font-bold">{apt.date}</p>
                                                <p className="text-[9px] text-slate-600 font-black uppercase">{getDayName(apt.date)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-white font-black">{apt.title}</p>
                                                <p className="text-[10px] text-slate-500">{apt.location}</p>
                                            </td>
                                            <td className="px-8 py-6 text-emerald-400/80 italic text-xs leading-relaxed max-w-md">
                                                {apt.summary || 'لم يتم تدوين ملخص لهذا الاجتماع'}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button onClick={() => handleDeleteAppointment(apt.id)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================
               3. إدارة قاعدة البيانات
               ========================== */}
            {activeTab === 'database' && (
                <div className="space-y-6">
                    <DatabaseManagement />
                </div>
            )}
        </main>
        
        {/* المودالات */}
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setSelectedItem(null); setUserForm({ allowedEntity: 'FACTORY' }); }} 
            title={
                modalType === 'appointment' ? (selectedItem ? 'تعديل بيانات الاجتماع' : 'جدولة اجتماع جديد') :
                modalType === 'finishAppointment' ? 'تأكيد إتمام الاجتماع' : 
                (userForm.id ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد')
            }
            isRTL={isRTL}
            contentClassName="bg-[#12141a] text-white border border-white/10"
        >
            <div className="space-y-6">
                {modalType === 'appointment' && (
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">عنوان الاجتماع</label>
                            <input type="text" value={aptForm.title} onChange={e => setAptForm({...aptForm, title: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none focus:border-blue-500 font-bold text-center" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">التاريخ</label>
                                <input type="date" value={aptForm.date} onChange={e => setAptForm({...aptForm, date: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none focus:border-blue-500 font-mono text-center" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">الوقت (AM/PM)</label>
                                <select 
                                    value={aptForm.time} 
                                    onChange={e => setAptForm({...aptForm, time: e.target.value})} 
                                    className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none focus:border-blue-500 font-mono text-center cursor-pointer"
                                >
                                    {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">الموقع</label>
                            <input type="text" value={aptForm.location} onChange={e => setAptForm({...aptForm, location: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none focus:border-blue-500 font-bold text-center" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">إضافة المهام المطلوب مناقشتها</label>
                            <div className="flex gap-2 mb-2">
                                <button onClick={addTask} className="bg-emerald-600 p-4 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center text-white"><Plus size={20}/></button>
                                <input type="text" value={currentTask} onChange={e => setCurrentTask(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTask()} className="flex-1 bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none focus:border-emerald-500 text-xs font-bold text-center" />
                            </div>
                            
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {aptForm.tasks?.map((task, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            <ChevronRight size={14} className="text-emerald-500" />
                                            <span className="text-xs font-bold text-slate-300">{task}</span>
                                        </div>
                                        <button onClick={() => setAptForm({...aptForm, tasks: aptForm.tasks?.filter((_, idx) => idx !== i)})} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleSaveAppointment} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 text-xs">
                            {selectedItem ? 'تحديث بيانات الاجتماع' : 'تأكيد وحفظ الموعد'}
                        </button>
                    </div>
                )}

                {modalType === 'user' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">اسم الموظف</label>
                            <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none font-bold text-right" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الدور الوظيفي</label>
                                <input type="text" value={userForm.roleAr} onChange={e => setUserForm({...userForm, roleAr: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none font-bold text-right" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">الصلاحية (الشركة)</label>
                                {/* تم ضبط القيمة الافتراضية هنا أيضاً لضمان ظهور المصنع */}
                                <select 
                                    value={userForm.allowedEntity || 'FACTORY'} 
                                    onChange={e => setUserForm({...userForm, allowedEntity: e.target.value as EntityType})} 
                                    className="w-full bg-[#1a1e2b] border border-white/5 p-4 rounded-xl outline-none font-bold text-right cursor-pointer"
                                >
                                    <option value="FACTORY">مصنع أطباق البيض</option>
                                    <option value="MAKH_GOLD">ماخ بامب للذهب</option>
                                    <option value="MOSQUE">شؤون المساجد</option>
                                    <option value="ALTAQADDUM">شركة التقدم</option>
                                    <option value="FARM">إدارة المزرعة</option>
                                    <option value="BANK">شركاء المصرف</option>
                                    <option value="ALNUKHBA">شركة النخبة</option>
                                    <option value="MASTER">MASTER (وصول كامل)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">كلمة المرور</label>
                            <div className="relative">
                                <input type="text" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full bg-[#1a1e2b] border border-white/5 p-4 pl-10 rounded-xl outline-none font-mono text-center" placeholder="****" />
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                            </div>
                        </div>
                        <button onClick={handleSaveUser} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-lg">
                            {userForm.id ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                        </button>
                    </div>
                )}
            </div>
        </Modal>

        <footer className="max-w-7xl mx-auto mt-20 mb-10 text-center opacity-10 text-[8px] font-black uppercase tracking-[0.5em]">
            Niger Projects Executive Dashboard v12.0
        </footer>
    </div>
  );
};

export default GeneralAdmin;
