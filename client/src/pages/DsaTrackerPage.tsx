import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Code2, Plus, CheckCircle2, Circle, Filter, Search, Award } from 'lucide-react';
import { dsaService, AddTopicPayload } from '../services/dsaService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { StatCard } from '../components/common/StatCard';
import { Spinner } from '../components/common/Spinner';

export const DsaTrackerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dsaStats'],
    queryFn: dsaService.getStats,
  });

  const { data: topics = [], isLoading: isTopicsLoading } = useQuery({
    queryKey: ['dsaTopics', selectedCategory, selectedDifficulty],
    queryFn: () => dsaService.getTopics({ category: selectedCategory, difficulty: selectedDifficulty }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddTopicPayload>({
    defaultValues: {
      difficulty: 'Medium',
    },
  });

  const addTopicMutation = useMutation({
    mutationFn: dsaService.addTopic,
    onSuccess: () => {
      toast.success('DSA topic added successfully!');
      queryClient.invalidateQueries({ queryKey: ['dsaTopics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add DSA topic');
    },
  });

  const completeTopicMutation = useMutation({
    mutationFn: dsaService.completeTopic,
    onSuccess: () => {
      toast.success('Topic marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['dsaTopics'] });
      queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Action failed');
    },
  });

  const onAddSubmit = (data: AddTopicPayload) => {
    addTopicMutation.mutate(data);
  };

  if (isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
            <Code2 className="w-3.5 h-3.5" />
            <span>Problem Solving Metrics</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DSA Progress Tracker</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Log data structure & algorithm topics, filter by difficulty, and mark completed challenges.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
        >
          Add Topic
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Topics"
          value={stats?.total || 0}
          subtitle={`${stats?.completionPercentage || 0}% Completion`}
          icon={<Code2 className="w-6 h-6 text-indigo-400" />}
        />
        <StatCard
          title="Completed"
          value={stats?.completed || 0}
          subtitle="Topics Mastered"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          title="Pending"
          value={stats?.pending || 0}
          subtitle="Remaining Topics"
          icon={<Circle className="w-6 h-6 text-amber-400" />}
          iconBgColor="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          title="Difficulty Counts"
          value={`E:${stats?.easy || 0} M:${stats?.medium || 0} H:${stats?.hard || 0}`}
          subtitle="Easy / Medium / Hard"
          icon={<Award className="w-6 h-6 text-purple-400" />}
          iconBgColor="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#111827] text-gray-200 border border-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <Input
            placeholder="Filter Category..."
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48 py-1.5 text-xs"
          />
        </div>

        <span className="text-xs text-gray-400 font-medium">Showing {topics.length} topics</span>
      </div>

      {/* Topics Table */}
      <Card className="overflow-hidden p-0">
        {isTopicsLoading ? (
          <div className="p-8 text-center">
            <Spinner size="md" />
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Code2 className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold">No DSA topics found.</p>
            <p className="text-xs text-gray-500 mt-1">Click "Add Topic" above to start tracking your DSA journey.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Topic Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-200">
                {topics.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4">
                      {t.completed ? (
                        <span className="inline-flex items-center text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-400">
                          <Circle className="w-4 h-4 mr-1.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{t.topic}</td>
                    <td className="px-6 py-4 text-gray-400">{t.category}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          t.difficulty === 'Easy' ? 'success' : t.difficulty === 'Medium' ? 'warning' : 'danger'
                        }
                      >
                        {t.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!t.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeTopicMutation.mutate(t._id)}
                          isLoading={completeTopicMutation.isPending}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for Adding Topic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add DSA Topic</h3>
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full bg-[#111827] text-gray-100 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
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
