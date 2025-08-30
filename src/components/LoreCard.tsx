import React from 'react';
import { Lock, AlertTriangle, Info } from 'lucide-react';

interface LoreEntry {
  id: string;
  entry_id: string;
  name: string;
  type: string;
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  classification: string;
  description: string;
  details: string[];
  relations: Record<string, string[]>;
  status?: string;
  location?: string;
  notable: string[];
  warnings: string[];
  restricted?: string;
}

interface LoreCardProps {
  entry: LoreEntry;
  userClearance: 'Beta' | 'Alpha' | 'Omega';
  onClick?: () => void;
}

export const LoreCard: React.FC<LoreCardProps> = ({ entry, userClearance, onClick }) => {
  const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
  const hasAccess = clearanceLevels[userClearance] >= clearanceLevels[entry.clearance_level];

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'Beta': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Alpha': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Omega': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes('AI')) return 'text-cyan-400 bg-cyan-400/10';
    if (type.includes('Corporation')) return 'text-orange-400 bg-orange-400/10';
    if (type.includes('System')) return 'text-purple-400 bg-purple-400/10';
    if (type.includes('Project')) return 'text-green-400 bg-green-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div 
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer ${
        !hasAccess ? 'opacity-75' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{entry.name}</h3>
          {!hasAccess && <Lock className="w-4 h-4 text-red-400" />}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(entry.clearance_level)}`}>
            {entry.clearance_level}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.type)}`}>
          {entry.type}
        </span>
        {entry.status && (
          <span className="px-2 py-1 rounded text-xs font-medium text-gray-300 bg-gray-700">
            {entry.status}
          </span>
        )}
      </div>

      <p className={`text-sm mb-3 ${hasAccess ? 'text-gray-300' : 'text-gray-500'}`}>
        {hasAccess ? entry.description : '[CLASSIFIED INFORMATION - CLEARANCE REQUIRED]'}
      </p>

      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        {entry.classification}
      </div>

      {entry.warnings && entry.warnings.length > 0 && hasAccess && (
        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          <span>Contains warnings</span>
        </div>
      )}

      {entry.restricted && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
          <Lock className="w-3 h-3" />
          <span>Restricted access</span>
        </div>
      )}
    </div>
  );
};