'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchHistory(session.user.id);
    });
  }, []);

  const fetchHistory = async (userId) => {
    const { data } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-slate-600 mx-auto" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400">Please log in to view your dashboard.</p>
          <a href="/" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  const latestScan = history[0];
  const previousScan = history[1];
  const trend = latestScan && previousScan
    ? latestScan.total_score - previousScan.total_score
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <a href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
            Back to Scanner
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Total Scans</p>
            <p className="text-3xl font-bold text-emerald-400">{history.length}</p>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Latest GEO Score</p>
            <p className="text-3xl font-bold text-emerald-400">
              {latestScan ? `${latestScan.total_score}/100` : 'N/A'}
            </p>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Trend</p>
            <div className="flex items-center justify-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : trend < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-400" />
              ) : (
                <Activity className="w-5 h-5 text-amber-400" />
              )}
              <p className={`text-3xl font-bold ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-amber-400'}`}>
                {trend > 0 ? '+' : ''}{trend}
              </p>
            </div>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Tracked Sites</p>
            <p className="text-3xl font-bold text-emerald-400">
              {[...new Set(history.map(s => s.url))].length}
            </p>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 px-3 text-slate-400">URL</th>
                  <th className="py-2 px-3 text-slate-400">Score</th>
                  <th className="py-2 px-3 text-slate-400">Date</th>
                  <th className="py-2 px-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(scan => (
                  <tr key={scan.id} className="border-b border-slate-700">
                    <td className="py-2 px-3 truncate max-w-xs">{scan.url}</td>
                    <td className="py-2 px-3">
                      <span className={`font-bold ${scan.total_score >= 70 ? 'text-emerald-400' : scan.total_score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {scan.total_score}/100
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{new Date(scan.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <a href={`/?url=${encodeURIComponent(scan.url)}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                        Re-scan <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}