'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

export type AvatarReactionType = 'idle' | 'celebrate' | 'exhausted' | 'meditating' | 'shocked' | 'negotiating';

interface Dynamic3DAvatarProps {
  nationality?: string;
  gender?: 'male' | 'female' | string;
  age?: number;
  burnout?: number;
  vitality?: number;
  reaction?: AvatarReactionType;
  isFastForwarding?: boolean;
  className?: string;
  showControls?: boolean;
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
  isFastForwarding = false
}: {
  nationality: string;
  gender?: 'male' | 'female' | string;
  age: number;
  burnout: number;
  vitality: number;
  reaction: AvatarReactionType;
  isFastForwarding: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
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
  const isTeen = age >= 12 && age < 18;
  const isElderly = age >= 65;

  const headScale = isBaby ? 1.25 : isChild ? 1.12 : isTeen ? 1.05 : 1.0;
  const spineHunch = isElderly ? 0.18 : 0;

  // Materials with physical reactivity to stats (Vitality, Burnout, Age)
  const skinMaterial = useMemo(() => {
    let effectiveSkin = skinColor;
    if (vitality < 30) {
      // Sắc diện nhợt nhạt, tái mét khi sinh lực nguy kịch
      effectiveSkin = '#cbd5e1';
    }
    return new THREE.MeshStandardMaterial({
      color: effectiveSkin,
      roughness: 0.65,
      metalness: 0.05,
    });
  }, [skinColor, vitality]);

  const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.8,
    metalness: 0.1,
  }), [hairColor]);

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.2,
    metalness: 0.8
  }), []);

  const lipMaterial = useMemo(() => {
    let lipColor = '#e29578';
    if (isBaby || isChild) {
      lipColor = '#fca5a5'; // Soft natural kid lips, no adult lipstick
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

  const earringMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    roughness: 0.2,
    metalness: 0.8
  }), []);

  const ribbonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isBaby ? '#fef08a' : '#f43f5e',
    roughness: 0.4
  }), [isBaby]);

  const clothMaterial = useMemo(() => {
    let clothColor = isFemale ? '#be185d' : '#4f46e5';
    if (isBaby) {
      clothColor = isFemale ? '#fbcfe8' : '#bae6fd'; // Vải cotton pastel sơ sinh
    } else if (age <= 5) {
      clothColor = isFemale ? '#fce7f3' : '#e0f2fe';
    } else if (burnout > 75) {
      clothColor = '#334155';
    }
    return new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: 0.8,
    });
  }, [isBaby, age, burnout, isFemale]);

  // Real-time Procedural Animation Loop
  useFrame((state, delta) => {
    if (isFastForwarding) return; // Freeze to conserve frames

    const t = state.clock.getElapsedTime();

    if (headRef.current && groupRef.current) {
      // 1. Natural Breathing Cycle (Laboring/slow breathing if vitality < 30)
      const breatheSpeed = vitality < 30 ? 1.0 : 2.2;
      const breatheAmp = vitality < 30 ? 0.012 : 0.02;
      const breathe = Math.sin(t * breatheSpeed) * breatheAmp;
      
      // Khắc phục lỗi vị trí Y: Giữ vững Base Y (-0.76) để toàn bộ khuôn mặt & mái tóc luôn nằm trọn trong khung
      const BASE_Y = -0.76;
      let targetPosY = BASE_Y + breathe;

      // 2. Action Reaction Dynamics
      let targetRotX = spineHunch + (burnout > 75 ? 0.12 : 0);
      let targetRotY = 0;
      let targetRotZ = 0;

      if (reaction === 'celebrate') {
        // Joyful nod and side-to-side bobbing
        targetRotX = Math.sin(t * 8) * 0.15;
        targetRotY = Math.sin(t * 4) * 0.2;
        targetPosY += Math.abs(Math.sin(t * 6)) * 0.08;
      } else if (reaction === 'exhausted') {
        // Head drooping low in fatigue
        targetRotX = 0.35 + Math.sin(t * 1.2) * 0.04;
        targetRotZ = Math.sin(t * 0.8) * 0.05;
      } else if (reaction === 'meditating') {
        // Peaceful slight head lift and floating
        targetRotX = -0.12;
        targetPosY += Math.sin(t * 1.5) * 0.06;
      } else if (reaction === 'shocked') {
        // Sudden jerk backward and jitter
        targetRotX = -0.22;
        targetRotY = Math.sin(t * 14) * 0.08;
      } else if (reaction === 'negotiating') {
        // Thoughtful inquisitive tilt
        targetRotZ = 0.12 + Math.sin(t * 2.5) * 0.05;
        targetRotY = Math.sin(t * 1.8) * 0.15;
      } else {
        // Idle gentle sway
        targetRotY = Math.sin(t * 0.8) * 0.06;
        targetRotX = spineHunch + Math.sin(t * 1.4) * 0.03;
      }

      groupRef.current.position.y = targetPosY;

      // Smooth interpolation (lerp)
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotX, delta * 6);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotY, delta * 6);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetRotZ, delta * 6);

      // 3. Periodic Eye Blink (every ~3.5 seconds)
      const blinkCycle = Math.sin(t * 1.8);
      const isBlinking = blinkCycle > 0.96;
      const eyeScaleY = (isBlinking || reaction === 'meditating') ? 0.1 : 1;

      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = eyeScaleY;
        rightEyeRef.current.scale.y = eyeScaleY;
      }

      // 4. Mouth Reaction Morph
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
          {/* Eye shine reflection */}
          <mesh position={[0.022, 0.022, 0.055]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.17, isBaby ? 0.08 : 0.1, 0.42]} material={eyeMaterial}>
          <sphereGeometry args={[isBaby ? 0.068 : (isFemale ? 0.065 : 0.06), 16, 16]} />
          {/* Eye shine reflection */}
          <mesh position={[0.022, 0.022, 0.055]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </mesh>

        {/* Female Eyelash Accents (Only for adults & teens, never on babies!) */}
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

        {/* Eyebrows (Hidden on babies for pure gentle infant look) */}
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

        {/* 3D Dynamic State: Quầng thâm mắt do kiệt sức (Burnout > 75 & Người lớn) */}
        {burnout > 75 && age >= 16 && (
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
        {(age <= 5 || (isFemale && age < 25)) && (
          <group position={[0, -0.08, 0.4]}>
            <mesh position={[-0.22, 0, 0]}>
              <sphereGeometry args={[isBaby ? 0.09 : (age <= 5 ? 0.075 : 0.05), 16, 8]} />
              <meshBasicMaterial color="#fb7185" opacity={age <= 5 ? 0.5 : 0.3} transparent />
            </mesh>
            <mesh position={[0.22, 0, 0]}>
              <sphereGeometry args={[age <= 5 ? 0.075 : 0.05, 16, 8]} />
              <meshBasicMaterial color="#fb7185" opacity={age <= 5 ? 0.5 : 0.3} transparent />
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
              {/* Bonnet Cap */}
              <mesh material={clothMaterial}>
                <sphereGeometry args={[0.47, 24, 24]} />
              </mesh>
              {/* Folded Brim */}
              <mesh position={[0, 0.1, 0.28]} rotation={[0.3, 0, 0]} material={clothMaterial}>
                <torusGeometry args={[0.38, 0.045, 12, 24]} />
              </mesh>
              {/* Fluffy Pom-Pom on Top */}
              <mesh position={[0, 0.54, 0]} material={ribbonMaterial}>
                <sphereGeometry args={[0.085, 16, 16]} />
              </mesh>
            </group>
          ) : isFemale ? (
            /* FEMALE PROCEDURAL HAIRSTYLE */
            <group>
              {/* Main Crown Volume */}
              <mesh position={[0, 0.24, -0.04]} material={hairMaterial}>
                <sphereGeometry args={[0.49, 24, 24]} />
              </mesh>
              {/* Soft Front Bangs */}
              <mesh position={[0, 0.37, 0.33]} rotation={[0.26, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.44, 0.13, 0.16]} />
              </mesh>
              {/* Left Flowing Lock */}
              <mesh position={[-0.38, -0.26, 0.08]} rotation={[0.08, 0, -0.08]} material={hairMaterial}>
                <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
              </mesh>
              {/* Right Flowing Lock */}
              <mesh position={[0.38, -0.26, 0.08]} rotation={[0.08, 0, 0.08]} material={hairMaterial}>
                <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
              </mesh>
              {/* Back Hair Drape */}
              <mesh position={[0, -0.22, -0.26]} rotation={[-0.08, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.46, 0.52, 0.15]} />
              </mesh>

              {/* Cute Child Hair Ribbons */}
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

              {/* Elder Hair Bun */}
              {isElderly && (
                <group>
                  <mesh position={[0, 0.54, -0.12]} material={hairMaterial}>
                    <sphereGeometry args={[0.18, 20, 20]} />
                  </mesh>
                  <mesh position={[0, 0.54, -0.12]} rotation={[0, 0, 0.4]} material={earringMaterial}>
                    <cylinderGeometry args={[0.015, 0.015, 0.45, 12]} />
                  </mesh>
                </group>
              )}
            </group>
          ) : (
            /* MALE PROCEDURAL HAIRSTYLE */
            <group>
              {/* Main Hair Volume */}
              <mesh position={[0, 0.24, -0.05]} material={hairMaterial}>
                <sphereGeometry args={[0.48, 24, 24]} />
              </mesh>
              {/* Front Crop */}
              <mesh position={[0, 0.38, 0.32]} rotation={[0.3, 0, 0]} material={hairMaterial}>
                <boxGeometry args={[0.44, 0.12, 0.15]} />
              </mesh>
              {/* Sideburns */}
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

        {isFemale && age >= 12 && (
          <group>
            <mesh position={[-0.48, -0.07, 0]} material={earringMaterial}>
              <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
            <mesh position={[0.48, -0.07, 0]} material={earringMaterial}>
              <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// Mood Lighting Controller (Burnout-Reactive)
function MoodLighting({ burnout = 0 }: { burnout: number }) {
  const isHighBurnout = burnout > 75;
  const isModerateBurnout = burnout >= 40 && burnout <= 75;

  return (
    <>
      {/* Base Ambient Light */}
      <ambientLight
        intensity={isHighBurnout ? 0.25 : 0.85}
        color={isHighBurnout ? '#450a0a' : isModerateBurnout ? '#e2e8f0' : '#fffbeb'}
      />

      {/* Main Studio Key Light */}
      <directionalLight
        position={[2.5, 3.5, 3]}
        intensity={isHighBurnout ? 0.3 : 1.2}
        color={isHighBurnout ? '#991b1b' : '#ffffff'}
      />

      {/* Soft Backlight / Rim Light */}
      <directionalLight
        position={[-2, 2, -2.5]}
        intensity={0.4}
        color={isHighBurnout ? '#dc2626' : '#818cf8'}
      />

      {/* CINEMATIC HORROR SPOTLIGHT FROM BELOW (Burnout > 75) */}
      {isHighBurnout && (
        <spotLight
          position={[0, -2.2, 1.2]}
          target-position={[0, 0.5, 0]}
          intensity={2.8}
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
  showControls = true
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
        <MoodLighting burnout={burnout} />

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
