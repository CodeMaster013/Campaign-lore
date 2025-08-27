import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, Edit3, Trash2, Heart, Skull, HelpCircle, MapPin } from 'lucide-react';
import { supabase, NPC } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NPCDatabaseProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

export const NPCDatabase: React.FC<NPCDatabaseProps> = ({ userClearance }) => {
  const { user } = useAuth();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaction, setSelectedFaction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

  useEffect(() => {
    fetchNPCs();
  }, [userClearance]);

  const fetchNPCs = async () => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setNpcs(data || []);
    } catch (error) {
      console.error('Error fetching NPCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (requiredClearance: 'Beta' | 'Alpha' | 'Omega'): boolean => {
    const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alive': return <Heart className="w-4 h-4 text-green-400" />;
      case 'dead': return <Skull className="w-4 h-4 text-red-400" />;
      case 'missing': return <HelpCircle className="w-4 h-4 text-yellow-400" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'Omega': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Alpha': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getFactionColor = (faction: string) => {
    switch (faction?.toLowerCase()) {
      case 'ul':
      case 'united laboratories': return 'text-blue-400 bg-blue-400/10';
      case 'gc':
      case 'galactic community': return 'text-green-400 bg-green-400/10';
      case 'rda': return 'text-orange-400 bg-orange-400/10';
      case 'fas': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filterNPCs = (): NPC[] => {
    let filtered = npcs.filter(npc => hasAccess(npc.clearance_level));

    if (searchTerm) {
      filtered = filtered.filter(npc =>
        npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        npc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        npc.faction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        npc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFaction !== 'all') {
      filtered = filtered.filter(npc => 
        npc.faction?.toLowerCase() === selectedFaction.toLowerCase()
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(npc => npc.status === selectedStatus);
    }

    return filtered;
  };

  const deleteNPC = async (npcId: string) => {
    if (!confirm('Are you sure you want to delete this NPC?')) return;

    try {
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', npcId);
      
      if (error) throw error;
      fetchNPCs();
      if (selectedNPC?.id === npcId) {
        setSelectedNPC(null);
      }
    } catch (error) {
      console.error('Error deleting NPC:', error);
    }
  };

  const NPCCard: React.FC<{ npc: NPC }> = ({ npc }) => (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
      onClick={() => setSelectedNPC(npc)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {npc.image_url ? (
            <img src={npc.image_url} alt={npc.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{npc.name}</h3>
            {npc.title && <p className="text-sm text-gray-400">{npc.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(npc.status)}
          {user?.role === 'admin' && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit NPC functionality
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNPC(npc.id);
                }}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {npc.faction && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getFactionColor(npc.faction)}`}>
            {npc.faction}
          </span>
        )}
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(npc.clearance_level)}`}>
          {npc.clearance_level}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          npc.status === 'alive' ? 'bg-green-400/20 text-green-400' :
          npc.status === 'dead' ? 'bg-red-400/20 text-red-400' :
          'bg-yellow-400/20 text-yellow-400'
        }`}>
          {npc.status.charAt(0).toUpperCase() + npc.status.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-300 mb-3 line-clamp-3">{npc.description}</p>

      {npc.location && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{npc.location}</span>
        </div>
      )}

      {npc.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {npc.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
              {tag}
            </span>
          ))}
          {npc.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
              +{npc.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  const NPCDetails: React.FC<{ npc: NPC }> = ({ npc }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {npc.image_url ? (
            <img src={npc.image_url} alt={npc.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{npc.name}</h2>
            {npc.title && <p className="text-gray-400">{npc.title}</p>}
          </div>
        </div>
        <button
          onClick={() => setSelectedNPC(null)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Faction</div>
          <div className="text-white">{npc.faction || 'Independent'}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Status</div>
          <div className="flex items-center gap-2">
            {getStatusIcon(npc.status)}
            <span className="text-white capitalize">{npc.status}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Location</div>
          <div className="text-white">{npc.location || 'Unknown'}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Clearance</div>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(npc.clearance_level)}`}>
            {npc.clearance_level}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
          <p className="text-gray-300">{npc.description}</p>
        </div>

        {npc.personality && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Personality</h3>
            <p className="text-gray-300">{npc.personality}</p>
          </div>
        )}

        {npc.appearance && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Appearance</h3>
            <p className="text-gray-300">{npc.appearance}</p>
          </div>
        )}

        {npc.background && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Background</h3>
            <p className="text-gray-300">{npc.background}</p>
          </div>
        )}

        {Object.keys(npc.relationships).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Relationships</h3>
            <div className="space-y-2">
              {Object.entries(npc.relationships).map(([person, relationship]) => (
                <div key={person} className="bg-gray-700 rounded p-3">
                  <div className="font-medium text-white">{person}</div>
                  <div className="text-sm text-gray-300">{relationship}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {npc.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {npc.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const filteredNPCs = filterNPCs();
  const factions = [...new Set(npcs.map(npc => npc.faction).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">NPC Database</h2>
          <p className="text-gray-400">Character profiles and relationship tracking</p>
        </div>
        {user?.role === 'admin' && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add NPC
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search NPCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none"
            >
              <option value="all">All Factions</option>
              {factions.map(faction => (
                <option key={faction} value={faction}>{faction}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="alive">Alive</option>
              <option value="dead">Dead</option>
              <option value="missing">Missing</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPC List */}
        <div className="lg:col-span-2">
          <div className="text-sm text-gray-400 mb-4">
            Showing {filteredNPCs.length} of {npcs.filter(npc => hasAccess(npc.clearance_level)).length} NPCs
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNPCs.map(npc => (
              <NPCCard key={npc.id} npc={npc} />
            ))}
          </div>

          {filteredNPCs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 mb-2">No NPCs found</div>
              <div className="text-sm text-gray-500">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </div>

        {/* NPC Details */}
        <div>
          {selectedNPC ? (
            <NPCDetails npc={selectedNPC} />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-400 mb-2">No NPC Selected</div>
                <div className="text-sm text-gray-500">
                  Click on an NPC to view their profile
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};