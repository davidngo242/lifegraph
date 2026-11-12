'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
  equippedPet?: string;
  level?: number;
}

// Procedural Skin Tone Mapping based on Nationality
function getSkinTone(nationality: string = 'Việt Nam'): string {
  const nat = nationality.toLowerCase();
  if (
    nat.includes('ba lan') || nat.includes('poland') || nat.includes('mỹ') || nat.includes('usa') ||
    nat.includes('anh') || nat.includes('đức') || nat.includes('pháp') || nat.includes('na uy') ||
    nat.includes('norway') || nat.includes('thụy sĩ') || nat.includes('switzerland')
  ) {
    return '#f8c7a6'; // Fair warm peach Caucasian
  }
  if (nat.includes('syria') || nat.includes('ấn độ') || nat.includes('india') || nat.includes('ai cập') || nat.includes('egypt')) {
    return '#c68a5c'; // Olive / Middle East / South Asian
  }
  if (nat.includes('somalia') || nat.includes('kenya') || nat.includes('châu phi') || nat.includes('nigeria') || nat.includes('congo') || nat.includes('sudan') || nat.includes('ethiopia') || nat.includes('haiti')) {
    return '#7a4a2c'; // Deep warm Melanin / African
  }
  if (nat.includes('nhật') || nat.includes('japan') || nat.includes('hàn') || nat.includes('korea') || nat.includes('trung') || nat.includes('china') || nat.includes('thái')) {
    return '#f5c9a0'; // East Asian warm
  }
  return '#efba8a'; // Vietnamese warm golden
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
  equippedPet?: string;
  level?: number;
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
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

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

  // Chibi Head Proportions (Cân đối tỉ lệ Anime Chibi hài hòa theo từng giai đoạn tuổi)
  const headScale = isBaby ? 1.04 : isChild ? 1.05 : isTeen ? 1.02 : 1.0;
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
      metalness: 0.0,
      emissive: vitality < 30 ? '#000000' : '#8a3a1a',
      emissiveIntensity: vitality < 30 ? 0 : 0.14,
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

  // Soft, lighter brow colour (hair blended toward skin) so it never reads as a frown
  const browMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor).lerp(new THREE.Color(skinColor), 0.4),
    roughness: 0.7,
  }), [hairColor, skinColor]);

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
      lipColor = '#f87171';
    } else if (isFemale) {
      lipColor = burnout > 75 ? '#be123c' : '#f43f5e';
    } else {
      lipColor = burnout > 80 ? '#7f1d1d' : '#c2413a';
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
    // Default: Regal Midnight Slate Anime Outfit (tránh màu xanh tím lòe loẹt AI)
    let clothColor = isFemale ? '#be185d' : '#1e293b';

    if (isBaby) {
      clothColor = isFemale ? '#fbcfe8' : '#bae6fd';
    } else if (hasGarland || nat.includes('na uy') || nat.includes('norway')) {
      clothColor = '#556b2f'; // Olive Moss Green hệt ảnh mẫu
    } else if (nat.includes('việt')) {
      clothColor = isFemale ? '#0284c7' : '#047857'; // Áo dài xanh lam / xanh ngọc
    } else if (isWealthy) {
      clothColor = isFemale ? '#4c0519' : '#09090b'; // Luxury obsidian tuxedo
    } else if (burnout > 75) {
      clothColor = '#334155';
    }

    return new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: isWealthy ? 0.35 : 0.65,
      metalness: isWealthy ? 0.25 : 0.1,
    });
  }, [isBaby, burnout, isFemale, isWealthy, hasGarland, nationality]);

  // Baby bonnet: clearly different from both hair and swaddle colours
  const bonnetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isFemale ? '#fde68a' : '#bbf7d0',
    roughness: 0.75,
  }), [isFemale]);

  // Full Body Pants / Trousers Material
  const pantsMaterial = useMemo(() => {
    let pantsColor = '#334155'; // Slate dark
    if (isBaby) {
      pantsColor = isFemale ? '#fbcfe8' : '#bae6fd';
    } else if (isWealthy) {
      pantsColor = isFemale ? '#31102f' : '#0f172a'; // Luxury dark tuxedo trousers
    } else if (hasGarland || nationality.toLowerCase().includes('na uy') || nationality.toLowerCase().includes('norway')) {
      pantsColor = '#3e342b'; // Earthy Nordic brown trousers
    } else if (nationality.toLowerCase().includes('việt')) {
      pantsColor = isFemale ? '#f8fafc' : '#1e293b'; // Quần lụa trắng hoặc quần âu
    }

    return new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: isWealthy ? 0.5 : 0.8,
      metalness: isWealthy ? 0.15 : 0.05,
    });
  }, [isBaby, isWealthy, hasGarland, nationality, isFemale]);

  // Full Body Boots / Shoes Material
  const shoeMaterial = useMemo(() => {
    let shoeColor = '#5c3a21'; // Classic leather boots
    if (isBaby) {
      shoeColor = '#fef08a';
    } else if (isWealthy) {
      shoeColor = '#09090b'; // Glossy polished black shoes
    } else if (isFemale) {
      shoeColor = '#831843'; // Rose/burgundy chic boots
    }

    return new THREE.MeshStandardMaterial({
      color: shoeColor,
      roughness: isWealthy ? 0.3 : 0.65,
      metalness: isWealthy ? 0.3 : 0.08,
    });
  }, [isBaby, isWealthy, isFemale]);

  const shoeSoleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.95,
  }), []);

  const beltMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isWealthy ? '#0f172a' : '#573016',
    roughness: 0.6,
    metalness: 0.2,
  }), [isWealthy]);

  // Real-time Procedural Animation Loop with Natural Blinking & Mouse Head Tracking
  useFrame((state) => {
    if (isFastForwarding) return;

    const t = state.clock.getElapsedTime();
    const breatheSpeed = 2.4;

    if (headRef.current && groupRef.current) {
      // 1. Natural Breathing Cycle (Chân cắm vững chắc trên bục trận pháp, không bị bay bay)
      groupRef.current.position.y = 0.0;

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
        const baseHaloY = isBaby ? 0.38 : 0.46;
        haloRef.current.position.y = baseHaloY + Math.sin(t * 2.0) * 0.02;
        haloRef.current.rotation.z = t * 0.3;
      }

      // 6. Mouth animation based on reaction
      if (mouthRef.current) {
        if (reaction === 'celebrate') {
          mouthRef.current.scale.set(1.3, 1.3, 1.3);
          mouthRef.current.rotation.z = Math.PI;
        } else if (reaction === 'shocked') {
          mouthRef.current.scale.set(0.9, 1.4, 0.9);
          mouthRef.current.rotation.z = Math.PI;
        } else if (reaction === 'exhausted') {
          mouthRef.current.scale.set(1, 0.8, 1);
          mouthRef.current.rotation.z = 0;
        } else {
          mouthRef.current.scale.set(1, 1, 1);
          mouthRef.current.rotation.z = Math.PI;
        }
      }

      // 7. Spine-style Dynamic Skeletal Arm Poses (Gotcha Pose / Hands on Hips / Victory / Zen)
      if (leftArmRef.current && rightArmRef.current) {
        if (reaction === 'celebrate') {
          // V-shape victory cheer with celebratory bounce
          const armBounce = Math.sin(t * 8) * 0.12;
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 2.3 + armBounce, 0.15);
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.2, 0.15);
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -2.3 - armBounce, 0.15);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.2, 0.15);
        } else if (reaction === 'exhausted' || vitality < 30) {
          // Limp drooping arms
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.15, 0.1);
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.35, 0.1);
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.15, 0.1);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.35, 0.1);
        } else if (reaction === 'meditating') {
          // Zen Lotus Mudra: hands folded peacefully in front
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.9, 0.1);
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.65, 0.1);
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.9, 0.1);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.65, 0.1);
        } else if (reaction === 'shocked') {
          // Hands clutching cheeks/chest
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 1.4, 0.2);
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8, 0.2);
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.4, 0.2);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, 0.2);
        } else {
          // Default MOBA Champion Gotcha_Pose (Hands on hips, confident anime posture with organic breathing sway)
          const armSway = Math.sin(t * breatheSpeed) * 0.035;
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.68 + armSway, 0.08);
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.28, 0.08);
          leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, 0.32, 0.08);

          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.68 - armSway, 0.08);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.28, 0.08);
          rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, -0.32, 0.08);
        }
      }

      // 8. Full-Body Dynamic Skeletal Leg Stance & Weight Shift
      if (leftLegRef.current && rightLegRef.current) {
        if (reaction === 'celebrate') {
          // Excited jumping bounce: legs bend slightly in rhythm
          const jumpBounce = Math.abs(Math.sin(t * 8)) * 0.08;
          leftLegRef.current.position.y = -0.32 + jumpBounce;
          rightLegRef.current.position.y = -0.32 + jumpBounce;
          leftLegRef.current.rotation.x = Math.sin(t * 8) * 0.18;
          rightLegRef.current.rotation.x = -Math.sin(t * 8) * 0.18;
        } else if (reaction === 'exhausted' || vitality < 30) {
          // Weak trembling knees, slight slouch
          leftLegRef.current.rotation.z = 0.04;
          leftLegRef.current.rotation.x = 0.08 + Math.sin(t * 1.5) * 0.02;
          rightLegRef.current.rotation.z = -0.04;
          rightLegRef.current.rotation.x = 0.08 - Math.sin(t * 1.5) * 0.02;
        } else if (reaction === 'meditating') {
          leftLegRef.current.rotation.x = 0;
          leftLegRef.current.rotation.z = 0.03;
          rightLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.z = -0.03;
        } else {
          // Natural Champion Stance: organic breathing weight shift
          const legSway = Math.sin(t * breatheSpeed) * 0.015;
          leftLegRef.current.rotation.z = 0.04 + legSway;
          rightLegRef.current.rotation.z = -0.04 - legSway;
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {isBaby ? (
        /* Cute Baby Swaddle Wrap with Little Hands, Golden Amulet & Kicking Booties */
        <group position={[0, -0.58, 0]}>
          {/* Swaddle Body Shell */}
          <mesh material={clothMaterial}>
            <cylinderGeometry args={[0.29, 0.35, 0.58, 24]} />
          </mesh>
          {/* Swaddle Soft Collar Ring */}
          <mesh position={[0, 0.25, 0.04]} rotation={[0.2, 0, 0]} material={clothMaterial}>
            <torusGeometry args={[0.25, 0.045, 12, 24]} />
          </mesh>
          {/* Golden Amulet / Clasp on Chest */}
          <mesh position={[0, 0.18, 0.26]} material={goldMaterial}>
            <octahedronGeometry args={[0.032, 0]} />
          </mesh>
          {/* Decorative Swaddle Sash */}
          <mesh position={[0, 0.02, 0.02]} rotation={[0.1, 0, 0]} material={ribbonMaterial}>
            <torusGeometry args={[0.28, 0.018, 12, 24]} />
          </mesh>
          {/* Little arms at the sides */}
          {[-1, 1].map((side) => (
            <group key={`baby-arm-${side}`} position={[side * 0.31, 0.16, 0.06]} rotation={[0, 0, side * 0.35]}>
              <mesh position={[0, -0.1, 0]} material={clothMaterial}>
                <capsuleGeometry args={[0.062, 0.14, 6, 14]} />
              </mesh>
              <mesh position={[0, -0.24, 0.02]} material={skinMaterial}>
                <sphereGeometry args={[0.058, 14, 14]} />
              </mesh>
            </group>
          ))}
          {/* Little Cute Baby Hands resting peacefully on chest */}
          <mesh position={[-0.08, 0.11, 0.24]} material={skinMaterial}>
            <sphereGeometry args={[0.048, 14, 14]} />
          </mesh>
          <mesh position={[0.08, 0.11, 0.24]} material={skinMaterial}>
            <sphereGeometry args={[0.048, 14, 14]} />
          </mesh>
          {/* Little Cute Baby Feet Kicking right on dais */}
          <group position={[-0.09, -0.32, 0.12]}>
            <mesh material={shoeMaterial}>
              <sphereGeometry args={[0.065, 14, 14]} />
            </mesh>
            <mesh position={[0, 0.02, 0.03]} material={goldMaterial}>
              <boxGeometry args={[0.03, 0.015, 0.01]} />
            </mesh>
          </group>
          <group position={[0.09, -0.30, 0.14]}>
            <mesh material={shoeMaterial}>
              <sphereGeometry args={[0.065, 14, 14]} />
            </mesh>
            <mesh position={[0, 0.02, 0.03]} material={goldMaterial}>
              <boxGeometry args={[0.03, 0.015, 0.01]} />
            </mesh>
          </group>
        </group>
      ) : (
        <>
          {/* =========================================================================
              FULL BODY LOWER SECTION: LEGS, KNEES, SHINS, ANKLES & BOOTS/SHOES
              ========================================================================= */}
          {/* Pelvis & Hips Base */}
          <mesh position={[0, -0.22, 0]} material={pantsMaterial}>
            <cylinderGeometry args={[isFemale ? 0.26 : 0.29, isFemale ? 0.24 : 0.27, 0.20, 24]} />
          </mesh>

          {/* Waist Belt & Buckle */}
          <mesh position={[0, -0.15, 0]} material={beltMaterial}>
            <torusGeometry args={[isFemale ? 0.265 : 0.295, 0.018, 12, 32]} />
          </mesh>
          <mesh position={[0, -0.15, isFemale ? 0.27 : 0.30]} material={goldMaterial}>
            <boxGeometry args={[0.065, 0.048, 0.018]} />
          </mesh>

          {/* Tunic / Jacket Lower Hem Flair */}
          <mesh position={[0, -0.26, 0]} material={clothMaterial}>
            <cylinderGeometry args={[isFemale ? 0.27 : 0.30, isFemale ? 0.33 : 0.32, 0.16, 24]} />
          </mesh>

          {/* LEFT LEG & BOOT */}
          <group ref={leftLegRef} position={[isFemale ? -0.13 : -0.15, -0.32, 0]}>
            {/* Upper Thigh */}
            <mesh position={[0, -0.13, 0]} material={pantsMaterial}>
              <cylinderGeometry args={[0.078, 0.068, 0.26, 16]} />
            </mesh>
            {/* Knee Joint */}
            <mesh position={[0, -0.26, 0.01]} material={pantsMaterial}>
              <sphereGeometry args={[0.068, 14, 14]} />
            </mesh>
            {/* Lower Shin / Calf */}
            <mesh position={[0, -0.40, 0]} material={pantsMaterial}>
              <cylinderGeometry args={[0.064, 0.056, 0.26, 16]} />
            </mesh>
            {/* Boot Collar / Cuff */}
            <mesh position={[0, -0.52, 0]} material={shoeMaterial}>
              <torusGeometry args={[0.062, 0.016, 12, 24]} />
            </mesh>
            {/* Boot Body & Toe */}
            <group position={[0, -0.60, 0.04]}>
              {/* Sole */}
              <mesh position={[0, -0.04, 0]} material={shoeSoleMaterial}>
                <boxGeometry args={[0.11, 0.024, 0.22]} />
              </mesh>
              {/* Upper */}
              <mesh position={[0, 0, 0]} material={shoeMaterial}>
                <boxGeometry args={[0.10, 0.065, 0.20]} />
              </mesh>
              {/* Rounded Front Toe */}
              <mesh position={[0, -0.005, 0.08]} material={shoeMaterial}>
                <sphereGeometry args={[0.052, 14, 14]} />
              </mesh>
            </group>
          </group>

          {/* RIGHT LEG & BOOT */}
          <group ref={rightLegRef} position={[isFemale ? 0.13 : 0.15, -0.32, 0]}>
            {/* Upper Thigh */}
            <mesh position={[0, -0.13, 0]} material={pantsMaterial}>
              <cylinderGeometry args={[0.078, 0.068, 0.26, 16]} />
            </mesh>
            {/* Knee Joint */}
            <mesh position={[0, -0.26, 0.01]} material={pantsMaterial}>
              <sphereGeometry args={[0.068, 14, 14]} />
            </mesh>
            {/* Lower Shin / Calf */}
            <mesh position={[0, -0.40, 0]} material={pantsMaterial}>
              <cylinderGeometry args={[0.064, 0.056, 0.26, 16]} />
            </mesh>
            {/* Boot Collar / Cuff */}
            <mesh position={[0, -0.52, 0]} material={shoeMaterial}>
              <torusGeometry args={[0.062, 0.016, 12, 24]} />
            </mesh>
            {/* Boot Body & Toe */}
            <group position={[0, -0.60, 0.04]}>
              {/* Sole */}
              <mesh position={[0, -0.04, 0]} material={shoeSoleMaterial}>
                <boxGeometry args={[0.11, 0.024, 0.22]} />
              </mesh>
              {/* Upper */}
              <mesh position={[0, 0, 0]} material={shoeMaterial}>
                <boxGeometry args={[0.10, 0.065, 0.20]} />
              </mesh>
              {/* Rounded Front Toe */}
              <mesh position={[0, -0.005, 0.08]} material={shoeMaterial}>
                <sphereGeometry args={[0.052, 14, 14]} />
              </mesh>
            </group>
          </group>

          {/* =========================================================================
              FULL BODY UPPER SECTION: TORSO, CHEST, SHOULDERS, ARMS & HANDS
              ========================================================================= */}
          {/* Mid Torso */}
          <mesh position={[0, -0.02, 0]} material={clothMaterial}>
            <cylinderGeometry args={[isFemale ? 0.28 : 0.32, isFemale ? 0.26 : 0.29, 0.22, 24]} />
          </mesh>

          {/* Upper Torso & Chest */}
          <mesh position={[0, 0.16, 0]} material={clothMaterial}>
            <cylinderGeometry args={[isFemale ? 0.32 : 0.36, isFemale ? 0.28 : 0.32, 0.26, 32]} />
          </mesh>

          {/* Golden Royal Collar & Chest Medallion */}
          <mesh position={[0, 0.27, 0.04]} rotation={[1.15, 0, 0]} material={goldMaterial}>
            <torusGeometry args={[0.16, 0.015, 12, 32]} />
          </mesh>
          <mesh position={[0, 0.18, 0.21]} material={goldMaterial}>
            <octahedronGeometry args={[0.038, 0]} />
          </mesh>

          {/* Shoulders & Golden Pauldrons (Cầu vai hoàng kim anime) */}
          <mesh position={[isFemale ? -0.34 : -0.38, 0.26, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.13 : 0.15, 16, 16]} />
          </mesh>
          <mesh position={[isFemale ? -0.37 : -0.41, 0.32, 0]} rotation={[0, 0, 0.22]} material={goldMaterial}>
            <boxGeometry args={[0.13, 0.035, 0.16]} />
          </mesh>

          <mesh position={[isFemale ? 0.34 : 0.38, 0.26, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.13 : 0.15, 16, 16]} />
          </mesh>
          <mesh position={[isFemale ? 0.37 : 0.41, 0.32, 0]} rotation={[0, 0, -0.22]} material={goldMaterial}>
            <boxGeometry args={[0.13, 0.035, 0.16]} />
          </mesh>

          {/* Left Arm & Hand (Skeletal Gotcha Pose Rigging) */}
          <group ref={leftArmRef} position={[isFemale ? -0.34 : -0.38, 0.26, 0]}>
            <mesh position={[0, -0.14, 0]} material={clothMaterial}>
              <cylinderGeometry args={[0.075, 0.066, 0.26, 16]} />
            </mesh>
            <mesh position={[0, -0.27, 0]} material={clothMaterial}>
              <sphereGeometry args={[0.066, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.38, 0.04]} material={skinMaterial}>
              <cylinderGeometry args={[0.062, 0.054, 0.20, 16]} />
            </mesh>
            {/* Golden Wrist Bracer */}
            <mesh position={[0, -0.42, 0.05]} material={goldMaterial}>
              <cylinderGeometry args={[0.066, 0.060, 0.06, 16]} />
            </mesh>
            {/* Hand & Fingers */}
            <mesh position={[0, -0.50, 0.07]} material={skinMaterial}>
              <sphereGeometry args={[0.068, 16, 16]} />
            </mesh>
            <mesh position={[-0.02, -0.48, 0.11]} rotation={[0.4, 0, 0]} material={skinMaterial}>
              <sphereGeometry args={[0.028, 10, 10]} />
            </mesh>
          </group>

          {/* Right Arm & Hand (Skeletal Gotcha Pose Rigging) */}
          <group ref={rightArmRef} position={[isFemale ? 0.34 : 0.38, 0.26, 0]}>
            <mesh position={[0, -0.14, 0]} material={clothMaterial}>
              <cylinderGeometry args={[0.075, 0.066, 0.26, 16]} />
            </mesh>
            <mesh position={[0, -0.27, 0]} material={clothMaterial}>
              <sphereGeometry args={[0.066, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.38, 0.04]} material={skinMaterial}>
              <cylinderGeometry args={[0.062, 0.054, 0.20, 16]} />
            </mesh>
            {/* Golden Wrist Bracer */}
            <mesh position={[0, -0.42, 0.05]} material={goldMaterial}>
              <cylinderGeometry args={[0.066, 0.060, 0.06, 16]} />
            </mesh>
            {/* Hand & Fingers */}
            <mesh position={[0, -0.50, 0.07]} material={skinMaterial}>
              <sphereGeometry args={[0.068, 16, 16]} />
            </mesh>
            <mesh position={[0.02, -0.48, 0.11]} rotation={[0.4, 0, 0]} material={skinMaterial}>
              <sphereGeometry args={[0.028, 10, 10]} />
            </mesh>
          </group>

          {/* Neck */}
          <mesh position={[0, 0.38, 0]} material={skinMaterial}>
            <cylinderGeometry args={[isFemale ? 0.12 : 0.14, isFemale ? 0.15 : 0.17, 0.22, 24]} />
          </mesh>

          {/* Crossbody Adventure Satchel Strap (Dây đai da vắt chéo như ảnh mẫu) */}
          {hasSatchel && (
            <group ref={satchelRef} position={[0, 0.06, 0]}>
              {/* Leather Strap across chest */}
              <mesh position={[0, 0.10, 0.19]} rotation={[0, 0, 0.48]}>
                <boxGeometry args={[0.055, 0.62, 0.02]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>

              {/* Satchel Bag on Hip */}
              <mesh position={[0.26, -0.12, 0.14]} rotation={[0.1, 0, -0.15]}>
                <boxGeometry args={[0.18, 0.20, 0.10]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>
              {/* Bag Flap */}
              <mesh position={[0.26, -0.04, 0.16]} rotation={[0.2, 0, -0.15]}>
                <boxGeometry args={[0.19, 0.10, 0.035]} />
                <primitive object={satchelLeatherMaterial} attach="material" />
              </mesh>
              {/* Decorative Leaves on Satchel */}
              <mesh position={[0.28, -0.09, 0.20]} rotation={[0, 0, 0.4]}>
                <coneGeometry args={[0.038, 0.09, 8]} />
                <primitive object={leafMaterial} attach="material" />
              </mesh>
            </group>
          )}

          {/* Luxury Wealth Lapel Brooch / Gold Accessory */}
          {isWealthy && (
            <group position={[0, 0.08, 0]}>
              <mesh position={[0.16, 0.12, 0.22]} rotation={[0.2, 0.3, 0.4]} material={goldMaterial}>
                <octahedronGeometry args={[0.038, 0]} />
              </mesh>
              {isFemale ? (
                <mesh position={[0, 0.28, 0.08]} rotation={[1.1, 0, 0]} material={goldMaterial}>
                  <torusGeometry args={[0.16, 0.014, 12, 32]} />
                </mesh>
              ) : (
                <mesh position={[0, 0.02, 0.23]} material={goldMaterial}>
                  <boxGeometry args={[0.028, 0.14, 0.012]} />
                </mesh>
              )}
            </group>
          )}
        </>
      )}

      {/* Head Group (Rotatable & Cursor Tracking) */}
      <group ref={headRef} position={[0, isBaby ? -0.06 : isChild ? 0.42 : 0.62, 0]} scale={[headScale, headScale, headScale]}>
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
            <boxGeometry args={[0.13, 0.014, 0.02]} />
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
            <boxGeometry args={[0.13, 0.014, 0.02]} />
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
            <mesh position={[-0.17, 0.235, 0.425]} rotation={[0, 0.2, reaction === 'exhausted' ? -0.15 : -0.1]} material={browMaterial}>
              <boxGeometry args={[isChild ? 0.08 : (isFemale ? 0.11 : 0.12), 0.009, 0.016]} />
            </mesh>
            <mesh position={[0.17, 0.235, 0.425]} rotation={[0, -0.2, reaction === 'exhausted' ? 0.15 : 0.1]} material={browMaterial}>
              <boxGeometry args={[isChild ? 0.08 : (isFemale ? 0.11 : 0.12), 0.009, 0.016]} />
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

        {/* Mouth / Baby Pacifier vs Chibi Smile */}
        {isBaby && age < 2 ? (
          <group position={[0, -0.12, 0.44]}>
            <mesh material={goldMaterial}>
              <torusGeometry args={[0.042, 0.012, 12, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.02]} material={clothMaterial}>
              <sphereGeometry args={[0.034, 16, 16]} />
            </mesh>
          </group>
        ) : (
          <group position={[0, isBaby ? -0.12 : isChild ? -0.15 : -0.18, 0.45]}>
            <mesh ref={mouthRef} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[isBaby ? 0.045 : isChild ? 0.05 : (isFemale ? 0.062 : 0.058), 0.014, 8, 20, Math.PI]} />
              <primitive object={lipMaterial} attach="material" />
            </mesh>
          </group>
        )}

        {/* =========================================================================
            LAYERED VOLUMETRIC ANIME HAIR (Tóc uốn sóng bồng bềnh nhiều tầng như ảnh mẫu)
            ========================================================================= */}
        <group ref={hairGroupRef} position={[0, 0.15, 0]}>
          {isBaby ? (
            /* Adorable Baby Bonnet with Teddy Bear Ears & Golden Ribbon Trim */
            <group position={[0, 0.06, 0]}>
              {/* Hair fringe peeking out under the bonnet */}
              <mesh position={[0, 0.0, 0.40]} scale={[1.5, 0.55, 0.5]} material={hairMaterial}>
                <sphereGeometry args={[0.13, 16, 12]} />
              </mesh>
              {/* Bonnet Dome */}
              <mesh material={bonnetMaterial}>
                <sphereGeometry args={[0.48, 24, 24]} />
              </mesh>
              {/* Soft Bonnet Front Brim */}
              <mesh position={[0, 0.1, 0.28]} rotation={[0.3, 0, 0]} material={bonnetMaterial}>
                <torusGeometry args={[0.38, 0.045, 12, 24]} />
              </mesh>
              {/* Golden Ribbon Brim Trim */}
              <mesh position={[0, 0.1, 0.29]} rotation={[0.3, 0, 0]} material={goldMaterial}>
                <torusGeometry args={[0.385, 0.012, 12, 24]} />
              </mesh>
              {/* Left Bear Ear */}
              <group position={[-0.26, 0.44, 0.08]}>
                <mesh material={bonnetMaterial}>
                  <sphereGeometry args={[0.10, 16, 16]} />
                </mesh>
                <mesh position={[0, 0, 0.035]} material={ribbonMaterial}>
                  <sphereGeometry args={[0.065, 14, 14]} />
                </mesh>
              </group>
              {/* Right Bear Ear */}
              <group position={[0.26, 0.44, 0.08]}>
                <mesh material={bonnetMaterial}>
                  <sphereGeometry args={[0.10, 16, 16]} />
                </mesh>
                <mesh position={[0, 0, 0.035]} material={ribbonMaterial}>
                  <sphereGeometry args={[0.065, 14, 14]} />
                </mesh>
              </group>
              {/* Soft Center Pom-pom Top */}
              <mesh position={[0, 0.54, 0]} material={ribbonMaterial}>
                <sphereGeometry args={[0.075, 16, 16]} />
              </mesh>
            </group>
          ) : isFemale ? (
            /* WAVY LAYERED ANIME CHIBI FEMALE HAIRSTYLE (Như ảnh mẫu Na Uy) */
            <group>
              {/* Back Hair Volumetric Dome */}
              <mesh position={[0, 0.18, -0.12]} material={hairMaterial}>
                <sphereGeometry args={[0.52, 24, 24]} />
              </mesh>

              {/* Curved Bangs (Tóc mái uốn cong che trán mềm mại) */}
              <mesh position={[0, 0.32, 0.35]} rotation={[0.26, 0, 0]} material={hairMaterial}>
                <sphereGeometry args={[0.26, 20, 20]} />
              </mesh>
              {/* Center Bang Tufts */}
              <mesh position={[0, 0.23, 0.41]} rotation={[0.32, 0, 0]} material={hairMaterial}>
                <coneGeometry args={[0.08, 0.17, 12]} />
              </mesh>
              <mesh position={[-0.14, 0.25, 0.39]} rotation={[0.32, 0, -0.16]} material={hairMaterial}>
                <coneGeometry args={[0.07, 0.15, 12]} />
              </mesh>
              <mesh position={[0.14, 0.25, 0.39]} rotation={[0.32, 0, 0.16]} material={hairMaterial}>
                <coneGeometry args={[0.07, 0.15, 12]} />
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
            /* STYLIZED MALE ANIME HAIRSTYLE (Tóc Chibi Anime Phong Cách K-Pop / Anime Mềm Mại) */
            <group>
              {/* Back & Dome Hair Volume */}
              <mesh position={[0, 0.22, -0.06]} material={hairMaterial}>
                <sphereGeometry args={[0.51, 28, 28]} />
              </mesh>
              {/* Front Swept Bangs (Tóc mái chéo anime uốn cong mềm mại tự nhiên) */}
              <mesh position={[-0.14, 0.32, 0.34]} rotation={[0.25, 0.12, -0.18]} material={hairMaterial}>
                <sphereGeometry args={[0.22, 16, 16]} />
              </mesh>
              <mesh position={[0.12, 0.33, 0.34]} rotation={[0.22, -0.15, 0.16]} material={hairMaterial}>
                <sphereGeometry args={[0.20, 16, 16]} />
              </mesh>
              <mesh position={[0, 0.35, 0.36]} rotation={[0.28, 0, 0]} material={hairMaterial}>
                <sphereGeometry args={[0.18, 16, 16]} />
              </mesh>
              {/* Side Locks (Tóc mai ôm hai má mềm mại) */}
              <group position={[-0.42, 0.06, 0.10]} rotation={[0.1, 0, -0.12]}>
                <mesh material={hairMaterial}>
                  <cylinderGeometry args={[0.07, 0.09, 0.34, 16]} />
                </mesh>
                <mesh position={[0.01, -0.18, 0.02]} material={hairMaterial}>
                  <sphereGeometry args={[0.08, 14, 14]} />
                </mesh>
              </group>
              <group position={[0.42, 0.06, 0.10]} rotation={[0.1, 0, 0.12]}>
                <mesh material={hairMaterial}>
                  <cylinderGeometry args={[0.07, 0.09, 0.34, 16]} />
                </mesh>
                <mesh position={[-0.01, -0.18, 0.02]} material={hairMaterial}>
                  <sphereGeometry args={[0.08, 14, 14]} />
                </mesh>
              </group>
              {/* Soft Top Crest Volume */}
              <mesh position={[0, 0.50, 0.04]} rotation={[-0.15, 0, 0]} material={hairMaterial}>
                <sphereGeometry args={[0.16, 16, 16]} />
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
          <group ref={haloRef} position={[0, isBaby ? 0.38 : 0.46, -0.05]} rotation={[0.22, 0, 0]}>
            <mesh material={haloMaterial}>
              <torusGeometry args={[isBaby ? 0.30 : 0.36, 0.018, 16, 48]} />
            </mesh>
            <mesh position={[isBaby ? 0.30 : 0.36, 0, 0]}>
              <sphereGeometry args={[0.024, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[isBaby ? -0.30 : -0.36, 0, 0]}>
              <sphereGeometry args={[0.024, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// 3D Magic Dais with 5-Tier Level Progression (Bục Ma Pháp Hoàng Kim Thăng Hoa Theo Cấp Độ RPG)
function GoldenMagicDais({
  level = 1,
  isMeditating = false
}: {
  level?: number;
  isMeditating?: boolean;
}) {
  const outerRuneRef = useRef<THREE.Group>(null);
  const midRuneRef = useRef<THREE.Group>(null);
  const footAuraRef = useRef<THREE.Group>(null);
  const lightBeamsRef = useRef<THREE.Group>(null);
  const floatingCrystalsRef = useRef<THREE.Group>(null);

  // Level Progression Tiers (Giữ vững cốt cách Hoàng Kim Sang Trọng, tăng dần hiệu ứng thần thoại theo cấp)
  const daisTier = level >= 71 ? 5 : level >= 46 ? 4 : level >= 26 ? 3 : level >= 11 ? 2 : 1;

  // Obsidian Core Base
  const daisCoreMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.6,
    metalness: 0.3
  }), []);

  // Lustrous Gold Plate (Bục Vàng Kim Sang Trọng Cho Mọi Cấp Độ)
  const daisGoldPlate = useMemo(() => new THREE.MeshStandardMaterial({
    color: daisTier >= 5 ? '#fef08a' : '#f59e0b',
    roughness: 0.18,
    metalness: 0.92,
    emissive: daisTier >= 4 ? '#b45309' : '#78350f',
    emissiveIntensity: 0.35,
  }), [daisTier]);

  const goldGlowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#fbbf24',
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  const cyanRuneMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  const contactShadowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#020617',
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  const verticalBeamMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: daisTier >= 5 ? '#67e8f9' : daisTier >= 4 ? '#c084fc' : '#fef08a',
    transparent: true,
    opacity: daisTier >= 4 ? 0.09 : 0.06,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [daisTier]);

  const amethystCrystalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c084fc',
    roughness: 0.15,
    metalness: 0.4,
    emissive: '#9333ea',
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9
  }), []);

  const astralDiamondMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fef08a',
    roughness: 0.1,
    metalness: 0.6,
    emissive: '#38bdf8',
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.92
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRuneRef.current) {
      outerRuneRef.current.rotation.y = t * (daisTier >= 4 ? 0.22 : 0.16);
    }
    if (midRuneRef.current) {
      midRuneRef.current.rotation.y = -t * (daisTier >= 4 ? 0.28 : 0.22);
    }
    if (footAuraRef.current) {
      footAuraRef.current.rotation.y = t * 0.35;
    }
    if (lightBeamsRef.current) {
      lightBeamsRef.current.position.y = Math.sin(t * 2.2) * 0.02;
    }
    if (floatingCrystalsRef.current) {
      floatingCrystalsRef.current.rotation.y = t * 0.35;
      floatingCrystalsRef.current.position.y = (daisTier === 5 ? 0.30 : 0.26) + Math.sin(t * 2.5) * 0.035;
    }
  });

  const runeCount = daisTier >= 4 ? 12 : 8;
  const runeAngles = Array.from({ length: runeCount }, (_, i) => (i * 360) / runeCount);

  return (
    <group position={[0, -0.98, 0]}>
      {/* 1. Dais Stepped Plinth Base (Đế Bục Hoàng Kim Cẩm Thạch Sang Trọng) */}
      <mesh position={[0, -0.04, 0]} material={daisCoreMaterial}>
        <cylinderGeometry args={[0.92, 1.05, 0.06, 36]} />
      </mesh>
      <mesh position={[0, -0.015, 0]} material={daisGoldPlate}>
        <cylinderGeometry args={[0.94, 0.96, 0.025, 36]} />
      </mesh>

      {/* 2. Soft Realistic Foot Contact Shadows (Bóng đổ dưới từng bàn chân, không che phủ tâm bục) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.14, 0.003, 0.04]} material={contactShadowMaterial}>
        <ringGeometry args={[0, 0.11, 16]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.14, 0.003, 0.04]} material={contactShadowMaterial}>
        <ringGeometry args={[0, 0.11, 16]} />
      </mesh>

      {/* 3. Outer Golden Magic Rune Ring (Vòng Trận Pháp Ngoại Vi Hoàng Kim) */}
      <group ref={outerRuneRef} position={[0, 0.008, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldGlowMaterial}>
          <ringGeometry args={[0.82, 0.89, 48]} />
        </mesh>
        {/* Perimeter Rune Marks */}
        {runeAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const rx = Math.cos(rad) * 0.855;
          const rz = Math.sin(rad) * 0.855;
          return (
            <mesh key={`outer-rune-${i}`} position={[rx, 0.004, rz]} rotation={[0, -rad, 0]} material={goldGlowMaterial}>
              <boxGeometry args={[0.045, 0.005, 0.016]} />
            </mesh>
          );
        })}
      </group>

      {/* 4. Mid Cyan / Teal Magic Circle Ring & Star Spokes (Vòng Trận Pháp Trung Tâm Lam Ngọc) */}
      <group ref={midRuneRef} position={[0, 0.010, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={cyanRuneMaterial}>
          <ringGeometry args={[0.55, 0.62, 36]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldGlowMaterial}>
          <ringGeometry args={[0.49, 0.51, 36]} />
        </mesh>
        {[0, 60, 120].map((rotDeg, idx) => {
          const rad = (rotDeg * Math.PI) / 180;
          return (
            <mesh key={`spoke-${idx}`} rotation={[-Math.PI / 2, 0, rad]} material={goldGlowMaterial}>
              <planeGeometry args={[1.1, 0.012]} />
            </mesh>
          );
        })}
      </group>

      {/* 5. VÒNG HÀO QUANG TRỰC TIẾP DƯỚI CHÂN NHÂN VẬT (Foot Aura Halo Ring - Ôm Sát Dưới Chân Rực Rỡ) */}
      <group ref={footAuraRef} position={[0, 0.012, 0]}>
        {/* Vòng Hào Quang Hoàng Kim Dưới Chân */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={goldGlowMaterial}>
          <ringGeometry args={[0.33, 0.39, 36]} />
        </mesh>
        {/* Vòng Viền Lam Ngọc Hộ Thể */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={cyanRuneMaterial}>
          <ringGeometry args={[0.26, 0.28, 32]} />
        </mesh>
        {/* 4 Ngọc Ấn Rune Nhỏ Quanh Chân */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const fx = Math.cos(rad) * 0.36;
          const fz = Math.sin(rad) * 0.36;
          return (
            <mesh key={`foot-gem-${i}`} position={[fx, 0.003, fz]} rotation={[-Math.PI / 2, 0, rad]} material={goldGlowMaterial}>
              <planeGeometry args={[0.026, 0.026]} />
            </mesh>
          );
        })}
      </group>

      {/* 6. Center Golden Core Sun Disc (Tâm Trận Thái Dương Phát Quang) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} material={goldGlowMaterial}>
        <ringGeometry args={[0.13, 0.18, 24]} />
      </mesh>

      {/* 7. Vertical Light Shroud & Rising Energy Beams (Màn Quang Thiên Giới) */}
      <group ref={lightBeamsRef}>
        <mesh position={[0, 0.35, 0]} material={verticalBeamMaterial}>
          <cylinderGeometry args={[0.82, 0.90, 0.7, 24, 1, true]} />
        </mesh>
        {daisTier >= 3 && [
          [-0.45, 0.25, 0.3],
          [0.45, 0.25, 0.3],
          [-0.35, 0.35, -0.4],
          [0.35, 0.35, -0.4],
        ].map(([bx, by, bz], i) => (
          <mesh key={`beam-${i}`} position={[bx, by, bz]} material={goldGlowMaterial}>
            <cylinderGeometry args={[0.01, 0.02, 0.5, 8]} />
          </mesh>
        ))}
      </group>

      {/* 8. Tier 4 & 5 Floating Magic Crystals */}
      {daisTier === 4 && (
        <group ref={floatingCrystalsRef} position={[0, 0.26, 0]}>
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.cos(rad) * 0.95;
            const cz = Math.sin(rad) * 0.95;
            return (
              <mesh key={`amethyst-${i}`} position={[cx, 0, cz]} rotation={[0.4, rad, 0.2]} material={amethystCrystalMat}>
                <octahedronGeometry args={[0.045, 0]} />
              </mesh>
            );
          })}
        </group>
      )}

      {daisTier === 5 && (
        <group ref={floatingCrystalsRef} position={[0, 0.30, 0]}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.cos(rad) * 1.05;
            const cz = Math.sin(rad) * 1.05;
            return (
              <mesh key={`astral-gem-${i}`} position={[cx, 0, cz]} rotation={[0.5, rad, 0.3]} material={astralDiamondMat}>
                <octahedronGeometry args={[0.052, 0]} />
              </mesh>
            );
          })}
        </group>
      )}
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
        intensity={isHighBurnout ? 0.32 : isMeditating ? 0.8 : 0.7}
        color={isHighBurnout ? '#450a0a' : isMeditating ? '#fef3c7' : isModerateBurnout ? '#f1e8e0' : '#fff4e6'}
      />
      {/* Key: warm, front-right, high */}
      <directionalLight
        position={[2.8, 3.4, 3.6]}
        intensity={isHighBurnout ? 0.4 : 1.45}
        color={isHighBurnout ? '#991b1b' : '#fff1de'}
      />
      {/* Fill: soft warm-neutral, front-left, low */}
      <directionalLight
        position={[-3, 0.8, 3]}
        intensity={isHighBurnout ? 0.2 : 0.7}
        color={isHighBurnout ? '#7f1d1d' : '#ffe2cf'}
      />
      {/* Rim: cool edge light from behind */}
      <directionalLight
        position={[0, 3.2, -3.2]}
        intensity={isHighBurnout ? 1.0 : 1.0}
        color={isHighBurnout ? '#ef4444' : isMeditating ? '#fbbf24' : '#7dd3fc'}
      />
    </>
  );
}

// =========================================================================
// PROCEDURAL 3D PET COMPANION (Linh Thú Chibi Anime Chuẩn Mochi - Mắt Long Lanh & Bục Hoàng Kim)
// =========================================================================
function Procedural3DPetCompanion({ petType = 'none' }: { petType?: string }) {
  const dragonRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const dragonTailRef = useRef<THREE.Group>(null);

  const catRef = useRef<THREE.Group>(null);
  const catPawRef = useRef<THREE.Group>(null);
  const catTailRef = useRef<THREE.Mesh>(null);

  const pupRef = useRef<THREE.Group>(null);
  const pupTailRef = useRef<THREE.Mesh>(null);

  const foxRef = useRef<THREE.Group>(null);
  const foxTailsRef = useRef<THREE.Group>(null);

  // Common Pet Materials (Chất liệu Chibi mềm mại, tương phản cao, không bị lóa sáng)
  const petEyeWhite = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), []);
  const petEyeDark = useMemo(() => new THREE.MeshBasicMaterial({ color: '#09090b' }), []);
  const petEyeAmber = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9a3412' }), []);
  const petSparkle = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), []);
  const petBlushPink = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fb7185',
    roughness: 0.55,
    emissive: '#f43f5e',
    emissiveIntensity: 0.15
  }), []);

  // Contact Shadow under Pet
  const petContactShadow = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#020617',
    transparent: true,
    opacity: 0.42
  }), []);

  // Celestial Dragon Materials
  const dragonGreen = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#10b981',
    roughness: 0.32,
    metalness: 0.25,
    emissive: '#047857',
    emissiveIntensity: 0.28
  }), []);
  const dragonBelly = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fef08a',
    roughness: 0.35
  }), []);
  const dragonGold = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.18,
    metalness: 0.88,
    emissive: '#d97706',
    emissiveIntensity: 0.35
  }), []);
  const dragonWing = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6ee7b7',
    transparent: true,
    opacity: 0.85,
    roughness: 0.25,
    side: THREE.DoubleSide
  }), []);

  // Mochi Cat Materials (Trắng Tuyết Mịn Màng & Chuông Vàng)
  const catFur = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.38,
    emissive: '#f8fafc',
    emissiveIntensity: 0.18
  }), []);
  const catPink = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f472b6',
    roughness: 0.42
  }), []);
  const catGoldCoin = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.16,
    metalness: 0.92,
    emissive: '#b45309',
    emissiveIntensity: 0.35
  }), []);

  // Shiba Puppy Materials (Vàng Mật Ong Rực Rỡ & Yếm Trắng)
  const pupFur = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.35,
    emissive: '#b45309',
    emissiveIntensity: 0.2
  }), []);
  const pupBelly = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fffbeb',
    roughness: 0.42
  }), []);
  const pupCollar = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ef4444',
    roughness: 0.3,
    emissive: '#991b1b',
    emissiveIntensity: 0.25
  }), []);

  // Kitsune Fox Materials (Cam San Hô Tươi Sáng & Đuôi Thần Hỏa)
  const foxFur = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ea580c',
    roughness: 0.38,
    emissive: '#9a3412',
    emissiveIntensity: 0.22
  }), []);
  const foxWhite = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.45,
    emissive: '#f8fafc',
    emissiveIntensity: 0.12
  }), []);
  const foxSpiritCyan = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.85
  }), []);
  const foxRuneGold = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fde047',
    metalness: 0.85,
    roughness: 0.2,
    emissive: '#ca8a04',
    emissiveIntensity: 0.4
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. DRAGON: Smooth orbital flight around character's shoulder/chest level
    if (dragonRef.current && petType === 'dragon') {
      const flightSpeed = 1.35;
      const angle = t * flightSpeed;
      const radiusX = 0.82;
      const radiusZ = 0.54;

      const posX = Math.cos(angle) * radiusX;
      const posZ = Math.sin(angle) * radiusZ;
      const posY = 0.24 + Math.sin(t * 2.8) * 0.12;

      dragonRef.current.position.set(posX, posY, posZ);

      // Tangent heading
      const nextAngle = angle + 0.05;
      const nextX = Math.cos(nextAngle) * radiusX;
      const nextZ = Math.sin(nextAngle) * radiusZ;
      const heading = Math.atan2(nextX - posX, nextZ - posZ);

      dragonRef.current.rotation.y = heading;
      dragonRef.current.rotation.z = -Math.sin(angle) * 0.2;
      dragonRef.current.rotation.x = Math.cos(t * 2.8) * 0.1;

      // Wing flapping
      const flap = Math.sin(t * 12) * 0.38;
      if (leftWingRef.current) leftWingRef.current.rotation.z = 0.25 + flap;
      if (rightWingRef.current) rightWingRef.current.rotation.z = -0.25 - flap;

      // Tail sway
      if (dragonTailRef.current) {
        dragonTailRef.current.rotation.y = Math.sin(t * 6) * 0.32;
      }
    }

    // 2. CAT: Gentle breathing, beckoning paw & swaying tail
    if (catRef.current && petType === 'cat') {
      catRef.current.position.y = -0.92 + Math.sin(t * 3.0) * 0.008;
      if (catPawRef.current) {
        catPawRef.current.rotation.x = -0.3 + Math.sin(t * 4.8) * 0.32;
      }
      if (catTailRef.current) {
        catTailRef.current.rotation.z = Math.sin(t * 2.6) * 0.25;
      }
    }

    // 3. PUPPY: Excited tail wagging and breathing bob
    if (pupRef.current && petType === 'puppy') {
      pupRef.current.position.y = -0.92 + Math.sin(t * 3.5) * 0.008;
      if (pupTailRef.current) {
        pupTailRef.current.rotation.y = Math.sin(t * 15) * 0.55;
      }
    }

    // 4. FOX: Mystical swaying tails and breathing bob
    if (foxRef.current && petType === 'fox') {
      foxRef.current.position.y = -0.92 + Math.sin(t * 2.8) * 0.008;
      if (foxTailsRef.current) {
        foxTailsRef.current.rotation.y = Math.sin(t * 2.4) * 0.28;
      }
    }
  });

  if (!petType || petType === 'none') return null;

  return (
    <group>
      {/* 1. CELESTIAL BABY DRAGON (Ấu Long Luân Hồi - Bay lượn quanh vai nhân vật) */}
      {petType === 'dragon' && (
        <group ref={dragonRef} scale={[1.35, 1.35, 1.35]}>
          {/* Dragon Head */}
          <group position={[0, 0, 0.11]}>
            <mesh material={dragonGreen}>
              <sphereGeometry args={[0.075, 18, 18]} />
            </mesh>
            {/* Chubby Snout */}
            <mesh position={[0, -0.015, 0.058]} material={dragonGreen}>
              <sphereGeometry args={[0.048, 14, 14]} />
            </mesh>
            <mesh position={[0, -0.026, 0.06]} material={dragonBelly}>
              <sphereGeometry args={[0.038, 12, 12]} />
            </mesh>

            {/* Golden Antler Horns */}
            <mesh position={[-0.04, 0.07, -0.02]} rotation={[-0.25, 0, -0.28]} material={dragonGold}>
              <coneGeometry args={[0.016, 0.085, 8]} />
            </mesh>
            <mesh position={[0.04, 0.07, -0.02]} rotation={[-0.25, 0, 0.28]} material={dragonGold}>
              <coneGeometry args={[0.016, 0.085, 8]} />
            </mesh>

            {/* Big Expressive Anime Eyes (Left & Right) */}
            {/* Left Eye */}
            <mesh position={[-0.036, 0.022, 0.052]} material={petEyeWhite}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
            <mesh position={[-0.038, 0.022, 0.066]} material={dragonGold}>
              <sphereGeometry args={[0.014, 10, 10]} />
            </mesh>
            <mesh position={[-0.039, 0.022, 0.074]} material={petEyeDark}>
              <sphereGeometry args={[0.009, 8, 8]} />
            </mesh>
            <mesh position={[-0.035, 0.027, 0.079]} material={petSparkle}>
              <sphereGeometry args={[0.004, 6, 6]} />
            </mesh>
            <mesh position={[-0.041, 0.017, 0.077]} material={petSparkle}>
              <sphereGeometry args={[0.002, 6, 6]} />
            </mesh>

            {/* Right Eye */}
            <mesh position={[0.036, 0.022, 0.052]} material={petEyeWhite}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
            <mesh position={[0.038, 0.022, 0.066]} material={dragonGold}>
              <sphereGeometry args={[0.014, 10, 10]} />
            </mesh>
            <mesh position={[0.039, 0.022, 0.074]} material={petEyeDark}>
              <sphereGeometry args={[0.009, 8, 8]} />
            </mesh>
            <mesh position={[0.041, 0.027, 0.079]} material={petSparkle}>
              <sphereGeometry args={[0.004, 6, 6]} />
            </mesh>
            <mesh position={[0.035, 0.017, 0.077]} material={petSparkle}>
              <sphereGeometry args={[0.002, 6, 6]} />
            </mesh>

            {/* Rosy Cheeks */}
            <mesh position={[-0.052, -0.01, 0.045]} material={petBlushPink}>
              <sphereGeometry args={[0.014, 8, 8]} />
            </mesh>
            <mesh position={[0.052, -0.01, 0.045]} material={petBlushPink}>
              <sphereGeometry args={[0.014, 8, 8]} />
            </mesh>
          </group>

          {/* Dragon Chubby Body */}
          <mesh position={[0, -0.01, 0]} material={dragonGreen}>
            <sphereGeometry args={[0.075, 16, 16]} />
          </mesh>
          <mesh position={[0, -0.025, 0.03]} material={dragonBelly}>
            <sphereGeometry args={[0.052, 14, 14]} />
          </mesh>

          {/* Mint Dragon Wings */}
          <mesh ref={leftWingRef} position={[-0.065, 0.03, 0]} rotation={[0.2, 0.3, 0.25]} material={dragonWing}>
            <planeGeometry args={[0.16, 0.1]} />
          </mesh>
          <mesh ref={rightWingRef} position={[0.065, 0.03, 0]} rotation={[0.2, -0.3, -0.25]} material={dragonWing}>
            <planeGeometry args={[0.16, 0.1]} />
          </mesh>

          {/* Serpentine Tail */}
          <group ref={dragonTailRef} position={[0, 0.01, -0.07]}>
            <mesh position={[0, 0.015, -0.05]} rotation={[-0.35, 0, 0]} material={dragonGreen}>
              <cylinderGeometry args={[0.035, 0.018, 0.11, 10]} />
            </mesh>
            <mesh position={[0, 0.04, -0.11]} material={dragonGold}>
              <coneGeometry args={[0.024, 0.06, 8]} />
            </mesh>
          </group>

          {/* Golden Spirit Pearl floating in front */}
          <mesh position={[0, 0.02, 0.22]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* 2. MOCHI FORTUNE CAT (Mèo Thần Tài - Trắng Mochi Tròn Trĩnh, Ôm Tiền Vàng, Vẫy Tay May Mắn) */}
      {petType === 'cat' && (
        <group ref={catRef} position={[0.36, -0.92, 0.24]} rotation={[0, -0.32, 0]} scale={[1.32, 1.32, 1.32]}>
          {/* Ground Contact Shadow & Luminous Spirit Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={petContactShadow}>
            <ringGeometry args={[0, 0.13, 24]} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <ringGeometry args={[0.06, 0.15, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Round Mochi Body */}
          <mesh position={[0, 0.078, 0]} material={catFur}>
            <sphereGeometry args={[0.082, 18, 18]} />
          </mesh>

          {/* Round Mochi Head */}
          <mesh position={[0, 0.19, 0.018]} material={catFur}>
            <sphereGeometry args={[0.08, 18, 18]} />
          </mesh>

          {/* Triangular Cat Ears with Pink Inner */}
          <group position={[-0.046, 0.265, 0.018]} rotation={[0, 0, -0.22]}>
            <mesh material={catFur}>
              <coneGeometry args={[0.028, 0.06, 6]} />
            </mesh>
            <mesh position={[0, 0, 0.01]} material={catPink}>
              <coneGeometry args={[0.016, 0.042, 6]} />
            </mesh>
          </group>
          <group position={[0.046, 0.265, 0.018]} rotation={[0, 0, 0.22]}>
            <mesh material={catFur}>
              <coneGeometry args={[0.028, 0.06, 6]} />
            </mesh>
            <mesh position={[0, 0, 0.01]} material={catPink}>
              <coneGeometry args={[0.016, 0.042, 6]} />
            </mesh>
          </group>

          {/* Rosy Peach Cheeks */}
          <mesh position={[-0.052, 0.175, 0.066]} material={petBlushPink}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>
          <mesh position={[0.052, 0.175, 0.066]} material={petBlushPink}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>

          {/* Tiny Pink Cat Nose */}
          <mesh position={[0, 0.18, 0.094]} material={catPink}>
            <sphereGeometry args={[0.007, 8, 8]} />
          </mesh>

          {/* TWO Large Sparkling Anime Eyes */}
          {/* Left Eye */}
          <mesh position={[-0.034, 0.205, 0.082]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[-0.034, 0.205, 0.091]} material={petEyeDark}>
            <sphereGeometry args={[0.012, 10, 10]} />
          </mesh>
          <mesh position={[-0.030, 0.211, 0.098]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[-0.037, 0.199, 0.096]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.034, 0.205, 0.082]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[0.034, 0.205, 0.091]} material={petEyeDark}>
            <sphereGeometry args={[0.012, 10, 10]} />
          </mesh>
          <mesh position={[0.038, 0.211, 0.098]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[0.031, 0.199, 0.096]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Red Ribbon Collar with Shiny Golden Bell */}
          <mesh position={[0, 0.138, 0.012]} rotation={[0.2, 0, 0]} material={pupCollar}>
            <torusGeometry args={[0.07, 0.012, 8, 20]} />
          </mesh>
          <mesh position={[0, 0.118, 0.082]} material={catGoldCoin}>
            <sphereGeometry args={[0.016, 10, 10]} />
          </mesh>

          {/* Gold Koban Coin held in Left Arm */}
          <mesh position={[-0.045, 0.075, 0.078]} rotation={[0.35, 0.2, 0]} material={catGoldCoin}>
            <cylinderGeometry args={[0.046, 0.046, 0.012, 16]} />
          </mesh>

          {/* Cute Beckoning Right Paw (Vẫy tay may mắn) */}
          <group ref={catPawRef} position={[0.058, 0.12, 0.058]}>
            <mesh material={catFur}>
              <sphereGeometry args={[0.028, 10, 10]} />
            </mesh>
            <mesh position={[0, 0.018, 0.01]} material={catPink}>
              <sphereGeometry args={[0.014, 8, 8]} />
            </mesh>
          </group>

          {/* Cute White Left Paw sitting */}
          <mesh position={[-0.035, 0.02, 0.06]} material={catFur}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>

          {/* Soft Curved White Tail */}
          <mesh ref={catTailRef} position={[0, 0.05, -0.07]} rotation={[-0.55, 0, 0]} material={catFur}>
            <cylinderGeometry args={[0.014, 0.018, 0.14, 8]} />
          </mesh>
        </group>
      )}

      {/* 3. LUCKY SHIBA PUPPY (Cún Cỏ Trung Nghĩa - Lông Vàng Mật Ong, Mắt Cún Tròn Xoe, Yếm Trắng) */}
      {petType === 'puppy' && (
        <group ref={pupRef} position={[0.36, -0.92, 0.24]} rotation={[0, -0.32, 0]} scale={[1.32, 1.32, 1.32]}>
          {/* Ground Contact Shadow & Luminous Spirit Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={petContactShadow}>
            <ringGeometry args={[0, 0.13, 24]} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <ringGeometry args={[0.06, 0.15, 24]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Round Honey Body */}
          <mesh position={[0, 0.08, 0]} material={pupFur}>
            <sphereGeometry args={[0.084, 18, 18]} />
          </mesh>
          {/* Soft Ivory Chest Bib */}
          <mesh position={[0, 0.076, 0.045]} material={pupBelly}>
            <sphereGeometry args={[0.052, 14, 14]} />
          </mesh>

          {/* Round Mochi Head */}
          <mesh position={[0, 0.19, 0.02]} material={pupFur}>
            <sphereGeometry args={[0.082, 18, 18]} />
          </mesh>

          {/* Cute Floppy Ears */}
          <mesh position={[-0.068, 0.21, 0.015]} rotation={[0.1, 0, 0.42]} material={pupFur}>
            <boxGeometry args={[0.03, 0.075, 0.022]} />
          </mesh>
          <mesh position={[0.068, 0.21, 0.015]} rotation={[0.1, 0, -0.42]} material={pupFur}>
            <boxGeometry args={[0.03, 0.075, 0.022]} />
          </mesh>

          {/* Rosy Peach Cheeks */}
          <mesh position={[-0.052, 0.172, 0.068]} material={petBlushPink}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>
          <mesh position={[0.052, 0.172, 0.068]} material={petBlushPink}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>

          {/* Cute Ivory Snout Muzzle */}
          <mesh position={[0, 0.175, 0.085]} material={pupBelly}>
            <sphereGeometry args={[0.034, 12, 12]} />
          </mesh>
          {/* Shiny Black Button Nose */}
          <mesh position={[0, 0.188, 0.114]} material={petEyeDark}>
            <sphereGeometry args={[0.011, 8, 8]} />
          </mesh>

          {/* TWO Large Sparkling Puppy Eyes */}
          {/* Left Eye */}
          <mesh position={[-0.035, 0.21, 0.084]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[-0.035, 0.21, 0.093]} material={petEyeDark}>
            <sphereGeometry args={[0.012, 10, 10]} />
          </mesh>
          <mesh position={[-0.031, 0.216, 0.10]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[-0.038, 0.204, 0.098]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.035, 0.21, 0.084]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[0.035, 0.21, 0.093]} material={petEyeDark}>
            <sphereGeometry args={[0.012, 10, 10]} />
          </mesh>
          <mesh position={[0.039, 0.216, 0.10]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[0.032, 0.204, 0.098]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Ruby Collar with Glossy Gold Bell */}
          <mesh position={[0, 0.138, 0.012]} rotation={[0.2, 0, 0]} material={pupCollar}>
            <torusGeometry args={[0.07, 0.012, 8, 20]} />
          </mesh>
          <mesh position={[0, 0.115, 0.082]} material={catGoldCoin}>
            <sphereGeometry args={[0.016, 10, 10]} />
          </mesh>

          {/* Cute White Front Paws */}
          <mesh position={[-0.032, 0.02, 0.058]} material={pupBelly}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>
          <mesh position={[0.032, 0.02, 0.058]} material={pupBelly}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>

          {/* Excited Wagging Curly Tail */}
          <mesh ref={pupTailRef} position={[0, 0.07, -0.07]} rotation={[-0.6, 0, 0]} material={pupFur}>
            <cylinderGeometry args={[0.014, 0.018, 0.13, 8]} />
          </mesh>
        </group>
      )}

      {/* 4. KITSUNE FOX (Hồ Ly Phúc Tinh - Chibi Mochi Tròn Trĩnh, 2 Mắt Hổ Phách Long Lanh, 3 Đuôi Bồng Bềnh) */}
      {petType === 'fox' && (
        <group ref={foxRef} position={[0.36, -0.92, 0.24]} rotation={[0, -0.32, 0]} scale={[1.32, 1.32, 1.32]}>
          {/* Ground Contact Shadow & Luminous Spirit Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={petContactShadow}>
            <ringGeometry args={[0, 0.13, 24]} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
            <ringGeometry args={[0.06, 0.15, 24]} />
            <meshBasicMaterial color="#fb923c" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>

          {/* Round Mochi Fox Body */}
          <mesh position={[0, 0.08, 0]} material={foxFur}>
            <sphereGeometry args={[0.084, 18, 18]} />
          </mesh>

          {/* Soft White Heart Chest Bib */}
          <mesh position={[0, 0.075, 0.046]} material={foxWhite}>
            <sphereGeometry args={[0.052, 14, 14]} />
          </mesh>

          {/* Round Mochi Head */}
          <mesh position={[0, 0.19, 0.02]} material={foxFur}>
            <sphereGeometry args={[0.08, 18, 18]} />
          </mesh>

          {/* White Cheek Tufts (Má lông trắng bồng bềnh 2 bên má hồ ly) */}
          <mesh position={[-0.056, 0.165, 0.042]} rotation={[0, 0, -0.2]} material={foxWhite}>
            <sphereGeometry args={[0.032, 10, 10]} />
          </mesh>
          <mesh position={[0.056, 0.165, 0.042]} rotation={[0, 0, 0.2]} material={foxWhite}>
            <sphereGeometry args={[0.032, 10, 10]} />
          </mesh>

          {/* Cute White Snout Muzzle */}
          <mesh position={[0, 0.174, 0.084]} material={foxWhite}>
            <sphereGeometry args={[0.028, 12, 12]} />
          </mesh>
          {/* Tiny Dark Nose Button */}
          <mesh position={[0, 0.182, 0.108]} material={petEyeDark}>
            <sphereGeometry args={[0.007, 8, 8]} />
          </mesh>

          {/* Rosy Peach Cheeks */}
          <mesh position={[-0.054, 0.17, 0.068]} material={petBlushPink}>
            <sphereGeometry args={[0.016, 10, 10]} />
          </mesh>
          <mesh position={[0.054, 0.17, 0.068]} material={petBlushPink}>
            <sphereGeometry args={[0.016, 10, 10]} />
          </mesh>

          {/* TWO Large Sparkling Anime Fox Eyes (Hai mắt to tròn long lanh, không bị một mắt) */}
          {/* Left Eye */}
          <mesh position={[-0.035, 0.208, 0.084]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[-0.035, 0.208, 0.092]} material={petEyeAmber}>
            <sphereGeometry args={[0.013, 10, 10]} />
          </mesh>
          <mesh position={[-0.035, 0.208, 0.097]} material={petEyeDark}>
            <sphereGeometry args={[0.008, 8, 8]} />
          </mesh>
          <mesh position={[-0.031, 0.214, 0.102]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[-0.038, 0.202, 0.10]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.035, 0.208, 0.084]} material={petEyeWhite}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[0.035, 0.208, 0.092]} material={petEyeAmber}>
            <sphereGeometry args={[0.013, 10, 10]} />
          </mesh>
          <mesh position={[0.035, 0.208, 0.097]} material={petEyeDark}>
            <sphereGeometry args={[0.008, 8, 8]} />
          </mesh>
          <mesh position={[0.039, 0.214, 0.102]} material={petSparkle}>
            <sphereGeometry args={[0.004, 6, 6]} />
          </mesh>
          <mesh position={[0.032, 0.202, 0.10]} material={petSparkle}>
            <sphereGeometry args={[0.002, 6, 6]} />
          </mesh>

          {/* Pointy Fox Ears with Soft White Inner Fluff */}
          <group position={[-0.046, 0.275, 0.02]} rotation={[0, 0, -0.22]}>
            <mesh material={foxFur}>
              <coneGeometry args={[0.03, 0.075, 6]} />
            </mesh>
            <mesh position={[0, -0.005, 0.012]} material={foxWhite}>
              <coneGeometry args={[0.018, 0.052, 6]} />
            </mesh>
          </group>
          <group position={[0.046, 0.275, 0.02]} rotation={[0, 0, 0.22]}>
            <mesh material={foxFur}>
              <coneGeometry args={[0.03, 0.075, 6]} />
            </mesh>
            <mesh position={[0, -0.005, 0.012]} material={foxWhite}>
              <coneGeometry args={[0.018, 0.052, 6]} />
            </mesh>
          </group>

          {/* Golden Celestial Forehead Crest */}
          <mesh position={[0, 0.252, 0.088]} material={foxRuneGold}>
            <octahedronGeometry args={[0.014, 0]} />
          </mesh>

          {/* Cute White Front Paws resting on dais */}
          <mesh position={[-0.032, 0.02, 0.058]} material={foxWhite}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>
          <mesh position={[0.032, 0.02, 0.058]} material={foxWhite}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>

          {/* 3 Fluffy Nine-Tails Fans with Spirit Flame Tips (3 đuôi mềm mại bồng bềnh khẽ đung đưa) */}
          <group ref={foxTailsRef} position={[0, 0.065, -0.05]}>
            {[-0.26, 0, 0.26].map((angle, idx) => (
              <group key={`tail-${idx}`} rotation={[-0.35, angle, angle * 0.4]}>
                {/* Tail Base Sphere */}
                <mesh position={[0, 0.04, -0.04]} material={foxFur}>
                  <sphereGeometry args={[0.034, 10, 10]} />
                </mesh>
                {/* Tail Mid Arc */}
                <mesh position={[0, 0.09, -0.06]} material={foxFur}>
                  <sphereGeometry args={[0.038, 10, 10]} />
                </mesh>
                {/* Tail Tip (Linh Hỏa Cyan) */}
                <mesh position={[0, 0.15, -0.07]} material={foxSpiritCyan}>
                  <coneGeometry args={[0.032, 0.07, 8]} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      )}
    </group>
  );
}

// Khung hẹp (mobile) cần lùi camera để bục không bị cắt hai bên: khoảng cách tỉ lệ nghịch với tỉ lệ khung.
function AdaptiveCamera({ baseZ = 5.4, baseY = 0.42, refAspect = 0.74 }: { baseZ?: number; baseY?: number; refAspect?: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const factor = Math.min(1.35, Math.max(1, refAspect / Math.max(0.3, aspect)));
    camera.position.set(0, baseY, baseZ * factor);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, baseZ, baseY, refAspect]);
  return null;
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
  netWorth = 0,
  equippedPet = 'none',
  level = 1
}: Dynamic3DAvatarProps) {
  const isDead = vitality <= 0;
  const isMeditating = reaction === 'meditating';

  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
      <Canvas
        camera={{ position: [0, 0.42, 5.4], fov: 36 }}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-visible"
        gl={{ antialias: true, alpha: true }}
      >
        <AdaptiveCamera />
        <MoodLighting burnout={burnout} isMeditating={isMeditating} />

        {/* Bục Ma Pháp Thăng Hoa Theo Level (Level Dais Progression - Tiếp Đất Vững Vàng) */}
        <GoldenMagicDais level={level} isMeditating={isMeditating} />

        {/* Nhân vật 3D đứng vững trên bục - Tuyệt đối không bay lơ lửng */}
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

        {/* Linh Thú 3D Đồng Hành (Bé Rồng bay lượn / Mèo Thần Tài / Cún Cỏ / Hồ Ly) */}
        <Procedural3DPetCompanion petType={equippedPet} />

        {showControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={1.8}
            maxDistance={6.4}
            target={[0, 0.42, 0]}
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
