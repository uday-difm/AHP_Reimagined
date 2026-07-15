import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import { getQuizBySlug, quizzes } from '@/data/quizzes';
import QuizClient from './QuizClient';
import { getQuizQuestionsByCategory } from '@/lib/quizService';

// Static params for build-time generation
export function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const quiz = getQuizBySlug(resolvedParams.slug);
  if (!quiz) return {};
  return {
    title: `${quiz.title} — A Health Place Quizzes`,
    description: quiz.description,
  };
}

export default async function QuizPage({ params }) {
  const resolvedParams = await params;
  let quiz = getQuizBySlug(resolvedParams.slug);
  if (!quiz) notFound();

  // Load dynamic questions from DB via the centralized quiz service
  const formatted = await getQuizQuestionsByCategory(resolvedParams.slug);
  if (formatted.length > 0) {
    quiz = {
      ...quiz,
      questions: formatted,
      questionCount: formatted.length,
    };
  }

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizClient quiz={quiz} />
    </>
  );
}
