import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Courses from './pages/admin/Courses';
import Subjects from './pages/admin/Subjects';
import Enrollments from './pages/admin/Enrollments';
import Attendance from './pages/admin/Attendance';
import Marks from './pages/admin/Marks';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminAnnouncements from './pages/admin/Announcements';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarks from './pages/student/StudentMarks';
import StudentProfile from './pages/student/StudentProfile';
import StudentAnnouncements from './pages/student/StudentAnnouncements';

import { LoadingSpinner } from './components/ui/Feedback';

function App() {
  const { isAuthenticated, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => (role === 'student' ? 'student-dashboard' : 'dashboard'));

  // Ensure default active tab aligns with role
  React.useEffect(() => {
    if (role === 'student' && !activeTab.startsWith('student-')) {
      setActiveTab('student-dashboard');
    } else if (role === 'admin' && activeTab.startsWith('student-')) {
      setActiveTab('dashboard');
    }
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Initializing Student Academic Management System..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Titles and breadcrumbs map
  const metaMap = {
    dashboard: { title: 'Academic Executive Dashboard', breadcrumbs: ['Admin', 'Dashboard'] },
    students: { title: 'Student Management Directory', breadcrumbs: ['Admin', 'Students'] },
    courses: { title: 'Degree Course Curriculums', breadcrumbs: ['Admin', 'Courses'] },
    subjects: { title: 'Curriculum Subjects & Faculty', breadcrumbs: ['Admin', 'Subjects'] },
    enrollments: { title: 'Student Course Enrollments', breadcrumbs: ['Admin', 'Enrollments'] },
    attendance: { title: 'Daily Attendance Ledger', breadcrumbs: ['Admin', 'Attendance'] },
    marks: { title: 'Examinations & Marks Ledger', breadcrumbs: ['Admin', 'Examinations'] },
    reports: { title: 'Institutional Academic Reports', breadcrumbs: ['Admin', 'Reports'] },
    settings: { title: 'Institutional & System Settings', breadcrumbs: ['Admin', 'Settings'] },
    announcements: { title: 'Announcements Management', breadcrumbs: ['Admin', 'Announcements'] },

    'student-announcements': { title: 'My Announcements', breadcrumbs: ['Student', 'Announcements'] },

    'student-dashboard': { title: 'Student Academic Portal', breadcrumbs: ['Student', 'Dashboard'] },
    'student-attendance': { title: 'My Lecture Attendance Record', breadcrumbs: ['Student', 'Attendance'] },
    'student-marks': { title: 'My Examination Results', breadcrumbs: ['Student', 'Exam Results'] },
    'student-profile': { title: 'My Academic Profile', breadcrumbs: ['Student', 'Profile'] },
  };

  const currentMeta = metaMap[activeTab] || { title: 'SAMS Portal', breadcrumbs: ['Home'] };

  const renderContent = () => {
    switch (activeTab) {
      // Admin Views
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveTab} />;
      case 'students':
        return <Students />;
      case 'courses':
        return <Courses />;
      case 'subjects':
        return <Subjects />;
      case 'enrollments':
        return <Enrollments />;
      case 'attendance':
        return <Attendance />;
      case 'marks':
        return <Marks />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'announcements':
        return <AdminAnnouncements />;

      // Student Views
      case 'student-dashboard':
        return <StudentDashboard onNavigate={setActiveTab} />;
      case 'student-attendance':
        return <StudentAttendance />;
      case 'student-marks':
        return <StudentMarks />;
      case 'student-profile':
        return <StudentProfile />;
      case 'student-announcements':
        return <StudentAnnouncements />;

      default:
        return role === 'admin' ? (
          <AdminDashboard onNavigate={setActiveTab} />
        ) : (
          <StudentDashboard onNavigate={setActiveTab} />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={currentMeta.title}
      breadcrumbs={currentMeta.breadcrumbs}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
