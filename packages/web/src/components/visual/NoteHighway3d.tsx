import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Note {
  time: number;
  string: number;
  fret: number;
}

function InstancedNotes({ notes, currentTime }: { notes: Note[]; currentTime: number }) {
  const count = notes.length;
  if (count === 0) return null;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const laneSpacing = 0.5;
  const speed = 4; // z-units per second
  const geometry = useMemo(() => new THREE.BoxGeometry(0.35, 0.1, 0.35), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f87171', emissive: '#7f1d1d' }), []);

  useFrame(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const n = notes[i];
      const z = (n.time - currentTime) * speed;
      dummy.position.set((n.string - 2.5) * laneSpacing, 0, z);
      dummy.scale.setScalar(0.4);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
}

export default function NoteHighway3D({ notes, currentTime }: { notes: Note[]; currentTime: number }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div style={{ color: '#fca5a5', fontSize: 12, textAlign: 'center', padding: 12 }}>
        3D highway is disabled on mobile to save battery. Switch to 2D mode.
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 5]} />
      <InstancedNotes notes={notes} currentTime={currentTime} />
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 8, 0, 0]}>
        <planeGeometry args={[5, 20]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </Canvas>
  );
}
