import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

function TestSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export function TestGlobe() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <TestSphere />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
