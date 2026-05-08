import React, { useState } from 'react';
import { Wallet, Mail, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, sendEmailVerification 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';

export default function AuthScreen({ user }) {
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(''); setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    } catch (err) {
      setAuthError('Gagal masuk: Email atau password salah.');
    } finally { setIsProcessing(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(''); setAuthMessage('');
    
    if (regData.password !== regData.confirmPassword) return setAuthError('Konfirmasi password tidak cocok!');
    if (regData.password.length < 6) return setAuthError('Password minimal 6 karakter!');

    setIsProcessing(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regData.email, regData.password);
      const newUser = userCredential.user;

      await setDoc(doc(db, 'artifacts', appId, 'users', newUser.uid, 'profile', 'info'), {
        name: regData.name, email: regData.email, phone: regData.phone, createdAt: Date.now()
      });

      await sendEmailVerification(newUser);
      
      setAuthMessage('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.');
      setAuthMode('login');
      setRegData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setAuthError('Email ini sudah terdaftar.');
      else setAuthError('Gagal mendaftar: ' + err.message);
    } finally { setIsProcessing(false); }
  };

  const handleResendVerification = async () => {
    setIsProcessing(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setAuthMessage("Email verifikasi baru telah dikirim!");
    } catch (err) { setAuthError("Tunggu sebentar sebelum meminta email baru lagi."); } 
    finally { setIsProcessing(false); }
  };

  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 text-amber-500 rounded-full mb-6"><Mail size={40} /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifikasi Email Anda</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">Kami mengirimkan tautan ke <strong>{user.email}</strong>. Klik tautan tersebut untuk mengaktifkan akun.</p>
          {authError && <p className="text-rose-600 text-sm mb-4">{authError}</p>}
          {authMessage && <p className="text-emerald-600 text-sm mb-4">{authMessage}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all"><RefreshCw size={18} /> Saya Sudah Verifikasi</button>
            <button onClick={handleResendVerification} disabled={isProcessing} className="py-3 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all disabled:opacity-50">Kirim Ulang Email</button>
          </div>
          <button onClick={() => signOut(auth)} className="mt-8 text-sm text-slate-500 hover:text-rose-600 underline transition-colors">Keluar atau Gunakan Akun Lain</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-sm"><Wallet size={32} /></div>
          <h1 className="text-2xl font-bold text-slate-900">Dompet Mahasiswa</h1>
          <p className="text-slate-500 text-sm mt-1">{authMode === 'login' ? 'Masuk untuk mengatur keuanganmu.' : 'Daftarkan dirimu sekarang.'}</p>
        </div>
        {authError && <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl flex gap-2"><AlertTriangle size={18} className="shrink-0" /><span>{authError}</span></div>}
        {authMessage && <div className="mb-6 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl flex gap-2"><ShieldCheck size={18} className="shrink-0" /><span>{authMessage}</span></div>}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" />
            <input type="password" required value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Password" />
            <button disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl mt-2">{isProcessing ? 'Memproses...' : 'Masuk'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Nama Lengkap" />
            <input type="tel" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="No Handphone" />
            <input type="email" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Email" />
            <input type="password" required minLength="6" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Password (Min 6)" />
            <input type="password" required minLength="6" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Konfirmasi Password" />
            <button disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl mt-2">{isProcessing ? 'Memproses...' : 'Daftar'}</button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setAuthMessage(''); }} className="text-blue-600 font-semibold hover:underline">
            {authMode === 'login' ? 'Daftar akun baru' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
}