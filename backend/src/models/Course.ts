import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  duration: string;
  standardFee: number;
  isDeleted: boolean;
}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  standardFee: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
