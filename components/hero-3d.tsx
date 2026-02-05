'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Environment } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function NyvexMark() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  const shards = useMemo(
    () => Array.from({ length: 24 }, () => [Math.random() * 3 - 1.5, Math.random() * 2 - 1, Math.random() * 2 - 1] as const),
    []
  );

  return (
    <group ref={ref}>
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.2]} />
        <meshStandardMaterial color="#7c3aed" emissive="#4c1d95" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#22d3ee" emissive="#155e75" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.2]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0369a1" emissiveIntensity={2} />
      </mesh>
      {shards.map((p, i) => (
        <mesh key={i} position={p as any}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#a78bfa" emissive="#6d28d9" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Hero3D() {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    return <img src="/icons/products/king.svg" className="mx-auto h-72 w-72" alt="Nyvex Hero" />;
  }

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-purple-400/30 bg-[#0c0820]">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 3]} intensity={2.2} color="#22d3ee" />
        <NyvexMark />
        <Environment preset="city" />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={1.1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
