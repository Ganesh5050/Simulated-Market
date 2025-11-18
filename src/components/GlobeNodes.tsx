import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Persona } from '@/lib/supabase';

const RADIUS = 1.02;

export interface Node {
  id: string;
  lat: number;
  lon: number;
  status: 'white' | 'green' | 'red' | 'yellow';
  name?: string;
  persona?: Persona;
  feedback?: string;
}

interface GlobeNodesProps {
  nodes: Node[];
  onNodeClick?: (node: Node) => void;
}

export default function GlobeNodes({ nodes, onNodeClick }: GlobeNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const haloRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useRef<Float32Array>(null!);

  // Precompute node positions
  const positions = useMemo(() => {
    return nodes.map(({ lat, lon }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.cos(phi);
      const z = RADIUS * Math.sin(phi) * Math.sin(theta);
      return new THREE.Vector3(x, y, z);
    });
  }, [nodes]);

  // Set instance matrices and colors
  useEffect(() => {
    const colors = new Float32Array(nodes.length * 3);
    
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.set(0.015, 0.015, 0.015);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Set color based on status
      const color = new THREE.Color();
      switch (nodes[i].status) {
        case 'green':
          color.setHSL(120 / 360, 1, 0.5);
          break;
        case 'red':
          color.setHSL(0 / 360, 1, 0.5);
          break;
        case 'yellow':
          color.setHSL(60 / 360, 1, 0.5);
          break;
        default:
          color.setHSL(0, 0, 1);
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Set halo transform (slightly larger)
      if (haloRef.current) {
        dummy.position.copy(pos);
        dummy.scale.set(0.035, 0.035, 0.035);
        dummy.updateMatrix();
        haloRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    colorArray.current = colors;
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    const geometry = meshRef.current.geometry;
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    if (haloRef.current) {
      const haloGeometry = haloRef.current.geometry;
      haloGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    }
  }, [positions, nodes, dummy]);

  // Pulsing animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    const t = Math.sin(clock.elapsedTime * 2) * 0.5 + 0.5;
    
    positions.forEach((pos, i) => {
      const baseScale = 0.015;
      const pulseScale = baseScale + (baseScale * 0.3 * t);
      
      dummy.position.copy(pos);
      dummy.scale.set(pulseScale, pulseScale, pulseScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      if (haloRef.current) {
        const haloBase = 0.035;
        const haloScale = haloBase + (haloBase * 0.25 * t);
        dummy.position.copy(pos);
        dummy.scale.set(haloScale, haloScale, haloScale);
        dummy.updateMatrix();
        haloRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (haloRef.current) haloRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={haloRef}
        args={[null, null, nodes.length]}
        frustumCulled={false}
        renderOrder={0}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      <instancedMesh
        ref={meshRef}
        args={[null, null, nodes.length]}
        frustumCulled={false}
        renderOrder={1}
        onClick={(e) => {
          e.stopPropagation();
          const instanceId = e.instanceId;
          if (instanceId !== undefined && instanceId < nodes.length && onNodeClick) {
            onNodeClick(nodes[instanceId]);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial vertexColors transparent opacity={0.9} />
      </instancedMesh>
    </>
  );
}
