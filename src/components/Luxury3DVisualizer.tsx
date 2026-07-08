"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// SSR-safe check
export default function Luxury3DVisualizer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center bg-zinc-950/20 rounded-2xl border border-zinc-800/40">
        <div className="text-zinc-600 animate-pulse text-sm">3D Arena yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[600px] relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      <div className="absolute top-4 left-6 z-10">
        <h3 className="text-sm font-semibold tracking-wider text-amber-500 uppercase">Nest One Interactive 3D</h3>
        <p className="text-xs text-zinc-500 mt-1">Sichqoncha yordamida aylantiring</p>
      </div>

      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={50} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f59e0b" />
        <directionalLight position={[-10, 20, 5]} intensity={1.0} color="#ffffff" />
        
        <BuildingTower />
        
        <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
        <OrbitControls 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}

function BuildingTower() {
  const groupRef = useRef<THREE.Group>(null);

  // Animate slightly on each frame
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2.5, 0]}>
      {/* Base Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[4, 4.5, 0.2, 32]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid rings */}
      <gridHelper args={[12, 12, "#d97706", "#27272a"]} position={[0, 0.01, 0]} />

      {/* Main Glass Tower Segments (Nest One concept) */}
      <TowerSegment position={[0, 1.25, 0]} args={[1.8, 1.8, 2.5, 4]} color="#d97706" wireframe />
      <TowerSegment position={[0, 1.25, 0]} args={[1.75, 1.75, 2.45, 4]} color="#f59e0b" opacity={0.15} />

      <TowerSegment position={[0, 3.5, 0]} args={[1.5, 1.5, 2.0, 4]} color="#d97706" wireframe />
      <TowerSegment position={[0, 3.5, 0]} args={[1.45, 1.45, 1.95, 4]} color="#f59e0b" opacity={0.15} />

      <TowerSegment position={[0, 5.25, 0]} args={[1.2, 1.2, 1.5, 4]} color="#d97706" wireframe />
      <TowerSegment position={[0, 5.25, 0]} args={[1.15, 1.15, 1.45, 4]} color="#f59e0b" opacity={0.15} />

      {/* Spire */}
      <mesh position={[0, 6.5, 0]}>
        <coneGeometry args={[0.08, 1, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
      </mesh>

      {/* Glowing point on top */}
      <mesh position={[0, 7.0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}

interface TowerSegmentProps {
  position: [number, number, number];
  args: [number, number, number, number];
  color: string;
  wireframe?: boolean;
  opacity?: number;
}

function TowerSegment({ position, args, color, wireframe = false, opacity = 1 }: TowerSegmentProps) {
  return (
    <mesh position={position} rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[args[0], args[2], args[1]]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        roughness={0.2}
        metalness={0.8}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={wireframe ? 0.3 : 0.05}
      />
    </mesh>
  );
}
