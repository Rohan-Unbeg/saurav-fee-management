import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { toast } from 'sonner';
import API_URL from '@/config';

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${API_URL}/api/courses/${id}`);
        fetchCourses();
        toast.success('Course deleted');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
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
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
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
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-slate-500">Manage courses and system configurations.</p>
        </div>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(course._id)}
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

      <Card>
        <CardHeader>
          <CardTitle>Data Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
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
            }}>
              Export Data (JSON)
            </Button>
            
            <div className="relative">
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
                      fetchCourses();
                    } catch (error) {
                      console.error('Import failed:', error);
                      toast.error('Import failed. Invalid file format.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <Button variant="outline">Import Data (JSON)</Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Settings;
