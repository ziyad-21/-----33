
export enum Language {
  AR = 'ar',
  FR = 'fr'
}

export type EntityType = 'FACTORY' | 'MOSQUE' | 'ALTAQADDUM' | 'FARM' | 'BANK' | 'MAKH_GOLD' | 'ALNUKHBA' | 'GENERAL_ADMIN' | 'MASTER';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface RawMaterial {
  id: string;
  nameAr: string;
  nameFr: string;
  quantity: number;
  maxQuantity: number;
  unit: string;
  minLevel: number;
  supplier: string;
  price: number;
  lastUpdated: string;
}

export interface Product {
  id: string;
  nameAr: string;
  nameFr: string;
  quantity: number;
  maxQuantity: number;
  unit: string;
  price: number;
  minLevel: number;
  lastUpdated: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  items: any[];
  expectedDeliveryDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Staff {
  id: string;
  name: string;
  roleAr: string;
  roleFr: string;
  salary: number;
  lastPaymentDate: string;
  advanceTaken: number;
  password?: string;
  allowedEntity?: EntityType; 
  loginCount?: number;
  loginHistory?: string[];
}

export interface Expense {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  entityId?: EntityType; 
}

export interface GoldTransaction {
  id: string;
  date: string;
  description: string;
  amountRiyal: number;
  goldWeight: number; 
  karat: number; 
  exchangeRate: number; 
  type: 'purchase' | 'expense' | 'adjustment';
}

export interface Shareholder {
  id: string;
  name: string;
  phone: string;
  numberOfShares: number;
  operatingMonths: number;
  capitalAmount: number;
  percentage: number;
  operatorPercentage: number;
  mediatorPercentage: number;
  profitShare: number;
  mediatorProfit: number;
  operatorProfit: number;
}

export interface BankPartner {
  id: string;
  partner_name: string;
  capital_amount: number;
  deposit_date: string;
  withdrawals: number;
  notes?: string;
}

export interface CapitalTransaction {
  id: string;
  date: string;
  description: string;
  notes: string;
  type: 'income' | 'expense';
  amount: number;
  balanceAfter: number;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  tasks?: string[]; // المهام المضافة لكل اجتماع
  isFinished?: boolean;
  summary?: string;
}

export interface MosqueTransaction {
  id: string;
  date: string;
  description: string;
  amountRiyal: number;
  amountXOF: number;
  type: 'receipt' | 'payment';
}

export interface MosqueStaffReward {
  id: string;
  staffName: string;
  role: string;
  amountXOF: number;
}

export interface MosqueDonation {
  id: string;
  donorName: string;
  date: string;
  amountRiyal: number;
  amountXOF: number;
}

export interface MosqueData {
  id: string;
  name: string;
  transactions: MosqueTransaction[];
  otherExpenses: { description: string, amountXOF: number }[];
  suleimanShare: number;
}

export interface TranslationDictionary {
  [key: string]: {
    ar: string;
    fr: string;
  };
}

export interface EntityInfo {
  id: EntityType;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  descriptionAr: string;
}
