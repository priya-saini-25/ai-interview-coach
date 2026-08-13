import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Compass, Sparkles, Target, Building, Calendar, DollarSign, Award, Save, Download, CheckCircle2 } from 'lucide-react';
import { roadmapService, GenerateRoadmapPayload } from '../services/roadmapService';
import { dashboardService } from '../services/dashboardService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';

export const RoadmapPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'view' | 'generate'>('view');

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: roadmapData, isLoading: isRoadmapLoading } = useQuery({
    queryKey: ['userRoadmap'],
    queryFn: roadmapService.getRoadmap,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<GenerateRoadmapPayload>({
    defaultValues: {
      targetRole: 'Software Development Engineer',
      targetCompany: 'Google',
      currentYear: '3rd Year',
      currentSkills: ['DSA', 'React', 'Node.js'],
      targetPackage: '20 LPA',
    },
  });

  const generateMutation = useMutation({
    mutationFn: roadmapService.generateRoadmap,
    onSuccess: (data) => {
      toast.success('AI Placement Roadmap generated & persisted!');
      queryClient.setQueryData(['userRoadmap'], data);
      queryClient.invalidateQueries({ queryKey: ['userRoadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setActiveTab('view');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate roadmap');
    },
  });

  const saveMutation = useMutation({
    mutationFn: roadmapService.saveRoadmap,
    onSuccess: () => {
      toast.success('Roadmap saved successfully to your account!');
      queryClient.invalidateQueries({ queryKey: ['userRoadmap'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save roadmap');
    },
  });

  const onSubmit = (data: GenerateRoadmapPayload) => {
    const skillsArray = typeof data.currentSkills === 'string'
      ? (data.currentSkills as string).split(',').map(s => s.trim())
      : data.currentSkills;

    generateMutation.mutate({
      ...data,
      currentSkills: skillsArray,
    });
  };

  const handleSaveRoadmap = () => {
    if (!roadmapData?.roadmap) return;
    saveMutation.mutate({
      targetRole: roadmapData.targetRole || 'Software Development Engineer',
      targetCompany: roadmapData.targetCompany || 'Tech Company',
      currentYear: roadmapData.currentYear || '3rd Year',
      currentSkills: roadmapData.currentSkills || [],
      targetPackage: roadmapData.targetPackage || '20 LPA',
      roadmap: roadmapData.roadmap,
    });
  };

  const handleDownloadRoadmap = () => {
    if (!roadmapData?.roadmap) {
      toast.error('No roadmap available to download');
      return;
    }
    toast.success('Opening print/download view. Choose "Save as PDF"');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (isSummaryLoading || isRoadmapLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasRoadmap = !!(roadmapData?.roadmap || summary?.roadmap.generated);
  const roadmapMarkdown = roadmapData?.roadmap || '';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 no-print">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3 border border-purple-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Career Strategist</span>
          </div>
          <h1 className="text-2xl font-bold text-white">6-Month AI Placement Roadmap</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Get a comprehensive month-by-month, week-by-week prep strategy tailored to your dream role, company, and package.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'view' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            View Roadmap
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'generate' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate New
          </button>
        </div>
      </div>

      {/* Form Tab */}
      {(activeTab === 'generate' || !hasRoadmap) && (
        <Card className="max-w-3xl mx-auto border-purple-500/30 no-print">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-800">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Configure Target Profile</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Target Role"
                placeholder="e.g. Full Stack Engineer"
                leftIcon={<Target className="w-4 h-4" />}
                error={errors.targetRole?.message}
                {...register('targetRole', { required: 'Target role is required' })}
              />

              <Input
                label="Target Company"
                placeholder="e.g. Amazon / Microsoft / Google"
                leftIcon={<Building className="w-4 h-4" />}
                error={errors.targetCompany?.message}
                {...register('targetCompany', { required: 'Target company is required' })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Current Academic Year / Level"
                placeholder="e.g. 3rd Year / Final Year"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.currentYear?.message}
                {...register('currentYear', { required: 'Current year is required' })}
              />

              <Input
                label="Target Package (CTC)"
                placeholder="e.g. 15 LPA - 25 LPA"
                leftIcon={<DollarSign className="w-4 h-4" />}
                error={errors.targetPackage?.message}
                {...register('targetPackage', { required: 'Target package is required' })}
              />
            </div>

            <Input
              label="Current Skills (Comma Separated)"
              placeholder="e.g. JavaScript, C++, React, Data Structures"
              leftIcon={<Award className="w-4 h-4" />}
              {...register('currentSkills')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              isLoading={generateMutation.isPending}
            >
              Generate 6-Month Roadmap with AI
            </Button>
          </form>
        </Card>
      )}

      {/* Roadmap Markdown Content Display */}
      {activeTab === 'view' && hasRoadmap && !generateMutation.isPending && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-gray-800 no-print">
            <div className="flex items-center space-x-2 text-xs text-purple-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved for authenticated user</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveRoadmap}
                isLoading={saveMutation.isPending}
                leftIcon={<Save className="w-4 h-4 text-indigo-400" />}
              >
                Save Roadmap
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadRoadmap}
                leftIcon={<Download className="w-4 h-4" />}
                className="bg-purple-600 hover:bg-purple-500"
              >
                Download Roadmap (PDF)
              </Button>
            </div>
          </div>

          {/* Printable Document View */}
          <Card className="prose prose-invert max-w-none p-6 sm:p-8 leading-relaxed text-gray-200">
            <div className="border-b border-gray-800 pb-6 mb-6">
              <h2 className="text-xl font-bold text-purple-400 m-0">
                {roadmapData?.targetRole || 'Software Engineer'} AI Placement Roadmap
              </h2>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400 font-medium">
                {roadmapData?.targetCompany && <span>Target Company: <strong>{roadmapData.targetCompany}</strong></span>}
                {roadmapData?.currentYear && <span>Year/Level: <strong>{roadmapData.currentYear}</strong></span>}
                {roadmapData?.targetPackage && <span>Target CTC: <strong>{roadmapData.targetPackage}</strong></span>}
                {roadmapData?.updatedAt && <span>Last Updated: <strong>{new Date(roadmapData.updatedAt).toLocaleDateString()}</strong></span>}
              </div>
            </div>

            <div className="text-gray-200">
              <ReactMarkdown>{roadmapMarkdown}</ReactMarkdown>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
