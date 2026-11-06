import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../../api/axiosClient';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const initialForm = { title: '', message: '', audience: 'students', priority: 'normal', publishDate: '', expiryDate: '' };

const AdminAnnouncements = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await api.get('/announcements');
    if (res.data.success) setItems(res.data.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/announcements', form);
      if (res.data.success) {
        setOpen(false);
        setForm(initialForm);
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add announcement');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="text-xl font-extrabold text-slate-800">Announcements</h2><p className="text-xs text-slate-500 mt-1">Publish notices that students can read</p></div>
        <button onClick={() => setOpen(true)} className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-2"><Plus className="w-4 h-4" />Add Announcement</button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-500">No announcements yet</div> : items.map((item) => (
          <article key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary"/><h3 className="font-bold text-slate-800 text-sm">{item.title}</h3><Badge variant={item.priority === 'urgent' ? 'danger' : item.priority === 'important' ? 'warning' : 'primary'}>{item.priority}</Badge></div><p className="text-xs text-slate-600 mt-3 whitespace-pre-wrap">{item.message}</p><p className="text-[11px] text-slate-400 mt-3">Audience: {item.audience} • Published {new Date(item.publishDate).toLocaleString()}</p></div><button onClick={() => remove(item._id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></div>
          </article>
        ))}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Announcement">
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
          <div><label className="block text-xs font-bold text-slate-700 mb-1">Title *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" /></div>
          <div><label className="block text-xs font-bold text-slate-700 mb-1">Announcement *</label><textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-700 mb-1">Audience</label><select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"><option value="students">Students</option><option value="all">All Users</option><option value="admins">Admins</option></select></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-700 mb-1">Publish Date</label><input type="datetime-local" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" /></div><div><label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label><input type="datetime-local" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl" /></div></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button><button disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">{saving ? 'Publishing...' : 'Publish Announcement'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;
