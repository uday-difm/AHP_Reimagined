import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import { getQuizBySlug, quizzes } from '@/data/quizzes';
import QuizClient from './QuizClient';

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
  const quiz = getQuizBySlug(resolvedParams.slug);
  if (!quiz) notFound();

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizClient quiz={quiz} />
    </>
  );
}
