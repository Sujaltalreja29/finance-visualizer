'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectItem } from "@nextui-org/select";
import { Delete, Calendar, Edit, ArrowDownUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { PREDEFINED_CATEGORIES } from '@/models/model';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id: string;
  type: string;
  name: string;
  amount: number;
  color?: string;
  date: string;
  description?: string;
}

const timeFrameOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'month', label: 'Last Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last Year' }
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeFrame, setTimeFrame] = useState('all');
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  
  // Create category filter options
  const filterOptions = [
    { key: 'default', label: 'All Categories' },
    ...PREDEFINED_CATEGORIES.map(cat => ({
      key: cat.type,
      label: cat.type
    }))
  ];

  const filterByTimeFrame = (transactionsToFilter: Transaction[]) => {
    const now = new Date();
    const filterDate = new Date();

    switch (timeFrame) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return transactionsToFilter;
    }

    return transactionsToFilter.filter(t => new Date(t.date) >= filterDate);
  };

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setDownloadError('');

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates');
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Start date must be before end date');
      }

      // Filter transactions based on date range
      const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= new Date(startDate) && txDate <= new Date(endDate);
      });

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Name,Category,Amount,Date,Description\n";
      
      filteredTransactions.forEach(tx => {
        const row = [
          tx.name,
          tx.type,
          tx.amount,
          new Date(tx.date).toLocaleDateString(),
          tx.description || ""
        ].map(value => `"${value}"`).join(",");
        csvContent += row + "\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transactions-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: "Transactions downloaded successfully",
        variant: "default"
      });
    } catch (err: any) {
      setDownloadError(err.message);
      toast({
        title: 'Failed',
        description: "Failed to download transactions",
        variant: "destructive"
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    try {
      setLoading(true);
      
      const response = await axios.delete(`/api/transactions/${transactionId}`);
      
      if (response.status === 200) {
        const updatedTransactions = transactions.filter(t => t._id !== transactionId);
        setTransactions(updatedTransactions);
        setFiltered(updatedTransactions);
        
        toast({
          title: 'Success',
          description: "Transaction deleted successfully",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: 'Failed',
        description: "Transaction could not be deleted",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transactionId: string) => {
    router.push(`/edit-transaction/${transactionId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    let updatedTransactions = [...transactions];

    // Apply category filter
    if (selectedCategory !== "default") {
      updatedTransactions = updatedTransactions.filter(t => t.type === selectedCategory);
    }

    // Apply time frame filter
    updatedTransactions = filterByTimeFrame(updatedTransactions);

    // Apply sorting
    updatedTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFiltered(updatedTransactions);
  }, [timeFrame, selectedCategory, transactions, sortOrder]);

  const handleTimeFrameChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setTimeFrame(event.target.value);
  };

  const handleCategoryChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setSelectedCategory(event.target.value);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        const fetchedTransactions = response.data;
        setTransactions(fetchedTransactions);
        setFiltered(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: 'Error',
          description: "Failed to fetch transactions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-4 mt-8 py-10">
        <Skeleton className="h-[100px] w-[800px] rounded-xl" />
        <Skeleton className="h-[100px] w-[800px] rounded-xl" />
        <Skeleton className="h-[100px] w-[800px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-col justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transactions</h1>
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto flex-wrap">
              <Select
                label="Category"
                className="min-w-[150px] flex-grow sm:flex-grow-0"
                onChange={handleCategoryChange}
                defaultSelectedKeys={["default"]}
              >
                {filterOptions.map((option) => (
                  <SelectItem key={option.key} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Time Period"
                className="min-w-[150px] flex-grow sm:flex-grow-0"
                onChange={handleTimeFrameChange}
                defaultSelectedKeys={["all"]}
              >
                {timeFrameOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-[56px]"
                onClick={toggleSortOrder}
              >
                <ArrowDownUp className="w-4 h-4 mr-2" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-[56px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Export Transactions
                    </h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="startDate" className="text-sm font-medium">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="w-full px-3 py-2 border rounded-md"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="endDate" className="text-sm font-medium">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="w-full px-3 py-2 border rounded-md"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    {downloadError && (
                      <Alert variant="destructive">
                        <AlertDescription>{downloadError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleDownload}
                      disabled={downloadLoading || !startDate || !endDate}
                      className="w-full"
                    >
                      {downloadLoading ? 'Exporting...' : 'Export CSV'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                onClick={() => router.push('/add-transaction')} 
                className="h-[56px] bg-green-600 hover:bg-green-700"
              >
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-600">No Transactions Found</h2>
            <p className="text-gray-500 mt-2">Start adding transactions to see them here.</p>
            <Button 
              onClick={() => router.push('/add-transaction')} 
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {filtered.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow"
                style={{
                  borderColor: transaction.color ?? '#e5e5e5'
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{transaction.name}</span>
                    {transaction.type === 'Income' ? (
                      <span className="text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-full">Income</span>
                    ) : (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{transaction.type}</span>
                    )}
                  </div>
                  <span className={`text-lg font-medium ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {transaction.description && (
                    <span className="text-sm text-gray-500 mt-1 max-w-md truncate">
                      {transaction.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-full hover:bg-blue-50"
                    onClick={() => handleEdit(transaction._id)}
                    disabled={loading}
                    aria-label="Edit transaction"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                    onClick={() => handleDelete(transaction._id)}
                    disabled={loading}
                    aria-label="Delete transaction"
                  >
                    <Delete size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}