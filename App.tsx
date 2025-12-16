import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import LearnModule from './components/LearnModule';
import PracticeModule from './components/PracticeModule';
import TestModule from './components/TestModule';
import { Globe, BookOpen, Target, PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  
  // Lifted state: Tracks visited countries per region to manage unlocks globally
  // Structure: { 'north': ['NO', 'SE'], 'west': [...] }
  const [visitedMap, setVisitedMap] = useState<Record<string, string[]>>({});

  // Physical map texture URL
  const bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";

  const renderContent = () => {
    switch (mode) {
      case AppMode.LEARN:
        return <LearnModule visitedMap={visitedMap} setVisitedMap={setVisitedMap} />;
      case AppMode.PRACTICE:
        return <PracticeModule visitedMap={visitedMap} />;
      case AppMode.TEST:
        return <TestModule />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative z-10">
            {/* Main Hero Card with Glassmorphism */}
            <div className="bg-white/80 backdrop-blur-md p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white/50 max-w-5xl w-full text-center">
              
              <div className="mb-10">
                 <div className="inline-block p-4 bg-brand rounded-full text-white mb-6 shadow-lg">
                    <Globe className="w-16 h-16 animate-pulse-slow" />
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-brand-dark mb-4 tracking-tight drop-shadow-sm">
                   Mapa Europy
                 </h1>
                 <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
                   Odkryj geografię Starego Kontynentu. Wybierz tryb, aby rozpocząć.
                 </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <button 
                  onClick={() => setMode(AppMode.LEARN)}
                  className="group relative bg-white hover:bg-brand-dark hover:text-white border-2 border-brand/20 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                >
                  <div className="bg-sky-100 p-4 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                    <BookOpen className="w-10 h-10 text-brand-dark group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Nauka</h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">
                    Poznaj położenie europejskich państw, wysp i półwyspów na mapie kontynentu oraz w regionach.
                  </p>
                </button>

                <button 
                   onClick={() => setMode(AppMode.PRACTICE)}
                   className="group relative bg-white hover:bg-amber-500 hover:text-white border-2 border-amber-200 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                >
                  <div className="bg-amber-100 p-4 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                    <Target className="w-10 h-10 text-amber-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Ćwiczenia</h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">
                    Szukaj państw, wysp i półwyspów na mapie bez stresu i limitu czasu.
                  </p>
                </button>

                <button 
                   onClick={() => setMode(AppMode.TEST)}
                   className="group relative bg-white hover:bg-rose-500 hover:text-white border-2 border-rose-200 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
                >
                  <div className="bg-rose-100 p-4 rounded-full mb-4 group-hover:bg-white/20 transition-colors">
                    <PenTool className="w-10 h-10 text-rose-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Test</h3>
                  <p className="text-sm font-medium opacity-80 leading-relaxed">
                    Sprawdź swoją wiedzę w wyzwaniu na czas.
                  </p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-hidden">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Blue overlay to ensure text readability and unified tone */}
      <div className="absolute inset-0 z-0 bg-sky-900/40 backdrop-blur-[2px]" />

      {/* Navigation Bar */}
      <nav className="relative z-50 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex items-center justify-between border-b border-white/20">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setMode(AppMode.HOME)}
        >
          <div className="bg-brand group-hover:bg-brand-dark transition-colors p-2 rounded-xl text-white shadow-md">
            <Globe size={24} />
          </div>
          <span className="font-bold text-2xl text-slate-800 tracking-tight hidden sm:block">Mapa Europy</span>
        </div>

        <div className="flex gap-2">
          <NavButton 
            active={mode === AppMode.LEARN} 
            onClick={() => setMode(AppMode.LEARN)}
            icon={<BookOpen size={18} />}
            label="Nauka"
          />
          <NavButton 
            active={mode === AppMode.PRACTICE} 
            onClick={() => setMode(AppMode.PRACTICE)}
            icon={<Target size={18} />}
            label="Ćwiczenia"
          />
          <NavButton 
            active={mode === AppMode.TEST} 
            onClick={() => setMode(AppMode.TEST)}
            icon={<PenTool size={18} />}
            label="Test"
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto max-w-7xl h-[calc(100vh-80px)]">
        {renderContent()}
      </main>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({active, onClick, icon, label}) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 border
      ${active 
        ? 'bg-brand text-white border-brand shadow-lg transform scale-105' 
        : 'bg-white/50 text-slate-600 border-transparent hover:bg-white hover:text-brand-dark'}
    `}
  >
    {icon}
    <span className="hidden md:block">{label}</span>
  </button>
);

export default App;