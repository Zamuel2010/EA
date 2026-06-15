import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Student, Resource } from '../types';
import { BookOpen, FileText, Video, Trophy, FileDown, ExternalLink, Calendar, Bell, Clock, AlertCircle } from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';

export function StudentDashboard({ student }: { student: Student }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    // Fetch resources for student's class
    const qResources = query(collection(db, 'Resources'), where('class_name', '==', student.current_class));
    const unsub = onSnapshot(qResources, (snap) => {
      const res: Resource[] = [];
      snap.forEach(d => res.push(d.data() as Resource));
      res.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setResources(res);
      setLoadingResources(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'Resources'));

    return () => unsub();
  }, [student.current_class]);

  const percentage = student.total_score ? Math.min(100, Math.max(0, student.total_score)) : 0;
  let grade = 'F';
  let color = 'text-red-600 bg-red-100';
  if (percentage >= 80) { grade = 'A'; color = 'text-green-700 bg-green-100'; }
  else if (percentage >= 60) { grade = 'B'; color = 'text-blue-700 bg-blue-100'; }
  else if (percentage >= 50) { grade = 'C'; color = 'text-yellow-700 bg-yellow-100'; }
  else if (percentage >= 40) { grade = 'D'; color = 'text-orange-700 bg-orange-100'; }

  // Extracted current date for display
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto pb-12">
       
       {/* Top Header / Welcome Banner */}
       <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Trophy className="w-64 h-64" />
         </div>
         <div className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
           <div className="flex items-center gap-6">
             <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3 transform transition-transform hover:rotate-0">
               <span className="text-4xl font-display font-extrabold">{student.name.charAt(0)}</span>
             </div>
             <div>
               <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase mb-2">{today}</p>
               <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Welcome back, {student.name.split(' ')[0]}!</h2>
               <div className="flex items-center gap-3 mt-3">
                 <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                   Class: {student.current_class}
                 </span>
                 <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                   ID: EA-{student.id.substring(0,4).toUpperCase()}
                 </span>
               </div>
             </div>
           </div>
           
           <div className="mt-6 sm:mt-0">
             <button
               onClick={() => setShowReportCard(true)}
               className="inline-flex flex-col items-center justify-center h-20 w-36 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1"
             >
               <FileText className="w-6 h-6 mb-1.5" />
               <span className="text-sm font-bold tracking-wide">Report Card</span>
             </button>
           </div>
         </div>
       </div>

       {/* Tabs Navigation */}
       <div className="flex space-x-6 border-b border-slate-200/60 px-4">
         <button
           onClick={() => setActiveTab('overview')}
           className={`pb-4 pt-2 text-sm font-bold border-b-2 transition-all relative ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
         >
           Dashboard Overview
         </button>
         <button
           onClick={() => setActiveTab('resources')}
           className={`pb-4 pt-2 text-sm font-bold border-b-2 transition-all relative ${activeTab === 'resources' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
         >
           Learning Center
         </button>
       </div>

       {activeTab === 'overview' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0 animate-in fade-in duration-500">
           
           {/* Main Column */}
           <div className="lg:col-span-2 space-y-8">
             
             {/* Academic Quick Stats */}
             <section>
               <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                 <Trophy className="w-5 h-5 mr-2 text-indigo-500" /> Current Term Performance
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                 <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Current Average</p>
                   <div className="flex items-end justify-between">
                     <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">{student.total_score || 0}</span>
                     <span className={`px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm ${color}`}>{grade}</span>
                   </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Class Rank</p>
                   <div className="flex items-end justify-between">
                     <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">4<span className="text-2xl text-slate-300 ml-1">th</span></span>
                     <span className="px-2.5 py-1 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 shadow-sm border border-slate-200">Top 15%</span>
                   </div>
                 </div>

                 <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Attendance</p>
                   <div className="flex items-end justify-between">
                     <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">96<span className="text-2xl text-slate-300 ml-1">%</span></span>
                     <span className="px-2.5 py-1 rounded-lg text-sm font-bold text-teal-700 bg-teal-100 shadow-sm border border-teal-200">Excellent</span>
                   </div>
                 </div>
               </div>
             </section>

             {/* Notice Board */}
             <section>
               <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                 <Bell className="w-5 h-5 mr-2 text-blue-500" /> Recent Announcements
               </h3>
               <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden divide-y divide-slate-100/60 p-2">
                 
                 <div className="p-4 sm:p-5 flex gap-5 hover:bg-slate-50/80 rounded-2xl transition-colors cursor-pointer group">
                   <div className="bg-blue-50 group-hover:bg-blue-100 text-blue-600 p-3.5 rounded-2xl h-fit transition-colors border border-blue-100">
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 text-base">End of Term Examinations</h4>
                     <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">The final assessments will commence next week Monday. Please review your exam schedule.</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Posted 2 days ago</p>
                   </div>
                 </div>

                 <div className="p-4 sm:p-5 flex gap-5 hover:bg-slate-50/80 rounded-2xl transition-colors cursor-pointer group">
                   <div className="bg-amber-50 group-hover:bg-amber-100 text-amber-600 p-3.5 rounded-2xl h-fit transition-colors border border-amber-100">
                     <AlertCircle className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 text-base">Outstanding Fee Balance</h4>
                     <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">A reminder to clear any outstanding term fees before the exam week to ensure access to the portal.</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Posted 4 days ago</p>
                   </div>
                 </div>

               </div>
             </section>

           </div>

           {/* Side Column */}
           <div className="space-y-8">
             
             {/* Today's Schedule */}
             <section>
               <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                 <Clock className="w-5 h-5 mr-2 text-teal-500" /> Today's Schedule
               </h3>
               <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 space-y-5">
                 
                 <div className="flex border-l-4 border-blue-500 pl-4 py-1">
                   <div className="w-24 flex-shrink-0">
                     <p className="text-sm font-bold text-slate-900">08:00</p>
                     <p className="text-xs font-medium text-slate-400">09:30</p>
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">Mathematics</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Room 204 • Mr. Adeyemi</p>
                   </div>
                 </div>

                 <div className="flex border-l-4 border-indigo-500 pl-4 py-1">
                   <div className="w-24 flex-shrink-0">
                     <p className="text-sm font-bold text-slate-900">09:30</p>
                     <p className="text-xs font-medium text-slate-400">10:45</p>
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">English Language</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Room 101 • Mrs. Benson</p>
                   </div>
                 </div>

                 <div className="flex border-l-0 pl-1 py-3 -mx-2 px-3 rounded-xl bg-slate-50 border border-slate-100 items-center">
                   <div className="w-24 flex-shrink-0">
                     <p className="text-sm font-bold text-slate-900">10:45</p>
                     <p className="text-xs font-medium text-slate-400">11:15</p>
                   </div>
                   <div>
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center bg-white px-2 py-1 rounded shadow-sm border border-slate-100">Break Time</h4>
                   </div>
                 </div>

                 <div className="flex border-l-4 border-emerald-500 pl-4 py-1">
                   <div className="w-24 flex-shrink-0">
                     <p className="text-sm font-bold text-slate-900">11:15</p>
                     <p className="text-xs font-medium text-slate-400">12:30</p>
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-slate-900">Basic Science</h4>
                     <p className="text-xs text-slate-500 mt-0.5">Lab A • Dr. Okeke</p>
                   </div>
                 </div>

               </div>
             </section>

           </div>
         </div>
       )}

       {activeTab === 'resources' && (
         <div className="px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8 sm:p-10">
             <div className="max-w-4xl mx-auto">
               <h3 className="text-2xl font-display font-extrabold text-slate-900 mb-2">Learning Materials</h3>
               <p className="text-slate-500 mb-10 text-sm font-medium">Access curated study guides, notes, and video lectures uploaded by your teachers for {student.current_class}.</p>
               
               {loadingResources ? (
                 <div className="flex items-center justify-center py-20">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                 </div>
               ) : resources.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {resources.map(res => (
                     <a 
                       key={res.id} 
                       href={res.url} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-start p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group cursor-pointer"
                     >
                       <div className={`flex-shrink-0 p-4 rounded-xl ${res.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                         {res.type === 'video' ? <Video className="h-6 w-6" /> : <FileDown className="h-6 w-6" />}
                       </div>
                       <div className="ml-5 flex-1">
                         <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 flex items-center leading-snug transition-colors">
                           {res.title}
                         </h4>
                         <p className="text-[10px] font-bold text-slate-400 mt-2.5 uppercase tracking-widest bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">{res.type}</p>
                       </div>
                       <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 ml-3 mt-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                     </a>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-3xl">
                   <div className="bg-white p-4 inline-block rounded-2xl shadow-sm mb-4">
                     <BookOpen className="h-8 w-8 text-slate-300" />
                   </div>
                   <h3 className="text-base font-bold text-slate-900">No resources available</h3>
                   <p className="mt-2 text-sm text-slate-500 font-medium">Your teachers haven't uploaded any materials for {student.current_class} yet.</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

       {/* Report Card Modal */}
       {showReportCard && (
         <ReportCardModal student={student} onClose={() => setShowReportCard(false)} />
       )}
    </div>
  );
}
