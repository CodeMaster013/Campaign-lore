import React, { useState, useEffect } from 'react';
import { Target, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Plus, Edit3, Trash2 } from 'lucide-react';
import { supabase, Mission, User } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MissionBoardProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

export const MissionBoard: React.FC<MissionBoardProps> = ({ userClearance }) => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  useEffect(() => {
    fetchMissions();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [selectedStatus, userClearance]);

  const fetchMissions = async () => {
    try {
      let query = supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'archived': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Target className="w-4 h-4 text-blue-400" />;
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'Omega': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Alpha': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const hasAccess = (requiredClearance: 'Beta' | 'Alpha' | 'Omega'): boolean => {
    const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  };

  const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => {
    const canAccess = hasAccess(mission.clearance_required);
    const assignedUsers = users.filter(u => mission.assigned_to.includes(u.id));

    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${!canAccess ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(mission.status)}
            <h3 className="text-lg font-semibold text-white">
              {canAccess ? mission.title : '[CLASSIFIED MISSION]'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(mission.priority)}`}>
              {mission.priority.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(mission.clearance_required)}`}>
              {mission.clearance_required}
            </span>
            {user?.role === 'admin' && (
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingMission(mission)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMission(mission.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-3">
          {canAccess ? mission.description : '[CLEARANCE REQUIRED TO VIEW MISSION DETAILS]'}
        </p>

        {canAccess && (
          <>
            {mission.location && (
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{mission.location}</span>
              </div>
            )}

            {assignedUsers.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="flex gap-1">
                  {assignedUsers.map(user => (
                    <span key={user.id} className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {user.display_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {mission.objectives.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-300 mb-1">Objectives:</div>
                <ul className="text-sm text-gray-400 space-y-1">
                  {mission.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mission.rewards && (
              <div className="mt-3 p-2 bg-green-400/10 border border-green-400/20 rounded">
                <div className="text-sm font-medium text-green-400">Rewards: {mission.rewards}</div>
              </div>
            )}
          </>
        )}

        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          Created: {new Date(mission.created_at).toLocaleDateString()}
          {mission.completed_at && (
            <span className="ml-4">
              Completed: {new Date(mission.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  const deleteMission = async (missionId: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionId);
      
      if (error) throw error;
      fetchMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

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
          <h2 className="text-2xl font-bold text-white mb-2">Mission Board</h2>
          <p className="text-gray-400">Active operations and completed missions</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Mission
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex gap-2">
          {['active', 'completed', 'failed', 'archived', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 mb-2">No missions found</div>
          <div className="text-sm text-gray-500">
            {selectedStatus === 'active' ? 'No active missions at this time' : `No ${selectedStatus} missions`}
          </div>
        </div>
      )}

      {/* Create/Edit Mission Modal would go here */}
      {/* Implementation omitted for brevity but would include form for creating/editing missions */}
    </div>
  );
};