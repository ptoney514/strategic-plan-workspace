import { useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';

export function HeroSection() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024–25');

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'on', label: 'On Target' },
    { id: 'watch', label: 'Watch' },
    { id: 'off', label: 'Off' }
  ];

  const yearOptions = ['2024–25', '2025–26', '2026–27'];

  return (
    <section className="pt-8 md:pt-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">2024–2027 Strategic Plan</p>
            <h1 className="text-3xl md:text-4xl tracking-tight">Strategic Goals</h1>
            <p className="text-sm text-neutral-600 mt-1">
              A focused snapshot of progress, status, and quick entry into each objective.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}


            {/* Segmented Filter */}


            {/* Year Dropdown */}
            <div className="relative">

              
              {showYearDropdown && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-10">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}