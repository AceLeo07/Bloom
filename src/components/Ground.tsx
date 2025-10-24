import { useRef } from 'react';
import * as THREE from 'three';

export default function Ground() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#013220" roughness={0.9} />
      </mesh>
    </group>
  );
}