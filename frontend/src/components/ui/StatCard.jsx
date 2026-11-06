import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last semester',
  color = 'blue',
  subtitle,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border} transition-transform duration-200 group-hover:scale-110 shadow-sm`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>

        {(trend !== undefined || subtitle) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {trend !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                  trend >= 0
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            <span className="text-slate-400 font-medium">{subtitle || trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
