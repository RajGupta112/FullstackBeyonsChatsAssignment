import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { RefreshCcw, CheckCircle, ExternalLink, Sparkles, LayoutDashboard } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export default function App() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(API_BASE);
      setArticles(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
    } catch (err) { console.error("Backend unreachable", err); }
  };

  const handleAutomate = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/automate`);
      await fetchArticles();
    } catch (err) { alert("Automation failed!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR - Styled with Tailwind v4 */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 text-brand-primary mb-8">
            <LayoutDashboard size={28} />
            <h1 className="text-xl font-black tracking-tight">Blog Automate</h1>
          </div>
          <button 
            onClick={handleAutomate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold bg-brand-primary hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'AI Running...' : 'Sync AI Content'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {articles.map(article => (
            <div 
              key={article.id} 
              onClick={() => setSelected(article)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selected?.id === article.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <p className="text-sm font-semibold truncate">{article.title}</p>
              {article.contentUpdated && (
                <p className="text-[10px] text-brand-secondary font-bold mt-1 flex items-center gap-1">
                  <CheckCircle size={10} /> ENHANCED
                </p>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800">{selected.title}</h2>
              <a href={selected.sourceUrl} target="_blank" className="text-brand-primary hover:underline flex items-center gap-1 text-sm">
                Original <ExternalLink size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Draft</span>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selected.contentOriginal}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={40} /></div>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">AI Optimized</span>
                <div className="mt-4 prose prose-slate max-w-none">
                  <ReactMarkdown>{selected.contentUpdated || "_Processing required..._"}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic">Select an article to begin.</div>
        )}
      </main>
    </div>
  );
}