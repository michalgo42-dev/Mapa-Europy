export enum AppMode {
  HOME = 'HOME',
  LEARN = 'LEARN',
  PRACTICE = 'PRACTICE',
  TEST = 'TEST',
}

export interface CountryFeature {
  type: string;
  properties: {
    NAME: string;
    ISO_A2: string; // ISO 2-letter code
    ISO_A3: string;
    [key: string]: any;
  };
  geometry: any;
}

export interface CountryData {
  name: string; // Polish name
  englishName: string;
  code: string; // ISO A2
  neighbors: string[]; // List of neighbor codes
}

export interface RegionData {
  id: string;
  name: string;
  type: 'island' | 'peninsula';
  countries: string[]; // ISO codes belonging to this region
  description: string;
}

export interface PoliticalRegion {
  id: string;
  name: string;
  countries: string[];
}

export interface PhysicalFeature {
  id: string;
  name: string;
  type: 'island' | 'peninsula';
  coords: [number, number]; // [Longitude, Latitude] - GeoJSON standard order
  parentCountry?: string; // Name of the country it belongs to (for islands)
  description: string;
}

export interface GeoJSONData {
  type: string;
  features: CountryFeature[];
}

export interface QuizQuestion {
  targetCountryCode: string;
  options: string[]; // Codes
  correctAnswer: string; // Code
}

export type TestQuestionType = 'POINT_ON_MAP' | 'IDENTIFY_ABCD' | 'DRAG_AND_DROP' | 'ODD_ONE_OUT';

export interface TestQuestion {
  id: number;
  type: TestQuestionType;
  targetId: string; // Country Code OR Feature ID
  targetName: string; // Polish Name
  options?: { id: string; name: string }[]; // For ABCD, DragDrop, OddOneOut
  category: 'COUNTRY' | 'PHYSICAL';
  questionText: string;
  correctAnswerId: string;
}