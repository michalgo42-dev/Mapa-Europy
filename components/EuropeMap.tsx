import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { GeoJSONData, CountryFeature, PhysicalFeature } from '../types';
import { MAP_GEOJSON_URL, EUROPE_COUNTRIES } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Mountain } from 'lucide-react';

interface EuropeMapProps {
  onCountryClick?: (code: string, name: string) => void;
  onFeatureClick?: (feature: PhysicalFeature) => void;
  highlightedCodes?: string[]; // Array of country codes to force highlight
  correctCodes?: string[]; // Array of correctly guessed codes (green)
  incorrectCodes?: string[]; // Array of incorrectly guessed codes (red)
  physicalFeatures?: PhysicalFeature[]; // List of physical features to render markers for
  selectedFeatureId?: string | null;
  className?: string;
  showLabels?: boolean;
}

// List of microstates (and small states) that need larger hit targets and special highlighting
const MICROSTATES = ['AD', 'LI', 'MT', 'SM', 'VA', 'MC', 'LU', 'XK'];

const EuropeMap: React.FC<EuropeMapProps> = ({ 
  onCountryClick, 
  onFeatureClick,
  highlightedCodes = [], 
  correctCodes = [], 
  incorrectCodes = [],
  physicalFeatures = [],
  selectedFeatureId = null,
  className,
  showLabels = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zoom behavior reference
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Load Map Data
  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await fetch(MAP_GEOJSON_URL);
        if (!res.ok) throw new Error('Failed to fetch map data');
        const data = await res.json();
        setGeoData(data);
      } catch (err) {
        console.error("Map loading error:", err);
        setError("Nie udało się pobrać mapy.");
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  // Initialize Zoom
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12]) // Allow deep zoom for microstates
      .translateExtent([[-100, -100], [900, 750]])
      .on('zoom', (event) => {
        if (gRef.current) {
          d3.select(gRef.current).attr('transform', event.transform);
        }
      });
    
    zoomBehavior.current = zoom;
    d3.select(svgRef.current).call(zoom);

  }, [loading]); // Re-run if loading finishes and elements exist

  // Projection logic
  const { pathGenerator, projection, projectedFeatures } = useMemo(() => {
    if (!geoData) return { pathGenerator: null, projection: null, projectedFeatures: [] };

    // Fit map to standard size
    const proj = d3.geoMercator().fitSize([800, 650], geoData as any);
    const generator = d3.geoPath().projection(proj);

    return { 
      pathGenerator: generator,
      projection: proj,
      projectedFeatures: geoData.features 
    };
  }, [geoData]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 0.66);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomBehavior.current.transform, d3.zoomIdentity);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full text-brand-dark flex-col gap-2">
      <div className="w-8 h-8 border-4 border-brand-light border-t-brand rounded-full animate-spin"></div>
      <span className="animate-pulse">Ładowanie mapy...</span>
    </div>
  );
  
  if (error || !geoData) return <div className="flex justify-center items-center h-full text-red-500 font-bold">{error || "Błąd danych mapy."}</div>;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <svg 
        ref={svgRef}
        viewBox="0 0 800 650" 
        className="w-full h-full cursor-grab active:cursor-grabbing drop-shadow-xl select-none touch-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ocean/Background Catch for Dragging */}
        <rect width="800" height="650" fill="transparent" />

        <g ref={gRef}>
          {projectedFeatures.map((feature: CountryFeature, index: number) => {
            const props: any = feature.properties || {};
            const isoCode = props.ISO_A2 || props.iso_a2 || props.ISO2 || props.id || "UNKNOWN";
            const countryInfo = EUROPE_COUNTRIES[isoCode];
            
            const pathData = pathGenerator ? pathGenerator(feature) : "";
            if (!pathData) return null;

            // Render non-European/Context countries
            if (!countryInfo) {
              return (
                 <path
                    key={`bg-${index}`}
                    d={pathData}
                    fill="#cbd5e1"
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                    className="pointer-events-none opacity-50"
                  />
              );
            }

            // Styling logic
            const isHovered = hoveredCode === isoCode;
            const isHighlighted = highlightedCodes.includes(isoCode); 
            const isCorrect = correctCodes.includes(isoCode);
            const isIncorrect = incorrectCodes.includes(isoCode);
            const isMicrostate = MICROSTATES.includes(isoCode);
            
            let fillColor = "#ffffff";
            let strokeColor = "#475569";
            let strokeWidth = 0.75;
            let zIndex = 1;

            if (isCorrect) {
              fillColor = "#4ade80"; // Green-400
              strokeColor = "#166534";
              zIndex = 2;
            } else if (isIncorrect) {
              fillColor = "#f87171";
              strokeColor = "#991b1b";
              zIndex = 2;
            } else if (isHovered && !physicalFeatures.length) { 
              // Only highlight countries on hover if NOT in physical feature mode
              fillColor = "#fcd34d";
              strokeColor = "#78350f";
              strokeWidth = 2;
              zIndex = 20;
            } else if (isMicrostate && isHighlighted) {
              // Special highlighting for microstates in the active region (if not yet discovered)
              fillColor = "#e879f9"; 
              strokeColor = "#86198f";
              zIndex = 15;
            } else if (isHighlighted) {
              fillColor = "#22d3ee"; 
              zIndex = 10;
              strokeColor = "#0e7490";
              strokeWidth = 2;
            }

            // Calculate centroid for microstate hit bubble
            let centroid: [number, number] | null = null;
            if (isMicrostate && pathGenerator) {
                centroid = pathGenerator.centroid(feature);
            }

            return (
              <React.Fragment key={isoCode}>
                <path
                  d={pathData}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  vectorEffect="non-scaling-stroke"
                  onMouseEnter={() => setHoveredCode(isoCode)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onClick={(e) => {
                     // Always allow country click if handler exists. Parent decides logic.
                     e.stopPropagation();
                     onCountryClick && onCountryClick(isoCode, countryInfo.name);
                  }}
                  className={`transition-colors duration-200 outline-none ${isMicrostate && isHighlighted && !isCorrect && !isHovered ? 'animate-pulse' : ''}`}
                />

                {/* Invisible Hit Area for Microstates - Always render if microstate */}
                {isMicrostate && centroid && (
                    <circle 
                        cx={centroid[0]} 
                        cy={centroid[1]} 
                        r={12}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredCode(isoCode)}
                        onMouseLeave={() => setHoveredCode(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCountryClick && onCountryClick(isoCode, countryInfo.name);
                        }}
                    >
                         {showLabels && <title>{countryInfo.name}</title>}
                    </circle>
                )}
                
                {showLabels && !isMicrostate && !physicalFeatures.length && (
                     <path d={pathData} fill="transparent" stroke="none" className="pointer-events-none">
                         <title>{countryInfo.name}</title>
                     </path>
                )}
              </React.Fragment>
            );
          })}

          {/* PHYSICAL FEATURES MARKERS LAYER */}
          {physicalFeatures.map((feature) => {
             if (!projection) return null;
             const [cx, cy] = projection(feature.coords);
             const isSelected = selectedFeatureId === feature.id;
             const isHovered = hoveredFeatureId === feature.id;

             return (
               <g 
                  key={feature.id} 
                  className="cursor-pointer transition-all"
                  onClick={(e) => {
                      e.stopPropagation();
                      onFeatureClick && onFeatureClick(feature);
                  }}
                  onMouseEnter={() => setHoveredFeatureId(feature.id)}
                  onMouseLeave={() => setHoveredFeatureId(null)}
               >
                   {/* Pulse animation for selected */}
                   {isSelected && (
                      <circle cx={cx} cy={cy} r={20} className="fill-brand/30 animate-ping" />
                   )}
                   
                   {/* Background circle */}
                   <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isSelected || isHovered ? 14 : 10} 
                      className={`
                          transition-all duration-300 shadow-lg
                          ${feature.type === 'peninsula' ? 'fill-emerald-100 stroke-emerald-600' : 'fill-sky-100 stroke-sky-600'}
                          ${isSelected ? 'stroke-[3px]' : 'stroke-2'}
                      `}
                   />

                   {/* Icon */}
                   <g transform={`translate(${cx - (isSelected || isHovered ? 8 : 6)}, ${cy - (isSelected || isHovered ? 8 : 6)})`}>
                       {feature.type === 'peninsula' ? (
                           <Mountain size={isSelected || isHovered ? 16 : 12} className="text-emerald-700" />
                       ) : (
                           <MapPin size={isSelected || isHovered ? 16 : 12} className="text-sky-700" />
                       )}
                   </g>
                   
                   {/* Label on Hover/Select */}
                   {(isHovered || isSelected) && (
                       <g transform={`translate(${cx}, ${cy - 25})`}>
                          <rect x="-60" y="-20" width="120" height="24" rx="4" className="fill-slate-800/90" />
                          <text x="0" y="-4" textAnchor="middle" className="fill-white text-[10px] font-bold">
                              {feature.name}
                          </text>
                       </g>
                   )}
               </g>
             );
          })}
        </g>
      </svg>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-2 z-40">
        <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-brand hover:text-white rounded-lg transition-colors text-slate-600"
            title="Przybliż"
        >
            <ZoomIn size={24} />
        </button>
        <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-brand hover:text-white rounded-lg transition-colors text-slate-600"
            title="Oddal"
        >
            <ZoomOut size={24} />
        </button>
        <div className="h-px bg-slate-200 my-1"></div>
        <button 
            onClick={handleResetZoom}
            className="p-2 hover:bg-brand hover:text-white rounded-lg transition-colors text-slate-600"
            title="Zresetuj widok"
        >
            <RotateCcw size={20} />
        </button>
      </div>

      {/* Country Name Tooltip for Hover (Only if not in feature mode) */}
      {showLabels && hoveredCode && EUROPE_COUNTRIES[hoveredCode] && !physicalFeatures.length && (
        <div 
            className="absolute bg-slate-800/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-600 pointer-events-none z-50 animate-fade-in-up"
            style={{ 
                bottom: '20px',
                left: '20px'
            }}
        >
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
             <p className="font-bold text-white text-lg tracking-wide">
                {EUROPE_COUNTRIES[hoveredCode].name}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EuropeMap;