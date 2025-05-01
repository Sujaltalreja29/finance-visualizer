"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import AddToHomeButton from "@/components/InstallPWA"
import { Button } from "@/components/ui/button"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { ArrowRight, PieChart, BarChart3, Wallet, TrendingUp, MessageSquare, CheckCircle2 } from "lucide-react"

const features = [
  {
    title: "Transaction Tracking",
    description: "Easily add, edit, and delete your financial transactions with intuitive interface.",
    icon: <Wallet className="h-10 w-10 text-emerald-600" />,
    className:
      "md:col-span-2 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300",
  },
  {
    title: "Category Management",
    description: "Organize your expenses with predefined categories for better financial oversight.",
    icon: <PieChart className="h-10 w-10 text-teal-600" />,
    className: "md:col-span-1 bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300",
  },
  {
    title: "Visual Analytics",
    description: "Understand your spending with monthly bar charts and category breakdown pie charts.",
    icon: <BarChart3 className="h-10 w-10 text-cyan-600" />,
    className: "md:col-span-1 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:shadow-lg transition-all duration-300",
  },
  {
    title: "Budget Management",
    description: "Set monthly category budgets and track your spending against your financial goals.",
    icon: <TrendingUp className="h-10 w-10 text-green-600" />,
    className: "md:col-span-2 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300",
  },
]

const features2 = [
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
    <div className="min-h-screen flex flex-col">
      <AddToHomeButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white to-green-50 py-20 sm:py-25">
          <div className="absolute inset-0 z-0 opacity-30">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="text-green-500">Personal</span> Finance Visualizer
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-gray-600">
                  Visualize your spending, set budgets, and gain insights into your financial habits with our simple yet powerful finance tracker.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#features1">
                    <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-50 px-8 py-6 text-lg rounded-lg w-full sm:w-auto">
                      See Features
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
                  <Image
                    src="/image.png"
                    alt="Finance Visualizer Dashboard"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-green-500/20 backdrop-blur-xl"></div>
                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-cyan-500/20 backdrop-blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* App Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Implementation Stages</h2>
              <p className="mt-4 text-lg text-gray-600">
                From basic tracking to comprehensive budgeting, our finance visualizer grows with your needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {features2.map((stage, index) => (
                <div key={index} className={`p-8 rounded-xl border ${index === 2 ? 'border-green-200 bg-green-50 shadow-lg' : 'border-gray-200 bg-white'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${index === 2 ? 'text-green-600' : 'text-gray-800'}`}>{stage.title}</h3>
                  <ul className="space-y-3">
                    {stage.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className={`h-5 w-5 mr-2 flex-shrink-0 ${index === 2 ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {index === 2 && (
                    <div className="mt-6">
                      <div className="inline-block px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Current Version</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="features1" className="pt-20 bg-gray-50">
          {/* Anchor for navigation */}
        </section>
        
        {/* Features Section */}
        <section id="features" className="pb-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600">
                Visualize, track, and optimize your personal finances with our comprehensive tools.
              </p>
            </div>
            
            <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[20rem]">
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

            <div className="mt-16 text-center">
              <Link href="/dashboard">
                <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
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