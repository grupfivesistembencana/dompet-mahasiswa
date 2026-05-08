import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Mengambil auth dari file konfigurasi kita

// Mengimpor Komponen yang sudah kita pisah
import AuthScreen from './components/AuthScreen';
import NavBar from './components/NavBar';
import DashboardScreen from './components/DashboardScreen';
import ProfileScreen from './components/ProfileScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Mengecek apakah ada user yang sedang login saat aplikasi dibuka
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. Tampilan Loading (Saat sedang mengecek Auth)
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse font-medium">Memuat Sistem...</p>
      </div>
    );
  }

  // 2. Tampilan belum login ATAU email belum diverifikasi
  if (!user || !user.emailVerified) {
    return <AuthScreen user={user} />;
  }

  // 3. Tampilan Utama (Dashboard & Akun)
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <NavBar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {currentView === 'dashboard' ? (
          <DashboardScreen user={user} />
        ) : (
          <ProfileScreen user={user} />
        )}
      </main>
    </div>
  );
}