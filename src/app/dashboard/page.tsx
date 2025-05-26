
import Link from 'next/link';
import { getDashboardData } from '@/lib/data/dashboard';
import FeatherIconsLoader from '@/components/dashboard/FeatherIconsLoader';

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <FeatherIconsLoader />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your organization.</p>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: <span id="lastUpdated">just now</span>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></span>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        <div className="mb-6 space-y-3">
          {dashboardData.alerts.expiringLicenses.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200 animate-pulse">
              <div className="flex items-center">
                <i data-feather="alert-triangle" className="h-5 w-5 text-red-600 mr-3"></i>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-sm">
                    {dashboardData.metrics.expiringLicenses} License{dashboardData.metrics.expiringLicenses !== 1 ? 's' : ''} Expiring Soon
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    {dashboardData.alerts.expiringLicenses.map(license => 
                      `${license.name} for ${license.employee.firstName} ${license.employee.lastName}`
                    ).join(', ')} expire{dashboardData.alerts.expiringLicenses.length === 1 ? 's' : ''} soon.
                  </p>
                </div>
                <Link href="/license-tracking" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Review Now
                </Link>
              </div>
            </div>
          )}
          {dashboardData.metrics.pendingTasks > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 animate-pulse">
              <div className="flex items-center">
                <i data-feather="clock" className="h-5 w-5 text-yellow-600 mr-3"></i>
                <div className="flex-1">
                  <h3 className="text-yellow-800 font-semibold text-sm">{dashboardData.metrics.pendingTasks} Pending Tasks</h3>
                  <p className="text-yellow-700 text-sm mt-1">Tasks are waiting to be started and need attention.</p>
                </div>
                <Link href="/tasks" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  View Tasks
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.metrics.totalEmployees}</p>
                <p className="text-sm text-green-600 mt-2">
                  <i data-feather="trending-up" className="h-4 w-4 inline mr-1"></i>
                  {dashboardData.metrics.activeEmployees} active
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.metrics.totalLicenses}</p>
                <p className="text-sm text-red-600 mt-2">
                  <i data-feather="alert-circle" className="h-4 w-4 inline mr-1"></i>
                  {dashboardData.metrics.expiringLicenses} expiring soon
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.metrics.totalTasks}</p>
                <p className="text-sm text-yellow-600 mt-2">
                  <i data-feather="clock" className="h-4 w-4 inline mr-1"></i>
                  {dashboardData.metrics.pendingTasks} pending
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
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i data-feather="activity" className="h-6 w-6 text-green-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/employees/create" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-3">
                <i data-feather="user-plus" className="h-6 w-6 text-blue-600"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">Add Employee</span>
            </Link>
            
            <Link href="/licenses/create" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors mb-3">
                <i data-feather="upload" className="h-6 w-6 text-green-600"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">Upload License</span>
            </Link>
            
            <Link href="/tasks/create" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors mb-3">
                <i data-feather="plus-square" className="h-6 w-6 text-purple-600"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">Create Task</span>
            </Link>
            
            <Link href="/documents" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors mb-3">
                <i data-feather="download" className="h-6 w-6 text-orange-600"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">Export Data</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/activity-log" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => {
                  // Format the date with time
                  const formattedDate = new Date(activity.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  // Get icon based on entity type
                  const getEntityIcon = (entityType: string) => {
                    switch(entityType.toLowerCase()) {
                      case 'employee': return 'user';
                      case 'license': return 'shield';
                      case 'task': return 'check-square';
                      case 'document': return 'file-text';
                      case 'induction': return 'book-open';
                      case 'credential': return 'key';
                      default: return 'activity';
                    }
                  };
                  
                  return (
                    <div 
                      key={`${activity.entityType}-${activity.id}-${index}`} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i 
                          data-feather={getEntityIcon(activity.entityType)} 
                          className="h-4 w-4 text-blue-600"
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="font-medium text-gray-900">
                            {activity.user.firstName} {activity.user.lastName}
                          </span>
                          <span className="text-gray-600">{activity.actionMessage}</span>
                          {activity.entityUrl !== '#' && (
                            <Link 
                              href={activity.entityUrl}
                              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {activity.entityDisplayName || 'View'}
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formattedDate}
                        </p>
                        
                        {/* Show changes for updates */}
                        {activity.action === 'update' && Object.keys(activity.newValues).length > 0 && (
                          <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                            {Object.entries(activity.newValues).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                <span className="ml-2 text-gray-600">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <i data-feather="activity" className="h-6 w-6 text-gray-300 mx-auto"></i>
                  <p className="text-gray-500 text-sm mt-2">No recent activity to show</p>
                </div>
              )}
            </div>
          </div>

          {/* Urgent Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i data-feather="alert-triangle" className="h-5 w-5 text-red-500 mr-2"></i>
              Urgent Items
            </h2>
            <div className="space-y-3">
              {dashboardData.alerts.expiringLicenses.map(license => (
                <div key={license.id} className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{license.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{license.employee.firstName} {license.employee.lastName}</p>
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        Expires {new Date(license.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">URGENT</span>
                  </div>
                </div>
              ))}
              {dashboardData.alerts.expiringLicenses.length === 0 && (
                <p className="text-gray-500 text-sm">No urgent items</p>
              )}
            </div>
            <button className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium">View All Urgent Items</button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming License Renewals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming License Renewals</h2>
            <div className="space-y-3">
              {dashboardData.alerts.expiringLicenses.map(license => {
                const daysUntilExpiration = Math.ceil((new Date(license.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={license.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{license.name}</p>
                      <p className="text-xs text-gray-600">{license.employee.firstName} {license.employee.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{new Date(license.expiryDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{daysUntilExpiration} days left</p>
                    </div>
                  </div>
                );
              })}
              {dashboardData.alerts.expiringLicenses.length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming renewals</p>
              )}
            </div>
            <Link href="/license-tracking" className="block w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Licenses
            </Link>
          </div>

          {/* Task Completion Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Task Completion</h2>
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="7"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i data-feather="chevron-down" className="h-4 w-4"></i>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Completed Tasks */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                  <span className="text-sm font-semibold text-green-600">
                    {dashboardData.taskTrends.completed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${dashboardData.taskTrends.total > 0 ? (dashboardData.taskTrends.completed / dashboardData.taskTrends.total) * 100 : 0}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Pending Tasks */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {dashboardData.taskTrends.pending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${dashboardData.taskTrends.total > 0 ? (dashboardData.taskTrends.pending / dashboardData.taskTrends.total) * 100 : 0}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Total Tasks */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                  <span className="text-sm font-bold text-gray-900">
                    {dashboardData.taskTrends.total}
                  </span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/tasks" 
              className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i data-feather="list" className="h-4 w-4 mr-2"></i>
              View All Tasks
            </Link>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {dashboardData.taskTrends.completed} of {dashboardData.taskTrends.total} tasks completed
                {dashboardData.taskTrends.total > 0 ? 
                  ` (${Math.round((dashboardData.taskTrends.completed / dashboardData.taskTrends.total) * 100)}%)` : 
                  ''
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
