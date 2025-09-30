'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { StrategicPlanOverview } from "./components/StrategicPlanOverview";
import { MissionVisionValues } from "./components/MissionVisionValues";
import { Footer } from "./components/Footer";

export default function DistrictHomepage() {
  const params = useParams();
  const districtSlug = params.slug as string;
  
  const [district, setDistrict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Default configuration - this will be static for now
  const [config] = useState({
    primaryColor: "#C03537",
    tagline: "Community. Innovation. Excellence.",
    planYears: "2021-2026",
    planTagline: "Charting our course for educational excellence through strategic pillars that guide our commitment to student success",
    mission: "To ensure academic excellence and serve the unique needs of all learners through innovation, personalization, and community engagement.",
    vision: "We will relentlessly pursue innovative educational ideals and promise to personalize student learning for every student. We invite the challenge of developing a community of learners who embrace a broader, richer definition of success.",
    values: [
      "Student-first Culture",
      "Academic Excellence", 
      "Belonging for All",
      "Financial Stability and Efficiency",
      "Leaders in Innovation"
    ],
    contact: {
      email: "info@district.edu",
      phone: "(555) 123-4567",
      address: "123 Education Way\nLearning City, State 12345"
    }
  });

  useEffect(() => {
    loadDistrict();
  }, [districtSlug]);

  const loadDistrict = async () => {
    try {
      const response = await fetch(`/api/districts/${districtSlug}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load district');
      }
      
      setDistrict(data);
    } catch (error) {
      console.error('Error loading district:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">District not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        districtName={district.name}
        districtSlug={districtSlug}
        primaryColor={config.primaryColor}
        tagline={config.tagline}
        logoUrl={district.logo_url}
      />
      
      <main>
        <HeroSection 
          districtName={district.name}
          districtSlug={districtSlug}
          primaryColor={config.primaryColor}
          planYears={config.planYears}
          planTagline={config.planTagline}
        />
        
        <StrategicPlanOverview 
          primaryColor={config.primaryColor}
          planYears={config.planYears}
          numGoals={4}
        />
        
        <MissionVisionValues 
          primaryColor={config.primaryColor}
          mission={config.mission}
          vision={config.vision}
          values={config.values}
        />
        
        {/* Placeholder for additional sections that can be added later */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-[#2C2C2C] mb-4">
              Strategic Goals & Implementation
            </h2>
            <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-8">
              Detailed strategic goals with specific strategies and measurable outcomes are being developed.
            </p>
            <a 
              href={`/public/${districtSlug}`}
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: config.primaryColor }}
            >
              View Strategic Dashboard →
            </a>
          </div>
        </section>
      </main>
      
      <Footer 
        districtName={district.name}
        districtSlug={districtSlug}
        primaryColor={config.primaryColor}
        contact={config.contact}
      />
    </div>
  );
}