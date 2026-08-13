import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Code2,
  Plus,
  CheckCircle2,
  Circle,
  Filter,
  Award,
  Briefcase,
  Building,
  Eye,
  HelpCircle,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  Bookmark,
  RefreshCw,
  AlertTriangle,
  Rocket,
} from 'lucide-react';
import { dsaService, AddTopicPayload } from '../services/dsaService';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';
import { ProgressBar } from '../components/common/ProgressBar';
import { DsaProblem } from '../types';
import { DsaSummaryCards } from '../components/dsa/DsaSummaryCards';
import { DsaTopicProgressChart } from '../components/dsa/DsaTopicProgressChart';
import { DsaDifficultyChart } from '../components/dsa/DsaDifficultyChart';
import { DsaWeeklyProgressChart } from '../components/dsa/DsaWeeklyProgressChart';
import { DsaMonthlyProgressChart } from '../components/dsa/DsaMonthlyProgressChart';
import { DsaPlatformSync } from '../components/dsa/DsaPlatformSync';
import { DsaAIWeaknessAnalysis } from '../components/dsa/DsaAIWeaknessAnalysis';
import { DsaSevenDayRoadmap } from '../components/dsa/DsaSevenDayRoadmap';
import { DsaRevisionStats } from '../components/dsa/DsaRevisionStats';
import { DsaRevisionToday } from '../components/dsa/DsaRevisionToday';
import { DsaRevisionCalendar } from '../components/dsa/DsaRevisionCalendar';

export const DsaTrackerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeProblem, setActiveProblem] = useState<DsaProblem | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Queries
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    refetch: refetchAnalytics,
    isRefetching: isAnalyticsRefetching,
  } = useQuery({
    queryKey: ['dsaAnalytics'],
    queryFn: dsaService.getAnalytics,
  });

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dsaStats'],
    queryFn: dsaService.getStats,
  });

  const {
    data: recommendationData,
    isLoading: isRecLoading,
    isError: isRecError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ['dsaRecommendations', user?.targetRole, user?.targetCompany, selectedTopic, selectedDifficulty, selectedStatus],
    queryFn: () =>
      dsaService.getRecommendations({
        role: user?.targetRole,
        company: user?.targetCompany,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        status: selectedStatus,
      }),
  });

  const problems = recommendationData?.problems || [];
  const targetRole = recommendationData?.targetRole || user?.targetRole || '';
  const targetCompany = recommendationData?.targetCompany || user?.targetCompany || '';

  // Refresh handler
  const handleRefresh = () => {
    refetchAnalytics();
    refetchRecommendations();
    refetchStats();
    toast.success('DSA analytics and problems refreshed');
  };

  // Manual Add Topic Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddTopicPayload>({
    defaultValues: {
      difficulty: 'Medium',
    },
  });

  const solveMutation = useMutation({
    mutationFn: (problemId: string) => dsaService.solveProblem(problemId),
    onSuccess: (data, problemId) => {
      toast.success('Problem marked as solved!');
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevisionToday'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevisionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRevisionUpcoming'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAIAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (activeProblem && (activeProblem.id === problemId || activeProblem.slug === problemId)) {
        setActiveProblem({ ...activeProblem, status: 'Solved' });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update problem status');
    },
  });

  const toggleRevisionMutation = useMutation({
    mutationFn: ({ id, savedForRevision }: { id: string; savedForRevision: boolean }) =>
      dsaService.toggleRevision(id, savedForRevision),
    onSuccess: (data, variables) => {
      toast.success(variables.savedForRevision ? 'Saved for Revision' : 'Removed from Revision');
      queryClient.invalidateQueries({ queryKey: ['dsaRecommendations'] });
      if (activeProblem && (activeProblem.id === variables.id || activeProblem.slug === variables.id)) {
        setActiveProblem({ ...activeProblem, savedForRevision: variables.savedForRevision });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update revision status');
    },
  });

  const addTopicMutation = useMutation({
    mutationFn: dsaService.addTopic,
    onSuccess: () => {
      toast.success('Custom topic added successfully!');
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsAddModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add custom topic');
    },
  });

  const onAddSubmit = (data: AddTopicPayload) => {
    addTopicMutation.mutate(data);
  };

  const handleOpenProblem = (problem: DsaProblem) => {
    setActiveProblem(problem);
    setShowHint(false);
  };

  const handleCloseProblem = () => {
    setActiveProblem(null);
    setShowHint(false);
  };

  const completionPercent = analyticsData?.summary?.completionPercentage ?? stats?.completionPercentage ?? 0;

  if (isStatsLoading && isRecLoading && isAnalyticsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400 font-medium">Loading personalized DSA problems...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Aware Practice Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DSA Tracker</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your problem-solving progress and prepare smarter.
          </p>
          
          {/* Target Role & Company Metadata Badge Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Target Role: <strong className="text-gray-900 dark:text-white">{targetRole || 'Not Set'}</strong></span>
            </div>

            {targetCompany ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200">
                <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Target Company: <strong className="text-gray-900 dark:text-white">{targetCompany}</strong></span>
              </div>
            ) : (
              <span className="text-xs text-gray-500 italic">(Company optional)</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isAnalyticsRefetching}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isAnalyticsRefetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Topic
          </Button>
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              Edit Target Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Missing Role Banner Prompt */}
      {!targetRole && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Complete your profile with a target role to get personalized DSA recommendations.
            </p>
          </div>
          <Link to="/profile">
            <Button size="sm" variant="secondary" className="whitespace-nowrap">
              Go to Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Error State Banner */}
      {isAnalyticsError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-4 text-red-700 dark:text-red-300">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Unable to load DSA analytics.</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Please check network or server status and try again.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20" onClick={() => refetchAnalytics()}>
            Retry
          </Button>
        </div>
      )}

      {/* Progress Dashboard Summary Metric Cards */}
      <DsaSummaryCards analytics={analyticsData} isLoading={isAnalyticsLoading} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DsaTopicProgressChart topics={analyticsData?.topicProgress} isLoading={isAnalyticsLoading} />
        <DsaDifficultyChart difficultyProgress={analyticsData?.difficultyProgress} isLoading={isAnalyticsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DsaWeeklyProgressChart weeklyProgress={analyticsData?.weeklyProgress} isLoading={isAnalyticsLoading} />
        <DsaMonthlyProgressChart monthlyProgress={analyticsData?.monthlyProgress} isLoading={isAnalyticsLoading} />
      </div>

      {/* AI Qualitative Weakness Analysis Section */}
      <DsaAIWeaknessAnalysis />

      {/* Personalized 7-Day Roadmap Section */}
      <DsaSevenDayRoadmap />

      {/* Smart Spaced Repetition Revision Section */}
      <div className="space-y-6">
        <DsaRevisionStats />
        <DsaRevisionToday />
        <DsaRevisionCalendar />
      </div>

      {/* Coding Platforms Synchronization Section */}
      <DsaPlatformSync />

      {/* Empty State Banner when 0 total tracked */}
      {!isAnalyticsLoading && analyticsData && analyticsData.summary?.totalTracked === 0 && (
        <div className="p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start your DSA journey</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Track solved problems, build your streak, and get personalized recommendations.
          </p>
          <Button size="sm" variant="primary" onClick={() => {
            const el = document.getElementById('problems-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            Explore Problems
          </Button>
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
          <span>DSA Practice System Progress</span>
          <span>{completionPercent}% Completed</span>
        </div>
        <ProgressBar progress={completionPercent} color="emerald" />
      </div>

      {/* Toolbar Filters */}
      <div id="problems-section" className="glass-panel p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="unsolved">Unsolved / Pending</option>
            <option value="solved">Solved</option>
            <option value="in progress">In Progress</option>
            <option value="saved">Saved for Revision</option>
          </select>

          <Input
            placeholder="Filter Topic (e.g. Arrays)..."
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-48 py-1.5 text-xs"
          />
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Showing {problems.length} recommended problems
        </span>
      </div>

      {/* Recommended Problems List */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Recommended Problems</span>
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Ordered by Role & Company Relevance</span>
        </div>

        {isRecLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <Spinner size="md" />
            <p className="text-sm">Loading personalized DSA problems...</p>
          </div>
        ) : isRecError ? (
          <div className="p-12 text-center text-red-600 dark:text-red-400">
            <p className="text-sm font-semibold">Unable to load DSA recommendations. Please try again.</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Code2 className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-sm font-semibold">No more recommended problems for your current filters.</p>
            <p className="text-xs text-gray-500 mt-1">Try resetting filters to see all available DSA problems.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800/60">
            {problems.map((problem) => {
              const isSolved = problem.status === 'Solved';
              const isSaved = !!problem.savedForRevision;
              return (
                <div
                  key={problem.id}
                  className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer" onClick={() => handleOpenProblem(problem)}>
                        {problem.title}
                      </span>
                      <Badge variant={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                        {problem.topic}
                      </span>
                      {isSaved && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Bookmark className="w-3 h-3 mr-1 fill-amber-500" /> Saved for Revision
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {problem.description}
                    </p>

                    {/* Tags & Company relevance */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {problem.companies && problem.companies.slice(0, 3).map((comp) => (
                        <span key={comp} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                          {comp}
                        </span>
                      ))}
                      {problem.tags && problem.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                    <Button
                      size="sm"
                      variant={isSaved ? "secondary" : "outline"}
                      leftIcon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />}
                      onClick={() => toggleRevisionMutation.mutate({ id: problem.id, savedForRevision: !isSaved })}
                      isLoading={toggleRevisionMutation.isPending && toggleRevisionMutation.variables?.id === problem.id}
                      className={isSaved ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20' : ''}
                    >
                      {isSaved ? '✓ Saved for Revision' : 'Save for Revision'}
                    </Button>

                    {isSolved ? (
                      <span className="inline-flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Solved
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => solveMutation.mutate(problem.id)}
                        isLoading={solveMutation.isPending && solveMutation.variables === problem.id}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Mark Solved
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenProblem(problem)}
                    >
                      View Problem
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Problem View Modal */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full shadow-2xl space-y-6 my-8 bg-white dark:bg-[#0b0f19]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={activeProblem.difficulty === 'Easy' ? 'success' : activeProblem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                    {activeProblem.difficulty}
                  </Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {activeProblem.topic}
                  </span>
                  {activeProblem.savedForRevision && (
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold inline-flex items-center bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Bookmark className="w-3 h-3 mr-1 fill-amber-500" /> Saved for Revision
                    </span>
                  )}
                  {activeProblem.status === 'Solved' && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Solved
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeProblem.title}</h2>
              </div>
              <button
                onClick={handleCloseProblem}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Problem Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Problem Description</h3>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                {activeProblem.description}
              </p>
            </div>

            {/* Company & Role Relevance */}
            {activeProblem.companies && activeProblem.companies.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Frequently Asked At</h3>
                <div className="flex flex-wrap gap-2">
                  {activeProblem.companies.map((c) => (
                    <Badge key={c} variant="purple">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {activeProblem.examples && activeProblem.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Examples</h3>
                <div className="space-y-2">
                  {activeProblem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-800 font-mono text-xs space-y-1">
                      <p className="text-indigo-700 dark:text-indigo-300"><strong>Input:</strong> {ex.input}</p>
                      <p className="text-emerald-700 dark:text-emerald-300"><strong>Output:</strong> {ex.output}</p>
                      {ex.explanation && <p className="text-gray-600 dark:text-gray-400 font-sans"><strong>Explanation:</strong> {ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {activeProblem.constraints && activeProblem.constraints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Constraints</h3>
                <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1 font-mono">
                  {activeProblem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hints Section */}
            {activeProblem.hints && activeProblem.hints.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                {!showHint ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                    onClick={() => setShowHint(true)}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                  >
                    Get Hint
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                    <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5" /> Practice Hints
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {activeProblem.hints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button variant="ghost" onClick={handleCloseProblem}>
                Close
              </Button>

              <Button
                size="sm"
                variant={activeProblem.savedForRevision ? "secondary" : "outline"}
                leftIcon={<Bookmark className={`w-3.5 h-3.5 ${activeProblem.savedForRevision ? 'fill-amber-500 text-amber-500' : ''}`} />}
                onClick={() =>
                  toggleRevisionMutation.mutate({
                    id: activeProblem.id,
                    savedForRevision: !activeProblem.savedForRevision,
                  })
                }
                isLoading={toggleRevisionMutation.isPending && toggleRevisionMutation.variables?.id === activeProblem.id}
                className={activeProblem.savedForRevision ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20' : ''}
              >
                {activeProblem.savedForRevision ? '✓ Saved for Revision' : 'Save for Revision'}
              </Button>

              {activeProblem.status !== 'Solved' ? (
                <Button
                  variant="primary"
                  onClick={() => solveMutation.mutate(activeProblem.id)}
                  isLoading={solveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Mark as Solved
                </Button>
              ) : (
                <span className="inline-flex items-center text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Solved
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Custom Manual Topic */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full shadow-2xl bg-white dark:bg-[#0b0f19]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Custom DSA Topic</h3>
            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
              <Input
                label="Topic Title"
                placeholder="e.g. Reverse Linked List"
                error={errors.topic?.message}
                {...register('topic', { required: 'Topic title is required' })}
              />

              <Input
                label="Category"
                placeholder="e.g. Linked List / Arrays / Dynamic Programming"
                error={errors.category?.message}
                {...register('category', { required: 'Category is required' })}
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={addTopicMutation.isPending}>
                  Save Topic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
