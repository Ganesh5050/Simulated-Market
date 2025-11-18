import { Node } from '@/components/GlobeNodes';

// Major cities and their approximate coordinates
const cityLocations = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
];

export function generateNodes(count: number = 200): Node[] {
  const nodes: Node[] = [];
  const statuses: Array<'white' | 'green' | 'red' | 'yellow'> = ['white', 'green', 'red', 'yellow'];

  // Add major cities first
  cityLocations.forEach((city, index) => {
    // Weighted towards green and white
    const randomValue = Math.random();
    let status: 'white' | 'green' | 'red' | 'yellow';
    
    if (randomValue < 0.5) {
      status = 'white';
    } else if (randomValue < 0.8) {
      status = 'green';
    } else if (randomValue < 0.95) {
      status = 'yellow';
    } else {
      status = 'red';
    }

    nodes.push({
      id: `city-${index}`,
      lat: city.lat,
      lon: city.lon,
      status,
      name: city.name,
    });
  });

  // Generate random nodes with better distribution
  for (let i = cityLocations.length; i < count; i++) {
    // Better distribution across the globe
    const lat = (Math.random() - 0.5) * 180;
    const lon = (Math.random() - 0.5) * 360;
    
    // Weighted distribution: more white and green, fewer red
    const randomValue = Math.random();
    let status: 'white' | 'green' | 'red' | 'yellow';
    
    if (randomValue < 0.5) {
      status = 'white';
    } else if (randomValue < 0.8) {
      status = 'green';
    } else if (randomValue < 0.95) {
      status = 'yellow';
    } else {
      status = 'red';
    }

    nodes.push({
      id: `node-${i}`,
      lat,
      lon,
      status,
      name: `Node ${i}`,
    });
  }

  // Ensure we have exactly the requested count
  return nodes.slice(0, count);
}
