import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireFrontendAuth } from "@/lib/requireFrontendAuth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import QuizDashboardClient from "./QuizDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Quiz Dashboard — A Health Place",
  description: "View your wellness quiz history, scores, and personalised health insights.",
};

export default async function QuizDashboardPage() {
  const frontendUser = await requireFrontendAuth();
  const adminSession = await getServerSession(authOptions);

  const user = frontendUser || adminSession?.user || null;

  if (!user) {
    redirect("/login?callbackUrl=/quizzes/dashboard");
  }

  return (
    <>
      <ScrollReveal />
      <Header />
      <QuizDashboardClient initialUser={user} />
      <Footer />
    </>
  );
}
