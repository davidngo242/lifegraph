'use client';

import React, { useRef, useEffect, useState } from 'react';

export type SpineAnimationType =
  | 'Front_idle'
  | 'Front_Talk'
  | 'Gotcha_Pose'
  | 'Idle_1'
  | 'Idle_2'
  | 'Jump'
  | 'Run'
  | 'Vibing'
  | 'Walk'
  | 'Walk_Handup'
  | 'Back_idle';

export interface SpineCharacterAvatarProps {
  nationality?: string;
  gender?: 'male' | 'female' | string;
  age?: number;
  burnout?: number;
  vitality?: number;
  animation?: SpineAnimationType;
  showBones?: boolean;
  className?: string;
  netWorth?: number;
  traits?: string[];
  showSidekick?: boolean;
  onAnimationChange?: (anim: SpineAnimationType) => void;
}

export const SPINE_ANIMATION_LIST: { id: SpineAnimationType; label: string; desc: string }[] = [
  { id: 'Front_idle', label: 'Front_idle', desc: 'Đứng yên hít thở nhẹ nhàng, chớp mắt tự nhiên 60 FPS' },
  { id: 'Front_Talk', label: 'Front_Talk', desc: 'Gật đầu nhẹ và mấp máy miệng trò chuyện biểu cảm' },
  { id: 'Gotcha_Pose', label: 'Gotcha_Pose', desc: 'Tư thế MOBA: Chống nạnh hai bên, nở nụ cười tự tin như ảnh mẫu' },
  { id: 'Vibing', label: 'Vibing', desc: 'Lắc lư đầu và thân theo nhịp điệu cực chill' },
  { id: 'Jump', label: 'Jump', desc: 'Khuỵu gối bật nhảy vui sướng lên không trung' },
  { id: 'Walk', label: 'Walk', desc: 'Bước đi khoan thai, hai tay đánh nhịp nhẹ nhàng' },
  { id: 'Run', label: 'Run', desc: 'Chạy nhanh dứt khoát, người hơi chúi về phía trước' },
  { id: 'Walk_Handup', label: 'Walk_Handup', desc: 'Vừa bước đi vừa giơ tay vẫy chào thân thiện' },
  { id: 'Idle_1', label: 'Idle_1', desc: 'Nghiêng đầu tò mò, chớp mắt ngơ ngác dễ thương' },
  { id: 'Idle_2', label: 'Idle_2', desc: 'Chắp hai tay trước bụng, mỉm cười dịu dàng' },
  { id: 'Back_idle', label: 'Back_idle', desc: 'Quay lưng nhìn từ phía sau, tóc uốn lượn bồng bềnh' },
];

export default function SpineCharacterAvatar({
  nationality = 'Na Uy',
  gender = 'female',
  age = 16,
  burnout = 0,
  vitality = 100,
  animation = 'Front_idle',
  showBones = false,
  className = 'w-full h-full',
  netWorth = 50000,
  traits = [],
  showSidekick = true,
  onAnimationChange
}: SpineCharacterAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentAnim, setCurrentAnim] = useState<SpineAnimationType>(animation);

  useEffect(() => {
    setCurrentAnim(animation);
  }, [animation]);

  const isFemale = gender === 'female';
  const nat = (nationality || '').toLowerCase();
  const numericAge = Number(age ?? 0);
  const nw = Number(netWorth) || 0;

  // Age brackets
  const isBaby = numericAge <= 3;
  const isChild = numericAge > 3 && numericAge < 12;
  const isTeen = numericAge >= 12 && numericAge < 18;
  const isElderly = numericAge >= 65;

  // Socio-economic Tiers (Gắn chặt với đời thực: Nghèo, Cần lao, Giàu, Siêu giàu)
  const isPoor = nw < 25000 || (burnout > 75 && nw < 50000);
  const isMid = nw >= 25000 && nw < 500000;
  const isRich = nw >= 500000 && nw < 5000000;
  const isUltraRich = nw >= 5000000;

  // Trait indicators
  const traitList = Array.isArray(traits) ? traits : [];
  const hasGlasses = numericAge >= 4 && traitList.some(t =>
    ['cận_thị_bẩm_sinh', 'code_whisperer', 'nerd', 'mọt_sách', 'thần_đồng_toán_học'].includes(t)
  );
  const hasHalo = currentAnim === 'Idle_2' || traitList.some(t =>
    ['giác_ngộ_tâm_linh_tiên_thiên', 'phúc_đức_vô_lượng'].includes(t)
  );

  // Nationality visual mappings
  let skinTone = '#fde2d2'; // Default Fair Caucasian (Norway/Europe)
  if (nat.includes('việt') || nat.includes('vietnam')) skinTone = '#f6d2ad';
  else if (nat.includes('nhật') || nat.includes('korea') || nat.includes('japan')) skinTone = '#fae1c7';
  else if (nat.includes('syria') || nat.includes('ấn độ') || nat.includes('ai cập')) skinTone = '#b97f57';
  else if (nat.includes('châu phi') || nat.includes('somalia') || nat.includes('nigeria')) skinTone = '#5a351d';

  let hairColor = '#6c4427'; // Warm Auburn Brown like reference photo
  if (isElderly) hairColor = '#e2e8f0';
  else if (numericAge > 45) hairColor = '#64748b';
  else if (nat.includes('việt') || nat.includes('nhật')) hairColor = '#1c1917';
  else if (nat.includes('na uy') || nat.includes('norway')) hairColor = '#784624';

  let irisColor = '#78350f'; // Default warm hazel
  if (nat.includes('na uy') || nat.includes('norway')) irisColor = '#0284c7';
  else if (nat.includes('việt') || nat.includes('nhật')) irisColor = '#b45309';

  // Clothing Color Palette according to Economic Status & Nationality
  let tunicColor = '#6b7d47'; // Moss green default (Norway)
  let tunicTrim = '#526234';

  if (isBaby) {
    tunicColor = isFemale ? '#fbcfe8' : '#bae6fd'; // Cotton pastel sơ sinh
    tunicTrim = '#ffffff';
  } else if (isPoor) {
    tunicColor = '#785338'; // Vải thô màu đất sờn bạc
    tunicTrim = '#54361e';
  } else if (isUltraRich) {
    tunicColor = '#0f172a'; // Tuxedo dạ tiệc đen tuyền viền vàng ròng
    tunicTrim = '#fbbf24';
  } else if (isRich) {
    tunicColor = isFemale ? '#881337' : '#1e293b'; // Đầm nhung đỏ bọc đô hoặc vest tím than
    tunicTrim = '#f59e0b';
  } else if (nat.includes('việt')) {
    tunicColor = isFemale ? '#0284c7' : '#047857'; // Áo dài xanh lam / xanh ngọc
    tunicTrim = '#ffffff';
  }

  // Garland condition (Only North European or nature lovers in youth)
  const hasGarland = (nat.includes('na uy') || nat.includes('norway')) && (isTeen || isChild || numericAge <= 25);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Handle DPI scaling
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Center reference frame (Full-body framing: comfortable margin for head, hands and shoes)
      const cx = width / 2;
      const cy = height * 0.78;
      const scale = Math.min(width / 270, height / 370);

      // Skeletal Hierarchy State Variables
      let rootY = 0;
      let rootX = 0;
      let spineRot = isElderly ? 0.12 : 0; // Cụ già hơi còng lưng
      let headRot = 0;
      let leftArmRot = 0.2;
      let rightArmRot = -0.2;
      let leftLegRot = 0;
      let rightLegRot = 0;
      let blinkState = 1.0;
      let mouthOpen = 0;
      let isBackView = currentAnim === 'Back_idle';

      // Natural Eye Blinking cycle (Every ~3.8s, lasts ~0.14s)
      const blinkCycle = elapsed % 3.8;
      if (blinkCycle > 3.65) {
        const p = (blinkCycle - 3.65) / 0.15;
        blinkState = Math.sin(p * Math.PI) > 0.5 ? 0.08 : 0.6;
      }

      // Animation Motion Dynamics (Smooth 60 FPS Interpolation)
      switch (currentAnim) {
        case 'Front_idle': {
          const t = elapsed * 2.2;
          rootY = Math.sin(t) * 3;
          spineRot += Math.sin(t * 0.5) * 0.02;
          headRot = Math.sin(t * 0.8) * 0.03;
          leftArmRot = 0.25 + Math.sin(t) * 0.04;
          rightArmRot = -0.25 - Math.sin(t) * 0.04;
          break;
        }
        case 'Gotcha_Pose': {
          // Tư thế MOBA chống nạnh 2 bên cực tự tin như ảnh mẫu!
          const t = elapsed * 2.0;
          rootY = Math.sin(t) * 2.5;
          headRot = 0.08 + Math.sin(t * 0.8) * 0.02; // Nghiêng đầu kiêu hãnh
          leftArmRot = 0.95; // Tay chống nạnh bên hông trái
          rightArmRot = -0.95; // Tay chống nạnh bên hông phải
          break;
        }
        case 'Front_Talk': {
          const t = elapsed * 2.5;
          rootY = Math.sin(t) * 3;
          headRot = Math.sin(t * 2) * 0.06;
          mouthOpen = Math.abs(Math.sin(elapsed * 9)) * 0.8;
          leftArmRot = 0.35 + Math.sin(t * 1.5) * 0.08;
          rightArmRot = -0.25;
          break;
        }
        case 'Vibing': {
          const t = elapsed * 4.2;
          rootY = Math.abs(Math.sin(t)) * -8;
          spineRot += Math.sin(t) * 0.08;
          headRot = -Math.sin(t) * 0.15;
          leftArmRot = 0.4 + Math.sin(t) * 0.2;
          rightArmRot = -0.4 - Math.sin(t) * 0.2;
          break;
        }
        case 'Jump': {
          const t = (elapsed * 2.5) % Math.PI;
          const jumpCurve = Math.sin(t);
          rootY = -Math.max(0, jumpCurve * 45);
          leftLegRot = jumpCurve * 0.3;
          rightLegRot = -jumpCurve * 0.2;
          leftArmRot = 0.8 - jumpCurve * 0.9;
          rightArmRot = -0.8 + jumpCurve * 0.9;
          headRot = -jumpCurve * 0.1;
          break;
        }
        case 'Walk': {
          const t = elapsed * 5.0;
          rootY = Math.abs(Math.sin(t)) * 4;
          leftLegRot = Math.sin(t) * 0.45;
          rightLegRot = -Math.sin(t) * 0.45;
          leftArmRot = -Math.sin(t) * 0.4;
          rightArmRot = Math.sin(t) * 0.4;
          headRot = Math.sin(t * 0.5) * 0.04;
          break;
        }
        case 'Run': {
          const t = elapsed * 8.5;
          rootY = Math.abs(Math.sin(t)) * 7;
          spineRot += 0.12;
          leftLegRot = Math.sin(t) * 0.75;
          rightLegRot = -Math.sin(t) * 0.75;
          leftArmRot = -Math.sin(t) * 0.8;
          rightArmRot = Math.sin(t) * 0.8;
          headRot = 0.08;
          break;
        }
        case 'Walk_Handup': {
          const t = elapsed * 5.0;
          rootY = Math.abs(Math.sin(t)) * 4;
          leftLegRot = Math.sin(t) * 0.45;
          rightLegRot = -Math.sin(t) * 0.45;
          leftArmRot = -Math.sin(t) * 0.3;
          rightArmRot = -1.6 + Math.sin(elapsed * 4) * 0.15;
          headRot = 0.05;
          break;
        }
        case 'Idle_1': {
          const t = elapsed * 1.8;
          rootY = Math.sin(t) * 2;
          headRot = 0.18 + Math.sin(t) * 0.05;
          leftArmRot = 0.2;
          rightArmRot = -0.3;
          break;
        }
        case 'Idle_2': {
          const t = elapsed * 1.8;
          rootY = Math.sin(t) * 2;
          headRot = -0.05;
          leftArmRot = 0.55;
          rightArmRot = -0.55;
          break;
        }
        case 'Back_idle': {
          const t = elapsed * 2.0;
          rootY = Math.sin(t) * 3;
          headRot = Math.sin(t * 0.8) * 0.03;
          leftArmRot = 0.2;
          rightArmRot = -0.2;
          break;
        }
      }

      ctx.translate(cx + rootX * scale, cy + rootY * scale);
      ctx.scale(scale, scale);

      // 1. Ground Shadow (Soft ellipse with breathing opacity)
      ctx.beginPath();
      ctx.ellipse(0, 10, 52 + rootY * 0.3, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Bone Rigging Anchor Points for Visual Mode
      const bonePoints: { x: number; y: number; color: string; label?: string }[] = [];

      // =========================================================================
      // 2. LEGS & LOWER BODY (Phù hợp lứa tuổi và giàu - nghèo)
      // =========================================================================
      if (!isBaby) {
        const drawLeg = (legRot: number, isLeft: boolean) => {
          ctx.save();
          const legX = isLeft ? -15 : 15;
          ctx.translate(legX, -45);
          ctx.rotate(legRot);

          // Trousers
          ctx.fillStyle = isPoor ? '#3f2f25' : isUltraRich ? '#020617' : '#473c35';
          ctx.fillRect(-6, 0, 12, 28);

          // Footwear: Nghèo đi dép/giày sờn, Giàu đi giày da bóng loáng
          ctx.fillStyle = isPoor ? '#5c3a21' : isUltraRich ? '#0f172a' : '#8c532b';
          ctx.beginPath();
          ctx.roundRect(-8, 24, 16, 26, [3, 3, 5, 5]);
          ctx.fill();

          // Boot Cuff / Gold Rim
          ctx.fillStyle = isUltraRich ? '#fbbf24' : '#6e3f1e';
          ctx.beginPath();
          ctx.roundRect(-9, 22, 18, isUltraRich ? 4 : 8, 2);
          ctx.fill();

          ctx.restore();
        };

        drawLeg(leftLegRot, true);
        drawLeg(rightLegRot, false);
      }

      // =========================================================================
      // 3. TORSO & APPAREL (Biến đổi theo Nghèo / Giàu / Tuổi / Giới tính)
      // =========================================================================
      ctx.save();
      ctx.rotate(spineRot);

      if (showBones) {
        bonePoints.push({ x: cx, y: cy - 45 * scale, color: '#3b82f6', label: 'bone_spine' });
      }

      // Back Hair (Volumetric wavy locks behind neck)
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.ellipse(0, -95, isFemale ? 62 : 50, isFemale ? 54 : 44, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isBaby) {
        // --- BABY SWADDLE WRAP (Em bé sơ sinh quấn tã pastel dễ thương) ---
        ctx.fillStyle = tunicColor;
        ctx.beginPath();
        ctx.roundRect(-28, -85, 56, 75, [18, 18, 24, 24]);
        ctx.fill();

        // Baby Ribbon Bow on Chest
        ctx.fillStyle = isFemale ? '#f43f5e' : '#0284c7';
        ctx.beginPath();
        ctx.arc(0, -55, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-9, -55, 8, 4, 0.4, 0, Math.PI * 2);
        ctx.ellipse(9, -55, 8, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // --- ADULT / YOUTH APPAREL ---
        // Lower Tunic / Skirt
        ctx.fillStyle = tunicColor;
        ctx.beginPath();
        ctx.moveTo(-32, -45);
        ctx.lineTo(32, -45);
        ctx.lineTo(isFemale ? 38 : 34, -12);
        ctx.lineTo(isFemale ? -38 : -34, -12);
        ctx.closePath();
        ctx.fill();

        // Tunic Hem Trim
        ctx.fillStyle = tunicTrim;
        ctx.fillRect(-38, -15, 76, isUltraRich ? 5 : 3);

        // Main Upper Tunic Torso
        ctx.fillStyle = tunicColor;
        ctx.beginPath();
        ctx.roundRect(-26, -92, 52, 50, [12, 12, 4, 4]);
        ctx.fill();

        // Patch on Poor Character (Miếng vá trên áo người nghèo bĩ cực)
        if (isPoor) {
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(-18, -65, 12, 12);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(-18, -65, 12, 12);
        }

        // Gold Trim / Necktie for Ultra Rich (Cà vạt vàng ròng cho tài phiệt)
        if (isUltraRich) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(-4, -90);
          ctx.lineTo(4, -90);
          ctx.lineTo(3, -55);
          ctx.lineTo(0, -50);
          ctx.lineTo(-3, -55);
          ctx.closePath();
          ctx.fill();
        }

        // Crossbody Strap (Dây đai đeo túi phiêu lưu)
        if (!isUltraRich) {
          ctx.save();
          ctx.rotate(0.38);
          ctx.fillStyle = isPoor ? '#54361e' : '#7a421d';
          ctx.fillRect(-8, -98, 8, 78);
          ctx.restore();

          // Adventure Leather Satchel on Hip
          ctx.save();
          ctx.translate(32, -34);
          ctx.rotate(-0.15 + (currentAnim === 'Jump' || currentAnim === 'Run' ? 0.3 : 0));
          ctx.fillStyle = isPoor ? '#5c3a21' : '#8f562b';
          ctx.beginPath();
          ctx.roundRect(-14, -14, 28, 30, [4, 4, 10, 10]);
          ctx.fill();
          // Satchel Flap
          ctx.fillStyle = isPoor ? '#3a210f' : '#6d3c19';
          ctx.beginPath();
          ctx.roundRect(-15, -16, 30, 16, [4, 4, 6, 6]);
          ctx.fill();
          ctx.restore();
        }

        // Arms & Hands
        const drawArm = (armRot: number, isLeft: boolean) => {
          ctx.save();
          const armX = isLeft ? -24 : 24;
          ctx.translate(armX, -85);
          ctx.rotate(armRot);

          // Sleeve
          ctx.fillStyle = tunicColor;
          ctx.beginPath();
          ctx.roundRect(-7, 0, 14, 38, [6, 6, 4, 4]);
          ctx.fill();

          // Hand
          ctx.fillStyle = skinTone;
          ctx.beginPath();
          ctx.arc(0, 42, 6.5, 0, Math.PI * 2);
          ctx.fill();

          if (showBones && !isLeft) {
            bonePoints.push({ x: cx + (armX + 0) * scale, y: cy + (-85 + 42) * scale, color: '#ef4444', label: 'bone_hand' });
          }

          ctx.restore();
        };

        drawArm(leftArmRot, true);
        drawArm(rightArmRot, false);
      }

      // 4. Neck & Head
      ctx.translate(0, -92);
      ctx.rotate(headRot);

      if (showBones) {
        bonePoints.push({ x: cx, y: cy - 92 * scale, color: '#06b6d4', label: 'bone_neck' });
      }

      // Neck
      if (!isBaby) {
        ctx.fillStyle = skinTone;
        ctx.fillRect(-7, -10, 14, 12);
      }

      // Head Cranium (Chibi Round Head)
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.roundRect(-54, -105, 108, 98, [42, 42, 48, 48]);
      ctx.fill();

      // =========================================================================
      // 5. FACE DETAILS & EXPRESSIONS (Mắt long lanh, Má hồng, Miệng)
      // =========================================================================
      if (!isBackView) {
        // Peach Blush Cheeks
        ctx.fillStyle = isBaby ? 'rgba(251, 113, 133, 0.6)' : isFemale ? 'rgba(251, 113, 133, 0.45)' : 'rgba(251, 113, 133, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-34, -45, 11, 6, 0.05, 0, Math.PI * 2);
        ctx.ellipse(34, -45, 11, 6, -0.05, 0, Math.PI * 2);
        ctx.fill();

        // Cute Nose
        ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
        ctx.beginPath();
        ctx.arc(0, -48, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Mouth or Baby Pacifier
        if (isBaby) {
          // Núm vú giả sơ sinh
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, -38, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Miệng biểu cảm
          ctx.strokeStyle = '#881337';
          ctx.lineWidth = 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (mouthOpen > 0.1) {
            ctx.fillStyle = '#e11d48';
            ctx.ellipse(0, -36, 4.5, 4 * mouthOpen, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (currentAnim === 'Gotcha_Pose') {
            // Nụ cười tự tin MOBA
            ctx.arc(0, -38, 5.5, 0.1, Math.PI - 0.1);
            ctx.stroke();
          } else {
            ctx.arc(0, -38, 4.5, 0.2, Math.PI - 0.2);
            ctx.stroke();
          }
        }

        // --- EXPONENTIALLY DETAILED ANIME CHIBI EYES ---
        const drawAnimeEye = (eyeX: number, isLeft: boolean) => {
          ctx.save();
          ctx.translate(eyeX, -58);
          ctx.scale(1, blinkState);

          // Sclera
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, isBaby ? 18 : 16, isBaby ? 21 : 19, 0, 0, Math.PI * 2);
          ctx.fill();

          // Iris
          const irisGrad = ctx.createLinearGradient(0, -18, 0, 18);
          irisGrad.addColorStop(0, '#1c0a02');
          irisGrad.addColorStop(0.5, irisColor);
          irisGrad.addColorStop(1, '#f59e0b');

          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.ellipse(isLeft ? 1 : -1, 0, isBaby ? 15 : 13, isBaby ? 18 : 16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#0f0502';
          ctx.beginPath();
          ctx.ellipse(isLeft ? 1 : -1, 1, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dual Catchlights
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(isLeft ? -4 : -6, -6, 4.5, 0, Math.PI * 2);
          ctx.arc(isLeft ? 5 : 3, 6, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Eyelash (Chỉ vẽ cong đậm cho nữ)
          if (isFemale || isBaby) {
            ctx.strokeStyle = '#271206';
            ctx.lineWidth = isFemale ? 3.2 : 2.0;
            ctx.beginPath();
            ctx.arc(0, -2, 17, Math.PI + 0.35, Math.PI * 2 - 0.35);
            ctx.stroke();
          }

          // Eyebrows
          ctx.strokeStyle = hairColor;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, -24, 15, Math.PI + 0.45, Math.PI * 2 - 0.45);
          ctx.stroke();

          ctx.restore();
        };

        drawAnimeEye(-27, true);
        drawAnimeEye(27, false);

        // Kính cận tri thức (Spectacles)
        if (hasGlasses) {
          ctx.save();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5;
          // Left Rim
          ctx.beginPath();
          ctx.arc(-27, -58, 18, 0, Math.PI * 2);
          ctx.stroke();
          // Right Rim
          ctx.beginPath();
          ctx.arc(27, -58, 18, 0, Math.PI * 2);
          ctx.stroke();
          // Bridge
          ctx.beginPath();
          ctx.moveTo(-9, -58);
          ctx.lineTo(9, -58);
          ctx.stroke();
          ctx.restore();
        }
      }

      // =========================================================================
      // 6. HAIRSTYLES (Nam tóc ngắn cá tính / Nữ tóc dài bồng bềnh uốn sóng)
      // =========================================================================
      ctx.fillStyle = hairColor;

      if (isBaby) {
        // Mũ len sơ sinh (Baby Beanie Bonnet)
        ctx.fillStyle = tunicColor;
        ctx.beginPath();
        ctx.arc(0, -78, 54, Math.PI, Math.PI * 2);
        ctx.fill();
        // Quả bông tròn trên đỉnh mũ
        ctx.fillStyle = isFemale ? '#f43f5e' : '#0284c7';
        ctx.beginPath();
        ctx.arc(0, -135, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (isFemale) {
        // --- FEMALE WAVY HAIR ---
        // Front Bangs
        ctx.beginPath();
        ctx.moveTo(-16, -104);
        ctx.quadraticCurveTo(-8, -70, 0, -66);
        ctx.quadraticCurveTo(8, -70, 16, -104);
        ctx.quadraticCurveTo(-26, -72, -32, -68);
        ctx.quadraticCurveTo(-38, -85, -46, -100);
        ctx.quadraticCurveTo(26, -72, 32, -68);
        ctx.quadraticCurveTo(38, -85, 46, -100);
        ctx.closePath();
        ctx.fill();

        // Wavy Side Locks
        const drawSideLock = (isLeft: boolean) => {
          ctx.save();
          const sideX = isLeft ? -46 : 46;
          const dir = isLeft ? -1 : 1;
          ctx.translate(sideX, -80);
          ctx.fillStyle = hairColor;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(dir * 18, 25, dir * 26, 65, dir * 12, 95);
          ctx.bezierCurveTo(dir * 4, 105, dir * -14, 98, dir * -8, 85);
          ctx.bezierCurveTo(dir * 2, 60, dir * 6, 35, 0, 0);
          ctx.fill();
          ctx.restore();
        };

        drawSideLock(true);
        drawSideLock(false);
      } else {
        // --- MALE SHORT SPIKY ANIME HAIR ---
        ctx.beginPath();
        // Bangs
        ctx.moveTo(-35, -100);
        ctx.lineTo(-20, -75);
        ctx.lineTo(-10, -95);
        ctx.lineTo(0, -72);
        ctx.lineTo(10, -95);
        ctx.lineTo(20, -75);
        ctx.lineTo(35, -100);
        ctx.closePath();
        ctx.fill();
        // Short side tufts
        ctx.fillRect(-52, -92, 10, 32);
        ctx.fillRect(42, -92, 10, 32);
      }

      // =========================================================================
      // 7. CROWNS & STATUS ACCESSORIES (Vòng hoa lá Na Uy / Vương miện tài phiệt)
      // =========================================================================
      if (isUltraRich) {
        // Vương miện hoàng gia mini vàng ròng lấp lánh hào quang (Royal Mini Crown)
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-16, -108);
        ctx.lineTo(-20, -125);
        ctx.lineTo(-8, -116);
        ctx.lineTo(0, -132);
        ctx.lineTo(8, -116);
        ctx.lineTo(20, -125);
        ctx.lineTo(16, -108);
        ctx.closePath();
        ctx.fill();
        // Red Ruby Gem on Crown
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -115, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (hasGarland) {
        // Vòng hoa lá quả mọng đỏ ruby Na Uy
        ctx.save();
        ctx.strokeStyle = '#4a5d23';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(0, -96, 52, 18, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#5c7832';
        [-30, -14, 14, 30].forEach(lx => {
          ctx.beginPath();
          ctx.ellipse(lx, -104, 7.5, 4.0, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#dc2626';
        [-36, -18, 18, 36].forEach(bx => {
          ctx.beginPath();
          ctx.arc(bx, -100, 3.4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Vòng hào quang hoàng kim (Spiritual Golden Halo)
      if (hasHalo) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -118, 48, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); // Restore Head
      ctx.restore(); // Restore Torso

      // 8. SKELETAL RIGGING OVERLAY
      if (showBones) {
        ctx.save();
        bonePoints.forEach(bp => {
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = bp.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        ctx.restore();
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [currentAnim, showBones, skinTone, hairColor, tunicColor, tunicTrim, numericAge, isFemale, isBaby, isPoor, isUltraRich, hasGarland, hasGlasses, hasHalo, irisColor]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain cursor-grab active:cursor-grabbing" />
    </div>
  );
}
