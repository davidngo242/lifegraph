'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

export type AvatarReactionType = 'idle' | 'celebrate' | 'exhausted' | 'meditating' | 'shocked' | 'negotiating';

export interface Dynamic3DAvatarProps {
  nationality?: string;
  gender?: 'male' | 'female' | string;
  age?: number;
  burnout?: number;
  vitality?: number;
  reaction?: AvatarReactionType;
  isFastForwarding?: boolean;
  className?: string;
  showControls?: boolean;
  traits?: string[];
  netWorth?: number;
}

// Procedural Skin Tone Mapping based on Nationality
function getSkinTone(nationality: string = 'Việt Nam'): string {
  const nat = nationality.toLowerCase();
  if (nat.includes('ba lan') || nat.includes('poland') || nat.includes('mỹ') || nat.includes('usa') || nat.includes('anh') || nat.includes('đức') || nat.includes('pháp')) {
    return '#fadcce'; // Fair / Caucasian
  }
  if (nat.includes('syria') || nat.includes('ấn độ') || nat.includes('india') || nat.includes('ai cập') || nat.includes('egypt')) {
    return '#b97f57'; // Olive / Middle East / South Asian
  }
  if (nat.includes('kenya') || nat.includes('châu phi') || nat.includes('nigeria') || nat.includes('congo')) {
    return '#563520'; // Deep Melanin / African
  }
  if (nat.includes('nhật') || nat.includes('japan') || nat.includes('hàn') || nat.includes('korea') || nat.includes('trung') || nat.includes('china') || nat.includes('thái')) {
    return '#f8d9b8'; // East Asian warm
  }
  return '#f2cca3'; // Vietnamese warm golden
}

// Hair Color aging interpolation
function getHairColor(age: number = 20, seed: number = 0): string {
  if (age > 65) return '#f1f5f9'; // Pure Silver/White
  if (age > 45) return '#64748b'; // Salt & Pepper Slate
  const baseTones = ['#1e293b', '#261b18', '#3b2f2f', '#422006'];
  return baseTones[Math.abs(seed) % baseTones.length];
}

// Main 3D Rigged Model Component
function ProceduralCharacterMesh({
  nationality = 'Việt Nam',
  gender = 'male',
  age = 20,
  burnout = 0,
  vitality = 100,
  reaction = 'idle',
  isFastForwarding = false,
  traits = [],
  netWorth = 0
}: {
  nationality: string;
  gender?: 'male' | 'female' | string;
  age: number;
  burnout: number;
  vitality: number;
  reaction: AvatarReactionType;
  isFastForwarding: boolean;
  traits?: string[];
  netWorth?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairGroupRef = useRef<THREE.Group>(null);

  const isFemale = gender === 'female';
  const skinColor = useMemo(() => getSkinTone(nationality), [nationality]);
  const hairColor = useMemo(() => getHairColor(age, nationality.charCodeAt(0)), [age, nationality]);

  // Age scaling characteristics
  const numericAge = Number(age ?? 0);
  const isBaby = numericAge <= 3;
  const isChild = numericAge > 3 && numericAge < 12;
  const isTeen = numericAge >= 12 && numericAge < 18;
  const isElderly = numericAge >= 65;

  const headScale = isBaby ? 1.25 : isChild ? 1.12 : isTeen ? 1.05 : 1.0;
  const spineHunch = isElderly ? 0.18 : 0;

  // Trait Visual Logic
  const traitList = useMemo(() => Array.isArray(traits) ? traits : [], [traits]);

  const hasGlasses = useMemo(() => {
    if (numericAge < 4) return false;
    return traitList.some(t =>
      ['cận_thị_bẩm_sinh', 'code_whisperer', 'nerd', 'mọt_sách', 'thần_đồng_toán_học'].includes(t)
    );
  }, [traitList, numericAge]);

  const hasHalo = useMemo(() => {
    return reaction === 'meditating' || traitList.some(t =>
      ['giác_ngộ_tâm_linh_tiên_thiên', 'phúc_đức_vô_lượng'].includes(t)
    );
  }, [traitList, reaction]);

  const isWealthy = useMemo(() => {
    if (numericAge < 16) return false;
    return (Number(netWorth) >= 500000) || traitList.some(t =>
      ['crazy_rich', 'huyết_thống_trâm_anh', 'con_nhà_nòi'].includes(t)
    );
  }, [traitList, netWorth, numericAge]);

  // Materials with physical reactivity to stats & traits
  const skinMaterial = useMemo(() => {
    let effectiveSkin = skinColor;
    if (vitality < 30) {
      // Sắc diện nhợt nhạt, tái mét khi sinh lực nguy kịch
      effectiveSkin = '#cbd5e1';
    }
    return new THREE.MeshStandardMaterial({
      color: effectiveSkin,
      roughness: vitality < 30 ? 0.8 : 0.6,
      metalness: 0.05,
    });
  }, [skinColor, vitality]);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.65,
    metalness: 0.15,
  }), [hairColor]);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.2,
    metalness: 0.8
  }), []);

  const lipMaterial = useMemo(() => {
    let lipColor = '#e29578';
    if (isBaby || isChild) {
      lipColor = '#fca5a5'; // Soft natural kid lips
    } else if (isFemale) {
      lipColor = burnout > 75 ? '#be123c' : '#fb7185';
    } else {
      lipColor = burnout > 80 ? '#7f1d1d' : '#991b1b';
    }
    return new THREE.MeshStandardMaterial({
      color: lipColor,
      roughness: (isBaby || isChild) ? 0.85 : (isFemale ? 0.35 : 0.5),
      metalness: (isBaby || isChild) ? 0 : (isFemale ? 0.1 : 0.05)
    });
  }, [isBaby, isChild, isFemale, burnout]);

  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.18,
    metalness: 0.92
  }), []);

  const haloMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#f59e0b',
    emissiveIntensity: 1.6,
    roughness: 0.2,
    metalness: 0.4
  }), []);

  const glassesFrameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.25,
    metalness: 0.85
  }), []);

  const glassesLensMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#bae6fd',
    transparent: true,
    opacity: 0.38,
    roughness: 0.1,
    metalness: 0.15
  }), []);

  const ribbonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isBaby ? '#fef08a' : '#f43f5e',
    roughness: 0.4
  }), [isBaby]);

  const clothMaterial = useMemo(() => {
    let clothColor = isFemale ? '#be185d' : '#4f46e5';
    if (isBaby) {
      clothColor = isFemale ? '#fbcfe8' : '#bae6fd'; // Vải cotton pastel sơ sinh
    } else if (numericAge <= 5) {
      clothColor = isFemale ? '#fce7f3' : '#e0f2fe';
    } else if (isWealthy) {
      clothColor = isFemale ? '#4c0519' : '#0f172a'; // Tuxedo / Quý tộc sang trọng
    } else if (burnout > 75) {
      clothColor = '#334155';
    }
    return new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: isWealthy ? 0.45 : 0.75,
      metalness: isWealthy ? 0.2 : 0.05,
    });
  }, [isBaby, numericAge, burnout, isFemale, isWealthy]);

  // Real-time Procedural Animation Loop with Mouse Cursor Tracking
  useFrame((state, delta) => {
    if (isFastForwarding) return; // Freeze to conserve frames

    const t = state.clock.getElapsedTime();

    if (headRef.current && groupRef.current) {
      // 1. Natural Breathing Cycle
      const breatheSpeed = vitality < 30 ? 1.0 : 2.2;
      const breatheAmp = vitality < 30 ? 0.012 : 0.02;
      const breathe = Math.sin(t * breatheSpeed) * breatheAmp;
      
      const BASE_Y = -0.76;
      let targetPosY = BASE_Y + breathe;

      // 2. Mouse Cursor Head Follow Tracking (Subtle, responsive, organic)
      const mouseLookX = THREE.MathUtils.clamp(-state.pointer.y * 0.22, -0.22, 0.22);
      const mouseLookY = THREE.MathUtils.clamp(state.pointer.x * 0.32, -0.32, 0.32);

      // 3. Action Reaction Dynamics
      let targetRotX = spineHunch + (burnout > 75 ? 0.12 : 0) + mouseLookX;
      let targetRotY = mouseLookY;
      let targetRotZ = 0;

      if (reaction === 'celebrate') {
        targetRotX = Math.sin(t * 8) * 0.15 + mouseLookX * 0.5;
        targetRotY = Math.sin(t * 4) * 0.2 + mouseLookY;
        targetPosY += Math.abs(Math.sin(t * 6)) * 0.08;
      } else if (reaction === 'exhausted') {
        targetRotX = 0.35 + Math.sin(t * 1.2) * 0.04 + mouseLookX * 0.4;
        targetRotZ = Math.sin(t * 0.8) * 0.05;
      } else if (reaction === 'meditating') {
        targetRotX = -0.12 + mouseLookX * 0.3;
        targetPosY += Math.sin(t * 1.5) * 0.06;
      } else if (reaction === 'shocked') {
        targetRotX = -0.22 + mouseLookX * 0.3;
        targetRotY = Math.sin(t * 14) * 0.08 + mouseLookY;
      } else if (reaction === 'negotiating') {
        targetRotZ = 0.12 + Math.sin(t * 2.5) * 0.05;
        targetRotY = Math.sin(t * 1.8) * 0.15 + mouseLookY;
      } else {
        // Idle gentle sway
        targetRotY += Math.sin(t * 0.8) * 0.06;
        targetRotX += Math.sin(t * 1.4) * 0.03;
      }

      groupRef.current.position.y = targetPosY;

      // Smooth interpolation (lerp)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, delta * 6);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, delta * 6);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetRotZ, delta * 6);

      // 4. Ethereal Halo Orbital Animation
      if (haloRef.current) {
        haloRef.current.rotation.y = t * 0.8;
        haloRef.current.position.y = 0.68 + Math.sin(t * 2) * 0.025;
      }

      // 5. Periodic Eye Blink (every ~3.5 seconds)
      const blinkCycle = Math.sin(t * 1.8);
      const isBlinking = blinkCycle > 0.96;
      const eyeScaleY = (isBlinking || reaction === 'meditating') ? 0.1 : 1;

      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = eyeScaleY;
        rightEyeRef.current.scale.y = eyeScaleY;
      }

      // 6. Mouth Reaction Morph
      if (mouthRef.current) {
        if (reaction === 'celebrate') {
          mouthRef.current.scale.set(1.4, 1.4, 1.4);
        } else if (reaction === 'shocked') {
          mouthRef.current.scale.set(0.8, 1.8, 0.8);
        } else if (reaction === 'exhausted') {
          mouthRef.current.scale.set(1.1, 0.5, 1);
        } else {
          mouthRef.current.scale.set(1, 1, 1);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.82, 0]}>
      {isBaby ? (
        /* Cute Baby Swaddle Wrap */
        <group position={[0, 0.18, 0]}>
          <mesh material={clothMaterial}>
            <cylinderGeometry args={[0.32, 0.42, 0.6, 24]} />
          </mesh>
          <mesh position={[0, 0.28, 0.04]} rotation={[0.2, 0, 0]} material={clothMaterial}>
            <torusGeometry args={[0.24, 0.05, 12, 24]} />
          </mesh>
        </group>
      ) : (
        <>
          {/* Upper Torso & Collar */}
          <mesh position={[0, 0.1, 0]} material={clothMaterial}>
            <cylinderGeometry args={[isFemale ? 0.38 : 0.42, isFemale ? 0.48 : 0.52, 0.65, 32]} />
          </mesh>

          {/* Shoulders */}
          <mesh position={[isFemale ? -0.40 : -0.45, 0.32, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.16 : 0.18, 16, 16]} />
          </mesh>
          <mesh position={[isFemale ? 0.40 : 0.45, 0.32, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.16 : 0.18, 16, 16]} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.52, 0]} material={skinMaterial}>
            <cylinderGeometry args={[isFemale ? 0.14 : 0.16, isFemale ? 0.17 : 0.19, 0.28, 24]} />
          </mesh>

          {/* Luxury Wealth Lapel Brooch / Gold Accessory */}
          {isWealthy && (
            <group position={[0, 0.15, 0]}>
              <mesh position={[0.2, 0.14, 0.25]} rotation={[0.2, 0.3, 0.4]} material={goldMaterial}>
                <octahedronGeometry args={[0.042, 0]} />
              </mesh>
              {isFemale ? (
                /* Pearl necklace collar for elite lady */
                <mesh position={[0, 0.34, 0.08]} rotation={[1.1, 0, 0]} material={goldMaterial}>
                  <torusGeometry args={[0.19, 0.016, 12, 32]} />
                </mesh>
              ) : (
                /* Gold tie clip / luxury collar accent for gentleman */
                <mesh position={[0, 0.04, 0.26]} material={goldMaterial}>
                  <boxGeometry args={[0.032, 0.16, 0.012]} />
                </mesh>
              )}
            </group>
          )}
        </>
      )}

      {/* Head Group (Rotatable) */}
      <group ref={headRef} position={[0, isBaby ? 0.74 : 0.88, 0]} scale={[headScale, headScale, headScale]}>
        {/* Head Cranium */}
        <mesh material={skinMaterial}>
          <sphereGeometry args={[isFemale ? 0.45 : 0.46, 32, 32]} />
        </mesh>

        {/* Nose */}
        {isBaby ? (
          <mesh position={[0, 0.01, 0.45]} material={skinMaterial}>
            <sphereGeometry args={[0.038, 12, 12]} />
          </mesh>
        ) : (
          <mesh position={[0, 0.02, 0.44]} rotation={[0.4, 0, 0]} material={skinMaterial}>
            <coneGeometry args={[isFemale ? 0.055 : 0.07, isFemale ? 0.14 : 0.16, 16]} />
          </mesh>
        )}

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.17, isBaby ? 0.08 : 0.1, 0.42]} material={eyeMaterial}>
          <sphereGeometry args={[isBaby ? 0.068 : (isFemale ? 0.065 : 0.06), 16, 16]} />
          <mesh position={[0.022, 0.022, 0.055]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.17, isBaby ? 0.08 : 0.1, 0.42]} material={eyeMaterial}>
          <sphereGeometry args={[isBaby ? 0.068 : (isFemale ? 0.065 : 0.06), 16, 16]} />
          <mesh position={[0.022, 0.022, 0.055]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Female Eyelash Accents */}
        {isFemale && !isBaby && !isChild && (
          <group>
            <mesh position={[-0.22, 0.14, 0.42]} rotation={[0, 0, -0.28]} material={eyeMaterial}>
              <boxGeometry args={[0.08, 0.016, 0.02]} />
            </mesh>
            <mesh position={[0.22, 0.14, 0.42]} rotation={[0, 0, 0.28]} material={eyeMaterial}>
              <boxGeometry args={[0.08, 0.016, 0.02]} />
            </mesh>
          </group>
        )}

        {/* Eyebrows */}
        {!isBaby && (
          <group>
            <mesh position={[-0.17, 0.21, 0.42]} rotation={[0, 0, reaction === 'exhausted' ? -0.15 : 0.05]} material={hairMaterial}>
              <boxGeometry args={[isChild ? 0.09 : (isFemale ? 0.13 : 0.14), isChild ? 0.012 : (isFemale ? 0.018 : 0.025), 0.03]} />
            </mesh>
            <mesh position={[0.17, 0.21, 0.42]} rotation={[0, 0, reaction === 'exhausted' ? 0.15 : -0.05]} material={hairMaterial}>
              <boxGeometry args={[isChild ? 0.09 : (isFemale ? 0.13 : 0.14), isChild ? 0.012 : (isFemale ? 0.018 : 0.025), 0.03]} />
            </mesh>
          </group>
        )}

        {/* Procedural 3D Spectacles / Glasses (Cận thị bẩm sinh / Mọt sách / Code Whisperer) */}
        {hasGlasses && (
          <group position={[0, isBaby ? 0.08 : 0.1, 0.44]}>
            {/* Left Rim */}
            <mesh position={[-0.17, 0, 0]} material={glassesFrameMaterial}>
              <torusGeometry args={[0.086, 0.011, 16, 32]} />
            </mesh>
            {/* Left Lens */}
            <mesh position={[-0.17, 0, 0]} material={glassesLensMaterial}>
              <circleGeometry args={[0.08, 24]} />
            </mesh>
            {/* Right Rim */}
            <mesh position={[0.17, 0, 0]} material={glassesFrameMaterial}>
              <torusGeometry args={[0.086, 0.011, 16, 32]} />
            </mesh>
            {/* Right Lens */}
            <mesh position={[0.17, 0, 0]} material={glassesLensMaterial}>
              <circleGeometry args={[0.08, 24]} />
            </mesh>
            {/* Nose Bridge */}
            <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={glassesFrameMaterial}>
              <cylinderGeometry args={[0.009, 0.009, 0.08, 8]} />
            </mesh>
            {/* Left Temple extending to ear */}
            <mesh position={[-0.26, 0.01, -0.16]} rotation={[0, 0.22, 0]} material={glassesFrameMaterial}>
              <boxGeometry args={[0.01, 0.009, 0.32]} />
            </mesh>
            {/* Right Temple extending to ear */}
            <mesh position={[0.26, 0.01, -0.16]} rotation={[0, -0.22, 0]} material={glassesFrameMaterial}>
              <boxGeometry args={[0.01, 0.009, 0.32]} />
            </mesh>
          </group>
        )}

        {/* 3D Dynamic State: Quầng thâm mắt do kiệt sức (Burnout > 75 & Người lớn) */}
        {burnout > 75 && numericAge >= 16 && (
          <group position={[0, -0.04, 0.42]}>
            <mesh position={[-0.17, 0.05, 0]}>
              <sphereGeometry args={[0.07, 16, 8]} />
              <meshBasicMaterial color="#1e1b4b" opacity={0.65} transparent />
            </mesh>
            <mesh position={[0.17, 0.05, 0]}>
              <sphereGeometry args={[0.07, 16, 8]} />
              <meshBasicMaterial color="#1e1b4b" opacity={0.65} transparent />
            </mesh>
          </group>
        )}

        {/* 3D Dynamic State: Má hồng bầu bĩnh tuổi ấu thơ (0-5 tuổi) hoặc thiếu nữ */}
        {(numericAge <= 5 || (isFemale && numericAge < 25)) && (
          <group position={[0, -0.08, 0.4]}>
            <mesh position={[-0.22, 0, 0]}>
              <sphereGeometry args={[isBaby ? 0.09 : (numericAge <= 5 ? 0.075 : 0.05), 16, 8]} />
              <meshBasicMaterial color="#fb7185" opacity={numericAge <= 5 ? 0.5 : 0.3} transparent />
            </mesh>
            <mesh position={[0.22, 0, 0]}>
              <sphereGeometry args={[numericAge <= 5 ? 0.075 : 0.05, 16, 8]} />
              <meshBasicMaterial color="#fb7185" opacity={numericAge <= 5 ? 0.5 : 0.3} transparent />
            </mesh>
          </group>
        )}

        {/* Mouth / Baby Pacifier */}
        {isBaby ? (
          <group position={[0, -0.12, 0.44]}>
            <mesh material={ribbonMaterial}>
              <torusGeometry args={[0.045, 0.015, 12, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.02]} material={clothMaterial}>
              <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
          </group>
        ) : (
          <mesh ref={mouthRef} position={[0, isChild ? -0.15 : -0.18, 0.43]}>
            <sphereGeometry args={[isChild ? 0.048 : (isFemale ? 0.065 : 0.06), 16, 8]} />
            <primitive object={lipMaterial} attach="material" />
          </mesh>
        )}

        {/* Hair Styles & Accessories */}
        <group ref={hairGroupRef} position={[0, 0.15, 0]}>
          {isBaby ? (
            /* CUTE ADORABLE BABY BEANIE BONNET */
            <group position={[0, 0.06, 0]}>
              <mesh material={clothMaterial}>
                <sphereGeometry args={[0.47, 24, 24]} />
              </mesh>
              <mesh position={[0, 0.1, 0.28]} rotation={[0.3, 0, 0]} material={clothMaterial}>
                <torusGeometry args={[0.38, 0.045, 12, 24]} />
              </mesh>
              <mesh position={[0, 0.54, 0]} material={ribbonMaterial}>
                <sphereGeometry args={[0.085, 16, 16]} />
              </mesh>
            </group>
          ) : isFemale ? (
            /* FEMALE PROCEDURAL HAIRSTYLE */
            <group>
              <mesh position={[0, 0.24, -0.04]} material={hairMaterial}>
                <sphereGeometry args={[0.49, 24, 24]} />
              </mesh>
              <mesh position={[0, 0.37, 0.33]} rotation={[0.26, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.44, 0.13, 0.16]} />
              </mesh>
              <mesh position={[-0.38, -0.26, 0.08]} rotation={[0.08, 0, -0.08]} material={hairMaterial}>
                <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
              </mesh>
              <mesh position={[0.38, -0.26, 0.08]} rotation={[0.08, 0, 0.08]} material={hairMaterial}>
                <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
              </mesh>
              <mesh position={[0, -0.22, -0.26]} rotation={[-0.08, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.46, 0.52, 0.15]} />
              </mesh>

              {isChild && (
                <group>
                  <mesh position={[-0.36, 0.35, 0.12]} material={ribbonMaterial}>
                    <sphereGeometry args={[0.065, 16, 16]} />
                  </mesh>
                  <mesh position={[0.36, 0.35, 0.12]} material={ribbonMaterial}>
                    <sphereGeometry args={[0.065, 16, 16]} />
                  </mesh>
                </group>
              )}

              {isElderly && (
                <group>
                  <mesh position={[0, 0.54, -0.12]} material={hairMaterial}>
                    <sphereGeometry args={[0.18, 20, 20]} />
                  </mesh>
                  <mesh position={[0, 0.54, -0.12]} rotation={[0, 0, 0.4]} material={goldMaterial}>
                    <cylinderGeometry args={[0.015, 0.015, 0.45, 12]} />
                  </mesh>
                </group>
              )}
            </group>
          ) : (
            /* MALE PROCEDURAL HAIRSTYLE */
            <group>
              <mesh position={[0, 0.24, -0.05]} material={hairMaterial}>
                <sphereGeometry args={[0.48, 24, 24]} />
              </mesh>
              <mesh position={[0, 0.38, 0.32]} rotation={[0.3, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.44, 0.12, 0.15]} />
              </mesh>
              <mesh position={[-0.43, 0.02, 0.05]} material={hairMaterial}>
                <boxGeometry args={[0.08, 0.35, 0.18]} />
              </mesh>
              <mesh position={[0.43, 0.02, 0.05]} material={hairMaterial}>
                <boxGeometry args={[0.08, 0.35, 0.18]} />
              </mesh>
            </group>
          )}
        </group>

        {/* Ears & Earrings */}
        <mesh position={[-0.47, 0.02, 0]} rotation={[0, -0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
        <mesh position={[0.47, 0.02, 0]} rotation={[0, 0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>

        {isFemale && numericAge >= 12 && (
          <group>
            <mesh position={[-0.48, -0.07, 0]} material={goldMaterial}>
              <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
            <mesh position={[0.48, -0.07, 0]} material={goldMaterial}>
              <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
          </group>
        )}

        {/* Spiritual Halo (Giác ngộ tâm linh / Phúc đức vô lượng / Thiền định) */}
        {hasHalo && (
          <group ref={haloRef} position={[0, 0.68, -0.05]} rotation={[0.22, 0, 0]}>
            <mesh material={haloMaterial}>
              <torusGeometry args={[0.42, 0.022, 16, 48]} />
            </mesh>
            {/* Celestial Motes */}
            <mesh position={[0.42, 0, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[-0.42, 0, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// Mood Lighting Controller (Burnout & Meditation-Reactive with 3-Point Studio Setup)
function MoodLighting({ burnout = 0, isMeditating = false }: { burnout: number; isMeditating?: boolean }) {
  const isHighBurnout = burnout > 75;
  const isModerateBurnout = burnout >= 40 && burnout <= 75;

  return (
    <>
      {/* Base Ambient Light */}
      <ambientLight
        intensity={isHighBurnout ? 0.28 : isMeditating ? 0.95 : 0.85}
        color={isHighBurnout ? '#450a0a' : isMeditating ? '#fef3c7' : isModerateBurnout ? '#e2e8f0' : '#fffbeb'}
      />

      {/* Main Studio Key Light (Warm Key) */}
      <directionalLight
        position={[2.8, 3.8, 3.2]}
        intensity={isHighBurnout ? 0.35 : 1.35}
        color={isHighBurnout ? '#991b1b' : '#fff7ed'}
      />

      {/* Soft Fill Light (Cool Studio Fill) */}
      <directionalLight
        position={[-3, 1.8, 2]}
        intensity={isHighBurnout ? 0.2 : 0.6}
        color={isHighBurnout ? '#581c87' : '#93c5fd'}
      />

      {/* Crisp Rim Light (Edge Glow) */}
      <directionalLight
        position={[0, 3.2, -3.2]}
        intensity={isHighBurnout ? 1.2 : 1.4}
        color={isHighBurnout ? '#ef4444' : isMeditating ? '#fbbf24' : '#38bdf8'}
      />

      {/* Soft Chin Bounce Light (Prevents harsh neck shadow) */}
      <pointLight
        position={[0, -1.8, 1.4]}
        intensity={0.3}
        color={isHighBurnout ? '#7f1d1d' : '#fde68a'}
      />

      {/* CINEMATIC HORROR SPOTLIGHT FROM BELOW (Burnout > 75) */}
      {isHighBurnout && (
        <spotLight
          position={[0, -2.2, 1.2]}
          target-position={[0, 0.5, 0]}
          intensity={3.2}
          color="#ef4444"
          angle={0.7}
          penumbra={0.8}
        />
      )}
    </>
  );
}

export default function Dynamic3DAvatar({
  nationality = 'Việt Nam',
  gender = 'male',
  age = 20,
  burnout = 0,
  vitality = 100,
  reaction = 'idle',
  isFastForwarding = false,
  className = 'w-full h-full',
  showControls = true,
  traits = [],
  netWorth = 0
}: Dynamic3DAvatarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Elegant fallback during SSR hydration
    return (
      <div className={`flex items-center justify-center bg-slate-950/80 rounded-2xl ${className}`}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl select-none ${className}`}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.12, 2.7], fov: 36 }}
        frameloop={isFastForwarding ? 'demand' : 'always'}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true }}
      >
        <MoodLighting burnout={burnout} isMeditating={reaction === 'meditating'} />

        <Float
          speed={isFastForwarding ? 0 : reaction === 'meditating' ? 2.5 : 1.2}
          rotationIntensity={reaction === 'meditating' ? 0.15 : 0.02}
          floatIntensity={reaction === 'meditating' ? 0.2 : 0.03}
        >
          <ProceduralCharacterMesh
            nationality={nationality}
            gender={gender}
            age={age}
            burnout={burnout}
            vitality={vitality}
            reaction={reaction}
            isFastForwarding={isFastForwarding}
            traits={traits}
            netWorth={netWorth}
          />
        </Float>

        {showControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            target={[0, 0.12, 0]}
            minPolarAngle={Math.PI / 2.8}
            maxPolarAngle={Math.PI / 1.8}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
          />
        )}
      </Canvas>

      {/* Burnout Horror Overlay Indicator */}
      {burnout > 75 && (
        <div className="absolute inset-0 pointer-events-none border border-rose-500/40 rounded-2xl bg-gradient-to-t from-rose-950/30 via-transparent to-transparent shadow-[inset_0_0_15px_rgba(239,68,68,0.25)]" />
      )}
    </div>
  );
}
