'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function FloatingItems({ paused }: { paused: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!root.current || paused) return;
    root.current.rotation.y = state.clock.elapsedTime * 0.2;
    root.current.position.y = Math.sin(state.clock.elapsedTime) * 0.08;
  });

  const shards = useMemo(
    () => Array.from({ length: 28 }, () => [Math.random() * 3.5 - 1.75, Math.random() * 2.2 - 1.1, Math.random() * 2.4 - 1.2] as const),
    []
  );

  return (
    <group ref={root}>
      <mesh position={[-0.8, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.2]} />
        <meshStandardMaterial color="#7c3aed" emissive="#581c87" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.24, 0.08, 14, 24]} />
        <meshStandardMaterial color="#facc15" emissive="#a16207" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0.85, 0.28, 0]}>
        <octahedronGeometry args={[0.28]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[-0.25, -0.35, 0.1]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#dbeafe" emissive="#7c3aed" emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0.2, -0.35, 0.1]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0ea5e9" emissiveIntensity={1.2} />
      </mesh>
      {shards.map((p, i) => (
        <mesh key={i} position={p as any}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color="#a78bfa" emissive="#6d28d9" emissiveIntensity={1.7} />
        </mesh>
      ))}
    </group>
  );
}

export function Hero3D() {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (reduceMotion) {
    return <img src="/icons/products/king.svg" className="mx-auto h-72 w-72" alt="Nyvex Hero" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-80 w-full overflow-hidden rounded-2xl border border-purple-400/30 bg-[#0c0820]">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} dpr={[1, 1.6]}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 3, 3]} intensity={2.2} color="#22d3ee" />
        <FloatingItems paused={paused} />
        <Environment preset="city" />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={1.1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </motion.div>
  );
}
