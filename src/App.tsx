import React, { useState } from 'react';
import { Terminal, Database, Home, Settings, User } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LoreGrid } from './components/LoreGrid';
import { Terminal as TerminalComponent } from './components/Terminal';
import { LoreModal } from './components/LoreModal';
import { LoreEntry } from './data/loreDatabase';

type View = 'dashboard' | 'database' | 'terminal' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [userClearance, setUserClearance] = useState<'Beta' | 'Alpha' | 'Omega'>('Beta');
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userClearance={userClearance} />;
      case 'database':
        return <LoreGrid userClearance={userClearance} onEntrySelect={setSelectedEntry} />;
      case 'terminal':
        return <TerminalComponent userClearance={userClearance} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">User Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Clearance Level
                  </label>
                  <select
                    value={userClearance}
                    onChange={(e) => setUserClearance(e.target.value as 'Beta' | 'Alpha' | 'Omega')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="Beta">Beta - Standard Access</option>
                    <option value="Alpha">Alpha - Classified Access</option>
                    <option value="Omega">Omega - Unrestricted Access</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Simulates different clearance levels for testing purposes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">About Theseus Terminal</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                The Theseus Terminal is an interactive lore compendium for your campaign universe. 
                Players can explore the rich history of corporations, star systems, AI entities, and 
                classified projects through an immersive terminal interface. Access to information 
                is controlled by clearance levels, creating a sense of progression and discovery.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard userClearance={userClearance} />;
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
              <div className="text-sm font-medium">Operative</div>
              <div className={`text-xs ${
                userClearance === 'Omega' ? 'text-red-400' :
                userClearance === 'Alpha' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                Clearance: {userClearance}
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
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
            <TerminalComponent userClearance={userClearance} />
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
        userClearance={userClearance}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}

export default App;