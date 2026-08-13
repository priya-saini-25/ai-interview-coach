import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Briefcase,
  Building,
  Award,
  BookOpen,
  User as UserIcon,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { mentorService } from '../services/mentorService';
import { readinessService } from '../services/readinessService';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { MentorMessage } from '../types';

/**
 * Basic Markdown renderer to safely render bold text, lists, and headings
 */
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed font-sans text-gray-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-indigo-300 mt-3 mb-1">
              {formatInline(trimmed.replace('### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-white mt-4 mb-1">
              {formatInline(trimmed.replace('## ', ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-lg font-extrabold text-white mt-4 mb-2">
              {formatInline(trimmed.replace('# ', ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{formatInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const contentText = trimmed.replace(/^\d+\.\s/, '');
          return (
            <li key={idx} className="ml-4 list-decimal text-gray-300">
              {formatInline(contentText)}
            </li>
          );
        }

        if (trimmed.startsWith('```')) {
          return null;
        }

        return <p key={idx}>{formatInline(line)}</p>;
      })}
    </div>
  );
};

const formatInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-indigo-300 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export const MentorPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Candidate readiness score & dashboard summary for header pills
  const { data: readiness } = useQuery({
    queryKey: ['readinessScore'],
    queryFn: readinessService.getScore,
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  // Fetch conversation history
  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['mentorHistory'],
    queryFn: mentorService.getHistory,
  });

  const [messages, setMessages] = useState<MentorMessage[]>([]);

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(history);
    }
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (msg: string) => mentorService.sendMessage(msg),
    onSuccess: (data) => {
      setMessages(data.messages);
      queryClient.invalidateQueries({ queryKey: ['mentorHistory'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Unable to reach the AI Mentor right now. Please try again.');
      // Remove temporary user message on error
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: mentorService.clearHistory,
    onSuccess: () => {
      toast.success('Conversation history cleared!');
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ['mentorHistory'] });
    },
    onError: () => {
      toast.error('Failed to clear conversation history');
    },
  });

  const handleSend = (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || sendMutation.isPending) return;

    // Optimistically add user message
    const tempUserMsg: MentorMessage = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');

    sendMutation.mutate(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const targetRole = user?.targetRole || summary?.user?.name || '';
  const targetCompany = user?.targetCompany || '';

  // Quick suggested prompts
  const suggestedPrompts = [
    'How ready am I for my target role?',
    'What should I focus on this week?',
    'What DSA topics should I practice next?',
    'How can I improve my ATS score?',
    'Prepare me for my next mock interview.',
    ...(targetCompany ? [`How should I prepare for ${targetCompany}?`] : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Placement Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>AI Placement Mentor</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Your personal engineering mentor tailored to your profile, DSA progress, ATS score, and mock interviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {readiness?.overallScore !== undefined && (
            <Badge variant="purple">
              Readiness: {readiness.overallScore}/100
            </Badge>
          )}
          {summary?.resume.score !== undefined && (
            <Badge variant="info">
              ATS: {summary.resume.score}/100
            </Badge>
          )}
          {summary?.dsa?.completed !== undefined && (
            <Badge variant="success">
              DSA: {summary.dsa.completed}/{summary.dsa.total} Solved
            </Badge>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearHistoryMutation.mutate()}
              isLoading={clearHistoryMutation.isPending}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
              className="text-red-400 hover:bg-red-500/10 text-xs"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 p-0 overflow-hidden flex flex-col border border-gray-800 bg-[#0b0f19]/90 shadow-sm">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-gray-400">
              <Spinner size="lg" />
              <p className="text-xs font-semibold">Connecting to your AI Mentor...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 max-w-lg mx-auto py-8">
              <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/10">
                <Bot className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-white">Hi! I’m your AI Placement Mentor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                I have full context of your resume analysis, DSA progress, mock interview scores, and targeted placement goals. Ask me anything to jumpstart your preparation!
              </p>

              {/* Quick Prompt Chips */}
              <div className="w-full pt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Suggested Questions</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(promptText)}
                      className="text-xs px-3.5 py-2 rounded-xl bg-gray-900/80 hover:bg-indigo-950/80 text-gray-300 hover:text-indigo-200 border border-gray-800 hover:border-indigo-500/30 transition text-left"
                    >
                      💡 {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                      }`}
                    >
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-2xl p-4 rounded-2xl ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                          : 'glass-panel bg-gray-900/90 border border-gray-800 text-gray-100 rounded-tl-none shadow-md'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <SimpleMarkdown content={msg.content} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pending Thinking Bubble */}
              {sendMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-gray-800 bg-gray-900/90 flex items-center space-x-3">
                    <Spinner size="sm" />
                    <span className="text-xs font-semibold text-gray-400">AI Mentor is analyzing your placement context...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80 backdrop-blur-md">
          {messages.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">Quick Prompts:</span>
              {suggestedPrompts.slice(0, 3).map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(promptText)}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800 transition"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Ask your placement mentor anything about DSA, resume, interviews, or companies..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sendMutation.isPending}
              className="flex-1 bg-[#111827] text-white border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition placeholder-gray-500 disabled:opacity-50"
            />
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || sendMutation.isPending}
              isLoading={sendMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 shadow-lg shadow-indigo-600/20"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
