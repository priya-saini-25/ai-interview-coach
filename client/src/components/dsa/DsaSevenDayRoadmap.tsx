import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { DsaRoadmapData, DsaRoadmapProblemItem } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Clock,
  Target,
  AlertTriangle,
  Flame,
  CheckCircle2,
  BookOpen,
  X,
} from 'lucide-react';

export const DsaSevenDayRoadmap: React.FC = () => {
  const queryClient = useQueryClient();
  const [loadingProblemId, setLoadingProblemId] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Fetch current active roadmap
  const {
    data: roadmap,
    isLoading,
    isError,
    refetch,
  } = useQuery<DsaRoadmapData>({
    queryKey: ['dsaRoadmap'],
    queryFn: dsaService.getRoadmap,
  });

  // Generate Roadmap Mutation
  const generateMutation = useMutation({
    mutationFn: (force: boolean) => dsaService.generateRoadmap(force),
    onSuccess: () => {
      toast.success('7-Day DSA Roadmap generated!');
      queryClient.invalidateQueries({ queryKey: ['dsaRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevision'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAIAnalysis'] });
      setShowRegenerateConfirm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate roadmap.');
    },
  });

  // Update Roadmap Problem Mutation
  const updateProblemMutation = useMutation({
    mutationFn: ({ problemId, completed }: { problemId: string; completed: boolean }) =>
      dsaService.updateRoadmapProblem(problemId, completed),
    onSuccess: (data, variables) => {
      toast.success(variables.completed ? 'Problem marked as completed!' : 'Problem marked incomplete.');
      queryClient.invalidateQueries({ queryKey: ['dsaRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevision'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAIAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRecommendations'] });
      setLoadingProblemId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update problem.');
      setLoadingProblemId(null);
    },
  });

  const handleToggleProblem = (problem: DsaRoadmapProblemItem) => {
    setLoadingProblemId(problem.problemId);
    updateProblemMutation.mutate({
      problemId: problem.problemId,
      completed: !problem.completed,
    });
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
        <div className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-800/40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-red-300">Unable to load your 7-day roadmap.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/20" onClick={() => refetch()}>
          Try Again
        </Button>
      </Card>
    );
  }

  const days = roadmap?.days || [];
  const totalProblems = roadmap?.totalProblems || 0;
  const completedProblems = roadmap?.completedProblems || 0;
  const completionPercentage = roadmap?.completionPercentage || 0;
  const isRoadmapActive = roadmap && roadmap.status === 'active';

  return (
    <Card className="p-6 space-y-6">
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold mb-1 border border-indigo-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Structured Practice Path</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span>Your 7-Day DSA Roadmap</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Personalized from your weak topics, solved history, and target role
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isRoadmapActive && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              Roadmap Active
            </span>
          )}

          {!roadmap ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => generateMutation.mutate(false)}
              isLoading={generateMutation.isPending}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate Roadmap
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRegenerateConfirm(true)}
              isLoading={generateMutation.isPending}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />}
            >
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar & Summary Stats */}
      {roadmap && (
        <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Overall Roadmap Progress: {completedProblems} / {totalProblems} Completed</span>
            </div>
            <span className="font-bold text-indigo-400">{completionPercentage}%</span>
          </div>
          <ProgressBar progress={completionPercentage} color="emerald" />
        </div>
      )}

      {/* Difficulty Progression Visual Header */}
      <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">7-Day Difficulty Progression</span>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">D1: Fund.</div>
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">D2: Fund.</div>
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">D3: Med.</div>
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">D4: Med.</div>
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">D5: Med+</div>
          <div className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">D6: Mixed</div>
          <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">D7: Rev.</div>
        </div>
      </div>

      {/* Empty State Banner */}
      {!roadmap && (
        <div className="p-8 rounded-2xl bg-gray-900/40 border border-gray-800 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-gray-600 mx-auto" />
          <h4 className="text-base font-bold text-white">Your personalized 7-day roadmap isn't generated yet.</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Build a structured 7-day plan optimized for your weak topics and target role.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => generateMutation.mutate(false)}
            isLoading={generateMutation.isPending}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate My Roadmap
          </Button>
        </div>
      )}

      {/* 7 Days Cards Grid */}
      {days.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((day) => {
            const dayDoneCount = day.problems.filter((p) => p.completed).length;
            const dayTotalCount = day.problems.length;
            const isDayCompleted = dayTotalCount > 0 && dayDoneCount === dayTotalCount;

            return (
              <div
                key={day.dayNumber}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isDayCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Day Card Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white">Day {day.dayNumber}</span>
                      <span className="text-[10px] text-gray-400 block">
                        {day.date ? new Date(day.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{day.estimatedMinutes} min</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {dayDoneCount}/{dayTotalCount} Solved
                    </span>
                  </div>
                </div>

                {/* Focus Topics */}
                {day.focusTopics && day.focusTopics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold">Focus:</span>
                    {day.focusTopics.map((top, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded bg-gray-800 text-gray-200 text-[10px] font-medium">
                        {top}
                      </span>
                    ))}
                  </div>
                )}

                {/* Learning Goals */}
                {day.learningGoals && day.learningGoals.length > 0 && (
                  <div className="text-[11px] text-gray-300 space-y-0.5">
                    <strong className="text-[10px] text-gray-400 uppercase">Goal:</strong> {day.learningGoals.join('; ')}
                  </div>
                )}

                {/* Problems List with Interactive Checkbox */}
                <div className="space-y-2 pt-1 border-t border-gray-800/60">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Assigned Problems:</span>
                  <div className="space-y-1.5">
                    {day.problems.map((prob) => {
                      const isUpdating = loadingProblemId === prob.problemId;
                      return (
                        <div
                          key={prob.problemId}
                          onClick={() => !isUpdating && handleToggleProblem(prob)}
                          className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            prob.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-200'
                              : 'bg-gray-800/40 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate pr-2">
                            {isUpdating ? (
                              <Spinner size="sm" />
                            ) : prob.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-500 shrink-0 hover:text-white" />
                            )}
                            <span className={`truncate font-medium ${prob.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                              {prob.title}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] text-gray-400">{prob.topic}</span>
                            {getDifficultyBadge(prob.difficulty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revision Tasks */}
                {day.revisionTasks && day.revisionTasks.length > 0 && (
                  <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg space-y-0.5">
                    <strong className="text-amber-400 font-bold">Revision Task:</strong> {day.revisionTasks.join(' ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Regenerates */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-white">Generate a new roadmap?</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your current roadmap will be replaced with fresh recommendations based on your updated progress.
            </p>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-800">
              <Button variant="ghost" size="sm" onClick={() => setShowRegenerateConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={generateMutation.isPending}
                onClick={() => generateMutation.mutate(true)}
              >
                Regenerate Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
