import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
}

export default function Particles({ count = 200 }: ParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, velocities, opacities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      opacities[i] = Math.random();
    }

    return [pos, vel, opacities];
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const opacities = particlesRef.current.geometry.attributes.opacity
        .array as Float32Array;

      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        opacities[i] += (Math.random() - 0.5) * 0.1;
        if (opacities[i] < 0) opacities[i] = 0;
        if (opacities[i] > 1) opacities[i] = 1;

        if (positions[i * 3 + 1] < 0 || positions[i * 3 + 1] > 10) {
          velocities[i * 3 + 1] *= -1;
        }

        if (Math.abs(positions[i * 3]) > 25) {
          velocities[i * 3] *= -1;
        }
        if (Math.abs(positions[i * 3 + 2]) > 25) {
          velocities[i * 3 + 2] *= -1;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.opacity.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={count}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#FFD700"
        transparent
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
