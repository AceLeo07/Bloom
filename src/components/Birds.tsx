import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Birds() {
  return (
    <group>
      <Bird offset={0} />
      <Bird offset={2} />
      <Bird offset={4} />
    </group>
  );
}

function Bird({ offset }: { offset: number }) {
  const birdRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (birdRef.current) {
      const time = state.clock.getElapsedTime() + offset;
      
      // Circular flight path
      const radius = 12;
      birdRef.current.position.x = Math.sin(time * 0.3) * radius;
      birdRef.current.position.z = Math.cos(time * 0.3) * radius;
      birdRef.current.position.y = 8 + Math.sin(time * 0.5) * 2;

      // Face direction
      birdRef.current.lookAt(
        Math.sin(time * 0.3 + 0.1) * radius,
        8,
        Math.cos(time * 0.3 + 0.1) * radius
      );

      // Wing flap
      const flap = Math.sin(time * 8) * 0.3;
      birdRef.current.rotation.z = flap;
    }
  });

  return (
    <group ref={birdRef}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Wings */}
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
    </group>
  );
}
