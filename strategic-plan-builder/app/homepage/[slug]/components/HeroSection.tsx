import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText, Target, BarChart3 } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  districtName: string;
  districtSlug: string;
  primaryColor?: string;
  planYears?: string;
  planTagline?: string;
}

export function HeroSection({ 
  districtName, 
  districtSlug, 
  primaryColor = "#C03537",
  planYears = "2021-2026",
  planTagline = "Charting our course for educational excellence through four strategic pillars that guide our commitment to student success"
}: HeroSectionProps) {

  const strategicPlanQuickLinks = [
    {
      icon: FileText,
      title: "What is a Strategic Plan?",
      description: "Learn about our comprehensive planning process",
      href: null,
    },
    {
      icon: Target,
      title: "Goals for 2021-2026",
      description: "Explore our four strategic focus areas",
      href: null,
    },
    {
      icon: BarChart3,
      title: "Strategic Plan Dashboard",
      description: "View progress metrics and accountability",
      href: `/dashboard/${districtSlug}/strategic-objectives`,
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-white to-gray-50 py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C2C2C] mb-6"
          >
            Westside Community Schools
            <span className="block" style={{ color: primaryColor }}>Strategic Plan {planYears}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#808080] max-w-3xl mx-auto mb-12"
          >
            Community. Innovation. Excellence. - {planTagline}
          </motion.p>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto mb-12"
          >
            {strategicPlanQuickLinks.map((link, index) => {
              const Icon = link.icon;
              const ButtonContent = (
                <>
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C03537] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-[#2C2C2C] text-sm mb-1 truncate">
                      {link.title}
                    </h4>
                    <p className="text-xs text-[#808080] leading-tight">
                      {link.description}
                    </p>
                  </div>
                </>
              );

              if (link.href) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="flex-1"
                  >
                    <Link href={link.href} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#C03537] hover:shadow-md transition-all duration-300 group text-left w-full">
                      {ButtonContent}
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#C03537] hover:shadow-md transition-all duration-300 group text-left flex-1"
                >
                  {ButtonContent}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Strategic Plan Wheel Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative"
          >
            <div className="w-full max-w-2xl mx-auto">
              <img 
                src="/strategic-wheel.png" 
                alt={`${districtName} Strategic Plan 2021-2026 - Interactive wheel showing four strategic goals: Student Achievement and Well-Being, Community Collaboration and Partnerships, Supported and Engaged Staff, and Finance Safety and Infrastructure, with Mission and Vision statements`}
                className="w-full h-auto object-contain shadow-lg rounded-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">Explore Our Strategic Plan</h3>
            <p className="text-[#808080] leading-relaxed mb-6">
              Discover how our four strategic goals work together to create an innovative educational experience that serves the unique needs of all learners in our community.
            </p>
            <Button 
              variant="outline" 
              className="border-[#C03537] text-[#C03537] hover:bg-[#C03537] hover:text-white rounded-lg"
            >
              Download the Strategic Plan 2021-2026 document <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}