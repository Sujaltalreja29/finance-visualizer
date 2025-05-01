'use client'
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, RefreshCw, BarChart3, PieChart, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { PREDEFINED_CATEGORIES } from '@/models/model'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Register Chart.js components
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Transaction {
  _id: string
  amount: number
  type: string
  name: string
  color: string
  date: Date
  description?: string
}

interface Budget {
  _id: string
  category: string
  amount: number
  month: number
  year: number
}

interface CachedDashboardData {
  transactions: Transaction[]
  budgets: Budget[]
  timestamp: number
}

function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Cache duration (2 minutes for dashboard data since it changes frequently)
  const CACHE_DURATION = 2 * 60 * 1000

  const saveToCache = (transactions: Transaction[], budgets: Budget[]) => {
    const cacheData: CachedDashboardData = {
      transactions,
      budgets,
      timestamp: Date.now()
    }
    localStorage.setItem('dashboardCache', JSON.stringify(cacheData))
  }

  const getFromCache = useCallback((): { transactions: Transaction[], budgets: Budget[] } | null => {
    try {
      const cachedData = localStorage.getItem('dashboardCache')
      if (!cachedData) return null

      const { transactions, budgets, timestamp }: CachedDashboardData = JSON.parse(cachedData)
      
      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem('dashboardCache')
        return null
      }

      return { transactions, budgets }
    } catch (error) {
      console.error('Error reading from cache:', error)
      localStorage.removeItem('dashboardCache')
      return null
    }
  }, [])

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    setRefreshing(true)
  
    try {
      // Get transactions
      const transactionsResponse = await axios.get('/api/transactions')
      const fetchedTransactions = transactionsResponse.data
      
      // Get budgets
      const budgetsResponse = await axios.get('/api/budgets')
      const fetchedBudgets = budgetsResponse.data
  
      setTransactions(fetchedTransactions)
      setBudgets(fetchedBudgets)
      saveToCache(fetchedTransactions, fetchedBudgets)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError("Failed to fetch data. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])
  
  useEffect(() => {
    const initializeDashboard = async () => {
      // Try to get data from cache first
      const cachedData = getFromCache()
      
      if (cachedData) {
        // If we have cached data, show it immediately
        setTransactions(cachedData.transactions)
        setBudgets(cachedData.budgets)
        setLoading(false)
        // Fetch fresh data in background
        fetchDashboardData(false)
      } else {
        // If no cache, fetch fresh data
        fetchDashboardData(true)
      }
    }

    initializeDashboard()
  }, [fetchDashboardData, getFromCache])

  // Calculate summary data
  const expenseTransactions = transactions.filter(transaction => transaction.type !== 'Income')
  const incomeTransactions = transactions.filter(transaction => transaction.type === 'Income')
  
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  
  // Get category data for budget comparison
  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    const { type, amount } = transaction
    if (!acc[type]) acc[type] = 0
    acc[type] += amount
    return acc
  }, {} as Record<string, number>)
  
  // Prepare budget vs actual data
  const budgetVsActualData = PREDEFINED_CATEGORIES
    .filter(cat => cat.type !== 'Income')
    .map(cat => {
      const category = cat.type
      const actual = categoryTotals[category] || 0
      
      // Find current month's budget for this category
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      const budget = budgets.find(
        b => b.category === category && b.month === currentMonth && b.year === currentYear
      )
      
      return {
        category,
        actual,
        budget: budget?.amount || 0,
        remaining: (budget?.amount || 0) - actual
      }
    })

  // Prepare data for monthly expenses bar chart
  const monthlyExpenseData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const expensesByMonth = Array(12).fill(0);
    
    expenseTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        expensesByMonth[date.getMonth()] += transaction.amount;
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: expensesByMonth,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(21, 128, 61)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(34, 197, 94, 0.8)',
        }
      ]
    };
  };

  // Create doughnut chart data for expense categories
  const createDoughnutChartData = () => {
    // Get expense categories and their totals
    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    
    // Get colors for categories
    const colors = categories.map(category => {
      const found = PREDEFINED_CATEGORIES.find(c => c.type === category);
      return found ? found.color : '#CCCCCC';
    });
    
    return {
      labels: categories,
      datasets: [{
        data: values,
        backgroundColor: colors,
        hoverOffset: 4,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  // Loading state
  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[130px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg max-w-md p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="font-semibold">Data Loading Error</h2>
          </div>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button 
            onClick={() => fetchDashboardData(true)}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-2 rounded-lg shadow transition-all duration-200"
          >
            Try Again
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Title and Refresh Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <Button 
          onClick={() => fetchDashboardData(true)} 
          disabled={refreshing}
          variant="outline" 
          className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Income</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                {incomeTransactions.length} transactions
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                {expenseTransactions.length} transactions
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`overflow-hidden border-none shadow-md bg-gradient-to-br ${
          totalIncome - totalExpenses >= 0 
            ? 'from-blue-50 to-blue-100' 
            : 'from-amber-50 to-amber-100'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${
              totalIncome - totalExpenses >= 0 ? 'text-blue-800' : 'text-amber-800'
            }`}>Balance</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              totalIncome - totalExpenses >= 0 ? 'bg-blue-500/20' : 'bg-amber-500/20'
            }`}>
              {totalIncome - totalExpenses >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-blue-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              ₹{Math.abs(totalIncome - totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center mt-1">
              <p className={`text-xs px-2 py-0.5 rounded-full ${
                totalIncome - totalExpenses >= 0 
                  ? 'text-blue-700 bg-blue-100'
                  : 'text-amber-700 bg-amber-100'
              }`}>
                {totalIncome - totalExpenses >= 0 ? 'Positive balance' : 'Negative balance'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Bar Chart */}
        <Card className="shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-800">
                  <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                  Monthly Expenses
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-1">
                  Your spending pattern throughout {new Date().getFullYear()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {expenseTransactions.length > 0 ? (
              <div className="h-[300px] w-full mt-2">
                <Bar 
                  data={monthlyExpenseData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.04)',
                        },
                        ticks: {
                          callback: function(value) {
                            return '₹' + value;
                          },
                          font: {
                            size: 10
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 10
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: 10,
                        cornerRadius: 6,
                        callbacks: {
                          label: function(context) {
                            return '₹' + (context.raw as number).toLocaleString('en-IN');
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] p-6 bg-gray-50 rounded-lg">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center mb-2">No expense data available</p>
                <Link href="/add-transaction" className="text-sm text-green-600 hover:underline font-medium">
                  Add your first transaction
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card className="shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-800">
                  <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                  Spending by Category
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-1">
                  Breakdown of your expenses across categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {expenseTransactions.length > 0 ? (
              <div className="relative h-[300px] flex items-center justify-center">
                {/* Centered Total */}
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 pointer-events-none pb-7">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-sm border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-500">Total Expenses</h3>
                    <span className="text-xl font-bold text-green-600">
                      ₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                  </div>
                </div>
                
                {/* Doughnut Chart */}
                <div className="h-[290px] w-[290px]">
                  <Doughnut 
                    data={createDoughnutChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                              size: 11
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          padding: 10,
                          cornerRadius: 6,
                          callbacks: {
                            label: function(context) {
                              const value = context.raw;
                              const percentage = ((value as number) / totalExpenses * 100).toFixed(1);
                              return `₹${(value as number).toLocaleString('en-IN')} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] p-6 bg-gray-50 rounded-lg">
                <PieChart className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center mb-2">No category data available</p>
                <Link href="/add-transaction" className="text-sm text-purple-600 hover:underline font-medium">
                  Add your first transaction
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Budget vs Actual Section */}
        <Card className="shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-800">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Budget Progress
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-1">
                  Your monthly spending against budget limits
                </CardDescription>
              </div>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Manage Budgets
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {budgetVsActualData.some(item => item.budget > 0) ? (
              <div className="space-y-5 mt-3">
                {budgetVsActualData
                  .filter(item => item.budget > 0)
                  .map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2"
                            style={{ 
                              backgroundColor: PREDEFINED_CATEGORIES.find(
                                cat => cat.type === item.category
                              )?.color || '#ccc' 
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            item.actual > item.budget ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            ₹{item.actual.toLocaleString('en-IN')}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-sm text-gray-500">
                            ₹{item.budget.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.actual > item.budget 
                              ? 'bg-gradient-to-r from-red-500 to-red-400' 
                              : item.actual > item.budget * 0.8
                                ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                : 'bg-gradient-to-r from-green-500 to-green-400'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (item.actual / item.budget) * 100)}%`,
                            transition: 'width 1s ease-in-out'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {Math.min(100, Math.round((item.actual / item.budget) * 100))}% used
                        </span>
                        {item.remaining > 0 && (
                          <span className="text-green-600">
                            ₹{item.remaining.toLocaleString('en-IN')} remaining
                          </span>
                        )}
                        {item.remaining < 0 && (
                          <span className="text-red-600">
                            ₹{Math.abs(item.remaining).toLocaleString('en-IN')} over budget
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] p-6 bg-gray-50 rounded-lg">
                <TrendingUp className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center mb-2">No budget data available</p>
                <Link href="/budgets" className="text-sm text-blue-600 hover:underline font-medium">
                  Set up your first budget
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Transactions */}
        <Card className="shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-800">
                  <Clock className="mr-2 h-5 w-5 text-teal-600" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs mt-1">
                  Your most recent financial activities
                </CardDescription>
              </div>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4 mt-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" 
                        style={{ backgroundColor: `${transaction.color}30` }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: transaction.color }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{transaction.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'Income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <Link 
                    href="/transactions" 
                    className="inline-flex items-center text-sm text-teal-600 font-medium hover:text-teal-700"
                  >
                    View all transactions
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[260px] p-6 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center mb-2">No transactions available</p>
                <Link href="/add-transaction" className="text-sm text-teal-600 hover:underline font-medium">
                  Add your first transaction
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions Footer */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-teal-50 border border-green-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="font-medium text-gray-800">Need to record a new transaction?</h3>
            <p className="text-sm text-gray-600 mt-1">Keep your finances updated for accurate insights.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/add-transaction">
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                Add Transaction
              </Button>
            </Link>
            <Link href="/budgets">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                Manage Budgets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page