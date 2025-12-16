import { CountryData, RegionData, PoliticalRegion, PhysicalFeature } from './types';

// Mapping English names (from GeoJSON) to Polish names, codes, and neighbors
export const EUROPE_COUNTRIES: Record<string, CountryData> = {
  'AL': { name: 'Albania', englishName: 'Albania', code: 'AL', neighbors: ['ME', 'XK', 'MK', 'GR'] },
  'AD': { name: 'Andora', englishName: 'Andorra', code: 'AD', neighbors: ['FR', 'ES'] },
  'AT': { name: 'Austria', englishName: 'Austria', code: 'AT', neighbors: ['DE', 'CZ', 'SK', 'HU', 'SI', 'IT', 'CH', 'LI'] },
  'BY': { name: 'Białoruś', englishName: 'Belarus', code: 'BY', neighbors: ['LV', 'LT', 'PL', 'UA', 'RU'] },
  'BE': { name: 'Belgia', englishName: 'Belgium', code: 'BE', neighbors: ['NL', 'DE', 'LU', 'FR'] },
  'BA': { name: 'Bośnia i Hercegowina', englishName: 'Bosnia and Herzegovina', code: 'BA', neighbors: ['HR', 'RS', 'ME'] },
  'BG': { name: 'Bułgaria', englishName: 'Bulgaria', code: 'BG', neighbors: ['RO', 'RS', 'MK', 'GR', 'TR'] },
  'HR': { name: 'Chorwacja', englishName: 'Croatia', code: 'HR', neighbors: ['SI', 'HU', 'RS', 'BA', 'ME'] },
  'CY': { name: 'Cypr', englishName: 'Cyprus', code: 'CY', neighbors: [] },
  'CZ': { name: 'Czechy', englishName: 'Czech Republic', code: 'CZ', neighbors: ['DE', 'PL', 'SK', 'AT'] },
  'DK': { name: 'Dania', englishName: 'Denmark', code: 'DK', neighbors: ['DE'] },
  'EE': { name: 'Estonia', englishName: 'Estonia', code: 'EE', neighbors: ['RU', 'LV'] },
  'FI': { name: 'Finlandia', englishName: 'Finland', code: 'FI', neighbors: ['SE', 'NO', 'RU'] },
  'FR': { name: 'Francja', englishName: 'France', code: 'FR', neighbors: ['BE', 'LU', 'DE', 'CH', 'IT', 'MC', 'ES', 'AD'] },
  'DE': { name: 'Niemcy', englishName: 'Germany', code: 'DE', neighbors: ['DK', 'PL', 'CZ', 'AT', 'CH', 'FR', 'LU', 'BE', 'NL'] },
  'GR': { name: 'Grecja', englishName: 'Greece', code: 'GR', neighbors: ['AL', 'MK', 'BG', 'TR'] },
  'HU': { name: 'Węgry', englishName: 'Hungary', code: 'HU', neighbors: ['SK', 'UA', 'RO', 'RS', 'HR', 'SI', 'AT'] },
  'IS': { name: 'Islandia', englishName: 'Iceland', code: 'IS', neighbors: [] },
  'IE': { name: 'Irlandia', englishName: 'Ireland', code: 'IE', neighbors: ['GB'] },
  'IT': { name: 'Włochy', englishName: 'Italy', code: 'IT', neighbors: ['FR', 'CH', 'AT', 'SI', 'SM', 'VA'] },
  'XK': { name: 'Kosowo', englishName: 'Kosovo', code: 'XK', neighbors: ['RS', 'MK', 'AL', 'ME'] },
  'LV': { name: 'Łotwa', englishName: 'Latvia', code: 'LV', neighbors: ['EE', 'RU', 'BY', 'LT'] },
  'LI': { name: 'Liechtenstein', englishName: 'Liechtenstein', code: 'LI', neighbors: ['CH', 'AT'] },
  'LT': { name: 'Litwa', englishName: 'Lithuania', code: 'LT', neighbors: ['LV', 'BY', 'PL', 'RU'] },
  'LU': { name: 'Luksemburg', englishName: 'Luxembourg', code: 'LU', neighbors: ['BE', 'DE', 'FR'] },
  'MK': { name: 'Macedonia Północna', englishName: 'North Macedonia', code: 'MK', neighbors: ['XK', 'RS', 'BG', 'GR', 'AL'] },
  'MT': { name: 'Malta', englishName: 'Malta', code: 'MT', neighbors: [] },
  'MD': { name: 'Mołdawia', englishName: 'Moldova', code: 'MD', neighbors: ['RO', 'UA'] },
  'ME': { name: 'Czarnogóra', englishName: 'Montenegro', code: 'ME', neighbors: ['HR', 'BA', 'RS', 'XK', 'AL'] },
  'NL': { name: 'Holandia', englishName: 'Netherlands', code: 'NL', neighbors: ['DE', 'BE'] },
  'NO': { name: 'Norwegia', englishName: 'Norway', code: 'NO', neighbors: ['SE', 'FI', 'RU'] },
  'PL': { name: 'Polska', englishName: 'Poland', code: 'PL', neighbors: ['DE', 'CZ', 'SK', 'UA', 'BY', 'LT', 'RU'] },
  'PT': { name: 'Portugalia', englishName: 'Portugal', code: 'PT', neighbors: ['ES'] },
  'RO': { name: 'Rumunia', englishName: 'Romania', code: 'RO', neighbors: ['HU', 'UA', 'MD', 'BG', 'RS'] },
  'RU': { name: 'Rosja', englishName: 'Russia', code: 'RU', neighbors: ['NO', 'FI', 'EE', 'LV', 'BY', 'UA', 'GE', 'AZ', 'KZ', 'LT', 'PL'] }, 
  'SM': { name: 'San Marino', englishName: 'San Marino', code: 'SM', neighbors: ['IT'] },
  'RS': { name: 'Serbia', englishName: 'Serbia', code: 'RS', neighbors: ['HU', 'RO', 'BG', 'MK', 'XK', 'ME', 'BA', 'HR'] },
  'SK': { name: 'Słowacja', englishName: 'Slovakia', code: 'SK', neighbors: ['CZ', 'PL', 'UA', 'HU', 'AT'] },
  'SI': { name: 'Słowenia', englishName: 'Slovenia', code: 'SI', neighbors: ['IT', 'AT', 'HU', 'HR'] },
  'ES': { name: 'Hiszpania', englishName: 'Spain', code: 'ES', neighbors: ['PT', 'FR', 'AD'] },
  'SE': { name: 'Szwecja', englishName: 'Sweden', code: 'SE', neighbors: ['NO', 'FI'] },
  'CH': { name: 'Szwajcaria', englishName: 'Switzerland', code: 'CH', neighbors: ['FR', 'DE', 'AT', 'LI', 'IT'] },
  'TR': { name: 'Turcja', englishName: 'Turkey', code: 'TR', neighbors: ['GR', 'BG'] }, // Only European neighbors relevant for this map usually
  'UA': { name: 'Ukraina', englishName: 'Ukraine', code: 'UA', neighbors: ['RU', 'BY', 'PL', 'SK', 'HU', 'RO', 'MD'] },
  'GB': { name: 'Wielka Brytania', englishName: 'United Kingdom', code: 'GB', neighbors: ['IE'] },
  'VA': { name: 'Watykan', englishName: 'Vatican City', code: 'VA', neighbors: ['IT'] }
};

// Deprecated EUROPE_REGIONS replaced by PHYSICAL_FEATURES
export const EUROPE_REGIONS: RegionData[] = []; 

export const PHYSICAL_FEATURES: PhysicalFeature[] = [
  // --- Peninsulas ---
  {
    id: 'p_scandinavian',
    name: 'Półwysep Skandynawski',
    type: 'peninsula',
    coords: [15.0, 63.0], // Sweden/Norway center
    description: 'Największy półwysep Europy. Obejmuje Norwegię, Szwecję i część Finlandii.'
  },
  {
    id: 'p_kola',
    name: 'Półwysep Kolski',
    type: 'peninsula',
    coords: [35.0, 67.5], // Northwest Russia
    description: 'Położony na dalekiej północy Rosji, oddziela Morze Białe od Morza Barentsa.'
  },
  {
    id: 'p_jutland',
    name: 'Półwysep Jutlandzki',
    type: 'peninsula',
    coords: [9.0, 56.0], // Denmark
    description: 'Stanowi kontynentalną część Danii oraz północną część Niemiec.'
  },
  {
    id: 'p_iberian',
    name: 'Półwysep Iberyjski',
    type: 'peninsula',
    coords: [-4.0, 40.0], // Spain/Portugal
    description: 'Oddzielony od reszty Europy Pirenejami. Leżą tu Hiszpania i Portugalia.'
  },
  {
    id: 'p_apennine',
    name: 'Półwysep Apeniński',
    type: 'peninsula',
    coords: [13.0, 42.5], // Italy
    description: 'Charakterystyczny kształt "buta". Zajmowany głównie przez Włochy.'
  },
  {
    id: 'p_balkan',
    name: 'Półwysep Bałkański',
    type: 'peninsula',
    coords: [22.0, 42.0], // Balkans
    description: 'Duży region w południowo-wschodniej Europie, obejmujący wiele państw m.in. Grecję.'
  },
  {
    id: 'p_crimean',
    name: 'Półwysep Krymski',
    type: 'peninsula',
    coords: [34.0, 45.0], // Crimea
    description: 'Wcina się głęboko w Morze Czarne, połączony z lądem wąskim przesmykiem.'
  },
  {
    id: 'p_breton',
    name: 'Półwysep Bretoński',
    type: 'peninsula',
    coords: [-3.0, 48.0], // Brittany, France
    description: 'Wysunięta na zachód część Francji, nad Oceanem Atlantyckim.'
  },

  // --- Islands ---
  {
    id: 'i_gb',
    name: 'Wielka Brytania',
    type: 'island',
    coords: [-2.0, 54.0],
    parentCountry: 'Wielka Brytania',
    description: 'Największa wyspa w Europie, oddzielona od kontynentu kanałem La Manche.'
  },
  {
    id: 'i_iceland',
    name: 'Islandia',
    type: 'island',
    coords: [-19.0, 65.0],
    parentCountry: 'Islandia',
    description: 'Wyspa wulkaniczna na granicy Oceanu Arktycznego i Atlantyckiego.'
  },
  {
    id: 'i_ireland',
    name: 'Irlandia',
    type: 'island',
    coords: [-8.0, 53.0],
    parentCountry: 'Irlandia / Wielka Brytania',
    description: 'Druga co do wielkości wyspa Wysp Brytyjskich, zwana "Szmaragdową Wyspą".'
  },
  {
    id: 'i_sicily',
    name: 'Sycylia',
    type: 'island',
    coords: [14.0, 37.5],
    parentCountry: 'Włochy',
    description: 'Największa wyspa na Morzu Śródziemnym, położona tuż przy "czubku buta" włoskiego.'
  },
  {
    id: 'i_sardinia',
    name: 'Sardynia',
    type: 'island',
    coords: [9.0, 40.0],
    parentCountry: 'Włochy',
    description: 'Druga co do wielkości wyspa na Morzu Śródziemnym, leży na zachód od Płw. Apenińskiego.'
  },
  {
    id: 'i_corsica',
    name: 'Korsyka',
    type: 'island',
    coords: [9.0, 42.0],
    parentCountry: 'Francja',
    description: 'Górzysta wyspa na północ od Sardynii, miejsce urodzenia Napoleona.'
  },
  {
    id: 'i_cyprus',
    name: 'Cypr',
    type: 'island',
    coords: [33.0, 35.0],
    parentCountry: 'Cypr',
    description: 'Położona we wschodniej części Morza Śródziemnego, geograficznie blisko Azji.'
  },
  {
    id: 'i_malta',
    name: 'Malta',
    type: 'island',
    coords: [14.4, 35.9],
    parentCountry: 'Malta',
    description: 'Niewielki archipelag na południe od Sycylii.'
  },
  {
    id: 'i_mallorca',
    name: 'Majorka',
    type: 'island',
    coords: [2.9, 39.6],
    parentCountry: 'Hiszpania',
    description: 'Największa wyspa w archipelagu Balearów.'
  },
  {
    id: 'i_menorca',
    name: 'Minorka',
    type: 'island',
    coords: [4.0, 40.0],
    parentCountry: 'Hiszpania',
    description: 'Mniejsza siostra Majorki, położona bardziej na północny wschód.'
  },
  {
    id: 'i_crete',
    name: 'Kreta',
    type: 'island',
    coords: [25.0, 35.2],
    parentCountry: 'Grecja',
    description: 'Największa grecka wyspa, kolebka kultury minojskiej.'
  },
  {
    id: 'i_rhodes',
    name: 'Rodos',
    type: 'island',
    coords: [28.0, 36.2],
    parentCountry: 'Grecja',
    description: 'Wyspa słońca, położona blisko wybrzeży Turcji.'
  }
];

export const POLITICAL_REGIONS: PoliticalRegion[] = [
  {
    id: 'north',
    name: 'Europa Północna',
    countries: ['IS', 'NO', 'SE', 'FI', 'DK', 'EE', 'LV', 'LT']
  },
  {
    id: 'west',
    name: 'Europa Zachodnia',
    countries: ['IE', 'GB', 'FR', 'BE', 'NL', 'LU']
  },
  {
    id: 'central',
    name: 'Europa Centralna',
    countries: ['DE', 'CH', 'LI', 'AT', 'PL', 'CZ', 'SK', 'HU']
  },
  {
    id: 'east',
    name: 'Europa Wschodnia',
    countries: ['RU', 'BY', 'UA']
  },
  {
    id: 'south',
    name: 'Europa Południowa',
    countries: ['PT', 'ES', 'AD', 'IT', 'SM', 'VA', 'MT', 'CY']
  },
  {
    id: 'balkans',
    name: 'Bałkany',
    countries: ['SI', 'HR', 'BA', 'RS', 'ME', 'XK', 'MK', 'AL', 'GR', 'BG', 'RO', 'MD']
  }
];

// URL for a simplified GeoJSON of Europe
export const MAP_GEOJSON_URL = "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";