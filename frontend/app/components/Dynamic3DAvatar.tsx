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
  if (
    nat.includes('ba lan') || nat.includes('poland') || nat.includes('mỹ') || nat.includes('usa') ||
    nat.includes('anh') || nat.includes('đức') || nat.includes('pháp') || nat.includes('na uy') ||
    nat.includes('norway') || nat.includes('thụy sĩ') || nat.includes('switzerland')
  ) {
    return '#fde2d2'; // Fair / Porcelain Rosy Caucasian (như ảnh mẫu Na Uy)
  }
  if (nat.includes('syria') || nat.includes('ấn độ') || nat.includes('india') || nat.includes('ai cập') || nat.includes('egypt')) {
    return '#b97f57'; // Olive / Middle East / South Asian
  }
  if (nat.includes('somalia') || nat.includes('kenya') || nat.includes('châu phi') || nat.includes('nigeria') || nat.includes('congo') || nat.includes('sudan') || nat.includes('ethiopia') || nat.includes('haiti')) {
    return '#563520'; // Deep Melanin / African
  }
  if (nat.includes('nhật') || nat.includes('japan') || nat.includes('hàn') || nat.includes('korea') || nat.includes('trung') || nat.includes('china') || nat.includes('thái')) {
    return '#fae1c7'; // East Asian warm porcelain
  }
  return '#f6d2ad'; // Vietnamese warm golden
}

// Hair Color aging interpolation & cultural nuances
function getHairColor(age: number = 20, seed: number = 0, nationality: string = ''): string {
  if (age > 65) return '#f1f5f9'; // Pure Silver/White
  if (age > 45) return '#64748b'; // Salt & Pepper Slate
  const nat = nationality.toLowerCase();
  if (nat.includes('na uy') || nat.includes('norway')) {
    return '#784624'; // Warm Chestnut Auburn Brown hệt như ảnh mẫu
  }
  if (nat.includes('việt') || nat.includes('nhật') || nat.includes('hàn')) {
    return '#1c1917'; // Silky Obsidian Black
  }
  if (nat.includes('syria') || nat.includes('ai cập')) {
    return '#292524'; // Espresso Dark
  }
  const baseTones = ['#6c4427', '#261b18', '#3b2f2f', '#422006'];
  return baseTones[Math.abs(seed) % baseTones.length];
}

// Eye Iris Color according to Nationality & Ethnicity
function getIrisColor(nationality: string = ''): string {
  const nat = nationality.toLowerCase();
  if (nat.includes('na uy') || nat.includes('norway') || nat.includes('thụy sĩ') || nat.includes('ba lan')) {
    return '#0284c7'; // Vibrant Arctic Azure Blue / Teal
  }
  if (nat.includes('việt') || nat.includes('nhật') || nat.includes('hàn')) {
    return '#b45309'; // Warm Amber Chestnut
  }
  if (nat.includes('syria') || nat.includes('ai cập')) {
    return '#78350f'; // Golden Hazel
  }
  if (nat.includes('somalia') || nat.includes('châu phi')) {
    return '#1c1917'; // Deep Obsidian
  }
  return '#92400e';
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
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const hairGroupRef = useRef<THREE.Group>(null);
  const garlandRef = useRef<THREE.Group>(null);
  const satchelRef = useRef<THREE.Group>(null);

  const isFemale = gender === 'female';
  const skinColor = useMemo(() => getSkinTone(nationality), [nationality]);
  const hairColor = useMemo(() => getHairColor(age, nationality.charCodeAt(0), nationality), [age, nationality]);
  const irisColor = useMemo(() => getIrisColor(nationality), [nationality]);

  // Age scaling characteristics
  const numericAge = Number(age ?? 0);
  const isBaby = numericAge <= 3;
  const isChild = numericAge > 3 && numericAge < 12;
  const isTeen = numericAge >= 12 && numericAge < 18;
  const isElderly = numericAge >= 65;

  // Chibi Head Proportions (Đầu to tròn đáng yêu theo phong cách Anime Chibi)
  const headScale = isBaby ? 1.32 : isChild ? 1.22 : isTeen ? 1.15 : 1.08;
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

  // Should render Forest Garland Crown (Ảnh mẫu Na Uy / Yêu thiên nhiên / Tuổi thiếu niên)
  const hasGarland = useMemo(() => {
    const nat = nationality.toLowerCase();
    return (
      (nat.includes('na uy') || nat.includes('norway')) && numericAge <= 30
    ) || traitList.some(t => ['thảo_mộc_tự_nhiên', 'dược_sĩ', 'lương_y_từ_mẫu', 'tâm_hồn_nghệ_sĩ'].includes(t));
  }, [nationality, numericAge, traitList]);

  // Should render Crossbody Satchel (Túi đeo chéo phiêu lưu như ảnh mẫu)
  const hasSatchel = useMemo(() => {
    return !isBaby && (numericAge < 45 || hasGarland);
  }, [isBaby, numericAge, hasGarland]);

  // Materials with physical reactivity to stats & traits
  const skinMaterial = useMemo(() => {
    let effectiveSkin = skinColor;
    if (vitality < 30) {
      effectiveSkin = '#cbd5e1';
    }
    return new THREE.MeshStandardMaterial({
      color: effectiveSkin,
      roughness: vitality < 30 ? 0.8 : 0.55,
      metalness: 0.05,
    });
  }, [skinColor, vitality]);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.55,
    metalness: 0.12,
  }), [hairColor]);

  const eyeScleraMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff'
  }), []);

  const eyeIrisMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: irisColor,
    roughness: 0.2,
    metalness: 0.3
  }), [irisColor]);

  const eyePupilMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#180a02'
  }), []);

  const eyelashMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#271206'
  }), []);

  const blushMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#fb7185',
    transparent: true,
    opacity: 0.45
  }), []);

  const lipMaterial = useMemo(() => {
    let lipColor = '#e29578';
    if (isBaby || isChild) {
      lipColor = '#fca5a5';
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

  const rubyBerryMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.25,
    metalness: 0.4
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5c7832',
    roughness: 0.6,
    metalness: 0.05
  }), []);

  const vineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3d4c1e',
    roughness: 0.8
  }), []);

  const satchelLeatherMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8f562b',
    roughness: 0.75,
    metalness: 0.1
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

  // Cloth Material based on nationality & status
  const clothMaterial = useMemo(() => {
    const nat = nationality.toLowerCase();
    let clothColor = isFemale ? '#be185d' : '#4f46e5';

    if (isBaby) {
      clothColor = isFemale ? '#fbcfe8' : '#bae6fd';
    } else if (hasGarland || nat.includes('na uy') || nat.includes('norway')) {
      clothColor = '#6b7d47'; // Olive Moss Green hệt ảnh mẫu
    } else if (nat.includes('việt')) {
      clothColor = isFemale ? '#0284c7' : '#047857'; // Áo dài xanh lam / xanh ngọc
    } else if (isWealthy) {
      clothColor = isFemale ? '#4c0519' : '#0f172a';
    } else if (burnout > 75) {
      clothColor = '#334155';
    }

    return new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: isWealthy ? 0.45 : 0.75,
      metalness: isWealthy ? 0.2 : 0.05,
    });
  }, [isBaby, burnout, isFemale, isWealthy, hasGarland, nationality]);

  // Real-time Procedural Animation Loop with Natural Blinking & Mouse Head Tracking
  useFrame((state) => {
    if (isFastForwarding) return;

    const t = state.clock.getElapsedTime();

    if (headRef.current && groupRef.current) {
      // 1. Natural Breathing Cycle
      const breatheSpeed = vitality < 30 ? 1.0 : 2.2;
      const breatheAmp = vitality < 30 ? 0.012 : 0.02;
      const breathe = Math.sin(t * breatheSpeed) * breatheAmp;
      groupRef.current.position.y = -0.82 + breathe;

      // 2. Cursor Dõi Theo Tự Nhiên (Smooth Pointer Tracking)
      const targetRotationY = state.pointer.x * 0.35;
      const targetRotationX = -state.pointer.y * 0.25;

      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.08);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX + spineHunch, 0.08);

      // 3. Natural Eye Blinking Cycle (Every ~3.8s, lasts ~0.14s)
      const blinkCycle = t % 3.8;
      const isBlinking = blinkCycle > 3.66;
      const targetScaleY = isBlinking ? 0.08 : 1.0;

      if (leftEyeRef.current) leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetScaleY, 0.4);
      if (rightEyeRef.current) rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetScaleY, 0.4);

      // 4. Hair & Garland Soft Sway
      if (hairGroupRef.current) {
        hairGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.025;
      }
      if (garlandRef.current) {
        garlandRef.current.rotation.z = Math.sin(t * 1.5) * 0.015;
      }

      // 5. Halo gentle levitation & spin
      if (haloRef.current) {
        haloRef.current.position.y = 0.68 + Math.sin(t * 2.0) * 0.04;
        haloRef.current.rotation.z = t * 0.3;
      }

      // 6. Mouth animation based on reaction
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
          {/* Upper Torso & Collar (Áo Tunic hoặc Trang phục truyền thống) */}
          <mesh position={[0, 0.1, 0]} material={clothMaterial}>
            <cylinderGeometry args={[isFemale ? 0.36 : 0.42, isFemale ? 0.46 : 0.52, 0.65, 32]} />
          </mesh>

          {/* Shoulders */}
          <mesh position={[isFemale ? -0.38 : -0.45, 0.32, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.15 : 0.18, 16, 16]} />
          </mesh>
          <mesh position={[isFemale ? 0.38 : 0.45, 0.32, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.15 : 0.18, 16, 16]} />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.52, 0]} material={skinMaterial}>
            <cylinderGeometry args={[isFemale ? 0.14 : 0.16, isFemale ? 0.17 : 0.19, 0.28, 24]} />
          </mesh>

          {/* Crossbody Adventure Satchel Strap (Dây đai da vắt chéo như ảnh mẫu) */}
          {hasSatchel && (
            <group ref={satchelRef} position={[0, 0.12, 0]}>
              {/* Leather Strap across chest */}
              <mesh position={[0, 0.15, 0.22]} rotation={[0, 0, 0.48]}>
                <boxGeometry args={[0.065, 0.72, 0.02]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>

              {/* Satchel Bag on Hip */}
              <mesh position={[0.32, -0.05, 0.15]} rotation={[0.1, 0, -0.15]}>
                <boxGeometry args={[0.22, 0.24, 0.12]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>
              {/* Bag Flap */}
              <mesh position={[0.32, 0.04, 0.18]} rotation={[0.2, 0, -0.15]}>
                <boxGeometry args={[0.23, 0.12, 0.04]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>
              {/* Decorative Leaves on Satchel */}
              <mesh position={[0.35, -0.02, 0.22]} rotation={[0, 0, 0.4]}>
                <coneGeometry args={[0.045, 0.11, 8]} />
                <primitive object={leafMaterial} attach="material" />
              </mesh>
            </group>
          )}

          {/* Luxury Wealth Lapel Brooch / Gold Accessory */}
          {isWealthy && (
            <group position={[0, 0.15, 0]}>
              <mesh position={[0.2, 0.14, 0.25]} rotation={[0.2, 0.3, 0.4]} material={goldMaterial}>
                <octahedronGeometry args={[0.042, 0]} />
              </mesh>
              {isFemale ? (
                <mesh position={[0, 0.34, 0.08]} rotation={[1.1, 0, 0]} material={goldMaterial}>
                  <torusGeometry args={[0.19, 0.016, 12, 32]} />
                </mesh>
              ) : (
                <mesh position={[0, 0.04, 0.26]} material={goldMaterial}>
                  <boxGeometry args={[0.032, 0.16, 0.012]} />
                </mesh>
              )}
            </group>
          )}
        </>
      )}

      {/* Head Group (Rotatable & Cursor Tracking) */}
      <group ref={headRef} position={[0, isBaby ? 0.74 : 0.88, 0]} scale={[headScale, headScale, headScale]}>
        {/* Head Cranium */}
        <mesh material={skinMaterial}>
          <sphereGeometry args={[isFemale ? 0.46 : 0.47, 32, 32]} />
        </mesh>

        {/* Small Cute Chibi Nose */}
        {isBaby ? (
          <mesh position={[0, 0.01, 0.46]} material={skinMaterial}>
            <sphereGeometry args={[0.034, 12, 12]} />
          </mesh>
        ) : (
          <mesh position={[0, 0.02, 0.45]} rotation={[0.4, 0, 0]} material={skinMaterial}>
            <coneGeometry args={[0.045, 0.12, 16]} />
          </mesh>
        )}

        {/* =========================================================================
            DETAILED ANIME CHIBI EYES (Long lanh, đa lớp, có Catchlights kép)
            ========================================================================= */}
        {/* Left Eye Group */}
        <group ref={leftEyeRef} position={[-0.175, isBaby ? 0.08 : 0.11, 0.42]}>
          {/* Sclera (White base) */}
          <mesh position={[0, 0, 0]} material={eyeScleraMaterial}>
            <sphereGeometry args={[0.082, 24, 24]} />
          </mesh>
          {/* Iris (Colored Circle) */}
          <mesh position={[0.01, 0, 0.042]} material={eyeIrisMaterial}>
            <sphereGeometry args={[0.064, 20, 20]} />
          </mesh>
          {/* Pupil (Deep Dark Core) */}
          <mesh position={[0.012, 0, 0.064]} material={eyePupilMaterial}>
            <sphereGeometry args={[0.036, 16, 16]} />
          </mesh>
          {/* Primary Catchlight (Top-Left Specular Sparkle) */}
          <mesh position={[-0.016, 0.026, 0.076]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Secondary Catchlight (Bottom-Right Soft Sparkle) */}
          <mesh position={[0.024, -0.024, 0.074]}>
            <sphereGeometry args={[0.012, 10, 10]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Upper Eyelash Arc */}
          <mesh position={[0, 0.046, 0.062]} rotation={[0.2, 0, 0.15]} material={eyelashMaterial}>
            <boxGeometry args={[0.13, 0.022, 0.02]} />
          </mesh>
        </group>

        {/* Right Eye Group */}
        <group ref={rightEyeRef} position={[0.175, isBaby ? 0.08 : 0.11, 0.42]}>
          {/* Sclera (White base) */}
          <mesh position={[0, 0, 0]} material={eyeScleraMaterial}>
            <sphereGeometry args={[0.082, 24, 24]} />
          </mesh>
          {/* Iris (Colored Circle) */}
          <mesh position={[-0.01, 0, 0.042]} material={eyeIrisMaterial}>
            <sphereGeometry args={[0.064, 20, 20]} />
          </mesh>
          {/* Pupil (Deep Dark Core) */}
          <mesh position={[-0.012, 0, 0.064]} material={eyePupilMaterial}>
            <sphereGeometry args={[0.036, 16, 16]} />
          </mesh>
          {/* Primary Catchlight (Top-Left Specular Sparkle) */}
          <mesh position={[-0.024, 0.026, 0.076]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Secondary Catchlight (Bottom-Right Soft Sparkle) */}
          <mesh position={[0.016, -0.024, 0.074]}>
            <sphereGeometry args={[0.012, 10, 10]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Upper Eyelash Arc */}
          <mesh position={[0, 0.046, 0.062]} rotation={[0.2, 0, -0.15]} material={eyelashMaterial}>
            <boxGeometry args={[0.13, 0.022, 0.02]} />
          </mesh>
        </group>

        {/* Peach Blush (Hai má hồng ửng đào dễ thương như ảnh mẫu) */}
        <group position={[0, -0.06, 0.41]}>
          <mesh position={[-0.24, 0, 0]} material={blushMaterial}>
            <sphereGeometry args={[0.072, 16, 12]} />
          </mesh>
          <mesh position={[0.24, 0, 0]} material={blushMaterial}>
            <sphereGeometry args={[0.072, 16, 12]} />
          </mesh>
        </group>

        {/* Eyebrows */}
        {!isBaby && (
          <group>
            <mesh position={[-0.17, 0.22, 0.42]} rotation={[0, 0, reaction === 'exhausted' ? -0.15 : 0.05]} material={hairMaterial}>
              <boxGeometry args={[isChild ? 0.09 : (isFemale ? 0.13 : 0.14), 0.016, 0.03]} />
            </mesh>
            <mesh position={[0.17, 0.22, 0.42]} rotation={[0, 0, reaction === 'exhausted' ? 0.15 : -0.05]} material={hairMaterial}>
              <boxGeometry args={[isChild ? 0.09 : (isFemale ? 0.13 : 0.14), 0.016, 0.03]} />
            </mesh>
          </group>
        )}

        {/* Spectacles / Glasses (Cận thị / Tri thức) */}
        {hasGlasses && (
          <group position={[0, isBaby ? 0.08 : 0.11, 0.44]}>
            <mesh position={[-0.175, 0, 0]} material={glassesFrameMaterial}>
              <torusGeometry args={[0.092, 0.011, 16, 32]} />
            </mesh>
            <mesh position={[-0.175, 0, 0]} material={glassesLensMaterial}>
              <circleGeometry args={[0.086, 24]} />
            </mesh>
            <mesh position={[0.175, 0, 0]} material={glassesFrameMaterial}>
              <torusGeometry args={[0.092, 0.011, 16, 32]} />
            </mesh>
            <mesh position={[0.175, 0, 0]} material={glassesLensMaterial}>
              <circleGeometry args={[0.086, 24]} />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={glassesFrameMaterial}>
              <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} />
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
            <sphereGeometry args={[isChild ? 0.042 : (isFemale ? 0.058 : 0.052), 16, 8]} />
            <primitive object={lipMaterial} attach="material" />
          </mesh>
        )}

        {/* =========================================================================
            LAYERED VOLUMETRIC ANIME HAIR (Tóc uốn sóng bồng bềnh nhiều tầng như ảnh mẫu)
            ========================================================================= */}
        <group ref={hairGroupRef} position={[0, 0.15, 0]}>
          {isBaby ? (
            /* Adorable Baby Bonnet with Ribbon */
            <group position={[0, 0.06, 0]}>
              <mesh material={clothMaterial}>
                <sphereGeometry args={[0.48, 24, 24]} />
              </mesh>
              <mesh position={[0, 0.1, 0.28]} rotation={[0.3, 0, 0]} material={clothMaterial}>
                <torusGeometry args={[0.38, 0.045, 12, 24]} />
              </mesh>
              <mesh position={[0, 0.54, 0]} material={ribbonMaterial}>
                <sphereGeometry args={[0.085, 16, 16]} />
              </mesh>
            </group>
          ) : isFemale ? (
            /* WAVY LAYERED ANIME CHIBI FEMALE HAIRSTYLE (Như ảnh mẫu Na Uy) */
            <group>
              {/* Back Hair Volumetric Dome */}
              <mesh position={[0, 0.18, -0.12]} material={hairMaterial}>
                <sphereGeometry args={[0.52, 24, 24]} />
              </mesh>

              {/* Curved Bangs (Tóc mái uốn cong che trán) */}
              <mesh position={[0, 0.32, 0.34]} rotation={[0.28, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.46, 0.14, 0.18]} />
              </mesh>
              {/* Center Bang Tufts */}
              <mesh position={[0, 0.22, 0.41]} rotation={[0.35, 0, 0]} material={hairMaterial}>
                <coneGeometry args={[0.085, 0.18, 12]} />
              </mesh>
              <mesh position={[-0.14, 0.24, 0.39]} rotation={[0.35, 0, -0.18]} material={hairMaterial}>
                <coneGeometry args={[0.075, 0.16, 12]} />
              </mesh>
              <mesh position={[0.14, 0.24, 0.39]} rotation={[0.35, 0, 0.18]} material={hairMaterial}>
                <coneGeometry args={[0.075, 0.16, 12]} />
              </mesh>

              {/* Wavy Side Locks (Hai lọn tóc mai uốn lượn ôm má buông qua vai) */}
              <group position={[-0.38, -0.16, 0.12]} rotation={[0.1, 0, -0.12]}>
                <mesh material={hairMaterial}>
                  <cylinderGeometry args={[0.09, 0.12, 0.52, 16]} />
                </mesh>
                <mesh position={[0.02, -0.28, 0.04]} rotation={[0.2, 0, 0.2]} material={hairMaterial}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                </mesh>
              </group>

              <group position={[0.38, -0.16, 0.12]} rotation={[0.1, 0, 0.12]}>
                <mesh material={hairMaterial}>
                  <cylinderGeometry args={[0.09, 0.12, 0.52, 16]} />
                </mesh>
                <mesh position={[-0.02, -0.28, 0.04]} rotation={[0.2, 0, -0.2]} material={hairMaterial}>
                  <sphereGeometry args={[0.11, 16, 16]} />
                </mesh>
              </group>

              {/* Flowing Back Curls */}
              <mesh position={[0, -0.22, -0.28]} rotation={[-0.12, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.54, 0.58, 0.18]} />
              </mesh>
            </group>
          ) : (
            /* STYLIZED MALE ANIME HAIRSTYLE */
            <group>
              <mesh position={[0, 0.22, -0.06]} material={hairMaterial}>
                <sphereGeometry args={[0.5, 24, 24]} />
              </mesh>
              <mesh position={[0, 0.36, 0.32]} rotation={[0.32, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.44, 0.13, 0.16]} />
              </mesh>
              <mesh position={[-0.42, 0.02, 0.05]} material={hairMaterial}>
                <boxGeometry args={[0.09, 0.38, 0.18]} />
              </mesh>
              <mesh position={[0.42, 0.02, 0.05]} material={hairMaterial}>
                <boxGeometry args={[0.09, 0.38, 0.18]} />
              </mesh>
            </group>
          )}
        </group>

        {/* =========================================================================
            FOREST BERRY GARLAND CROWN (Vòng hoa lá quả mọng đỏ như ảnh mẫu Sếp gửi)
            ========================================================================= */}
        {hasGarland && (
          <group ref={garlandRef} position={[0, 0.36, 0.08]} rotation={[0.22, 0, 0]}>
            {/* Vine Ring */}
            <mesh material={vineMaterial}>
              <torusGeometry args={[0.46, 0.016, 12, 36]} />
            </mesh>

            {/* Ivy Leaves */}
            {[-0.38, -0.22, 0, 0.22, 0.38].map((lx, i) => (
              <mesh key={`leaf-${i}`} position={[lx, 0.04, 0.22 - Math.abs(lx) * 0.25]} rotation={[0.3, 0, lx * 0.8]} material={leafMaterial}>
                <coneGeometry args={[0.045, 0.1, 8]} />
              </mesh>
            ))}

            {/* Ruby Red Berries (Quả mọng đỏ rực rỡ) */}
            {[
              [-0.32, 0.06, 0.32],
              [-0.14, 0.08, 0.42],
              [0.14, 0.08, 0.42],
              [0.32, 0.06, 0.32],
              [-0.42, 0.02, 0.14],
              [0.42, 0.02, 0.14],
            ].map(([bx, by, bz], i) => (
              <mesh key={`berry-${i}`} position={[bx, by, bz]} material={rubyBerryMaterial}>
                <sphereGeometry args={[0.034, 12, 12]} />
              </mesh>
            ))}
          </group>
        )}

        {/* Ears */}
        <mesh position={[-0.48, 0.02, 0]} rotation={[0, -0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>
        <mesh position={[0.48, 0.02, 0]} rotation={[0, 0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.09, 16, 16]} />
        </mesh>

        {/* Spiritual Halo */}
        {hasHalo && (
          <group ref={haloRef} position={[0, 0.72, -0.05]} rotation={[0.22, 0, 0]}>
            <mesh material={haloMaterial}>
              <torusGeometry args={[0.44, 0.022, 16, 48]} />
            </mesh>
            <mesh position={[0.44, 0, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[-0.44, 0, 0]}>
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
      <ambientLight
        intensity={isHighBurnout ? 0.32 : isMeditating ? 0.95 : 0.88}
        color={isHighBurnout ? '#450a0a' : isMeditating ? '#fef3c7' : isModerateBurnout ? '#e2e8f0' : '#fffbeb'}
      />
      <directionalLight
        position={[2.8, 3.8, 3.2]}
        intensity={isHighBurnout ? 0.4 : 1.35}
        color={isHighBurnout ? '#991b1b' : '#fff7ed'}
      />
      <directionalLight
        position={[-3, 1.8, 2]}
        intensity={isHighBurnout ? 0.2 : 0.6}
        color={isHighBurnout ? '#581c87' : '#93c5fd'}
      />
      <directionalLight
        position={[0, 3.2, -3.2]}
        intensity={isHighBurnout ? 1.2 : 1.4}
        color={isHighBurnout ? '#ef4444' : isMeditating ? '#fbbf24' : '#38bdf8'}
      />
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
  showControls = false,
  traits = [],
  netWorth = 0
}: Dynamic3DAvatarProps) {
  const isDead = vitality <= 0;
  const isMeditating = reaction === 'meditating';

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0.1, 2.3], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true }}
      >
        <MoodLighting burnout={burnout} isMeditating={isMeditating} />

        <Float speed={isFastForwarding ? 0 : 1.4} rotationIntensity={0.12} floatIntensity={0.25}>
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
            enableZoom={true}
            enablePan={false}
            minDistance={1.2}
            maxDistance={3.8}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 3}
          />
        )}
      </Canvas>

      {/* Post-mortem Halo / Ghost Filter */}
      {isDead && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-grayscale flex items-center justify-center pointer-events-none z-10 animate-fade-in">
          <span className="text-3xl filter drop-shadow">🪦</span>
        </div>
      )}
    </div>
  );
}
