import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

const ExpenseSchema: Schema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Rent, Salary, Electricity, Maintenance
  date: { type: Date, default: Date.now },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
