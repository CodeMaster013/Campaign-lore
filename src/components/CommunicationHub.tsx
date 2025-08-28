import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Lock, Radio, Users, Globe, Plus, Filter } from 'lucide-react';
import { supabase, Communication, User } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CommunicationHubProps {
  userClearance: 'Beta' | 'Alpha' | 'Omega';
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({ userClearance }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Communication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'encrypted' | 'transmission'>('text');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', name: 'General', icon: Globe, description: 'Public communications' },
    { id: 'operations', name: 'Operations', icon: Radio, description: 'Mission communications' },
    { id: 'encrypted', name: 'Encrypted', icon: Lock, description: 'Secure channels' },
    { id: 'direct', name: 'Direct Messages', icon: Users, description: 'Private messages' }
  ];

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('communications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'communications' },
        (payload) => {
          const newMessage = payload.new as Communication;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedChannel, userClearance]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('communications')
        .select(`
          *,
          sender:sender_id(id, display_name, username, clearance_level),
          recipient:recipient_id(id, display_name, username, clearance_level)
        `)
        .order('created_at', { ascending: true });

      if (selectedChannel === 'direct') {
        query = query.not('recipient_id', 'is', null);
      } else if (selectedChannel === 'encrypted') {
        query = query.eq('message_type', 'encrypted');
      } else {
        query = query.eq('channel', selectedChannel).is('recipient_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .neq('id', user?.id);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const messageData = {
        sender_id: user.id,
        recipient_id: selectedChannel === 'direct' && selectedRecipient ? selectedRecipient : null,
        channel: selectedChannel === 'direct' ? 'direct' : selectedChannel,
        message: newMessage,
        message_type: messageType,
        clearance_required: userClearance
      };

      const { error } = await supabase
        .from('communications')
        .insert([messageData]);

      if (error) throw error;
      
      setNewMessage('');
      setMessageType('text');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasAccess = (requiredClearance: 'Beta' | 'Alpha' | 'Omega'): boolean => {
    const clearanceLevels = { 'Beta': 1, 'Alpha': 2, 'Omega': 3 };
    return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'encrypted': return <Lock className="w-4 h-4 text-red-400" />;
      case 'transmission': return <Radio className="w-4 h-4 text-blue-400" />;
      case 'system': return <MessageSquare className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getClearanceColor = (level: string) => {
    switch (level) {
      case 'Omega': return 'text-red-400';
      case 'Alpha': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const MessageBubble: React.FC<{ message: Communication }> = ({ message }) => {
    const isOwnMessage = message.sender_id === user?.id;
    const canAccess = hasAccess(message.clearance_required);

    if (!canAccess) {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>[ENCRYPTED MESSAGE - CLEARANCE REQUIRED]</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md ${
          isOwnMessage 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        } rounded-lg p-3`}>
          <div className="flex items-center gap-2 mb-1">
            {!isOwnMessage && message.sender && (
              <span className="font-medium text-sm">
                {message.sender.display_name}
              </span>
            )}
            {message.sender && (
              <span className={`text-xs ${getClearanceColor(message.sender.clearance_level)}`}>
                {message.sender.clearance_level}
              </span>
            )}
            {getMessageTypeIcon(message.message_type)}
          </div>
          
          <div className="text-sm mb-1">
            {message.message_type === 'encrypted' && !isOwnMessage ? (
              <span className="italic">[DECRYPTED] {message.message}</span>
            ) : (
              message.message
            )}
          </div>
          
          <div className="text-xs opacity-75">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Communication Hub</h2>
          <p className="text-gray-400">Secure communications and message relay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Channel List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 lg:block">
          <h3 className="text-lg font-semibold text-white mb-4">Channels</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:grid-cols-none">
            {channels.map(channel => {
              const Icon = channel.icon;
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="text-xs opacity-75 hidden lg:block">{channel.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-lg flex flex-col h-80 sm:h-96">
          {/* Channel Header */}
          <div className="p-3 sm:p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {channels.find(c => c.id === selectedChannel)?.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {channels.find(c => c.id === selectedChannel)?.description}
                </p>
              </div>
              {selectedChannel === 'direct' && (
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="px-2 sm:px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs sm:text-sm"
                >
                  <option value="">Select recipient...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs sm:text-sm w-full sm:w-auto"
              >
                <option value="text">Standard</option>
                <option value="encrypted">Encrypted</option>
                <option value="transmission">Transmission</option>
              </select>
              <span className={`text-xs ${getClearanceColor(userClearance)} whitespace-nowrap`}>
                Clearance: {userClearance}
              </span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={
                  selectedChannel === 'direct' && !selectedRecipient
                    ? 'Select a recipient first...'
                    : 'Type your message...'
                }
                disabled={selectedChannel === 'direct' && !selectedRecipient}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || (selectedChannel === 'direct' && !selectedRecipient)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};