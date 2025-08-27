import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Zap, AlertTriangle, Eye, Plus, Edit3 } from 'lucide-react';
import { supabase, StarSystem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StarMapProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

export const StarMap: React.FC<StarMapProps> = ({ userClearance }) => {
  const { user } = useAuth();
  const [systems, setSystems] = useState<StarSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchStarSystems();
  }, [userClearance]);

  useEffect(() => {
    if (systems.length > 0) {
      drawStarMap();
    }
  }, [systems, viewMode]);

  const fetchStarSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('star_systems')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Error fetching star systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (requiredClearance: 'Beta' | 'Alpha' | 'Omega'): boolean => {
    const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  };

  const drawStarMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background stars
    ctx.fillStyle = '#374151';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw star systems
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 200;

    systems.forEach(system => {
      if (!hasAccess(system.clearance_level)) return;

      const x = centerX + (system.coordinates.x * scale);
      const y = centerY + (system.coordinates.y * scale);

      // Draw system
      ctx.beginPath();
      ctx.arc(x, y, system.is_explored ? 8 : 6, 0, Math.PI * 2);
      
      // Color based on faction control
      if (system.faction_control === 'UL') {
        ctx.fillStyle = '#3B82F6'; // Blue
      } else if (system.faction_control === 'GC') {
        ctx.fillStyle = '#10B981'; // Green
      } else if (system.hazards.length > 0) {
        ctx.fillStyle = '#EF4444'; // Red
      } else {
        ctx.fillStyle = '#6B7280'; // Gray
      }
      
      ctx.fill();

      // Draw system name
      if (system.is_explored) {
        ctx.fillStyle = '#F9FAFB';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(system.name, x, y - 15);
      }

      // Draw trade routes
      if (system.trade_routes.length > 0) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        system.trade_routes.forEach(routeSystemName => {
          const targetSystem = systems.find(s => s.name === routeSystemName);
          if (targetSystem && hasAccess(targetSystem.clearance_level)) {
            const targetX = centerX + (targetSystem.coordinates.x * scale);
            const targetY = centerY + (targetSystem.coordinates.y * scale);
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
          }
        });
        
        ctx.setLineDash([]);
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 200;

    // Find clicked system
    for (const system of systems) {
      if (!hasAccess(system.clearance_level)) continue;

      const x = centerX + (system.coordinates.x * scale);
      const y = centerY + (system.coordinates.y * scale);
      
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (distance <= 10) {
        setSelectedSystem(system);
        break;
      }
    }
  };

  const SystemDetails: React.FC<{ system: StarSystem }> = ({ system }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-white">{system.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            system.is_explored ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
          }`}>
            {system.is_explored ? 'Explored' : 'Unexplored'}
          </span>
          {user?.role === 'admin' && (
            <button className="text-blue-400 hover:text-blue-300">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {system.description && (
        <p className="text-gray-300 mb-4">{system.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">System Type</div>
          <div className="text-white">{system.system_type}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Faction Control</div>
          <div className="text-white">{system.faction_control || 'Independent'}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Coordinates</div>
          <div className="text-white font-mono text-sm">
            {system.coordinates.x}, {system.coordinates.y}, {system.coordinates.z}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-400 mb-1">Clearance</div>
          <div className={`text-sm font-medium ${
            system.clearance_level === 'Omega' ? 'text-red-400' :
            system.clearance_level === 'Alpha' ? 'text-yellow-400' :
            'text-blue-400'
          }`}>
            {system.clearance_level}
          </div>
        </div>
      </div>

      {system.stars.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-400 mb-2">Stars</div>
          <div className="flex flex-wrap gap-1">
            {system.stars.map((star, index) => (
              <span key={index} className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-sm">
                {star}
              </span>
            ))}
          </div>
        </div>
      )}

      {system.planets.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-400 mb-2">Planets</div>
          <div className="flex flex-wrap gap-1">
            {system.planets.map((planet, index) => (
              <span key={index} className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-sm">
                {planet}
              </span>
            ))}
          </div>
        </div>
      )}

      {system.points_of_interest.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-400 mb-2">Points of Interest</div>
          <div className="space-y-2">
            {system.points_of_interest.map((poi, index) => (
              <div key={index} className="bg-gray-700 rounded p-2">
                <div className="font-medium text-white">{poi.name}</div>
                <div className="text-sm text-gray-300">{poi.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {system.hazards.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Hazards
          </div>
          <div className="space-y-1">
            {system.hazards.map((hazard, index) => (
              <div key={index} className="text-sm text-red-300 bg-red-400/10 px-2 py-1 rounded">
                {hazard}
              </div>
            ))}
          </div>
        </div>
      )}

      {system.trade_routes.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-400 mb-2">Trade Routes</div>
          <div className="flex flex-wrap gap-1">
            {system.trade_routes.map((route, index) => (
              <span key={index} className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-sm">
                {route}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
          <h2 className="text-2xl font-bold text-white mb-2">Galactic Star Map</h2>
          <p className="text-gray-400">Interactive map of known star systems</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            {viewMode.toUpperCase()} View
          </button>
          {user?.role === 'admin' && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add System
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Star Map */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-96 cursor-crosshair rounded"
              style={{ background: 'linear-gradient(45deg, #111827, #1f2937)' }}
            />
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <div>Click on systems to view details</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>UL Control</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>GC Control</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Hazardous</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div>
          {selectedSystem ? (
            <SystemDetails system={selectedSystem} />
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-400 mb-2">No System Selected</div>
                <div className="text-sm text-gray-500">
                  Click on a star system to view details
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System List */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Known Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {systems.filter(system => hasAccess(system.clearance_level)).map(system => (
            <button
              key={system.id}
              onClick={() => setSelectedSystem(system)}
              className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-white">{system.name}</div>
                <div className="flex items-center gap-1">
                  {system.is_explored ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400">{system.system_type}</div>
              {system.hazards.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">Hazardous</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};