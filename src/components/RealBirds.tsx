import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RealBirds() {
  const birds = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => <RealBird key={i} offset={i * 2} />);
  }, []);

  return <group>{birds}</group>;
}

function RealBird({ offset }: { offset: number }) {
  const birdRef = useRef<THREE.Group>(null);

  const { birdModel, radius, speed, center } = useMemo(() => {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: '#2c3e50',
      roughness: 0.8,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 1.2, 0.8);
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: '#34495e',
      roughness: 0.8,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.15;
    group.add(head);

    // Beak
    const beakGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
    const beakMaterial = new THREE.MeshStandardMaterial({
      color: '#f39c12',
      roughness: 0.6,
      metalness: 0.2
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.position.set(0, 0.15, 0.08);
    beak.rotation.x = Math.PI / 2;
    group.add(beak);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      roughness: 0.1,
      metalness: 0.1
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.03, 0.15, 0.06);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    rightEye.position.set(0.03, 0.15, 0.06);
    group.add(rightEye);

    // Wings
    const wingGeometry = new THREE.PlaneGeometry(0.25, 0.15);
    const wingMaterial = new THREE.MeshStandardMaterial({
      color: '#34495e',
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.15, 0, 0);
    leftWing.rotation.y = Math.PI / 6;
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial.clone());
    rightWing.position.set(0.15, 0, 0);
    rightWing.rotation.y = -Math.PI / 6;
    group.add(rightWing);

    // Tail
    const tailGeometry = new THREE.PlaneGeometry(0.15, 0.2);
    const tailMaterial = new THREE.MeshStandardMaterial({
      color: '#2c3e50',
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -0.1, -0.1);
    tail.rotation.x = Math.PI / 6;
    group.add(tail);

    return {
      birdModel: group,
      radius: Math.random() * 50 + 20,
      speed: Math.random() * 0.2 + 0.1,
      center: new THREE.Vector3((Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100),
    };
  }, []);

  useFrame((state) => {
    if (birdRef.current) {
      const time = state.clock.getElapsedTime() + offset;
      
      birdRef.current.position.x = center.x + Math.sin(time * speed) * radius;
      birdRef.current.position.z = center.z + Math.cos(time * speed) * radius;
      birdRef.current.position.y = 20 + Math.sin(time * speed * 2) * 5;

      birdRef.current.lookAt(
        center.x + Math.sin(time * speed + 0.1) * radius,
        20,
        center.z + Math.cos(time * speed + 0.1) * radius
      );

      const flap = Math.sin(time * 8) * 0.3;
      birdRef.current.rotation.z = flap;

      const wings = birdRef.current.children[0].children.filter((child, i) => i === 5 || i === 6);
      wings.forEach((wing, i) => {
        const baseRotation = i === 0 ? Math.PI / 6 : -Math.PI / 6;
        wing.rotation.y = baseRotation + Math.sin(time * 12) * 0.4;
      });

      const tail = birdRef.current.children[0].children[7];
      if (tail) {
        tail.rotation.x = Math.PI / 6 + Math.sin(time * 4) * 0.1;
      }
    }
  });

  return (
    <group ref={birdRef}>
      <primitive object={birdModel} />
    </group>
  );
}