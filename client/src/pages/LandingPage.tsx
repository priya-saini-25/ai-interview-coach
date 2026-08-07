import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Target, Award } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AI Placement Coach</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Placement Preparation Suite</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          Supercharge Your Career with <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Driven Placement Coaching
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Unlock personalized ATS resume optimization, 6-month preparation roadmaps, DSA progress tracking, and interactive Gemini AI mock interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full">
              Start Free Coaching
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              Existing Account Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition">
            <Cpu className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">AI Resume Analyzer</h3>
            <p className="text-sm text-gray-400">Extracts PDF text and evaluates overall ATS scores, strengths, weaknesses, and missing skills.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition">
            <Target className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">6-Month Roadmap</h3>
            <p className="text-sm text-gray-400">Generates custom placement preparation roadmaps tailored to your target company and package.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">DSA Progress Tracker</h3>
            <p className="text-sm text-gray-400">Log topics by category and difficulty while tracking your completion metrics dynamically.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-pink-500/30 transition">
            <Award className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Mock Interview Coach</h3>
            <p className="text-sm text-gray-400">Practice 5-question AI interviews with real-time feedback and performance ratings.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-8 text-center text-xs text-gray-500">
        <p>© 2026 AI Placement Coach. All rights reserved.</p>
      </footer>
    </div>
  );
};
