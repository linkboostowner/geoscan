'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, TrendingUp, TrendingDown, Activity, ArrowRight, Plus, Trash2, Calendar, Key } from 'lucide-react';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFreq, setNewFreq] = useState('weekly');
  const [gscMetrics, setGscMetrics] = useState(null);
  const [yandexMetrics, setYandexMetrics] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchHistory(session.user.id);
        fetchScheduled(session.user.id);
        fetchGscMetrics();
        fetchYandexMetrics();
      }
    });
  }, []);

  const fetchHistory = async (userId) => {
    const { data } = await supabase.from('scans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (data) setHistory(data);
  };

  const fetchScheduled = async (userId) => {
    const { data } = await supabase.from('scheduled_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setScheduled(data);
  };

  const fetchGscMetrics = async () => {
    try {
      const res = await fetch('/api/gsc-data');
      if (res.ok) {
        const data = await res.json();
        if (data.clicks !== undefined) setGscMetrics(data);
      }
    } catch {}
  };

  const fetchYandexMetrics = async () => {
    try {
      const res = await fetch('/api/yandex-webmaster');
      if (res.ok) {
        const data = await res.json();
        if (data.clicks !== undefined) setYandexMetrics(data);
      }
    } catch {}
  };

  const handleAddSchedule = async () => {
    if (!newUrl) return;
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl, email: newEmail, frequency: newFreq }),
    });
    if (res.ok) {
      setNewUrl('');
      setNewEmail('');
      fetchScheduled(session.user.id);
    } else {
      alert('Failed to add schedule');
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('scheduled_reports').delete().eq('id', id);
    fetchScheduled(session.user.id);
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
  const trend = latestScan && previousScan ? latestScan.total_score - previousScan.total_score : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <a href="/gsc-setup" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors flex items-center gap-1"><Key className="w-4 h-4" /> GSC Setup</a>
            <a href="/yandex-setup" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors flex items-center gap-1"><Key className="w-4 h-4" /> Yandex Setup</a>
            <a href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
              Back to Scanner
            </a>
          </div>
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
              {trend > 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : trend < 0 ? <TrendingDown className="w-5 h-5 text-red-400" /> : <Activity className="w-5 h-5 text-amber-400" />}
              <p className={`text-3xl font-bold ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-amber-400'}`}>{trend > 0 ? '+' : ''}{trend}</p>
            </div>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Scheduled Reports</p>
            <p className="text-3xl font-bold text-emerald-400">{scheduled.length}</p>
          </div>
        </div>

        {/* Search Console Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gscMetrics ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Google Search Console (30 days)</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-sm text-slate-400">Clicks</p><p className="text-3xl font-bold text-blue-400">{gscMetrics.clicks}</p></div>
                <div><p className="text-sm text-slate-400">Impressions</p><p className="text-3xl font-bold text-blue-400">{gscMetrics.impressions}</p></div>
                <div><p className="text-sm text-slate-400">Avg. Position</p><p className="text-3xl font-bold text-blue-400">{gscMetrics.avgPosition}</p></div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <p className="text-slate-400">Google Search Console not configured.</p>
              <a href="/gsc-setup" className="text-emerald-400 hover:underline">Set up GSC</a>
            </div>
          )}
          
          {yandexMetrics ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Yandex Webmaster (30 days)</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-sm text-slate-400">Clicks</p><p className="text-3xl font-bold text-red-400">{yandexMetrics.clicks}</p></div>
                <div><p className="text-sm text-slate-400">Impressions</p><p className="text-3xl font-bold text-red-400">{yandexMetrics.impressions}</p></div>
                <div><p className="text-sm text-slate-400">Avg. Position</p><p className="text-3xl font-bold text-red-400">{yandexMetrics.avgPosition}</p></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">{yandexMetrics.siteUrl}</p>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <p className="text-slate-400">Yandex Webmaster not configured.</p>
              <a href="/yandex-setup" className="text-emerald-400 hover:underline">Set up Yandex</a>
            </div>
          )}
        </div>

        {/* Schedule Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-400" /> Schedule a Report</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <input type="url" placeholder="https://example.com" className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            <input type="email" placeholder="you@example.com" className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <select className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" value={newFreq} onChange={(e) => setNewFreq(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button onClick={handleAddSchedule} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>

        {/* Scheduled Reports List */}
        {scheduled.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Scheduled Reports</h2>
            <div className="space-y-2">
              {scheduled.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{item.url}</p>
                    <p className="text-xs text-slate-400">{item.frequency} · {item.email || 'No email'}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

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