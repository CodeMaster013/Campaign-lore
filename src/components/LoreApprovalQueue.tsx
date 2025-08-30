import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Eye, Edit3, AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LoreEntryForm } from './LoreEntryForm';

interface PendingEntry {
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
  is_approved: boolean;
  submitted_by: string;
  created_at: string;
  submitter?: {
    display_name: string;
    username: string;
    clearance_level: string;
  };
}

export const LoreApprovalQueue: React.FC = () => {
  const { user } = useAuth();
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<PendingEntry | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingEntries();
    }
  }, [user]);

  const fetchPendingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('lore_entries')
        .select(`
          *,
          submitter:submitted_by(display_name, username, clearance_level)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPendingEntries(data || []);
    } catch (error) {
      console.error('Error fetching pending entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('lore_entries')
        .update({
          is_approved: true,
          approved_by: user?.id
        })
        .eq('id', entryId);
      
      if (error) throw error;
      fetchPendingEntries();
    } catch (error) {
      console.error('Error approving entry:', error);
    }
  };

  const rejectEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to reject this entry? This will permanently delete it.')) return;

    try {
      const { error } = await supabase
        .from('lore_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
      fetchPendingEntries();
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Error rejecting entry:', error);
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'Omega': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Alpha': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes('AI')) return 'text-cyan-400 bg-cyan-400/10';
    if (type.includes('Corporation')) return 'text-orange-400 bg-orange-400/10';
    if (type.includes('System')) return 'text-purple-400 bg-purple-400/10';
    if (type.includes('Project')) return 'text-green-400 bg-green-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  const EntryCard: React.FC<{ entry: PendingEntry }> = ({ entry }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{entry.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.type)}`}>
              {entry.type}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(entry.clearance_level)}`}>
              {entry.clearance_level}
            </span>
          </div>
          {entry.submitter && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>{entry.submitter.display_name} (@{entry.submitter.username})</span>
              <span className={`text-xs ${getClearanceColor(entry.submitter.clearance_level).split(' ')[0]}`}>
                {entry.submitter.clearance_level}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedEntry(entry)}
            className="text-blue-400 hover:text-blue-300 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedEntry(entry);
              setShowEditForm(true);
            }}
            className="text-yellow-400 hover:text-yellow-300 p-1"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => approveEntry(entry.id)}
            className="text-green-400 hover:text-green-300 p-1"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => rejectEntry(entry.id)}
            className="text-red-400 hover:text-red-300 p-1"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-3 line-clamp-3">{entry.description}</p>

      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        Submitted: {new Date(entry.created_at).toLocaleDateString()}
      </div>
    </div>
  );

  const EntryDetails: React.FC<{ entry: PendingEntry }> = ({ entry }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{entry.name}</h2>
        <button
          onClick={() => setSelectedEntry(null)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Type</div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(entry.type)}`}>
              {entry.type}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Clearance</div>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getClearanceColor(entry.clearance_level)}`}>
              {entry.clearance_level}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Classification</div>
          <div className="text-green-400 font-mono text-sm">{entry.classification}</div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Description</div>
          <p className="text-gray-300">{entry.description}</p>
        </div>

        {entry.details.length > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-2">Details</div>
            <ul className="space-y-1">
              {entry.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.notable.length > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-2">Notable Information</div>
            <div className="space-y-2">
              {entry.notable.map((note, index) => (
                <div key={index} className="bg-blue-400/10 border border-blue-400/20 rounded p-2">
                  <p className="text-blue-300 text-sm">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {entry.warnings.length > 0 && (
          <div>
            <div className="text-sm text-gray-400 mb-2">Warnings</div>
            <div className="space-y-2">
              {entry.warnings.map((warning, index) => (
                <div key={index} className="bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
                  <p className="text-yellow-300 text-sm">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <button
            onClick={() => approveEntry(entry.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => rejectEntry(entry.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <div className="text-red-400 mb-2">Access Denied</div>
        <div className="text-sm text-gray-500">
          Only administrators can access the approval queue
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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Lore Approval Queue</h2>
          <p className="text-gray-400">Review and approve submitted database entries</p>
        </div>
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{pendingEntries.length} Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Entries List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {pendingEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>

          {pendingEntries.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <div className="text-green-400 mb-2">All Caught Up!</div>
              <div className="text-sm text-gray-500">
                No pending entries require approval
              </div>
            </div>
          )}
        </div>

        {/* Entry Details */}
        <div>
          {selectedEntry ? (
            <EntryDetails entry={selectedEntry} />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-400 mb-2">No Entry Selected</div>
                <div className="text-sm text-gray-500">
                  Click on an entry to review details
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && selectedEntry && (
        <LoreEntryForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedEntry(null);
          }}
          onSubmit={() => {
            fetchPendingEntries();
            setShowEditForm(false);
            setSelectedEntry(null);
          }}
          editEntry={selectedEntry}
        />
      )}
    </div>
  );
};