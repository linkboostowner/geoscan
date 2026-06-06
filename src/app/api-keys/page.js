'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Key, Copy, Check } from 'lucide-react';

export default function ApiKeys() {
  const [session, setSession] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const handleGenerate = async () => {
    if (!apiKey) return;
    const { error } = await supabase.from('api_keys').insert({
      user_id: session.user.id,
      api_key: apiKey,
    });
    if (error) {
      alert('Error generating key');
    } else {
      setGenerated(apiKey);
      setApiKey('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Key className="w-16 h-16 text-slate-600 mx-auto" />
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-slate-400">Please log in to manage your API keys.</p>
          <a href="/" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">Go to Login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Key className="w-8 h-8 text-emerald-400" /> API Keys</h1>
        <p className="text-slate-400">Generate an API key for bulk scanning. Use it with our API endpoint.</p>
        <div className="space-y-4">
          <input type="text" placeholder="Enter a key name (e.g. my-api-key)" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-400" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <button onClick={handleGenerate} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">Generate Key</button>
          {generated && (
            <div className="p-3 bg-slate-900 rounded-lg flex justify-between items-center">
              <code className="text-sm text-emerald-400">{generated}</code>
              <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}