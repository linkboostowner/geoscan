'use client';

import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';

export default function ThankYou() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'pro' или 'onetime'

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-bold">
          {type === 'pro' ? 'Welcome to PRO!' : 'Payment Successful!'}
        </h1>
        
        <p className="text-slate-400">
          {type === 'pro'
            ? 'Your PRO subscription is now active. You have unlimited scans, full history, and access to all AI features.'
            : 'Your AI-generated files are ready. You can download them anytime from your history.'}
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <a
            href="/"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {type === 'pro' ? 'Start Scanning' : 'Go to Dashboard'} <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/blog"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Read our guides on improving your GEO Score →
          </a>
        </div>
      </div>
    </main>
  );
}