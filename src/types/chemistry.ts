export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export type StateOfMatter = 'solid' | 'liquid' | 'gas' | 'unknown';
export type ElementBlock = 's' | 'p' | 'd' | 'f';

export interface Isotope {
  massNumber: number;
  symbol: string;
  neutrons: number;
  abundance: string; // e.g. "98.93%" or "Nhân tạo"
  isStable: boolean;
  halfLife?: string; // e.g. "5730 năm"
}

export interface CommonIon {
  symbol: string;
  charge: number; // e.g. +1, +2, -1, -2
  electrons: number;
  name: string;
}

export interface TypicalReaction {
  title: string;
  equation: string;
  note: string;
}

export interface ElementData {
  number: number;
  symbol: string;
  nameVi: string;
  nameEn: string;
  category: ElementCategory;
  period: number;
  group: number | null; // 1-18, null for Lanthanides/Actinides in standard table
  traditionalGroup?: string; // e.g. "IA", "VIIA"
  block: ElementBlock;
  atomicMass: string; // e.g. "1.008" or "[294]"
  massNumber: number; // representative mass number of primary isotope
  isSynthetic: boolean;
  electronConfiguration: string; // e.g. "[Ne] 3s¹"
  electronsPerShell: number[]; // e.g. [2, 8, 1]
  oxidationStates: string; // e.g. "+1, -1"
  valences: string; // e.g. "I"
  electronegativity: number | null; // Pauling
  ionizationEnergy: number | null; // kJ/mol
  atomicRadius: number | null; // pm
  density: number | null; // g/cm³ at 25°C
  meltingPoint: number | null; // °C
  boilingPoint: number | null; // °C
  phase: StateOfMatter; // at 25°C, 1 atm
  yearDiscovered: number | string;
  discoveredBy: string;
  summaryVi: string;
  applications: string[];
  hazardsAndSafety: string;
  typicalReactions: TypicalReaction[];
  isotopes: Isotope[];
  commonIons: CommonIon[];
}

export interface LabReagent {
  id: string;
  nameVi: string;
  formula: string;
  category: 'acid' | 'base' | 'salt' | 'metal' | 'indicator' | 'other';
  color: string; // hex or rgb for rendering liquid/powder
  state: 'liquid' | 'solid' | 'gas';
  ph?: number;
  hazard?: string;
  descriptionVi: string;
}

export interface LabReaction {
  id: string;
  title: string;
  objective: string;
  reagentIds: string[]; // required reagents to trigger
  temperatureRequired?: number; // °C
  balancedEquation: string;
  phenomenon: string;
  macroObservation: string;
  microExplanation: string;
  precipitateColor?: string;
  gasEvolved?: string;
  colorChangeTo?: string;
  temperatureChange?: string; // e.g. "+12°C (Tỏa nhiệt)"
  safetyWarning: string;
  quizQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: 'basic' | 'medium' | 'advanced';
  type: 'single' | 'multi' | 'balance';
  question: string;
  options: string[];
  correctAnswer: number | number[]; // index or indices
  explanation: string;
  hint?: string;
}

export interface UserHistoryItem {
  id: string;
  elementNumber: number;
  timestamp: number;
  action: 'viewed' | '3d_modeled' | 'experiment';
}

export interface UserNote {
  elementNumber: number;
  noteText: string;
  updatedAt: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  matchedCount?: number;
}
