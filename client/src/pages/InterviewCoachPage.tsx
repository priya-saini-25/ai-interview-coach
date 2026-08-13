import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Video,
  VideoOff,
  Play,
  Award,
  CheckCircle,
  Clock,
  Building,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Camera,
  AlertCircle,
  Sparkles,
  Target,
  Brain,
  MessageSquare,
  Users,
} from 'lucide-react';
import { interviewService, SubmitInterviewResponse } from '../services/interviewService';
import { QuestionItem, InterviewSession } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';

export const InterviewCoachPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Session state
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    questions: (string | QuestionItem)[];
  } | null>(null);

  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<SubmitInterviewResponse | null>(null);

  // Form setup
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [company, setCompany] = useState('Google');
  const [useCamera, setUseCamera] = useState(false);

  // Camera stream state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Section-by-section navigation state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const sectionsList = [
    { key: 'Technical', title: 'Technical', desc: 'Core programming, system design, and domain concepts', count: 5, icon: Target },
    { key: 'Logical', title: 'Logical / Problem Solving', desc: 'Data structures, algorithms, and analytical reasoning', count: 3, icon: Brain },
    { key: 'Personal', title: 'Personal / Introduction', desc: 'Background, projects, achievements, and career path', count: 3, icon: MessageSquare },
    { key: 'HR / Behavioral', title: 'HR / Behavioral', desc: 'Leadership, teamwork, conflict resolution, and cultural fit', count: 4, icon: Users },
  ];

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: interviewService.getHistory,
  });

  // Stop camera tracks cleanly
  const stopCameraTracks = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Start Camera feed
  const startCameraFeed = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success('Camera preview activated (Local preview only)');
    } catch (err: any) {
      console.warn('Camera permission denied or device missing:', err.message);
      setCameraError('Camera access denied or unavailable. Continuing in standard text mode.');
      setIsCameraActive(false);
      toast.error('Camera unavailable. Continuing in standard interview mode.');
    }
  };

  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      stopCameraTracks();
    };
  }, []);

  const startMutation = useMutation({
    mutationFn: interviewService.startInterview,
    onSuccess: async (data) => {
      toast.success('15-Question Sectioned AI Mock Interview started!');
      setActiveSession(data);
      setAnswers(new Array(data.questions.length).fill(''));
      setEvaluationResult(null);
      setCurrentSectionIndex(0);

      if (useCamera) {
        await startCameraFeed();
      }
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
      stopCameraTracks();
      queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['readinessScore'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit interview');
    },
  });

  const handleAnswerChange = (questionIndex: number, val: string) => {
    const updated = [...answers];
    updated[questionIndex] = val;
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

  // Helper to extract questions belonging to a section
  const getQuestionsForSection = (sectionKey: string) => {
    if (!activeSession) return [];
    return activeSession.questions
      .map((q, originalIdx) => {
        let sec = 'Technical';
        let text = '';
        if (typeof q === 'object' && q.question) {
          sec = q.section || 'Technical';
          text = q.question;
        } else {
          sec = originalIdx < 5 ? 'Technical' : originalIdx < 8 ? 'Logical' : originalIdx < 11 ? 'Personal' : 'HR / Behavioral';
          text = String(q);
        }
        return { originalIdx, section: sec, question: text };
      })
      .filter((q) => q.section.toLowerCase().includes(sectionKey.toLowerCase()) || sectionKey.toLowerCase().includes(q.section.toLowerCase()));
  };

  const currentSection = sectionsList[currentSectionIndex];
  const sectionQuestions = getQuestionsForSection(currentSection.key);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gray-800 light:border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 light:text-pink-600 text-xs font-semibold mb-3 border border-pink-500/20">
            <Video className="w-3.5 h-3.5" />
            <span>Realistic AI Mock Examiner</span>
          </div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900">AI Mock Interview Coach</h1>
          <p className="text-sm text-gray-400 light:text-slate-600 mt-1 max-w-xl">
            Complete a realistic 15-question structured interview across 4 distinct rounds with optional camera mode.
          </p>
        </div>
      </div>

      {/* Evaluation Results Summary Dashboard */}
      {evaluationResult && (
        <Card className="border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-gray-900 to-[#0b0f19] light:from-emerald-50 light:via-slate-50 light:to-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-gray-800 light:border-slate-200 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 light:text-emerald-700 text-xs font-bold border border-emerald-500/30">
                Evaluation Complete
              </span>
              <h3 className="text-2xl font-extrabold text-white light:text-slate-900 mt-2">Interview Evaluation Dashboard</h3>
              <p className="text-xs text-gray-300 light:text-slate-600 mt-1">
                Overall Readiness: <strong className="text-emerald-400 light:text-emerald-700">{evaluationResult.detailedAnalysis?.overallReadiness || 'Ready for Technical Rounds'}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-gray-900 light:bg-slate-100 px-6 py-4 rounded-xl border border-emerald-500/40">
              <span className="text-5xl font-extrabold text-emerald-400 light:text-emerald-600">{evaluationResult.score}</span>
              <div className="text-left">
                <p className="text-xs text-gray-400 light:text-slate-500 font-semibold uppercase">Overall Score</p>
                <p className="text-[10px] text-gray-500 light:text-slate-400">Out of 100 Points</p>
              </div>
            </div>
          </div>

          {/* Section Score Breakdown Grid */}
          {evaluationResult.sectionScores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-gray-900/80 light:bg-white border border-gray-800 light:border-slate-200">
                <p className="text-xs text-gray-400 light:text-slate-500 font-semibold uppercase">Technical</p>
                <p className="text-2xl font-bold text-indigo-400 light:text-indigo-600 mt-1">{evaluationResult.sectionScores.technical} / 100</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/80 light:bg-white border border-gray-800 light:border-slate-200">
                <p className="text-xs text-gray-400 light:text-slate-500 font-semibold uppercase">Logical</p>
                <p className="text-2xl font-bold text-sky-400 light:text-sky-600 mt-1">{evaluationResult.sectionScores.logical} / 100</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/80 light:bg-white border border-gray-800 light:border-slate-200">
                <p className="text-xs text-gray-400 light:text-slate-500 font-semibold uppercase">Personal</p>
                <p className="text-2xl font-bold text-purple-400 light:text-purple-600 mt-1">{evaluationResult.sectionScores.personal} / 100</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/80 light:bg-white border border-gray-800 light:border-slate-200">
                <p className="text-xs text-gray-400 light:text-slate-500 font-semibold uppercase">HR / Behavioral</p>
                <p className="text-2xl font-bold text-pink-400 light:text-pink-600 mt-1">{evaluationResult.sectionScores.hr} / 100</p>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          {evaluationResult.detailedAnalysis && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-emerald-950/20 light:bg-emerald-50/60 border border-emerald-500/30">
                <h4 className="text-sm font-bold text-emerald-400 light:text-emerald-800 uppercase tracking-wider mb-3">
                  Key Strengths
                </h4>
                <ul className="space-y-2 text-xs text-gray-300 light:text-slate-700">
                  {evaluationResult.detailedAnalysis.strengths.map((str, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-rose-950/20 light:bg-rose-50/60 border border-rose-500/30">
                <h4 className="text-sm font-bold text-rose-400 light:text-rose-800 uppercase tracking-wider mb-3">
                  Areas for Improvement
                </h4>
                <ul className="space-y-2 text-xs text-gray-300 light:text-slate-700">
                  {evaluationResult.detailedAnalysis.weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Detailed Question Feedback */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-bold text-white light:text-slate-900 uppercase tracking-wider">
              Per-Question Feedback ({evaluationResult.feedback.length} Questions)
            </h4>
            {evaluationResult.feedback.map((fb, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-900/80 light:bg-white border border-gray-800 light:border-slate-200 text-xs text-gray-300 light:text-slate-700">
                <span className="font-bold text-indigo-400 light:text-indigo-600 mr-2">Q{idx + 1} Feedback:</span>
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
                stopCameraTracks();
              }}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Start Another Interview Round
            </Button>
          </div>
        </Card>
      )}

      {/* Active Session View with Camera and Section Tabs */}
      {activeSession && !evaluationResult && (
        <div className="space-y-6">
          {/* Top Camera & Progress Bar */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Camera Preview Box */}
            <div className="lg:col-span-1">
              <Card className="p-4 border-pink-500/30 flex flex-col justify-between min-h-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-white light:text-slate-900">
                    <Camera className="w-4 h-4 text-pink-400" />
                    <span>Camera Preview</span>
                  </div>
                  <Badge variant={isCameraActive ? 'success' : 'gray'}>
                    {isCameraActive ? 'Camera ON' : 'Camera OFF'}
                  </Badge>
                </div>

                <div className="relative aspect-video bg-gray-900 light:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-800">
                  {isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      <VideoOff className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Camera preview off (Local-only mode)</p>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <p className="text-[10px] text-amber-400 mt-2">{cameraError}</p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  {!isCameraActive ? (
                    <Button variant="secondary" size="sm" className="w-full text-xs" onClick={startCameraFeed}>
                      Turn Camera ON
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={stopCameraTracks}>
                      Turn Camera OFF
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Section Progress Stepper */}
            <div className="lg:col-span-2">
              <Card className="p-6 h-full flex flex-col justify-between border-indigo-500/30">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-400 light:text-indigo-600 uppercase tracking-widest">
                      Section {currentSectionIndex + 1} of {sectionsList.length}
                    </span>
                    <Badge variant="purple">{role} ({difficulty})</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white light:text-slate-900">
                    {currentSection.title} Round
                  </h3>
                  <p className="text-xs text-gray-400 light:text-slate-600 mt-1">
                    {currentSection.desc} ({sectionQuestions.length} Questions)
                  </p>
                </div>

                {/* Stepper Tabs */}
                <div className="grid grid-cols-4 gap-2 mt-6">
                  {sectionsList.map((sec, idx) => (
                    <button
                      key={sec.key}
                      onClick={() => setCurrentSectionIndex(idx)}
                      className={`p-2.5 rounded-lg text-xs font-semibold text-center transition border ${
                        currentSectionIndex === idx
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-gray-900/60 light:bg-slate-100 text-gray-400 light:text-slate-600 border-gray-800 light:border-slate-300 hover:text-white light:hover:text-slate-900'
                      }`}
                    >
                      <span className="block truncate">{sec.title}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Current Section Questions Form */}
          <Card className="border-pink-500/30">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800 light:border-slate-200">
              <h3 className="text-base font-bold text-white light:text-slate-900">
                {currentSection.title} Questions ({sectionQuestions.length} Items)
              </h3>
              <span className="text-xs text-gray-400 light:text-slate-500 font-medium">
                Step {currentSectionIndex + 1} of {sectionsList.length}
              </span>
            </div>

            <div className="space-y-6">
              {sectionQuestions.map((item, qSubIdx) => {
                const globalIndex = item.originalIdx;
                return (
                  <div key={globalIndex} className="p-5 rounded-xl bg-gray-900/60 light:bg-slate-50 border border-gray-800 light:border-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-white light:text-slate-900">
                        Q{globalIndex + 1}: {item.question}
                      </h4>
                      <Badge variant="purple" size="sm">{item.section}</Badge>
                    </div>
                    <textarea
                      rows={3}
                      value={answers[globalIndex] || ''}
                      onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                      placeholder="Type your structured answer here..."
                      className="w-full bg-[#111827] light:bg-white text-gray-100 light:text-slate-900 placeholder-gray-500 light:placeholder-slate-400 border border-gray-800 light:border-slate-300 rounded-lg p-3 text-xs focus:outline-none focus:border-pink-500 transition"
                    />
                  </div>
                );
              })}
            </div>

            {/* Previous / Next Section Controls */}
            <div className="mt-8 pt-6 border-t border-gray-800 light:border-slate-200 flex items-center justify-between">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCurrentSectionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSectionIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Section
              </Button>

              {currentSectionIndex < sectionsList.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentSectionIndex((prev) => Math.min(sectionsList.length - 1, prev + 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Next Section
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitInterview}
                  isLoading={submitMutation.isPending}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                >
                  Submit 15 Questions for Evaluation
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Start New Session Form */}
      {!activeSession && !evaluationResult && (
        <Card className="max-w-xl mx-auto border-pink-500/30">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-800 light:border-slate-200">
            <Sparkles className="w-5 h-5 text-pink-400 light:text-pink-600" />
            <h3 className="text-lg font-bold text-white light:text-slate-900">Start 15-Question AI Mock Interview</h3>
          </div>

          <form onSubmit={handleStartInterview} className="space-y-4">
            <Input
              label="Target Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer / Full Stack Developer"
            />

            <Input
              label="Target Company (Optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google / Meta / Amazon"
              leftIcon={<Building className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-medium text-gray-300 light:text-slate-700 mb-1.5 uppercase tracking-wider">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#111827] light:bg-white text-gray-100 light:text-slate-900 border border-gray-800 light:border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Optional Camera Toggle */}
            <div className="p-4 rounded-xl bg-gray-900/60 light:bg-slate-100 border border-gray-800 light:border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-pink-400" />
                <div>
                  <p className="text-xs font-semibold text-white light:text-slate-900">Camera Mode (Optional)</p>
                  <p className="text-[10px] text-gray-400 light:text-slate-500">Live preview only. No video uploaded or stored.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useCamera}
                onChange={(e) => setUseCamera(e.target.checked)}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
              isLoading={startMutation.isPending}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Generate 15 Structured Questions (4 Rounds)
            </Button>
          </form>
        </Card>
      )}

      {/* History Table */}
      <Card className="p-0 overflow-hidden border-gray-800 light:border-slate-200">
        <div className="p-6 border-b border-gray-800 light:border-slate-200">
          <h3 className="text-lg font-bold text-white light:text-slate-900">Previous Interview Sessions</h3>
        </div>

        {isHistoryLoading ? (
          <div className="p-8 text-center">
            <Spinner size="md" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-400 light:text-slate-500">
            <Video className="w-10 h-10 mx-auto text-gray-600 light:text-slate-400 mb-3" />
            <p className="text-sm font-semibold">No interview sessions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 light:bg-slate-100 text-gray-400 light:text-slate-600 font-semibold uppercase border-b border-gray-800 light:border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Role & Company</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 light:divide-slate-200 text-gray-200 light:text-slate-800">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-gray-800/40 light:hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-white light:text-slate-900">
                      {h.role} {h.company && <span className="text-gray-400 light:text-slate-500">({h.company})</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={h.difficulty === 'Easy' ? 'success' : h.difficulty === 'Medium' ? 'warning' : 'danger'}>
                        {h.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400 light:text-indigo-600">{h.score} / 100</td>
                    <td className="px-6 py-4">
                      <Badge variant={h.completed ? 'success' : 'gray'}>
                        {h.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400 light:text-slate-500">
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
