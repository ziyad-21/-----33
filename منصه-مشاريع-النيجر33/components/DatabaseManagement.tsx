import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, Server, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// @ts-ignore
const API_URL = (typeof window !== 'undefined' && window.ENV?.API_URL) ? `${window.ENV.API_URL}/api` : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');

const entityNames: Record<string, string> = {
  customers: 'العملاء',
  products: 'المنتجات',
  materials: 'المواد الخام',
  orders: 'الطلبات',
  staff: 'الموظفين',
  expenses: 'المصروفات',
  gold_transactions: 'معاملات الذهب',
  appointments: 'المواعيد',
  farm_data: 'بيانات المزرعة',
  bank_partners: 'الشركاء والبنوك'
};

export default function DatabaseManagement() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [dbSize, setDbSize] = useState<{ bytes: number, mb: number, gb: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/database/stats`);
      if (!response.ok) throw new Error('فشل في جلب الإحصائيات');
      const data = await response.json();
      setStats(data.counts || {});
      setDbSize(data.size || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء جلب إحصائيات قاعدة البيانات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#0a0f1d] p-6 rounded-[2rem] border border-white/5">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          معلومات قاعدة البيانات SQL
        </h2>
        <button
          onClick={fetchStats}
          className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-white/5"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin cursor-not-allowed' : ''}`} />
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl flex items-center gap-4 text-sm font-bold border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <p>{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Info Panel */}
        <div className="bg-[#0a0f1d] p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">معلومات وتفاصيل الخادم</h3>
          
          <div className="space-y-4">
            <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <h4 className="font-black text-emerald-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                <ShieldCheck className="w-5 h-5" />
                تخزين سحابي آمن وتلقائي
              </h4>
              <p className="text-xs text-emerald-400/70 font-bold leading-relaxed">
                النظام متصل بقاعدة بيانات <strong>PostgreSQL S</strong> المتطورة وتم ربطها عبر <strong>معمارية سحابية</strong> بحيث لن تعاني أبداً من فقدان البيانات، السعة التخزينية سحابية وتتمدد حسب استخدامك للمشروع على مدار السنوات القادمة.
              </p>
            </div>

            <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <h4 className="font-black text-blue-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Server className="w-5 h-5" />
                المساحة المستهلكة حالياً
              </h4>
              <div className="flex items-end gap-3 text-white mt-4">
                {loading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  <>
                    <span className="text-5xl font-black font-mono tracking-tighter text-blue-400">{dbSize ? (dbSize.mb < 1 ? dbSize.mb : dbSize.mb) : 0}</span>
                    <span className="text-sm font-bold text-slate-500 mb-2 font-mono uppercase">MegaBytes</span>
                  </>
                )}
              </div>
              {dbSize && dbSize.mb > 0 && (
                 <p className="text-[10px] text-blue-400/60 mt-3 font-bold uppercase tracking-widest">
                 المساحة الدقيقة: {dbSize.gb} GB
               </p>
              )}
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="bg-[#0a0f1d] p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-lg font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6">إحصائيات جداول SQL</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats).map(([key, count]) => (
                <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/10 group">
                  <span className="text-slate-400 font-bold text-xs uppercase group-hover:text-white transition-colors">{entityNames[key] || key}</span>
                  <span className="bg-blue-500/20 text-blue-400 py-1.5 px-4 rounded-xl text-xs font-black font-mono">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
