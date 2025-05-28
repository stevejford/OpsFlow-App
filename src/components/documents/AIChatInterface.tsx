'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDocumentSettings } from '@/contexts/DocumentSettingsContext';
import { DocumentService } from '@/services/documentService';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  references?: DocumentReference[];
}

interface DocumentReference {
  id: string;
  name: string;
  type: string;
  excerpt: string;
  relevanceScore: number;
}

interface DocumentContext {
  id: string;
  name: string;
  type: string;
  content?: string;
}

const AIChatInterface: React.FC = () => {
  const { settings } = useDocumentSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentContext, setDocumentContext] = useState<DocumentContext[]>([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'not-helpful' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available documents on mount
  useEffect(() => {
    loadAvailableDocuments();
  }, []);

  // Initialize with welcome message if AI chat is enabled
  useEffect(() => {
    if (settings.enableAIChat && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: "Hello! I'm your AI assistant for document analysis. You can ask me questions about your documents, and I'll help you find relevant information. To get started, you can:\n\n• Ask questions about specific documents\n• Request summaries or key points\n• Search for information across multiple documents\n• Get help with document analysis\n\nWhat would you like to know?",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [settings.enableAIChat]);

  const loadAvailableDocuments = async () => {
    try {
      // Mock loading documents - in real app, this would fetch from API
      const mockDocs = [
        { id: '1', name: 'Employee Handbook.pdf', type: 'pdf' },
        { id: '2', name: 'Safety Guidelines.docx', type: 'docx' },
        { id: '3', name: 'Project Plan Q1.xlsx', type: 'xlsx' }
      ];
      setAvailableDocuments(mockDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await DocumentService.sendChatMessage(inputMessage, documentContext);
      
      const assistantMessage: Message = {
        id: response.id,
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        references: response.references
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const addDocumentToContext = (doc: any) => {
    if (!documentContext.find(d => d.id === doc.id)) {
      setDocumentContext(prev => [...prev, doc]);
      toast.success(`Added ${doc.name} to conversation context`);
    }
    setShowDocumentSelector(false);
  };

  const removeDocumentFromContext = (docId: string) => {
    setDocumentContext(prev => prev.filter(d => d.id !== docId));
    toast.success('Document removed from context');
  };

  const handleFeedback = (messageId: string, type: 'helpful' | 'not-helpful') => {
    setShowFeedback(messageId);
    setFeedbackType(type);
    
    // In a real app, you would send this feedback to your backend
    toast.success('Thank you for your feedback!');
    
    // Hide feedback after a delay
    setTimeout(() => {
      setShowFeedback(null);
      setFeedbackType(null);
    }, 2000);
  };

  const clearConversation = () => {
    setMessages([]);
    setDocumentContext([]);
    toast.success('Conversation cleared');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!settings.enableAIChat) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Chat is Disabled</h3>
          <p className="text-gray-600">
            AI chat functionality is currently disabled. You can enable it in the document settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Document Assistant</h1>
          <p className="text-gray-600">Ask questions about your documents and get intelligent responses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDocumentSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Documents
          </button>
          <button
            onClick={clearConversation}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <i className="fas fa-trash mr-2"></i>
            Clear
          </button>
        </div>
      </div>

      {/* Document Context */}
      {documentContext.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Document Context:</h3>
          <div className="flex flex-wrap gap-2">
            {documentContext.map((doc) => (
              <div key={doc.id} className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                <i className={`fas fa-file-${doc.type === 'pdf' ? 'pdf' : doc.type === 'docx' ? 'word' : 'alt'} mr-2`}></i>
                {doc.name}
                <button
                  onClick={() => removeDocumentFromContext(doc.id)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* References */}
                  {message.references && message.references.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Referenced Documents:</h4>
                      <div className="space-y-2">
                        {message.references.map((ref) => (
                          <div key={ref.id} className="bg-white p-2 rounded border text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{ref.name}</span>
                              <span className="text-gray-500">{Math.round(ref.relevanceScore * 100)}% relevant</span>
                            </div>
                            <p className="text-gray-600 mt-1">{ref.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    
                    {/* Feedback buttons for assistant messages */}
                    {message.type === 'assistant' && message.id !== 'welcome' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFeedback(message.id, 'helpful')}
                          className={`text-xs px-2 py-1 rounded ${
                            showFeedback === message.id && feedbackType === 'helpful'
                              ? 'bg-green-100 text-green-800'
                              : 'text-gray-500 hover:text-green-600'
                          }`}
                        >
                          <i className="fas fa-thumbs-up mr-1"></i>
                          Helpful
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'not-helpful')}
                          className={`text-xs px-2 py-1 rounded ${
                            showFeedback === message.id && feedbackType === 'not-helpful'
                              ? 'bg-red-100 text-red-800'
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <i className="fas fa-thumbs-down mr-1"></i>
                          Not helpful
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && settings.chatSuggestedQuestions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {settings.chatSuggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t pt-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </div>

      {/* Document Selector Modal */}
      {showDocumentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Documents to Context</h3>
                <button
                  onClick={() => setShowDocumentSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {availableDocuments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents available</p>
              ) : (
                <div className="space-y-2">
                  {availableDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => addDocumentToContext(doc)}
                      disabled={documentContext.some(d => d.id === doc.id)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        <i className={`fas fa-file-${doc.type === 'pdf' ? 'pdf' : doc.type === 'docx' ? 'word' : 'alt'} mr-3 text-gray-400`}></i>
                        <span className="font-medium">{doc.name}</span>
                        {documentContext.some(d => d.id === doc.id) && (
                          <i className="fas fa-check ml-auto text-green-600"></i>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatInterface;
