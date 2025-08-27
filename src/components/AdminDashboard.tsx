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
  Circle,
  Save,
  X
} from 'lucide-react';
import { Edit3 } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { supabase, User as DBUser } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEntries: number;
  restrictedEntries: number;
}



export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'lore' | 'logs'>('overview');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    display_name: '',
    email: '',
    clearance_level: 'Beta' as 'Beta' | 'Alpha' | 'Omega',
    role: 'player' as 'player' | 'admin'
  });
  
  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.display_name) {
      alert('Username and display name are required');
      return;
    }
    try {
      const { error } = await supabase
        .from('users')
        .insert([{
          ...newUser,
          is_active: true
        }]);
      if (error) throw error;
      setNewUser({
        username: '',
        display_name: '',
        email: '',
        clearance_level: 'Beta',
        role: 'player'
      });
      setShowAddUser(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Username might already exist.');
    }
  };

  const updateUserClearance = async (userId: string, clearance: 'Beta' | 'Alpha' | 'Omega') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ clearance_level: clearance })
        .eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating user clearance:', error);
    }
  };
  
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !isActive })
        .eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  // Mock data - in a real app, this would come from your backend
  const stats: AdminStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalEntries: 11, // This would come from lore_entries table
    restrictedEntries: 5 // This would come from lore_entries table
  };
  
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


          onClick={() => setShowAddUser(true)}

          <Plus className="w-4 h-4" />

          Add Operative

        </button>

      </div>




      {/* Add User Modal */}


      {showAddUser && (


        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">


          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">


            <div className="flex items-center justify-between mb-4">


              <h3 className="text-lg font-semibold text-white">Add New Operative</h3>


              <button


                onClick={() => setShowAddUser(false)}


                className="text-gray-400 hover:text-white"


              >


                <X className="w-5 h-5" />


              </button>


            </div>


            


            <div className="space-y-4">


              <div>


                <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>


                <input


                  type="text"


                  value={newUser.username}


                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}


                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"


                  placeholder="operative-name"


                />


              </div>


              


              <div>


                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>


                <input


                  type="text"


                  value={newUser.display_name}


                  onChange={(e) => setNewUser(prev => ({ ...prev, display_name: e.target.value }))}


                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"


                  placeholder="Agent Smith"


                />


              </div>


              


              <div>


                <label className="block text-sm font-medium text-gray-300 mb-1">Email (Optional)</label>


                <input


                  type="email"


                  value={newUser.email}


                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}


                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"


                  placeholder="agent@ul.com"


                />


              </div>


              


              <div>


                <label className="block text-sm font-medium text-gray-300 mb-1">Clearance Level</label>


                <select


                  value={newUser.clearance_level}


                  onChange={(e) => setNewUser(prev => ({ ...prev, clearance_level: e.target.value as any }))}


                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"


                >


                  <option value="Beta">Beta</option>


                  <option value="Alpha">Alpha</option>


                  <option value="Omega">Omega</option>


                </select>


              </div>


              


              <div>


                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>


                <select


                  value={newUser.role}


                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}


                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"


                >


                  <option value="player">Player</option>


                  <option value="admin">Admin</option>


                </select>


              </div>


            </div>


            


            <div className="flex gap-2 mt-6">


              <button


                onClick={createUser}


                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"


              >


                <Save className="w-4 h-4" />


                Create Operative


              </button>


              <button


                onClick={() => setShowAddUser(false)}


                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"


              >


                Cancel


              </button>


            </div>


          </div>


        </div>


      )}




      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">


        {loading ? (


          <div className="flex items-center justify-center p-8">


            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>


          </div>


        ) : (

        <table className="w-full">

          <thead className="bg-gray-700">

            <tr>

              <th className="text-left p-4 text-gray-300">Operative</th>

              <th className="text-left p-4 text-gray-300">Clearance</th>

              <th className="text-left p-4 text-gray-300">Status</th>


              <th className="text-left p-4 text-gray-300">Role</th>

              <th className="text-left p-4 text-gray-300">Actions</th>

            </tr>

          </thead>

          <tbody>


            {users.map((dbUser) => (


              <tr key={dbUser.id} className="border-t border-gray-700">

                <td className="p-4">


                  <div className="text-white font-medium">{dbUser.display_name}</div>


                  <div className="text-gray-400 text-sm">@{dbUser.username}</div>


                  {dbUser.email && <div className="text-gray-500 text-xs">{dbUser.email}</div>}

                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">


                    {getClearanceIcon(dbUser.clearance_level)}


                    <select


                      value={dbUser.clearance_level}


                      onChange={(e) => updateUserClearance(dbUser.id, e.target.value as any)}


                      className={`px-2 py-1 rounded text-xs font-medium border bg-transparent ${getClearanceColor(dbUser.clearance_level)}`}


                    >


                      <option value="Beta">Beta</option>


                      <option value="Alpha">Alpha</option>


                      <option value="Omega">Omega</option>


                    </select>

                  </div>

                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">


                    <div className={`w-2 h-2 rounded-full ${dbUser.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>


                    <span className="text-gray-300 text-sm">{dbUser.is_active ? 'Active' : 'Inactive'}</span>

                  </div>

                </td>


                <td className="p-4">


                  <span className={`px-2 py-1 rounded text-xs font-medium ${


                    dbUser.role === 'admin' ? 'bg-red-400/20 text-red-400' : 'bg-blue-400/20 text-blue-400'


                  }`}>


                    {dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1)}


                  </span>


                </td>

                <td className="p-4">

                  <div className="flex items-center gap-2">

                    <button className="text-blue-400 hover:text-blue-300">


                      onClick={() => toggleUserStatus(dbUser.id, dbUser.is_active)}


                      className={`${dbUser.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}


                      title={dbUser.is_active ? 'Deactivate user' : 'Activate user'}


                    >


                      {dbUser.is_active ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}


                    </button>


                    <button 
                      <Edit3 className="w-4 h-4" />
                    </button>


                    <button 


                      className="text-gray-400 hover:text-gray-300"


                      title="View details"


                    >

                      <Eye className="w-4 h-4" />

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        )}

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




      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">


        <div className="text-center py-8">


          <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />


          <div className="text-gray-400 mb-2">Lore Management Coming Soon</div>


          <div className="text-sm text-gray-500">


            Dynamic lore entry management will be available in the next update



























          </div>


        </div>

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
