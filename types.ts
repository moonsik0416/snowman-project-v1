
export interface SnowmanStats {
  creativity: number;
  roundness: number;
  accessories: number;
  chillFactor: number;
  durability: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

export interface GeminiAnalysisResult {
  name: string;
  description: string;
  type: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Mythical';
  stats: SnowmanStats;
  funFact: string;
}

export interface SnowmanEntry extends GeminiAnalysisResult {
  id: string;
  imageUrl: string;
  stickerUrl?: string;
  capturedAt: number;
}
