import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarCheck,
  Award,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../api/axiosClient';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/Feedback';

const StudentDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your student dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your academic records..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const { student, stats, enrollments = [], recentMarks = [], recentAttendance = [], charts, profileLinked = true } = data || {};

  if (!profileLinked || !student) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Student Profile Not Linked</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Your account is active, but no student record is linked to it. Ask an administrator to link your email or registration number to your academic profile.
        </p>
      </div>
    );
  }

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#2563eb] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/20 text-xs font-medium text-blue-100 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateString}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.fullName || 'Student'}!
            </h2>
            <p className="text-xs md:text-sm text-blue-100/90 mt-1 max-w-xl">
              Registration No: <span className="font-mono font-bold text-white">{student?.registrationNumber}</span> &bull;{' '}
              {student?.course?.courseName || 'Undergraduate Degree'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('student-marks')}
              className="px-4 py-2 bg-white text-primary font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-primary" />
              <span>View Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={stats?.enrolledCourses || 0}
          icon={BookOpen}
          color="blue"
          subtitle="Active Program"
        />
        <StatCard
          title="Average Attendance"
          value={`${stats?.averageAttendance || 0}%`}
          icon={CalendarCheck}
          color="emerald"
          trend={stats?.averageAttendance >= 75 ? 2.5 : -1.2}
          trendLabel={stats?.averageAttendance >= 75 ? 'Above 75% target' : 'Below attendance target'}
        />
        <StatCard
          title="Overall Percentage"
          value={`${stats?.overallPercentage || 0}%`}
          icon={Award}
          color="amber"
          subtitle="Cumulative Score"
        />
        <StatCard
          title="Current Semester"
          value={`Semester ${stats?.currentSemester || 1}`}
          icon={GraduationCap}
          color="purple"
          subtitle="Academic Progress"
        />
      </div>

      {/* Two Column Grid: Subject Performance Chart & Attendance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Performance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Subject-wise Performance</h3>
              <p className="text-xs text-slate-400">Score percentage achieved across examinations</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Your Exam Grades
            </span>
          </div>

          <div className="h-64 w-full">
            {charts?.subjectWisePerformance?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No examination marks recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts?.subjectWisePerformance}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="subject" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${value}% (${item.payload.marks} - Grade ${item.payload.grade})`,
                      item.payload.subjectName,
                    ]}
                  />
                  <Bar dataKey="score" name="Marks %" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Attendance Breakdown Donut (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Attendance Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Present vs Absent vs Approved Leave</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.attendanceBreakdown || []}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts?.attendanceBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Present</span>
              <p className="text-base font-extrabold text-emerald-800 mt-0.5">
                {stats?.classesAttended || 0}
              </p>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-rose-700">Absent</span>
              <p className="text-base font-extrabold text-rose-800 mt-0.5">
                {stats?.classesMissed || 0}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-700">Leave</span>
              <p className="text-base font-extrabold text-amber-800 mt-0.5">
                {stats?.classesLeave || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: My Courses and Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Enrolled Program & Subjects */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Curriculum Subjects</h3>
              <p className="text-xs text-slate-400">Assigned courses and faculty instructors</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
              Semester {student?.semester}
            </span>
          </div>

          <div className="space-y-3">
            {enrollments[0]?.subjects?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No subjects assigned yet.</p>
            ) : (
              enrollments[0]?.subjects?.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-primary font-bold flex items-center justify-center text-xs">
                      {sub.subjectCode}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{sub.subjectName}</h4>
                      <p className="text-[11px] text-slate-400">{sub.credits} Academic Credits</p>
                    </div>
                  </div>
                  <Badge variant="primary">Enrolled</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Examination Results */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Examination Results</h3>
              <p className="text-xs text-slate-400">Scores published by your academic department</p>
            </div>
            <button
              onClick={() => onNavigate('student-marks')}
              className="text-xs font-semibold text-primary hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMarks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No scores published yet.</p>
            ) : (
              recentMarks.slice(0, 5).map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{m.subject?.subjectName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {m.examType} &bull; {m.subject?.subjectCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">
                      {m.obtainedMarks} / {m.maxMarks}{' '}
                      <span className="text-blue-600 ml-1">({m.percentage}%)</span>
                    </div>
                    <Badge
                      variant={
                        m.grade === 'A+' || m.grade === 'A'
                          ? 'success'
                          : m.grade === 'B' || m.grade === 'C'
                          ? 'primary'
                          : 'warning'
                      }
                      className="mt-0.5"
                    >
                      Grade {m.grade}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
