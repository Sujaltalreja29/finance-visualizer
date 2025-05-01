// app/add-transaction/page.tsx
'use client'

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coins, DollarSign, Loader2, ListPlus, Receipt, Tag } from "lucide-react";
import { PREDEFINED_CATEGORIES } from "@/models/model";
import Link from "next/link";

interface TransactionFormData {
  name: string;
  type: string; // Category
  amount: string;
  description: string;
}

function AddTransactionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm<TransactionFormData>();
  const [categories, setCategories] = useState<{type: string, color: string}[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const selectedType = watch("type");
  
  // Get categories on component mount
  useEffect(() => {
    setCategories(PREDEFINED_CATEGORIES);
    // Set default category
    if (!selectedType) {
      setValue("type", "Other");
    }
  }, [setValue, selectedType]);

  // Memoize the color getter function
  const getCategoryColor = useCallback((categoryType: string): string => {
    const category = categories.find(cat => cat.type === categoryType);
    return category?.color || "#CCCCCC";
  }, [categories]);

  const onSubmit = useCallback(async (data: TransactionFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Calculate color based on the category
      const color = getCategoryColor(data.type);
      
      // Format the transaction data
      const transaction = {
        name: data.name,
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description || "",
        color,
        date: new Date()
      };

      // Send to API
      const response = await axios.post("/api/transactions", transaction);

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Transaction added successfully",
          variant: "default",
        });

        // Clear form fields
        resetField("name");
        resetField("amount");
        resetField("description");
        
        // Navigate to transactions page
        router.push('/transactions');
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, toast, getCategoryColor, router, resetField, categories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-8 group">
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 pt-8 pb-16 px-8 relative">
            <ListPlus className="h-10 w-10 text-white/90 mb-3" />
            <h1 className="text-2xl font-bold text-white">Add Transaction</h1>
            <p className="text-green-50 mt-1 text-sm">Record your income or expense</p>
            
            {/* Category Pill - Shows the currently selected category */}
            <div className="absolute bottom-0 right-8 transform translate-y-1/2">
              <div 
                className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-md bg-white"
                style={{borderLeft: `4px solid ${getCategoryColor(selectedType)}`}}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{backgroundColor: getCategoryColor(selectedType)}}
                />
                <span className="font-medium text-gray-700 text-sm">{selectedType || 'Select Category'}</span>
              </div>
            </div>
          </div>
          
          {/* Form Section */}
          <div className="px-8 py-10 pt-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction Name Input */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Receipt className="h-4 w-4 mr-2 text-gray-500" />
                  Transaction Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Groceries, Rent, Salary, etc."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  Description (Optional)
                </label>
                <input
                  type="text"
                  {...register("description")}
                  placeholder="Add extra details about this transaction"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Coins className="h-4 w-4 mr-2 text-gray-500" />
                  Category
                </label>
                <div className="relative">
                  <select
                    {...register("type", { required: "Category is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white appearance-none pr-10"
                  >
                    {categories.map((category) => (
                      <option key={category.type} value={category.type}>
                        {category.type}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.type && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be positive" },
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Amount can have up to 2 decimal places"
                      }
                    })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-medium"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Add Transaction</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Quick Links */}
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/transactions"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  View all transactions
                </Link>
              </div>
            </form>
          </div>
        </div>
        
        {/* Tips Card */}
        <div className="mt-8 bg-white p-5 rounded-xl shadow-md border border-green-100">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transaction Tips
          </h3>
          <ul className="mt-3 space-y-2 text-xs text-gray-600">
            <li className="flex items-start">
              <span className="h-1 w-1 rounded-full bg-green-500 mt-1.5 mr-2"></span>
              Income transactions should be categorized as "Income"
            </li>
            <li className="flex items-start">
              <span className="h-1 w-1 rounded-full bg-green-500 mt-1.5 mr-2"></span>
              Use clear descriptions to help with future tracking
            </li>
            <li className="flex items-start">
              <span className="h-1 w-1 rounded-full bg-green-500 mt-1.5 mr-2"></span>
              Categorize accurately for better budget tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddTransactionPage;