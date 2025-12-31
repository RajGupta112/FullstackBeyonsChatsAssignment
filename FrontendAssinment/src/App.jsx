import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { RefreshCcw, CheckCircle, ExternalLink, Sparkles, LayoutDashboard } from 'lucide-react';

// Ensure the URL is clean (no trailing slash)
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

export default function App() {
  const [articles, setArticles] = useState([]); // Initialized as Array
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      // 1. CHANGE: Added /api/articles to the endpoint
      const res = await axios.get(`${API_BASE}/api/articles`);
      
      // 2. SAFETY CHECK: Ensure data is an array before setting state
      const data = Array.isArray(res.data) ? res.data : [];
      
      setArticles(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (err) { 
      console.error("Backend unreachable", err); 
      setArticles([]); // Reset to empty array on error to prevent crash
    }
  };

  const handleAutomate = async () => {
    setLoading(true);
    try {
      // 3. CHANGE: Ensure this matches your backend POST route
      await axios.post(`${API_BASE}/api/articles/automate`); 
      await fetchArticles();
    } catch (err) { 
      console.error(err);
      alert("Automation failed!"); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-8">
            <LayoutDashboard size={28} />
            <h1 className="text-xl font-black tracking-tight">Blog Automate</h1>
          </div>
          <button 
            onClick={handleAutomate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'AI Running...' : 'Sync AI Content'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {/* 4. SAFETY CHECK: Check if articles is an array and has length */}
          {Array.isArray(articles) && articles.length > 0 ? (
            articles.map(article => (
              <div 
                key={article.id} 
                onClick={() => setSelected(article)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selected?.id === article.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <p className="text-sm font-semibold truncate">{article.title || "Untitled Article"}</p>
                {article.contentUpdated && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle size={10} /> ENHANCED
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 text-xs mt-10">No articles available</p>
          )}
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800">{selected.title}</h2>
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-medium">
                Original Source <ExternalLink size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Draft */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Draft</span>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selected.contentOriginal || "No original content available."}
                </p>
              </div>

              {/* AI Optimized */}
              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-50 relative overflow-hidden h-fit">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-600"><Sparkles size={40} /></div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Optimized</span>
                <div className="mt-4 prose prose-indigo max-w-none prose-sm">
                  <ReactMarkdown>
                    {selected.contentUpdated || "_Content enhancement in progress... Click Sync AI Content to start._"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic">
            Select an article from the sidebar to begin comparison.
          </div>
        )}
      </main>
    </div>
  );
}