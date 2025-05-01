import mongoose, { Schema, Document } from 'mongoose';

// Define category interface
export interface Category extends Document {
  type: string;
  color: string;
}

// Transaction interface - removed user reference
export interface Transaction extends Document {
  name: string;
  type: string; // Keep as "type" to match existing code
  amount: number;
  color: string;
  date: Date;
  description?: string; // Added description as per requirements
}

// New Budget interface for Stage 3
export interface Budget extends Document {
  category: string;
  amount: number;
  month: number;
  year: number;
}

// Define predefined categories we'll use throughout the application
export const PREDEFINED_CATEGORIES = [
  { type: 'Housing', color: '#E57373' },
  { type: 'Food', color: '#81C784' },
  { type: 'Transportation', color: '#64B5F6' },
  { type: 'Entertainment', color: '#BA68C8' },
  { type: 'Healthcare', color: '#4DB6AC' },
  { type: 'Education', color: '#FFD54F' },
  { type: 'Shopping', color: '#F06292' },
  { type: 'Utilities', color: '#7986CB' },
  { type: 'Income', color: '#66BB6A' },
  { type: 'Other', color: '#A1887F' }
];

// Create schemas only on the server side
const isServer = typeof window === 'undefined';

// Client-side safe exports
let Categories: any;
let Transaction: any;
let Budgets: any;

if (isServer) {
  // Only define schemas and create models on the server
  const categories_model = new Schema<Category>({
    type: { type: String },
    color: { type: String, default: '#FCBE44' }
  });
  
  const transaction_model = new Schema<Transaction>({
    name: { type: String, default: 'Anonymous'},
    type: { type: String },
    amount: { type: Number },
    color: { type: String },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now}
  });
  
  const budget_model = new Schema<Budget>({
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  });

  // Use existing models or create new ones
  Categories = mongoose.models.categories || mongoose.model<Category>('categories', categories_model);
  Transaction = mongoose.models.transaction || mongoose.model<Transaction>('transaction', transaction_model);
  Budgets = mongoose.models.budget || mongoose.model<Budget>('budget', budget_model);
} else {
  // On client-side, we just provide empty objects to prevent errors
  Categories = {};
  Transaction = {};
  Budgets = {};
}

export { Categories, Transaction, Budgets };
export default Transaction;