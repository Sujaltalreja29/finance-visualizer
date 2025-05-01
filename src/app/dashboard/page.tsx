'use client'
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet } from 'lucide-react'
import { PREDEFINED_CATEGORIES } from '@/models/model'

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
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
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
        borderWidth: 0
      }]
    };
  };

  // Loading state
  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600 p-6 bg-red-50 rounded-lg shadow">
          {error}
          <button 
            onClick={() => fetchDashboardData(true)}
            className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {incomeTransactions.length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {expenseTransactions.length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            {totalIncome - totalExpenses >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalIncome - totalExpenses).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalIncome - totalExpenses >= 0 ? 'Positive balance' : 'Negative balance'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Bar Chart - Replaced with direct Bar chart from react-chartjs-2 */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseTransactions.length > 0 ? (
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <Bar 
                  data={monthlyExpenseData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + value;
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return '₹' + context.raw;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseTransactions.length > 0 ? (
              <div className="relative h-[300px] flex items-center justify-center">
                {/* Centered Total */}
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 pointer-events-none pb-6">
                  <h3 className="text-sm font-medium">Total Expenses</h3>
                  <span className="text-xl font-bold text-emerald-500">
                    ₹{totalExpenses.toFixed(2)}
                  </span>
                </div>
                
                {/* Doughnut Chart - ensure it's properly sized */}
                <div style={{ position: 'relative', height: '280px', width: '280px' }}>
                  <Doughnut 
                    data={createDoughnutChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '60%',
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Budget vs Actual Section */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetVsActualData.some(item => item.budget > 0) ? (
              <div className="space-y-4">
                {budgetVsActualData
                  .filter(item => item.budget > 0)
                  .map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm">
                          ₹{item.actual.toFixed(2)} / ₹{item.budget.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.actual > item.budget 
                              ? 'bg-red-500' 
                              : item.actual > item.budget * 0.8
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.actual / item.budget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <p>No budget data available</p>
                <a href="/budgets" className="mt-2 text-sm text-blue-500 hover:underline">
                  Set up your first budget
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: transaction.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{transaction.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <a 
                                        href="/transactions" 
                                        className="text-sm text-blue-500 hover:underline"
                                      >
                                        View all transactions
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                                    <p>No transactions available</p>
                                    <a href="/add-transaction" className="mt-2 text-sm text-blue-500 hover:underline">
                                      Add your first transaction
                                    </a>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )
                    }
                    
                    export default Page