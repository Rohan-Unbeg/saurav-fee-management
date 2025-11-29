import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import API_URL from '@/config';
import { useAuth } from '@/context/AuthContext';

interface Course {
  _id: string;
  name: string;
  duration: string;
  standardFee: number;
}

const Settings = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    standardFee: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      duration: course.duration,
      standardFee: course.standardFee,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/api/courses/${deleteId}`);
      fetchCourses();
      toast.success('Course deleted');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete course';
      toast.error(errorMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.standardFee < 0) {
      toast.error('Standard Fee cannot be negative');
      return;
    }

    try {
      if (editingCourse) {
        await axios.put(`${API_URL}/api/courses/${editingCourse._id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await axios.post(`${API_URL}/api/courses`, formData);
        toast.success('Course added successfully');
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setFormData({ name: '', duration: '', standardFee: 0 });
      fetchCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save course';
      toast.error(errorMsg);
    }
  };

  const openNewCourseModal = () => {
    setEditingCourse(null);
    setFormData({ name: '', duration: '', standardFee: 0 });
    setIsModalOpen(true);
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d*$/.test(value)) return;
    setFormData({...formData, standardFee: Number(value)});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-slate-500">Manage courses, users, and system configurations.</p>
        </div>
      </div>

      {/* User Management Section - Only for Admins */}
      <UserManagement />

      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-semibold">Course Management</h3>
        <Button onClick={openNewCourseModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Course Name</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Standard Fee</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{course.name}</td>
                    <td className="px-6 py-4">{course.duration}</td>
                    <td className="px-6 py-4">₹{course.standardFee}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(course)} aria-label="Edit Course">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(course._id)}
                          aria-label="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

      </Card>



      <BackupRestoreSection />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input 
              id="duration" 
              value={formData.duration} 
              onChange={(e) => setFormData({...formData, duration: e.target.value})} 
              placeholder="e.g. 3 Months"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="standardFee">Standard Fee (₹)</Label>
            <Input 
              id="standardFee" 
              value={formData.standardFee} 
              onChange={handleFeeChange} 
              placeholder="0"
              required 
            />
          </div>
          <Button type="submit" className="w-full">
            {editingCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
};

const BackupRestoreSection = () => {
  const [backups, setBackups] = useState<string[]>([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const fetchBackups = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/backup/list`);
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleRestoreClick = () => {
    if (!selectedBackup) return;
    setIsRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/backup/restore/${selectedBackup}`);
      toast.success('System restored successfully! Please refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Restore failed');
    } finally {
      setIsLoading(false);
      setIsRestoreModalOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Button onClick={async () => {
              try {
                const response = await axios.get(`${API_URL}/api/backup/export`);
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "fee_system_backup.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                toast.success('Backup exported successfully');
              } catch (error) {
                console.error('Export failed:', error);
                toast.error('Export failed');
              }
            }} className="w-full md:w-auto">
              Download Manual Backup (JSON)
            </Button>
            
            <div className="relative w-full md:w-auto">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const jsonData = JSON.parse(event.target?.result as string);
                      await axios.post(`${API_URL}/api/backup/import`, jsonData);
                      toast.success('Data imported successfully! Please refresh.');
                      window.location.reload();
                    } catch (error) {
                      console.error('Import failed:', error);
                      toast.error('Import failed. Invalid file format.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <Button variant="outline" className="w-full md:w-auto">Upload Manual Backup (JSON)</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Restore from Auto-Backup (Server)</h4>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                className="flex h-10 w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={selectedBackup}
                onChange={(e) => setSelectedBackup(e.target.value)}
              >
                <option value="">Select a backup point...</option>
                {backups.map((backup) => {
                  const parts = backup.split('T');
                  const datePart = parts[0];
                  const timePart = parts[1].replace(/-/g, ':').replace('Z', '');
                  const displayDate = new Date(`${datePart}T${timePart}`).toLocaleString();
                  
                  return (
                    <option key={backup} value={backup}>
                      {displayDate !== 'Invalid Date' ? displayDate : backup}
                    </option>
                  );
                })}
              </select>
              <Button 
                variant="destructive" 
                onClick={handleRestoreClick}
                disabled={!selectedBackup || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? 'Restoring...' : 'Restore Selected Backup'}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Select a timestamp to restore the system to that state. This is irreversible.
            </p>
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={confirmRestore}
        title="Restore System Backup"
        message="WARNING: This will replace ALL current data with the selected backup. This action cannot be undone. Are you sure?"
        variant="destructive"
        confirmText="Restore Data"
      />
    </>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'staff' });
  const [loading, setLoading] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      toast.success('User created successfully');
      setIsModalOpen(false);
      setFormData({ username: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userDeleteId) return;
    try {
      await axios.delete(`${API_URL}/api/auth/users/${userDeleteId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (currentUser?.role !== 'admin') return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{user.username}</td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {user._id !== currentUser?.id && !user.isSuperAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New User"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <p className="text-xs text-slate-500">Must be 8+ chars, 1 uppercase, 1 number.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </Modal>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        variant="destructive"
        confirmText="Delete User"
      />
    </>
  );
};

export default Settings;
