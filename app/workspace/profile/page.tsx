'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Camera, User, Mail, Phone, Hash, Save, Check, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    email: '',
    avatarUrl: ''
  });
  const router = useRouter();

  // Helper to auto-capitalize first letter of each word
  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };

  // Phone validation logic
  const isPhoneValid = () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (!digitsOnly) return false;
    if (countryCode === '+880') return digitsOnly.length === 10 || digitsOnly.length === 11;
    if (countryCode === '+1') return digitsOnly.length === 10;
    if (countryCode === '+44') return digitsOnly.length === 10;
    if (countryCode === '+91') return digitsOnly.length === 10;
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', { description: 'Please select an image smaller than 2MB.' });
      return;
    }

    setAvatarFile(file);
    setFormData({ ...formData, avatarUrl: URL.createObjectURL(file) });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      
      // Parse existing phone number
      let phone = session.user.user_metadata?.phone || '';
      let cCode = '+880';
      let pNum = phone;
      if (phone.startsWith('+')) {
        const match = phone.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
          cCode = match[1];
          pNum = match[2];
        }
      }
      setCountryCode(cCode);
      setPhoneNumber(pNum);

      setFormData({
        fullName: session.user.user_metadata?.full_name || '',
        nickname: session.user.user_metadata?.nickname || '',
        email: session.user.email || '',
        avatarUrl: session.user.user_metadata?.avatar_url || ''
      });
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatarUrl = formData.avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile pic')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile pic')
          .getPublicUrl(fileName);

        finalAvatarUrl = publicUrl;
      }

      const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : '';
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          nickname: formData.nickname,
          phone: fullPhone,
          avatar_url: finalAvatarUrl
        }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
      router.push('/workspace');
    } catch (error: any) {
      toast.error('Failed to update profile', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="px-8 py-6 max-w-3xl mx-auto w-full flex items-center gap-4 border-b border-white/5">
        <button 
          onClick={() => router.push('/workspace')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-gray-400 text-sm">Manage your personal information</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-8 bg-[#0A121E] border border-white/5 rounded-2xl p-6 md:p-8">
          
          {/* Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <div 
              className="relative w-24 h-24 rounded-full border-2 border-cyan-500/30 overflow-hidden bg-[#050B14] group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.avatarUrl ? (
                <Image src={formData.avatarUrl} alt="User" fill sizes="96px" className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cyan-500 font-bold text-3xl">
                  {formData.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-white mb-1">Profile Photo</h3>
              <p className="text-gray-400 text-xs mb-3">Recommended size: 400x400px. Max size: 2MB.</p>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-colors"
                >
                  Change Photo
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setAvatarFile(null);
                    setFormData({...formData, avatarUrl: ''});
                  }}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: toTitleCase(e.target.value) })}
                  className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Nickname (Workspace Display)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                  <Hash size={16} />
                </div>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: toTitleCase(e.target.value) })}
                  placeholder="e.g. Alex"
                  className="w-full bg-[#050B14] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-[#050B14]/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-500 ml-1">Email cannot be changed directly.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-[100px] bg-[#050B14] border border-white/10 rounded-xl py-3 px-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-500 transition-colors">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1700000000"
                    className={`w-full bg-[#050B14] border ${
                      phoneNumber 
                        ? (isPhoneValid() ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20' : 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20') 
                        : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20'
                    } rounded-xl py-3 pl-11 pr-10 transition-all text-sm`}
                  />
                  {phoneNumber && (
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      {isPhoneValid() ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                    </div>
                  )}
                </div>
              </div>
              {phoneNumber && !isPhoneValid() && (
                <p className="text-red-500 text-[10px] ml-1">Invalid phone number length for selected country.</p>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t border-white/5">
            <button
              type="submit"
              disabled={saving || !formData.fullName.trim()}
              className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#050B14] font-bold py-2.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
