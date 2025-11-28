import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  duration: string;
  standardFee: number;
}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  standardFee: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
