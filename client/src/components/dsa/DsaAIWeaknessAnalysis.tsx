import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { DsaAiAnalysisData } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import toast from 'react-hot-toast';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  Target,
  ListOrdered,
  BookOpen,
} from 'lucide-react';

export const DsaAIWeaknessAnalysis: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: aiData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<DsaAiAnalysisData>({
    queryKey: ['dsaAIAnalysis'],
    queryFn: dsaService.getAiAnalysis,
  });

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshing AI DSA weakness analysis...');
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-48 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-24 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-red-300">Unable to load AI weakness analysis.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/20" onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const isAiAvailable = aiData?.aiAvailable !== false;
  const weaknesses = aiData?.weaknesses || [];
  const strengths = aiData?.strengths || [];
  const difficultyAdvice = aiData?.difficultyAdvice;
  const practiceStrategy = aiData?.practiceStrategy || [];
  const interviewReadinessAdvice = aiData?.interviewReadinessAdvice || [];

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || 'medium').toLowerCase();
    if (sev === 'high') {
      return <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider">HIGH SEVERITY</span>;
    }
    if (sev === 'low') {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">LOW SEVERITY</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">MEDIUM SEVERITY</span>;
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-semibold mb-1 border border-purple-500/20">
            <Sparkles className="w-3 h-3" />
            <span>AI Qualitative Intelligence</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>AI DSA Weakness Analysis</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Qualitative practice insights tailored to your target role
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          isLoading={isRefetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
        >
          Refresh AI Analysis
        </Button>
      </div>

      {/* Overall Assessment Banner */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI DSA Assessment</span>
        </div>
        <p className="text-xs text-gray-200 leading-relaxed">
          {isAiAvailable
            ? aiData?.overallAssessment || 'Your DSA preparation shows steady activity. Focus on unmastered high-frequency interview topics.'
            : 'AI qualitative analysis is temporarily unavailable.'}
        </p>
      </div>

      {/* Weaknesses Section (Authoritative Ranks) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Target className="w-3.5 h-3.5 text-rose-400" />
          <span>Priority Practice Areas & Weaknesses</span>
        </h4>

        {weaknesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknesses.map((w, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2.5 transition-all hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{w.topic}</span>
                  {getSeverityBadge(w.severity)}
                </div>
                <p className="text-xs text-gray-300">{w.reason}</p>
                {w.evidence && w.evidence.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Evidence:</span>
                    <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-0.5">
                      {w.evidence.map((ev, eIdx) => (
                        <li key={eIdx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {w.recommendation && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    <strong className="text-white">Recommendation:</strong> {w.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-400">
            No critical weak topics identified. Continue practicing across all categories.
          </div>
        )}
      </div>

      {/* Strengths Section */}
      {strengths.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strengths.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white">{s.topic}</span>
                  <p className="text-[11px] text-gray-300">{s.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Advice */}
      {difficultyAdvice && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Difficulty Guidance</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-emerald-400 font-bold">Easy Tier:</span>
              <p className="text-gray-300">{difficultyAdvice.easy || 'Keep basic concepts warm.'}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-amber-400 font-bold">Medium Tier:</span>
              <p className="text-gray-300">{difficultyAdvice.medium || 'Primary focus for interview preparation.'}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-rose-400 font-bold">Hard Tier:</span>
              <p className="text-gray-300">{difficultyAdvice.hard || 'Introduce after Medium mastery.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Practice Strategy & Interview Readiness Advice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800 pt-4">
        {practiceStrategy.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recommended Practice Strategy</span>
            </h4>
            <div className="space-y-2">
              {practiceStrategy.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {interviewReadinessAdvice.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interview Readiness Advice</span>
            </h4>
            <div className="space-y-2">
              {interviewReadinessAdvice.map((adv, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <p>{adv}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
