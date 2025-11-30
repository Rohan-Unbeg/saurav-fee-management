import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';
import { Plus, Search, Edit, Trash2 /*, MessageCircle*/ } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Modal from '@/components/ui/modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AdmissionForm from '@/components/AdmissionForm';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';
import API_URL from '@/config';

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchStudents = async (pageNum = 1, search = debouncedSearch) => {
    try {
      setIsLoading(true);
      let url = `${API_URL}/api/students?page=${pageNum}&limit=10`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url);
      setStudents(response.data.data);
      setTotalPages(response.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch students when page or debounced search changes
  useEffect(() => {
    fetchStudents(page, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/api/students/${deleteId}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete student';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-slate-500">Manage your student records.</p>
        </div>
        <Button onClick={() => setIsAdmissionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Admission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search students..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Batch</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Skeleton Loading Rows
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24 mx-auto" /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {students.map((student) => (
                      <tr key={student._id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            {student.photoUrl && (
                              <img 
                                src={student.photoUrl.startsWith('http') ? student.photoUrl : `${API_URL}${student.photoUrl}`} 
                                alt={student.firstName} 
                                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(student.photoUrl)}
                              />
                            )}
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4">{student.studentMobile}</td>
                        <td className="px-6 py-4">{student.courseId?.name}</td>
                        <td className="px-6 py-4">{student.batch}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            student.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            student.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {/* <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                              onClick={() => {
                                const message = `Hello ${student.firstName}, this is from Saurav Computer.`;
                                window.open(`https://wa.me/91${student.studentMobile}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              title="Send WhatsApp Message"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button> */}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setEditingStudent(student);
                              setIsAdmissionOpen(true);
                            }} aria-label="Edit Student">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(student._id)}
                              aria-label="Delete Student"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No students found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

      </Card>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={(p) => setPage(p)} 
      />

      <Modal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        title={editingStudent ? "Edit Student Details" : "New Student Admission"}
      >
        <AdmissionForm 
          student={editingStudent}
          onSuccess={() => {
            setIsAdmissionOpen(false);
            setEditingStudent(null);
            fetchStudents();
          }}
          onCancel={() => {
            setIsAdmissionOpen(false);
            setEditingStudent(null);
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />

      {/* Image View Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Student Photo"
      >
        <div className="flex justify-center">
          <img 
            src={selectedImage ? (selectedImage.startsWith('http') ? selectedImage : `${API_URL}${selectedImage}`) : ''} 
            alt="Student" 
            className="max-w-full max-h-[60vh] object-contain rounded-md"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Students;
