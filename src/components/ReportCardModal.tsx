import React from 'react';
import { Student } from '../types';
import { Printer, X } from 'lucide-react';

interface Props {
  student: Student;
  onClose: () => void;
}

export function ReportCardModal({ student, onClose }: Props) {
  const resT1 = student.results?.['firstterm'];
  const resT2 = student.results?.['secondterm'];

  const defaultSubjects = ['English', 'Mathematics', 'Science', 'Computer Science', 'Social Studies'];
  const subjects = defaultSubjects.map(name => {
    const s1 = resT1?.subjects?.[name] || { ca: 0, exam: 0, total: 0 };
    const s2 = resT2?.subjects?.[name] || { ca: 0, exam: 0, total: 0 };
    const avg = Math.round((s1.total + s2.total) / 2);
    return { name, t1: s1, t2: s2, avg };
  });

  const totalT1 = subjects.reduce((acc, curr) => acc + curr.t1.total, 0);
  const totalT2 = subjects.reduce((acc, curr) => acc + curr.t2.total, 0);
  const totalMaxT1 = subjects.length * 100;
  const totalMaxT2 = subjects.length * 100;
  const overallTotal = subjects.reduce((acc, curr) => acc + curr.avg, 0);
  const overallMax = subjects.length * 100;
  const percentage = overallMax > 0 ? Math.round((overallTotal / overallMax) * 100) : 0;

  const getPersonalGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  };

  const currentTerm = resT2 ? resT2 : resT1;
  const attendance = currentTerm?.attendance || { present: 0, total: 180 };
  const personality = currentTerm?.personality || {
    application: 'B', conduct: 'B', discipline: 'B', punctuality: 'B', leadership: 'B', cleanliness: 'B'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:absolute print:inset-0 print:overflow-visible" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 print:block print:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity print:hidden" aria-hidden="true" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen print:hidden" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:rounded-xl print:m-0 print:w-full print:max-w-none print:shadow-none print:rounded-none">
          
          {/* Action Header - Hidden during print */}
          <div className="bg-gray-100 flex justify-between items-center px-6 py-4 border-b print:hidden sticky top-0 z-10">
            <h3 className="font-semibold text-gray-700">Student Report Card</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Report Card
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Report Card Content */}
          <div className="p-8 sm:p-12 print:p-0 bg-white min-h-[1056px] w-full mx-auto text-black">
            {/* 1. Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-bold text-black text-xl bg-gray-100 tracking-tighter">LOGO</div>
              <div className="text-center flex-1 px-4">
                <h1 className="text-3xl font-black uppercase tracking-widest text-black">Excellence Academy</h1>
                <p className="text-sm mt-1 text-gray-800 font-medium tracking-wide">123 Education Boulevard, Knowledge City, 10001</p>
                <p className="text-sm text-gray-600 font-medium">Phone: (555) 123-4567 | Email: info@excellence.edu</p>
              </div>
              <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-bold text-black text-xl bg-gray-100 tracking-tighter">SEAL</div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold border-y-2 border-black py-2 inline-block px-12 tracking-widest bg-gray-50">ANNUAL REPORT CARD</h2>
            </div>

            {/* 2. Student Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-2 border-black p-4 bg-gray-50 text-sm font-bold">
              <div><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Admission No</span>EA-{student.id.substring(0,6).toUpperCase()}</div>
              <div className="col-span-2"><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Name of the Student</span><span className="text-base uppercase underline underline-offset-4">{student.name}</span></div>
              <div><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Class</span>{student.current_class}</div>
              
              <div><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Roll Number</span>{Math.floor(Math.random() * 50) + 1}</div>
              <div className="col-span-2"><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Father's/Guardian's Name</span>MR. {student.name.split(' ').pop()}</div>
              <div><span className="text-gray-500 font-normal block text-xs tracking-wider uppercase mb-1">Date of Birth</span>12-05-2010</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* 3. Left Column (Academic Table) */}
              <div className="md:col-span-8">
                <table className="w-full border-collapse border-2 border-black text-sm relative">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black px-2 py-3 text-left font-bold" rowSpan={2}>SUBJECTS</th>
                      <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>FIRST TERM (100)</th>
                      <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>SECOND TERM (100)</th>
                      <th className="border border-black px-2 py-3 text-center font-bold bg-gray-200" rowSpan={2}>AVERAGE<br/>(100)</th>
                    </tr>
                    <tr className="bg-gray-50 text-[11px] text-center tracking-wider">
                      <th className="border border-black px-1 py-1 font-bold">CA</th>
                      <th className="border border-black px-1 py-1 font-bold">EX</th>
                      <th className="border border-black px-1 py-1 font-bold bg-gray-200">TOT</th>
                      <th className="border border-black px-1 py-1 font-bold">CA</th>
                      <th className="border border-black px-1 py-1 font-bold">EX</th>
                      <th className="border border-black px-1 py-1 font-bold bg-gray-200">TOT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub, i) => (
                      <tr key={i} className="text-center group hover:bg-gray-50 transition-colors">
                        <td className="border border-black px-2 py-2.5 text-left font-bold uppercase text-[13px] tracking-wide">{sub.name}</td>
                        <td className="border border-black px-1 py-2.5">{sub.t1.ca || '-'}</td>
                        <td className="border border-black px-1 py-2.5">{sub.t1.exam || '-'}</td>
                        <td className="border border-black px-1 py-2.5 bg-gray-100 font-bold">{sub.t1.total || '-'}</td>
                        <td className="border border-black px-1 py-2.5">{sub.t2.ca || '-'}</td>
                        <td className="border border-black px-1 py-2.5">{sub.t2.exam || '-'}</td>
                        <td className="border border-black px-1 py-2.5 bg-gray-100 font-bold">{sub.t2.total || '-'}</td>
                        <td className="border border-black px-1 py-2.5 bg-gray-200 font-bold text-base">{sub.avg || '-'}</td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="font-bold bg-gray-100 text-center">
                      <td className="border border-black px-2 py-4 text-right uppercase tracking-widest text-[#000]">OVERALL TOTAL</td>
                      <td className="border border-black px-1 py-4 text-base" colSpan={3}>{totalT1} <span className="text-xs text-gray-500 font-normal">/ {totalMaxT1}</span></td>
                      <td className="border border-black px-1 py-4 text-base" colSpan={3}>{totalT2} <span className="text-xs text-gray-500 font-normal">/ {totalMaxT2}</span></td>
                      <td className="border border-black px-1 py-4 bg-gray-300 text-lg">{overallTotal} <span className="text-xs text-gray-600 font-normal">/ {overallMax}</span></td>
                    </tr>
                    
                    <tr className="font-bold border-2 border-black bg-black text-white text-center">
                      <td className="px-2 py-4 text-right uppercase tracking-widest">FINAL PERCENTAGE</td>
                      <td className="px-1 py-4 text-xl tracking-widest" colSpan={7}>{percentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. Right Column (Behavioral & Co-Curricular) */}
              <div className="md:col-span-4 space-y-6">
                <div>
                  <h3 className="font-bold text-center bg-black text-white py-2 mb-0 border-2 border-black tracking-widest">PERSONALITY PROFILE</h3>
                  <table className="w-full border-collapse border-x-2 border-b-2 border-black text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-2 text-left font-bold uppercase text-[11px] tracking-wider">Traits</th>
                        <th className="border border-black px-2 py-2 text-center font-bold uppercase text-[11px] tracking-wider w-10">T1</th>
                        <th className="border border-black px-2 py-2 text-center font-bold uppercase text-[11px] tracking-wider w-10">T2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Application in Studies</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.application || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.application || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Conduct in Class</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.conduct || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.conduct || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Discipline</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.discipline || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.discipline || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Regularity & Punctuality</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.punctuality || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.punctuality || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Leadership</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.leadership || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.leadership || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-2 py-2 font-medium">Cleanliness</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT1?.personality?.cleanliness || '-'}</td>
                        <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{resT2?.personality?.cleanliness || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold text-center bg-gray-200 text-black py-2 mb-0 border-2 border-black tracking-widest">GRADED SUBJECTS</h3>
                  <table className="w-full border-collapse border-x-2 border-b-2 border-black text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-black px-2 py-2 text-left font-bold uppercase text-[11px] tracking-wider">Subject Activity</th>
                        <th className="border border-black px-2 py-2 text-center font-bold uppercase text-[11px] tracking-wider w-12">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Creative Writing', 'Public Speaking', 'Art & Craft', 'Music / Dance'].map((sub, i) => (
                        <tr key={i}>
                          <td className="border border-black px-2 py-2 font-medium">{sub}</td>
                          <td className="border border-black px-2 py-2 text-center font-bold bg-gray-50">{getPersonalGrade(percentage - i * 3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Attendance */}
                <div className="border-2 border-black p-4 bg-gray-50 shadow-inner">
                  <div className="font-bold text-sm mb-3 uppercase tracking-widest text-center border-b-2 border-black pb-2 text-black">Attendance Record</div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="font-medium text-gray-700">Total School Days:</span>
                    <span className="font-bold text-black border-b border-black">{attendance.total}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 mt-1">
                    <span className="font-medium text-gray-700">Days Present:</span>
                    <span className="font-bold text-black border-b border-black">{attendance.present}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Bottom Section */}
            <div className="mt-10 border-2 border-black p-6 bg-gray-50 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full mix-blend-multiply opacity-20 -mr-10 -mt-10"></div>
              <h3 className="font-extrabold uppercase mb-3 tracking-widest underline underline-offset-4 text-black">Performance Analysis & Remarks</h3>
              <p className="text-base italic mb-10 min-h-[60px] font-medium leading-relaxed max-w-3xl text-gray-900 border-l-4 border-gray-400 pl-4">
                {currentTerm?.remarks || (percentage >= 60 ? "Good progress shown this year. Keep it up." : "Needs substantial improvement. Please arrange a meeting with the counselor.")}
              </p>
              
              <div className="flex justify-between items-end mt-16 px-8 text-sm font-bold uppercase tracking-wider">
                <div className="text-center w-48 border-t-2 border-black pt-2">Class Teacher</div>
                <div className="text-center w-48 border-t-2 border-black pt-2">Principal</div>
                <div className="text-center w-48 border-t-2 border-black pt-2">Parent/Guardian</div>
              </div>
            </div>

            {/* Grading Scale reference */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-xs font-medium text-gray-500 text-center uppercase tracking-widest">
              G R A D I N G &nbsp;&nbsp; S C A L E : &nbsp;&nbsp; A = 80-100% &nbsp;|&nbsp; B = 60-79% &nbsp;|&nbsp; C = 40-59% &nbsp;|&nbsp; D = Below 40%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
