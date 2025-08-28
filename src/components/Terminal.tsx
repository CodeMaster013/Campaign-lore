import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Search, Lock, AlertTriangle } from 'lucide-react';
import { loreDatabase, searchLore, LoreEntry } from '../data/loreDatabase';

interface TerminalProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ userClearance }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      type: 'system',
      content: `THESEUS TERMINAL v2.7.3 - INITIALIZED
Welcome, Operative. Clearance Level: ${userClearance}
Type 'help' for available commands or 'query [term]' to search the database.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };

  const hasAccess = (requiredClearance: 'Beta' | 'Alpha' | 'Omega'): boolean => {
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  };

  const formatLoreEntry = (entry: LoreEntry): string => {
    if (!hasAccess(entry.clearanceLevel)) {
      return `ACCESS DENIED - CLEARANCE LEVEL ${entry.clearanceLevel} REQUIRED
Classification: [REDACTED]
Description: [CLASSIFIED INFORMATION]`;
    }

    let output = `[${entry.classification}]

Designation: ${entry.name}
Type: ${entry.type}
${entry.status ? `Status: ${entry.status}` : ''}
${entry.location ? `Location: ${entry.location}` : ''}

Summary:
${entry.description}`;

    if (entry.details && entry.details.length > 0) {
      output += `\n\nDetails:`;
      entry.details.forEach(detail => {
        output += `\n• ${detail}`;
      });
    }

    if (entry.notable && entry.notable.length > 0) {
      output += `\n\nNotable:`;
      entry.notable.forEach(note => {
        output += `\n⚠ ${note}`;
      });
    }

    if (entry.warnings && entry.warnings.length > 0) {
      output += `\n\nWarnings:`;
      entry.warnings.forEach(warning => {
        output += `\n⚠ ${warning}`;
      });
    }

    if (entry.restricted) {
      output += `\n\n[${entry.restricted}]`;
    }

    return output;
  };

  const processCommand = (command: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newHistory = [...history, { type: 'input' as const, content: `> ${command}`, timestamp }];
    
    const cmd = command.toLowerCase().trim();
    const args = cmd.split(' ').slice(1);

    let response = '';
    let responseType: 'output' | 'error' | 'system' = 'output';

    if (cmd === 'help') {
      response = `Available Commands:
• query [term] - Search the lore database
• list [category] - List entries by category (systems, corporations, ai, projects)
• access [id] - Access specific entry by ID
• clearance - Display current clearance level
• clear - Clear terminal history
• override [code] - Attempt security override (experimental)

Categories: systems, corporations, ai, projects`;
    } else if (cmd === 'clearance') {
      response = `Current Clearance Level: ${userClearance}
Access Permissions: ${userClearance === 'Omega' ? 'FULL ACCESS' : userClearance === 'Alpha' ? 'RESTRICTED ACCESS' : 'LIMITED ACCESS'}`;
    } else if (cmd === 'clear') {
      setHistory([{
        type: 'system',
        content: `THESEUS TERMINAL v2.7.3 - CLEARED
Welcome back, Operative. Clearance Level: ${userClearance}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      return;
    } else if (cmd.startsWith('query ')) {
      const searchTerm = args.join(' ');
      if (!searchTerm) {
        response = 'Error: Query requires search term. Usage: query [term]';
        responseType = 'error';
      } else {
        const results = searchLore(searchTerm);
        if (results.length === 0) {
          response = `No entries found matching "${searchTerm}". Try a different search term.`;
          responseType = 'error';
        } else if (results.length === 1) {
          response = formatLoreEntry(results[0]);
        } else {
          response = `Multiple entries found for "${searchTerm}":\n\n` + 
            results.map(entry => `• ${entry.name} (${entry.type})`).join('\n') +
            '\n\nUse "access [id]" for specific entry details.';
        }
      }
    } else if (cmd.startsWith('access ')) {
      const entryId = args.join(' ');
      const entry = loreDatabase[entryId];
      if (!entry) {
        response = `Entry "${entryId}" not found in database. Use "query" to search for entries.`;
        responseType = 'error';
      } else {
        response = formatLoreEntry(entry);
      }
    } else if (cmd.startsWith('list ')) {
      const category = args[0];
      const validCategories = ['systems', 'corporations', 'ai', 'projects'];
      if (!validCategories.includes(category)) {
        response = `Invalid category. Available categories: ${validCategories.join(', ')}`;
        responseType = 'error';
      } else {
        const entries = Object.values(loreDatabase).filter(entry => {
          const categoryMap: Record<string, string[]> = {
            'systems': ['Star System'],
            'corporations': ['Megacorporation', 'Corporation (Defunct)', 'Corporation (Dissolved)'],
            'ai': ['Central Terraforming AI', 'House AI', 'Archival Intelligence'],
            'projects': ['Planetary Transformation', 'Recovery Protocol', 'Artificially Habitable Galaxy']
          };
          return categoryMap[category]?.includes(entry.type);
        });
        
        if (entries.length === 0) {
          response = `No entries found in category "${category}".`;
        } else {
          response = `${category.toUpperCase()} ENTRIES:\n\n` + 
            entries.map(entry => {
              const accessIcon = hasAccess(entry.clearanceLevel) ? '✓' : '🔒';
              return `${accessIcon} ${entry.name} (${entry.type}) - Clearance: ${entry.clearanceLevel}`;
            }).join('\n');
        }
      }
    } else if (cmd.startsWith('override ')) {
      const code = args.join(' ');
      if (code === 'ashlock-prime' && userClearance !== 'Omega') {
        response = `SECURITY OVERRIDE ACCEPTED
Temporary Omega clearance granted for this session.
WARNING: This action has been logged.`;
        responseType = 'system';
        // Note: In a real implementation, you'd update the clearance state
      } else {
        response = `ACCESS DENIED
Invalid override code or insufficient base clearance.
Attempt logged to security division.`;
        responseType = 'error';
      }
    } else if (cmd === '') {
      return; // Don't add empty commands to history
    } else {
      response = `Command not recognized: "${command}"
Type 'help' for available commands.`;
      responseType = 'error';
    }

    setHistory([...newHistory, { type: responseType, content: response, timestamp }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      processCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-sm h-full flex flex-col">
      <div className="bg-gray-800 px-3 sm:px-4 py-2 border-b border-gray-700 flex items-center gap-2">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-green-300">THESEUS TERMINAL</span>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <span className="text-xs text-gray-400 hidden sm:inline">Clearance: {userClearance}</span>
          <span className="text-xs text-gray-400 sm:hidden">{userClearance}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-300 hidden sm:inline">ONLINE</span>
            <span className="text-xs text-green-300 sm:hidden">ON</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-2"
      >
        {history.map((line, index) => (
          <div key={index} className="flex flex-col">
            <div className={`${
              line.type === 'input' ? 'text-blue-400' :
              line.type === 'error' ? 'text-red-400' :
              line.type === 'system' ? 'text-yellow-400' :
              'text-green-300'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm break-words">{line.content}</pre>
            </div>
            {line.timestamp && (
              <div className="text-xs text-gray-500 mt-1">
                [{line.timestamp}]
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">THESEUS:</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-xs sm:text-sm"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  );
};