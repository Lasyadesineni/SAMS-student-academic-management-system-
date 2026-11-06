import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Users,
  Clock,
  Building,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    courseCode: '',
    courseName: '',
    department: 'School of Computing',
    duration: '4 Years',
    totalSemesters: 8,
    description: '',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setSelectedCourse(c);
    setFormData({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department,
      duration: c.duration,
      totalSemesters: c.totalSemesters,
      description: c.description,
      status: c.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenView = async (id) => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) {
        setSelectedCourse(res.data.data);
        setIsViewOpen(true);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/courses/${selectedCourse._id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      setDeleteConfirmId(null);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Course Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define degree curriculums, durations, and manage course offerings</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving degree courses from MongoDB..." />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses found"
          description="Click 'Add Course' above to create your first degree curriculum."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-primary border border-blue-100">
                    {course.courseCode}
                  </span>
                  <Badge variant={course.status === 'Active' ? 'success' : 'default'}>
                    {course.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                  {course.courseName}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{course.department}</p>

                <p className="text-xs text-slate-500 line-clamp-2 mt-3 mb-4">
                  {course.description || 'Comprehensive university degree curriculum program.'}
                </p>

                {/* Metadata badges */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 mb-4 bg-slate-50/50 rounded-xl px-3">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-slate-800">
                      {course.enrolledStudentsCount || 0} Enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleOpenView(course._id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(course._id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Course Curriculum' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
            <input
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) =>
                setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })
              }
              placeholder="CS101"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Full Name *</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="B.Tech in Computer Science and Engineering"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="School of Computing"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration *</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="4 Years"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Semesters</label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.totalSemesters}
                onChange={(e) =>
                  setFormData({ ...formData, totalSemesters: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Curriculum overview and academic objectives..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl font-semibold shadow disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Course Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Course Curriculum Details"
      >
        {selectedCourse && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-mono font-bold text-xs text-primary px-2 py-0.5 rounded bg-blue-100">
                {selectedCourse.courseCode}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-2">{selectedCourse.courseName}</h4>
              <p className="text-slate-500 mt-1">{selectedCourse.department}</p>
              <p className="text-slate-600 mt-3">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-blue-600">Duration</span>
                <p className="text-sm font-extrabold text-blue-900 mt-0.5">{selectedCourse.duration}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-purple-600">Semesters</span>
                <p className="text-sm font-extrabold text-purple-900 mt-0.5">{selectedCourse.totalSemesters}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Enrolled</span>
                <p className="text-sm font-extrabold text-emerald-900 mt-0.5">
                  {selectedCourse.enrolledStudentsCount || 0}
                </p>
              </div>
            </div>

            {selectedCourse.subjects && selectedCourse.subjects.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Associated Subjects ({selectedCourse.subjects.length})
                </h5>
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {selectedCourse.subjects.map((sub) => (
                    <div key={sub._id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{sub.subjectName}</span>
                        <span className="text-slate-400 ml-2 font-mono">({sub.subjectCode})</span>
                      </div>
                      <span className="text-slate-500">{sub.credits} Credits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Course Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete this course? If students are enrolled in this course,
            you will not be able to delete it until they are reassigned.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Courses;
