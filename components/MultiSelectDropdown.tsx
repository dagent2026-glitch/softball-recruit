'use client';
import { useEffect, useRef, useState } from 'react';

// A dropdown that behaves like the <select> filters around it (same
// trigger size/border) but lets more than one option be checked at once —
// used for the camp-type filter, where "Prospect or Elite" is a common
// thing to want in one search.
export default function MultiSelectDropdown({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const buttonLabel = selected.length === 0
    ? `All ${label}s`
    : selected.length === 1
      ? selected[0]
      : `${selected.length} ${label}s`;

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter(o => o !== option) : [...selected, option]);
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`border rounded-lg px-3 py-2 text-sm bg-white flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#d9f99d] ${
          selected.length > 0 ? 'border-[#84cc16] text-[#18181b] font-medium' : 'border-gray-300 text-gray-700'
        }`}>
        {buttonLabel}
        <span className="text-gray-400 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.map(option => (
            <label key={option} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)}
                className="w-4 h-4 accent-[#18181b]" />
              {option}
            </label>
          ))}
          {selected.length > 0 && (
            <button type="button" onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 mt-1">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
