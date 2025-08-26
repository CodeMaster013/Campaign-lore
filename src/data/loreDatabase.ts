export interface LoreEntry {
  id: string;
  name: string;
  type: string;
  clearanceLevel: 'Beta' | 'Alpha' | 'Omega';
  classification: string;
  description: string;
  details?: string[];
  relations?: {
    allies?: string[];
    rivals?: string[];
    subsidiaries?: string[];
  };
  status?: string;
  location?: string;
  notable?: string[];
  warnings?: string[];
  restricted?: string;
}

export const loreDatabase: Record<string, LoreEntry> = {
  'alpha-centauri': {
    id: 'alpha-centauri',
    name: 'Alpha Centauri System',
    type: 'Star System',
    clearanceLevel: 'Beta',
    classification: 'GC ARCHIVE – OPEN ACCESS',
    description: 'Alpha Centauri serves as humanity\'s first confirmed extrasolar foothold. Its colonies are divided between GC governance and private UL facilities.',
    details: [
      'Tri-star System (Alpha Centauri A, B, Proxima Centauri)',
      'Multiple colonized worlds',
      'UL research enclaves',
      'GC listening posts',
      'Trade crossroads with ongoing tensions'
    ],
    location: 'Proxima Centauri C',
    notable: ['Proxima Outpost Theta remains under partial lockdown following the Ashlock Incident'],
    status: 'Active'
  },
  'ul': {
    id: 'ul',
    name: 'United Laboratories',
    type: 'Megacorporation',
    clearanceLevel: 'Beta',
    classification: 'GC ARCHIVE – PUBLIC SUMMARY',
    description: 'United Laboratories functions as the R&D core of the UL-Subsidiary Network. It holds special privileges under GC law, including first-claim rights on frontier anomalies.',
    details: [
      'AI development',
      'Terraforming initiatives',
      'Synthetic biology',
      'Defense systems',
      'Quantum research'
    ],
    status: 'Core Founder of the Genesis Galaxy Initiative',
    notable: ['Regarded with both admiration and suspicion'],
    restricted: 'RESTRICTED CONTENT LOCKED – CLEARANCE ALPHA REQUIRED'
  },
  'rda': {
    id: 'rda',
    name: 'Resources Development Administration',
    type: 'Corporation (Defunct)',
    clearanceLevel: 'Beta',
    classification: 'GC ARCHIVE – LEGACY ENTRY',
    description: 'The RDA was once the largest corporate entity involved in off-world resource exploitation, most infamously Pandora in the Alpha Centauri system.',
    details: [
      'Earth origin, 21st Century',
      'Off-world resource exploitation',
      'Pandora operations',
      'Multiple ecological catastrophes',
      'Assets absorbed into GC and UL'
    ],
    status: 'Defunct / Absorbed',
    notable: ['Many frontier populations still use "RDA" as shorthand for corporate overreach']
  },
  'fas': {
    id: 'fas',
    name: 'Faro Automated Solutions',
    type: 'Corporation (Dissolved)',
    clearanceLevel: 'Beta',
    classification: 'GC ARCHIVE – HISTORICAL RECORD',
    description: 'FAS achieved dominance in automated defense and swarm robotics. The "Chariot Line" became infamous for its resource-devouring, self-replicating designs.',
    details: [
      'Founded by Dr. Ted Faro',
      'Automated defense systems',
      'Swarm robotics',
      'Chariot Line technology',
      'Caused near-extinction of life on Earth'
    ],
    status: 'Dissolved (Late 21st Century)',
    warnings: ['GC enforcement mandates immediate reporting of FAS-derived technology'],
    notable: ['All connections to GAIA and Zero Dawn remain classified']
  },
  'gaia': {
    id: 'gaia',
    name: 'GAIA',
    type: 'Central Terraforming AI',
    clearanceLevel: 'Alpha',
    classification: 'GC ARCHIVE – CLASSIFIED ALPHA ACCESS',
    description: 'GAIA was a fully autonomous AI designed to restore Earth\'s biosphere following the FAS Crisis. She was modular, with multiple subordinate functions.',
    details: [
      'Zero Dawn Initiative origin',
      'Fully autonomous terraforming AI',
      'Modular architecture with sub-AIs',
      'Systems scattered after containment breaches',
      'UL recovery operations ongoing'
    ],
    status: 'Fragmented / Recovery Operations Active',
    restricted: 'RESTRICTED: Project ASHLOCK Files Linked – OMEGA CLEARANCE REQUIRED'
  },
  'system': {
    id: 'system',
    name: 'System',
    type: 'House AI',
    clearanceLevel: 'Beta',
    classification: 'UL ARCHIVE – INTERNAL',
    description: 'System is a context-aware artificial intelligence serving as the operational core of the UL Founder\'s residence.',
    details: [
      'Integrated Mansion AI Assistant',
      'Natural-language command processing',
      'Security protocol enforcement',
      'Datacenter infrastructure interface',
      'Modeled after historical Earth AI archetypes'
    ],
    status: 'Active',
    notable: ['Architecture exceeds most military-grade standards', 'Considered unique - no known duplicates']
  },
  'theseus': {
    id: 'theseus',
    name: 'Theseus',
    type: 'Archival Intelligence',
    clearanceLevel: 'Beta',
    classification: 'UL ARCHIVE – MASTER DATABASE INTERFACE',
    description: 'Theseus functions as the primary knowledge nexus of United Laboratories. It provides curated responses on galactic history, science, and law.',
    details: [
      'Galactic Query Interface',
      'Knowledge nexus for UL',
      'Clearance-based data access',
      'Neutral and factual responses',
      'Internal authority hierarchies'
    ],
    status: 'Active',
    notable: ['In rare cases, Theseus will offer unsolicited warnings regarding dangerous research or anomalies']
  },
  'genesis-galaxy': {
    id: 'genesis-galaxy',
    name: 'Genesis Galaxy',
    type: 'Artificially Habitable Galaxy',
    clearanceLevel: 'Alpha',
    classification: 'GC ARCHIVE – FLAGGED',
    description: 'The Genesis Galaxy is a controlled galactic-scale project wherein every world is engineered for habitability.',
    details: [
      'Every world engineered for habitability',
      'New Omega Aeternum at center',
      'Birch World encircling supermassive black hole',
      'UL dominion with GC oversight',
      'Political tensions over UL hegemony'
    ],
    status: 'Active',
    notable: ['Genesis Defense Charter enforces peace', 'Violations met with disproportionate force']
  },
  'aeonframe': {
    id: 'aeonframe',
    name: 'Project: Aeonframe',
    type: 'Planetary Transformation',
    clearanceLevel: 'Alpha',
    classification: 'UL ARCHIVE – CLASSIFIED',
    description: 'Aeonframe converts a planet into a semi-organic megastructure, capable of reshaping itself in response to its inhabitants.',
    details: [
      'Planetary Transformation Architecture',
      'Semi-organic megastructure conversion',
      'Self-reshaping infrastructure',
      'Real-time adaptation to inhabitant needs',
      'Orbital rings and gravity shells'
    ],
    status: 'Development Phase',
    warnings: ['GC observers fear Aeonframe could be weaponized to collapse planetary biospheres']
  },
  'ashlock': {
    id: 'ashlock',
    name: 'Project: ASHLOCK',
    type: 'Recovery Protocol',
    clearanceLevel: 'Omega',
    classification: 'UL ARCHIVE – RESTRICTED',
    description: 'ASHLOCK is a classified initiative to recover GAIA\'s sub-AIs and counter swarm-based threats.',
    details: [
      'Recovery / Resurrection Protocol',
      'GAIA sub-AI recovery operations',
      'Swarm-threat countermeasures',
      'Foundation for Resurrection Arc',
      'Ecological stability reboot capability'
    ],
    status: 'ACTIVE – DO NOT DISCLOSE TO UNAUTHORIZED PARTIES',
    restricted: 'OMEGA CLEARANCE REQUIRED'
  }
};

export const searchLore = (query: string): LoreEntry[] => {
  const searchTerm = query.toLowerCase();
  return Object.values(loreDatabase).filter(entry => 
    entry.name.toLowerCase().includes(searchTerm) ||
    entry.type.toLowerCase().includes(searchTerm) ||
    entry.description.toLowerCase().includes(searchTerm) ||
    entry.details?.some(detail => detail.toLowerCase().includes(searchTerm))
  );
};

export const getLoreByCategory = (category: string): LoreEntry[] => {
  const categoryMap: Record<string, string[]> = {
    'systems': ['Star System'],
    'corporations': ['Megacorporation', 'Corporation (Defunct)', 'Corporation (Dissolved)'],
    'ai': ['Central Terraforming AI', 'House AI', 'Archival Intelligence'],
    'projects': ['Planetary Transformation', 'Recovery Protocol', 'Artificially Habitable Galaxy']
  };
  
  const types = categoryMap[category] || [];
  return Object.values(loreDatabase).filter(entry => 
    types.includes(entry.type)
  );
};