import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2, FileText, Compass, Code2, Video, Info } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'resume':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'roadmap':
        return <Compass className="w-5 h-5 text-purple-400" />;
      case 'dsa':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'interview':
        return <Video className="w-5 h-5 text-pink-400" />;
      default:
        return <Info className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
        <span className="text-xs text-gray-400 font-semibold">{notifications.length} Total</span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <Spinner size="md" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <Bell className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Notifications Yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            System alerts and activity updates will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-4 rounded-xl glass-panel border transition flex items-start justify-between gap-4 ${
                !item.read ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-gray-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 mt-0.5 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{item.title}</span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                    )}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1">{item.message}</p>
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!item.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markReadMutation.mutate(item._id)}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(item._id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
