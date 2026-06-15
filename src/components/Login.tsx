import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { School, LogIn, Loader2, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [portalType, setPortalType] = useState<'student' | 'staff'>('student');
  const [selectedClass, setSelectedClass] = useState('JSS1');

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Store preferences so we can auto-assign on first login
      sessionStorage.setItem('pendingRole', portalType);
      sessionStorage.setItem('pendingClass', selectedClass);
      
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const classOptions = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-slate-900 overflow-hidden">
      
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/40 mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/30 mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-blue-900/20 mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur-xl border border-white/20">
            <School className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-display font-extrabold text-white tracking-tight">
          Excellence Academy
        </h2>
        <p className="mt-3 text-center text-sm text-indigo-200 font-medium tracking-wide uppercase">
          Digital Learning Portal
        </p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        <div className="bg-white/10 backdrop-blur-2xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:rounded-3xl sm:px-10 border border-white/20">
          
          {/* Portal Switcher */}
          <div className="flex p-1 bg-black/20 rounded-xl mb-8 backdrop-blur-md">
            <button
              onClick={() => setPortalType('student')}
              className={`flex-1 flex justify-center items-center py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                portalType === 'student'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-5 h-5 mr-2" /> Student
            </button>
            <button
              onClick={() => setPortalType('staff')}
              className={`flex-1 flex justify-center items-center py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                portalType === 'staff'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mr-2" /> Staff
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-medium backdrop-blur-md flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">
                {portalType === 'student' ? 'Select your Class' : 'Assigned Class / Form'}
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="block w-full pl-4 pr-10 py-3.5 text-base bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm rounded-xl appearance-none font-medium transition-all"
                >
                  {classOptions.map(cls => (
                    <option key={cls} value={cls} className="bg-slate-800 text-white">{cls}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-300">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-indigo-200/60 font-medium">
                {portalType === 'student' 
                  ? "Ensure you select the correct class for your termly results." 
                  : "Select the primary class you manage."}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] ${
                  portalType === 'student' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 shadow-blue-900/50' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-900/50'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span className="flex items-center gap-2 text-base">
                    <LogIn className="w-5 h-5" /> Sign in with Google
                  </span>
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
