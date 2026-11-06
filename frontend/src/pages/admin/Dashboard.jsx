import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  UserCheck,
  Calendar,
  Eye,
  Activity,
  ArrowRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import api from '../../api/axiosClient';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import {
  EnrollmentLineChart,
  AttendanceBarChart,
  PerformanceBarChart,
  CourseDonutChart,
} from '../../components/charts/DashboardCharts';
import { LoadingSpinner } from '../../components/ui/Feedback';
import Modal from '../../components/ui/Modal';

const Dashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = async (studentId) => {
    try {
      setSelectedStudent(studentId);
      setModalLoading(true);
      const res = await api.get(`/students/${studentId}`);
      if (res.data.success) {
        setStudentDetails(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving institutional analytics from MongoDB..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const { stats, charts, recentStudents = [], recentActivities = [] } = data || {};

  // Dynamic formatted date
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* A. Welcome Banner Section */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1e40af] to-[#2563eb] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/20 text-xs font-medium text-blue-100 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateString}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good Morning, Admin!
            </h2>
            <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
              Here's an overview of your academic institution. Real-time metrics aggregated directly from MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2.5 bg-white text-primary font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-primary" />
              <span>Manage Students</span>
            </button>
            <button
              onClick={() => {
                window.location.hash = 'add-student';
                onNavigate('students');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-emerald-400/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => onNavigate('marks')}
              className="px-4 py-2.5 bg-blue-600/60 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl border border-blue-400/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Record Marks</span>
            </button>
          </div>
        </div>
      </div>

      {/* B. Six Dynamic Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="blue"
          trend={stats?.studentGrowthPercentage}
          trendLabel="active batch"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={GraduationCap}
          color="indigo"
          subtitle="Accredited Degrees"
        />
        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects || 0}
          icon={BookOpen}
          color="purple"
          subtitle="Curriculum Modules"
        />
        <StatCard
          title="Average Attendance"
          value={`${stats?.averageAttendance || 0}%`}
          icon={CalendarCheck}
          color="emerald"
          trend={stats?.averageAttendance >= 75 ? 2.4 : -1.8}
          trendLabel="institutional avg"
        />
        <StatCard
          title="Avg Academic Score"
          value={`${stats?.averagePerformance || 0}%`}
          icon={Award}
          color="amber"
          subtitle="Cumulative GPA Avg"
        />
        <StatCard
          title="Total Enrollments"
          value={stats?.totalEnrollments || 0}
          icon={UserCheck}
          color="rose"
          subtitle="Active Course Links"
        />
      </div>

      {/* C. Charts and Analytics: Responsive Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentLineChart data={charts?.enrollmentOverview} />
        <AttendanceBarChart data={charts?.attendanceOverview} />
        <PerformanceBarChart data={charts?.subjectPerformance} />
        <CourseDonutChart data={charts?.courseDistribution} />
      </div>

      {/* D & E. Two-Column Bottom Section: Recent Students & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D. Recently Registered Students Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recently Registered Students</h3>
              <p className="text-xs text-slate-400">Latest 5 students enrolled into the system</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Sem</th>
                  <th className="py-3 px-3">Registration Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {st.registrationNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {st.course?.courseCode || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">Sem {st.semester}</td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={st.status === 'Active' ? 'success' : 'warning'}>
                        {st.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleViewStudent(st._id)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* E. Recent Administrative Activities (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Activities</h3>
              <p className="text-xs text-slate-400">Audit trail of campus updates</p>
            </div>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 group">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-50 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">{act.performedBy}</span>
                    <span>&bull;</span>
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => {
          setSelectedStudent(null);
          setStudentDetails(null);
        }}
        title="Student Academic Profile"
        maxWidth="max-w-2xl"
      >
        {modalLoading || !studentDetails ? (
          <LoadingSpinner text="Fetching student profile..." />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold">
                {studentDetails.fullName?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">{studentDetails.fullName}</h4>
                  <Badge variant="success">{studentDetails.status}</Badge>
                </div>
                <p className="text-xs font-mono text-slate-500">{studentDetails.registrationNumber}</p>
                <p className="text-xs text-slate-600 mt-1">{studentDetails.course?.courseName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Semester</p>
                <p className="text-base font-extrabold text-blue-900 mt-0.5">{studentDetails.semester}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Attendance</p>
                <p className="text-base font-extrabold text-emerald-900 mt-0.5">
                  {studentDetails.attendanceStats?.attendancePercentage || 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <p className="text-[10px] font-bold text-purple-600 uppercase">Classes Taken</p>
                <p className="text-base font-extrabold text-purple-900 mt-0.5">
                  {studentDetails.attendanceStats?.totalClasses || 0}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Classes Present</p>
                <p className="text-base font-extrabold text-amber-900 mt-0.5">
                  {studentDetails.attendanceStats?.classesAttended || 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contact & Department</h5>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="font-semibold text-slate-800">{studentDetails.email}</span>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-semibold text-slate-800">{studentDetails.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>{' '}
                  <span className="font-semibold text-slate-800">{studentDetails.department}</span>
                </div>
                <div>
                  <span className="text-slate-400">Gender:</span>{' '}
                  <span className="font-semibold text-slate-800">{studentDetails.gender}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Address:</span>{' '}
                  <span className="font-semibold text-slate-800">{studentDetails.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
