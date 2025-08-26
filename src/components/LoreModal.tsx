import React from 'react';
import { X, Lock, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { LoreEntry } from '../data/loreDatabase';

interface LoreModalProps {
  entry: LoreEntry | null;
  userClearance: 'Beta' | 'Alpha' | 'Omega';
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ entry, userClearance, onClose }) => {
  if (!entry) return null;

  const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
  const hasAccess = clearanceLevels[userClearance] >= clearanceLevels[entry.clearanceLevel];

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{entry.name}</h2>
            {!hasAccess && <Lock className="w-5 h-5 text-red-400" />}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!hasAccess ? (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">ACCESS DENIED</h3>
              <p className="text-gray-400 mb-4">
                Clearance Level {entry.clearanceLevel} required to access this entry.
              </p>
              <p className="text-sm text-gray-500">
                Your current clearance: {userClearance}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Classification and Metadata */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Classification</div>
                    <div className="text-sm font-mono text-green-400">{entry.classification}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Clearance Level</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(entry.clearanceLevel)}`}>
                      {entry.clearanceLevel}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Type</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                  </div>
                  {entry.status && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Status</div>
                      <div className="text-sm text-white">{entry.status}</div>
                    </div>
                  )}
                  {entry.location && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Location</div>
                      <div className="text-sm text-white">{entry.location}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                <p className="text-gray-300 leading-relaxed">{entry.description}</p>
              </div>

              {/* Details */}
              {entry.details && entry.details.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                  <ul className="space-y-2">
                    {entry.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notable Information */}
              {entry.notable && entry.notable.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    Notable Information
                  </h3>
                  <div className="space-y-2">
                    {entry.notable.map((note, index) => (
                      <div key={index} className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {entry.warnings && entry.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Warnings
                  </h3>
                  <div className="space-y-2">
                    {entry.warnings.map((warning, index) => (
                      <div key={index} className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                        <p className="text-yellow-300 text-sm">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relations */}
              {entry.relations && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Relations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry.relations.allies && entry.relations.allies.length > 0 && (
                      <div>
                        <div className="text-sm text-green-400 font-medium mb-2">Allies</div>
                        <ul className="space-y-1">
                          {entry.relations.allies.map((ally, index) => (
                            <li key={index} className="text-sm text-gray-300">{ally}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.relations.rivals && entry.relations.rivals.length > 0 && (
                      <div>
                        <div className="text-sm text-red-400 font-medium mb-2">Rivals</div>
                        <ul className="space-y-1">
                          {entry.relations.rivals.map((rival, index) => (
                            <li key={index} className="text-sm text-gray-300">{rival}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Restricted Access Notice */}
              {entry.restricted && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Restricted Information</span>
                  </div>
                  <p className="text-red-300 text-sm">{entry.restricted}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};