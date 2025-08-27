import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Users, MapPin, Coins, Star, Plus, Edit3, Trash2, Search } from 'lucide-react';
import { supabase, SessionNote } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const SessionNotes: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .order('session_number', { ascending: false });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const { error } = await supabase
        .from('session_notes')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      fetchSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.key_events.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const SessionCard: React.FC<{ session: SessionNote }> = ({ session }) => (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
      onClick={() => setSelectedSession(session)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm font-medium">
              Session {session.session_number}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(session.date).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{session.title}</h3>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Edit session functionality
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-3 line-clamp-3">{session.summary}</p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {session.key_events.length > 0 && (
          <div>
            <div className="text-gray-400 mb-1">Key Events</div>
            <div className="text-white">{session.key_events.length} events</div>
          </div>
        )}
        {session.locations_visited.length > 0 && (
          <div>
            <div className="text-gray-400 mb-1">Locations</div>
            <div className="text-white">{session.locations_visited.length} visited</div>
          </div>
        )}
        {session.xp_awarded > 0 && (
          <div>
            <div className="text-gray-400 mb-1">XP Awarded</div>
            <div className="text-yellow-400 flex items-center gap-1">
              <Star className="w-4 h-4" />
              {session.xp_awarded}
            </div>
          </div>
        )}
        {session.loot_gained.length > 0 && (
          <div>
            <div className="text-gray-400 mb-1">Loot</div>
            <div className="text-green-400 flex items-center gap-1">
              <Coins className="w-4 h-4" />
              {session.loot_gained.length} items
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SessionDetails: React.FC<{ session: SessionNote }> = ({ session }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-600 text-white rounded font-medium">
              Session {session.session_number}
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{session.title}</h2>
        </div>
        <button
          onClick={() => setSelectedSession(null)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Session Summary</h3>
          <p className="text-gray-300">{session.summary}</p>
        </div>

        {session.key_events.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Key Events</h3>
            <div className="space-y-2">
              {session.key_events.map((event, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(session.player_actions).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Player Actions</h3>
            <div className="space-y-2">
              {Object.entries(session.player_actions).map(([player, action]) => (
                <div key={player} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">{player}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.npc_interactions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">NPC Interactions</h3>
            <div className="space-y-2">
              {session.npc_interactions.map((interaction, index) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <p className="text-gray-300">{interaction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.locations_visited.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Locations Visited</h3>
            <div className="flex flex-wrap gap-2">
              {session.locations_visited.map((location, index) => (
                <span key={index} className="px-3 py-1 bg-purple-400/20 text-purple-400 rounded flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        {session.loot_gained.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Loot & Rewards</h3>
            <div className="space-y-2">
              {session.loot_gained.map((loot, index) => (
                <div key={index} className="bg-green-400/10 border border-green-400/20 rounded p-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{loot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.xp_awarded > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Experience Awarded</h3>
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded p-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{session.xp_awarded} XP</span>
              </div>
            </div>
          </div>
        )}

        {session.next_session_prep && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Next Session Prep</h3>
            <div className="bg-blue-400/10 border border-blue-400/20 rounded p-4">
              <p className="text-blue-300">{session.next_session_prep}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-400 mb-2">Access Denied</div>
        <div className="text-sm text-gray-500">
          Session notes are only available to administrators
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-white mb-2">Session Notes</h2>
          <p className="text-gray-400">Campaign session tracking and management</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-2">
          <div className="text-sm text-gray-400 mb-4">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} recorded
          </div>

          <div className="space-y-4">
            {filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 mb-2">No sessions found</div>
              <div className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first session note to get started'}
              </div>
            </div>
          )}
        </div>

        {/* Session Details */}
        <div>
          {selectedSession ? (
            <SessionDetails session={selectedSession} />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-400 mb-2">No Session Selected</div>
                <div className="text-sm text-gray-500">
                  Click on a session to view details
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};