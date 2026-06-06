export default function ApiDocs() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-slate-400">Use our API to run bulk GEO scans for your clients. You'll need an API key, which you can generate in your <a href="/api-keys" className="text-emerald-400 hover:underline">API Keys</a> page.</p>
        
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Bulk Scan Endpoint</h2>
            <p className="text-sm text-slate-400 mb-4">POST /api/v1/bulk-scan</p>
            <p className="text-sm text-slate-300 mb-4">Scans up to 100 URLs in a single request. Requires API key in the header.</p>
            
            <h3 className="text-lg font-semibold mb-2">Headers</h3>
            <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto mb-4">
{`{
  "Content-Type": "application/json",
  "x-api-key": "YOUR_API_KEY"
}`}
            </pre>
            
            <h3 className="text-lg font-semibold mb-2">Request Body</h3>
            <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto mb-4">
{`{
  "urls": ["https://example.com", "https://test.com"]
}`}
            </pre>
            
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
{`{
  "results": {
    "https://example.com": {
      "totalScore": 78,
      "robots": { "score": 25, "status": "good", "details": "..." },
      "llms": { "score": 20, "status": "good", "details": "..." },
      ...
    },
    "https://test.com": {
      "totalScore": 45,
      ...
    }
  }
}`}
            </pre>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Rate Limits</h2>
            <p className="text-sm text-slate-300">Each API key has a limit of 1,000 requests per month. Contact us for higher limits.</p>
          </div>
        </div>
      </div>
    </main>
  );
}