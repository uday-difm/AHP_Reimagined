import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import QuizDashboardClient from './QuizDashboardClient';

export const metadata = {
  title: 'My Quiz Dashboard — A Health Place',
  description: 'View your wellness quiz history, scores, and personalised health insights.',
};

export default async function QuizDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/quizzes/dashboard');
  }

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizDashboardClient user={session.user} />
      <Footer />
    </>
  );
}
