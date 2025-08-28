import React from 'react';
import { Shield, Database, Users, Zap, AlertCircle } from 'lucide-react';

interface DashboardProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

export const Dashboard: React.FC<DashboardProps> = ({ userClearance }) => {
  const dailyBriefings = [
    "UL Research Division reports 15% increase in terraforming efficiency across Genesis Galaxy sectors.",
    "GC Council debates new regulations on AI consciousness thresholds following recent Theseus upgrades.",
    "Frontier colonies in Outer Rim report unusual energy signatures - investigation teams dispatched.",
    "Project ASHLOCK Phase 3 trials show promising results in GAIA fragment integration.",
    "Trade routes through Alpha Centauri experiencing minor delays due to increased security protocols."
  ];

  const randomBriefing = dailyBriefings[Math.floor(Math.random() * dailyBriefings.length)];

  const getAccessLevel = () => {
    switch (userClearance) {
      case 'Omega': return { level: 'OMEGA PRIME', color: 'text-red-400', access: 'UNRESTRICTED ACCESS' };
      case 'Alpha': return { level: 'ALPHA', color: 'text-yellow-400', access: 'CLASSIFIED ACCESS' };
      default: return { level: 'BETA', color: 'text-blue-400', access: 'STANDARD ACCESS' };
    }
  };

  const accessInfo = getAccessLevel();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to the Theseus Terminal
            </h1>
            <p className="text-gray-300">
              United Laboratories Galactic Database Interface
            </p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${accessInfo.color}`}>
              CLEARANCE LEVEL: {accessInfo.level}
            </div>
            <div className="text-sm text-gray-400">
              {accessInfo.access}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-600 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-semibold">Daily Briefing</span>
          </div>
          <p className="text-gray-300 text-sm">{randomBriefing}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">11</div>
              <div className="text-xs sm:text-sm text-gray-400">Database Entries</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">4</div>
              <div className="text-xs sm:text-sm text-gray-400">Active Factions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">3</div>
              <div className="text-xs sm:text-sm text-gray-400">Active Projects</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {userClearance === 'Omega' ? '0' : userClearance === 'Alpha' ? '2' : '5'}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Restricted Files</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 text-left transition-colors">
            <div className="text-blue-400 font-semibold mb-1">Star Systems</div>
            <div className="text-xs sm:text-sm text-gray-300">Explore galactic territories</div>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 text-left transition-colors">
            <div className="text-orange-400 font-semibold mb-1">Corporations</div>
            <div className="text-xs sm:text-sm text-gray-300">Corporate entities & history</div>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 text-left transition-colors">
            <div className="text-cyan-400 font-semibold mb-1">AI Systems</div>
            <div className="text-xs sm:text-sm text-gray-300">Artificial intelligence profiles</div>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg p-4 text-left transition-colors">
            <div className="text-green-400 font-semibold mb-1">Projects</div>
            <div className="text-xs sm:text-sm text-gray-300">Classified operations</div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Theseus AI Core</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">ONLINE</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Database Integrity</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">VERIFIED</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Security Protocols</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400 text-sm">ELEVATED</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Network Connection</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};