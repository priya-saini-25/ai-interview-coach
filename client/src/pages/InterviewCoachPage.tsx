import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Video, Play, Award, CheckCircle, Clock, Building, ArrowRight, RotateCcw } from 'lucide-react';
import { interviewService, StartInterviewPayload } from '../services/interviewService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';

export const InterviewCoachPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<{ sessionId: string; questions: string[] } | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [evaluationResult, setEvaluationResult] = useState<{ score: number; feedback: string[] } | null>(null);

  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [company, setCompany] = useState('Google');

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: interviewService.getHistory,
  });

  const startMutation = useMutation({
    mutationFn: interviewService.startInterview,
    onSuccess: (data) => {
      toast.success('AI Mock Interview started! Answer all 5 questions.');
      setActiveSession(data);
      setAnswers(new Array(data.questions.length).fill(''));
      setEvaluationResult(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start interview');
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: { sessionId: string; answers: string[] }) =>
      interviewService.submitInterview(data.sessionId, data.answers),
    onSuccess: (result) => {
      toast.success('Interview evaluated successfully!');
      setEvaluationResult(result);
      queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit interview');
    },
  });

  const handleAnswerChange = (index: number, val: string) => {
    const updated = [...answers];
    updated[index] = val;
    setAnswers(updated);
  };

  const handleStartInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error('Role is required');
      return;
    }
    startMutation.mutate({ role, difficulty, company });
  };

  const handleSubmitInterview = () => {
    if (!activeSession) return;
    submitMutation.mutate({ sessionId: activeSession.sessionId, answers });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-3 border border-pink-500/20">
            <Video className="w-3.5 h-3.5" />
            <span>Gemini AI Mock Examiner</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Mock Interview Coach</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Experience realistic 5-question technical interview rounds tailored to your target role and company.
          </p>
        </div>
      </div>

      {/* Evaluation Results Banner */}
      {evaluationResult && (
        <Card className="border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-gray-900 to-[#0b0f19]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Interview Evaluation Complete</h3>
              <p className="text-xs text-gray-300 mt-1">Review your score and detailed per-question AI feedback below.</p>
            </div>

            <div className="flex items-center space-x-3 bg-gray-900 px-6 py-4 rounded-xl border border-emerald-500/40">
              <span className="text-4xl font-extrabold text-emerald-400">{evaluationResult.score}</span>
              <span className="text-xs text-gray-400 font-semibold uppercase">/ 100 Score</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Per-Question Feedback</h4>
            {evaluationResult.feedback.map((fb, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-300">
                <span className="font-bold text-indigo-400 mr-2">Q{idx + 1} Feedback:</span>
                <span>{fb}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEvaluationResult(null);
                setActiveSession(null);
              }}
            >
              Start Another Interview
            </Button>
          </div>
        </Card>
      )}

      {/* Active Session Question Form */}
      {activeSession && !evaluationResult && (
        <Card className="border-pink-500/30">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">5 Technical Interview Questions</h3>
            <Badge variant="purple">{role} ({difficulty})</Badge>
          </div>

          <div className="space-y-6">
            {activeSession.questions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
                <h4 className="text-sm font-bold text-white">
                  Q{idx + 1}: {q}
                </h4>
                <textarea
                  rows={3}
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full bg-[#111827] text-gray-100 placeholder-gray-500 border border-gray-800 rounded-lg p-3 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitInterview}
              isLoading={submitMutation.isPending}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
            >
              Submit Answers for AI Evaluation
            </Button>
          </div>
        </Card>
      )}

      {/* Start New Session Form */}
      {!activeSession && !evaluationResult && (
        <Card className="max-w-xl mx-auto border-pink-500/30">
          <h3 className="text-lg font-bold text-white mb-4">Start New AI Interview Round</h3>
          <form onSubmit={handleStartInterview} className="space-y-4">
            <Input
              label="Target Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer / Frontend Developer"
            />

            <Input
              label="Target Company (Optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google / Meta / Amazon"
              leftIcon={<Building className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#111827] text-gray-100 border border-gray-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
              isLoading={startMutation.isPending}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Generate 5 Interview Questions
            </Button>
          </form>
        </Card>
      )}

      {/* History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Previous Interview Sessions</h3>
        </div>

        {isHistoryLoading ? (
          <div className="p-8 text-center">
            <Spinner size="md" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Video className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold">No interview sessions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Role & Company</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-200">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      {h.role} {h.company && <span className="text-gray-400">({h.company})</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={h.difficulty === 'Easy' ? 'success' : h.difficulty === 'Medium' ? 'warning' : 'danger'}>
                        {h.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400">{h.score} / 100</td>
                    <td className="px-6 py-4">
                      <Badge variant={h.completed ? 'success' : 'gray'}>
                        {h.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
