import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Impor auth yang tadi kita buat

export default function NavBar({ currentView, setCurrentView }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <Wallet className="text-blue-600" size={28} />
          <span className="font-bold text-lg text-slate-900 hidden sm:block">Dompet Mahasiswa</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboard</button>
          <button onClick={() => setCurrentView('profile')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>Akun</button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button onClick={() => signOut(auth)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-1" title="Keluar">
            <LogOut size={18} /> <span className="text-sm font-medium hidden sm:block">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}