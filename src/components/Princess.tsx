import { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useHabitStore } from '../store/habitStore';

export default function Princess() {
  const group = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const { scene } = useGLTF('/snow_princess_action_rigged.gltf');
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3());
  const setShowModal = useHabitStore((state) => state.setShowModal);

  useEffect(() => {
    if (scene) {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = Math.PI / 4;
      
      // Create a larger ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.15, 16, 100), // Increased radius from 1.30 to 1.8, thickness from 0.1 to 0.15
        new THREE.MeshStandardMaterial({ 
          color: 'gold',
          emissive: '#ffd700', // Add emissive glow
          emissiveIntensity: 0.3,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      ring.position.y = 0.5;
      ringGroup.add(ring);
      
      // Add a glowing aura around the fairy
      const auraGeometry = new THREE.SphereGeometry(2.5, 32, 32);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: '#ffd700',
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      aura.position.y = 0.5;
      ringGroup.add(aura);
      
      scene.add(ringGroup);
    }
  }, [scene]);

  useEffect(() => {
    // Set initial random target position
    const setRandomTarget = () => {
      const radius = Math.random() * 43;
      const theta = Math.random() * Math.PI * 2;
      setTargetPosition(
        new THREE.Vector3(Math.cos(theta) * radius, 3 + Math.random() * 2, Math.sin(theta) * radius)
      );
    };
    setRandomTarget();
  }, []);

  useFrame((state, delta) => {
    if (group.current) {
      // Move towards target position
      group.current.position.lerp(targetPosition, 0.005);

      // Check if close to target and set new target
      if (group.current.position.distanceTo(targetPosition) < 1) {
        const radius = Math.random() * 43;
        const theta = Math.random() * Math.PI * 2;
        setTargetPosition(
          new THREE.Vector3(Math.cos(theta) * radius, 3 + Math.random() * 2, Math.sin(theta) * radius)
        );
      }

      // Rotate towards movement direction
      const direction = targetPosition.clone().sub(group.current.position).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, angle, 0.1);
    }

    // Add pulsing glow effect
    if (glowRef.current) {
      glowRef.current.intensity = 6 + Math.sin(state.clock.elapsedTime * 2) * 2;
    }
  });

  return (
    <group ref={group} onClick={() => setShowModal(true)}>
      <primitive object={scene} scale={0.5} />
      
      {/* Enhanced lighting for more glow */}
      <pointLight color="#ffd700" intensity={8} distance={8} />
      <pointLight color="#ffffff" intensity={3} distance={6} />
      <pointLight color="#ffebcd" intensity={4} distance={4} />
      
      {/* Add a pulsing glow effect */}
      <pointLight 
        ref={glowRef}
        color="#ffd700" 
        intensity={6} 
        distance={10}
        position={[0, 1, 0]}
      />
    </group>
  );
}

useGLTF.preload('/snow_princess_action_rigged.gltf');
