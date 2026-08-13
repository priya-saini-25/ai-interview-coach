import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { DsaRevisionTodayData, DsaRevisionItem } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import toast from 'react-hot-toast';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Award,
  Sparkles,
  Flame,
  X,
  Star,
  Check,
} from 'lucide-react';

export const DsaRevisionToday: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeReviewProblem, setActiveReviewProblem] = useState<DsaRevisionItem | null>(null);
  const [difficultyRating, setDifficultyRating] = useState<number>(3);

  // Fetch today's due, overdue, and upcoming revisions
  const {
    data: revisionData,
    isLoading,
    isError,
    refetch,
  } = useQuery<DsaRevisionTodayData>({
    queryKey: ['dsaRevisionToday'],
    queryFn: dsaService.getTodayRevision,
  });

  // Review Problem Mutation
  const reviewMutation = useMutation({
    mutationFn: ({
      problemId,
      result,
      rating,
    }: {
      problemId: string;
      result: 'success' | 'failure' | 'skipped';
      rating?: number;
    }) => dsaService.reviewRevision(problemId, result, rating),
    onSuccess: (updatedData, variables) => {
      if (variables.result === 'success') {
        toast.success(`Great! Revision completed. Next review in ${updatedData.intervalDays || 1} day(s).`);
      } else if (variables.result === 'failure') {
        toast.error('Keep practicing this one. Scheduled for earlier review tomorrow.');
      } else {
        toast('Revision skipped.', { icon: '⏭️' });
      }

      queryClient.invalidateQueries({ queryKey: ['dsaRevisionToday'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevisionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevisionUpcoming'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAIAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRoadmap'] });

      setActiveReviewProblem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record revision review.');
    },
  });

  const handleOpenReviewModal = (problem: DsaRevisionItem) => {
    setActiveReviewProblem(problem);
    setDifficultyRating(problem.difficultyRating || 3);
  };

  const handleReviewOutcome = (result: 'success' | 'failure' | 'skipped') => {
    if (!activeReviewProblem) return;
    reviewMutation.mutate({
      problemId: activeReviewProblem.problemId,
      result,
      rating: difficultyRating,
    });
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 50) {
      return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase">High Priority</span>;
    }
    if (score >= 25) {
      return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase">Medium Priority</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">Normal Priority</span>;
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Easy') return <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">Easy</span>;
    if (diff === 'Hard') return <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 font-bold">Hard</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold">Medium</span>;
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-gray-800/40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-red-300">Unable to load today's revisions.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/20" onClick={() => refetch()}>
          Retry Revisions
        </Button>
      </Card>
    );
  }

  const overdue = revisionData?.overdue || [];
  const dueToday = revisionData?.dueToday || [];
  const upcoming = revisionData?.upcoming || [];
  const hasPendingRevisions = overdue.length > 0 || dueToday.length > 0;

  return (
    <Card className="p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span>Spaced Repetition Queue</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Review solved problems at scientifically calculated intervals (1, 3, 7, 14, 30 days)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold">
            {overdue.length + dueToday.length} Due Today
          </span>
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {overdue.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold">You have {overdue.length} overdue {overdue.length === 1 ? 'revision' : 'revisions'} requiring immediate practice.</span>
          </div>
        </div>
      )}

      {/* Empty State when Caught Up */}
      {!hasPendingRevisions && (
        <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xl">
            🎉
          </div>
          <h4 className="text-base font-bold text-white">You're all caught up!</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {upcoming.length > 0
              ? `Your next revision is scheduled for ${new Date(upcoming[0].dueDate).toLocaleDateString()}.`
              : 'Keep solving new problems to automatically populate your revision queue.'}
          </p>
        </div>
      )}

      {/* OVERDUE LIST */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue Revisions ({overdue.length})</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdue.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    {getPriorityBadge(item.priorityScore)}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{item.topic}</span>
                    <span>•</span>
                    {getDifficultyBadge(item.difficulty)}
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">{item.daysOverdue} day(s) overdue</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 text-[11px] text-gray-400">
                  <span>Level {item.revisionLevel} ({item.intervalDays}d) | Rev: {item.reviewCount}</span>
                  <Button size="sm" variant="primary" onClick={() => handleOpenReviewModal(item)}>
                    Review Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUE TODAY LIST */}
      {dueToday.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Due Today ({dueToday.length})</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueToday.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3 flex flex-col justify-between hover:border-gray-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    {getPriorityBadge(item.priorityScore)}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{item.topic}</span>
                    <span>•</span>
                    {getDifficultyBadge(item.difficulty)}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 text-[11px] text-gray-400">
                  <span>Level {item.revisionLevel} ({item.intervalDays}d) | Rev: {item.reviewCount}</span>
                  <Button size="sm" variant="primary" onClick={() => handleOpenReviewModal(item)}>
                    Review Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING LIST (Short Preview) */}
      {upcoming.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>Upcoming Revisions Preview ({upcoming.length})</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcoming.slice(0, 3).map((item) => (
              <div key={item._id} className="p-3 rounded-xl bg-gray-900/30 border border-gray-800/80 space-y-1">
                <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                <span className="text-[10px] text-gray-400 block">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {activeReviewProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Spaced Repetition Review</span>
                <h3 className="text-lg font-bold text-white">{activeReviewProblem.title}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  <span>{activeReviewProblem.topic}</span>
                  <span>•</span>
                  {getDifficultyBadge(activeReviewProblem.difficulty)}
                </div>
              </div>
              <button
                onClick={() => setActiveReviewProblem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Metadata */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs flex justify-between items-center text-gray-300">
              <span>Reviews: <strong className="text-white">{activeReviewProblem.reviewCount}</strong></span>
              <span>Passed: <strong className="text-emerald-400">{activeReviewProblem.successCount}</strong></span>
              <span>Failed: <strong className="text-rose-400">{activeReviewProblem.failureCount}</strong></span>
            </div>

            {/* Difficulty Rating Selector (1 to 5) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">How difficult was this revision? (1-5)</label>
              <div className="flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDifficultyRating(num)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      difficultyRating === num
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Outcome Question & Buttons */}
            <div className="space-y-3 border-t border-gray-800 pt-4">
              <span className="text-xs font-bold text-white block text-center">How did this problem go?</span>

              <div className="grid grid-cols-1 gap-2.5">
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white w-full justify-center"
                  isLoading={reviewMutation.isPending}
                  onClick={() => handleReviewOutcome('success')}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  I solved it
                </Button>

                <Button
                  variant="outline"
                  className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 w-full justify-center"
                  isLoading={reviewMutation.isPending}
                  onClick={() => handleReviewOutcome('failure')}
                  leftIcon={<XCircle className="w-4 h-4 text-rose-400" />}
                >
                  I struggled
                </Button>

                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white w-full justify-center"
                  isLoading={reviewMutation.isPending}
                  onClick={() => handleReviewOutcome('skipped')}
                  leftIcon={<SkipForward className="w-4 h-4 text-gray-400" />}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
