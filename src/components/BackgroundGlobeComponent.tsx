import React from "react";
import { Canvas } from "@react-three/fiber";
import Globe from "./Globe";

interface BackgroundGlobeProps {
  className?: string;
}

export default function BackgroundGlobeComponent({ className = "" }: BackgroundGlobeProps) {
  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[1, 1, 1]} intensity={0.5} />
        <Globe />
      </Canvas>
    </div>
  );
}
