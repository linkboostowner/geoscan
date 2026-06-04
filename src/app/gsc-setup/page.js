'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Key, Link, Save } from 'lucide-react';

export default function GscSetup() {
  const [session, setSession] = useState(null);
  const [propertyUrl, setPropertyUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');

  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const handleSave = async () => {
    if (!propertyUrl || !apiKey) return;
    const { error } = await supabase.from('gsc_properties').insert({
      user_id: session.user.id,
      property_url: propertyUrl,
      api_key: apiKey,
    });
    if (error) {
      setMessage('Error saving. Please try again.');
    } else {
      setMessage('Settings saved successfully!');
      setPropertyUrl('');
      setApiKey('');
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Key className="w-16 h-16 text-slate-600 mx-auto" />
          <h1 className="text-2xl font-bold">GSC Setup</h1>
          <p className="text-slate-400">Please log in to configure Google Search Console.</p>
          <a href="/" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Key className="w-8 h-8 text-emerald-400" /> GSC Setup</h1>
        <p className="text-slate-400">Enter your Google Search Console API key and property URL to unlock traffic insights.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Property URL</label>
            <input type="text" placeholder="https://example.com" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-400" value={propertyUrl} onChange={(e) => setPropertyUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">API Key</label>
            <input type="text" placeholder="AIza..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-400" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>
          <button onClick={handleSave} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
          {message && <p className="text-center text-sm text-emerald-400">{message}</p>}
        </div>
        <div className="text-center pt-8 border-t border-slate-800">
          <a href="/dashboard" className="text-emerald-400 hover:underline inline-flex items-center gap-1"><Link className="w-4 h-4" /> Back to Dashboard</a>
        </div>
      </div>
    </main>
  );
}