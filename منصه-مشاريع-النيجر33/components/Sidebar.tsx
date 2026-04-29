
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Factory, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Contact,
  LogOut,
  X,
  Database
} from 'lucide-react';
import { Language, Staff } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  lang: Language;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  currentUser?: Staff | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, lang, isOpen, setIsOpen, onLogout, currentUser }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
    { id: 'inventory', icon: <Package size={20} />, label: t('inventory') },
    { id: 'production', icon: <Factory size={20} />, label: t('production') },
    { id: 'orders', icon: <ShoppingCart size={20} />, label: t('orders') },
    { id: 'customers', icon: <Contact size={20} />, label: t('customers') },
    { id: 'staff', icon: <Users size={20} />, label: t('staff') },
    { id: 'finance', icon: <DollarSign size={20} />, label: t('finance') },
  ];

  if (currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') {
    menuItems.push({ id: 'database', icon: <Database size={20} />, label: isRTL ? 'إدارة قاعدة البيانات' : 'Database' });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-30 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        md:relative md:translate-x-0 flex flex-col shadow-xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
              E
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">EggFactory</h1>
              <p className="text-xs text-slate-400">System v1.0</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span className={`font-medium ${lang === Language.AR ? 'font-cairo' : 'font-sans'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className={`${lang === Language.AR ? 'font-cairo' : 'font-sans'}`}>
              {t('logout')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
