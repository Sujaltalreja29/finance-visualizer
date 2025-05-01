'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, PiggyBank, Trash2, Plus, DollarSign } from 'lucide-react'
import { PREDEFINED_CATEGORIES } from '@/models/model'

interface Budget {
  _id: string
  category: string
  amount: number
  month: number
  year: number
}

interface BudgetFormData {
  category: string
  amount: string
  month: string
  year: string
}

interface BudgetSummary {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function BudgetsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary[]>([])
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Get current month and year for default filter values
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BudgetFormData>({
    defaultValues: {
      month: selectedMonth.toString(),
      year: selectedYear.toString()
    }
  })

  // Categories that don't have a budget for the selected month/year
  const availableCategories = useMemo(() => {
    const budgetedCategories = budgets
      .filter(b => b.month === selectedMonth && b.year === selectedYear)
      .map(b => b.category)
    
    return PREDEFINED_CATEGORIES
      .filter(c => c.type !== 'Income') // Don't budget for income
      .filter(c => !budgetedCategories.includes(c.type))
      .map(c => c.type)
  }, [budgets, selectedMonth, selectedYear])

  // Fetch budgets and summary data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all budgets
      const budgetsResponse = await axios.get('/api/budgets')
      setBudgets(budgetsResponse.data)
      
      // Fetch budget summary for selected month/year
      const summaryResponse = await axios.get(
        `/api/budget-summary?month=${selectedMonth}&year=${selectedYear}`
      )
      setBudgetSummary(summaryResponse.data.summary)
    } catch (error) {
      console.error('Error fetching budget data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  // Create a new budget
  const onSubmit = async (data: BudgetFormData) => {
    try {
      const budgetData = {
        category: data.category,
        amount: parseFloat(data.amount),
        month: parseInt(data.month),
        year: parseInt(data.year)
      }
      
      const response = await axios.post('/api/budgets', budgetData)
      
      // Update local state
      setBudgets(prev => [...prev, response.data])
      
      // Reset form and refresh data
      reset()
      setShowForm(false)
      fetchData()
      
      toast({
        title: 'Success',
        description: 'Budget has been created successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error creating budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to create budget',
        variant: 'destructive'
      })
    }
  }

  // Delete a budget
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await axios.delete(`/api/budgets/${id}`)
      
      // Update local state
      setBudgets(prev => prev.filter(budget => budget._id !== id))
      
      toast({
        title: 'Success',
        description: 'Budget has been deleted',
        variant: 'default'
      })
      
      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive'
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Filter budgets for the selected month/year
  const filteredBudgets = useMemo(() => {
    return budgets.filter(
      budget => budget.month === selectedMonth && budget.year === selectedYear
    )
  }, [budgets, selectedMonth, selectedYear])

  // Generate years for selection (current year and 2 years before and after)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2
    ]
  }, [])

  // Get color for budget vs actual bars
  const getBarColor = (budget: number, spent: number) => {
    if (spent > budget) return '#ef4444' // Over budget - red
    if (spent > budget * 0.8) return '#f59e0b' // Near budget - amber
    return '#10b981' // Under budget - green
  }

  // Chart data for budget vs actual
  const chartData = useMemo(() => {
    return budgetSummary.map(summary => ({
      category: summary.category,
      Budget: summary.budgeted,
      Spent: summary.spent
    }))
  }, [budgetSummary])

  if (loading && budgets.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground mt-1">
            Set monthly budgets for each category and track your spending
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Select 
              defaultValue={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              defaultValue={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700"
            disabled={showForm || availableCategories.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Budgets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {budgetSummary.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  No Budget Data
                </CardTitle>
                <CardDescription>
                  You haven't set up any budgets for {MONTHS[selectedMonth - 1]} {selectedYear} yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Actual Spending</CardTitle>
                  <CardDescription>
                    Compare your budgeted amounts with actual spending for {MONTHS[selectedMonth - 1]} {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="category" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`₹${value}`, undefined]}
                          labelFormatter={(label) => `Category: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="Budget" fill="#3b82f6" />
                        <Bar dataKey="Spent" fill="#10b981">
                          {
                            chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getBarColor(entry.Budget, entry.Spent)} 
                              />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetSummary.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{item.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Budget:</span>
                        <span className="font-medium">₹{item.budgeted.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Spent:</span>
                        <span className="font-medium">₹{item.spent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">Remaining:</span>
                        <span 
                          className={`font-medium ${
                            item.remaining < 0 ? 'text-red-500' : 'text-green-500'
                          }`}
                        >
                          ₹{item.remaining.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                            className={`shadow-none flex flex-col justify-center text-center whitespace-nowrap text-white ${
                              item.percentage > 100 
                                ? 'bg-red-500' 
                                : item.percentage > 80 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>0%</span>
                          <span className={item.percentage > 100 ? 'text-red-500 font-medium' : ''}>
                            {item.percentage.toFixed(0)}%
                          </span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="manage">
          {showForm && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">Create New Budget</CardTitle>
                <CardDescription>
                  Set a monthly budget for a specific category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        {...register('category', { required: 'Category is required' })}
                        onValueChange={(value) => {
                          reset({ ...register(), category: value })
                        }}
                        defaultValue=""
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.length > 0 ? (
                            availableCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              All categories have budgets for this month
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Budget Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          className="pl-10"
                          {...register('amount', { 
                            required: 'Amount is required',
                            min: {
                              value: 0.01,
                              message: 'Amount must be greater than 0'
                            },
                            pattern: {
                              value: /^\d+(\.\d{1,2})?$/,
                              message: 'Amount can have up to 2 decimal places'
                            }
                          })}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Select
                        {...register('month', { required: 'Month is required' })}
                        onValueChange={(value) => {
                          reset({ ...register(), month: value })
                        }}
                        defaultValue={selectedMonth.toString()}
                      >
                        <SelectTrigger id="month">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.month && (
                        <p className="text-sm text-red-500">{errors.month.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select
                                                {...register('year', { required: 'Year is required' })}
                                                onValueChange={(value) => {
                                                  reset({ ...register(), year: value })
                                                }}
                                                defaultValue={selectedYear.toString()}
                                              >
                                                <SelectTrigger id="year">
                                                  <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {yearOptions.map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                      {year}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              {errors.year && (
                                                <p className="text-sm text-red-500">{errors.year.message}</p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex justify-end gap-3">
                                            <Button 
                                              type="button" 
                                              variant="outline" 
                                              onClick={() => setShowForm(false)}
                                            >
                                              Cancel
                                            </Button>
                                            <Button 
                                              type="submit" 
                                              className="bg-green-600 hover:bg-green-700"
                                              disabled={isSubmitting}
                                            >
                                              {isSubmitting ? 'Saving...' : 'Save Budget'}
                                            </Button>
                                          </div>
                                        </form>
                                      </CardContent>
                                    </Card>
                                  )}
                                  
                                  {filteredBudgets.length === 0 && !showForm ? (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center">
                                          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                                          No Budgets Found
                                        </CardTitle>
                                        <CardDescription>
                                          You haven't set up any budgets for {MONTHS[selectedMonth - 1]} {selectedYear}.
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="flex justify-center py-8">
                                        <Button
                                          onClick={() => setShowForm(true)}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Budget
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {filteredBudgets.map(budget => (
                                        <Card key={budget._id}>
                                          <CardHeader>
                                            <CardTitle className="text-lg">{budget.category}</CardTitle>
                                            <CardDescription>
                                              {MONTHS[budget.month - 1]} {budget.year}
                                            </CardDescription>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="text-3xl font-bold text-green-600">
                                              ₹{budget.amount.toFixed(2)}
                                            </div>
                                            
                                            {budgetSummary.find(s => s.category === budget.category) && (
                                              <div className="mt-4">
                                                <div className="text-sm text-muted-foreground mb-1">
                                                  Spent: ₹{budgetSummary.find(s => s.category === budget.category)?.spent.toFixed(2) || '0.00'}
                                                </div>
                                                <div className="relative pt-1">
                                                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                    <div
                                                      style={{ 
                                                        width: `${Math.min(100, budgetSummary.find(s => s.category === budget.category)?.percentage || 0)}%` 
                                                      }}
                                                      className={`shadow-none flex flex-col justify-center text-center whitespace-nowrap text-white ${
                                                        (budgetSummary.find(s => s.category === budget.category)?.percentage || 0) > 100 
                                                          ? 'bg-red-500' 
                                                          : (budgetSummary.find(s => s.category === budget.category)?.percentage || 0) > 80 
                                                            ? 'bg-yellow-500' 
                                                            : 'bg-green-500'
                                                      }`}
                                                    ></div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </CardContent>
                                          <CardFooter className="border-t pt-4 flex justify-between">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={() => handleDelete(budget._id)}
                                              disabled={deletingId === budget._id}
                                            >
                                              {deletingId === budget._id ? (
                                                <span>Deleting...</span>
                                              ) : (
                                                <>
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Delete
                                                </>
                                              )}
                                            </Button>
                                          </CardFooter>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </TabsContent>
                              </Tabs>
                              
                              {/* Insights Section */}
                              {budgetSummary.length > 0 && (
                                <Card className="mt-8">
                                  <CardHeader>
                                    <CardTitle>Spending Insights</CardTitle>
                                    <CardDescription>
                                      Analysis of your spending patterns for {MONTHS[selectedMonth - 1]} {selectedYear}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Top spending categories */}
                                    <div>
                                      <h3 className="font-medium mb-2">Top Spending Categories</h3>
                                      <div className="space-y-2">
                                        {[...budgetSummary]
                                          .sort((a, b) => b.spent - a.spent)
                                          .slice(0, 3)
                                          .map((category, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                              <div className="flex items-center">
                                                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                                                  index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                                                }`}></span>
                                                <span>{category.category}</span>
                                              </div>
                                              <span className="font-medium">₹{category.spent.toFixed(2)}</span>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                    
                                    {/* Budget status */}
                                    <div>
                                      <h3 className="font-medium mb-2">Budget Status</h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                          <div className="text-green-600 font-medium">Under Budget</div>
                                          <div className="text-2xl font-bold">
                                            {budgetSummary.filter(s => s.percentage < 80).length}
                                          </div>
                                          <div className="text-sm text-gray-500">categories</div>
                                        </div>
                                        
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                          <div className="text-yellow-600 font-medium">Near Limit</div>
                                          <div className="text-2xl font-bold">
                                            {budgetSummary.filter(s => s.percentage >= 80 && s.percentage <= 100).length}
                                          </div>
                                          <div className="text-sm text-gray-500">categories</div>
                                        </div>
                                        
                                        <div className="bg-red-50 p-4 rounded-lg">
                                          <div className="text-red-600 font-medium">Over Budget</div>
                                          <div className="text-2xl font-bold">
                                            {budgetSummary.filter(s => s.percentage > 100).length}
                                          </div>
                                          <div className="text-sm text-gray-500">categories</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Recommendations */}
                                    {budgetSummary.some(s => s.percentage > 100) && (
                                      <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                        <h3 className="font-medium text-blue-700 mb-2">Recommendations</h3>
                                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                                          {budgetSummary
                                            .filter(s => s.percentage > 100)
                                            .map((category, index) => (
                                              <li key={index}>
                                                Consider adjusting your budget for <strong>{category.category}</strong> as you're 
                                                spending {Math.round(category.percentage - 100)}% more than budgeted.
                                              </li>
                                            ))}
                                          {budgetSummary
                                            .filter(s => s.percentage < 50 && s.budgeted > 0)
                                            .map((category, index) => (
                                              <li key={index}>
                                                You're only using {Math.round(category.percentage)}% of your <strong>{category.category}</strong> budget. 
                                                You might reallocate some to categories where you're over budget.
                                              </li>
                                            ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )
                        }