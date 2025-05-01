"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AddToHomeButton from "@/components/InstallPWA"
import { Button } from "@/components/ui/button"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { ArrowRight, PieChart, BarChart3, Wallet, TrendingUp, MessageSquare, CheckCircle2, ChevronDown } from "lucide-react"

const features = [
  {
    title: "Transaction Tracking",
    description: "Record and manage your financial transactions with our intuitive interface",
    icon: <Wallet className="h-12 w-12 text-emerald-600" />,
    className:
      "md:col-span-2 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300",
  },
  {
    title: "Category Management",
    description: "Organize your expenses with smart categories for better financial insights",
    icon: <PieChart className="h-12 w-12 text-violet-600" />,
    className: "md:col-span-1 bg-gradient-to-br from-violet-50/80 to-violet-100/80 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300",
  },
  {
    title: "Visual Analytics",
    description: "Understand your spending with interactive charts and visual breakdowns",
    icon: <BarChart3 className="h-12 w-12 text-blue-600" />,
    className: "md:col-span-1 bg-gradient-to-br from-blue-50/80 to-blue-100/80 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300",
  },
  {
    title: "Budget Management",
    description: "Set personalized budgets and track progress toward your financial goals",
    icon: <TrendingUp className="h-12 w-12 text-green-600" />,
    className: "md:col-span-2 bg-gradient-to-br from-green-50/80 to-green-100/80 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300",
  },
]

const stages = [
  {
    title: "Stage 1: Basic Tracking",
    features: [
      "Add/Edit/Delete transactions",
      "Transaction list view",
      "Monthly expenses bar chart",
      "Basic form validation"
    ]
  },
  {
    title: "Stage 2: Categories",
    features: [
      "Predefined transaction categories",
      "Category-wise pie chart",
      "Dashboard with summary cards",
      "Recent transactions overview"
    ]
  },
  {
    title: "Stage 3: Budgeting",
    features: [
      "Set monthly category budgets",
      "Budget vs actual comparison chart",
      "Simple spending insights",
      "Financial goal tracking"
    ]
  }
]

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <AddToHomeButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-40 right-30 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6">
                <span className="text-green-800 text-sm font-medium">Version 3.0 — Budgeting Features Released</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-teal-500 to-blue-500">
                Personal Finance Visualizer
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Take control of your financial future. Track, visualize, and optimize your spending with our intuitive finance management platform.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50 px-8 py-6 text-lg rounded-lg transition-all duration-300 w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
              
              <div className="mt-16 flex justify-center">
                <a href="#features" className="text-gray-500 hover:text-gray-700 transition-colors duration-300">
                  <ChevronDown className="h-10 w-10 animate-bounce" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                <span className="text-blue-800 text-sm font-medium">Key Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simplify Your Financial Life</h2>
              <p className="mt-4 text-lg text-gray-600">
                Powerful tools to help you visualize, track, and optimize your personal finances
              </p>
            </div>
            
            <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[22rem]">
              {features.map((feature, i) => (
                <BentoGridItem
                  key={i}
                  title={feature.title}
                  description={feature.description}
                  className={feature.className}
                  icon={feature.icon}
                />
              ))}
            </BentoGrid>
          </div>
        </section>

        {/* Implementation Stages Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-50 border border-purple-100 mb-4">
                <span className="text-purple-800 text-sm font-medium">Development Roadmap</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Growth Journey</h2>
              <p className="mt-4 text-lg text-gray-600">
                From basic tracking to comprehensive budgeting, see how our finance visualizer evolves with your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
              {stages.map((stage, index) => (
                <div 
                  key={index} 
                  className={`p-8 rounded-2xl border hover:shadow-xl transition-all duration-300 ${
                    index === 2 
                      ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-5 ${index === 2 ? 'text-green-600' : 'text-gray-800'}`}>
                    {stage.title}
                  </h3>
                  <ul className="space-y-4">
                    {stage.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 
                          className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                            index === 2 ? 'text-green-500' : index === 1 ? 'text-gray-500' : 'text-gray-400'
                          }`} 
                        />
                        <span className={`${index === 2 ? 'text-gray-700' : 'text-gray-600'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {index === 2 && (
                    <div className="mt-6">
                      <div className="inline-block px-4 py-1.5 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200">Current Version</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-20 text-center">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Using Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}