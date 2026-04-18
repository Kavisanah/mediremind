import { useState } from 'react';

export default function MedicineAiSearch({ initialMedicineName, onClose }) {
  const [query, setQuery] = useState(initialMedicineName || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const apikey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apikey) {
        throw new Error("Missing VITE_GROQ_API_KEY. Please add it to your .env file.");
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apikey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a medical information assistant. When given a medicine name, respond with a structured summary covering: what it is used for, common dosages, how to take it (with/without food etc), common side effects, important warnings, and drug interactions to be aware of. Keep the response clear and concise. Always end with: "⚠️ Always consult your doctor or pharmacist before starting, stopping or changing any medicine." Format using short paragraphs with emoji section headers.'
            },
            { role: 'user', content: `Tell me about the medicine: ${query}` }
          ],
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to fetch information from AI.");
      }

      const data = await response.json();
      setResult(data.choices[0].message.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Basic markdown-like renderer to handle bolding and headers without external libraries
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      let content = line.trim();
      if (!content) return <div key={i} className="h-3" />;
      
      // Headers
      if (content.startsWith('###')) {
        return <h4 key={i} className="text-lg font-bold mt-4 mb-2 text-slate-200">{content.replace(/#/g, '').trim()}</h4>;
      }
      if (content.startsWith('##')) {
        return <h3 key={i} className="text-xl font-bold mt-5 mb-2 text-slate-50 border-b border-slate-800 pb-1">{content.replace(/#/g, '').trim()}</h3>;
      }
      if (content.startsWith('#')) {
        return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-slate-50">{content.replace(/#/g, '').trim()}</h2>;
      }

      // Handle bold basic parsing inside line
      const boldParts = content.split(/\*\*(.*?)\*\*/g);
      const formattedLine = boldParts.map((part, index) => 
        index % 2 === 1 ? <strong key={index} className="text-slate-50 tracking-wide font-semibold">{part}</strong> : part
      );

      return <p key={i} className="mb-2 text-slate-300 leading-relaxed text-[15px]">{formattedLine}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Modal Container */}
      <div className="bg-slate-800/80 rounded-[2rem] shadow-card-lg w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up border border-white/50 relative">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-primary-50 via-white to-white flex-shrink-0 border-b border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-slate-800/80 rounded-full text-slate-300 hover:text-slate-300 hover:bg-slate-900 transition-all shadow-sm border border-slate-800 font-bold"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl filter drop-shadow-sm">🤖</span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-200 tracking-tight">
              AI Medicine Guide
            </h2>
          </div>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-sans ml-11">
            Get instant, structured insights about any medication.
          </p>
          
          <div className="mt-6 flex gap-3">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Lisinopril, Metformin..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-medium"
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 text-white px-7 py-3.5 rounded-2xl font-bold shadow-md transition-all flex items-center gap-2 tracking-wide"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-900/30">
          {loading && (
            <div className="space-y-4 animate-pulse pt-2">
              <div className="h-5 bg-stone-200 rounded-full w-1/3 mb-6"></div>
              <div className="h-4 bg-stone-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-stone-100 rounded-full w-full"></div>
              <div className="h-4 bg-stone-100 rounded-full w-5/6"></div>
              <div className="h-5 bg-stone-200 rounded-full w-1/4 mt-8 mb-4"></div>
              <div className="h-4 bg-stone-100 rounded-full w-full"></div>
              <div className="h-4 bg-stone-100 rounded-full w-4/6"></div>
            </div>
          )}

          {error && (
            <div className="p-5 bg-coral-950/40 border border-coral-800/50 rounded-2xl text-coral-300 text-sm flex items-start gap-4 animate-fade-in shadow-sm">
              <span className="text-2xl drop-shadow-sm">⚠️</span>
              <div>
                <strong className="block font-bold text-base mb-1">Error fetching information</strong>
                {error}
              </div>
            </div>
          )}

          {result && !loading && (
             <div className="animate-slide-up font-sans">
              {renderText(result)}
            </div>
          )}

          {!loading && !error && !result && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-12 animate-fade-in">
              <span className="text-6xl mb-5 opacity-40 filter grayscale">💊</span>
              <p className="font-medium text-slate-300">Enter a medicine name and click search to see details.</p>
              <p className="text-xs mt-2 opacity-60">Powered by Anthropic Claude</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




