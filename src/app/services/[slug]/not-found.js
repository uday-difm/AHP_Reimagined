import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col justify-between">
      <Header />
      <main className="w-full flex-grow pt-[160px] pb-20 flex items-center justify-center">
        <div className="container max-w-2xl mx-auto text-center px-4">
          <div className="bg-white rounded-[32px] p-10 md:p-14 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Search size={32} />
            </div>
            
            <h1 className="font-heading font-extrabold text-[32px] md:text-[40px] text-primary tracking-tight mb-4">
              Service Not Found
            </h1>
            
            <p className="text-[15px] md:text-[16px] text-secondary leading-relaxed mb-8 max-w-md mx-auto">
              We couldn't find the service package you're looking for. It may have been moved, set to private, or no longer exists.
            </p>
            
            <Link href="/services">
              <Button variant="primary" className="!bg-[#0f4c4e] hover:!bg-[#093031] !text-sm !py-3.5 px-8">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
