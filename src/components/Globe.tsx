import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { ReactNode } from 'react';

interface GlobeProps {
  children?: ReactNode;
}

export default function Globe({ children }: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const texture = useLoader(THREE.TextureLoader, '/earth-map.jpg');

  // Auto-rotation for the entire group (Earth + nodes)
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main globe sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color="#e5e7eb"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle outer glow */}
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial
          color="#d1d5db"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Render children (nodes) inside the rotating group */}
      {children}
    </group>
  );
}
