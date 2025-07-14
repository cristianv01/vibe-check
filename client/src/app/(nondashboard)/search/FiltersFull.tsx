import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiltersState } from "@/state";
import { useAppSelector } from "@/state/redux";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import { cleanParams } from "@/lib/utils";

const FiltersFull = () => {
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const [localFilters, setLocalFilters] = useState(filters);

  const [searchInput, setSearchInput] = useState(filters.location);

  //Functions
  const updateUrl = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    //update the search params
    const updatedParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedParams.toString()}`);
  });


  
  const handleLocationSearch = async () => {
    if (!localFilters.location?.trim()) return;
    
    try {
      console.log('Searching for location:', localFilters.location);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localFilters.location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&fuzzyMatch=true&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Mapbox response:', data);

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const locationName = data.features[0].place_name;
        
        console.log('Found location:', locationName, 'at coordinates:', [lng, lat]);
        
        const newFilters = {
          ...localFilters,
          location: locationName,
          coordinates: [lng, lat] as [number, number]
        };
        
        setLocalFilters(newFilters);
        updateUrl(newFilters);
      } else {
        console.log('No location found for:', localFilters.location);
        // Still update the location name even if no coordinates found
        const newFilters = {
          ...localFilters,
          coordinates: null
        };
        setLocalFilters(newFilters);
        updateUrl(newFilters);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      // Still update the location name even if API fails
      const newFilters = {
        ...localFilters,
        coordinates: null
      };
      setLocalFilters(newFilters);
      updateUrl(newFilters);
    }
  }

  return (
    <div className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
      <div className="flex flex-col space-y-6">
        <div>
            <h4 className="font-bold mb-2">Location</h4>
          <div className="flex items-center">
            <Input
              placeholder="Search location"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
            />
            <Button
              onClick={handleLocationSearch}
              className={`rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
              border hover:bg-primary-700 hover:text-primary-50`}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersFull;
