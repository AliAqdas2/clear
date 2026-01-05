import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe, Shield, Database, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 overflow-y-auto pb-24 md:pb-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <Link 
          href="/dashboard/this-month"
          className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium mb-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-text-main">Settings</h1>
        <p className="text-text-secondary">Manage your app preferences and account settings.</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Notifications</h2>
            <p className="text-sm text-text-secondary">Manage how you receive updates</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-text-main">Loan Due Reminders</p>
              <p className="text-sm text-text-secondary">Get notified when loans are due</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-text-main">Friend Requests</p>
              <p className="text-sm text-text-secondary">Notifications for friend requests</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-text-main">Monthly Summary</p>
              <p className="text-sm text-text-secondary">Receive monthly financial summaries</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Appearance</h2>
            <p className="text-sm text-text-secondary">Customize the look and feel</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-text-main">Theme</p>
              <p className="text-sm text-text-secondary">Light mode (default)</p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
              <button className="px-3 py-1.5 bg-white rounded-md text-sm font-medium shadow-sm">
                Light
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-main">
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Privacy & Security</h2>
            <p className="text-sm text-text-secondary">Control your data and privacy</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-semibold text-text-main">Data Sharing</p>
              <p className="text-sm text-text-secondary">Only shared loan transactions are visible</p>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              Private
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold text-text-main">Two-Factor Authentication</p>
              <p className="text-sm text-text-secondary">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Data Management</h2>
            <p className="text-sm text-text-secondary">Export or manage your data</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <div>
              <p className="font-semibold text-text-main">Export Data</p>
              <p className="text-sm text-text-secondary">Download your transactions and data</p>
            </div>
            <span className="text-sm text-text-secondary">→</span>
          </button>
          <button className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <div>
              <p className="font-semibold text-text-main">Clear Cache</p>
              <p className="text-sm text-text-secondary">Clear app cache and temporary data</p>
            </div>
            <span className="text-sm text-text-secondary">→</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">About</h2>
            <p className="text-sm text-text-secondary">App information and version</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="font-semibold text-text-main">Version</p>
            <p className="text-sm text-text-secondary">1.0.0</p>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <p className="font-semibold text-text-main">Build</p>
            <p className="text-sm text-text-secondary">Production</p>
          </div>
          <Link 
            href="https://github.com/yourusername/clear" 
            target="_blank"
            className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors"
          >
            <p className="font-semibold text-text-main">Source Code</p>
            <Globe className="w-4 h-4 text-text-secondary" />
          </Link>
        </div>
      </div>

      {/* App Philosophy */}
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-text-main mb-2">
          &quot;Clear shows you the truth about your money today, and clarity about tomorrow.&quot;
        </p>
        <p className="text-sm text-text-secondary">Clear Financial App</p>
      </div>
    </div>
  )
}

