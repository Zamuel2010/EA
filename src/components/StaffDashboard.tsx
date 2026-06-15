import React, { useState, useEffect, useMemo } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Staff, Student, Resource } from '../types';
import { FileDown, Video, Upload, ArrowUpCircle, Loader2, Link, FileBarChart2, FileText, Users, GraduationCap, BookOpen, Clock, Calendar, CheckCircle } from 'lucide-react';
import { UploadResultsModal } from './UploadResultsModal';
import { ReportCardModal } from './ReportCardModal';

export function StaffDashboard({ staff }: { staff: Staff }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'resources'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStudent, setUploadStudent] = useState<Student | null>(null);
  const [viewReportStudent, setViewReportStudent] = useState<Student | null>(null);

  // Resource Upload form state
  const [rTitle, setRTitle] = useState('');
  const [rType, setRType] = useState<'pdf' | 'video'>('pdf');
  const [rUrl, setRUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // 1. Fetch Students in assigned class
    const qStudents = query(collection(db, 'Students'), where('current_class', '==', staff.assigned_class));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const studs: Student[] = [];
      snap.forEach(d => studs.push(d.data() as Student));
      setStudents(studs);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'Students'));

    // 2. Fetch Resources for assigned class
    const qResources = query(collection(db, 'Resources'), where('class_name', '==', staff.assigned_class));
    const unsubResources = onSnapshot(qResources, (snap) => {
      const res: Resource[] = [];
      snap.forEach(d => res.push(d.data() as Resource));
      // Sort by createdAt client-side to avoid compound index requirements
      res.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setResources(res);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'Resources'));

    return () => {
      unsubStudents();
      unsubResources();
    };
  }, [staff.assigned_class]);

  const increaseClassLevel = (current: string) => {
    const levels = ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'];
    const idx = levels.indexOf(current);
    if (idx >= 0 && idx < levels.length - 1) return levels[idx + 1];
    return current; // Graduated or unknown
  };

  const handlePromote = async (student: Student) => {
    try {
      const nextClass = increaseClassLevel(student.current_class);
      if (nextClass !== student.current_class) {
        await updateDoc(doc(db, 'Students', student.id), {
          current_class: nextClass,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'Students');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle || !rUrl) return;
    setUploading(true);
    try {
      const newRef = doc(collection(db, 'Resources'));
      await updateDoc(newRef, {
        id: newRef.id,
        staffId: staff.id,
        class_name: staff.assigned_class,
        title: rTitle,
        type: rType,
        url: rUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(async () => {
         // Fallback to strict schema create
         const docData = {
          id: newRef.id,
          staffId: staff.id,
          class_name: staff.assigned_class,
          title: rTitle,
          type: rType,
          url: rUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const { setDoc } = await import('firebase/firestore');
        await setDoc(newRef, docData);
      });
      setRTitle('');
      setRUrl('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'Resources');
    } finally {
      setUploading(false);
    }
  };

  const classAverage = useMemo(() => {
    if (students.length === 0) return 0;
    const total = students.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
    return Math.round(total / students.length);
  }, [students]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-indigo-600 h-10 w-10" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto pb-12">
      
      {/* Top Header / Welcome Banner */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <BookOpen className="w-64 h-64 text-indigo-900" />
        </div>
        <div className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
          <div className="flex items-center gap-6">
             <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 rotate-3 transform transition-transform hover:rotate-0">
              <span className="text-4xl font-display font-extrabold">{staff.name.charAt(0)}</span>
             </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-purple-500 uppercase mb-2">{today}</p>
              <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Staff Portal, {staff.name.split(' ')[0]}</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Form Teacher: {staff.assigned_class}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  ID: EA-{staff.id.substring(0,4).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-6 border-b border-slate-200/60 px-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 pt-2 text-sm font-bold border-b-2 transition-all relative ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-4 pt-2 text-sm font-bold border-b-2 transition-all relative ${activeTab === 'students' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          Students & Results
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-4 pt-2 text-sm font-bold border-b-2 transition-all relative ${activeTab === 'resources' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          Manage Resources
        </button>
      </div>

      <div className="px-4 sm:px-0">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-500" /> Class Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Total Students</p>
                    <div className="flex items-end justify-between">
                      <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">{students.length}</span>
                      <Users className="w-8 h-8 text-indigo-100" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Class Average</p>
                    <div className="flex items-end justify-between">
                      <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">{classAverage}<span className="text-2xl text-slate-300 ml-1">/100</span></span>
                      <FileBarChart2 className="w-8 h-8 text-blue-100" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resources Shared</p>
                    <div className="flex items-end justify-between">
                      <span className="text-5xl font-display font-extrabold text-slate-900 tracking-tight">{resources.length}</span>
                      <BookOpen className="w-8 h-8 text-green-100" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                 <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                   <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Quick Actions
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <button 
                     onClick={() => setActiveTab('students')}
                     className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all text-left group"
                   >
                     <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
                       <FileText className="w-7 h-7" />
                     </div>
                     <h4 className="font-bold text-slate-900 text-xl tracking-tight">Input Grades</h4>
                     <p className="text-sm text-slate-500 mt-2 font-medium">Upload Continuous Assessment and Exam scores for your students.</p>
                   </button>

                   <button 
                     onClick={() => setActiveTab('resources')}
                     className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-purple-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all text-left group"
                   >
                     <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform">
                       <Upload className="w-7 h-7" />
                     </div>
                     <h4 className="font-bold text-slate-900 text-xl tracking-tight">Upload Material</h4>
                     <p className="text-sm text-slate-500 mt-2 font-medium">Share PDFs and video links with your class to aid their studies.</p>
                   </button>
                 </div>
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-5 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-teal-500" /> Today's Schedule
                </h3>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 space-y-5">
                  <div className="flex border-l-4 border-indigo-500 pl-4 py-1">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">08:00</p>
                      <p className="text-xs font-medium text-slate-400">09:30</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{staff.assigned_class} Form Period</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Form Room</p>
                    </div>
                  </div>
                  <div className="flex border-l-4 border-blue-500 pl-4 py-1">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">10:00</p>
                      <p className="text-xs font-medium text-slate-400">11:30</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Department Meeting</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Staff Room A</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
           <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center sm:flex-row flex-col gap-4">
               <div>
                 <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">Class Roster: <span className="text-indigo-600">{staff.assigned_class}</span></h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Manage student records and upload results.</p>
               </div>
               <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                 {students.length} Students Enrolled
               </span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-100/60">
                 <thead className="bg-slate-50/50">
                   <tr>
                     <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Student Name</th>
                     <th scope="col" className="px-8 py-5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Score</th>
                     <th scope="col" className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-50">
                   {students.map((student) => (
                     <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                       <td className="px-8 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                             {student.name.charAt(0)}
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-bold text-slate-900">{student.name}</div>
                             <div className="text-xs text-slate-500 mt-0.5">{student.email}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-8 py-4 whitespace-nowrap text-center">
                         <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${
                           (student.total_score || 0) >= 50 ? 'bg-green-50 text-green-700 border-green-200' : 
                           (student.total_score || 0) > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                         }`}>
                           {student.total_score || 'Not Graded'}
                         </span>
                       </td>
                       <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center justify-end space-x-3">
                           <button
                             onClick={() => setUploadStudent(student)}
                             className="inline-flex items-center px-3 py-2 border border-indigo-200 text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                           >
                             <FileBarChart2 className="w-4 h-4 mr-1.5" /> Grade
                           </button>
                           <button
                             onClick={() => setViewReportStudent(student)}
                             className="inline-flex items-center px-3 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none shadow-sm"
                           >
                             <FileText className="w-4 h-4 mr-1.5" /> Report
                           </button>
                           <button
                             onClick={() => handlePromote(student)}
                             className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-all focus:outline-none shadow-sm shadow-teal-600/20"
                           >
                             <ArrowUpCircle className="w-4 h-4 mr-1.5" /> Promote
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                   {students.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-8 py-20 text-center">
                         <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                           <Users className="h-8 w-8 text-slate-300" />
                         </div>
                         <p className="text-sm font-medium text-slate-500">No students are currently assigned to this class.</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
              <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl border border-slate-100 p-8 sticky top-6">
                <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center tracking-tight">
                  <Upload className="w-5 h-5 mr-2 text-indigo-600" /> New Material
                </h3>
                <form onSubmit={handleAddResource} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Resource Title</label>
                    <input
                      type="text"
                      required
                      value={rTitle}
                      onChange={(e) => setRTitle(e.target.value)}
                      className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors"
                      placeholder="e.g. Algebra Chapter 1 Notes"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Material Type</label>
                    <select
                      value={rType}
                      onChange={(e) => setRType(e.target.value as any)}
                      className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors appearance-none"
                    >
                      <option value="pdf">PDF / Document Link</option>
                      <option value="video">Video URL (YouTube)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Resource URL</label>
                    <input
                      type="url"
                      required
                      value={rUrl}
                      onChange={(e) => setRUrl(e.target.value)}
                      className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish to Class'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl border border-slate-100 overflow-hidden">
                 <div className="px-8 py-6 border-b border-slate-100 bg-white">
                   <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight">Shared Resources</h3>
                 </div>
                 <div className="divide-y divide-slate-100/60">
                   {resources.map(res => (
                     <div key={res.id} className="p-6 sm:p-8 hover:bg-slate-50/80 transition-colors flex items-start sm:items-center flex-col sm:flex-row gap-5">
                        <div className={`flex-shrink-0 p-4 rounded-2xl ${res.type === 'video' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {res.type === 'video' ? <Video className="h-6 w-6" /> : <FileDown className="h-6 w-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-slate-900 truncate">
                            {res.title}
                          </p>
                          <a href={res.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center mt-1.5 truncate">
                            <Link className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> {res.url}
                          </a>
                        </div>
                        <div className="flex-shrink-0 mt-3 sm:mt-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest">
                            {res.type}
                          </span>
                        </div>
                     </div>
                   ))}
                   {resources.length === 0 && (
                     <div className="p-20 text-center text-slate-500">
                       <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                         <BookOpen className="h-8 w-8 text-slate-300" />
                       </div>
                       <p className="text-sm font-medium">You haven't shared any resources yet.</p>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {uploadStudent && (
        <UploadResultsModal 
          student={uploadStudent} 
          onClose={() => setUploadStudent(null)} 
        />
      )}
      
      {viewReportStudent && (
        <ReportCardModal 
          student={viewReportStudent}
          onClose={() => setViewReportStudent(null)}
        />
      )}
    </div>
  );
}

