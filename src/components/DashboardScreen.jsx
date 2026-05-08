import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, Receipt, Trash2 } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export default function DashboardScreen({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: 'expense', amount: '', category: 'Makanan', description: '', date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    expense: ['Makanan', 'Transportasi', 'Kos/Kontrakan', 'Tugas Kuliah', 'Hiburan', 'Lainnya'],
    income: ['Uang Saku', 'Gaji Part-time', 'Beasiswa', 'Lainnya']
  };

  useEffect(() => {
    const txCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const unsubscribe = onSnapshot(txCollection, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data.sort((a, b) => b.timestamp - a.timestamp));
    });
    return () => unsubscribe();
  }, [user]);

  const { totalBalance, totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      const amt = Number(curr.amount);
      if (curr.type === 'income') { acc.totalIncome += amt; acc.totalBalance += amt; } 
      else { acc.totalExpense += amt; acc.totalBalance -= amt; }
      return acc;
    }, { totalBalance: 0, totalIncome: 0, totalExpense: 0 });
  }, [transactions]);

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', Date.now().toString()), {
        ...formData, amount: Number(formData.amount), timestamp: Date.now()
      });
      setFormData(prev => ({ ...prev, amount: '', description: '' }));
    } catch (error) { console.error("Gagal menyimpan:", error); }
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id.toString())); } 
    catch (error) { console.error("Gagal menghapus:", error); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5"><Wallet size={80}/></div>
          <div className="flex items-center gap-3 text-slate-500 mb-2 relative"><Wallet size={20} className="text-blue-600"/><h3 className="font-medium">Total Saldo</h3></div>
          <p className={`text-3xl font-bold relative ${totalBalance < 0 ? 'text-rose-600' : 'text-slate-800'}`}>{formatRupiah(totalBalance)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><ArrowDownCircle size={20} className="text-emerald-500"/><h3 className="font-medium">Pemasukan</h3></div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><ArrowUpCircle size={20} className="text-rose-500"/><h3 className="font-medium">Pengeluaran</h3></div>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Plus className="text-blue-600 bg-blue-50 p-1 rounded-lg" size={28} /> Catat Transaksi</h2>
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button type="button" onClick={() => setFormData(p => ({...p, type: 'expense', category: categories['expense'][0]}))} className={`flex-1 py-2 text-sm font-semibold rounded-xl ${formData.type === 'expense' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData(p => ({...p, type: 'income', category: categories['income'][0]}))} className={`flex-1 py-2 text-sm font-semibold rounded-xl ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Pemasukan</button>
              </div>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Nominal (Rp)" />
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                {categories[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Keterangan..." />
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl mt-4">Simpan</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h2 className="text-xl font-bold flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <span className="flex gap-2 items-center"><Receipt className="text-blue-600 bg-blue-50 p-1 rounded-lg" size={28} /> Riwayat</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{transactions.length} Data</span>
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
              {transactions.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-blue-100 rounded-2xl transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {t.type === 'income' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{t.description}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">{t.category} • {new Date(t.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}} />
    </div>
  );
}