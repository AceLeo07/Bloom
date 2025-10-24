import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function SplineFairy({ currentTree }: any) {
  const fairyRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/lost_orb_in_the_mountains.gltf');

  return (
    <group ref={fairyRef} scale={[0.2, 0.2, 0.2]}>
      <primitive object={scene} />
    </group>
  );
}
