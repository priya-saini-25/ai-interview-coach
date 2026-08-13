import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Compass,
  Code2,
  Video,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { readinessService } from '../services/readinessService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Spinner } from '../components/common/Spinner';

export const DashboardPage: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['readinessScore'],
    queryFn: readinessService.getScore,
  });

  if (isSummaryLoading || isReadinessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const overallScore = readiness?.overallScore || 0;
  const dsaPercentage = summary?.dsa.completionPercentage || 0;

  return (
    <div className="space-y-8">
      {/* Placement Readiness Banner */}
      <div className="relative overflow-hidden glass-panel p-6 md:p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0b0f19] light:from-indigo-50 light:via-purple-50 light:to-white">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 light:text-indigo-600 text-xs font-semibold mb-3 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Readiness Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white light:text-slate-900 tracking-tight">
              Placement Readiness Score: <span className="text-indigo-400 light:text-indigo-600">{overallScore}/100</span>
            </h1>
            <p className="text-sm text-gray-300 light:text-slate-600 mt-2 leading-relaxed">
              {readiness?.recommendation || 'Keep pushing! Upload your resume and start mock interviews to boost your score.'}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-gray-900/60 light:bg-white p-4 rounded-xl border border-gray-800 light:border-slate-200 backdrop-blur-md">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center text-2xl font-extrabold text-white light:text-slate-900 shadow-lg shadow-indigo-500/20">
                {overallScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* User Card */}
        <Card hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 light:text-slate-500 uppercase tracking-wider">Candidate Profile</span>
            <Badge variant="purple">Active</Badge>
          </div>
          <h3 className="text-lg font-bold text-white light:text-slate-900 truncate">{summary?.user.name || 'Candidate'}</h3>
          <p className="text-xs text-gray-400 light:text-slate-500 mt-1 truncate">{summary?.user.college || 'College not set'}</p>
          <div className="mt-4 pt-3 border-t border-gray-800 light:border-slate-200 text-xs text-gray-400 light:text-slate-500 flex justify-between">
            <span>Graduation:</span>
            <span className="font-semibold text-gray-200 light:text-slate-800">{summary?.user.graduationYear || 'N/A'}</span>
          </div>
        </Card>

        {/* Resume Analysis Card */}
        <Card hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 light:text-slate-500 uppercase tracking-wider">Resume Analysis</span>
            <FileText className="w-5 h-5 text-indigo-400 light:text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white light:text-slate-900">{summary?.resume.score || 0}</h3>
            <span className="text-xs text-gray-400 light:text-slate-500">/ 100 ATS Score</span>
          </div>
          <div className="mt-3">
            <Badge variant={summary?.resume.uploaded ? 'success' : 'warning'}>
              {summary?.resume.uploaded ? 'Resume Uploaded' : 'Not Uploaded'}
            </Badge>
          </div>
          <div className="mt-4">
            <Link to="/resume">
              <Button variant="ghost" size="sm" className="w-full text-xs justify-between">
                <span>View Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* AI Roadmap Card */}
        <Card hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 light:text-slate-500 uppercase tracking-wider">Placement Roadmap</span>
            <Compass className="w-5 h-5 text-purple-400 light:text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-white light:text-slate-900">
            {summary?.roadmap.generated ? '6-Month Plan Ready' : 'Roadmap Needed'}
          </h3>
          <div className="mt-3">
            <Badge variant={summary?.roadmap.generated ? 'success' : 'gray'}>
              {summary?.roadmap.generated ? 'Generated' : 'Not Generated'}
            </Badge>
          </div>
          <div className="mt-4">
            <Link to="/roadmap">
              <Button variant="ghost" size="sm" className="w-full text-xs justify-between">
                <span>{summary?.roadmap.generated ? 'View Roadmap' : 'Generate Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* DSA Tracker Card */}
        <Card hoverEffect>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 light:text-slate-500 uppercase tracking-wider">DSA Topic Tracker</span>
            <Code2 className="w-5 h-5 text-emerald-400 light:text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-white light:text-slate-900">{summary?.dsa.completed || 0}</h3>
            <span className="text-xs text-gray-400 light:text-slate-500">/ {summary?.dsa.total || 0} Topics</span>
          </div>
          <div className="mt-3">
            <ProgressBar progress={dsaPercentage} showPercentage color="emerald" />
          </div>
          <div className="mt-4">
            <Link to="/dsa">
              <Button variant="ghost" size="sm" className="w-full text-xs justify-between">
                <span>Track Progress</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Action Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 light:border-slate-200">
        <h3 className="text-lg font-bold text-white light:text-slate-900 mb-4">Quick Preparation Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/resume">
            <div className="p-4 rounded-xl bg-gray-900/60 light:bg-slate-50 border border-gray-800 light:border-slate-200 hover:border-indigo-500/40 transition group">
              <FileText className="w-6 h-6 text-indigo-400 light:text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-white light:text-slate-900">Upload Resume</h4>
              <p className="text-xs text-gray-400 light:text-slate-500 mt-1">Get AI ATS feedback and missing skills</p>
            </div>
          </Link>

          <Link to="/roadmap">
            <div className="p-4 rounded-xl bg-gray-900/60 light:bg-slate-50 border border-gray-800 light:border-slate-200 hover:border-purple-500/40 transition group">
              <Compass className="w-6 h-6 text-purple-400 light:text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-white light:text-slate-900">Generate Roadmap</h4>
              <p className="text-xs text-gray-400 light:text-slate-500 mt-1">6-month structured timeline</p>
            </div>
          </Link>

          <Link to="/dsa">
            <div className="p-4 rounded-xl bg-gray-900/60 light:bg-slate-50 border border-gray-800 light:border-slate-200 hover:border-emerald-500/40 transition group">
              <Code2 className="w-6 h-6 text-emerald-400 light:text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-white light:text-slate-900">DSA Practice</h4>
              <p className="text-xs text-gray-400 light:text-slate-500 mt-1">Solve & mark topics completed</p>
            </div>
          </Link>

          <Link to="/interview">
            <div className="p-4 rounded-xl bg-gray-900/60 light:bg-slate-50 border border-gray-800 light:border-slate-200 hover:border-pink-500/40 transition group">
              <Video className="w-6 h-6 text-pink-400 light:text-pink-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-semibold text-white light:text-slate-900">Start Mock Interview</h4>
              <p className="text-xs text-gray-400 light:text-slate-500 mt-1">15-question sectioned AI interview</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
