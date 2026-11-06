import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      if (res.data.success) {
        setRecords(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching personal attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">My Attendance Records</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive audit of all logged lecture attendances, absences, and official leaves
        </p>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Classes
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalClasses}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Classes Attended
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.classesAttended}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Classes Missed
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{summary.classesMissed}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Attendance %
            </span>
            <p className="text-2xl font-extrabold text-primary mt-1">
              {summary.attendancePercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Daily Lecture Logs ({records.length} Entries)
          </h3>
          <Badge variant={summary?.attendancePercentage >= 75 ? 'success' : 'danger'}>
            {summary?.attendancePercentage >= 75 ? 'Satisfies 75% Rule' : 'Attendance Warning'}
          </Badge>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving personal attendance history..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance entries recorded"
            description="Your faculty has not yet submitted attendance records for your profile."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-800">{r.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.subject?.subjectCode} - {r.subject?.subjectName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Sem {r.semester}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          r.status === 'Present'
                            ? 'success'
                            : r.status === 'Absent'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic">
                      {r.remarks || 'Standard session'}
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

export default StudentAttendance;
