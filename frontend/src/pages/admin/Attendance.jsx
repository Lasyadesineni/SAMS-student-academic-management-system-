import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  Filter,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // Selectors
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Bulk attendance sheet: map studentId -> { status: 'Present'|'Absent'|'Leave', remarks: '' }
  const [attendanceSheet, setAttendanceSheet] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resC, resSub] = await Promise.all([api.get('/courses'), api.get('/subjects')]);

      if (resC.data.success && resC.data.data.length > 0) {
        setCourses(resC.data.data);
        const firstCourse = resC.data.data[0]._id;
        setSelectedCourse(firstCourse);

        if (resSub.data.success) {
          setSubjects(resSub.data.data);
          const matchedSubs = resSub.data.data.filter(
            (s) => (s.course?._id || s.course) === firstCourse
          );
          if (matchedSubs.length > 0) {
            setSelectedSubject(matchedSubs[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching attendance setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  // When course changes, update subject selection
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    const matched = subjects.filter((s) => (s.course?._id || s.course) === courseId);
    if (matched.length > 0) {
      setSelectedSubject(matched[0]._id);
    } else {
      setSelectedSubject('');
    }
  };

  // Fetch enrolled students and existing records when filters change
  useEffect(() => {
    if (selectedCourse && selectedSubject && selectedDate) {
      loadStudentsAndAttendance();
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedDate]);

  const loadStudentsAndAttendance = async () => {
    try {
      // 1. Fetch students enrolled in this course
      const [resEn, resAtt] = await Promise.all([
        api.get('/enrollments', {
          params: { course: selectedCourse, status: 'Active' },
        }),
        api.get('/attendance', {
          params: {
            course: selectedCourse,
            subject: selectedSubject,
            date: selectedDate,
          },
        }),
      ]);

      const studentsList = resEn.data.data?.map((e) => e.student).filter(Boolean) || [];
      setEnrolledStudents(studentsList);

      // 2. Map existing attendance for this date
      const sheet = {};
      const existingRecords = resAtt.data.data || [];
      const recordMap = {};

      existingRecords.forEach((r) => {
        const sId = r.student?._id || r.student;
        recordMap[sId] = { status: r.status, remarks: r.remarks || '' };
      });

      // Default new students to 'Present' if not already marked
      studentsList.forEach((st) => {
        sheet[st._id] = recordMap[st._id] || { status: 'Present', remarks: '' };
      });

      setAttendanceSheet(sheet);

      // Also fetch overall subject attendance statistics
      fetchSubjectAttendanceSummary();
    } catch (err) {
      console.error('Error loading attendance records:', err);
    }
  };

  const fetchSubjectAttendanceSummary = async () => {
    try {
      const res = await api.get('/attendance', {
        params: {
          course: selectedCourse,
          subject: selectedSubject,
        },
      });
      if (res.data.success) {
        setAttendanceRecords(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const setStudentStatus = (studentId, status) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const markAll = (status) => {
    const updated = {};
    enrolledStudents.forEach((st) => {
      updated[st._id] = {
        ...attendanceSheet[st._id],
        status,
      };
    });
    setAttendanceSheet(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setSaveMessage({ text: '', type: '' });

      const attendanceList = enrolledStudents.map((st) => ({
        studentId: st._id,
        status: attendanceSheet[st._id]?.status || 'Present',
        remarks: attendanceSheet[st._id]?.remarks || '',
      }));

      const payload = {
        course: selectedCourse,
        semester: Number(selectedSemester),
        subject: selectedSubject,
        date: selectedDate,
        attendanceList,
      };

      const res = await api.post('/attendance', payload);
      if (res.data.success) {
        setSaveMessage({ text: res.data.message, type: 'success' });
        fetchSubjectAttendanceSummary();
      }
    } catch (err) {
      setSaveMessage({
        text: err.response?.data?.message || 'Failed to save attendance',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter subjects for selector
  const currentCourseSubjects = subjects.filter(
    (s) => (s.course?._id || s.course) === selectedCourse
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Attendance Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark daily attendance, verify presence metrics, and track class absenteeism
          </p>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            {currentCourseSubjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectCode} - {sub.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Summary KPI Cards for Selected Subject */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Logged Classes
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalClasses}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Classes Attended (Present)
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.classesAttended}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Classes Missed (Absent)
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{summary.classesMissed}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Attendance Percentage
            </span>
            <p className="text-2xl font-extrabold text-primary mt-1">
              {summary.attendancePercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Save Status Notification */}
      {saveMessage.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-sm ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{saveMessage.text}</span>
          </div>
          <button
            onClick={() => setSaveMessage({ text: '', type: '' })}
            className="text-xs opacity-60 hover:opacity-100 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Daily Marking Sheet Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Class Roster ({enrolledStudents.length} Students)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">for {selectedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Quick Mark All:</span>
            <button
              type="button"
              onClick={() => markAll('Present')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('Absent')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            >
              All Absent
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || enrolledStudents.length === 0}
              className="ml-2 px-4 py-1.5 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving to MongoDB...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Attendance Sheet Table */}
        {enrolledStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No enrolled students found"
            description="No active students are currently enrolled in this course."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrolledStudents.map((student) => {
                  const currentStatus = attendanceSheet[student._id]?.status || 'Present';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {student.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{student.department}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student._id, 'Present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStudentStatus(student._id, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStudentStatus(student._id, 'Leave')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              currentStatus === 'Leave'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={attendanceSheet[student._id]?.remarks || ''}
                          onChange={(e) =>
                            setAttendanceSheet((prev) => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                remarks: e.target.value,
                              },
                            }))
                          }
                          placeholder="Optional note / medical excuse..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
