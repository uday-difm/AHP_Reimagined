import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import { getQuizBySlug, quizzes } from '@/data/quizzes';
import QuizClient from './QuizClient';
import { getQuizQuestionsByCategory } from '@/lib/quizService';
import prisma from '@/lib/prisma';
import RecentViewTracker from '@/components/RecentViewTracker';
// Enable dynamic on-demand page generation for paths not generated at build-time
export const dynamicParams = true;


// Static params for build-time generation
export function generateStaticParams() {
  return quizzes.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  let quiz = getQuizBySlug(resolvedParams.slug);

  if (!quiz) {
    // Check database for dynamically added quiz type
    const dbQuiz = await prisma.quizType.findFirst({
      where: { slug: resolvedParams.slug, isActive: true }
    });
    if (dbQuiz) {
      quiz = {
        title: dbQuiz.title,
        description: dbQuiz.description || dbQuiz.subtitle || "",
      };
    }
  }

  if (!quiz) return {};
  return {
    title: `${quiz.title} — A Health Place Quizzes`,
    description: quiz.description,
  };
}

export default async function QuizPage({ params }) {
  const resolvedParams = await params;
  let quiz = getQuizBySlug(resolvedParams.slug);

  if (!quiz) {
    // Attempt to load dynamically from database QuizType model
    const dbQuiz = await prisma.quizType.findFirst({
      where: { slug: resolvedParams.slug, isActive: true }
    });
    if (dbQuiz) {
      quiz = {
        slug: dbQuiz.slug,
        title: dbQuiz.title,
        description: dbQuiz.description || dbQuiz.subtitle || "",
        estimatedMinutes: dbQuiz.estimatedMinutes || 5,
        difficulty: dbQuiz.difficulty || "Intermediate",
        category: dbQuiz.category || dbQuiz.slug,
        categoryColor: dbQuiz.categoryColor || "#0f7c85",
        icon: dbQuiz.icon || "📋",
        imageUrl: dbQuiz.imageUrl || null,
        questions: []
      };
    }
  }

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
      <RecentViewTracker
        item={{
          id: quiz.slug,
          title: quiz.title,
          image: quiz.image || "/images/q2.png",
          type: "Quiz",
          url: `/quizzes/${quiz.slug}`
        }}
      />
      <QuizClient quiz={quiz} />
    </>
  );
}
