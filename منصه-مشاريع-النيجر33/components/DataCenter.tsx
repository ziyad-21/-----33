
import React, { useRef, useState } from 'react';
import { FileUp, FileDown, Database, ShieldAlert, CheckCircle2, ClipboardPaste, ArrowRight } from 'lucide-react';
import { Language, RawMaterial, Product, Customer, Staff } from '../types';
import { TRANSLATIONS } from '../constants';
import * as XLSX from 'xlsx';

interface DataCenterProps {
  lang: Language;
  setMaterials: (m: RawMaterial[]) => void;
  setProducts: (p: Product[]) => void;
  setCustomers: (c: Customer[]) => void;
  setStaff: (s: Staff[]) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const DataCenter: React.FC<DataCenterProps> = ({ 
  lang, setMaterials, setProducts, setCustomers, setStaff, showNotification 
}) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pasteText, setPasteText] = useState('');
  const [targetType, setTargetType] = useState<'materials' | 'products' | 'customers' | 'staff' | 'gold'>('materials');

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const data: any[] = XLSX.utils.sheet_to_json(ws);
          
          const name = sheetName.toLowerCase();
          if (name.includes('material') || name.includes('مواد')) setMaterials(data);
          else if (name.includes('product') || name.includes('منتج')) setProducts(data);
          else if (name.includes('customer') || name.includes('عملاء')) setCustomers(data);
          else if (name.includes('staff') || name.includes('موظف')) setStaff(data);
        });

        showNotification(isRTL ? 'تم تحديث قاعدة البيانات بنجاح' : 'Database synchronized successfully', 'success');
      } catch (err) {
        showNotification(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleQuickPaste = () => {
    if (!pasteText.trim()) return;

    try {
      // Logic to parse Tab-Separated Values (TSV) usually from Excel copy-paste
      const rows = pasteText.trim().split('\n');
      const headers = rows[0].split('\t');
      const data = rows.slice(1).map(row => {
        const values = row.split('\t');
        const obj: any = { id: Math.random().toString(36).substr(2, 9) };
        headers.forEach((header, i) => {
          const key = header.trim();
          obj[key] = values[i]?.trim();
        });
        return obj;
      });

      if (targetType === 'materials') setMaterials(data);
      else if (targetType === 'products') setProducts(data);
      else if (targetType === 'customers') setCustomers(data);
      else if (targetType === 'staff') setStaff(data);
      // Note: Gold pasting logic would need 'setGoldTransactions' prop passed down to be fully functional here, 
      // but keeping it simple for now to avoid breaking existing interface significantly.

      setPasteText('');
      showNotification(isRTL ? 'تم معالجة البيانات الملصقة' : 'Pasted data processed', 'success');
    } catch (err) {
      showNotification(isRTL ? 'فشل في تحليل النص الملصق' : 'Failed to parse pasted text', 'error');
    }
  };

  const clearData = () => {
    if (confirm(isRTL ? 'هل أنت متأكد؟ سيتم حذف جميع البيانات المحلية!' : 'Are you sure? This will delete all local data!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('dataCenter')}</h2>
          <p className="text-slate-500 mt-2">{isRTL ? 'إدارة البيانات الضخمة للمصنع بكفاءة.' : 'Efficiently manage factory big data.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Paste Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ClipboardPaste size={24} /></div>
              <h3 className="text-xl font-black">{isRTL ? 'اللصق السريع من إكسل' : 'Quick Paste from Excel'}</h3>
           </div>
           
           <div className="mb-4 flex flex-wrap gap-2">
              {(['materials', 'products', 'customers', 'staff'] as const).map((type) => (
                <button 
                  key={type}
                  onClick={() => setTargetType(type as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${targetType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
           </div>

           <textarea 
             value={pasteText}
             onChange={(e) => setPasteText(e.target.value)}
             placeholder={isRTL ? "انسخ الجدول من إكسل والصقه هنا مباشرة..." : "Copy your Excel table and paste here..."}
             className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-sm font-mono focus:border-blue-500 focus:bg-white outline-none transition-all"
           />

           <button 
             onClick={handleQuickPaste}
             disabled={!pasteText}
             className={`mt-4 w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${pasteText ? 'bg-slate-900 text-white hover:bg-black shadow-xl' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
           >
             {isRTL ? 'تحليل ومعالجة البيانات' : 'Process & Import Data'}
             <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
           </button>
        </div>

        <div className="space-y-6">
            {/* File Sync */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
                <FileUp size={32} className="mb-4 opacity-80" />
                <h3 className="text-xl font-black mb-2">{isRTL ? 'مزامنة ملفات' : 'File Sync'}</h3>
                <p className="text-blue-100 text-xs mb-6 leading-relaxed opacity-80">
                    {isRTL ? 'ارفع ملف إكسل كامل لتحديث كافة الجداول بضغطة واحدة.' : 'Upload a full Excel file to update all tables at once.'}
                </p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportAll} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all"
                >
                    {isRTL ? 'اختر ملف الإكسل' : 'Select Excel File'}
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <ShieldAlert size={32} className="mb-4 text-rose-500" />
                <h3 className="text-xl font-black text-slate-800 mb-2">{isRTL ? 'تصفير النظام' : 'System Reset'}</h3>
                <p className="text-slate-500 text-xs mb-6">
                    {isRTL ? 'سيؤدي هذا لحذف كافة البيانات المسجلة حالياً.' : 'This will wipe all current recorded data.'}
                </p>
                <button 
                    onClick={clearData}
                    className="w-full py-3 border-2 border-rose-200 text-rose-500 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all"
                >
                    {isRTL ? 'مسح كافة البيانات' : 'Wipe Data'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenter;
