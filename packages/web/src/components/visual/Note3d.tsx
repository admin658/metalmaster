import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  startTime: number;
  string: number;
  currentTime: number;
};

export function Note3D({ startTime, string, currentTime }: Props) {
  const mesh = useRef<THREE.Mesh | null>(null);

  useFrame(() => {
    if (!mesh.current) return;
    const dt = startTime - currentTime;
    mesh.current.position.z = dt * 10;
  });

  return (
    <mesh ref={mesh} position={[string * 0.5, 0, 50]}>
      <boxGeometry args={[0.4, 0.1, 0.2]} />
      <meshStandardMaterial color="#ff1744" emissive="#ff1744" />
    </mesh>
  );
}
