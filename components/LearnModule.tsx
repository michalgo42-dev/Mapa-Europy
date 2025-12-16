import React, { useState } from 'react';
import EuropeMap from './EuropeMap';
import { EUROPE_COUNTRIES, PHYSICAL_FEATURES, POLITICAL_REGIONS } from '../constants';
import { PoliticalRegion, PhysicalFeature } from '../types';
import { BookOpen, MapPin, Compass, Users, Map, Mountain, ArrowLeft, Info, Globe2, Lock, Star, CheckCircle2, Circle, Anchor } from 'lucide-react';

type LearnCategory = 'MENU' | 'COUNTRIES_MENU' | 'COUNTRIES_MAP' | 'COUNTRIES_REGIONS' | 'PHYSICAL_REGIONS';

interface LearnModuleProps {
    visitedMap: Record<string, string[]>;
    setVisitedMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const LearnModule: React.FC<LearnModuleProps> = ({ visitedMap, setVisitedMap }) => {
  const [category, setCategory] = useState<LearnCategory>('MENU');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  
  // State for Physical Features (Islands & Peninsulas)
  const [selectedPhysicalFeature, setSelectedPhysicalFeature] = useState<PhysicalFeature | null>(null);
  
  // State for Political Regions learning
  const [selectedPoliticalRegion, setSelectedPoliticalRegion] = useState<PoliticalRegion | null>(null);

  // --- HELPER LOGIC ---

  const getRegionStats = (regionId: string) => {
    const region = POLITICAL_REGIONS.find(r => r.id === regionId);
    if (!region) return { stars: 0, percentage: 0, visitedCount: 0, total: 0 };

    const visitedCount = visitedMap[regionId]?.length || 0;
    const total = region.countries.length;
    const percentage = total === 0 ? 0 : Math.round((visitedCount / total) * 100);

    let stars = 0;
    if (percentage >= 100) stars = 3;
    else if (percentage >= 60) stars = 2;
    else if (percentage >= 30) stars = 1;

    return { stars, percentage, visitedCount, total };
  };

  const isUnlocked = (index: number) => {
      // First region (index 0) is always unlocked
      if (index === 0) return true;
      
      // Previous region must have at least 2 stars
      const prevRegionId = POLITICAL_REGIONS[index - 1].id;
      const { stars } = getRegionStats(prevRegionId);
      return stars >= 2;
  };

  const handleCountryClick = (code: string) => {
    if (category === 'COUNTRIES_MAP') {
        setSelectedCountryCode(code);
    } else if (category === 'COUNTRIES_REGIONS') {
        if (selectedPoliticalRegion && selectedPoliticalRegion.countries.includes(code)) {
            setSelectedCountryCode(code);
            
            // Mark as visited for this region
            setVisitedMap(prev => {
                const currentVisits = prev[selectedPoliticalRegion.id] || [];
                if (!currentVisits.includes(code)) {
                    return {
                        ...prev,
                        [selectedPoliticalRegion.id]: [...currentVisits, code]
                    };
                }
                return prev;
            });
        }
    } 
  };

  const handleFeatureClick = (feature: PhysicalFeature) => {
      setSelectedPhysicalFeature(feature);
  };

  const handleBack = () => {
      setSelectedCountryCode(null);
      setSelectedPhysicalFeature(null);
      setSelectedPoliticalRegion(null);

      if (category === 'COUNTRIES_MAP' || category === 'COUNTRIES_REGIONS') {
          if (category === 'COUNTRIES_REGIONS' && selectedPoliticalRegion) {
              // If inside a specific region map, go back to region list
              setSelectedPoliticalRegion(null);
              return;
          }
          // Go back to the Countries Menu choice
          setCategory('COUNTRIES_MENU');
      } else if (category === 'COUNTRIES_MENU' || category === 'PHYSICAL_REGIONS') {
          setCategory('MENU');
      }
  };

  const handlePoliticalRegionSelect = (region: PoliticalRegion, index: number) => {
      if (isUnlocked(index)) {
          setSelectedPoliticalRegion(region);
      }
  };

  // --- MENU VIEW (Level 1) ---
  if (category === 'MENU') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-4xl w-full text-center">
                  <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-2 tracking-tight">Mapa Europy</h1>
                  <h2 className="text-xl md:text-2xl text-slate-500 font-medium mb-10">Czego się dziś nauczymy?</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                      <button 
                          onClick={() => setCategory('COUNTRIES_MENU')}
                          className="group relative bg-sky-50 hover:bg-brand hover:text-white border-4 border-sky-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                      >
                          <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                              <Map className="w-12 h-12 text-brand group-hover:text-white" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">Państwa</h3>
                          <p className="text-sm opacity-80 font-medium px-4">Poznaj nazwy, stolice i sąsiadów krajów Europy.</p>
                      </button>

                      <button 
                          onClick={() => setCategory('PHYSICAL_REGIONS')}
                          className="group relative bg-emerald-50 hover:bg-emerald-500 hover:text-white border-4 border-emerald-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                      >
                          <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                              <Mountain className="w-12 h-12 text-emerald-600 group-hover:text-white" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">Wyspy i półwyspy</h3>
                          <p className="text-sm opacity-80 font-medium px-4">Odkryj największe formacje geograficzne kontynentu.</p>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- COUNTRIES SUB-MENU (Level 2) ---
  if (category === 'COUNTRIES_MENU') {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative">
            <button 
                onClick={handleBack}
                className="absolute top-6 left-6 z-30 bg-white/90 p-3 rounded-2xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-4xl w-full text-center">
                <h2 className="text-3xl font-black text-brand-dark mb-10">Wybierz tryb nauki państw</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <button 
                        onClick={() => setCategory('COUNTRIES_REGIONS')}
                        className="group relative bg-indigo-50 hover:bg-indigo-500 hover:text-white border-4 border-indigo-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                    >
                        <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                            <Compass className="w-12 h-12 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Regiony Europy</h3>
                        <p className="text-sm opacity-80 font-medium px-4">Ucz się partiami! Odblokuj kolejne regiony zdobywając gwiazdki.</p>
                    </button>

                    <button 
                        onClick={() => setCategory('COUNTRIES_MAP')}
                        className="group relative bg-orange-50 hover:bg-orange-500 hover:text-white border-4 border-orange-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                    >
                        <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                            <Globe2 className="w-12 h-12 text-orange-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Nauka z mapą kontynentu</h3>
                        <p className="text-sm opacity-80 font-medium px-4">Swobodna eksploracja całej mapy Europy bez ograniczeń.</p>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- REGIONS SELECTION LIST (Level 3 - If no region selected yet) ---
  if (category === 'COUNTRIES_REGIONS' && !selectedPoliticalRegion) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative">
            <button 
                onClick={handleBack}
                className="absolute top-6 left-6 z-30 bg-white/90 p-3 rounded-2xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-6xl w-full text-center overflow-y-auto max-h-full">
                <h2 className="text-3xl font-black text-brand-dark mb-2">Regiony Europy</h2>
                <p className="text-slate-500 mb-8">Odkrywaj państwa na mapie, aby zdobywać gwiazdki!</p>
                
                <div className="flex flex-wrap justify-center gap-6">
                    {POLITICAL_REGIONS.map((region, index) => {
                        const unlocked = isUnlocked(index);
                        const { stars, percentage } = getRegionStats(region.id);
                        
                        return (
                            <button 
                                key={region.id}
                                onClick={() => handlePoliticalRegionSelect(region, index)}
                                disabled={!unlocked}
                                className={`
                                    relative w-64 p-6 rounded-3xl border-4 transition-all duration-300 flex flex-col items-center
                                    ${unlocked 
                                        ? 'bg-white border-brand-light hover:border-brand hover:shadow-xl transform hover:-translate-y-1 cursor-pointer' 
                                        : 'bg-slate-100 border-slate-200 grayscale opacity-80 cursor-not-allowed'}
                                `}
                            >
                                <div className="text-xl font-bold mb-4 text-slate-800">{region.name}</div>
                                
                                {unlocked ? (
                                    <>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    size={24} 
                                                    className={`${s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} 
                                                />
                                            ))}
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                                            <div 
                                                className="bg-brand h-2 rounded-full transition-all duration-500" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="mb-2 bg-slate-200 p-3 rounded-full">
                                        <Lock className="text-slate-400" size={24} />
                                    </div>
                                )}
                                
                                <div className="text-xs text-slate-400 font-medium mt-3">
                                    {unlocked ? `${region.countries.length} państw • ${percentage}%` : 'Zablokowane'}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      );
  }

  // --- MAP VIEW (Shared Logic) ---
  const isPhysicalRegionsMode = category === 'PHYSICAL_REGIONS';
  const isPoliticalRegionMode = category === 'COUNTRIES_REGIONS' && selectedPoliticalRegion !== null;
  
  // What to display in the info sidebar?
  const countryInfo = selectedCountryCode ? EUROPE_COUNTRIES[selectedCountryCode] : null;

  // Determine highlights and visible countries
  let highlightedCodes: string[] = [];
  let visitedCodesInCurrentRegion: string[] = []; // Used to color map green

  if (isPoliticalRegionMode && selectedPoliticalRegion) {
      highlightedCodes = selectedPoliticalRegion.countries;
      // In political mode, we mark visited countries as "Correct/Green" to show progress
      visitedCodesInCurrentRegion = visitedMap[selectedPoliticalRegion.id] || [];
  } else if (selectedCountryCode) {
      highlightedCodes = [selectedCountryCode];
  }

  const currentRegionStats = isPoliticalRegionMode && selectedPoliticalRegion 
      ? getRegionStats(selectedPoliticalRegion.id) 
      : null;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4">
      {/* Map Section */}
      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border-4 border-white relative">
        <button 
            onClick={handleBack}
            className="absolute top-4 left-4 z-30 bg-white/90 p-2 rounded-xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
        >
            <ArrowLeft size={20} />
            <span className="text-sm">Wróć</span>
        </button>

        {isPoliticalRegionMode && selectedPoliticalRegion && (
             <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-brand/20 shadow-sm flex flex-col items-end">
                <span className="text-brand-dark font-bold uppercase text-xs tracking-wider block text-right">Region</span>
                <span className="text-lg font-bold text-slate-800">{selectedPoliticalRegion.name}</span>
             </div>
        )}

        <EuropeMap 
          onCountryClick={handleCountryClick} 
          onFeatureClick={handleFeatureClick}
          highlightedCodes={highlightedCodes}
          correctCodes={visitedCodesInCurrentRegion} // Green styling for visited
          physicalFeatures={isPhysicalRegionsMode ? PHYSICAL_FEATURES : []}
          selectedFeatureId={selectedPhysicalFeature?.id}
          showLabels={true} 
          className="w-full h-full bg-sky-200"
        />
        
        {isPhysicalRegionsMode && (
             <div className="absolute bottom-4 left-4 z-20 bg-white/80 backdrop-blur px-4 py-2 rounded-xl text-xs text-slate-500 max-w-xs border border-white shadow-sm flex items-center gap-2">
                 <MapPin size={16} className="text-brand" />
                 Kliknij kropki na mapie lub wybierz z listy obok.
             </div>
        )}
      </div>

      {/* Info Sidebar */}
      <div className="w-full md:w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 flex flex-col gap-4 border-4 border-white transition-all">
        <div className="flex items-center gap-2 text-brand-dark mb-2 border-b border-gray-200 pb-4">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-bold">
              {isPhysicalRegionsMode ? 'Wyspy i Półwyspy' : 'Tryb Nauki'}
          </h2>
        </div>
        
        {/* --- CONTENT FOR PHYSICAL REGIONS MODE --- */}
        {isPhysicalRegionsMode && (
             <div className="flex-1 flex flex-col h-full overflow-hidden">
                {!selectedPhysicalFeature ? (
                    // --- LIST VIEW ---
                    <div className="flex-1 overflow-y-auto pr-2">
                        <p className="text-sm text-slate-500 mb-4">Wybierz obiekt, aby zobaczyć go na mapie:</p>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Mountain size={14} /> Półwyspy
                                </h3>
                                <div className="space-y-2">
                                    {PHYSICAL_FEATURES.filter(f => f.type === 'peninsula').map(f => (
                                        <button 
                                            key={f.id}
                                            onClick={() => setSelectedPhysicalFeature(f)}
                                            className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 p-3 rounded-xl transition-colors text-sm font-medium text-slate-700 flex justify-between items-center group"
                                        >
                                            {f.name}
                                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Anchor size={14} /> Wyspy
                                </h3>
                                <div className="space-y-2">
                                    {PHYSICAL_FEATURES.filter(f => f.type === 'island').map(f => (
                                        <button 
                                            key={f.id}
                                            onClick={() => setSelectedPhysicalFeature(f)}
                                            className="w-full text-left bg-white hover:bg-sky-50 border border-slate-100 hover:border-sky-200 p-3 rounded-xl transition-colors text-sm font-medium text-slate-700 flex justify-between items-center group"
                                        >
                                            {f.name}
                                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-sky-400"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- DETAIL VIEW ---
                    <div className="animate-fade-in space-y-4 flex-1 flex flex-col">
                        <div className={`
                            rounded-2xl p-6 border-2 text-center shadow-sm relative
                            ${selectedPhysicalFeature.type === 'peninsula' ? 'bg-emerald-50 border-emerald-100' : 'bg-sky-50 border-sky-100'}
                        `}>
                            <button 
                                onClick={() => setSelectedPhysicalFeature(null)}
                                className="absolute top-2 left-2 p-1 hover:bg-white/50 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            {selectedPhysicalFeature.type === 'peninsula' ? (
                                <Mountain className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                            ) : (
                                <Anchor className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                            )}
                            
                            <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${selectedPhysicalFeature.type === 'peninsula' ? 'text-emerald-600' : 'text-sky-600'}`}>
                                {selectedPhysicalFeature.type === 'island' ? 'Wyspa / Archipelag' : 'Półwysep'}
                            </p>
                            <h3 className="text-2xl font-black text-gray-800 leading-tight">{selectedPhysicalFeature.name}</h3>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-slate-100 flex-1 overflow-y-auto shadow-inner">
                            {selectedPhysicalFeature.parentCountry && (
                                <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <span className="text-xs font-bold text-orange-400 uppercase block mb-1">Należy do:</span>
                                    <span className="font-bold text-slate-700">{selectedPhysicalFeature.parentCountry}</span>
                                </div>
                            )}

                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm uppercase">
                                <Info className="w-4 h-4" />
                                Ciekawostka
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {selectedPhysicalFeature.description}
                            </p>
                        </div>

                        <button 
                             onClick={() => setSelectedPhysicalFeature(null)}
                             className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                         >
                             Wróć do listy
                         </button>
                    </div>
                )}
             </div>
        )}

        {/* --- CONTENT FOR POLITICAL REGION MODE (PROGRESS TRACKING) --- */}
        {isPoliticalRegionMode && selectedPoliticalRegion && currentRegionStats && (
            <div className="flex-1 flex flex-col animate-fade-in">
                {/* Progress Header */}
                <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-100 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase">Twój postęp</span>
                        <div className="flex gap-1">
                            {[1, 2, 3].map((s) => (
                                <Star 
                                    key={s} 
                                    size={16} 
                                    className={`${s <= currentRegionStats.stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} 
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 mb-1">
                        <div 
                            className="bg-indigo-500 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${currentRegionStats.percentage}%` }}
                        />
                    </div>
                    <p className="text-right text-xs text-indigo-500 font-bold">
                        {currentRegionStats.visitedCount} / {currentRegionStats.total} ({currentRegionStats.percentage}%)
                    </p>
                </div>

                {/* Checklist or Details */}
                {!countryInfo ? (
                    <div className="flex-1 overflow-y-auto pr-2">
                        <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wide">Do odkrycia:</h4>
                        <div className="space-y-2">
                            {selectedPoliticalRegion.countries.map(code => {
                                const isVisited = visitedCodesInCurrentRegion.includes(code);
                                const cName = EUROPE_COUNTRIES[code]?.name || code;
                                return (
                                    <div 
                                        key={code} 
                                        className={`flex items-center gap-3 p-2 rounded-lg border ${isVisited ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}
                                    >
                                        {isVisited ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-300" />
                                        )}
                                        <span className={`text-sm font-medium ${isVisited ? 'text-green-800' : 'text-slate-600'}`}>
                                            {cName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Country Detail View (reusing the detailed card style)
                    <div className="animate-fade-in flex-1 flex flex-col">
                         <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-100 text-center shadow-sm mb-4">
                            <MapPin className="w-10 h-10 text-brand mx-auto mb-2" />
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Odkryto!</p>
                            <h3 className="text-2xl font-black text-gray-800 break-words leading-tight">{countryInfo.name}</h3>
                            <p className="text-gray-400 font-mono mt-1 text-xs">{countryInfo.englishName}</p>
                        </div>
                         <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex-1 overflow-y-auto">
                            <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4" />
                                Sąsiedzi
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {countryInfo.neighbors.map(code => EUROPE_COUNTRIES[code]).filter(Boolean).map(n => (
                                    <span key={n.code} className="bg-white text-amber-800 px-2 py-1 rounded-md text-xs font-bold border border-amber-100">
                                        {n.name}
                                    </span>
                                ))}
                            </div>
                         </div>
                         <button 
                             onClick={() => setSelectedCountryCode(null)}
                             className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                         >
                             Wróć do listy
                         </button>
                    </div>
                )}
            </div>
        )}

        {/* --- CONTENT FOR GENERAL MAP MODE --- */}
        {!isPhysicalRegionsMode && !isPoliticalRegionMode && (
             !countryInfo ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center p-4">
                    <Compass className="w-20 h-20 mb-4 text-brand-light animate-pulse" />
                    <p className="text-lg font-medium">
                        Kliknij dowolny kraj na mapie, aby poznać jego nazwę i położenie.
                    </p>
                </div>
                ) : (
                <div className="animate-fade-in space-y-6 flex-1 flex flex-col">
                    <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-100 text-center shadow-sm">
                        <MapPin className="w-12 h-12 text-brand mx-auto mb-2" />
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Wybrano kraj</p>
                        <h3 className="text-3xl font-black text-gray-800 break-words leading-tight">{countryInfo.name}</h3>
                        <p className="text-gray-400 font-mono mt-2 text-sm">{countryInfo.englishName}</p>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex-1">
                    <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Sąsiedzi
                    </h4>
                    
                    {countryInfo.neighbors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {countryInfo.neighbors
                            .map(code => EUROPE_COUNTRIES[code])
                            .filter(Boolean)
                            .map((n) => (
                            <span key={n.code} className="bg-white text-amber-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-amber-100">
                                {n.name}
                            </span>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-amber-400 text-sm font-medium italic text-center p-4">
                        To państwo nie posiada lądowych sąsiadów.
                        </div>
                    )}
                    </div>
                    
                    <div className="mt-auto text-sm text-gray-400 text-center">
                    Wybierz inny kraj, aby kontynuować.
                    </div>
                </div>
                )
        )}
      </div>
    </div>
  );
};

export default LearnModule;