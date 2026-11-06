import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl py-2 px-3 shadow-xl border border-slate-700">
        <p className="font-bold text-slate-200 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-semibold text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Chart 1: Student Enrollment Overview (Line Chart)
export const EnrollmentLineChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Student Enrollment Overview</h4>
          <p className="text-xs text-slate-400">Monthly student registration trend</p>
        </div>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          Monthly Cohort
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="students"
              name="Students"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1E3A8A', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Chart 2: Attendance Overview (Bar Chart)
export const AttendanceBarChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Attendance Overview</h4>
          <p className="text-xs text-slate-400">Daily distribution of Present, Absent & Leave</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Leave" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Chart 3: Academic Performance (Bar Chart)
export const PerformanceBarChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Academic Performance</h4>
          <p className="text-xs text-slate-400">Average marks (%) across subjects</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="subjectCode" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              formatter={(value, name, item) => [
                `${value}% (${item.payload.subjectName})`,
                'Avg Score',
              ]}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="averageMarks"
              name="Avg Marks %"
              fill="#1E3A8A"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 4. Chart 4: Course Distribution (Donut Chart)
export const CourseDonutChart = ({ data = [] }) => {
  const COLORS = ['#1E3A8A', '#3B82F6', '#0EA5E9', '#6366F1', '#10B981'];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Course Distribution</h4>
          <p className="text-xs text-slate-400">Enrolled students distribution by course</p>
        </div>
      </div>
      <div className="h-64 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400">No enrollment records</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, item) => [
                  `${value} students (${item.payload.fullName || name})`,
                  'Enrolled',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-slate-600 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
