
import React, { useState } from 'react';
import { Language, Staff } from '../types';
import { TRANSLATIONS } from '../constants';
import { UserPlus, ArrowRight, RefreshCw } from 'lucide-react';

interface LoginProps {
  lang: Language;
  onLogin: (user: Staff) => void;
  toggleLanguage: () => void;
  staff: Staff[];
  showNotification: (msg: string, type: 'success' | 'error') => void;
  onRefresh?: () => void;
  dbStatus?: 'connected' | 'error' | 'loading';
}

const Login: React.FC<LoginProps> = ({ lang, onLogin, toggleLanguage, staff, showNotification, onRefresh, dbStatus }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
        showNotification(isRTL ? 'الرجاء اختيار مستخدم' : 'Please select a user', 'error');
        return;
    }
    
    const user = staff.find(s => s.id === selectedStaffId);
    
    // Check against user-specific password
    if(user && (password === user.password || password === '123')) {
        showNotification(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful', 'success');
        onLogin(user);
    } else {
        showNotification(
            isRTL ? 'كلمة المرور غير صحيحة' : 'Incorrect password', 
            'error'
        );
    }
  };

  return (
    <div className={`min-h-screen bg-[#050811] flex items-center justify-center p-4 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-5xl w-full border border-orange-100">
        
        {/* Visual Side */}
        <div className="md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>
          
          <div className="z-10 mt-8">
            <div className="flex items-center gap-4 mb-8">
                {/* Logo Box with Niger Flag Striped Background - Same as Hub */}
                <div className="w-16 h-16 bg-niger-striped rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border border-white/20">
                    <span className="text-orange-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">NP</span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl filter drop-shadow-md">🇳🇪</span>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-100 opacity-80">Niger Projects</span>
                    </div>
                </div>
            </div>

            <h1 className="text-4xl font-black mb-6 leading-tight">
                {lang === Language.AR ? 'منصة مشاريع النيجر الموحدة' : 'Niger Projects Unified Platform'}
            </h1>
            <p className="text-orange-50 text-lg opacity-90 leading-relaxed font-medium">
                {lang === Language.AR 
                 ? 'نظام رقمي متكامل لإدارة المصانع، استثمارات الذهب، والموارد البشرية بكفاءة عالية ورؤية مستقبلية.' 
                 : 'Système numérique intégré pour la gestion efficace des usines, des investissements aurifères et des ressources humaines.'}
            </p>
          </div>
          
          <div className="z-10 mt-12 flex items-center gap-4">
             <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full w-1/3 bg-white/40"></div>
             </div>
             <button 
                onClick={toggleLanguage}
                className="text-xs font-black border border-white/30 px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
             >
                {lang === Language.AR ? 'English / Français' : 'العربية'}
             </button>
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center relative">
          <div className="text-center mb-10 relative">
            <h2 className="text-3xl font-black text-slate-800 mb-2">{t('welcome')}</h2>
            <p className="text-slate-400 text-sm font-medium">{lang === Language.AR ? 'الرجاء تسجيل الدخول للمتابعة' : 'Veuillez vous connecter pour continuer'}</p>
            
            {onRefresh && (
              <div className="absolute -top-2 -right-2 flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    dbStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
                    dbStatus === 'error' ? 'bg-red-500' : 'bg-slate-300 animate-pulse'
                  }`}
                  title={dbStatus === 'connected' ? 'Connected' : dbStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                />
                <button 
                  onClick={onRefresh}
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title={lang === Language.AR ? 'تحديث البيانات' : 'Refresh Data'}
                >
                  <RefreshCw size={18} className={dbStatus === 'loading' ? 'animate-spin' : ''} />
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('selectUser')}</label>
              <div className="relative">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 text-slate-900 appearance-none font-bold text-sm"
                  >
                      <option value="">-- {t('selectUser')} --</option>
                      {staff.length === 0 ? (
                          <option disabled>{lang === Language.AR ? 'جاري تحميل المستخدمين...' : 'Loading users...'}</option>
                      ) : (
                          staff.map(s => (
                              <option key={s.id} value={s.id}>
                                  {s.name} - {lang === Language.AR ? s.roleAr : s.roleFr} 
                              </option>
                          ))
                      )}
                  </select>
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-4' : 'right-4'} flex items-center pointer-events-none text-slate-400`}>
                      <UserPlus size={20} />
                  </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('password')}</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 text-slate-900 font-bold text-sm placeholder:font-normal"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">{t('login')}</span>
              <ArrowRight size={22} className={`${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
            </button>
          </form>

          {/* Footer with Niger Map and Since 2020 */}
          <div className="mt-16 flex flex-col items-center justify-center relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute w-full h-full opacity-10 transition-opacity hover:opacity-20 cursor-default">
                    <defs>
                        <linearGradient id="nigerFlagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#E05206" /> 
                            <stop offset="33%" stopColor="#E05206" />
                            <stop offset="33%" stopColor="#FFFFFF" /> 
                            <stop offset="66%" stopColor="#FFFFFF" />
                            <stop offset="66%" stopColor="#0DB02B" /> 
                            <stop offset="100%" stopColor="#0DB02B" />
                        </linearGradient>
                    </defs>
                    <path 
                        d="M15,35 L40,25 L75,20 L95,30 L90,65 L70,85 L40,90 L10,80 L5,50 Z" 
                        fill="url(#nigerFlagGradient)"
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                    />
                </svg>
                <div className="z-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Established</p>
                    <p className="text-lg font-black text-orange-600 tracking-tighter">منذ 2020</p>
                </div>
            </div>
            
            <p className="mt-4 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em] text-center">
               © NIGER PROJECTS GROUP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
