
import React from 'react';
import { 
  Factory, 
  Building2, 
  Sprout, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  LayoutGrid,
  ChevronLeft,
  Settings,
  Plus,
  Crown,
  Church
} from 'lucide-react';
import { EntityType, Language } from '../types';
import { TRANSLATIONS, ENTITIES } from '../constants';

interface HubProps {
  lang: Language;
  onSelectEntity: (entity: EntityType) => void;
  onLogout: () => void;
}

const iconMap: any = {
  Factory: Factory,       
  Building2: Building2,   
  Sprout: Sprout,         
  Landmark: Landmark,     
  Coins: Coins,           
  ShieldCheck: ShieldCheck, 
  Mosque: Church,         
  Crown: Crown,           
  LayoutGrid: LayoutGrid  
};

const Hub: React.FC<HubProps> = ({ lang, onSelectEntity, onLogout }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  return (
    <div className={`min-h-screen bg-[#050811] text-white p-6 md:p-10 lg:p-12 overflow-y-auto selection:bg-orange-500/30 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Navigation Bar: Corner Controls & Centered Brand */}
      <nav className="max-w-7xl mx-auto relative flex items-center justify-between h-24 mb-16 animate-fade-in-up">
        
        {/* Corner: Logout */}
        <div className="z-10">
            <button 
              onClick={onLogout}
              className="px-6 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl transition-all font-black text-xs border border-rose-600/20 shadow-lg"
            >
              {t('logout')}
            </button>
        </div>

        {/* Center Absolute: Branding Identity */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none">
            <div className="relative mb-2">
                <div className="w-16 h-16 bg-niger-striped rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl border border-white/10 pointer-events-auto">
                    <span className="text-orange-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">NP</span>
                </div>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none whitespace-nowrap">{t('masterTitle')}</h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1 opacity-70 whitespace-nowrap">Enterprise Operating System</p>
        </div>

        {/* Corner: Settings */}
        <div className="z-10">
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white border border-white/5">
                <Settings size={22} />
            </button>
        </div>
      </nav>

      {/* Hero Section: Title and Verse */}
      <div className="max-w-4xl mx-auto text-center mb-24 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
              {isRTL ? 'إدارة مجموعة المشاريع' : 'Project Group Management'}
          </h2>
          
          {/* Quranic Verse - Centered & Small */}
          <div className="flex flex-col items-center">
              <p className="text-lg md:text-xl text-orange-200/90 quran-text font-medium leading-relaxed italic">
                  {isRTL ? 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ' : 'And my success is not but through Allah'}
              </p>
              {isRTL && (
                <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">صدق الله العظيم</p>
              )}
          </div>
      </div>

      {/* Entities Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        {ENTITIES.map((entity, index) => {
          const Icon = iconMap[entity.icon] || LayoutGrid;
          return (
            <button
              key={entity.id}
              onClick={() => onSelectEntity(entity.id)}
              className="group relative glass-card p-10 rounded-[2.5rem] text-right transition-all duration-500 hover:-translate-y-2 hover:bg-secondary/90 hover:shadow-2xl hover:shadow-orange-500/5 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
            >
              {/* Niger Flag Background Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-niger-striped flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border border-white/10 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                    <Icon size={32} className="text-slate-900/80 drop-shadow-[0_1px_0px_rgba(255,255,255,0.4)]" />
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-3 text-white group-hover:text-niger-orange transition-colors duration-300">
                {isRTL ? entity.nameAr : entity.nameEn}
              </h3>
              <p className="text-slate-400 text-sm font-bold line-clamp-2 leading-relaxed mb-10 h-10 opacity-80 group-hover:opacity-100 transition-opacity">
                {entity.descriptionAr}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-niger-orange transition-colors">Open Dashboard</span>
                 <div className="p-2 bg-white/5 rounded-xl group-hover:bg-niger-orange/10 transition-colors">
                    <ChevronLeft className={`text-slate-600 group-hover:text-niger-orange transition-all ${isRTL ? '' : 'rotate-180'} group-hover:-translate-x-1`} size={20} />
                 </div>
              </div>
            </button>
          );
        })}

        {/* Dynamic 'Add' Tile */}
        <div className="group border-2 border-dashed border-white/5 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 hover:border-orange-500/20 hover:bg-orange-500/5 transition-all cursor-pointer animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center mb-6 group-hover:text-niger-orange group-hover:bg-white/10 transition-all border border-white/5">
                <Plus size={34} />
            </div>
            <p className="font-black text-sm text-slate-500 group-hover:text-white uppercase tracking-widest">{isRTL ? 'إضافة مشروع جديد' : 'Add New Project'}</p>
        </div>
      </div>
      
      {/* Decorative Background Glows */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[200px] -z-10 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-green-600/5 rounded-full blur-[180px] -z-10 pointer-events-none opacity-20" />
      
      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto mt-12 mb-6 border-t border-white/5 pt-8 opacity-40 text-[9px] font-black tracking-widest uppercase text-center">
          © 2020 - 2024 NIGER PROJECTS ENTERPRISE OPERATING SYSTEM
      </footer>
    </div>
  );
};

export default Hub;
