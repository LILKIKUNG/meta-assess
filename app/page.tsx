import { Background } from "@/components/home/background";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col bg-slate-950">
      <Background />
      <Hero />
      <Features />

      <footer className="relative z-10 py-8 text-center text-slate-600 text-sm border-t border-slate-900">
        &copy; {new Date().getFullYear()} Enterprise Corp. Assessment Platform.
      </footer>
    </main>
  );
}

