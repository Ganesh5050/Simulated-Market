"use client";
import React from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
});

export default function GlobeDemo() {
  const globeConfig = {
    pointSize: 0,
    globeColor: "#000000",
    showAtmosphere: false,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "#ffffff",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 0,
    arcLength: 0,
    rings: 0,
    maxRings: 0,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
    showGlobe: true,
    showGraticules: false,
  };
  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const sampleArcs = [];

  return (
    <div className="flex flex-row items-center justify-center h-screen w-screen bg-transparent relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute w-full h-full z-10">
          <World data={sampleArcs} globeConfig={globeConfig} />
        </div>
      </div>
    </div>
  );
}
