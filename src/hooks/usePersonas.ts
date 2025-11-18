import { useState, useEffect } from 'react';
import { Persona } from '@/types/persona';
import { Country } from '@/types/country';
import { PersonaService } from '@/services/personaService';

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const personaService = PersonaService.getInstance();
    const allPersonas = personaService.getAllPersonas();
    setPersonas(allPersonas);
    setLoading(false);
  }, []);

  const personaService = PersonaService.getInstance();

  return {
    personas,
    countries,
    loading,
    actions: {
      analyzeWithIdea: (idea: string) => {
        const analyzedCountries = personaService.analyzePersonasWithIdea(idea);
        setCountries(analyzedCountries);
        return analyzedCountries;
      },
      selectFocusGroup: (idea: string, count: number = 5) => {
        return personaService.selectFocusGroup(idea, count);
      },
      getPersonaById: (id: string) => personaService.getPersonaById(id),
      getPersonasByRegion: (region: string) => personaService.getPersonasByRegion(region),
      getPersonasByIndustry: (industry: string) => personaService.getPersonasByIndustry(industry),
    }
  };
}
