import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EuropeMap from './EuropeMap';
import { EUROPE_COUNTRIES, PHYSICAL_FEATURES, POLITICAL_REGIONS } from '../constants';
import { PhysicalFeature } from '../types';
import { getCountryHint } from '../services/geminiService';
import { HelpCircle, Trophy, Target, AlertCircle, CheckCircle2, Map, Mountain, ArrowLeft, Star, Lock, LayoutGrid, MousePointer2, Move, HelpCircle as QuestionIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeModuleProps {
    visitedMap: Record<string, string[]>;
}

type PracticeView = 'MENU' | 'COUNTRIES_SELECT' | 'GAME_COUNTRIES' | 'GAME_PHYSICAL_MENU' | 'GAME_PHYSICAL';
type PhysicalGameType = 'POINT' | 'ABCD' | 'MATCH';

// --- GAME LOGIC HELPERS ---
const getRegionStats = (regionId: string, visitedMap: Record<string, string[]>) => {
    const region = POLITICAL_REGIONS.find(r => r.id === regionId);
    if (!region) return { stars: 0 };
    const visitedCount = visitedMap[regionId]?.length || 0;
    const total = region.countries.length;
    const percentage = total === 0 ? 0 : Math.round((visitedCount / total) * 100);
    let stars = 0;
    if (percentage >= 100) stars = 3;
    else if (percentage >= 60) stars = 2;
    else if (percentage >= 30) stars = 1;
    return { stars };
};

const isUnlocked = (index: number, visitedMap: Record<string, string[]>) => {
    if (index === 0) return true;
    const prevRegionId = POLITICAL_REGIONS[index - 1].id;
    const { stars } = getRegionStats(prevRegionId, visitedMap);
    return stars >= 2;
};

const PracticeModule: React.FC<PracticeModuleProps> = ({ visitedMap }) => {
  const [view, setView] = useState<PracticeView>('MENU');
  
  // -- Country Game State --
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  
  // -- Physical Game State --
  const [physicalGameType, setPhysicalGameType] = useState<PhysicalGameType | null>(null);

  // -- Shared Game State --
  const [targetId, setTargetId] = useState<string | null>(null); // Country Code OR Feature ID
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([]); // For map coloring
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  
  // Hint State (Countries only)
  const [hint, setHint] = useState<string>("");
  const [loadingHint, setLoadingHint] = useState(false);

  // ABCD Options State
  const [abcdOptions, setAbcdOptions] = useState<PhysicalFeature[]>([]);

  // Matching/Drag State
  const [matchOptions, setMatchOptions] = useState<PhysicalFeature[]>([]);

  // --- INITIALIZATION LOGIC ---

  const initCountryGame = (regionId: string) => {
      setSelectedRegionId(regionId);
      setView('GAME_COUNTRIES');
      setScore(0);
      setAttempts(0);
      setCorrectGuesses([]);
      pickNewCountryTarget(regionId);
  };

  const pickNewCountryTarget = (regionId: string) => {
      const region = POLITICAL_REGIONS.find(r => r.id === regionId);
      if (!region) return;
      const randomCode = region.countries[Math.floor(Math.random() * region.countries.length)];
      setTargetId(randomCode);
      setFeedback(null);
      setHint("");
      setWrongGuesses([]);
  };

  const initPhysicalGame = (type: PhysicalGameType) => {
      setPhysicalGameType(type);
      setView('GAME_PHYSICAL');
      setScore(0);
      setAttempts(0);
      setCorrectGuesses([]); // Used differently for physical features? Not really, mostly feedback state.
      pickNewPhysicalTarget(type);
  };

  const pickNewPhysicalTarget = (type: PhysicalGameType) => {
      const randomFeature = PHYSICAL_FEATURES[Math.floor(Math.random() * PHYSICAL_FEATURES.length)];
      setTargetId(randomFeature.id);
      setFeedback(null);
      setWrongGuesses([]);

      if (type === 'ABCD') {
          // Generate 3 wrong options of same type (island vs peninsula) preferrably
          const sameType = PHYSICAL_FEATURES.filter(f => f.type === randomFeature.type && f.id !== randomFeature.id);
          const shuffled = sameType.sort(() => 0.5 - Math.random()).slice(0, 3);
          const options = [...shuffled, randomFeature].sort(() => 0.5 - Math.random());
          setAbcdOptions(options);
      } else if (type === 'MATCH') {
          // Similar to ABCD but these will be draggable/clickable buttons to match the map highlight
          const sameType = PHYSICAL_FEATURES.filter(f => f.type === randomFeature.type && f.id !== randomFeature.id);
          const shuffled = sameType.sort(() => 0.5 - Math.random()).slice(0, 3);
          const options = [...shuffled, randomFeature].sort(() => 0.5 - Math.random());
          setMatchOptions(options);
      }
  };

  // --- INTERACTION HANDLERS ---

  // 1. Country Game Map Click
  const handleCountryMapClick = (code: string) => {
      if (view !== 'GAME_COUNTRIES' || feedback === 'correct' || !targetId) return;

      setAttempts(prev => prev + 1);
      if (code === targetId) {
          handleSuccess();
          setCorrectGuesses(prev => [...prev, code]);
          setTimeout(() => selectedRegionId && pickNewCountryTarget(selectedRegionId), 1500);
      } else {
          setFeedback('incorrect');
          setWrongGuesses(prev => [...prev, code]);
      }
  };

  // 2. Physical Point Map Click
  const handlePhysicalMapFeatureClick = (feature: PhysicalFeature) => {
      if (view !== 'GAME_PHYSICAL' || physicalGameType !== 'POINT' || feedback === 'correct' || !targetId) return;
      
      setAttempts(prev => prev + 1);
      if (feature.id === targetId) {
          handleSuccess();
          setTimeout(() => pickNewPhysicalTarget('POINT'), 1500);
      } else {
          setFeedback('incorrect');
      }
  };

  // 3. ABCD Answer Click
  const handleAbcdSelect = (selectedId: string) => {
      if (feedback === 'correct') return;
      setAttempts(prev => prev + 1);
      if (selectedId === targetId) {
          handleSuccess();
          setTimeout(() => pickNewPhysicalTarget('ABCD'), 1500);
      } else {
          setFeedback('incorrect');
      }
  };

  // 4. Drag & Drop (Simulated via "Select Label to Match Highlight")
  // We use standard HTML5 Drag and Drop API
  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    e.dataTransfer.setData("text/plain", featureId);
  };

  const handleDropOnMap = (e: React.DragEvent) => {
      e.preventDefault();
      if (feedback === 'correct' || !targetId) return;
      
      const droppedFeatureId = e.dataTransfer.getData("text/plain");
      setAttempts(prev => prev + 1);

      if (droppedFeatureId === targetId) {
          handleSuccess();
          setTimeout(() => pickNewPhysicalTarget('MATCH'), 1500);
      } else {
          setFeedback('incorrect');
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  // Common Success Logic
  const handleSuccess = () => {
      setFeedback('correct');
      setScore(prev => prev + 1);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // --- RENDER HELPERS ---
  const currentTargetName = useMemo(() => {
      if (!targetId) return "";
      if (view === 'GAME_COUNTRIES') {
          return EUROPE_COUNTRIES[targetId]?.name || targetId;
      }
      return PHYSICAL_FEATURES.find(f => f.id === targetId)?.name || "";
  }, [targetId, view]);


  // --- VIEW: MENU (Level 1) ---
  if (view === 'MENU') {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-4xl w-full text-center">
                <h1 className="text-4xl font-black text-brand-dark mb-10">Strefa Ćwiczeń</h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <button 
                        onClick={() => setView('COUNTRIES_SELECT')}
                        className="group relative bg-sky-50 hover:bg-brand hover:text-white border-4 border-sky-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                    >
                        <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                            <Map className="w-12 h-12 text-brand group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Państwa</h3>
                        <p className="text-sm opacity-80 font-medium px-4">Ćwicz znajomość państw w odblokowanych regionach.</p>
                    </button>

                    <button 
                        onClick={() => setView('GAME_PHYSICAL_MENU')}
                        className="group relative bg-emerald-50 hover:bg-emerald-500 hover:text-white border-4 border-emerald-100 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                    >
                        <div className="bg-white p-5 rounded-full mb-6 shadow-sm group-hover:bg-white/20 transition-colors">
                            <Mountain className="w-12 h-12 text-emerald-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Wyspy i półwyspy</h3>
                        <p className="text-sm opacity-80 font-medium px-4">Rozwiązuj zadania i zagadki o ukształtowaniu terenu.</p>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- VIEW: COUNTRIES REGION SELECT (Level 2 - Countries) ---
  if (view === 'COUNTRIES_SELECT') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative">
            <button 
                onClick={() => setView('MENU')}
                className="absolute top-6 left-6 z-30 bg-white/90 p-3 rounded-2xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-6xl w-full text-center overflow-y-auto max-h-full">
                <h2 className="text-3xl font-black text-brand-dark mb-2">Wybierz region do ćwiczeń</h2>
                <p className="text-slate-500 mb-8">Możesz ćwiczyć tylko te regiony, które zostały odblokowane w module Nauka.</p>
                
                <div className="flex flex-wrap justify-center gap-6">
                    {POLITICAL_REGIONS.map((region, index) => {
                        const unlocked = isUnlocked(index, visitedMap);
                        return (
                            <button 
                                key={region.id}
                                onClick={() => unlocked && initCountryGame(region.id)}
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
                                    <div className="text-xs text-brand font-bold bg-brand-light/20 px-3 py-1 rounded-full">Dostępny</div>
                                ) : (
                                    <div className="mb-2 bg-slate-200 p-3 rounded-full">
                                        <Lock className="text-slate-400" size={24} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW: PHYSICAL GAMES MENU (Level 2 - Physical) ---
  if (view === 'GAME_PHYSICAL_MENU') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative">
             <button 
                onClick={() => setView('MENU')}
                className="absolute top-6 left-6 z-30 bg-white/90 p-3 rounded-2xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-4xl w-full text-center">
                <h2 className="text-3xl font-black text-brand-dark mb-10">Wybierz typ zadania</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <button onClick={() => initPhysicalGame('POINT')} className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 p-6 rounded-2xl flex flex-col items-center transition-all">
                        <MousePointer2 className="w-10 h-10 text-emerald-600 mb-3" />
                        <h3 className="font-bold text-lg text-emerald-800">Wskaż na mapie</h3>
                        <p className="text-xs text-emerald-600 mt-2">Znajdź wyspę lub półwysep.</p>
                    </button>
                    
                    <button onClick={() => initPhysicalGame('ABCD')} className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 p-6 rounded-2xl flex flex-col items-center transition-all">
                        <LayoutGrid className="w-10 h-10 text-indigo-600 mb-3" />
                        <h3 className="font-bold text-lg text-indigo-800">Test ABCD</h3>
                        <p className="text-xs text-indigo-600 mt-2">Co zaznaczono na mapie?</p>
                    </button>

                    <button onClick={() => initPhysicalGame('MATCH')} className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 p-6 rounded-2xl flex flex-col items-center transition-all">
                        <Move className="w-10 h-10 text-amber-600 mb-3" />
                        <h3 className="font-bold text-lg text-amber-800">Dopasuj (Drag & Drop)</h3>
                        <p className="text-xs text-amber-600 mt-2">Przeciągnij nazwę na mapę.</p>
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- MAIN GAME VIEW (Shared Layout) ---
  const isCountryGame = view === 'GAME_COUNTRIES';
  
  // Highlight logic for map
  let highlightedCodes: string[] = [];
  let physicalFeaturesToRender: PhysicalFeature[] = [];
  let mapCorrectCodes = correctGuesses;
  let mapIncorrectCodes = wrongGuesses;
  let selectedFeatureIdForMap = null;

  if (isCountryGame) {
      if (selectedRegionId) {
        // Only allow highlighting countries in this region to prevent cheating/confusion?
        // Actually, for visual clarity, we might just want to let user click anything.
        // But highlighting the region boundary is nice. Let's rely on standard logic.
      }
  } else {
      // Physical Games
      physicalFeaturesToRender = PHYSICAL_FEATURES;
      if (physicalGameType === 'ABCD' || physicalGameType === 'MATCH') {
          selectedFeatureIdForMap = targetId; // Highlight target for user to identify
      }
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4">
      {/* Map Section */}
      <div 
        className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border-4 border-white relative"
        onDragOver={physicalGameType === 'MATCH' ? handleDragOver : undefined}
        onDrop={physicalGameType === 'MATCH' ? handleDropOnMap : undefined}
      >
        <button 
            onClick={() => setView(isCountryGame ? 'COUNTRIES_SELECT' : 'GAME_PHYSICAL_MENU')}
            className="absolute top-4 left-4 z-30 bg-white/90 p-2 rounded-xl shadow-md border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold flex items-center gap-2 transition-colors"
        >
            <ArrowLeft size={20} />
            <span className="text-sm">Wróć</span>
        </button>

        {physicalGameType === 'MATCH' && targetId && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                 {/* Visual hint that map is drop zone */}
                 <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-dashed border-amber-400 text-amber-700 font-bold text-sm animate-pulse">
                    Upuść etykietę tutaj
                 </div>
            </div>
        )}

        <EuropeMap 
          onCountryClick={isCountryGame ? handleCountryMapClick : undefined}
          onFeatureClick={(!isCountryGame && physicalGameType === 'POINT') ? handlePhysicalMapFeatureClick : undefined}
          correctCodes={mapCorrectCodes}
          incorrectCodes={mapIncorrectCodes}
          physicalFeatures={physicalFeaturesToRender}
          selectedFeatureId={selectedFeatureIdForMap} // For ABCD/Match highlighting
          showLabels={false} // Hide labels in practice!
          className="w-full h-full bg-sky-200"
        />
      </div>

      {/* Sidebar Game Panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        
        {/* Score Card */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                    <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Wynik</p>
                    <p className="text-2xl font-black text-brand-dark">{score}</p>
                </div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Próby</p>
                <p className="text-xl font-bold text-gray-600 text-right">{attempts}</p>
            </div>
        </div>

        {/* Question Card */}
        <div className={`
             flex-1 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border-4 p-6 flex flex-col items-center justify-center text-center transition-all duration-300
             ${feedback === 'correct' ? 'border-green-300 bg-green-50' : ''}
             ${feedback === 'incorrect' ? 'border-red-300 bg-red-50' : 'border-white'}
        `}>
             <div className="mb-4 bg-brand-light/30 p-4 rounded-full">
                {feedback === 'correct' ? (
                     <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
                ) : feedback === 'incorrect' ? (
                     <AlertCircle className="w-12 h-12 text-red-500 animate-shake" />
                ) : (
                     <Target className="w-12 h-12 text-brand-dark animate-pulse-slow" />
                )}
             </div>

             {/* Question Text depends on Mode */}
             {isCountryGame && (
                 <>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Znajdź na mapie</h3>
                    <h2 className="text-3xl font-black text-slate-800 break-words leading-tight">{currentTargetName}</h2>
                 </>
             )}

             {!isCountryGame && physicalGameType === 'POINT' && (
                  <>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Wskaż na mapie</h3>
                    <h2 className="text-2xl font-black text-slate-800 break-words leading-tight">{currentTargetName}</h2>
                  </>
             )}

             {!isCountryGame && (physicalGameType === 'ABCD' || physicalGameType === 'MATCH') && (
                  <>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Co to za miejsce?</h3>
                    <p className="text-slate-500 text-sm mb-4">Spójrz na podświetlony element na mapie.</p>
                  </>
             )}

             {/* Feedback Messages */}
             {feedback === 'incorrect' && (
                  <p className="mt-4 text-red-500 font-bold animate-pulse bg-red-100 px-4 py-1 rounded-full text-sm">
                      Pudło! Spróbuj jeszcze raz.
                  </p>
             )}
             
             {feedback === 'correct' && (
                  <p className="mt-4 text-green-600 font-bold bg-green-100 px-4 py-1 rounded-full text-sm">
                      Świetnie! Dobra robota!
                  </p>
             )}
        </div>

        {/* Interaction Area (Options, Draggables, or Hints) */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border-2 border-white p-4 min-h-[120px] flex flex-col justify-center">
             
             {/* Country Game Hint */}
             {isCountryGame && targetId && feedback !== 'correct' && (
                 <div className="w-full">
                    {!hint ? (
                            <button 
                            onClick={async () => {
                                setLoadingHint(true);
                                const context = EUROPE_COUNTRIES[targetId].neighbors.map(c => EUROPE_COUNTRIES[c]?.name).filter(Boolean);
                                const txt = await getCountryHint(currentTargetName, context);
                                setHint(txt);
                                setLoadingHint(false);
                            }}
                            disabled={loadingHint}
                            className="w-full flex items-center justify-center gap-2 text-amber-700 hover:text-white font-bold text-sm bg-amber-100 hover:bg-amber-400 px-4 py-3 rounded-2xl transition-all duration-200"
                            >
                            <HelpCircle className="w-5 h-5" />
                            {loadingHint ? "Analizuję mapę..." : "Potrzebuję podpowiedzi"}
                            </button>
                    ) : (
                        <div className="animate-fade-in text-left">
                            <p className="text-xs font-bold text-amber-500 uppercase mb-1 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" /> Podpowiedź AI
                            </p>
                            <p className="text-slate-600 text-sm italic leading-relaxed">"{hint}"</p>
                        </div>
                    )}
                 </div>
             )}

             {/* ABCD Options */}
             {!isCountryGame && physicalGameType === 'ABCD' && feedback !== 'correct' && (
                 <div className="grid grid-cols-2 gap-2 w-full">
                     {abcdOptions.map(opt => (
                         <button 
                            key={opt.id}
                            onClick={() => handleAbcdSelect(opt.id)}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold py-2 px-1 rounded-xl"
                         >
                             {opt.name}
                         </button>
                     ))}
                 </div>
             )}

             {/* Match / Drag Options */}
             {!isCountryGame && physicalGameType === 'MATCH' && feedback !== 'correct' && (
                 <div className="flex flex-col gap-2 w-full">
                     <p className="text-xs text-center text-slate-400 mb-1">Przeciągnij poprawną nazwę:</p>
                     <div className="flex flex-wrap gap-2 justify-center">
                        {matchOptions.map(opt => (
                            <div 
                                key={opt.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, opt.id)}
                                className="cursor-grab active:cursor-grabbing bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-800 text-xs font-bold py-2 px-3 rounded-xl shadow-sm hover:scale-105 transition-transform"
                            >
                                {opt.name}
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             {feedback === 'correct' && (
                <p className="text-center text-gray-400 text-sm">Losowanie kolejnego pytania...</p>
             )}
        </div>

      </div>
    </div>
  );
};

export default PracticeModule;