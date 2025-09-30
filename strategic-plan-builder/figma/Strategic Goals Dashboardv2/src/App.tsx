import { Header } from './components/header';
import { HeroSection } from './components/hero-section';
import { StatisticsCards } from './components/statistics-cards';
import { ObjectivesGrid } from './components/objectives-grid';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />
      
      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 pb-10">
        <HeroSection />
        
        <div className="mt-6">
          <StatisticsCards />
        </div>
        
        <ObjectivesGrid />
      </main>
    </div>
  );
}