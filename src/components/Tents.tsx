import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function Tents() {
  const { nodes } = useGLTF('/lost_orb_in_the_mountains.gltf');

  const tentMesh = useMemo(() => {
    for (const node of Object.values(nodes)) {
      if (node.name.toLowerCase().includes('tent')) {
        return node.clone();
      }
    }
    return null;
  }, [nodes]);

  const tents = useMemo(() => {
    if (!tentMesh) return [];

    const tentPositions = [
      new THREE.Vector3(Math.random() * 100 - 50, 0, Math.random() * 100 - 50),
      new THREE.Vector3(Math.random() * 100 - 50, 0, Math.random() * 100 - 50),
    ];

    return tentPositions.map((position, i) => {
      const tent = tentMesh.clone();
      tent.position.copy(position);
      tent.rotation.y = Math.random() * Math.PI * 2;
      return <primitive key={i} object={tent} scale={[5, 5, 5]} />;
    });
  }, [tentMesh]);

  return <>{tents}</>;
}
