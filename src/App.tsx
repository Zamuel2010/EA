import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Staff, Student } from './types';
import { Loader2, LogOut } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDataLoading(true);
        try {
          // Check Staff first
          const staffRef = doc(db, 'Staff', currentUser.uid);
          const staffSnap = await getDoc(staffRef);
          
          if (staffSnap.exists()) {
            setStaffData(staffSnap.data() as Staff);
            setStudentData(null);
            setNeedsOnboarding(false);
          } else {
            // Check student
            const studentRef = doc(db, 'Students', currentUser.uid);
            const studentSnap = await getDoc(studentRef);
            
            if (studentSnap.exists()) {
              setStudentData(studentSnap.data() as Student);
              setStaffData(null);
              setNeedsOnboarding(false);
            } else {
              // auto onboarding bypass
              const pendingRole = sessionStorage.getItem('pendingRole');
              const pendingClass = sessionStorage.getItem('pendingClass');
              
              if (pendingRole && pendingClass) {
                const isStaff = pendingRole === 'staff';
                const colName = isStaff ? 'Staff' : 'Students';
                const docRef = doc(db, colName, currentUser.uid);
                
                const baseData = {
                  id: currentUser.uid,
                  name: currentUser.displayName || 'New User',
                  email: currentUser.email || '',
                };
                
                if (isStaff) {
                   await setDoc(docRef, { 
                     ...baseData, 
                     assigned_class: pendingClass, 
                     createdAt: serverTimestamp(),
                     updatedAt: serverTimestamp() 
                   });
                   const newStaffSnap = await getDoc(docRef);
                   setStaffData(newStaffSnap.data() as Staff);
                } else {
                   await setDoc(docRef, { 
                     ...baseData, 
                     current_class: pendingClass, 
                     ca_score: 0, 
                     exam_score: 0, 
                     total_score: 0,
                     createdAt: serverTimestamp(),
                     updatedAt: serverTimestamp() 
                   });
                   const newStudentSnap = await getDoc(docRef);
                   setStudentData(newStudentSnap.data() as Student);
                }
                
                sessionStorage.removeItem('pendingRole');
                sessionStorage.removeItem('pendingClass');
                setNeedsOnboarding(false);
              } else {
                setNeedsOnboarding(true);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        } finally {
          setDataLoading(false);
        }
      } else {
        setStaffData(null);
        setStudentData(null);
        setNeedsOnboarding(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleOnboardingComplete = async () => {
    // Refresh user data manually after onboarding
    if (!user) return;
    setDataLoading(true);
    const staffRef = doc(db, 'Staff', user.uid);
    const staffSnap = await getDoc(staffRef);
    if (staffSnap.exists()) {
      setStaffData(staffSnap.data() as Staff);
      setNeedsOnboarding(false);
    } else {
      const studentRef = doc(db, 'Students', user.uid);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        setStudentData(studentSnap.data() as Student);
        setNeedsOnboarding(false);
      }
    }
    setDataLoading(false);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 lg:z-50 bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-inner border border-white/20 ${staffData ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              <span className="text-white font-display font-bold text-lg leading-none tracking-tight">EA</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 leading-tight">
                Excellence Academy
              </h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                {staffData ? 'Staff Portal' : 'Student Portal'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-sm text-right hidden sm:block">
              <div className="font-bold text-slate-900">{user.displayName}</div>
              <div className="text-slate-500 font-medium capitalize">{staffData ? 'Staff Member' : 'Student'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {staffData && <StaffDashboard staff={staffData} />}
        {studentData && <StudentDashboard student={studentData} />}
      </main>
    </div>
  );
}
