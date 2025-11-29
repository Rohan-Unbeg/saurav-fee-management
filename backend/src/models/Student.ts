import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  dob: Date;
  gender: string;
  address: string;
  studentMobile: string;
  parentMobile: string;
  courseId: mongoose.Types.ObjectId;
  batch: string;
  admissionDate: Date;
  totalFeeCommitted: number;
  totalPaid: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  nextInstallmentDate?: Date;
  isDeleted: boolean;
}

const StudentSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photoUrl: { type: String },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  studentMobile: { type: String, required: true },
  parentMobile: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batch: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  totalFeeCommitted: { type: Number, required: true },
  totalPaid: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' },
  nextInstallmentDate: { type: Date },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to prevent duplicate enrollment in the same course
StudentSchema.index({ studentMobile: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IStudent>('Student', StudentSchema);
