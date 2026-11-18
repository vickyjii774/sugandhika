import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Accordion({ items, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState([]);

  const toggle = (index) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        return (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-brand-cream/50 transition-colors"
            >
              <span className="font-semibold text-gray-800 pr-4">{item.question || item.title}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-brand shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed bg-white border-t border-gray-100 text-sm">
                {item.answer || item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
