import React, { useState } from 'react';
import { Terminal, Database, Home, Settings, User, LogOut, Crown, Target, Star, Users, MessageSquare, FileText, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Dashboard } from './components/Dashboard';
import { LoreGrid } from './components/LoreGrid';
import { Terminal as TerminalComponent } from './components/Terminal';
import { LoreModal } from './components/LoreModal';
import { MissionBoard } from './components/MissionBoard';
import { StarMap } from './components/StarMap';
import { NPCDatabase } from './components/NPCDatabase';
import { SessionNotes } from './components/SessionNotes';
import { CommunicationHub } from './components/CommunicationHub';
import { LoreEntry } from './data/loreDatabase';

type View = 'dashboard' | 'database' | 'terminal' | 'missions' | 'starmap' | 'npcs' | 'sessions' | 'communications' | 'settings' | 'admin';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white">Initializing Theseus Terminal...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'starmap', label: 'Star Map', icon: Star },
    { id: 'npcs', label: 'NPCs', icon: Users },
    { id: 'communications', label: 'Comms', icon: MessageSquare },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    ...(user.role === 'admin' ? [{ id: 'sessions', label: 'Sessions', icon: FileText }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Crown }] : [])
  ];

  const handleNavClick = (viewId: View) => {
    setCurrentView(viewId);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userClearance={user.clearanceLevel} />;
      case 'database':
        return <LoreGrid userClearance={user.clearanceLevel} onEntrySelect={setSelectedEntry} />;
      case 'terminal':
        return <TerminalComponent userClearance={user.clearanceLevel} />;
      case 'missions':
        return <MissionBoard userClearance={user.clearanceLevel} />;
      case 'starmap':
        return <StarMap userClearance={user.clearanceLevel} />;
      case 'npcs':
        return <NPCDatabase userClearance={user.clearanceLevel} />;
      case 'sessions':
        return <SessionNotes />;
      case 'communications':
        return <CommunicationHub userClearance={user.clearanceLevel} />;
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <Dashboard userClearance={user.clearanceLevel} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Operative Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                      <div className="text-white">{user.displayName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Operative ID</label>
                      <div className="text-white font-mono">@{user.username}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Clearance Level</label>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${
                        user.clearanceLevel === 'Omega' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                        user.clearanceLevel === 'Alpha' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                        'text-blue-400 bg-blue-400/10 border-blue-400/20'
                      }`}>
                        {user.clearanceLevel === 'Omega' && <Crown className="w-4 h-4" />}
                        {user.clearanceLevel}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Join Date</label>
                      <div className="text-white">{new Date(user.joinDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">About Theseus Terminal</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                The Theseus Terminal is an interactive lore compendium for your campaign universe. 
                Operatives can explore the rich history of corporations, star systems, AI entities, and 
                classified projects through an immersive terminal interface. Access to information 
                is controlled by clearance levels, creating a sense of progression and discovery.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard userClearance={user.clearanceLevel} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">THESEUS TERMINAL</h1>
              <p className="text-xs text-gray-400">United Laboratories Database Interface</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">THESEUS</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user.displayName}</div>
              <div className={`text-xs ${
                user.clearanceLevel === 'Omega' ? 'text-red-400' :
                user.clearanceLevel === 'Alpha' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                Clearance: {user.clearanceLevel}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                {user.avatar || <User className="w-4 h-4" />}
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Sidebar */}
        <nav className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 p-4 transition-transform duration-300 ease-in-out lg:transition-none`}>
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <div className="text-sm">
              <div className="text-white font-medium">{user.displayName}</div>
              <div className={`text-xs ${
                user.clearanceLevel === 'Omega' ? 'text-red-400' :
                user.clearanceLevel === 'Alpha' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {user.clearanceLevel} Clearance
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as View)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main Content */}
        <main className="flex-1 overflow-hidden lg:ml-0">
          {currentView === 'terminal' ? (
            <TerminalComponent userClearance={user.clearanceLevel} />
          ) : (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              {renderContent()}
            </div>
          )}
        </main>
      </div>

      {/* Lore Modal */}
      <LoreModal
        entry={selectedEntry}
        userClearance={user.clearanceLevel}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;