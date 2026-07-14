import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import { getQuizBySlug, quizzes } from '@/data/quizzes';
import QuizClient from './QuizClient';
import prisma from '@/lib/prisma';

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

  // Load dynamic questions from DB matching this quiz slug/category
  try {
    const dbQuizzes = await prisma.quiz.findMany({
      where: { category: resolvedParams.slug },
      orderBy: { id: 'asc' },
    });
      if (dbQuizzes && dbQuizzes.length > 0) {
        const formatted = dbQuizzes.map((q) => {
          let parsedOptions = [];
          try {
            parsedOptions = JSON.parse(q.options);
            if (!Array.isArray(parsedOptions)) {
              parsedOptions = q.options.split(',').map((o) => o.trim());
            }
          } catch {
            parsedOptions = q.options.split(',').map((o) => o.trim());
          }

          let corrAnswerIndex = 0;
          if (!isNaN(Number(q.correctAnswer))) {
            corrAnswerIndex = Number(q.correctAnswer);
          } else {
            const foundIdx = parsedOptions.findIndex(
              (o) => o.toLowerCase() === q.correctAnswer.toLowerCase()
            );
            if (foundIdx !== -1) {
              corrAnswerIndex = foundIdx;
            }
          }

          return {
            id: q.id,
            text: q.question,
            options: parsedOptions.map((opt, idx) => ({
              label: opt,
              score: idx === corrAnswerIndex ? 3 : 0,
            })),
            correctAnswer: corrAnswerIndex,
            explanation: q.explanation || '',
          };
        });

        // Clone to avoid modifying static import references directly
        quiz = {
          ...quiz,
          questions: formatted,
          questionCount: formatted.length,
        };
      }
    } catch (err) {
      console.error('Failed to load db quizzes in server component:', err);
    }

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizClient quiz={quiz} />
    </>
  );
}
