import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, Globe, GraduationCap } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

interface HeaderProps {
  districtName: string;
  districtSlug: string;
  primaryColor?: string;
  tagline?: string;
  logoUrl?: string;
}

export function Header({ districtName, districtSlug, primaryColor = "#C03537", tagline = "Community. Innovation. Excellence.", logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center justify-center space-x-8 py-3">
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">HOME</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">OUR DISTRICT</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">OUR TEAM</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">ACADEMICS</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">FOR FAMILIES</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">COMMUNITY</a>
            <a href="#" className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide">RESOURCES</a>
            <a 
              href={`/public/${districtSlug}`} 
              className="text-white hover:opacity-80 transition-colors text-sm font-medium tracking-wide px-3 py-1 rounded"
              style={{ backgroundColor: primaryColor }}
            >
              STRATEGIC PLAN
            </a>
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and School Name */}
            <div className="flex items-center space-x-4">
              {/* District Logo */}
              {logoUrl && (
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                  <ImageWithFallback 
                    src={logoUrl} 
                    alt={`${districtName} Logo`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{districtName}</h1>
                <p className="text-white/90 text-sm font-medium">{tagline}</p>
              </div>
            </div>

            {/* Utility Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                TRANSLATE
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 text-sm"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                SELECT A SCHOOL
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center py-2 text-sm">
            <a href="/" className="text-[#808080] hover:opacity-80 transition-colors">Home</a>
            <span className="mx-2 text-[#808080]">›</span>
            <a href={`/homepage/${districtSlug}`} className="text-[#808080] hover:opacity-80 transition-colors">District Home</a>
            <span className="mx-2 text-[#808080]">›</span>
            <span className="text-[#2C2C2C] font-medium">Strategic Plan</span>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Main Navigation */}
            <nav className="space-y-3">
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">HOME</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">OUR DISTRICT</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">OUR TEAM</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">ACADEMICS</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">FOR FAMILIES</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">COMMUNITY</a>
              <a href="#" className="block text-[#2C2C2C] hover:opacity-80 transition-colors py-2 font-medium">RESOURCES</a>
              <a 
                href={`/public/${districtSlug}`} 
                className="block hover:opacity-80 transition-colors py-2 font-medium"
                style={{ color: primaryColor }}
              >
                STRATEGIC PLAN
              </a>
            </nav>
            
            {/* Utility Buttons */}
            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                Translate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="w-4 h-4 mr-2" />
                Select a School
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}