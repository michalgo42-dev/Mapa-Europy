import React, { useState, useEffect, useMemo } from 'react';
import EuropeMap from './EuropeMap';
import { EUROPE_COUNTRIES, PHYSICAL_FEATURES, POLITICAL_REGIONS } from '../constants';
import { TestQuestion, TestQuestionType, PhysicalFeature } from '../types';
import { Timer, CheckCircle, XCircle, RotateCcw, HelpCircle, MapPin, MousePointer2, LayoutGrid, Move, AlertTriangle, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS_COUNT = 20;
const TIME_LIMIT = 600; // 10 minutes for 20 questions

const TestModule: React.FC = () => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [results, setResults] = useState<{question: TestQuestion, correct: boolean}[]>([]);
  
  // Feedback state for immediate interaction
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // --- QUESTION GENERATION LOGIC ---
  const generateQuestions = () => {
    const newQuestions: TestQuestion[] = [];
    const allCountryCodes = Object.keys(EUROPE_COUNTRIES);
    
    // Helper to get random item
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    // Helper to get distractors
    const getDistractors = (correctId: string, pool: {id: string, name: string}[], count: number) => {
        const filtered = pool.filter(i => i.id !== correctId);
        return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
    };

    const countryPool = allCountryCodes.map(c => ({ id: c, name: EUROPE_COUNTRIES[c].name }));
    const featurePool = PHYSICAL_FEATURES.map(f => ({ id: f.id, name: f.name }));
    const mixedPool = [...countryPool, ...featurePool];

    for (let i = 0; i < QUESTIONS_COUNT; i++) {
        // Distribute types somewhat evenly or randomly
        // 1: Point, 2: Identify, 3: Drag, 4: OddOneOut
        const randType = Math.floor(Math.random() * 4); 
        let type: TestQuestionType = 'POINT_ON_MAP';
        if (randType === 1) type = 'IDENTIFY_ABCD';
        if (randType === 2) type = 'DRAG_AND_DROP';
        if (randType === 3) type = 'ODD_ONE_OUT';

        // 50/50 chance for Country vs Physical (except OddOneOut which is region based)
        const isPhysical = Math.random() > 0.5 && type !== 'ODD_ONE_OUT'; 
        
        let q: TestQuestion | null = null;

        if (type === 'ODD_ONE_OUT') {
             // Logic for Odd One Out (Region based)
             const region = randomItem(POLITICAL_REGIONS);
             // Pick 3 countries IN the region
             if (region.countries.length < 3) {
                 // Fallback if region is too small (shouldn't happen with current data)
                 i--; continue; 
             }
             const inRegionCodes = [...region.countries].sort(() => 0.5 - Math.random()).slice(0, 3);
             
             // Pick 1 country NOT in the region
             let outRegionCode = randomItem(allCountryCodes);
             while (region.countries.includes(outRegionCode)) {
                 outRegionCode = randomItem(allCountryCodes);
             }

             const options = [
                 ...inRegionCodes.map(c => ({ id: c, name: EUROPE_COUNTRIES[c].name })),
                 { id: outRegionCode, name: EUROPE_COUNTRIES[outRegionCode].name }
             ].sort(() => 0.5 - Math.random());

             q = {
                 id: i,
                 type: 'ODD_ONE_OUT',
                 targetId: region.id,
                 targetName: region.name,
                 category: 'COUNTRY',
                 questionText: `Które państwo NIE leży w regionie: ${region.name}?`,
                 correctAnswerId: outRegionCode,
                 options
             };

        } else if (type === 'POINT_ON_MAP') {
            const target = isPhysical ? randomItem(featurePool) : randomItem(countryPool);
            q = {
                id: i,
                type: 'POINT_ON_MAP',
                targetId: target.id,
                targetName: target.name,
                category: isPhysical ? 'PHYSICAL' : 'COUNTRY',
                questionText: isPhysical ? `Wskaż na mapie: ${target.name}` : `Wskaż na mapie państwo: ${target.name}`,
                correctAnswerId: target.id
            };

        } else if (type === 'IDENTIFY_ABCD') {
            const target = isPhysical ? randomItem(featurePool) : randomItem(countryPool);
            const pool = isPhysical ? featurePool : countryPool;
            const distractors = getDistractors(target.id, pool, 3);
            const options = [...distractors, target].sort(() => 0.5 - Math.random());

            q = {
                id: i,
                type: 'IDENTIFY_ABCD',
                targetId: target.id,
                targetName: target.name,
                category: isPhysical ? 'PHYSICAL' : 'COUNTRY',
                questionText: isPhysical ? `Jak nazywa się zaznaczona wyspa lub półwysep?` : `Jak nazywa się zaznaczone państwo?`,
                correctAnswerId: target.id,
                options
            };

        } else if (type === 'DRAG_AND_DROP') {
            const target = isPhysical ? randomItem(featurePool) : randomItem(countryPool);
            const pool = isPhysical ? featurePool : countryPool;
            const distractors = getDistractors(target.id, pool, 3);
            const options = [...distractors, target].sort(() => 0.5 - Math.random());

            q = {
                id: i,
                type: 'DRAG_AND_DROP',
                targetId: target.id,
                targetName: target.name,
                category: isPhysical ? 'PHYSICAL' : 'COUNTRY',
                questionText: `Przeciągnij poprawną nazwę na zaznaczony obszar mapy.`,
                correctAnswerId: target.id,
                options
            };
        }

        if (q) newQuestions.push(q);
    }
    return newQuestions;
  };

  // --- GAMEPLAY CONTROL ---
  const startTest = () => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
    setTimeLeft(TIME_LIMIT);
    setGameState('playing');
    setLastFeedback(null);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const finishTest = () => {
    setGameState('finished');
  };

  const handleAnswer = (providedId: string) => {
      if (gameState !== 'playing') return;
      if (lastFeedback !== null) return; // Prevent double clicking during transition

      const currentQ = questions[currentIndex];
      const isCorrect = providedId === currentQ.correctAnswerId;

      if (isCorrect) {
          setScore(prev => prev + 1);
          setLastFeedback('correct');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#4ade80', '#22d3ee'] });
      } else {
          setLastFeedback('incorrect');
      }

      setResults(prev => [...prev, { question: currentQ, correct: isCorrect }]);

      // Delay next question slightly to show feedback
      setTimeout(() => {
          setLastFeedback(null);
          if (currentIndex + 1 >= QUESTIONS_COUNT) {
              finishTest();
          } else {
              setCurrentIndex(prev => prev + 1);
          }
      }, 1000);
  };

  const handleSkip = () => {
     if (gameState !== 'playing' || lastFeedback !== null) return;
     
     // Treated as incorrect but immediate feedback
     setLastFeedback('incorrect');
     setResults(prev => [...prev, { question: questions[currentIndex], correct: false }]);
     
     setTimeout(() => {
         setLastFeedback(null);
         if (currentIndex + 1 >= QUESTIONS_COUNT) {
             finishTest();
         } else {
             setCurrentIndex(prev => prev + 1);
         }
     }, 1000);
  };

  // --- INTERACTION HANDLERS ---
  const handleMapClick = (code: string) => { // Code could be country code OR feature code (implicit via EuropeMap prop logic)
     const currentQ = questions[currentIndex];
     if (currentQ.type === 'POINT_ON_MAP') {
         // Logic check: if expecting physical, user might click country underneath.
         // EuropeMap handles click propagation.
         // If category is COUNTRY, we expect code to be country code.
         // If category is PHYSICAL, we handle feature click separately below, but if user clicks background map country...
         if (currentQ.category === 'COUNTRY') {
             handleAnswer(code);
         }
     }
  };

  const handleFeatureClick = (feature: PhysicalFeature) => {
      const currentQ = questions[currentIndex];
      if (currentQ.type === 'POINT_ON_MAP' && currentQ.category === 'PHYSICAL') {
          handleAnswer(feature.id);
      }
  };

  // For Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const droppedId = e.dataTransfer.getData("text/plain");
      handleAnswer(droppedId);
  };


  // --- RENDER ---
  const currentQ = questions[currentIndex];

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-4 bg-sky-50 animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg border-4 border-white">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Wielki Test Geograficzny</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Przygotowaliśmy 20 pytań. Masz 10 minut.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left text-sm text-slate-500">
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                 <MousePointer2 size={16} /> Wskaż na mapie
             </div>
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                 <LayoutGrid size={16} /> Wybierz odpowiedź
             </div>
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                 <Move size={16} /> Przeciągnij i upuść
             </div>
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                 <AlertTriangle size={16} /> Wyklucz niepasujące
             </div>
          </div>

          <button 
            onClick={startTest}
            className="w-full bg-brand hover:bg-brand-dark text-white text-xl font-bold py-4 px-10 rounded-2xl shadow-lg transition-transform transform hover:scale-105"
          >
            Rozpocznij Test
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] p-4 bg-sky-50 animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-2xl border-4 border-white w-full flex flex-col max-h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Koniec Testu!</h2>
          <div className="text-6xl font-black text-brand mb-6">{score} / {QUESTIONS_COUNT}</div>
          
          <div className="flex-1 overflow-y-auto w-full mb-6 pr-2">
            <div className="space-y-2">
                {results.map((res, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-left">
                        <span className="text-xs font-bold text-gray-400 block">Pytanie {idx + 1} ({res.question.type === 'ODD_ONE_OUT' ? 'Wyklucz' : 'Mapa'})</span>
                        <span className="text-gray-700 font-medium text-sm line-clamp-1">
                            {res.question.questionText}
                        </span>
                    </div>
                    {res.correct ? (
                    <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                    ) : (
                    <XCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
                    )}
                </div>
                ))}
            </div>
          </div>

          <button 
            onClick={startTest}
            className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            Spróbuj Ponownie
          </button>
        </div>
      </div>
    );
  }

  // Determine Map Props based on Question Type
  const showMap = currentQ.type !== 'ODD_ONE_OUT';
  const highlightedCode = (currentQ.type === 'IDENTIFY_ABCD' || currentQ.type === 'DRAG_AND_DROP') && currentQ.category === 'COUNTRY' ? [currentQ.targetId] : [];
  const selectedFeatureId = (currentQ.type === 'IDENTIFY_ABCD' || currentQ.type === 'DRAG_AND_DROP') && currentQ.category === 'PHYSICAL' ? currentQ.targetId : null;
  
  // Visual feedback overlay
  const overlayColor = lastFeedback === 'correct' ? 'bg-green-500/20' : lastFeedback === 'incorrect' ? 'bg-red-500/20' : '';

  return (
    <div className="h-[calc(100vh-80px)] p-4 flex flex-col gap-4">
      {/* HUD */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-brand-light">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase">Pytanie</span>
                <span className="text-xl font-bold text-brand-dark">{currentIndex + 1} / {QUESTIONS_COUNT}</span>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase">Wynik</span>
                <span className="text-xl font-bold text-slate-800">{score}</span>
            </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
            <Timer className="w-5 h-5" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          
          {/* LEFT SIDE: MAP AREA (or Placeholder for Type 4) */}
          <div 
            className={`flex-1 bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden relative transition-colors duration-300 ${overlayColor}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
             {showMap ? (
                 <>
                    {/* Interaction Hint Overlay */}
                    {currentQ.type === 'DRAG_AND_DROP' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-white/80 backdrop-blur px-4 py-1 rounded-full text-xs font-bold text-brand border border-brand/20">
                            Upuść tutaj
                        </div>
                    )}
                    
                    <EuropeMap 
                        onCountryClick={handleMapClick}
                        onFeatureClick={handleFeatureClick}
                        highlightedCodes={highlightedCode} // For Identify/Drag tasks
                        selectedFeatureId={selectedFeatureId} // For Identify/Drag tasks
                        physicalFeatures={PHYSICAL_FEATURES} // Always render features so they can be targets
                        showLabels={false}
                        className="w-full h-full bg-sky-200"
                    />
                 </>
             ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 p-8 text-center">
                     <AlertTriangle className="w-24 h-24 text-indigo-300 mb-6" />
                     <h2 className="text-3xl font-black text-indigo-900 mb-4">{currentQ.questionText}</h2>
                     <p className="text-indigo-600">Wybierz odpowiedź z listy obok.</p>
                 </div>
             )}
          </div>

          {/* RIGHT SIDE: CONTROL / QUESTION PANEL */}
          <div className="w-full md:w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border-4 border-white p-6 flex flex-col justify-center gap-6 relative">
               
               <div className="text-center">
                   {currentQ.type === 'POINT_ON_MAP' && <MousePointer2 className="w-10 h-10 text-brand mx-auto mb-2" />}
                   {currentQ.type === 'IDENTIFY_ABCD' && <LayoutGrid className="w-10 h-10 text-brand mx-auto mb-2" />}
                   {currentQ.type === 'DRAG_AND_DROP' && <Move className="w-10 h-10 text-brand mx-auto mb-2" />}
                   {currentQ.type === 'ODD_ONE_OUT' && <AlertTriangle className="w-10 h-10 text-brand mx-auto mb-2" />}
                   
                   <h3 className="text-lg font-bold text-slate-800 leading-tight">
                       {currentQ.questionText}
                   </h3>
               </div>

               {/* OPTIONS RENDERER */}
               <div className="flex-1 flex flex-col justify-center gap-3">
                   
                   {/* TYPE 1: POINT ON MAP (No buttons, just hint) */}
                   {currentQ.type === 'POINT_ON_MAP' && (
                       <div className="bg-sky-50 p-4 rounded-xl text-center text-sm text-sky-800 border border-sky-100">
                           Kliknij odpowiednie miejsce na mapie.
                       </div>
                   )}

                   {/* TYPE 2 & 4: ABCD Selection */}
                   {(currentQ.type === 'IDENTIFY_ABCD' || currentQ.type === 'ODD_ONE_OUT') && currentQ.options?.map(opt => (
                       <button
                          key={opt.id}
                          onClick={() => handleAnswer(opt.id)}
                          disabled={lastFeedback !== null}
                          className="w-full p-4 rounded-xl bg-slate-50 hover:bg-brand hover:text-white border border-slate-200 font-bold transition-all text-sm shadow-sm active:scale-95"
                       >
                           {opt.name}
                       </button>
                   ))}

                   {/* TYPE 3: DRAG AND DROP */}
                   {currentQ.type === 'DRAG_AND_DROP' && (
                       <div className="grid grid-cols-1 gap-3">
                           {currentQ.options?.map(opt => (
                               <div
                                   key={opt.id}
                                   draggable
                                   onDragStart={(e) => handleDragStart(e, opt.id)}
                                   className="cursor-grab active:cursor-grabbing w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-900 font-bold text-center shadow-sm transition-transform hover:scale-105 select-none"
                               >
                                   {opt.name}
                               </div>
                           ))}
                           <p className="text-xs text-center text-slate-400 mt-2">Przeciągnij kafelek na mapę</p>
                       </div>
                   )}
               </div>
               
               {/* FEEDBACK STATUS */}
               <div className="h-8 flex items-center justify-center">
                   {lastFeedback === 'correct' && <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-sm animate-bounce">Dobrze!</span>}
                   {lastFeedback === 'incorrect' && <span className="text-red-500 font-bold bg-red-100 px-3 py-1 rounded-full text-sm animate-shake">Źle!</span>}
               </div>

               {/* SKIP BUTTON */}
               <div className="border-t border-slate-100 pt-4">
                    <button 
                        onClick={handleSkip}
                        disabled={lastFeedback !== null}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl transition-all"
                    >
                        <SkipForward size={16} />
                        Pomiń pytanie
                    </button>
               </div>

          </div>
      </div>
    </div>
  );
};

export default TestModule;