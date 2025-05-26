"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then((feather) => {
        feather.default.replace();
      });
    }
  }, []);

  // Temporarily bypass authentication check
  // if (!userId) {
  //   router.push('/sign-in');
  //   return null;
  // }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your organization.</p>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: <span id="lastUpdated">2 minutes ago</span>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></span>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        <div className="mb-6 space-y-3">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 animate-pulse">
            <div className="flex items-center">
              <i data-feather="alert-triangle" className="h-5 w-5 text-red-600 mr-3"></i>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-sm">3 Licenses Expiring This Week</h3>
                <p className="text-red-700 text-sm mt-1">Safety certifications for John Smith, Maria Garcia, and Alex Chen expire in 2-5 days.</p>
              </div>
              <Link href="/licenses" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                Review Now
              </Link>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 animate-pulse">
            <div className="flex items-center">
              <i data-feather="clock" className="h-5 w-5 text-yellow-600 mr-3"></i>
              <div className="flex-1">
                <h3 className="text-yellow-800 font-semibold text-sm">5 Overdue Tasks</h3>
                <p className="text-yellow-700 text-sm mt-1">High priority tasks are past their due dates and need immediate attention.</p>
              </div>
              <Link href="/tasks" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                View Tasks
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">247</p>
                <p className="text-sm text-green-600 mt-2">
                  <i data-feather="trending-up" className="h-4 w-4 inline mr-1"></i>
                  +12 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i data-feather="users" className="h-6 w-6 text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">1,284</p>
                <p className="text-sm text-red-600 mt-2">
                  <i data-feather="alert-circle" className="h-4 w-4 inline mr-1"></i>
                  18 expiring soon
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i data-feather="shield" className="h-6 w-6 text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">89</p>
                <p className="text-sm text-yellow-600 mt-2">
                  <i data-feather="clock" className="h-4 w-4 inline mr-1"></i>
                  5 overdue
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i data-feather="check-square" className="h-6 w-6 text-purple-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-green-600 mt-1">99.8%</p>
                <p className="text-sm text-green-600 mt-2">
                  <i data-feather="check-circle" className="h-4 w-4 inline mr-1"></i>
                  All systems operational
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <i data-feather="activity" className="h-6 w-6 text-orange-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/employees/create" className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <i data-feather="user-plus" className="h-6 w-6 text-blue-600 mb-2"></i>
                  <span className="text-sm font-medium text-blue-700">Add Employee</span>
                </Link>
                <Link href="/licenses/upload" className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <i data-feather="file-plus" className="h-6 w-6 text-green-600 mb-2"></i>
                  <span className="text-sm font-medium text-green-700">Upload License</span>
                </Link>
                <Link href="/tasks" className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <i data-feather="plus-square" className="h-6 w-6 text-purple-600 mb-2"></i>
                  <span className="text-sm font-medium text-purple-700">Create Task</span>
                </Link>
                <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <i data-feather="download" className="h-6 w-6 text-orange-600 mb-2"></i>
                  <span className="text-sm font-medium text-orange-700">Export Data</span>
                </button>
              </div>
            </div>

            {/* Task Completion Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Task Completion Trends</h2>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">Task completion chart will appear here</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i data-feather="check" className="h-4 w-4 text-green-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson completed "Security Training Module 3"</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i data-feather="user-plus" className="h-4 w-4 text-blue-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New employee "Michael Chen" added to IT Department</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i data-feather="alert-triangle" className="h-4 w-4 text-yellow-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">License renewal required for "Food Safety Certificate"</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i data-feather="upload" className="h-4 w-4 text-purple-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Document "Employee Handbook v2.1" uploaded</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">View All Activity</button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Urgent Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i data-feather="alert-circle" className="h-5 w-5 text-red-500 mr-2"></i>
                Urgent Items
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">CPR Certification Expired</h3>
                      <p className="text-xs text-gray-600 mt-1">John Smith - Safety Department</p>
                      <p className="text-xs text-red-600 mt-1 font-medium">Expired 2 days ago</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">URGENT</span>
                  </div>
                </div>
                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Missing Background Check</h3>
                      <p className="text-xs text-gray-600 mt-1">Maria Garcia - Finance Department</p>
                      <p className="text-xs text-red-600 mt-1 font-medium">Required for promotion</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">HIGH</span>
                  </div>
                </div>
                <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Annual Review Overdue</h3>
                      <p className="text-xs text-gray-600 mt-1">Alex Chen - Marketing Department</p>
                      <p className="text-xs text-yellow-600 mt-1 font-medium">Due 5 days ago</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">IN PROGRESS</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium">View All Urgent Items</button>
            </div>

            {/* License Expiry Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming License Renewals</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Safety Training</p>
                    <p className="text-xs text-gray-600">John Smith</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">Dec 18</p>
                    <p className="text-xs text-gray-500">3 days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Aid</p>
                    <p className="text-xs text-gray-600">Maria Garcia</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">Dec 23</p>
                    <p className="text-xs text-gray-500">8 days left</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Food Safety</p>
                    <p className="text-xs text-gray-600">Alex Chen</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Jan 15</p>
                    <p className="text-xs text-gray-500">31 days left</p>
                  </div>
                </div>
              </div>
              <Link href="/licenses" className="block w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Licenses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Script to initialize Feather icons */}
      <Script id="init-feather">
        {`
          if (typeof window !== 'undefined' && typeof feather !== 'undefined') {
            feather.replace();
          }
        `}
      </Script>
    </div>
  );
}
