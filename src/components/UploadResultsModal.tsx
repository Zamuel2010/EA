import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Student, TermResult, SubjectScore } from '../types';
import { X, Save, Calculator } from 'lucide-react';

interface Props {
  student: Student;
  onClose: () => void;
}

const DEFAULT_SUBJECTS = [
  'English', 
  'Mathematics', 
  'Science', 
  'Computer Science', 
  'Social Studies'
];

export function UploadResultsModal({ student, onClose }: Props) {
  const [term, setTerm] = useState('firstterm');
  
  // Try to load existing term data if it exists
  const existing = student.results?.[term];

  const [daysPresent, setDaysPresent] = useState(existing?.attendance?.present?.toString() || '175');
  const [totalDays, setTotalDays] = useState(existing?.attendance?.total?.toString() || '180');
  const [remarks, setRemarks] = useState(existing?.remarks || '');
  
  const [personality, setPersonality] = useState({
    application: existing?.personality?.application || 'A',
    conduct: existing?.personality?.conduct || 'A',
    discipline: existing?.personality?.discipline || 'A',
    punctuality: existing?.personality?.punctuality || 'A',
    leadership: existing?.personality?.leadership || 'A',
    cleanliness: existing?.personality?.cleanliness || 'A'
  });

  const [subjectsData, setSubjectsData] = useState<Record<string, { ca: string; exam: string }>>(
    DEFAULT_SUBJECTS.reduce((acc, sub) => ({
      ...acc,
      [sub]: { 
        ca: existing?.subjects?.[sub]?.ca?.toString() || '',
        exam: existing?.subjects?.[sub]?.exam?.toString() || ''
      }
    }), {})
  );

  const [saving, setSaving] = useState(false);

  // Reload data when term changes
  const handleTermChange = (newTerm: string) => {
    setTerm(newTerm);
    const ex = student.results?.[newTerm];
    setDaysPresent(ex?.attendance?.present?.toString() || '175');
    setTotalDays(ex?.attendance?.total?.toString() || '180');
    setRemarks(ex?.remarks || '');
    setPersonality({
      application: ex?.personality?.application || 'A',
      conduct: ex?.personality?.conduct || 'A',
      discipline: ex?.personality?.discipline || 'A',
      punctuality: ex?.personality?.punctuality || 'A',
      leadership: ex?.personality?.leadership || 'A',
      cleanliness: ex?.personality?.cleanliness || 'A'
    });
    setSubjectsData(
      DEFAULT_SUBJECTS.reduce((acc, sub) => ({
        ...acc,
        [sub]: { 
          ca: ex?.subjects?.[sub]?.ca?.toString() || '',
          exam: ex?.subjects?.[sub]?.exam?.toString() || ''
        }
      }), {})
    );
  };

  const calculateGrade = (total: number) => {
    if (total >= 80) return 'A';
    if (total >= 60) return 'B';
    if (total >= 40) return 'C';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-600 bg-green-50';
    if (grade === 'B') return 'text-blue-600 bg-blue-50';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleSubjectChange = (subject: string, field: 'ca' | 'exam', val: string) => {
    setSubjectsData(prev => ({
      ...prev,
      [subject]: { ...prev[subject], [field]: val }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedSubjects: Record<string, SubjectScore> = {};
      let totalSum = 0;

      for (const [sub, scores] of Object.entries(subjectsData)) {
        const scoreData = scores as { ca: string; exam: string };
        const ca = parseInt(scoreData.ca) || 0;
        const exam = parseInt(scoreData.exam) || 0;
        const total = ca + exam;
        totalSum += total;
        parsedSubjects[sub] = { ca, exam, total, grade: calculateGrade(total) };
      }

      const avgScore = Math.round(totalSum / DEFAULT_SUBJECTS.length);

      const newResult: TermResult = {
        term,
        attendance: { present: parseInt(daysPresent) || 0, total: parseInt(totalDays) || 0 },
        personality,
        remarks,
        subjects: parsedSubjects
      };

      const studentRef = doc(db, 'Students', student.id);
      const updatedResults = { ...(student.results || {}) };
      updatedResults[term] = newResult;

      await updateDoc(studentRef, {
        results: updatedResults,
        total_score: avgScore, // keeping a simple average for simplified views
        updatedAt: serverTimestamp()
      });

      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'Students');
    } finally {
      setSaving(false);
    }
  };

  const termOptions = [
    { id: 'firstterm', label: 'First Term' },
    { id: 'secondterm', label: 'Second Term' },
    { id: 'thirdterm', label: 'Third Term' },
  ];

  const gradeOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-gray-900 bg-opacity-50 transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Uploading Results</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">For: <span className="text-blue-600 font-bold">{student.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Section */}
          <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-4">
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Term</label>
                 <select 
                   value={term}
                   onChange={(e) => handleTermChange(e.target.value)}
                   className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 font-medium"
                 >
                   {termOptions.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                 </select>
               </div>
               <div className="flex-1 grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Days Present</label>
                   <input 
                     type="number" 
                     value={daysPresent}
                     onChange={(e) => setDaysPresent(e.target.value)}
                     className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Total Days</label>
                   <input 
                     type="number" 
                     value={totalDays}
                     onChange={(e) => setTotalDays(e.target.value)}
                     className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500" 
                   />
                 </div>
               </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Personality & Behavioral Profile</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(personality).map((trait) => (
                  <div key={trait}>
                    <label className="block text-xs text-gray-500 mb-1 capitalize truncate">{trait}</label>
                    <select
                      value={personality[trait as keyof typeof personality]}
                      onChange={(e) => setPersonality({ ...personality, [trait]: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm py-1.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Principal / Teacher Remarks</label>
               <textarea 
                 value={remarks}
                 onChange={(e) => setRemarks(e.target.value)}
                 rows={2}
                 className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                 placeholder="Enter final term remarks..."
               />
            </div>
          </div>

          {/* Matrix Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Academic Scores
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-1/2">Subject</th>
                    <th className="px-4 py-3 font-semibold text-center w-20">CA (40)</th>
                    <th className="px-4 py-3 font-semibold text-center w-20">Exam (60)</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Total / Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {DEFAULT_SUBJECTS.map((sub) => {
                    const sc = subjectsData[sub];
                    const caNum = parseInt(sc.ca) || 0;
                    const exNum = parseInt(sc.exam) || 0;
                    const tot = caNum + exNum;
                    const grade = calculateGrade(tot);
                    const gradeClass = getGradeColor(grade);

                    return (
                      <tr key={sub} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-gray-900 uppercase tracking-wide text-xs">{sub}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            max="40"
                            min="0"
                            value={sc.ca}
                            onChange={(e) => handleSubjectChange(sub, 'ca', e.target.value)}
                            className="w-full text-center border-gray-300 rounded shadow-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          />
                        </td>
                        <td className="px-4 py-3">
                           <input 
                            type="number" 
                            max="60"
                            min="0"
                            value={sc.exam}
                            onChange={(e) => handleSubjectChange(sub, 'exam', e.target.value)}
                            className="w-full text-center border-gray-300 rounded shadow-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-bold text-gray-900 w-8">{tot > 0 ? tot : '-'}</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${tot > 0 ? gradeClass : 'text-gray-400'}`}>
                              {tot > 0 ? grade : '-'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
           <button
             onClick={handleSave}
             disabled={saving}
             className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
           >
             {saving ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <>
                 <Save className="w-5 h-5 mr-2" /> Save &amp; Upload Result
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}
