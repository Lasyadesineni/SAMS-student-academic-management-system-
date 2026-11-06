import React from 'react';

export const LoadingSpinner = ({ text = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
    <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>
  </div>
);

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no entries matching your current filters or search query.',
  action,
}) => (
  <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200 my-4">
    {Icon && (
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    )}
    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
    {action && <div>{action}</div>}
  </div>
);
