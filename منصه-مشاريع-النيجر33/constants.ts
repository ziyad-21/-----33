
import { EntityInfo, TranslationDictionary, EntityType, Shareholder, GoldTransaction, CapitalTransaction, Appointment } from './types';

export const ENTITIES: EntityInfo[] = [
  { id: 'GENERAL_ADMIN', nameAr: 'الإدارة العامة للمجموعة', nameEn: 'General Administration', icon: 'Crown', color: 'slate', descriptionAr: 'لوحة تحكم المالك: المصاريف العامة، الأرباح المجمعة، والرقابة.' },
  { id: 'FACTORY', nameAr: 'مصنع أطباق البيض', nameEn: 'Egg Carton Factory', icon: 'Factory', color: 'blue', descriptionAr: 'إدارة الإنتاج، المواد الخام، والمبيعات.' },
  { id: 'MAKH_GOLD', nameAr: 'ماخ بامب للذهب', nameEn: 'Makh Pump Gold', icon: 'Coins', color: 'amber', descriptionAr: 'تجارة الذهب، أسهم الشركة، والمصاريف.' },
  { id: 'MOSQUE', nameAr: 'شؤون المساجد', nameEn: 'Mosque Management', icon: 'Mosque', color: 'emerald', descriptionAr: 'مصروفات المساجد، بناء، ورواتب العمال.' },
  { id: 'ALTAQADDUM', nameAr: 'شركة التقدم', nameEn: 'Al-Taqaddum Co.', icon: 'Building2', color: 'indigo', descriptionAr: 'مساهمو الشركة والبرامج الداخلية.' },
  { id: 'FARM', nameAr: 'إدارة المزرعة', nameEn: 'Farm Management', icon: 'Sprout', color: 'green', descriptionAr: 'متابعة مصروفات الزرع والإنتاج الزراعي.' },
  { id: 'BANK', nameAr: 'شركاء المصرف', nameEn: 'Bank Partners', icon: 'Landmark', color: 'slate', descriptionAr: 'إدارة الشراكات Bank partners.' },
  { id: 'ALNUKHBA', nameAr: 'شركة النخبة', nameEn: 'Al-Nukhba Co.', icon: 'ShieldCheck', color: 'purple', descriptionAr: 'إدارة المساهمين والعمليات الاستراتيجية.' },
];

export const TRANSLATIONS: TranslationDictionary = {
  masterTitle: { ar: 'مشاريع النيجر', fr: 'Projets Niger' },
  selectEntity: { ar: 'اختر المشروع للإدارة', fr: 'Choisir le projet' },
  backToHub: { ar: 'العودة للمركز الرئيسي', fr: 'Retour au Hub' },
  dashboard: { ar: 'لوحة القيادة', fr: 'Tableau de bord' },
  inventory: { ar: 'المخزون', fr: 'Inventaire' },
  production: { ar: 'الإنتاج والتشغيل', fr: 'Production' },
  orders: { ar: 'المبيعات والطلبات', fr: 'Ventes et Commandes' },
  staff: { ar: 'شؤون الموظفين', fr: 'Personnel' },
  customers: { ar: 'قاعدة العملاء', fr: 'Clients' },
  finance: { ar: 'الالمالية والمصروفات', fr: 'Finance' },
  reports: { ar: 'التقارير', fr: 'Rapports' },
  settings: { ar: 'الإعدادات', fr: 'Paramètres' },
  dataCenter: { ar: 'مركز البيانات', fr: 'Centre de Données' },
  importExcel: { ar: 'استيراد من إكسل', fr: 'Importer Excel' },
  exportExcel: { ar: 'تصدير إلى إكسل', fr: 'Exporter Excel' },
  logout: { ar: 'خروج', fr: 'Déconnexion' },
  login: { ar: 'دخول', fr: 'Connexion' },
  welcome: { ar: 'منصة مشاريع النيجر الموحدة', fr: 'Plateforme Niger Projets' },
  totalProduction: { ar: 'إجمالي الإنتاج', fr: 'Production Totale' },
  totalSales: { ar: 'إجمالي المبيعات', fr: 'Ventes Totales' },
  lowStock: { ar: 'تنبيهات المخزون', fr: 'Alerte Stock' },
  netProfit: { ar: 'الرصيد المالي', fr: 'Profit Net' },
  search: { ar: 'بحث سريع...', fr: 'Recherche rapide...' },
  save: { ar: 'حفظ', fr: 'Enregistrer' },
  cancel: { ar: 'إلغاء', fr: 'Annuler' },
  dailyPerformance: { ar: 'الأداء اليومي', fr: 'Performance Quotidienne' },
  calendarEvents: { ar: 'أحداث التقويم', fr: 'Événements' },
  salaryDate: { ar: 'موعد الرواتب', fr: 'Date de Salaire' },
  dailyProduction: { ar: 'الإنتاج اليومي', fr: 'Production Journalière' },
  invoice: { ar: 'فاتورة', fr: 'Facture' },
  item: { ar: 'الصنف', fr: 'Article' },
  printInvoice: { ar: 'طباعة الفاتورة', fr: 'Imprimer' },
  all: { ar: 'الكل', fr: 'Tout' },
  status_PENDING: { ar: 'قيد الانتظار', fr: 'En attente' },
  status_PROCESSING: { ar: 'قيد التنفيذ', fr: 'En cours' },
  status_COMPLETED: { ar: 'مكتمل', fr: 'Terminé' },
  status_CANCELLED: { ar: 'ملغي', fr: 'Annulé' },
  unknown: { ar: 'غير معروف', fr: 'Inconnu' },
  available: { ar: 'متوفر', fr: 'Disponible' },
  good: { ar: 'جيد', fr: 'Bon' },
  low: { ar: 'منخفض', fr: 'Bas' },
  critical: { ar: 'حرج', fr: 'Critique' },
  unit: { ar: 'الوحدة', fr: 'Unité' },
  edit: { ar: 'تعديل', fr: 'Modifier' },
  name: { ar: 'الاسم', fr: 'Nom' },
  quantity: { ar: 'الكمية', fr: 'Quantité' },
  maxQuantity: { ar: 'الحد الأقصى', fr: 'Max' },
  actions: { ar: 'إجراءات', fr: 'Actions' },
  status: { ar: 'الحالة', fr: 'Statut' },
  role: { ar: 'الدور', fr: 'Rôle' },
  salary: { ar: 'الراتب', fr: 'Salaire' },
  advance: { ar: 'سلفة', fr: 'Avance' },
  amount: { ar: 'المبلغ', fr: 'Montant' },
  paySalary: { ar: 'صرف الراتب', fr: 'Payer' },
  requestAdvance: { ar: 'طلب سلفة', fr: 'Demander une avance' },
  selectProduct: { ar: 'اختر المنتج', fr: 'Sélectionner le produit' },
  usedMaterial: { ar: 'المواد المستهلكة', fr: 'Matériaux utilisés' },
  finishedGoods: { ar: 'المنتجات الجاهزة', fr: 'Produits finis' },
  rawMaterials: { ar: 'المواد الخام', fr: 'Matières premières' },
  insufficientRaw: { ar: 'نقص في المواد الخام', fr: 'Matières insuffisantes' },
  addExpense: { ar: 'إضافة مصروف', fr: 'Ajouter dépense' },
  income: { ar: 'الدخل', fr: 'Revenu' },
  expenses: { ar: 'المصروفات', fr: 'Dépenses' },
  utility: { ar: 'خدمات', fr: 'Utilités' },
  maintenance: { ar: 'صيانة', fr: 'Maintenance' },
  other: { ar: 'أخرى', fr: 'Autre' },
  specifyOther: { ar: 'حدد أخرى', fr: 'Spécifier' },
  selectUser: { ar: 'اختر المستخدم', fr: 'Utilisateur' },
  password: { ar: 'كلمة المرور', fr: 'Mot de passe' },
  newUser: { ar: 'مستخدم جديد؟', fr: 'Nouvel utilisateur?' },
  total: { ar: 'الإجمالي', fr: 'Total' },
  customer: { ar: 'الزبون', fr: 'Client' },
  date: { ar: 'التاريخ', fr: 'Date' },
  newCustomer: { ar: 'زبون جديد', fr: 'Nouveau Client' },
  selectCustomer: { ar: 'اختر الزبون', fr: 'Choisir le client' },
  insufficientStock: { ar: 'المخزون غير كافٍ', fr: 'Stock insuffisant' },
  phone: { ar: 'الهاتف', fr: 'Téléphone' },
  email: { ar: 'الإيميل', fr: 'Email' },
  address: { ar: 'العنوان', fr: 'Adresse' },
  add: { ar: 'إضافة', fr: 'Ajouter' },
  error: { ar: 'خطأ', fr: 'Erreur' },
  success: { ar: 'نجاح', fr: 'Succès' },
  aiInsights: { ar: 'رؤى الذكاء الاصطناعي', fr: 'Aperçوس IA' },
  aiAnalyzing: { ar: 'جاري التحليل...', fr: 'Analyse en cours...' },
  aiAssistant: { ar: 'المساعد الذكي', fr: 'Assistant Intelligent' },
  aiAskPlaceholder: { ar: 'اسألني أي شيء عن المصنع...', fr: 'Demandez-moi n\'importe quoi...' },
  monthlyOverview: { ar: 'نظرة شهرية', fr: 'Aperçu mensuel' },
  purchaseMaterial: { ar: 'شراء مواد', fr: 'Achat de matériel' },
  addedQuantity: { ar: 'الكمية المضافة', fr: 'Quantité ajoutée' },
  totalCost: { ar: 'التكلفة الإجمالية', fr: 'Coût total' },
  expectedDelivery: { ar: 'التسليم المتوقع', fr: 'Livraison prévue' },
  confirm: { ar: 'تأكيد', fr: 'Confirmer' },
  orderType: { ar: 'نوع الطلب', fr: 'Type de commande' },
  delete: { ar: 'حذف', fr: 'Supprimer' },
  
  // Gold Specific
  goldProgram: { ar: 'برنامج شراء الذهب', fr: 'Programme d\'Or' },
  shareholders: { ar: 'الأسهم والشركاء', fr: 'Actionnaires' },
  capitalManagement: { ar: 'إدارة رأس المال', fr: 'Gestion du capital' },
  weight: { ar: 'الوزن (جرام)', fr: 'Poids (g)' },
  karat: { ar: 'العيار', fr: 'Carat' },
  exchangeRate: { ar: 'سعر الصرف', fr: 'Taux de change' },
  capital: { ar: 'رأس المال', fr: 'Capital' },
  percentage: { ar: 'النسبة', fr: 'Pourcentage' },
  profitShare: { ar: 'حصة الربح', fr: 'Part des bénéfices' },
  description: { ar: 'البيان', fr: 'Description' },
  notes: { ar: 'ملاحظات', fr: 'Notes' },
  balance: { ar: 'الرصيد/الصندوق', fr: 'Solde' },
  sharesCount: { ar: 'عدد الأسهم', fr: 'Nombre d\'actions' },
  mediator: { ar: 'الوسيط', fr: 'Médiateur' },
  operator: { ar: 'المشغل', fr: 'Opérateur' },
  livePrices: { ar: 'الأسعار الحية', fr: 'Prix en direct' },
  generalExpenses: { ar: 'المصاريف العامة المجمعة', fr: 'Dépenses Générales' },
  projectsSummary: { ar: 'ملخص المشاريع', fr: 'Résumé des projets' },
  
  // Appointment & User Management
  usersManagement: { ar: 'إدارة المستخدمين', fr: 'Gestion des utilisateurs' },
  appointments: { ar: 'المواعيد والاجتماعات', fr: 'Rendez-vous' },
  allowedEntity: { ar: 'الصلاحية (الشركة)', fr: 'Entité autorisée' },
  allAccess: { ar: 'وصول كامل (مدير عام)', fr: 'Accès complet' },
  location: { ar: 'المكان', fr: 'Lieu' },
  time: { ar: 'الوقت', fr: 'Temps' },
  title: { ar: 'العنوان', fr: 'Titre' },
};

export const MOCK_CUSTOMERS = [
  { id: 'c-1', name: 'مزارع القصيم للدواجن', phone: '0505123456', email: 'info@qassimfarms.com', address: 'القصيم - المدينة الصناعية' }
];
export const MOCK_RAW_MATERIALS = [
  { id: 'mat-1', nameAr: 'ورق كرتون معاد تدويره', nameFr: 'Papier recyclé', quantity: 4500, maxQuantity: 5000, unit: 'kg', minLevel: 1000, supplier: 'Saudi Paper Co.', price: 1.2 }
];
export const MOCK_PRODUCTS = [
  { id: 'prod-1', nameAr: 'طبق بيض (30 بيضة)', nameFr: 'Plateau Œufs (30)', quantity: 15000, maxQuantity: 20000, unit: 'plate', price: 0.5 }
];
export const PRODUCT_RECIPES = [
  { productId: 'prod-1', ingredients: [{ materialId: 'mat-1', quantityPerUnit: 0.08 }] }
];
export const MOCK_ORDERS = [];
export const MOCK_STAFF = [
  { id: 's-1', name: 'زياد سليمان', roleAr: 'مدير النظام', roleFr: 'Admin', salary: 20000, lastPaymentDate: '-', advanceTaken: 0, password: '123', allowedEntity: 'MASTER' },
  { id: 's-2', name: 'مدير المصنع', roleAr: 'مدير تشغيل', roleFr: 'Manager', salary: 5000, lastPaymentDate: '-', advanceTaken: 0, password: '123', allowedEntity: 'FACTORY' },
  { id: 's-3', name: 'أمين المستودع', roleAr: 'أمين مستودع', roleFr: 'Storekeeper', salary: 3000, lastPaymentDate: '-', advanceTaken: 0, password: '123', allowedEntity: 'FACTORY' }
];
export const MOCK_EXPENSES = [];

export const MOCK_GOLD_TRANSACTIONS: GoldTransaction[] = [
  { id: 'g-1', date: '2025-10-05', description: 'تحويل مبلغ لشراء ذهب - يعقوب 17.80 جرام', amountRiyal: 885560, goldWeight: 17.80, karat: 21, exchangeRate: 3237, type: 'purchase' },
];

export const MOCK_CAPITAL_TRANSACTIONS: CapitalTransaction[] = [
  { id: 'cap-1', date: '2024-02-18', description: 'المبلغ الأول - صرف 6060', notes: 'بداية التشغيل', type: 'income', amount: 2475000, balanceAfter: 2475000 },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'apt-1', 
    title: 'Decision making meeting', 
    date: '2022-06-04', 
    time: '09:30 AM', 
    location: 'Conference room', 
    tasks: ['Finalize Q3 production target', 'Review HR budget for Niger group'] 
  },
  { 
    id: 'apt-2', 
    title: 'Creative planning and brainstorming', 
    date: '2022-06-07', 
    time: '10:00 AM', 
    location: 'Meeting room - 3', 
    tasks: ['New carton designs review', 'Discuss recycling partners expansion'] 
  },
  { 
    id: 'apt-3', 
    title: 'Collaborative and planning meeting', 
    date: '2022-06-11', 
    time: '12:00 PM', 
    location: 'Conference room', 
    tasks: ['Supply chain optimization', 'Logistics route review'] 
  },
];
