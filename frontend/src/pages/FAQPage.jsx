import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, HelpCircle } from 'lucide-react';
import { faqService } from '../services/api.service.js';
import Accordion from '../components/ui/Accordion.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    faqService.getAll()
      .then(res => setFaqs(res.data?.faqs || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f =>
    !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const accordionItems = (list) => list.map(f => ({ title: f.question, content: f.answer }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-brand-cream/80 text-lg">Find answers to common questions about our products</p>
          <nav className="mt-4 text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">FAQ</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14">
        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <HelpCircle className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{search ? 'No results found.' : 'No FAQs available yet.'}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                {Object.keys(grouped).length > 1 && (
                  <h2 className="text-lg font-bold text-brand-dark mb-4 pb-2 border-b border-brand/20">{category}</h2>
                )}
                <Accordion items={accordionItems(items)} />
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-14 bg-gradient-to-r from-brand-dark to-brand rounded-2xl p-8 text-center text-white">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 text-brand-cream" />
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-brand-cream/80 text-sm mb-5">Our team is happy to help you personally.</p>
          <a href="https://wa.me/9779801234567" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-dark font-semibold rounded-full hover:bg-brand-cream transition-colors text-sm">
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
