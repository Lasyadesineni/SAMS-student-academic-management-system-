import React, { useState, useEffect } from 'react';
import { Award, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMarks();
  }, []);

  const fetchMyMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marks');
      if (res.data.success) {
        setMarks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching personal examination marks:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = marks.reduce((sum, m) => sum + m.percentage, 0);
  const avgScore = marks.length > 0 ? (totalScore / marks.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Academic Examination Results</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official transcript of continuous assessments, internal tests, and semester final grades
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-slate-400">Cumulative Average:</span>{' '}
            <span className="font-extrabold text-primary text-sm ml-1">{avgScore}%</span>
          </div>
        </div>
      </div>

      {/* Results Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Grade Sheet ({marks.length} Assessments)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Academic Year 2025-2026</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving official grade report..." />
        ) : marks.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No examination results published"
            description="Your examination scores have not been uploaded by the academic coordinator yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Examination Type</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Obtained Marks</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Score %</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {marks.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {m.subject?.subjectCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.subject?.subjectName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{m.examType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.subject?.credits || 3}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{m.obtainedMarks}</td>
                    <td className="py-3.5 px-4 text-slate-500">/ {m.maxMarks}</td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-700">{m.percentage}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          m.grade === 'A+' || m.grade === 'A'
                            ? 'success'
                            : m.grade === 'B' || m.grade === 'C'
                            ? 'primary'
                            : 'warning'
                        }
                      >
                        {m.grade}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      {m.remarks || 'Satisfactory'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMarks;
