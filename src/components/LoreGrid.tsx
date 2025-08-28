import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { loreDatabase, searchLore, LoreEntry } from '../data/loreDatabase';
import { LoreCard } from './LoreCard';

interface LoreGridProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
  onEntrySelect: (entry: LoreEntry) => void;
}

export const LoreGrid: React.FC<LoreGridProps> = ({ userClearance, onEntrySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClearance, setSelectedClearance] = useState('all');

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

  const filterEntries = (): LoreEntry[] => {
    let entries = Object.values(loreDatabase);

    // Search filter
    if (searchTerm) {
      entries = searchLore(searchTerm);
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
      entries = entries.filter(entry => types.includes(entry.type));
    }

    // Clearance filter
    if (selectedClearance !== 'all') {
      entries = entries.filter(entry => entry.clearanceLevel === selectedClearance);
    }

    return entries;
  };

  const filteredEntries = filterEntries();

  return (
    <div className="space-y-6">
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
        Showing {filteredEntries.length} of {Object.keys(loreDatabase).length} entries
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Lore Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEntries.map(entry => (
          <LoreCard
            key={entry.id}
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
    </div>
  );
};