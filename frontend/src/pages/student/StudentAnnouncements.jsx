import React, { useEffect, useState } from 'react';
import { Megaphone, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../api/axiosClient';
import { LoadingSpinner } from '../../components/ui/Feedback';

const StudentAnnouncements = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements').then((res) => {
      if (res.data.success) setItems(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-extrabold text-slate-800">Announcements</h2><p className="text-xs text-slate-500 mt-1">Important notices published by the administration</p></div>
      {items.length === 0 ? <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center"><Megaphone className="w-8 h-8 mx-auto text-slate-300 mb-3" /><p className="text-sm text-slate-500">No announcements are available.</p></div> : (
        <div className="space-y-3">{items.map((item) => (
          <article key={item._id} className={`bg-white rounded-2xl border p-5 shadow-card ${item.priority === 'urgent' ? 'border-red-200' : item.priority === 'important' ? 'border-amber-200' : 'border-slate-100'}`}>
            <div className="flex items-start gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.priority === 'urgent' ? 'bg-red-50 text-red-600' : item.priority === 'important' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-primary'}`}>{item.priority === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}</div><div><h3 className="font-bold text-slate-800 text-sm">{item.title}</h3><p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{item.message}</p><div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-3"><Calendar className="w-3.5 h-3.5" />{new Date(item.publishDate).toLocaleString()}</div></div></div>
          </article>
        ))}</div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
