"use client"

import { Card } from "../../../components/ui/card"
import { Settings, Database, Key, Bell } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Platform configuration and system settings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Database</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Database connection and management settings</p>
          <p className="text-slate-500 text-xs">Coming soon</p>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">API Keys</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Manage API keys and external service integrations</p>
          <p className="text-slate-500 text-xs">Coming soon</p>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Configure notification preferences and alerts</p>
          <p className="text-slate-500 text-xs">Coming soon</p>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">System</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">System-wide settings and maintenance options</p>
          <p className="text-slate-500 text-xs">Coming soon</p>
        </Card>
      </div>
    </div>
  )
}

