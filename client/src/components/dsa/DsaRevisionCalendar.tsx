import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { DsaRevisionCalendarDay } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Calendar, AlertTriangle, BookOpen } from 'lucide-react';

export const DsaRevisionCalendar: React.FC = () => {
  const {
    data: calendar,
    isLoading,
    isError,
    refetch,
  } = useQuery<DsaRevisionCalendarDay[]>({
    queryKey: ['dsaRevisionUpcoming'],
    queryFn: () => dsaService.getUpcomingRevision(30),
  });

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-gray-800/40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-red-300">Unable to load revision calendar.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/20" onClick={() => refetch()}>
          Retry Calendar
        </Button>
      </Card>
    );
  }

  const calendarDays = calendar || [];

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNum = d.getDate();
    const monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { dayNum, monthStr };
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>30-Day Upcoming Revision Schedule</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Automatically scheduled spaced-repetition reviews for the next 30 days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {calendarDays.map((dayItem, idx) => {
          const { dayNum, monthStr } = formatDateLabel(dayItem.date);
          const hasRevisions = dayItem.count > 0;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                hasRevisions
                  ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
                  : 'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{monthStr}</span>
                <span className="text-sm font-bold text-white">{dayNum}</span>
              </div>

              {hasRevisions ? (
                <div className="space-y-1">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold inline-block">
                    {dayItem.count} {dayItem.count === 1 ? 'Revision' : 'Revisions'}
                  </span>
                  <div className="space-y-0.5 text-[10px] text-gray-300 truncate">
                    {dayItem.problems.slice(0, 2).map((p, pIdx) => (
                      <p key={pIdx} className="truncate">• {p.title}</p>
                    ))}
                    {dayItem.problems.length > 2 && (
                      <p className="text-[9px] text-purple-400 font-semibold">+{dayItem.problems.length - 2} more</p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-gray-600 italic">No reviews</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
