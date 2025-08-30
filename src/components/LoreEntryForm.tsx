import React, { useState } from 'react';
import { Plus, X, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoreEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editEntry?: any;
}

export const LoreEntryForm: React.FC<LoreEntryFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  editEntry 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    entry_id: editEntry?.entry_id || '',
    name: editEntry?.name || '',
    type: editEntry?.type || '',
    clearance_level: editEntry?.clearance_level || 'Beta',
    classification: editEntry?.classification || '',
    description: editEntry?.description || '',
    details: editEntry?.details || [],
    relations: editEntry?.relations || {},
    status: editEntry?.status || '',
    location: editEntry?.location || '',
    notable: editEntry?.notable || [],
    warnings: editEntry?.warnings || [],
    restricted: editEntry?.restricted || ''
  });

  const [newDetail, setNewDetail] = useState('');
  const [newNotable, setNewNotable] = useState('');
  const [newWarning, setNewWarning] = useState('');
  const [relationKey, setRelationKey] = useState('');
  const [relationValue, setRelationValue] = useState('');

  const entryTypes = [
    'Star System',
    'Megacorporation',
    'Corporation (Defunct)',
    'Corporation (Dissolved)',
    'Central Terraforming AI',
    'House AI',
    'Archival Intelligence',
    'Planetary Transformation',
    'Recovery Protocol',
    'Artificially Habitable Galaxy',
    'Character',
    'Location',
    'Technology',
    'Event',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const entryData = {
        ...formData,
        submitted_by: user?.id,
        is_approved: user?.role === 'admin', // Auto-approve if admin
        approved_by: user?.role === 'admin' ? user.id : null
      };

      if (editEntry && user?.role === 'admin') {
        // Update existing entry
        const { error } = await supabase
          .from('lore_entries')
          .update(entryData)
          .eq('id', editEntry.id);
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('lore_entries')
          .insert([entryData]);
        
        if (error) throw error;
      }

      onSubmit();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const addDetail = () => {
    if (newDetail.trim()) {
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, newDetail.trim()]
      }));
      setNewDetail('');
    }
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const addNotable = () => {
    if (newNotable.trim()) {
      setFormData(prev => ({
        ...prev,
        notable: [...prev.notable, newNotable.trim()]
      }));
      setNewNotable('');
    }
  };

  const removeNotable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notable: prev.notable.filter((_, i) => i !== index)
    }));
  };

  const addWarning = () => {
    if (newWarning.trim()) {
      setFormData(prev => ({
        ...prev,
        warnings: [...prev.warnings, newWarning.trim()]
      }));
      setNewWarning('');
    }
  };

  const removeWarning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      warnings: prev.warnings.filter((_, i) => i !== index)
    }));
  };

  const addRelation = () => {
    if (relationKey.trim() && relationValue.trim()) {
      setFormData(prev => ({
        ...prev,
        relations: {
          ...prev.relations,
          [relationKey.trim()]: relationValue.trim().split(',').map(v => v.trim())
        }
      }));
      setRelationKey('');
      setRelationValue('');
    }
  };

  const removeRelation = (key: string) => {
    setFormData(prev => {
      const newRelations = { ...prev.relations };
      delete newRelations[key];
      return { ...prev, relations: newRelations };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 sm:p-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {editEntry ? 'Edit Lore Entry' : 'Submit New Lore Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entry ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.entry_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="unique-entry-id"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Entry Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  required
                >
                  <option value="">Select Type</option>
                  {entryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clearance Level <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.clearance_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, clearance_level: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  required
                >
                  <option value="Beta">Beta</option>
                  <option value="Alpha">Alpha</option>
                  <option value="Omega">Omega</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Classification <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.classification}
                  onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="GC ARCHIVE - OPEN ACCESS"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Active, Defunct, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Physical location"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-24"
                placeholder="Main description of the entry..."
                required
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Add detail..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
                  />
                  <button
                    type="button"
                    onClick={addDetail}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-700 rounded p-2">
                      <span className="flex-1 text-sm text-gray-300">{detail}</span>
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notable Information */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notable Information</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNotable}
                    onChange={(e) => setNewNotable(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Add notable information..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNotable())}
                  />
                  <button
                    type="button"
                    onClick={addNotable}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.notable.map((note, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded p-2">
                      <span className="flex-1 text-sm text-blue-300">{note}</span>
                      <button
                        type="button"
                        onClick={() => removeNotable(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Warnings</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Add warning..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWarning())}
                  />
                  <button
                    type="button"
                    onClick={addWarning}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
                      <span className="flex-1 text-sm text-yellow-300">{warning}</span>
                      <button
                        type="button"
                        onClick={() => removeWarning(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Relations */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Relations</label>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={relationKey}
                    onChange={(e) => setRelationKey(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Relation type (allies, rivals, etc.)"
                  />
                  <input
                    type="text"
                    value={relationValue}
                    onChange={(e) => setRelationValue(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Comma-separated names"
                  />
                  <button
                    type="button"
                    onClick={addRelation}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.entries(formData.relations).map(([key, values]) => (
                    <div key={key} className="flex items-center gap-2 bg-gray-700 rounded p-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{key}</div>
                        <div className="text-xs text-gray-400">{Array.isArray(values) ? values.join(', ') : values}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRelation(key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Restricted Information */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Restricted Information</label>
              <textarea
                value={formData.restricted}
                onChange={(e) => setFormData(prev => ({ ...prev, restricted: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-20"
                placeholder="Information requiring higher clearance..."
              />
            </div>

            {/* Submission Notice */}
            {user?.role !== 'admin' && (
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">Approval Required</span>
                </div>
                <p className="text-yellow-300 text-sm">
                  Your submission will be sent to the Founder for review and approval before being added to the database.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editEntry ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    {editEntry ? 'Update Entry' : 'Submit Entry'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};