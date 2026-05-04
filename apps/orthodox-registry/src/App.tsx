import { useState, useEffect, useMemo } from 'react';
import type { Parish } from './types/parish';
import { ParishMap } from './components/ParishMap';
import { ParishList } from './components/ParishList';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { ThemeToggle } from './components/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

function App() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [selectedParishId, setSelectedParishId] = useState<string>();

  useEffect(() => {
    fetch('/rocor_parishes_detailed.json')
      .then((res) => res.json())
      .then((data) => setParishes(data))
      .catch((err) => console.error('Error loading parish data:', err));
  }, []);

  const countries = useMemo(() => {
    return [...new Set(parishes.map((p) => p.country))].sort();
  }, [parishes]);

  const states = useMemo(() => {
    return [...new Set(parishes.filter((p) => p.state).map((p) => p.state as string))].sort();
  }, [parishes]);

  const filteredParishes = useMemo(() => {
    return parishes.filter((parish) => {
      // Filter out parishes with invalid coordinates (0,0)
      if (parish.latitude === 0 && parish.longitude === 0) {
        return false;
      }

      const matchesSearch =
        !searchTerm ||
        parish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parish.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = !countryFilter || parish.country === countryFilter;
      const matchesState = !stateFilter || parish.state === stateFilter;

      return matchesSearch && matchesCountry && matchesState;
    });
  }, [parishes, searchTerm, countryFilter, stateFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setCountryFilter('');
    setStateFilter('');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="bg-card border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">ROCOR Parish Directory</h1>
            <p className="text-muted-foreground">
              Russian Orthodox Church Outside of Russia - Worldwide Parishes
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="max-w-7xl mx-auto space-y-3">
          <Input
            placeholder="Search by parish name, city, state, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-3 items-center">
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>

            <span className="text-sm text-muted-foreground ml-auto">
              <span className="font-bold text-primary">{filteredParishes.length}</span> parishes found
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="map-container">
          <ParishMap
            parishes={filteredParishes}
            selectedParishId={selectedParishId}
            onParishClick={(parish) => setSelectedParishId(parish.uid)}
          />
        </div>
        <div className="parish-sidebar bg-background">
          <div className="sticky top-0 bg-background border-b p-4 z-10">
            <h2 className="font-bold text-lg">Parishes</h2>
          </div>
          <ParishList
            parishes={filteredParishes}
            selectedParishId={selectedParishId}
            onParishClick={(parish) => setSelectedParishId(parish.uid)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
