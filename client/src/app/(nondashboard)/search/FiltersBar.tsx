import { useDispatch } from 'react-redux';
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/state/redux';
import { FiltersState, toggleFiltersFullOpen, setFilters, setViewMode } from '@/state';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/button';
import { cn, cleanParams } from '@/lib/utils';
import { Filter, Grid, List, Search} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const FiltersBar = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
    
    const viewMode = useAppSelector((state) => state.global.viewMode);
    const [searchInput, setSearchInput] = useState(filters.location);
    

    //Dummy tags for testing, replace with tags from DB
    const tags = ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"];
    const updateUrl = debounce((newFilters: FiltersState) => {
      const cleanFilters = cleanParams(newFilters);
      //update the search params
      const updatedParams = new URLSearchParams();
      
      Object.entries(cleanFilters).forEach(([key, value]) =>{
        updatedParams.set(key, Array.isArray(value) ? value.join(",") : value.toString())
      });

      router.push(`${pathname}?${updatedParams.toString()}`)
    });    
    const handleFilterChange = (
        key: string,
        value: string | string[],
    ) => {
        const newValue = value;

        if (key === "tags"){
            // TODO: Implement tag filtering logic
            // For now, just use the value as is
        }

        const newFilters = {...filters, [key]: newValue};
        dispatch(setFilters(newFilters));
        updateUrl(newFilters)
    }

    const handleLocationSearch = async () => {
      if (!searchInput.trim()) return;
      
      try {
        console.log('Searching for location:', searchInput);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&fuzzyMatch=true&limit=1`
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
            ...filters,
            location: locationName,
            coordinates: [lng, lat] as [number, number]
          };
          
          dispatch(setFilters(newFilters));
          updateUrl(newFilters);
        } else {
          console.log('No location found for:', searchInput);
          // Still update the location name even if no coordinates found
          const newFilters = {
            ...filters,
            location: searchInput,
            coordinates: null
          };
          dispatch(setFilters(newFilters));
          updateUrl(newFilters);
        }
      } catch (error) {
        console.error('Error searching location:', error);
        // Still update the location name even if API fails
        const newFilters = {
          ...filters,
          location: searchInput,
          coordinates: null
        };
        dispatch(setFilters(newFilters));
        updateUrl(newFilters);
      }
    }
  return (
    <div className="flex justify-between items-center w-full py-5">
      {/* Filters */}
      <div className='flex justify-between items-center gap-4 p-2'>
          {/* All filters */}
          <Button variant="outline" className={cn("gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100", isFiltersFullOpen && "bg-primary-700 text-primary-100")}
            onClick={() => dispatch(toggleFiltersFullOpen())}>

            <Filter className="w-4 h-4"/>
            <span>All Filters</span>
          </Button>

          {/* Search for location */}
          <div className='flex items-center'>
            <Input
              placeholder='Search location'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLocationSearch();
                }
              }}
              className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
            />
            <Button
              className='rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none border hover:bg-primary-700 hover:text-primary-50'
              onClick={handleLocationSearch}
            >
              <Search className='w-4 h-4'></Search>
            </Button>
          </div>
          
          {/* Reset to My Location */}
          {filters.coordinates && (
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100"
              onClick={() => {
                // Clear the location search and let the map use user location
                const newFilters = {
                  ...filters,
                  location: "",
                  coordinates: null
                };
                dispatch(setFilters(newFilters));
                updateUrl(newFilters);
                setSearchInput("");
              }}
            >
              📍 My Location
            </Button>
          )}
          
          {/* Clear Search */}
          {filters.location && (
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-red-400 hover:bg-red-500 hover:text-white"
              onClick={() => {
                const newFilters = {
                  ...filters,
                  location: "",
                  coordinates: null
                };
                dispatch(setFilters(newFilters));
                updateUrl(newFilters);
                setSearchInput("");
              }}
            >
              ✕ Clear
            </Button>
          )}

          {/* Tags */}
          <div className='flex gap-1'>
              <Select value={filters.tags[0]?.toString() || "any"}
                onValueChange={(value) => handleFilterChange("tags", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag">
                    {filters.tags[0]?.toString() || "Any Tag"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value="any">Any Tag</SelectItem>
                  {tags.map((tag) =>(
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                  
                </SelectContent>
               
              </Select>
          </div>

      </div>
      <div className="flex justify-between items-center gap-4 p-2">
            <div className="flex border rounded-xl ">
              <Button variant="ghost" className={cn("px-3 py-1 rounded-none hover:bg-primary-600 hover:text-primary-100", viewMode === "list" ? "bg-primary-700 text-primary-50" : "")}
                onClick={() => dispatch(setViewMode("list"))}
              >
                  <List className="w-5 h-5"></List>
              </Button>
              <Button  variant="ghost" className={cn("px-3 py-1 rounded-none hover:bg-primary-600 hover:text-primary-100", viewMode === "grid" ? "bg-primary-700 text-primary-50" : "")}
                onClick={() => dispatch(setViewMode("grid"))} 
                >
                  <Grid className="w-5 h-5"></Grid>
              </Button>
            </div>
          </div>
    </div>
  )
}

export default FiltersBar
