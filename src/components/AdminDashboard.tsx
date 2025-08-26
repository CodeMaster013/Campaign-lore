import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Database, 
  Activity, 
  Settings, 
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  Crown,
  Star,
  Circle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loreDatabase, LoreEntry } from '../data/loreDatabase';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEntries: number;
  restrictedEntries: number;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'lore' | 'logs'>('overview');

  // Mock data - in a real app, this would come from your backend
  const stats: AdminStats = {
    totalUsers: 4,
    activeUsers: 3,
    totalEntries: Object.keys(loreDatabase).length,
    restrictedEntries: Object.values(loreDatabase).filter(entry => 
      entry.clearanceLevel === 'Alpha' || entry.clearanceLevel === 'Omega'
    ).length
  };

  const mockUsers = [
    { id: '1', username: 'operative-alpha', displayName: 'Agent Mitchell', clearance: 'Alpha', status: 'online', lastActive: '2 min ago' },
    { id: '2', username: 'operative-beta', displayName: 'Operative Chen', clearance: 'Beta', status: 'online', lastActive: '15 min ago' },
    { id: '3', username: 'recruit', displayName: 'Recruit Davis', clearance: 'Beta', status: 'offline', lastActive: '2 hours ago' },
  ];

  const mockLogs = [
    { timestamp: '2024-01-15 14:30:22', user: 'operative-alpha', action: 'Accessed GAIA entry', level: 'info' },
    { timestamp: '2024-01-15 14:25:15', user: 'operative-beta', action: 'Failed access to Project ASHLOCK', level: 'warning' },
    { timestamp: '2024-01-15 14:20:08', user: 'recruit', action: 'Searched for "Alpha Centauri"', level: 'info' },
    { timestamp: '2024-01-15 14:15:33', user: 'operative-alpha', action: 'Used terminal override command', level: 'alert' },
  ];

  const getClearanceIcon = (clearance: string) => {
    switch (clearance) {
      case 'Omega': return <Crown className="w-4 h-4 text-red-400" />;
      case 'Alpha': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Circle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getClearanceColor = (clearance: string) => {
    switch (clearance) {
      case 'Omega': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Alpha': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-400">Total Operatives</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              <div className="text-sm text-gray-400">Active Now</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
              <div className="text-sm text-gray-400">Lore Entries</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.restrictedEntries}</div>
              <div className="text-sm text-gray-400">Classified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {mockLogs.slice(0, 5).map((log, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.level === 'alert' ? 'bg-red-400' :
                  log.level === 'warning' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`}></div>
                <div>
                  <div className="text-white text-sm">{log.action}</div>
                  <div className="text-gray-400 text-xs">{log.user}</div>
                </div>
              </div>
              <div className="text-gray-500 text-xs">{log.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Operative Management</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Operative
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-300">Operative</th>
              <th className="text-left p-4 text-gray-300">Clearance</th>
              <th className="text-left p-4 text-gray-300">Status</th>
              <th className="text-left p-4 text-gray-300">Last Active</th>
              <th className="text-left p-4 text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-700">
                <td className="p-4">
                  <div className="text-white font-medium">{user.displayName}</div>
                  <div className="text-gray-400 text-sm">@{user.username}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getClearanceIcon(user.clearance)}
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(user.clearance)}`}>
                      {user.clearance}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-300 text-sm capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 text-sm">{user.lastActive}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLore = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Lore Database Management</h3>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(loreDatabase).map((entry) => (
          <div key={entry.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-white font-semibold">{entry.name}</h4>
              <div className="flex items-center gap-1">
                <button className="text-blue-400 hover:text-blue-300">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(entry.clearanceLevel)}`}>
                {entry.clearanceLevel}
              </span>
              <span className="px-2 py-1 rounded text-xs font-medium text-gray-300 bg-gray-700">
                {entry.type}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm line-clamp-3">{entry.description}</p>
            
            {entry.warnings && entry.warnings.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Contains warnings</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">System Logs</h3>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-300">Timestamp</th>
              <th className="text-left p-4 text-gray-300">User</th>
              <th className="text-left p-4 text-gray-300">Action</th>
              <th className="text-left p-4 text-gray-300">Level</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-4 text-gray-400 text-sm font-mono">{log.timestamp}</td>
                <td className="p-4 text-white">{log.user}</td>
                <td className="p-4 text-gray-300">{log.action}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.level === 'alert' ? 'bg-red-400/20 text-red-400' :
                    log.level === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-green-400/20 text-green-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Operatives', icon: Users },
    { id: 'lore', label: 'Lore Database', icon: Database },
    { id: 'logs', label: 'System Logs', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Founder Control Panel</h1>
            <p className="text-red-300">Omega Prime Clearance - Full System Access</p>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          Welcome back, {user?.displayName}. All systems are under your command.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'lore' && renderLore()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
};