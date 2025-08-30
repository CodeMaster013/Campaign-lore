import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LoreCard } from './LoreCard';
import { LoreEntryForm } from './LoreEntryForm';

interface DatabaseLoreEntry {
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
  created_at: string;
}

interface LoreGridProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
  onEntrySelect: (entry: DatabaseLoreEntry) => void;
}

export const LoreGrid: React.FC<LoreGridProps> = ({ userClearance, onEntrySelect }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DatabaseLoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClearance, setSelectedClearance] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  React.useEffect(() => {
    fetchEntries();
  }, [userClearance]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('lore_entries')
        .select('*')
        .eq('is_approved', true)
        .order('name');
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching lore entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'systems', label: 'Star Systems' },
    { value: 'corporations', label: 'Corporations' },
    { value: 'ai', label: 'AI Systems' },
    { value: 'projects', label: 'Projects' }
  ];

  const clearanceLevels = [
    { value: 'all', label: 'All Clearance' },
    { value: 'Beta', label: 'Beta' },
    { value: 'Alpha', label: 'Alpha' },
    { value: 'Omega', label: 'Omega' }
  ];

  const filterEntries = (): DatabaseLoreEntry[] => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(searchLower) ||
        entry.type.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.details.some(detail => detail.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string[]> = {
        'systems': ['Star System'],
        'corporations': ['Megacorporation', 'Corporation (Defunct)', 'Corporation (Dissolved)'],
        'ai': ['Central Terraforming AI', 'House AI', 'Archival Intelligence'],
        'projects': ['Planetary Transformation', 'Recovery Protocol', 'Artificially Habitable Galaxy']
      };
      
      const types = categoryMap[selectedCategory] || [];
      filtered = filtered.filter(entry => types.includes(entry.type));
    }

    // Clearance filter
    if (selectedClearance !== 'all') {
      filtered = filtered.filter(entry => entry.clearance_level === selectedClearance);
    }

    return filtered;
  };

  const filteredEntries = filterEntries();

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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Lore Database</h2>
          <p className="text-gray-400">Explore the campaign universe</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Submit Entry</span>
          <span className="sm:hidden">Submit</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search database entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none w-full sm:w-auto"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clearance Filter */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedClearance}
              onChange={(e) => setSelectedClearance(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400 appearance-none w-full sm:w-auto"
            >
              {clearanceLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredEntries.length} of {entries.length} entries
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Lore Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEntries.map(entry => (
          <LoreCard
            key={entry.entry_id}
            entry={entry}
            userClearance={userClearance}
            onClick={() => onEntrySelect(entry)}
          />
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No entries found</div>
          <div className="text-sm text-gray-500">
            Try adjusting your search terms or filters
          </div>
        </div>
      )}

      {/* Create Entry Form */}
      <LoreEntryForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={() => {
          fetchEntries();
          setShowCreateForm(false);
        }}
      />
    </div>
  );
};