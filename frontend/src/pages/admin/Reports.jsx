import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  CalendarCheck,
  Award,
  Filter,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const Reports = () => {
  const [reportType, setReportType] = useState('performance'); // 'performance' | 'attendance'
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Report Data
  const [performanceData, setPerformanceData] = useState([]);
  const [subjectAverages, setSubjectAverages] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (reportType === 'performance') {
      fetchPerformanceReport();
    } else {
      fetchAttendanceReport();
    }
  }, [reportType, courseFilter, semesterFilter, subjectFilter]);

  const fetchMetadata = async () => {
    try {
      const [resC, resSub] = await Promise.all([api.get('/courses'), api.get('/subjects')]);
      if (resC.data.success) setCourses(resC.data.data);
      if (resSub.data.success) setSubjects(resSub.data.data);
    } catch (err) {
      console.error('Error fetching report metadata:', err);
    }
  };

  const fetchPerformanceReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/performance', {
        params: {
          course: courseFilter,
          semester: semesterFilter,
          subject: subjectFilter,
        },
      });
      if (res.data.success) {
        setPerformanceData(res.data.data);
        setSubjectAverages(res.data.subjectAverages || []);
      }
    } catch (err) {
      console.error('Error loading performance report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/attendance', {
        params: {
          course: courseFilter,
          semester: semesterFilter,
          subject: subjectFilter,
        },
      });
      if (res.data.success) {
        setAttendanceData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading attendance report:', err);
    } finally {
      setLoading(false);
    }
  };

  // CSV Generator from actual MongoDB Data
  const handleDownloadCSV = () => {
    if (reportType === 'performance') {
      if (performanceData.length === 0) return alert('No data to export');
      const headers = [
        'Registration Number',
        'Student Name',
        'Course',
        'Subject',
        'Exam Type',
        'Obtained Marks',
        'Max Marks',
        'Percentage (%)',
        'Grade',
        'Academic Year',
      ];
      const rows = performanceData.map((d) => [
        `"${d.registrationNumber}"`,
        `"${d.studentName}"`,
        `"${d.courseName || ''}"`,
        `"${d.subjectName} (${d.subjectCode})"`,
        `"${d.examType}"`,
        d.obtainedMarks,
        d.maxMarks,
        d.percentage,
        d.grade,
        `"${d.academicYear}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Academic_Performance_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (attendanceData.length === 0) return alert('No data to export');
      const headers = [
        'Registration Number',
        'Student Name',
        'Department',
        'Course',
        'Total Classes',
        'Present',
        'Absent',
        'Leave',
        'Attendance Percentage (%)',
      ];
      const rows = attendanceData.map((d) => [
        `"${d.registrationNumber}"`,
        `"${d.name}"`,
        `"${d.department}"`,
        `"${d.courseName || ''}"`,
        d.totalClasses,
        d.present,
        d.absent,
        d.leave,
        d.attendancePercentage,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Institutional_Attendance_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Academic Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official institutional grade sheets, subject performance analyses, and attendance logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Toggle & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        {/* Toggle Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setReportType('performance')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              reportType === 'performance'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Academic Performance</span>
          </button>

          <button
            onClick={() => setReportType('attendance')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              reportType === 'attendance'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Attendance Reports</span>
          </button>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subjectCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Summary Cards (if performance active) */}
      {reportType === 'performance' && subjectAverages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
          {subjectAverages.slice(0, 3).map((sa, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {sa.subjectCode} Average Score
              </span>
              <div className="flex items-center justify-between mt-1">
                <h4 className="text-xl font-extrabold text-slate-900">{sa.avgPercentage}%</h4>
                <Badge variant={sa.avgPercentage >= 75 ? 'success' : 'primary'}>
                  High: {sa.highest} Marks
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">{sa.subjectName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Report Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {reportType === 'performance' ? 'Examination Results Dossier' : 'Institutional Attendance Audit'}
            </h3>
            <p className="text-xs text-slate-400">
              Data compiled from current MongoDB records
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Total Records: {reportType === 'performance' ? performanceData.length : attendanceData.length}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating academic report from MongoDB..." />
        ) : reportType === 'performance' ? (
          performanceData.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No examination marks found"
              description="No student examination marks match the selected course/semester filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Student Reg No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Type</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {performanceData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {d.registrationNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.studentName}</td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{d.courseName}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {d.subjectCode} - {d.subjectName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{d.examType}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {d.obtainedMarks} / {d.maxMarks}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-blue-700">{d.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            d.grade === 'A+' || d.grade === 'A'
                              ? 'success'
                              : d.grade === 'B' || d.grade === 'C'
                              ? 'primary'
                              : 'warning'
                          }
                        >
                          {d.grade}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : attendanceData.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records found"
            description="No attendance data matches the selected course or subject filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Total Classes</th>
                  <th className="py-3 px-4 text-emerald-600">Present</th>
                  <th className="py-3 px-4 text-rose-600">Absent</th>
                  <th className="py-3 px-4 text-amber-600">Leave</th>
                  <th className="py-3 px-4">Attendance Percentage</th>
                  <th className="py-3 px-4 text-center">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendanceData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {d.registrationNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 text-slate-600">{d.department}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.totalClasses}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{d.present}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{d.absent}</td>
                    <td className="py-3 px-4 font-bold text-amber-600">{d.leave}</td>
                    <td className="py-3 px-4 font-extrabold text-blue-700">
                      {d.attendancePercentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={d.attendancePercentage >= 75 ? 'success' : 'danger'}>
                        {d.attendancePercentage >= 75 ? 'Eligible' : 'Low Attendance'}
                      </Badge>
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

export default Reports;
