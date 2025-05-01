'use client'
import React, { useEffect, useState } from 'react';
import { Select, SelectItem } from "@nextui-org/select";
import { 
  Delete, 
  Calendar, 
  Edit, 
  ArrowDownUp, 
  Download, 
  Search, 
  PlusCircle, 
  Filter, 
  ListFilter, 
  Trash2,
  FileDown,
  ArrowUpDown
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { PREDEFINED_CATEGORIES } from '@/models/model';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const router = useRouter();
  
  // Statistics
  const totalTransactions = filtered.length;
  const totalAmount = filtered.reduce((sum, tx) => 
    tx.type === 'Income' ? sum + tx.amount : sum - tx.amount, 0);
  const incomeTotal = filtered
    .filter(tx => tx.type === 'Income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenseTotal = filtered
    .filter(tx => tx.type !== 'Income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
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

    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      updatedTransactions = updatedTransactions.filter(tx => 
        tx.name.toLowerCase().includes(searchLower) || 
        tx.description?.toLowerCase().includes(searchLower) ||
        tx.type.toLowerCase().includes(searchLower)
      );
    }

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
  }, [timeFrame, selectedCategory, transactions, sortOrder, searchTerm]);

  const handleTimeFrameChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setTimeFrame(event.target.value);
  };

  const handleCategoryChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setSelectedCategory(event.target.value);
  };

  const clearFilters = () => {
    setSelectedCategory('default');
    setTimeFrame('all');
    setSearchTerm('');
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
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-12 w-64 rounded-lg mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-[90px] rounded-xl" />
              <Skeleton className="h-[90px] rounded-xl" />
              <Skeleton className="h-[90px] rounded-xl" />
            </div>
          </div>
          
          <Skeleton className="h-16 w-full rounded-lg mb-4" />
          
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title and Stats */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Transaction History</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Balance</p>
                  <p className={`text-2xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{totalAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${totalAmount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totalAmount >= 0 ? 
                    <ArrowUpDown className="w-5 h-5 text-green-600" /> : 
                    <ArrowUpDown className="w-5 h-5 text-red-600" />}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From {totalTransactions} transactions</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{incomeTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <ArrowUpDown className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {filtered.filter(tx => tx.type === 'Income').length} income transactions
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{expenseTotal.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <ArrowUpDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {filtered.filter(tx => tx.type !== 'Income').length} expense transactions
              </p>
            </div>
          </div>
        </div>
        
        {/* Filter and Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Transactions</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="border-gray-200"
                >
                  <ListFilter className="w-4 h-4 mr-2" />
                  Filters {(selectedCategory !== 'default' || timeFrame !== 'all' || searchTerm.trim() !== '') && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                  )}
                </Button>
                <Link href="/add-transaction">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className={`p-4 border-b border-gray-100 bg-gray-50 transition-all ${showFilterMenu ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1.5">Search</div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="pl-9 bg-white border-gray-200"
                  />
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1.5">Category</div>
                <Select
                  selectedKeys={[selectedCategory]}
                  onChange={handleCategoryChange}
                  classNames={{
                    trigger: "bg-white border-gray-200 h-10",
                  }}
                >
                  {filterOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1.5">Time Period</div>
                <Select
                  selectedKeys={[timeFrame]}
                  onChange={handleTimeFrameChange}
                  classNames={{
                    trigger: "bg-white border-gray-200 h-10",
                  }}
                >
                  {timeFrameOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1.5">Sort Order</div>
                <Button 
                  variant="outline" 
                  onClick={toggleSortOrder}
                  className="w-full justify-between h-10 bg-white border-gray-200"
                >
                  {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  <ArrowDownUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
              </div>
              <div className="flex gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm h-9 border-gray-200">
                      <FileDown className="w-4 h-4 mr-2" />
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
                  variant="ghost" 
                  size="sm" 
                  className="text-sm h-9"
                  onClick={clearFilters}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Transaction List */}
          <div className="max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-600">No Transactions Found</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {transactions.length > 0 
                    ? "No transactions match your current filters. Try adjusting your search criteria." 
                    : "Start adding transactions to see them here."}
                </p>
                {transactions.length === 0 ? (
                  <Link href="/add-transaction">
                    <Button 
                      className="mt-6 bg-green-600 hover:bg-green-700"
                    >
                      Add Your First Transaction
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={clearFilters}
                    variant="outline" 
                    className="mt-6"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="hover:bg-gray-50 transition-colors p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Left: Transaction Info */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                          style={{ backgroundColor: `${transaction.color}20` }}
                        >
                          <div 
                            className="w-5 h-5 rounded-full" 
                            style={{ backgroundColor: transaction.color }}
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-800">{transaction.name}</h3>
                            {transaction.type === 'Income' ? (
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-100">
                                Income
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-50 text-gray-600 border border-gray-100">
                                {transaction.type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            
                            {transaction.description && (
                              <span className="text-xs text-gray-500 max-w-md truncate">
                                {transaction.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Amount and Actions */}
                      <div className="flex items-center gap-6 ml-auto">
                        <div className={`text-lg font-medium ${
                          transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        
                        <div className="flex items-center">
                          <button
                            className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                            onClick={() => handleEdit(transaction._id)}
                            disabled={loading}
                            aria-label="Edit transaction"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            onClick={() => handleDelete(transaction._id)}
                            disabled={loading}
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pagination - Optional Footer */}
          {filtered.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{filtered.length}</span> of{" "}
                <span className="font-medium">{transactions.length}</span> transactions
              </p>
              
              <Link href="/add-transaction">
                <Button variant="outline" size="sm" className="h-9 border-green-200 text-green-700 hover:bg-green-50">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Export Suggestion Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-medium text-gray-800 text-lg">Need your transaction data?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Export your transactions to CSV for use in spreadsheets or other financial tools.
            </p>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Export Transactions
                </h3>
                
                <div className="space-y-2">
                  <label htmlFor="startDateExport" className="text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDateExport"
                    className="w-full px-3 py-2 border rounded-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDateExport" className="text-sm font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDateExport"
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
        </div>
      </div>
    </div>
  );
}