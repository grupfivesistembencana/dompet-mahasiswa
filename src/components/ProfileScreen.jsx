import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export default function ProfileScreen({ user }) {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'));
      if (docSnap.exists()) setUserProfile(docSnap.data());
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-blue-600 h-32"></div>
      <div className="px-8 pb-8 relative">
        <div className="w-24 h-24 bg-white rounded-full p-2 absolute -top-12 shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
          <UserCircle size={80} strokeWidth={1.5} />
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">{userProfile?.name || 'Memuat...'}</h2>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full mt-2 border border-emerald-100">
            <ShieldCheck size={14} /> Terverifikasi
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Kontak</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-3 rounded-xl text-slate-500 shadow-sm"><Mail size={20} /></div>
                <div><p className="text-xs text-slate-500 font-medium">Alamat Email</p><p className="font-semibold text-slate-800">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-white p-3 rounded-xl text-slate-500 shadow-sm"><Phone size={20} /></div>
                <div><p className="text-xs text-slate-500 font-medium">Nomor Handphone</p><p className="font-semibold text-slate-800">{userProfile?.phone || '-'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}