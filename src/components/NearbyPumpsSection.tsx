import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { MapPin, Filter, Search, Loader2, X, Navigation, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import PumpCard from "./PumpCard";
import BookingModal from "./BookingModal";
import { useApiPumps, type Pump } from "@/hooks/useApiPumps";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";

interface Filters {
  cities: string[];
  openOnly: boolean;
  availability: "all" | "high" | "medium" | "low";
}

type SortOption = "distance" | "rating" | "waitTime" | "availability";

interface PumpWithDistance extends Pump {
  distance: number | null;
}

const NearbyPumpsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    cities: [],
    openOnly: false,
    availability: "all",
  });
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  
  // State for nearby pumps when location is available
  const [nearbyPumps, setNearbyPumps] = useState<Pump[]>([]);
  const [useNearby, setUseNearby] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { pumps: allPumps, loading, error, refetch, fetchNearbyPumps } = useApiPumps();
  const { location, loading: locationLoading, requestLocation, clearLocation } = useGeolocation();
  
  // Function to extract unique areas/localities from addresses for search suggestions
  const getSearchSuggestions = useCallback((query: string, pumps: Pump[]) => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase().trim();
    const suggestions = new Set<string>();
    
    pumps.forEach(pump => {
      // Add city as suggestion
      if (pump.city.toLowerCase().includes(queryLower)) {
        suggestions.add(pump.city);
      }
      
      // Add pump name as suggestion
      if (pump.name.toLowerCase().includes(queryLower)) {
        suggestions.add(pump.name);
      }
      
      // Split address by common delimiters and add parts that match
      const addressParts = pump.address.toLowerCase().split(/[,.]/);
      addressParts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart && trimmedPart.includes(queryLower)) {
          suggestions.add(part.trim());
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  }, []);
  
  // Update search suggestions when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const pumpsToUse = useNearby ? nearbyPumps : allPumps;
      const suggestions = getSearchSuggestions(searchQuery, pumpsToUse);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allPumps, nearbyPumps, useNearby, getSearchSuggestions]);
  
  // Handle clicks outside search suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch nearby pumps when location is available
  useEffect(() => {
    if (location) {
      // Validate coordinates are within valid ranges
      if (location.latitude < -90 || location.latitude > 90 || 
          location.longitude < -180 || location.longitude > 180) {
        console.error('Invalid coordinates:', location);
        setUseNearby(false);
        return;
      }
      
      const fetchNearby = async () => {
        try {
          const nearby = await fetchNearbyPumps(location.latitude, location.longitude, 25);
          setNearbyPumps(nearby);
          setUseNearby(true);
        } catch (err) {
          console.error('Failed to fetch nearby pumps:', err);
          // Fallback to all pumps if nearby fetch fails
          setUseNearby(false);
        }
      };
      
      fetchNearby();
    } else {
      setUseNearby(false);
    }
  }, [location]); // Removed fetchNearbyPumps from dependency array to prevent infinite loop
  // Get unique cities for filter options
  const availableCities = useMemo(() => {
    const pumpsToUse = useNearby ? nearbyPumps : allPumps;
    return [...new Set(pumpsToUse.map(pump => pump.city))].sort();
  }, [allPumps, nearbyPumps, useNearby]);

  // Calculate distances and sort pumps
  const pumpsWithDistance = useMemo((): PumpWithDistance[] => {
    const pumpsToUse = useNearby ? nearbyPumps : allPumps;
    
    return pumpsToUse.map(pump => {
      let distance: number | null = null;
      if (location && pump.latitude && pump.longitude) {
        distance = calculateDistance(
          location.latitude,
          location.longitude,
          pump.latitude,
          pump.longitude
        );
      }
      return { ...pump, distance };
    });
  }, [allPumps, nearbyPumps, location, useNearby]);

  const filteredPumps = useMemo(() => {
    let result = pumpsWithDistance.filter(pump => {
      // Search filter - enhanced to search in multiple fields
      let matchesSearch = false;
      
      if (searchQuery.trim() !== '') {
        const searchLower = searchQuery.toLowerCase().trim();
        
        // Check if search matches in any relevant fields
        matchesSearch = 
          pump.name.toLowerCase().includes(searchLower) ||
          pump.address.toLowerCase().includes(searchLower) ||
          pump.city.toLowerCase().includes(searchLower) ||
          // Additional search in address components (area/locality)
          pump.address.toLowerCase().split(/[,.]/).some(part => 
            part.trim().toLowerCase().includes(searchLower)
          );
      } else {
        // If no search query, show all pumps
        matchesSearch = true;
      }
      
      if (!matchesSearch) return false;

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(pump.city)) {
        return false;
      }

      // Open status filter
      if (filters.openOnly && !pump.is_open) {
        return false;
      }

      // Availability filter
      const capacityPercent = (pump.remaining_capacity / pump.total_capacity) * 100;
      if (filters.availability === "high" && capacityPercent < 50) return false;
      if (filters.availability === "medium" && (capacityPercent < 20 || capacityPercent >= 50)) return false;
      if (filters.availability === "low" && capacityPercent >= 20) return false;

      return true;
    });

    // Sort based on selected option
    result.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case "rating":
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA; // Higher rating first
        case "waitTime":
          // Lower remaining capacity = longer wait, so sort by higher capacity first
          const capacityPercentA = a.remaining_capacity / a.total_capacity;
          const capacityPercentB = b.remaining_capacity / b.total_capacity;
          return capacityPercentB - capacityPercentA;
        case "availability":
          // Higher remaining capacity first
          return b.remaining_capacity - a.remaining_capacity;
        default:
          return 0;
      }
    });

    return result;
  }, [pumpsWithDistance, searchQuery, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cities.length > 0) count++;
    if (filters.openOnly) count++;
    if (filters.availability !== "all") count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({ cities: [], openOnly: false, availability: "all" });
  };

  const toggleCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }));
  };

  const handleBookSlot = (pump: Pump) => {
    setSelectedPump(pump);
    setIsBookingOpen(true);
  };

  const getWaitTime = (pump: Pump) => {
    const capacityPercent = (pump.remaining_capacity / pump.total_capacity) * 100;
    if (capacityPercent > 70) return "~3 min";
    if (capacityPercent > 50) return "~8 min";
    if (capacityPercent > 30) return "~12 min";
    if (capacityPercent > 10) return "~20 min";
    return "~30 min";
  };

  const getQueueLength = (pump: Pump) => {
    const capacityPercent = (pump.remaining_capacity / pump.total_capacity) * 100;
    if (capacityPercent > 70) return 2;
    if (capacityPercent > 50) return 5;
    if (capacityPercent > 30) return 10;
    return 15;
  };

  const formatDistance = (pump: PumpWithDistance): string => {
    if (pump.distance !== null) {
      if (pump.distance < 1) {
        return `${Math.round(pump.distance * 1000)} m`;
      }
      return `${pump.distance.toFixed(1)} km`;
    }
    // Fallback for pumps without coordinates
    return "—";
  };

  return (
    <section id="pumps" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Live Availability
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Nearby CNG <span className="text-primary">Stations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time fuel availability and queue status at stations near you.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-3xl mx-auto">
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by station name, area, city, or address..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              title="Search for CNG stations by name, area, city, or address"
              onFocus={() => {
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <DropdownMenuRadioItem value="distance">Distance</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="waitTime">Wait Time</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="availability">Fuel Availability</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by City</DropdownMenuLabel>
              {availableCities.map(city => (
                <DropdownMenuCheckboxItem
                  key={city}
                  checked={filters.cities.includes(city)}
                  onCheckedChange={() => toggleCity(city)}
                >
                  {city}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.openOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, openOnly: checked }))}
              >
                Open Now Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Fuel Availability</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.availability === "high"}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availability: checked ? "high" : "all" }))}
              >
                High (&gt;50%)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.availability === "medium"}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availability: checked ? "medium" : "all" }))}
              >
                Medium (20-50%)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.availability === "low"}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availability: checked ? "low" : "all" }))}
              >
                Low (&lt;20%)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {location ? (
            <Button 
              variant="outline" 
              className="h-12 gap-2 border-primary text-primary"
              onClick={clearLocation}
            >
              <Navigation className="w-4 h-4 fill-primary" />
              Location Active
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              variant="hero" 
              className="h-12 gap-2"
              onClick={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {locationLoading ? "Getting Location..." : "Use My Location"}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(activeFilterCount > 0 || location) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 max-w-3xl mx-auto">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <Badge variant="default" className="gap-1 bg-primary">
              <ArrowUpDown className="w-3 h-3" />
              {sortBy === "distance" ? "By distance" : sortBy === "rating" ? "By rating" : sortBy === "waitTime" ? "By wait time" : "By availability"}
            </Badge>
            {location && (
              <Badge variant="outline" className="gap-1 border-primary text-primary">
                <Navigation className="w-3 h-3" />
                Location active
              </Badge>
            )}
            {filters.cities.map(city => (
              <Badge key={city} variant="secondary" className="gap-1">
                {city}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCity(city)} />
              </Badge>
            ))}
            {filters.openOnly && (
              <Badge variant="secondary" className="gap-1">
                Open Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, openOnly: false }))} />
              </Badge>
            )}
            {filters.availability !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {filters.availability === "high" ? "High Availability" : filters.availability === "medium" ? "Medium Availability" : "Low Availability"}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, availability: "all" }))} />
              </Badge>
            )}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Pumps Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPumps.map((pump, index) => (
              <div 
                key={pump.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PumpCard
                  name={pump.name}
                  address={`${pump.address}, ${pump.city}`}
                  distance={formatDistance(pump)}
                  capacity={pump.total_capacity}
                  remainingCapacity={pump.remaining_capacity}
                  waitTime={getWaitTime(pump)}
                  queueLength={getQueueLength(pump)}
                  rating={Number(pump.rating) || 4.0}
                  isOpen={pump.is_open}
                  onBookSlot={() => handleBookSlot(pump)}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredPumps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No stations found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or expanding your area.
            </p>
          </div>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        pump={selectedPump}
      />
    </section>
  );
};

export default NearbyPumpsSection;
