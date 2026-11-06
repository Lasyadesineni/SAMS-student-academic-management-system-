import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, role, logout } = useAuth();

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'enrollments', label: 'Enrollments', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'Examinations & Marks', icon: Award },
    { id: 'reports', label: 'Academic Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'student-marks', label: 'Exam Results', icon: Award },
    { id: 'student-profile', label: 'My Profile', icon: Users },
    { id: 'student-announcements', label: 'Announcements', icon: Megaphone },
  ];

  const navItems = role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-[#1E3A8A] text-white flex flex-col min-h-screen shadow-xl z-20 flex-shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-blue-900/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 shadow-inner">
          <GraduationCap className="w-6 h-6 text-blue-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-wider text-white">SAMS</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-600/40 text-blue-200 border border-blue-400/20">
              {role === 'admin' ? 'Admin' : 'Portal'}
            </span>
          </div>
          <p className="text-[11px] text-blue-200/80 leading-tight">Student Academic System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-blue-300/60 uppercase">
          {role === 'admin' ? 'Administration' : 'Student Portal'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                  : 'text-blue-100/80 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-blue-300 group-hover:text-blue-100'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Button */}
      <div className="p-4 border-t border-blue-900/50 bg-[#172e6e]/60">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-300/30 flex items-center justify-center font-bold text-sm text-white overflow-hidden shadow">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-blue-200/70 truncate capitalize">{role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-200 hover:text-white hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
