import React, { useState } from 'react';
import { Wallet, Mail, AlertTriangle, ShieldCheck, RefreshCw, Lock, ArrowLeft } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail // Impor fungsi reset password dari Firebase
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';

export default function AuthScreen({ user }) {
  // authMode sekarang mendukung tiga opsi: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState('login'); 
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State untuk form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState(''); // State baru untuk email reset password
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Handler Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(''); setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    } catch (err) {
      setAuthError('Gagal masuk: Email atau password salah.');
    } finally { setIsProcessing(false); }
  };

  // Handler Register
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

  // Handler Baru: Mengirim Email Lupa Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsProcessing(true);

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setAuthMessage('Email pemulihan password telah dikirim! Silakan periksa kotak masuk atau folder spam Anda.');
      setAuthMode('login'); // Kembalikan ke halaman login setelah berhasil
      setForgotEmail('');   // Bersihkan inputan
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setAuthError('Email tidak terdaftar di sistem kami.');
      } else {
        setAuthError('Gagal mengirim email pemulihan: ' + err.message.replace('Firebase: ', ''));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendVerification = async () => {
    setIsProcessing(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setAuthMessage("Email verifikasi baru telah dikirim!");
    } catch (err) { setAuthError("Tunggu sebentar sebelum meminta email baru lagi."); } 
    finally { setIsProcessing(false); }
  };

  // UI: Jika email belum terverifikasi
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
        
        {/* Header Dinamis berdasarkan Mode */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-sm">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dompet Mahasiswa</h1>
          <p className="text-slate-500 text-sm mt-1">
            {authMode === 'login' && 'Masuk untuk mengatur keuanganmu.'}
            {authMode === 'register' && 'Daftarkan dirimu sekarang.'}
            {authMode === 'forgot' && 'Masukkan email untuk memulihkan password.'}
          </p>
        </div>

        {/* Notifikasi Error dan Sukses */}
        {authError && <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl flex gap-2"><AlertTriangle size={18} className="shrink-0" /><span>{authError}</span></div>}
        {authMessage && <div className="mb-6 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl flex gap-2"><ShieldCheck size={18} className="shrink-0" /><span>{authMessage}</span></div>}

        {/* 1. FORM LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Email" />
            
            <div className="space-y-1">
              <input type="password" required value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password" />
              
              {/* Tombol pemicu mode Lupa Password */}
              <div className="text-right">
                <button type="button" onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthMessage(''); }} className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors">
                  Lupa Password?
                </button>
              </div>
            </div>

            <button disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl mt-2 disabled:opacity-50">{isProcessing ? 'Memproses...' : 'Masuk'}</button>
          </form>
        )}

        {/* 2. FORM REGISTER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Nama Lengkap" />
            <input type="tel" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="No Handphone" />
            <input type="email" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Email" />
            <input type="password" required minLength="6" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password (Min 6)" />
            <input type="password" required minLength="6" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Konfirmasi Password" />
            <button disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl mt-2 disabled:opacity-50">{isProcessing ? 'Memproses...' : 'Daftar'}</button>
          </form>
        )}

        {/* 3. FORM LUPA PASSWORD (FORGOT) */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-1">
                <Lock size={16} className="text-slate-400" /> Masukkan Email Akun Anda
              </label>
              <input 
                type="email" required 
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="nama@kampus.ac.id" 
              />
            </div>
            
            <button disabled={isProcessing} type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm">
              {isProcessing ? 'Mengirim...' : 'Kirim Link Pemulihan'}
            </button>
            
            {/* Tombol kembali ke Login */}
            <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }} className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1 mt-2">
              <ArrowLeft size={16} /> Kembali ke Halaman Login
            </button>
          </form>
        )}

        {/* Footer Navigasi Antar Mode (Hanya muncul jika bukan mode 'forgot') */}
        {authMode !== 'forgot' && (
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setAuthMessage(''); }} className="text-blue-600 font-semibold hover:underline">
              {authMode === 'login' ? 'Daftar akun baru' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
