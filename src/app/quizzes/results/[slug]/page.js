import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { getQuizBySlug, quizzes } from '@/data/quizzes';
import QuizResultsClient from './QuizResultsClient';

export function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export function generateMetadata({ params }) {
  const quiz = getQuizBySlug(params.slug);
  return {
    title: quiz ? `Results: ${quiz.title} — A Health Place` : 'Quiz Results',
    description: 'View your personalised wellness quiz results and health insights.',
  };
}

export default async function QuizResultsPage({ params }) {
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?callbackUrl=/quizzes/results/${params.slug}`);
  }

  const quiz = getQuizBySlug(params.slug);
  if (!quiz) notFound();

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizResultsClient quiz={quiz} user={session.user} />
      <Footer />
    </>
  );
}
