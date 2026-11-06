import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Shield,
  Percent,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/Feedback';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setMessage({ text: 'Institutional settings saved successfully to MongoDB', type: 'success' });
        setSettings(res.data.data);
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update settings',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <LoadingSpinner text="Retrieving institutional configurations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">System & Institutional Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage university identity, academic calendar, and automated grading thresholds
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Institutional Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Campus Identity & Information</h3>
              <p className="text-xs text-slate-400">Institutional branding and contact records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Code</label>
              <input
                type="text"
                value={settings.institutionCode}
                onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administration Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telephone Contact</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Academic Calendar & Thresholds */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Academic Regulations</h3>
              <p className="text-xs text-slate-400">Current calendar term and minimum attendance rule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Academic Year</label>
              <input
                type="text"
                value={settings.currentAcademicYear}
                onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                placeholder="2025-2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Term / Semester</label>
              <input
                type="text"
                value={settings.currentSemester}
                onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
                placeholder="Semester 4"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Attendance Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.minimumAttendancePercentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minimumAttendancePercentage: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Configurable Grading Rules Display */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <Percent className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Standard Grading Matrix</h3>
              <p className="text-xs text-slate-400">Automated letter grade calculation benchmarks</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { grade: 'A+', min: '≥ 90%', desc: 'Outstanding', variant: 'success' },
              { grade: 'A', min: '≥ 80%', desc: 'Excellent', variant: 'success' },
              { grade: 'B', min: '≥ 70%', desc: 'Very Good', variant: 'primary' },
              { grade: 'C', min: '≥ 60%', desc: 'Good', variant: 'primary' },
              { grade: 'D', min: '≥ 50%', desc: 'Pass', variant: 'warning' },
              { grade: 'F', min: '< 50%', desc: 'Fail', variant: 'danger' },
            ].map((rule, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <Badge variant={rule.variant} className="text-sm font-extrabold px-3 py-1">
                  {rule.grade}
                </Badge>
                <p className="text-xs font-bold text-slate-800 mt-2">{rule.min}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
