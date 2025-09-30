import { Grid3X3, Share2, Download } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-neutral-200/70 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
              <Grid3X3 className="h-4 w-4" />
            </span>
            <span className="text-lg tracking-tight">District Insights</span>
          </a>
          <div className="hidden md:flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}