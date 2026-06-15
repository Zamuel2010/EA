import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { School, User, BookOpen } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [role, setRole] = useState<'student' | 'staff' | null>(null);
  const [className, setClassName] = useState('JSS1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !role) return;

    setLoading(true);
    const uid = auth.currentUser.uid;
    const name = auth.currentUser.displayName || 'New User';
    const email = auth.currentUser.email || '';

    try {
      if (role === 'staff') {
        const staffRef = doc(db, 'Staff', uid);
        await setDoc(staffRef, {
          id: uid,
          name,
          email,
          assigned_class: className,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const studentRef = doc(db, 'Students', uid);
        await setDoc(studentRef, {
          id: uid,
          name,
          email,
          current_class: className,
          ca_score: 0,
          exam_score: 0,
          total_score: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      onComplete();
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.CREATE, role === 'staff' ? 'Staff' : 'Students');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div className="flex justify-center">
          <div className="rounded-full bg-indigo-100 p-3">
            <User className="h-10 w-10 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You are logging in for the first time. Please specify your role.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a...</label>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center p-4 border rounded-lg ${role === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <BookOpen className="h-8 w-8 mb-2" />
                  <span className="font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`flex flex-col items-center p-4 border rounded-lg ${role === 'staff' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <School className="h-8 w-8 mb-2" />
                  <span className="font-medium">Staff</span>
                </button>
              </div>
            </div>

            {role && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {role === 'staff' ? 'Assigned Class' : 'Current Class'}
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="JSS1">JSS1</option>
                  <option value="JSS2">JSS2</option>
                  <option value="JSS3">JSS3</option>
                  <option value="SSS1">SSS1</option>
                  <option value="SSS2">SSS2</option>
                  <option value="SSS3">SSS3</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={!role || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Finish Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
