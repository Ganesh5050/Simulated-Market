export interface Country {
  id: string;
  name: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  color: string;
  opacity: number;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  persona: Persona;
  feedback?: string;
  reasoning?: string;
}

export interface CountryData {
  id: string;
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  population: number;
  gdp: number;
  techAdoption: 'high' | 'medium' | 'low';
  marketSize: 'large' | 'medium' | 'small';
}
