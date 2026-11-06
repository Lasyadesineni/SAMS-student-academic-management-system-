import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const computeGrade = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

const Marks = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Selectors
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Mid-Semester');
  const [maxMarks, setMaxMarks] = useState(50);

  // Marks sheet: map studentId -> { obtainedMarks, remarks }
  const [marksSheet, setMarksSheet] = useState({});

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
      console.error('Error fetching marks setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    const matched = subjects.filter((s) => (s.course?._id || s.course) === courseId);
    if (matched.length > 0) {
      setSelectedSubject(matched[0]._id);
    } else {
      setSelectedSubject('');
    }
  };

  const handleExamTypeChange = (type) => {
    setSelectedExamType(type);
    if (type === 'Internal Assessment') setMaxMarks(25);
    else if (type === 'Assignment') setMaxMarks(20);
    else if (type === 'Mid-Semester') setMaxMarks(50);
    else if (type === 'End-Semester') setMaxMarks(100);
  };

  useEffect(() => {
    if (selectedCourse && selectedSubject && selectedExamType) {
      loadStudentsAndMarks();
    }
  }, [selectedCourse, selectedSemester, selectedSubject, selectedExamType]);

  const loadStudentsAndMarks = async () => {
    try {
      const [resEn, resMarks] = await Promise.all([
        api.get('/enrollments', {
          params: { course: selectedCourse, status: 'Active' },
        }),
        api.get('/marks', {
          params: {
            course: selectedCourse,
            subject: selectedSubject,
            examType: selectedExamType,
            semester: selectedSemester,
          },
        }),
      ]);

      const studentsList = resEn.data.data?.map((e) => e.student).filter(Boolean) || [];
      setEnrolledStudents(studentsList);

      const existingMarks = resMarks.data.data || [];
      const markMap = {};

      existingMarks.forEach((m) => {
        const sId = m.student?._id || m.student;
        markMap[sId] = {
          obtainedMarks: m.obtainedMarks,
          remarks: m.remarks || '',
        };
      });

      const sheet = {};
      studentsList.forEach((st) => {
        sheet[st._id] = markMap[st._id] || {
          obtainedMarks: '',
          remarks: '',
        };
      });

      setMarksSheet(sheet);
    } catch (err) {
      console.error('Error loading examination marks:', err);
    }
  };

  const handleMarkChange = (studentId, value) => {
    const val = value === '' ? '' : Math.min(Number(maxMarks), Math.max(0, Number(value)));
    setMarksSheet((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedMarks: val,
      },
    }));
  };

  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });

      const marksList = enrolledStudents
        .map((st) => ({
          studentId: st._id,
          obtainedMarks: marksSheet[st._id]?.obtainedMarks,
          remarks: marksSheet[st._id]?.remarks || '',
        }))
        .filter((item) =>
          item.studentId &&
          item.obtainedMarks !== '' &&
          item.obtainedMarks !== undefined &&
          item.obtainedMarks !== null
        );

      if (marksList.length === 0) {
        setMessage({ text: 'Enter at least one obtained mark before saving.', type: 'error' });
        setSaving(false);
        return;
      }

      const payload = {
        course: selectedCourse,
        semester: Number(selectedSemester),
        subject: selectedSubject,
        examType: selectedExamType,
        maxMarks: Number(maxMarks),
        marksList,
      };

      const res = await api.post('/marks', payload);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        loadStudentsAndMarks();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to save examination marks',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const currentCourseSubjects = subjects.filter(
    (s) => (s.course?._id || s.course) === selectedCourse
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Examinations & Marks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record assessment marks, publish exam scores, and auto-compute student performance grades
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Type</label>
          <select
            value={selectedExamType}
            onChange={(e) => handleExamTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="Internal Assessment">Internal Assessment</option>
            <option value="Assignment">Assignment</option>
            <option value="Mid-Semester">Mid-Semester</option>
            <option value="End-Semester">End-Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks</label>
          <input
            type="number"
            min="1"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
          />
        </div>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="text-xs opacity-60 hover:opacity-100 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Marks Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-slate-800">
              {selectedExamType} &bull; Scoring Sheet
            </span>
            <span className="text-xs text-slate-400 ml-2">
              (Total Enrolled: {enrolledStudents.length})
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveMarks}
            disabled={saving || enrolledStudents.length === 0}
            className="px-4 py-2 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Marks to MongoDB'}</span>
          </button>
        </div>

        {enrolledStudents.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No students available"
            description="No active students are enrolled in this course for marks entry."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Registration No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Obtained Marks</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4 text-center">Calculated Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrolledStudents.map((st) => {
                  const rawObtained = marksSheet[st._id]?.obtainedMarks;
                  const obtained = rawObtained !== '' && rawObtained !== undefined ? Number(rawObtained) : 0;
                  const pct = maxMarks > 0 ? parseFloat(((obtained / maxMarks) * 100).toFixed(1)) : 0;
                  const grade = rawObtained !== '' ? computeGrade(pct) : '-';

                  const gradeBadgeVariant =
                    grade === 'A+' || grade === 'A'
                      ? 'success'
                      : grade === 'B' || grade === 'C'
                      ? 'primary'
                      : grade === 'D'
                      ? 'warning'
                      : 'danger';

                  return (
                    <tr key={st._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {st.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{st.fullName}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {subjects.find((s) => s._id === selectedSubject)?.subjectCode || 'Sub'}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={rawObtained !== undefined ? rawObtained : ''}
                          onChange={(e) => handleMarkChange(st._id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">/ {maxMarks}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {rawObtained !== '' ? `${pct}%` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {grade !== '-' ? (
                          <Badge variant={gradeBadgeVariant}>{grade}</Badge>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          value={marksSheet[st._id]?.remarks || ''}
                          onChange={(e) =>
                            setMarksSheet((prev) => ({
                              ...prev,
                              [st._id]: {
                                ...prev[st._id],
                                remarks: e.target.value,
                              },
                            }))
                          }
                          placeholder="Feedback..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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

export default Marks;
