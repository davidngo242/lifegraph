import React from 'react';
import * as THREE from 'three';
import type { HairStyle } from './avatarProfile';

// Coordinates are in head space (head centre = origin, face looks toward +z).
const cap = (r: number, theta: number) => <sphereGeometry args={[r, 28, 18, 0, Math.PI * 2, 0, theta]} />;

interface Props {
  style: HairStyle;
  balding: boolean;
  bun: boolean;
  hair: THREE.Material;
  shine: THREE.Material;
}

/** Layered hair built from open caps, curtains and capsule locks; the ears stay visible. */
export default function AvatarHair({ style, balding, bun, hair, shine }: Props) {
  const lock = (x: number, y: number, z: number, len: number, rz: number, rx = 0, r = 0.06) => (
    <mesh position={[x, y, z]} rotation={[rx, 0, rz]} material={hair}>
      <capsuleGeometry args={[r, len, 6, 12]} />
    </mesh>
  );
  const highlight = (
    <mesh rotation={[-0.3, 0, 0]} material={shine}>
      <sphereGeometry args={[0.512, 24, 8, 0.2, 1.3, 0.45, 0.4]} />
    </mesh>
  );
  const sideburns = (len: number) => (
    <>
      {lock(-0.405, 0.07, 0.2, len, 0.05, 0, 0.045)}
      {lock(0.405, 0.07, 0.2, len, -0.05, 0, 0.045)}
    </>
  );

  if (balding) {
    return (
      <group>
        <mesh position={[0, -0.04, 0]} material={hair}>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 24, 1, true, 1.9, Math.PI * 2 - 3.8]} />
        </mesh>
        <mesh rotation={[-0.2, 0, 0]} position={[0, 0.0, -0.02]} material={hair}>{cap(0.5, 0.35)}</mesh>
        {sideburns(0.06)}
      </group>
    );
  }

  const bangs = (
    <>
      {lock(-0.17, 0.33, 0.33, 0.14, 1.1, 0.5)}
      {lock(0, 0.35, 0.34, 0.16, 1.57, 0.5)}
      {lock(0.17, 0.33, 0.33, 0.14, 2.05, 0.5)}
    </>
  );

  switch (style) {
    case 'long':
      return (
        <group>
          <mesh rotation={[-0.4, 0, 0]} material={hair}>{cap(0.5, 1.75)}</mesh>
          {highlight}
          <mesh position={[0, -0.28, 0]} material={hair}>
            <cylinderGeometry args={[0.5, 0.44, 0.9, 28, 1, true, Math.PI / 2, Math.PI]} />
          </mesh>
          {bangs}
          {lock(-0.4, -0.2, 0.2, 0.46, 0.06, 0.1, 0.075)}
          {lock(0.4, -0.2, 0.2, 0.46, -0.06, 0.1, 0.075)}
        </group>
      );
    case 'ponytail':
      return (
        <group>
          <mesh rotation={[-0.4, 0, 0]} material={hair}>{cap(0.5, 1.6)}</mesh>
          {highlight}
          {bangs}
          {sideburns(0.2)}
          {bun ? (
            <mesh position={[0, 0.5, -0.2]} material={hair}><sphereGeometry args={[0.17, 16, 14]} /></mesh>
          ) : (
            <>
              <mesh position={[0, 0.3, -0.52]} material={hair}><sphereGeometry args={[0.07, 12, 10]} /></mesh>
              {lock(0, 0.05, -0.62, 0.45, 0, -0.35, 0.095)}
            </>
          )}
        </group>
      );
    case 'bob':
      return (
        <group>
          <mesh rotation={[-0.4, 0, 0]} material={hair}>{cap(0.5, 1.7)}</mesh>
          {highlight}
          <mesh position={[0, -0.03, 0]} material={hair}>
            <cylinderGeometry args={[0.52, 0.56, 0.5, 28, 1, true, 1.95, Math.PI * 2 - 3.9]} />
          </mesh>
          {bangs}
          {lock(-0.4, -0.08, 0.22, 0.26, 0.04, 0, 0.07)}
          {lock(0.4, -0.08, 0.22, 0.26, -0.04, 0, 0.07)}
        </group>
      );
    case 'parted':
      return (
        <group>
          <mesh rotation={[-0.35, 0, 0]} material={hair}>{cap(0.5, 1.5)}</mesh>
          {highlight}
          <mesh position={[0.1, 0.43, 0.14]} scale={[1.2, 0.75, 1.1]} material={hair}><sphereGeometry args={[0.2, 16, 14]} /></mesh>
          {lock(-0.22, 0.32, 0.33, 0.24, 1.0, 0.45, 0.07)}
          {lock(0.12, 0.35, 0.33, 0.2, 2.2, 0.45, 0.06)}
          {sideburns(0.1)}
        </group>
      );
    case 'undercut':
      return (
        <group>
          <mesh rotation={[-0.15, 0, 0]} material={hair}>{cap(0.485, 1.35)}</mesh>
          <mesh position={[0, 0.34, 0.06]} scale={[1, 0.75, 1.35]} material={hair}><sphereGeometry args={[0.24, 18, 14]} /></mesh>
          {lock(-0.1, 0.4, 0.3, 0.12, 1.3, 0.5, 0.06)}
          {lock(0.12, 0.4, 0.3, 0.12, 1.85, 0.5, 0.06)}
        </group>
      );
    default:
      return (
        <group>
          <mesh rotation={[-0.4, 0, 0]} material={hair}>{cap(0.5, 1.55)}</mesh>
          {highlight}
          {bangs}
          {sideburns(0.12)}
        </group>
      );
  }
}
