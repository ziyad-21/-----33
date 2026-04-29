
import React, { useState } from 'react';
import { Search, Plus, UserPlus, DollarSign, Wallet, Trash2, ShieldCheck, MoreVertical, Edit, Eye, EyeOff } from 'lucide-react';
import { Language, Staff } from '../types';
import { TRANSLATIONS } from '../constants';
import Modal from './Modal';

interface StaffProps {
  lang: Language;
  staff: Staff[];
  setStaff: (s: Staff[]) => void;
  onPaySalary: (id: string) => void;
  onRequestAdvance: (id: string, amount: number) => void;
  showNotification: (msg: string, type: 'success'|'error') => void;
  refreshData: () => void;
}

const StaffView: React.FC<StaffProps> = ({ lang, staff, setStaff, onPaySalary, onRequestAdvance, showNotification, refreshData }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    roleAr: '', 
    roleFr: '', 
    salary: 0, 
    password: '' 
  });

  const handleAddStaff = () => {
    try {
        if(!newStaff.name.trim() || !newStaff.password.trim()) {
            showNotification(lang === Language.AR ? 'الاسم وكلمة المرور مطلوبة' : 'Nom et mot de passe requis', 'error');
            return;
        }

        const addedStaff: Staff = {
            id: Math.random().toString(36).substr(2, 9),
            name: newStaff.name.trim(),
            roleAr: newStaff.roleAr.trim() || (lang === Language.AR ? 'موظف' : 'Employé'),
            roleFr: newStaff.roleFr.trim() || 'Employé',
            salary: Number(newStaff.salary) || 0,
            lastPaymentDate: '-',
            advanceTaken: 0,
            password: newStaff.password.trim()
        };
        
        setStaff([...staff, addedStaff]);
        showNotification(t('success'), 'success');

        setIsModalOpen(false);
        setNewStaff({ name: '', roleAr: '', roleFr: '', salary: 0, password: '' });
        refreshData(); 
    } catch(e: any) {
        showNotification(t('error'), 'error');
    }
  }

  const handleDeleteStaff = (id: string) => {
      if (confirm(lang === Language.AR ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Supprimer cet employé ?')) {
          setStaff(staff.filter(s => s.id !== id));
          showNotification(t('success'), 'success');
      }
  }

  const handleRequestAdvance = () => {
      if(!selectedStaffId || advanceAmount <= 0) return;
      onRequestAdvance(selectedStaffId, Number(advanceAmount));
      setIsAdvanceModalOpen(false);
      setAdvanceAmount(0);
      setSelectedStaffId(null);
  }

  const handleSaveEdit = () => {
    if (!editingStaff) return;
    setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
    showNotification(t('success'), 'success');
    setIsEditModalOpen(false);
    setEditingStaff(null);
    refreshData();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
          {t('staff')}
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <UserPlus size={18} />
          <span>{lang === Language.AR ? 'موظف جديد' : 'Nouvel employé'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('name')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('role')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('salary')}</th>
                 <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('advance')}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{lang === Language.AR ? 'آخر راتب' : 'Dernier paiement'}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((emp: Staff) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className={`px-6 py-4 text-sm font-medium text-slate-900 ${isRTL ? 'text-right' : 'text-left'}`}>{emp.name}</td>
                  <td className={`px-6 py-4 text-sm text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {lang === Language.AR ? emp.roleAr : emp.roleFr}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}>{emp.salary} SAR</td>
                  <td className={`px-6 py-4 text-sm text-red-500 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{emp.advanceTaken > 0 ? `-${emp.advanceTaken}` : '-'}</td>
                  <td className={`px-6 py-4 text-sm text-slate-500 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>
                    {emp.lastPaymentDate || '-'}
                  </td>
                  <td className={`px-6 py-4 text-sm relative ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === emp.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenuId(null)}
                        ></div>
                        <div className={`absolute z-20 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 ${isRTL ? 'left-0' : 'right-0'}`}>
                          {/* Arrow */}
                          <div className={`absolute -top-2 ${isRTL ? 'left-4' : 'right-4'} w-4 h-4 bg-white rotate-45 border-t border-l border-slate-100`}></div>
                          
                          <div className="relative bg-white rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {lang === Language.AR ? 'خيارات المستخدم' : 'Options Utilisateur'}
                               </span>
                            </div>
                            
                            <div className="p-1">
                              <button 
                                onClick={() => { handleDeleteStaff(emp.id); setActiveMenuId(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                              >
                                <Trash2 size={16} className="text-red-400 group-hover:text-red-600" />
                                <span className="font-bold">{lang === Language.AR ? 'حذف الموظف نهائياً' : 'Supprimer l\'employé'}</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1 mx-2"></div>

                              <button 
                                onClick={() => { setEditingStaff(emp); setIsEditModalOpen(true); setActiveMenuId(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
                              >
                                <Edit size={16} className="text-slate-400 group-hover:text-blue-500" />
                                <span className="font-medium">{lang === Language.AR ? 'تعديل البيانات والصلاحيات' : 'Modifier les données'}</span>
                              </button>

                            <button 
                              onClick={() => { 
                                alert(lang === Language.AR ? `كلمة مرور ${emp.name} هي: ${emp.password}` : `Le mot de passe de ${emp.name} est: ${emp.password}`);
                                setActiveMenuId(null); 
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
                            >
                              <Eye size={16} className="text-slate-400 group-hover:text-blue-500" />
                              <span className="font-medium">{lang === Language.AR ? 'إظهار كلمة المرور' : 'Afficher le mot de passe'}</span>
                            </button>

                            <div className="h-px bg-slate-100 my-1 mx-2"></div>

                            <button 
                              onClick={() => { onPaySalary(emp.id); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors group"
                            >
                              <DollarSign size={16} className="text-slate-400 group-hover:text-green-500" />
                              <span className="font-medium">{t('paySalary')}</span>
                            </button>
                            
                            <button 
                              onClick={() => { setSelectedStaffId(emp.id); setIsAdvanceModalOpen(true); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors group"
                            >
                              <Wallet size={16} className="text-slate-400 group-hover:text-orange-500" />
                              <span className="font-medium">{t('requestAdvance')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={lang === Language.AR ? 'موظف جديد' : 'Nouvel employé'}
        isRTL={isRTL}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
             <ShieldCheck className="text-blue-600" size={24} />
             <div className="text-xs text-slate-600">
                {lang === Language.AR ? 'تأكد من إدخال اسم الموظف وكلمة مرور سهلة ليتمكن من الدخول للنظام.' : 'Assurez-vous de saisir le nom et un mot de passe simple.'}
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
            <input 
               type="text" 
               className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
               value={newStaff.name}
               onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
               placeholder={lang === Language.AR ? 'الاسم الكامل' : 'Nom complet'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role (Ar)</label>
                <input 
                   type="text" 
                   className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                   value={newStaff.roleAr}
                   onChange={(e) => setNewStaff({...newStaff, roleAr: e.target.value})}
                   placeholder="فني، مدير.."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role (Fr)</label>
                <input 
                   type="text" 
                   className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                   value={newStaff.roleFr}
                   onChange={(e) => setNewStaff({...newStaff, roleFr: e.target.value})}
                   placeholder="Opérateur.."
                />
              </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('salary')}</label>
            <input 
               type="number" 
               className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
               value={newStaff.salary}
               onChange={(e) => setNewStaff({...newStaff, salary: Number(e.target.value)})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
            <input 
               type="text" 
               className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
               value={newStaff.password}
               onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
               placeholder="1234"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              {t('cancel')}
            </button>
            <button onClick={handleAddStaff} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg font-bold transition-all">
              {t('save')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title={t('requestAdvance')}
        isRTL={isRTL}
      >
           <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('amount')}</label>
                <input 
                   type="number" 
                   className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                   value={advanceAmount}
                   onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button onClick={() => setIsAdvanceModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">
                  {t('cancel')}
                </button>
                <button onClick={handleRequestAdvance} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {t('save')}
                </button>
              </div>
           </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={lang === Language.AR ? 'تعديل بيانات الموظف' : 'Modifier les informations'}
        isRTL={isRTL}
      >
        {editingStaff && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role (Ar)</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingStaff.roleAr}
                    onChange={(e) => setEditingStaff({...editingStaff, roleAr: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role (Fr)</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingStaff.roleFr}
                    onChange={(e) => setEditingStaff({...editingStaff, roleFr: e.target.value})}
                  />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('salary')}</label>
              <input 
                type="number" 
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={editingStaff.salary}
                onChange={(e) => setEditingStaff({...editingStaff, salary: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={editingStaff.password}
                onChange={(e) => setEditingStaff({...editingStaff, password: e.target.value})}
              />
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button 
                onClick={() => { handleDeleteStaff(editingStaff.id); setIsEditModalOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-bold"
              >
                <Trash2 size={16} />
                {lang === Language.AR ? 'حذف الموظف' : 'Supprimer'}
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                  {t('cancel')}
                </button>
                <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg font-bold transition-all">
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffView;
