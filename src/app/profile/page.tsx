"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useSelector,useDispatch } from "react-redux"
import { login } from '@/store/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch()
  const [budget, setBudget] = useState("")
  const user = useSelector((state: any) => (state.auth?.userData))
  const [value, setValue] = useState(user?.user.budget)
  // These would typically come from an API or context in a real app
  const userName = user.user.username
  const userId = user.user._id
  const monthlyBudget = 3000
  const spentThisMonth = user.user.spent

  const budgetProgress = (spentThisMonth / monthlyBudget) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/add-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          budget: budget
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { 
          ...user, 
          user: {
            ...user.user,
            budget: budget
          }
        };
        dispatch(login(updatedUser));
        setValue(budget);
        setBudget("");
      }
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  }

  const expenseData = [
    { name: "Spent", value: spentThisMonth, color: "#ef4444" },
    { name: "Remaining", value: (value-spentThisMonth), color: "#22c55e" },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{userName}&apos;s Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Balance</Label>
              <p className="text-2xl font-bold">₹{(value-spentThisMonth).toLocaleString()}</p>
            </div>
            <div>
              <Label>Monthly Budget</Label>
              <p className="text-xl">₹{value.toLocaleString()}</p>
              <Progress value={budgetProgress} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
              ₹{spentThisMonth.toLocaleString()} spent of ₹{value.toLocaleString()}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <Label htmlFor="budget">Update Monthly Budget</Label>
              <div className="flex space-x-2">
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter new budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
                <Button type="submit">Update</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {expenseData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span>
                    {entry.name}: ₹{entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

