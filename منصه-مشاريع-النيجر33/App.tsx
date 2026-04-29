import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Menu, ArrowLeft } from 'lucide-react';
// استيراد المكونات الفرعية
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import Customers from './components/Customers';
import StaffView from './components/Staff';
import Production from './components/Production';
import Finance from './components/Finance';
import Login from './components/Login';
import Hub from './components/Hub';
import MakhGold from './components/MakhGold';
import GeneralAdmin from './components/GeneralAdmin';
import MosqueManagement from './components/MosqueManagement';
import FarmManagement, { FarmRecord } from './components/FarmManagement';
import AlTaqaddum from './components/AlTaqaddum'; 
import BankPartners from './components/BankPartners';
import Toast from './components/Toast';
import DatabaseManagement from './components/DatabaseManagement';
// استيراد الأنواع والثوابت
import { Language, Customer, Product, RawMaterial, Order, Staff, Expense, Notification, EntityType, GoldTransaction, Appointment, BankPartner } from './types';
import { TRANSLATIONS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_RAW_MATERIALS, MOCK_ORDERS, MOCK_STAFF, MOCK_EXPENSES, MOCK_GOLD_TRANSACTIONS, MOCK_APPOINTMENTS } from './constants';
import { api } from './apiService';

const App: React.FC = () => {
  // =========================================
  // إدارة حالة التطبيق (State Management)
  // =========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [currentEntity, setCurrentEntity] = useState<EntityType>('MASTER');
  const [currentView, setCurrentView] = useState('dashboard');
  const [lang, setLang] = useState<Language>(Language.AR);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  
  // =========================================
  // بيانات النظام
  // =========================================
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goldTransactions, setGoldTransactions] = useState<GoldTransaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [farmData, setFarmData] = useState<FarmRecord[]>([]);
  const [bankPartners, setBankPartners] = useState<BankPartner[]>([]);
  const [totalBankProfit, setTotalBankProfit] = useState<number>(0);

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  // دالة لعرض الإشعارات
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  }, []);

  // =========================================
  // جلب البيانات من قاعدة البيانات (MySQL)
  // =========================================
  const fetchData = useCallback(async () => {
    setDbStatus('loading');
    try {
      const fetchEntity = async (entity: string) => {
        try {
          return await api.get(entity);
        } catch (e) {
          console.error(`Error fetching ${entity}:`, e);
          return [];
        }
      };

      const [
        dbCustomers, dbProducts, dbMaterials, dbOrders, dbStaff, 
        dbExpenses, dbGold, dbAppointments, dbFarm, dbBank
      ] = await Promise.all([
        fetchEntity('customers'), fetchEntity('products'), fetchEntity('materials'),
        fetchEntity('orders'), fetchEntity('staff'), fetchEntity('expenses'),
        fetchEntity('gold_transactions'), fetchEntity('appointments'),
        fetchEntity('farm_data'), fetchEntity('bank_partners')
      ]);

      // If we got here, at least some fetches worked
      setDbStatus('connected');

      // Handle Staff specifically
      if (dbStaff.length === 0) {
        setStaff(MOCK_STAFF);
        api.bulkSave('staff', MOCK_STAFF);
      } else {
        setStaff(dbStaff.map((s: any) => ({ 
          ...s, 
          loginHistory: typeof s.loginHistory === 'string' ? JSON.parse(s.loginHistory) : (s.loginHistory || []) 
        })));
      }

      // Handle other entities
      setCustomers(dbCustomers.length > 0 ? dbCustomers : MOCK_CUSTOMERS);
      setProducts(dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS);
      setMaterials(dbMaterials.length > 0 ? dbMaterials : MOCK_RAW_MATERIALS);
      setOrders(dbOrders.map((o: any) => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []) })));
      setExpenses(dbExpenses);
      setGoldTransactions(dbGold);
      setAppointments(dbAppointments.map((a: any) => ({ ...a, tasks: typeof a.tasks === 'string' ? JSON.parse(a.tasks) : (a.tasks || []) })));
      setFarmData(dbFarm);
      setBankPartners(dbBank);

    } catch (err) {
      console.error('Critical error fetching data:', err);
      setDbStatus('error');
      showNotification(lang === Language.AR ? 'حدث خطأ أثناء جلب البيانات' : 'Error fetching data', 'error');
    }
  }, [lang, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================
  // حفظ البيانات تلقائياً عند التغيير (Sync to MySQL)
  // =========================================
  useEffect(() => {
    if (customers.length > 0) api.bulkSave('customers', customers);
  }, [customers]);

  useEffect(() => {
    if (products.length > 0) api.bulkSave('products', products);
  }, [products]);

  useEffect(() => {
    if (materials.length > 0) api.bulkSave('materials', materials);
  }, [materials]);

  useEffect(() => {
    if (orders.length > 0) api.bulkSave('orders', orders);
  }, [orders]);

  useEffect(() => {
    if (staff.length > 0) api.bulkSave('staff', staff);
  }, [staff]);

  useEffect(() => {
    if (expenses.length > 0) api.bulkSave('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    if (goldTransactions.length > 0) api.bulkSave('gold_transactions', goldTransactions);
  }, [goldTransactions]);

  useEffect(() => {
    if (appointments.length > 0) api.bulkSave('appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    if (farmData.length > 0) api.bulkSave('farm_data', farmData);
  }, [farmData]);

  useEffect(() => {
    if (bankPartners.length > 0) api.bulkSave('bank_partners', bankPartners);
  }, [bankPartners]);

  // دالة تغيير اللغة
  const toggleLanguage = () => setLang(prev => prev === Language.AR ? Language.FR : Language.AR);
  
  // دالة تسجيل الدخول
  const handleLogin = (user: Staff) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    if (user.allowedEntity && user.allowedEntity !== 'MASTER' && user.allowedEntity !== 'GENERAL_ADMIN') {
        setCurrentEntity(user.allowedEntity);
    } else {
        setCurrentEntity('MASTER');
    }
  };

  // دالة تسجيل الخروج
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentEntity('MASTER');
  };

  // =========================================
  // التوجيه (Routing) وعرض الصفحات
  // =========================================

  // 1. شاشة تسجيل الدخول
  if (!isLoggedIn) return (
    <>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} isRTL={isRTL} />}
      {/* شاشة تسجيل الدخول */}
      <Login 
        lang={lang} 
        onLogin={handleLogin} 
        toggleLanguage={toggleLanguage} 
        staff={staff} 
        showNotification={showNotification} 
        onRefresh={fetchData}
        dbStatus={dbStatus}
      />
    </>
  );

  // 2. المركز الرئيسي (HUB)
  if (currentEntity === 'MASTER') return (
    <>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} isRTL={isRTL} />}
      <Hub lang={lang} onSelectEntity={(e) => { setCurrentEntity(e); setCurrentView('dashboard'); }} onLogout={handleLogout} />
    </>
  );

  // 3. إدارة الذهب (عرض خاص)
  if (currentEntity === 'MAKH_GOLD') return (
    <MakhGold 
      lang={lang} 
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') setCurrentEntity('MASTER'); else handleLogout(); }} 
      goldTransactions={goldTransactions} 
      setGoldTransactions={setGoldTransactions} 
      shareholders={[]} 
      setShareholders={() => {}} 
      showNotification={showNotification} 
    />
  );

  // 4. إدارة المساجد (عرض خاص)
  if (currentEntity === 'MOSQUE') return (
    <MosqueManagement 
      lang={lang} 
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') setCurrentEntity('MASTER'); else handleLogout(); }} 
      showNotification={showNotification} 
    />
  );

  // 5. إدارة المزرعة (عرض خاص)
  if (currentEntity === 'FARM') return (
    <FarmManagement 
      lang={lang} 
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') setCurrentEntity('MASTER'); else handleLogout(); }} 
      showNotification={showNotification}
      farmData={farmData}
      setFarmData={setFarmData}
    />
  );

  // 6. شركة التقدم (عرض خاص - جديد)
  if (currentEntity === 'ALTAQADDUM') return (
    <AlTaqaddum 
      lang={lang} 
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') setCurrentEntity('MASTER'); else handleLogout(); }} 
      showNotification={showNotification}
    />
  );

  // 7. شركاء المصرف (عرض خاص - جديد)
  if (currentEntity === 'BANK') return (
    <BankPartners 
      lang={lang}
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') setCurrentEntity('MASTER'); else handleLogout(); }}
      showNotification={showNotification}
      partners={bankPartners}
      setPartners={setBankPartners}
      totalPortfolioProfit={totalBankProfit}
      setTotalPortfolioProfit={setTotalBankProfit}
    />
  );

  // 8. الإدارة العامة (عرض خاص)
  if (currentEntity === 'GENERAL_ADMIN') return (
    <GeneralAdmin 
      lang={lang} 
      onLogout={() => { if(currentUser?.allowedEntity === 'MASTER') setCurrentEntity('MASTER'); else handleLogout(); }} 
      expenses={expenses} 
      goldTransactions={goldTransactions} 
      orders={orders} 
      staff={staff} 
      setStaff={setStaff} 
      appointments={appointments} 
      setAppointments={setAppointments} 
      showNotification={showNotification} 
      currentUser={currentUser} 
    />
  );

  // 9. لوحة التحكم الافتراضية للمصنع (FACTORY)
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard lang={lang} setCurrentView={setCurrentView} orders={orders} staff={staff} expenses={expenses} materials={materials} products={products} />;
      case 'inventory': return <Inventory lang={lang} materials={materials} setMaterials={setMaterials} products={products} setProducts={setProducts} expenses={expenses} setExpenses={setExpenses} showNotification={showNotification} onRestockMaterial={() => {}} />;
      case 'orders': return <Orders lang={lang} customers={customers} orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} expenses={expenses} setExpenses={setExpenses} showNotification={showNotification} />;
      case 'customers': return <Customers lang={lang} customers={customers} setCustomers={setCustomers} showNotification={showNotification} />;
      case 'staff': return <StaffView lang={lang} staff={staff} setStaff={setStaff} onPaySalary={() => {}} onRequestAdvance={() => {}} showNotification={showNotification} refreshData={() => {}} />;
      case 'production': return <Production lang={lang} products={products} setProducts={setProducts} materials={materials} setMaterials={setMaterials} showNotification={showNotification} />;
      case 'finance': return <Finance lang={lang} expenses={expenses} setExpenses={setExpenses} orders={orders} showNotification={showNotification} />;
      case 'database': return <DatabaseManagement />;
      default: return <Dashboard lang={lang} setCurrentView={setCurrentView} />;
    }
  };

  return (
    // Updated Main Layout to Dark Theme
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`flex h-screen bg-[#02040a] text-slate-100 overflow-hidden ${isRTL ? 'font-cairo' : 'font-sans'}`}>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} isRTL={isRTL} />}
      
      {/* القائمة الجانبية */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} lang={lang} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} currentUser={currentUser} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* الشريط العلوي - Dark Mode */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 print:hidden">
          <div className="flex items-center gap-6">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white"><Menu size={24} /></button>
             
             {/* إظهار زر العودة للمركز الرئيسي فقط للإدارة العليا */}
             {(currentUser?.allowedEntity === 'MASTER' || currentUser?.allowedEntity === 'GENERAL_ADMIN') && (
                <button onClick={() => setCurrentEntity('MASTER')} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold text-sm transition-all">
                  <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                  {t('backToHub')}
                </button>
             )}
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:block text-sm text-slate-400 font-bold">
                {lang === Language.AR ? `أهلاً، ${currentUser?.name || 'مستخدم'}` : `Welcome, ${currentUser?.name || 'User'}`}
             </div>
             <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all text-xs font-bold border border-white/5">
               <Globe size={14} />
               {lang === Language.AR ? 'Français' : 'العربية'}
             </button>
             <h2 className="hidden md:flex items-center gap-2 text-sm font-black text-white">
               {currentView === 'database' ? (isRTL ? 'إدارة قاعدة البيانات' : 'Database Management') : t(currentView)}
             </h2>
          </div>
        </header>

        {/* المحتوى الرئيسي - Dark Background */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#02040a]">
          <div className="max-w-7xl mx-auto h-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;