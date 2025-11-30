import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import API_URL from '@/config';

interface Course {
  _id: string;
  name: string;
  standardFee: number;
}

interface AdmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  student?: any;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ onSuccess, onCancel, student }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    dob: student?.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
    gender: student?.gender || 'Male',
    address: student?.address || '',
    studentMobile: student?.studentMobile || '',
    parentMobile: student?.parentMobile || '',
    courseId: student?.courseId?._id || student?.courseId || '',
    batch: student?.batch || '',
    admissionDate: student?.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    totalFeeCommitted: student?.totalFeeCommitted || 0,
    nextInstallmentDate: student?.nextInstallmentDate ? new Date(student.nextInstallmentDate).toISOString().split('T')[0] : '',
    photo: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find(c => c._id === courseId);
    setFormData({
      ...formData,
      courseId,
      totalFeeCommitted: selectedCourse ? selectedCourse.standardFee : 0,
    });
    if (courseId) setErrors(prev => ({ ...prev, courseId: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Name Validation: Allow letters, spaces, hyphens, apostrophes
    if (name === 'firstName' || name === 'lastName') {
      if (value && !/^[a-zA-Z\s\-\']*$/.test(value)) return;
    }

    // Strict Number Validation for Mobile and Fee
    if (name === 'studentMobile' || name === 'parentMobile') {
      if (value && !/^\d*$/.test(value)) return; // Only allow digits
      if (value.length > 10) return; // Max 10 digits
    }
    if (name === 'totalFeeCommitted') {
       if (value && !/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
    if (value) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.studentMobile || formData.studentMobile.length !== 10) newErrors.studentMobile = 'Mobile must be 10 digits';
    if (!formData.parentMobile || formData.parentMobile.length !== 10) newErrors.parentMobile = 'Mobile must be 10 digits';
    if (!formData.courseId) newErrors.courseId = 'Course is required';
    if (!formData.batch.trim()) newErrors.batch = 'Batch is required';
    if (Number(formData.totalFeeCommitted) < 0) newErrors.totalFeeCommitted = 'Fee cannot be negative';

    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 3) {
        newErrors.dob = 'Student must be at least 3 years old';
      }
    } else {
      newErrors.dob = 'Date of Birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'photo') {
        if (formData.photo) data.append('photo', formData.photo);
      } else {
        data.append(key, (formData as any)[key]);
      }
    });

    try {
      if (student) {
        await axios.put(`${API_URL}/api/students/${student._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Student Updated Successfully!');
      } else {
        await axios.post(`${API_URL}/api/students`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Student Admitted Successfully!');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving student:', error);
      const errorMsg = error.response?.data?.length // Zod returns array
        ? error.response.data.map((e: any) => e.message).join(', ')
        : error.response?.data?.message || 'Failed to save student.';
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={errors.firstName ? 'border-red-500' : ''} />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={errors.lastName ? 'border-red-500' : ''} />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob" 
            name="dob" 
            type="date" 
            value={formData.dob} 
            onChange={handleChange} 
            max={new Date().toISOString().split('T')[0]}
            className={errors.dob ? 'border-red-500' : ''}
          />
          {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <select 
            id="gender" 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentMobile">Student Mobile</Label>
          <Input 
            id="studentMobile" 
            name="studentMobile" 
            value={formData.studentMobile} 
            onChange={handleChange} 
            placeholder="10-digit number"
            className={errors.studentMobile ? 'border-red-500' : ''}
          />
          {errors.studentMobile && <p className="text-xs text-red-500">{errors.studentMobile}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentMobile">Parent Mobile</Label>
          <Input 
            id="parentMobile" 
            name="parentMobile" 
            value={formData.parentMobile} 
            onChange={handleChange} 
            placeholder="10-digit number"
            className={errors.parentMobile ? 'border-red-500' : ''}
          />
          {errors.parentMobile && <p className="text-xs text-red-500">{errors.parentMobile}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="courseId">Course</Label>
          <select 
            id="courseId" 
            name="courseId" 
            value={formData.courseId} 
            onChange={handleCourseChange}
            className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 ${errors.courseId ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.name}</option>
            ))}
          </select>
          {errors.courseId && <p className="text-xs text-red-500">{errors.courseId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch">Batch</Label>
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              value={formData.batch.split(' ')[0] || ''}
              onChange={(e) => {
                const year = formData.batch.split(' ')[1] || new Date().getFullYear();
                setFormData({ ...formData, batch: `${e.target.value} ${year}` });
              }}
            >
              <option value="">Month</option>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              value={formData.batch.split(' ')[1] || ''}
              onChange={(e) => {
                const month = formData.batch.split(' ')[0] || 'January';
                setFormData({ ...formData, batch: `${month} ${e.target.value}` });
              }}
            >
              <option value="">Year</option>
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {errors.batch && <p className="text-xs text-red-500">{errors.batch}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalFeeCommitted">Total Fee (₹)</Label>
        <Input 
          id="totalFeeCommitted" 
          name="totalFeeCommitted" 
          value={formData.totalFeeCommitted} 
          onChange={handleChange} 
          className={errors.totalFeeCommitted ? 'border-red-500 bg-slate-100' : 'bg-slate-100'}
          readOnly
        />
        {errors.totalFeeCommitted && <p className="text-xs text-red-500">{errors.totalFeeCommitted}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextInstallmentDate">Next Installment Date (Optional)</Label>
        <Input 
          id="nextInstallmentDate" 
          name="nextInstallmentDate" 
          type="date"
          value={formData.nextInstallmentDate} 
          onChange={handleChange} 
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-slate-500">When is the next payment expected?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Student Photo</Label>
        <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{student ? 'Update Student' : 'Admit Student'}</Button>
      </div>
    </form>
  );
};

export default AdmissionForm;
