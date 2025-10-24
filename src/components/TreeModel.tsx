import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeModelProps {
  position: [number, number, number];
  scale?: number;
}

export function TreeModel({ position, scale = 1 }: TreeModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Create realistic tree geometry
  const { trunkGeometry, foliageGeometry } = useMemo(() => {
    // Trunk with taper
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 4 * scale, 8);
    
    // Foliage as layered cones
    const foliageGeo = new THREE.Group();
    
    const cone1 = new THREE.Mesh(
      new THREE.ConeGeometry(1.5 * scale, 3 * scale, 8),
      new THREE.MeshStandardMaterial({ 
        color: '#2d5016',
        roughness: 0.8,
        metalness: 0.1
      })
    );
    cone1.position.y = 3 * scale;
    cone1.castShadow = true;
    
    const cone2 = new THREE.Mesh(
      new THREE.ConeGeometry(1.2 * scale, 2.5 * scale, 8),
      new THREE.MeshStandardMaterial({ 
        color: '#3a6b1f',
        roughness: 0.8,
        metalness: 0.1
      })
    );
    cone2.position.y = 4 * scale;
    cone2.castShadow = true;
    
    const cone3 = new THREE.Mesh(
      new THREE.ConeGeometry(0.9 * scale, 2 * scale, 8),
      new THREE.MeshStandardMaterial({ 
        color: '#4a8528',
        roughness: 0.8,
        metalness: 0.1
      })
    );
    cone3.position.y = 5 * scale;
    cone3.castShadow = true;

    foliageGeo.add(cone1, cone2, cone3);
    
    return { trunkGeometry: trunkGeo, foliageGeometry: foliageGeo };
  }, [scale]);

  // Gentle sway animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.z = Math.sin(time * 0.5 + position[0]) * 0.03;
      groupRef.current.rotation.x = Math.cos(time * 0.3 + position[2]) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Trunk */}
      <mesh geometry={trunkGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#3e2723"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Foliage */}
      <primitive object={foliageGeometry} />
    </group>
  );
}
