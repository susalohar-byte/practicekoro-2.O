import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Shield,
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Crown,
  ChevronRight
} from 'lucide-react';
import type { MockTest, Subject } from '@/types';

export const Home: React.FC = () => {
  const { user, isPro } = useAuth();
  const { selectedExam } = useExam();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [featuredTests, setFeaturedTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!selectedExam) return;
      setLoading(true);
      try {
        const [subjData, testsData] = await Promise.all([
          api.getSubjects(selectedExam.id),
          api.getTests(undefined, selectedExam.id),
        ]);
        setSubjects(subjData);
        setFeaturedTests(testsData.slice(0, 4));
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedExam]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Target Exam Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Exam: {selectedExam?.title || 'WBP Constable'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Aspirant'}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Strictly syllabus-aligned mock tests and chapter-wise practice for West Bengal competitive government examinations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/tests')}
              className="font-bold text-xs sm:text-sm shadow-lg shadow-brand-600/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Practice Tests
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/practice')}
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white text-xs sm:text-sm"
              leftIcon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            >
              Mistakes Notebook
            </Button>
          </div>
        </div>

        {/* Decorative background badge */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden md:block">
          <Shield className="w-64 h-64 text-indigo-300" />
        </div>
      </div>

      {/* Basic Performance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tests Taken
            </span>
            <div className="p-2 bg-indigo-50 text-brand-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">1</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Indus Valley Mock 01</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accuracy
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">80.0%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">4 Correct / 1 Wrong</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              State Rank
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">#14</p>
          <p className="text-[11px] text-slate-400 mt-0.5">94.5th Percentile</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mistakes Notebook
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">1</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending Revision</p>
        </Card>
      </div>

      {/* Pro Pass Banner if not subscribed */}
      {!isPro && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Upgrade to PracticeKoro All-Access Pro Pass
              </h3>
              <p className="text-xs text-amber-100">
                One simple subscription gives you unlimited access to ALL Premium mock tests and solutions across WB exams.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/profile')}
            className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs whitespace-nowrap shadow-md shrink-0"
          >
            Get Pro Pass ₹299
          </Button>
        </div>
      )}

      {/* Subjects Grid (Exam -> Subjects) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Subjects in {selectedExam?.title}
            </h2>
            <p className="text-xs text-slate-500">
              Select a subject to drill down into chapters and tests
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Subjects <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((subj) => (
              <Card
                key={subj.id}
                hoverable
                onClick={() => navigate(`/tests?subject=${subj.id}`)}
                className="p-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" size="sm">
                    {subj.chaptersCount || 4} Chapters
                  </Badge>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {subj.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Mock Tests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Mock Tests
            </h2>
            <p className="text-xs text-slate-500">
              Start with free diagnostic tests or full pro mocks
            </p>
          </div>
          <Link
            to="/tests"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Tests <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredTests.map((test) => (
            <Card key={test.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={test.isPremium ? 'premium' : 'free'}>
                    {test.isPremium ? 'PRO PASS TEST' : 'FREE MOCK TEST'}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    {test.testType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {test.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-3.5 pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {test.durationMinutes} Mins
                  </span>
                  <span>•</span>
                  <span>{test.totalQuestions} Questions</span>
                  <span>•</span>
                  <span>{test.totalMarks} Marks</span>
                  <span>•</span>
                  <span className="text-rose-600">-{test.negativeMarking} Neg</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Chapter: Indus Valley Civilization
                </span>
                <Button
                  size="sm"
                  variant={test.isPremium && !isPro ? 'pro' : 'primary'}
                  onClick={() => navigate('/tests')}
                >
                  {test.isPremium && !isPro ? 'Unlock Test' : 'Start Test'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Revision & Mistakes Notebook Promo Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Card
          hoverable
          onClick={() => navigate('/practice')}
          className="p-5 bg-gradient-to-br from-amber-50/60 to-orange-50/30 border-amber-200/70 flex items-start gap-4"
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">
              Mistakes Notebook (ভুল সংশোধন খাতা)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Every question you answer incorrectly is automatically collected here so you never repeat the same mistake.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-2">
              Review 1 Mistake <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/practice')}
          className="p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 border-blue-200/70 flex items-start gap-4"
        >
          <div className="p-3 bg-blue-100 text-brand-700 rounded-xl shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">
              Bookmarked Questions (সংরক্ষিত প্রশ্নাবলি)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Save tough questions during mock tests and review detailed step-by-step explanations in Bengali & English.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 mt-2">
              View 1 Bookmark <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
