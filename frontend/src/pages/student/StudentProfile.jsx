import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, GraduationCap, Calendar, Shield } from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/Feedback';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      if (res.data.success) {
        setProfile(res.data.student);
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ text: '', type: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordLoading(false);
      setPasswordMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    try {
      const res = await api.put('/auth/change-password', passwordForm);
      if (res.data.success) {
        setPasswordMessage({ text: res.data.message, type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMessage({
        text: err.response?.data?.message || 'Failed to update password',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student dossier..." />;
  }

  if (!profile) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">My Student Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official institutional identification and enrollment information
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800">Student profile not linked</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
            Your account is active, but it is not connected to an academic student record yet. Ask an administrator to link your institution email or registration number.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">My Student Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official institutional identification and enrollment information
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-primary text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-blue-900/20">
            {profile.fullName?.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900">{profile.fullName}</h3>
              <Badge variant="success" className="self-center sm:self-auto text-xs px-3 py-1">
                {profile.status} Student
              </Badge>
            </div>
            <p className="font-mono font-bold text-xs text-blue-600 mt-1">
              Registration No: {profile.registrationNumber}
            </p>
            <p className="text-xs text-slate-500 mt-1">{profile.course?.courseName}</p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Mail className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Official Campus Email
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Phone className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Emergency Phone Number
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.phone}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Building className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Department
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.department}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <GraduationCap className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Semester
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">Semester {profile.semester}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Date of Birth
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <User className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Gender
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.gender}</p>
            </div>
          </div>

          <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Registered Residential Address
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{profile.address}</p>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordChange}>
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-600">Current Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-100 rounded-2xl"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">New Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-100 rounded-2xl"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-100 rounded-2xl"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              {passwordMessage.text && (
                <div className={`text-sm mb-3 ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage.text}
                </div>
              )}
              <button type="submit" disabled={passwordLoading} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-50">
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
              <p className="text-[11px] text-slate-400 mt-3">
                Password values are hidden for security. MongoDB stores a secure password hash, not readable old passwords.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
