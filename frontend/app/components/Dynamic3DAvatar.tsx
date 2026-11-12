'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AvatarHair from './AvatarHair';
import GoldenMagicDais from './AvatarDais';
import Procedural3DPetCompanion from './AvatarPet3D';
import { getAgeGroup, getAgeProfile, getClothColor, pickHairStyle, isBalding } from './avatarProfile';

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
  const ageProfile = getAgeProfile(numericAge);
  const headScale = isBaby ? 1.04 : ageProfile.headScale;
  const spineHunch = 0; // thân đã nghiêng theo getAgeProfile.hunch; không cộng thêm vào đầu
  const ageGroup = getAgeGroup(numericAge);
  const hairStyle = pickHairStyle(gender, nationality, numericAge);
  const balding = isBalding(gender, nationality, numericAge);
  // Feet stay at y = -0.97 (dais); head sits on top of the scaled neck.
  const FEET_Y = -0.97;
  const headY = isBaby ? -0.06 : FEET_Y + ageProfile.bodyScale * 1.46 * Math.cos(ageProfile.hunch) + 0.13 * ageProfile.headScale;
  const headZ = isBaby ? 0 : ageProfile.bodyScale * 1.46 * Math.sin(ageProfile.hunch);

  // Trait Visual Logic
  const traitList = useMemo(() => Array.isArray(traits) ? traits : [], [traits]);

  const hasGlasses = useMemo(() => {
    if (numericAge < 4) return false;
    return traitList.some(t =>
      ['glasses', 'cận_thị_bẩm_sinh', 'code_whisperer', 'nerd', 'mọt_sách', 'thần_đồng_toán_học'].includes(t)
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
    side: THREE.DoubleSide,
  }), [hairColor]);

  const hairShineMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor).lerp(new THREE.Color('#ffffff'), 0.3),
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  }), [hairColor]);

  const collarMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: ageGroup === 'child' ? '#fefce8' : '#e2e8f0',
    roughness: 0.7,
  }), [ageGroup]);

  const tieMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#9f1239', roughness: 0.4, metalness: 0.2,
  }), []);

  const pearlMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fdf2f8', roughness: 0.2, metalness: 0.3,
  }), []);

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
    let clothColor = getClothColor({ group: ageGroup, female: isFemale, wealthy: isWealthy, burnout, nationality, garland: hasGarland });
    if (isBaby) clothColor = isFemale ? '#fbcfe8' : '#bae6fd';

    return new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: isWealthy ? 0.35 : 0.65,
      metalness: isWealthy ? 0.25 : 0.1,
    });
  }, [isBaby, burnout, isFemale, isWealthy, hasGarland, nationality, ageGroup]);

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
        <group position={[0, FEET_Y, 0]} rotation={[ageProfile.hunch, 0, 0]} scale={[ageProfile.bodyScale * ageProfile.bodyWidth, ageProfile.bodyScale, ageProfile.bodyScale * ageProfile.bodyWidth]}>
        <group position={[0, -FEET_Y, 0]}>
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
          <mesh position={[0, -0.15, isFemale ? 0.27 : 0.30]} material={isWealthy ? goldMaterial : glassesFrameMaterial}>
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
          <mesh position={[0, 0.27, 0.04]} rotation={[1.15, 0, 0]} material={isWealthy ? goldMaterial : collarMaterial}>
            <torusGeometry args={[0.16, ageGroup === 'child' ? 0.03 : 0.015, 12, 32]} />
          </mesh>
          {isWealthy && (
            <mesh position={[0, 0.18, 0.21]} material={goldMaterial}>
              <octahedronGeometry args={[0.038, 0]} />
            </mesh>
          )}
          {ageGroup === 'teen' && (
            <mesh position={[0, 0.3, -0.02]} rotation={[1.35, 0, 0]} material={clothMaterial}>
              <torusGeometry args={[0.2, 0.065, 12, 28]} />
            </mesh>
          )}
          {(ageGroup === 'child' || ageGroup === 'elder') && [0.12, 0.04].map((by, bi) => (
            <mesh key={`btn-${bi}`} position={[0, by, 0.33]} material={collarMaterial}>
              <sphereGeometry args={[0.022, 10, 10]} />
            </mesh>
          ))}

          {/* Shoulders & Golden Pauldrons (Cầu vai hoàng kim anime) */}
          <mesh position={[isFemale ? -0.34 : -0.38, 0.26, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.13 : 0.15, 16, 16]} />
          </mesh>
          {isWealthy && (
            <mesh position={[isFemale ? -0.37 : -0.41, 0.32, 0]} rotation={[0, 0, 0.22]} material={goldMaterial}>
              <boxGeometry args={[0.13, 0.035, 0.16]} />
            </mesh>
          )}

          <mesh position={[isFemale ? 0.34 : 0.38, 0.26, 0]} material={clothMaterial}>
            <sphereGeometry args={[isFemale ? 0.13 : 0.15, 16, 16]} />
          </mesh>
          {isWealthy && (
            <mesh position={[isFemale ? 0.37 : 0.41, 0.32, 0]} rotation={[0, 0, -0.22]} material={goldMaterial}>
              <boxGeometry args={[0.13, 0.035, 0.16]} />
            </mesh>
          )}

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
            {/* Wrist Bracer (gold only when wealthy) */}
            <mesh position={[0, -0.42, 0.05]} material={isWealthy ? goldMaterial : collarMaterial}>
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
            {/* Wrist Bracer (gold only when wealthy) */}
            <mesh position={[0, -0.42, 0.05]} material={isWealthy ? goldMaterial : collarMaterial}>
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
                <mesh position={[0, 0.28, 0.08]} rotation={[1.1, 0, 0]} material={pearlMaterial}>
                  <torusGeometry args={[0.16, 0.022, 10, 32]} />
                </mesh>
              ) : (
                <>
                  <mesh position={[0, 0.07, 0.275]} material={tieMaterial}>
                    <boxGeometry args={[0.07, 0.3, 0.012]} />
                  </mesh>
                  <mesh position={[0, 0.2, 0.275]} material={tieMaterial}>
                    <sphereGeometry args={[0.04, 10, 10]} />
                  </mesh>
                  <mesh position={[0, 0.02, 0.285]} material={goldMaterial}>
                    <boxGeometry args={[0.05, 0.012, 0.01]} />
                  </mesh>
                </>
              )}
            </group>
          )}
        </group>
        </group>
      )}

      {/* Head Group (Rotatable & Cursor Tracking) */}
      <group ref={headRef} position={[0, headY, headZ]} scale={[headScale, headScale, headScale]}>
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
          ) : (
            <group ref={hairGroupRef} position={[0, -0.15, 0]}>
              <AvatarHair style={hairStyle} balding={balding} bun={numericAge >= 55} hair={hairMaterial} shine={hairShineMaterial} />
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
