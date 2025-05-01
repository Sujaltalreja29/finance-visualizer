// app/add-transaction/page.tsx
'use client'

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PREDEFINED_CATEGORIES } from "@/models/model";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-8 py-10 mx-4 bg-white rounded-2xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Add Transaction
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            Enter the details of your new transaction
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Transaction Name
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              placeholder="Groceries, Rent, Salary, etc."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <input
              type="text"
              {...register("description")}
              placeholder="Transaction details"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register("type", { required: "Category is required" })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {categories.map((category) => (
                <option key={category.type} value={category.type}>
                  {category.type}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Add Transaction</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionPage;