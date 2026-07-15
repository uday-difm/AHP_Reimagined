import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function IssueNotFound() {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-between">
      <Header />
      <main className="container flex-grow flex items-center justify-center py-20 px-6 font-sans">
        <div className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-slate-100 text-center max-w-lg mx-auto space-y-6">
          <div className="text-7xl font-black text-accent/80 mb-2 tracking-tighter leading-none">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight">
            Issue Not Found
          </h1>
          <p className="text-secondary text-sm sm:text-base leading-relaxed">
            This magazine issue may have been unpublished or the link is incorrect.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href="/publication"
              className="bg-primary hover:bg-accent text-white rounded-full font-bold uppercase tracking-wider text-[11px] px-8 py-4 transition-all shadow-md text-center"
            >
              Browse All Issues
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
