import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHabitStore } from '../store/habitStore';

export default function EnvironmentalEffects() {
  const { lastAnswer, brightness } = useHabitStore();
  const butterfliesRef = useRef<THREE.InstancedMesh>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  const butterflyCount = 10;
  const sparkleCount = 50;
  const leafCount = 20;

  const [butterflyOffsets, sparklePositions, leafPositions] = useMemo(() => {
    const bOffsets = Array.from({ length: butterflyCount }, () => Math.random() * Math.PI * 2);
    
    const sPos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 15;
      sPos[i * 3 + 1] = Math.random() * 8 + 2;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    const lPos = Array.from({ length: leafCount }, () => ({
      x: (Math.random() - 0.5) * 15,
      y: Math.random() * 5 + 5,
      z: (Math.random() - 0.5) * 15,
      rotSpeed: Math.random() * 0.1 + 0.05,
      fallSpeed: Math.random() * 0.02 + 0.01,
    }));

    return [bOffsets, sPos, lPos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Butterflies (positive effect)
    if (butterfliesRef.current && lastAnswer === 'positive') {
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < butterflyCount; i++) {
        const offset = butterflyOffsets[i];
        const radius = 3 + i * 0.3;
        const x = Math.sin(time * 0.5 + offset) * radius;
        const z = Math.cos(time * 0.5 + offset) * radius;
        const y = 2 + Math.sin(time * 2 + offset) * 0.5;

        dummy.position.set(x, y, z);
        dummy.rotation.y = time * 2 + offset;
        dummy.scale.set(
          1 + Math.sin(time * 5 + offset) * 0.2,
          1,
          1
        );
        dummy.updateMatrix();
        butterfliesRef.current.setMatrixAt(i, dummy.matrix);
      }
      butterfliesRef.current.instanceMatrix.needsUpdate = true;
    }

    // Sparkles (positive effect)
    if (sparklesRef.current && brightness > 0.6) {
      const positions = sparklesRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < sparkleCount; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3 + 1] = 2;
        }
      }
      sparklesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Falling leaves (negative effect)
    if (leavesRef.current && lastAnswer === 'negative') {
      const dummy = new THREE.Object3D();

      for (let i = 0; i < leafCount; i++) {
        const leaf = leafPositions[i];
        leaf.y -= leaf.fallSpeed;
        
        if (leaf.y < 0) {
          leaf.y = 8;
        }

        dummy.position.set(leaf.x, leaf.y, leaf.z);
        dummy.rotation.set(
          time * leaf.rotSpeed,
          time * leaf.rotSpeed * 2,
          time * leaf.rotSpeed * 0.5
        );
        dummy.scale.set(0.2, 0.2, 0.05);
        dummy.updateMatrix();
        leavesRef.current.setMatrixAt(i, dummy.matrix);
      }
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Butterflies */}
      {lastAnswer === 'positive' && (
        <instancedMesh
          ref={butterfliesRef}
          args={[undefined, undefined, butterflyCount]}
          castShadow
        >
          <planeGeometry args={[0.3, 0.2]} />
          <meshStandardMaterial
            color="#FF69B4"
            emissive="#FFB6C1"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      )}

      {/* Sparkles */}
      {brightness > 0.6 && (
        <points ref={sparklesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkleCount}
              array={sparklePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color="#FFD700"
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Falling leaves */}
      {lastAnswer === 'negative' && (
        <instancedMesh
          ref={leavesRef}
          args={[undefined, undefined, leafCount]}
          castShadow
        >
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </instancedMesh>
      )}
    </group>
  );
}
