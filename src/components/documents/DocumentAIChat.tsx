'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  relatedDocuments?: Array<{
    id: string;
    name: string;
    excerpt?: string;
  }>;
}

interface DocumentAIChatProps {
  selectedDocuments: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  onViewDocument?: (documentId: string) => void;
  className?: string;
}

export default function DocumentAIChat({
  selectedDocuments,
  onViewDocument,
  className
}: DocumentAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to Document AI Chat. I can help you find information in your documents and answer questions about them.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Example response - in a real app, this would come from an API call
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue, selectedDocuments),
        timestamp: new Date(),
        relatedDocuments: selectedDocuments.length > 0 
          ? [
              {
                id: selectedDocuments[0].id,
                name: selectedDocuments[0].name,
                excerpt: 'This document contains relevant information about your query...'
              }
            ]
          : undefined
      };
      
      // Replace the loading message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? aiResponse : msg
      ));
    } catch (error) {
      console.error('Error processing AI request:', error);
      
      // Replace loading message with error message
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? {
              ...msg,
              isLoading: false,
              content: 'Sorry, there was an error processing your request. Please try again.'
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple mock function to generate responses
  const generateAIResponse = (query: string, documents: Array<{id: string, name: string}>) => {
    if (documents.length === 0) {
      return "I don't see any documents selected. Please select one or more documents for me to analyze, and I'll be able to answer questions about them.";
    }
    
    if (query.toLowerCase().includes('summary') || query.toLowerCase().includes('summarize')) {
      return `Based on the ${documents.length} document(s) you've selected, here's a summary of the key points:\n\n1. The documents discuss project timelines and deliverables.\n2. There are references to budget allocations for Q3 and Q4.\n3. Several action items were assigned to team members with deadlines.\n\nWould you like me to elaborate on any specific aspect?`;
    }
    
    if (query.toLowerCase().includes('find') || query.toLowerCase().includes('search')) {
      return `I've searched through the selected documents and found several relevant sections:\n\n- In "${documents[0].name}", there's a discussion about the topic on pages 3-5.\n- The key information you're looking for appears in the "Analysis" section.\n- There are related references in the appendix as well.\n\nWould you like me to extract the specific text?`;
    }
    
    if (query.toLowerCase().includes('compare') || query.toLowerCase().includes('difference')) {
      return `Comparing the selected documents, I notice the following differences:\n\n- Document "${documents[0].name}" focuses on technical specifications, while the others are more business-oriented.\n- The timelines mentioned vary by approximately 2-3 weeks.\n- Budget projections differ by about 15% between the documents.\n\nThe most significant difference appears to be in the approach to implementation.`;
    }
    
    // Default response
    return `I've analyzed the ${documents.length} document(s) you selected. Based on your question about "${query}", I found that the main points are:\n\n1. The documents contain information relevant to your query.\n2. There are specific sections that address your question directly.\n3. The most recent updates on this topic were made last month.\n\nIs there anything specific you'd like me to elaborate on?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering for line breaks and lists
    return content.split('\n').map((line, i) => {
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-5">{line}</li>;
      }
      if (line.match(/^-/)) {
        return <li key={i} className="ml-5 list-disc">{line.substring(1)}</li>;
      }
      return <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>;
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Document AI Chat</h2>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">
            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
          </span>
          
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-3/4 rounded-lg p-3",
                message.role === 'user' 
                  ? "bg-blue-600 text-white" 
                  : message.role === 'system'
                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                    : "bg-white text-gray-800 border border-gray-200"
              )}
            >
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div>
                  <div className="text-sm">
                    {renderMessageContent(message.content)}
                  </div>
                  
                  {message.relatedDocuments && message.relatedDocuments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Related documents:</p>
                      <div className="space-y-2">
                        {message.relatedDocuments.map((doc) => (
                          <div key={doc.id} className="bg-gray-50 rounded p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{doc.name}</span>
                              {onViewDocument && (
                                <button
                                  onClick={() => onViewDocument(doc.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  View
                                </button>
                              )}
                            </div>
                            {doc.excerpt && (
                              <p className="mt-1 text-gray-600 line-clamp-2">{doc.excerpt}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[40px]"
              placeholder="Ask about your documents..."
              rows={1}
              disabled={isProcessing}
            />
            {selectedDocuments.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                <p className="text-sm text-gray-500">
                  Please select documents to analyze
                </p>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing || selectedDocuments.length === 0}
            className={cn(
              "p-2 rounded-lg",
              (!inputValue.trim() || isProcessing || selectedDocuments.length === 0)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500">
          <p>
            Tip: You can ask questions like "summarize these documents" or "find information about..."
          </p>
        </div>
      </div>
    </div>
  );
}
