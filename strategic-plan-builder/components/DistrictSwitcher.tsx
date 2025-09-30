'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { dbService } from '@/lib/db-service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface District {
  id: string;
  name: string;
  slug: string;
}

interface DistrictSwitcherProps {
  currentDistrictSlug: string;
  currentDistrictName?: string;
}

export default function DistrictSwitcher({ currentDistrictSlug, currentDistrictName }: DistrictSwitcherProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      const allDistricts = await dbService.getAllDistricts();
      if (allDistricts) {
        setDistricts(allDistricts);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (newSlug: string) => {
    // Replace the current district slug in the URL with the new one
    const newPath = pathname.replace(
      `/dashboard/${currentDistrictSlug}`,
      `/dashboard/${newSlug}`
    ).replace(
      `/districts/${currentDistrictSlug}`,
      `/districts/${newSlug}`
    ).replace(
      `/homepage/${currentDistrictSlug}`,
      `/homepage/${newSlug}`
    );
    
    router.push(newPath);
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="min-w-[180px]">
        <Building2 className="w-4 h-4 mr-2" />
        <span className="truncate">Loading...</span>
      </Button>
    );
  }

  const currentDistrict = districts.find(d => d.slug === currentDistrictSlug);
  const displayName = currentDistrict?.name || currentDistrictName || currentDistrictSlug;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[180px] max-w-[250px]">
          <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{displayName}</span>
          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        {districts.length > 0 ? (
          districts.map((district) => (
            <DropdownMenuItem
              key={district.id}
              onClick={() => handleDistrictChange(district.slug)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{district.name}</span>
                {district.slug === currentDistrictSlug && (
                  <Check className="w-4 h-4 ml-2 text-green-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            No districts available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}