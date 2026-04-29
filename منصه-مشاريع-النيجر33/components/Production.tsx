
import React, { useState } from 'react';
import { Package, Plus, Factory, MinusCircle } from 'lucide-react';
import { Language, Product, RawMaterial } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProductionProps {
  lang: Language;
  products: Product[];
  setProducts: (p: Product[]) => void;
  materials: RawMaterial[];
  setMaterials: (m: RawMaterial[]) => void;
  showNotification: (msg: string, type: 'success'|'error') => void;
}

const Production: React.FC<ProductionProps> = ({ lang, products, setProducts, materials, setMaterials, showNotification }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const isRTL = lang === Language.AR;

  // State for Production (Finished Goods)
  const [prodProductId, setProdProductId] = useState('');
  const [prodQuantity, setProdQuantity] = useState('');

  // State for Consumption (Raw Materials)
  const [consMaterialId, setConsMaterialId] = useState('');
  const [consQuantity, setConsQuantity] = useState('');

  const handleSaveProduction = () => {
    // Validate
    if (!prodProductId || !prodQuantity || Number(prodQuantity) <= 0) {
        showNotification(t('error'), 'error');
        return;
    }

    const product = products.find(p => p.id === prodProductId);
    if (!product) return;

    const newQuantity = product.quantity + Number(prodQuantity);

    // Update Local State
    const updatedProducts = products.map(p => {
        if (p.id === prodProductId) {
            return { ...p, quantity: newQuantity };
        }
        return p;
    });
    setProducts(updatedProducts);
    
    // Reset and Notify
    setProdProductId('');
    setProdQuantity('');
    showNotification(t('success'), 'success');
  };

  const handleSaveConsumption = () => {
    // Validate
    if (!consMaterialId || !consQuantity || Number(consQuantity) <= 0) {
        showNotification(t('error'), 'error');
        return;
    }

    const rawMat = materials.find(m => m.id === consMaterialId);
    if (!rawMat) return;
    
    if (rawMat.quantity < Number(consQuantity)) {
        showNotification(t('insufficientRaw'), 'error');
        return;
    }

    const newQuantity = rawMat.quantity - Number(consQuantity);

    // Update Local State
    const updatedMaterials = materials.map(m => {
        if (m.id === consMaterialId) {
            return { ...m, quantity: newQuantity };
        }
        return m;
    });
    setMaterials(updatedMaterials);

    // Reset and Notify
    setConsMaterialId('');
    setConsQuantity('');
    showNotification(t('success'), 'success');
  };

  const getStatusColor = (current: number, max: number) => {
    const pct = max > 0 ? (current / max) * 100 : 0;
    if(pct >= 85) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
    if(pct >= 55) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    if(pct >= 25) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
  };

  return (
    <div className="space-y-8">
      <h2 className={`text-2xl font-bold text-slate-800 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
        {t('production')}
      </h2>

      {/* SECTION 1: PRODUCTION */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-2">{t('dailyProduction')}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('selectProduct')}</label>
                        <select
                            value={prodProductId}
                            onChange={(e) => setProdProductId(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- {t('selectProduct')} --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{lang === Language.AR ? p.nameAr : p.nameFr}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('quantity')}</label>
                        <input 
                            type="number"
                            value={prodQuantity}
                            onChange={(e) => setProdQuantity(e.target.value)}
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={handleSaveProduction}
                        type="button"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        {t('save')}
                    </button>
                </div>
            </div>

            {/* Visual Stock Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
                 {products.map(p => {
                    const colors = getStatusColor(p.quantity, p.maxQuantity);
                    return (
                        <div key={p.id} className={`${colors.bg} ${colors.border} p-4 rounded-lg border flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                            <Package className={`${colors.text} mb-2`} size={24} />
                            <h4 className="font-bold text-slate-700 text-sm z-10">{lang === Language.AR ? p.nameAr : p.nameFr}</h4>
                            <p className={`text-2xl font-bold ${colors.text} mt-1 z-10`}>{p.quantity} <span className="text-xs">{p.unit}</span></p>
                            <p className="text-xs text-slate-400 z-10">{p.quantity} / {p.maxQuantity}</p>
                        </div>
                    );
                 })}
            </div>
          </div>
      </div>

      {/* SECTION 2: CONSUMPTION */}
      <div className="space-y-4 pt-8">
          <h3 className="text-xl font-bold text-orange-800 border-b border-orange-200 pb-2">{t('dailyConsumption')}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('selectMaterial')}</label>
                        <select
                            value={consMaterialId}
                            onChange={(e) => setConsMaterialId(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- {t('selectMaterial')} --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {lang === Language.AR ? m.nameAr : m.nameFr} ({m.quantity} {m.unit})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('materialConsumed')}</label>
                        <input 
                            type="number"
                            value={consQuantity}
                            onChange={(e) => setConsQuantity(e.target.value)}
                            className="w-full border border-slate-300 bg-white text-slate-900 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                    <button
                        onClick={handleSaveConsumption}
                        type="button"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium bg-orange-600 hover:bg-orange-700 shadow-md transition-all active:scale-95"
                    >
                        <MinusCircle size={20} />
                        {t('save')}
                    </button>
                </div>
            </div>

             {/* Visual Raw Material Grid */}
             <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
                 {materials.map(m => {
                    const colors = getStatusColor(m.quantity, m.maxQuantity);

                    return (
                        <div key={m.id} className={`${colors.bg} ${colors.border} p-4 rounded-lg border flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                            <Factory className={`${colors.text} mb-2`} size={24} />
                            <h4 className="font-bold text-slate-700 text-sm z-10">{lang === Language.AR ? m.nameAr : m.nameFr}</h4>
                            <p className={`text-2xl font-bold ${colors.text} mt-1 z-10`}>{m.quantity} <span className="text-xs">{m.unit}</span></p>
                            <p className="text-xs text-slate-400 z-10">{m.quantity} / {m.maxQuantity}</p>
                        </div>
                    );
                })}
            </div>
          </div>
      </div>

    </div>
  );
};

export default Production;
