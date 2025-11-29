import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  mode: 'Cash' | 'UPI' | 'Cheque';
  transactionReferenceId?: string;
  remark?: string;
  receiptNo: string;
}

const TransactionSchema: Schema = new Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  mode: { type: String, enum: ['Cash', 'UPI', 'Cheque'], required: true },
  transactionReferenceId: { type: String },
  remark: { type: String },
  receiptNo: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
