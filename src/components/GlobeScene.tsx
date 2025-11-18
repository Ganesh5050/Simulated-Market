import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Globe from './Globe';
import GlobeNodes, { Node } from './GlobeNodes';
import { Suspense } from 'react';

interface GlobeSceneProps {
  nodes: Node[];
  onNodeClick?: (node: Node) => void;
}

export default function GlobeScene({ nodes, onNodeClick }: GlobeSceneProps) {
  return (
    <div className="w-full h-screen bg-background">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffff" />

        <Suspense fallback={null}>
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />
          
          <Globe>
            <GlobeNodes nodes={nodes} onNodeClick={onNodeClick} />
          </Globe>
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
