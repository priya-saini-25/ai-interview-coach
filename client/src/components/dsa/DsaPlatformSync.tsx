import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import toast from 'react-hot-toast';
import {
  Globe,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code,
  Trophy,
  Star,
  UserCheck,
  X,
} from 'lucide-react';

export const DsaPlatformSync: React.FC = () => {
  const queryClient = useQueryClient();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [handlesForm, setHandlesForm] = useState({
    leetcode: '',
    codeforces: '',
    codechef: '',
    hackerrank: '',
  });

  // Query platforms profile
  const {
    data: platformData,
    isLoading: isPlatformsLoading,
    isError: isPlatformsError,
    refetch: refetchPlatforms,
  } = useQuery({
    queryKey: ['dsaPlatforms'],
    queryFn: dsaService.getPlatforms,
  });

  const handles = platformData?.handles || {};
  const stats = platformData?.stats || {};
  const lastSyncedAt = platformData?.lastSyncedAt;
  const lastSyncStatus = platformData?.lastSyncStatus;
  const lastSyncError = platformData?.lastSyncError;

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: dsaService.syncPlatforms,
    onSuccess: (res) => {
      if (res?.profile?.lastSyncStatus === 'Partial Failure') {
        toast.error('Sync completed with some platform updates unavailable.');
      } else {
        toast.success('Platform statistics synchronized successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['dsaPlatforms'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.message || 'Platforms were synced recently. Please wait before syncing again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to sync platform statistics.');
      }
    },
  });

  // Connect Handles Mutation
  const connectMutation = useMutation({
    mutationFn: dsaService.connectPlatforms,
    onSuccess: () => {
      toast.success('Platform handles updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['dsaPlatforms'] });
      queryClient.invalidateQueries({ queryKey: ['dsaAnalytics'] });
      setIsConnectModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update platform handles.');
    },
  });

  const handleOpenConnectModal = () => {
    setHandlesForm({
      leetcode: handles.leetcode || '',
      codeforces: handles.codeforces || '',
      codechef: handles.codechef || '',
      hackerrank: handles.hackerrank || '',
    });
    setIsConnectModalOpen(true);
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    connectMutation.mutate(handlesForm);
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.max(0, Math.floor((now.getTime() - date.getTime()) / (1000 * 60)));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day(s) ago`;
  };

  if (isPlatformsLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-800/40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (isPlatformsError) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-red-300">Unable to load platform statistics.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/20" onClick={() => refetchPlatforms()}>
          Retry Platforms
        </Button>
      </Card>
    );
  }

  const platformCards = [
    {
      key: 'leetcode',
      name: 'LeetCode',
      handle: handles.leetcode,
      connected: Boolean(handles.leetcode),
      solved: stats.leetcode?.totalSolved,
      easy: stats.leetcode?.easy,
      medium: stats.leetcode?.medium,
      hard: stats.leetcode?.hard,
      color: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    },
    {
      key: 'codeforces',
      name: 'Codeforces',
      handle: handles.codeforces,
      connected: Boolean(handles.codeforces),
      rating: stats.codeforces?.rating,
      rank: stats.codeforces?.rank,
      solved: stats.codeforces?.totalSolved,
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    },
    {
      key: 'codechef',
      name: 'CodeChef',
      handle: handles.codechef,
      connected: Boolean(handles.codechef),
      rating: stats.codechef?.rating,
      stars: stats.codechef?.stars,
      solved: stats.codechef?.totalSolved,
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    },
    {
      key: 'hackerrank',
      name: 'HackerRank',
      handle: handles.hackerrank,
      connected: Boolean(handles.hackerrank),
      badgeStars: stats.hackerrank?.badgeStars,
      solved: stats.hackerrank?.totalSolved,
      color: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    },
  ];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Coding Platform Synchronization</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Sync public profile statistics across competitive programming platforms
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenConnectModal}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Connect Handles
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => syncMutation.mutate()}
            isLoading={syncMutation.isPending}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />}
          >
            Sync Platforms
          </Button>
        </div>
      </div>

      {/* Sync Failure Error Message Alert if Partial Failure */}
      {lastSyncStatus === 'Partial Failure' && lastSyncError && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Notice: {lastSyncError}</span>
        </div>
      )}

      {/* Platform Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformCards.map((p) => (
          <div
            key={p.key}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
              p.connected ? p.color : 'border-gray-800 bg-gray-900/40 text-gray-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-white">{p.name}</span>
                {p.connected ? (
                  <p className="text-[11px] text-gray-300 font-mono mt-0.5">@{p.handle}</p>
                ) : (
                  <p className="text-[11px] text-gray-500 italic mt-0.5">Not connected</p>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  p.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                {p.connected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {p.connected ? (
              <div className="space-y-1 text-xs pt-1">
                {p.solved !== undefined && (
                  <div className="flex justify-between text-gray-300">
                    <span>Solved:</span>
                    <span className="font-bold text-white">{p.solved}</span>
                  </div>
                )}
                {p.rating !== undefined && p.rating > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Rating:</span>
                    <span className="font-bold text-amber-400">{p.rating} {p.rank ? `(${p.rank})` : ''}</span>
                  </div>
                )}
                {p.stars && (
                  <div className="flex justify-between text-gray-300">
                    <span>Star Tier:</span>
                    <span className="font-bold text-amber-400">{p.stars}</span>
                  </div>
                )}
                {p.badgeStars !== undefined && p.badgeStars > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Problem Badge Stars:</span>
                    <span className="font-bold text-purple-400">{p.badgeStars} ★</span>
                  </div>
                )}
                {p.easy !== undefined && (
                  <div className="text-[10px] text-gray-400 pt-1">
                    E: {p.easy} | M: {p.medium} | H: {p.hard}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 pt-2">Add username to enable stats sync.</p>
            )}

            <div className="text-[10px] text-gray-500 border-t border-gray-800/80 pt-2 flex justify-between items-center">
              <span>Synced:</span>
              <span>{formatTimeAgo(lastSyncedAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Handles Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Connect Platform Handles</h3>
                <p className="text-xs text-gray-400 mt-0.5">Enter public usernames (no passwords required)</p>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <Input
                label="LeetCode Username"
                placeholder="e.g. john_doe"
                value={handlesForm.leetcode}
                onChange={(e) => setHandlesForm({ ...handlesForm, leetcode: e.target.value })}
              />
              <Input
                label="Codeforces Handle"
                placeholder="e.g. tourist"
                value={handlesForm.codeforces}
                onChange={(e) => setHandlesForm({ ...handlesForm, codeforces: e.target.value })}
              />
              <Input
                label="CodeChef Username"
                placeholder="e.g. chef_john"
                value={handlesForm.codechef}
                onChange={(e) => setHandlesForm({ ...handlesForm, codechef: e.target.value })}
              />
              <Input
                label="HackerRank Username"
                placeholder="e.g. hacker_john"
                value={handlesForm.hackerrank}
                onChange={(e) => setHandlesForm({ ...handlesForm, hackerrank: e.target.value })}
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <Button variant="ghost" type="button" onClick={() => setIsConnectModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={connectMutation.isPending}>
                  Save Handles
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
