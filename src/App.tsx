import React, { useState } from 'react';
import { Terminal, Database, Home, Settings, User, LogOut, Crown } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { Dashboard } from './components/Dashboard';
import { LoreGrid } from './components/LoreGrid';
import { Terminal as TerminalComponent } from './components/Terminal';
import { LoreModal } from './components/LoreModal';
import { LoreEntry } from './data/loreDatabase';

type View = 'dashboard' | 'database' | 'terminal' | 'settings' | 'admin';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

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
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Crown }] : [])
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userClearance={user.clearanceLevel} />;
      case 'database':
        return <LoreGrid userClearance={user.clearanceLevel} onEntrySelect={setSelectedEntry} />;
      case 'terminal':
        return <TerminalComponent userClearance={user.clearanceLevel} />;
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <Dashboard userClearance={user.clearanceLevel} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Operative Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-2 gap-4">
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
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">THESEUS TERMINAL</h1>
              <p className="text-xs text-gray-400">United Laboratories Database Interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {currentView === 'terminal' ? (
            <TerminalComponent userClearance={user.clearanceLevel} />
          ) : (
            <div className="h-full overflow-y-auto p-6">
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