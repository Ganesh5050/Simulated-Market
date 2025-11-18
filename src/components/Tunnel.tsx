import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TunnelProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function Tunnel({ isActive, onComplete }: TunnelProps) {
  const tunnelRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const ringsRef = useRef<THREE.Group>(null!);
  
  // Create tunnel geometry
  const tunnelGeometry = new THREE.CylinderGeometry(0.1, 0.3, 8, 32);
  const tunnelMaterial = new THREE.MeshBasicMaterial({
    color: '#00ffff',
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  
  // Create particle system
  const particleCount = 200;
  const particles = new Float32Array(particleCount * 3);
  const particleGeometry = new THREE.BufferGeometry();
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particles[i3] = (Math.random() - 0.5) * 0.2; // x
    particles[i3 + 1] = (Math.random() - 0.5) * 0.2; // y
    particles[i3 + 2] = (Math.random() - 0.5) * 8; // z
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 0.02,
    transparent: true,
    opacity: 0.8,
  });
  
  // Create energy rings
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -4 + i * 2;
    rings.push(ring);
  }
  
  // Animation
  useFrame(({ clock }) => {
    if (!isActive) return;
    
    const time = clock.elapsedTime;
    
    // Animate tunnel rotation
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += 0.01;
    }
    
    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += 0.1; // Move particles forward
        
        if (positions[i3 + 2] > 4) {
          positions[i3 + 2] = -4; // Reset position
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate rings
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, index) => {
        ring.rotation.z += 0.02;
        ring.position.z += 0.05;
        
        if (ring.position.z > 4) {
          ring.position.z = -4;
        }
      });
    }
    
    // Complete animation after 3 seconds
    if (time > 3 && onComplete) {
      onComplete();
    }
  });
  
  if (!isActive) return null;
  
  return (
    <group ref={tunnelRef}>
      {/* Main tunnel */}
      <mesh geometry={tunnelGeometry} material={tunnelMaterial} />
      
      {/* Particle system */}
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
      
      {/* Energy rings */}
      <group ref={ringsRef}>
        {rings.map((ring, index) => (
          <primitive key={index} object={ring} />
        ))}
      </group>
      
      {/* Neural pulses */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -4 + (i * 0.4)]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      ))}
    </group>
  );
}
