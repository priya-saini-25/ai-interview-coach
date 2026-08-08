import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileUp, Sparkles, CheckCircle, AlertTriangle, Lightbulb, Target, Cpu } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';

export const ResumeAnalyzerPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['resumeAnalysis'],
    queryFn: async () => {
      try {
        return await resumeService.getResumeAnalysis();
      } catch (e) {
        return null;
      }
    },
    enabled: !!user?.resume,
  });

  const analyzeMutation = useMutation({
    mutationFn: resumeService.analyzeResume,
    onSuccess: (data) => {
      toast.success('Resume analyzed successfully!');
      queryClient.setQueryData(['resumeAnalysis'], data);
      queryClient.invalidateQueries({ queryKey: ['resumeAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Resume analysis failed. Please try again.');
    },
  });

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    try {
      const { resumeUrl } = await authService.uploadResume(file);
      if (user) {
        updateUser({ ...user, resume: resumeUrl });
      }
      toast.success('Resume uploaded successfully!');
      // Automatically trigger analysis
      analyzeMutation.mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resume upload failed');
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden PDF file input ref */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading || analyzeMutation.isPending}
      />

      {/* Upload Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
              <Cpu className="w-3.5 h-3.5" />
              <span>ATS & Skill AI Auditor</span>
            </div>
            <h1 className="text-2xl font-bold text-white">AI Resume Analyzer</h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Upload your PDF resume to extract key skills, receive ATS optimization advice, and calculate your market readiness score.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FileUp className="w-4 h-4" />}
              isLoading={isUploading}
              onClick={handleUploadButtonClick}
              className="w-full sm:w-auto"
            >
              {user?.resume ? 'Update PDF Resume' : 'Upload PDF Resume'}
            </Button>

            {user?.resume && (
              <Button
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                isLoading={analyzeMutation.isPending}
                onClick={() => analyzeMutation.mutate()}
                className="w-full sm:w-auto"
              >
                Run AI Analysis
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {(isAnalysisLoading || analyzeMutation.isPending) && (
        <div className="glass-panel p-12 rounded-2xl border border-gray-800 text-center">
          <Spinner size="lg" className="mb-4" />
          <h3 className="text-lg font-bold text-white">Analyzing Resume with Gemini AI...</h3>
          <p className="text-xs text-gray-400 mt-1">Extracting text, evaluating ATS metrics, and scoring skills</p>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysis && !analyzeMutation.isPending && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0b0f19] border-indigo-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white">Overall ATS Quality Score</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Based on keyword matching, industry alignment, structure, and formatting.
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-gray-900/80 px-6 py-4 rounded-xl border border-indigo-500/30">
                <span className="text-4xl font-extrabold text-indigo-400">{analysis.overallScore}</span>
                <span className="text-xs text-gray-400 font-semibold uppercase">/ 100 ATS</span>
              </div>
            </div>
          </Card>

          {/* 2-column Analysis Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                <CheckCircle className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Resume Strengths</h4>
              </div>
              <ul className="space-y-2.5">
                {analysis.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card>
              <div className="flex items-center space-x-2 text-amber-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2.5">
                {analysis.weaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Missing Skills */}
            <Card>
              <div className="flex items-center space-x-2 text-rose-400 mb-4">
                <Target className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">Recommended Missing Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            {/* ATS Suggestions */}
            <Card>
              <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                <Lightbulb className="w-5 h-5" />
                <h4 className="text-base font-bold text-white">ATS Formatting Advice</h4>
              </div>
              <ul className="space-y-2.5">
                {analysis.atsSuggestions?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* No Resume uploaded placeholder */}
      {!user?.resume && !isUploading && (
        <div className="glass-panel p-12 rounded-2xl border border-gray-800 text-center max-w-lg mx-auto">
          <FileUp className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Resume Uploaded Yet</h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            Upload your resume PDF to unlock full AI analysis, ATS scoring, and placement recommendations.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={handleUploadButtonClick}
            leftIcon={<FileUp className="w-4 h-4" />}
          >
            Upload PDF Resume
          </Button>
        </div>
      )}
    </div>
  );
};
