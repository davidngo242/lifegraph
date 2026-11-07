'use client';

import React, { useRef, useEffect, useState } from 'react';

export type SpineAnimationType =
  | 'Front_idle'
  | 'Front_Talk'
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
  onAnimationChange?: (anim: SpineAnimationType) => void;
}

export const SPINE_ANIMATION_LIST: { id: SpineAnimationType; label: string; desc: string }[] = [
  { id: 'Front_idle', label: 'Front_idle', desc: 'Đứng yên hít thở nhẹ nhàng, chớp mắt tự nhiên' },
  { id: 'Front_Talk', label: 'Front_Talk', desc: 'Gật đầu nhẹ và mấp máy miệng trò chuyện' },
  { id: 'Vibing', label: 'Vibing', desc: 'Lắc lư đầu và thân theo nhịp điệu cực chill' },
  { id: 'Jump', label: 'Jump', desc: 'Khuỵu gối bật nhảy vui sướng lên không trung' },
  { id: 'Walk', label: 'Walk', desc: 'Bước đi khoan thai, hai tay đánh nhịp nhẹ' },
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
  onAnimationChange
}: SpineCharacterAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentAnim, setCurrentAnim] = useState<SpineAnimationType>(animation);

  useEffect(() => {
    setCurrentAnim(animation);
  }, [animation]);

  // Skin tone & hair color based on nationality & age
  const isFemale = gender === 'female';
  const nat = (nationality || '').toLowerCase();

  let skinTone = '#fde2d2'; // Default Fair Caucasian (Norway/Europe like reference photo)
  if (nat.includes('việt') || nat.includes('vietnam')) skinTone = '#f6d2ad';
  else if (nat.includes('nhật') || nat.includes('korea') || nat.includes('japan')) skinTone = '#fae1c7';
  else if (nat.includes('syria') || nat.includes('ấn độ') || nat.includes('ai cập')) skinTone = '#b97f57';
  else if (nat.includes('châu phi') || nat.includes('somalia') || nat.includes('nigeria')) skinTone = '#5a351d';

  let hairColor = '#6c4427'; // Warm Auburn Brown like reference photo
  if (age > 65) hairColor = '#e2e8f0';
  else if (age > 45) hairColor = '#64748b';
  else if (nat.includes('việt') || nat.includes('nhật')) hairColor = '#1e1b18';
  else if (nat.includes('na uy') || nat.includes('norway')) hairColor = '#784624';

  const isWealthy = (Number(netWorth) >= 500000) || age >= 35;
  const tunicColor = isWealthy ? '#1e293b' : '#6b7d47'; // Olive Moss Green like reference photo
  const tunicTrim = isWealthy ? '#fbbf24' : '#526234';

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

      // Center reference frame
      const cx = width / 2;
      const cy = height * 0.72;
      const scale = Math.min(width, height) / 380;

      // Skeletal Hierarchy State Variables
      let rootY = 0;
      let rootX = 0;
      let spineRot = 0;
      let headRot = 0;
      let leftArmRot = 0.2;
      let rightArmRot = -0.2;
      let leftLegRot = 0;
      let rightLegRot = 0;
      let blinkState = 1.0; // 1.0 = open, 0.0 = fully closed
      let mouthOpen = 0;
      let isBackView = currentAnim === 'Back_idle';

      // Natural Eye Blinking cycle (every ~3.8 seconds, blink lasts 0.14s)
      const blinkCycle = elapsed % 3.8;
      if (blinkCycle > 3.65) {
        const p = (blinkCycle - 3.65) / 0.15;
        blinkState = Math.sin(p * Math.PI) > 0.5 ? 0.08 : 0.6;
      }

      // Animation Motion Dynamics
      switch (currentAnim) {
        case 'Front_idle': {
          const t = elapsed * 2.2;
          rootY = Math.sin(t) * 3;
          spineRot = Math.sin(t * 0.5) * 0.02;
          headRot = Math.sin(t * 0.8) * 0.03;
          leftArmRot = 0.25 + Math.sin(t) * 0.04;
          rightArmRot = -0.25 - Math.sin(t) * 0.04;
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
          spineRot = Math.sin(t) * 0.08;
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
          spineRot = 0.12;
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
          rightArmRot = -1.6 + Math.sin(elapsed * 4) * 0.15; // Waving hand up
          headRot = 0.05;
          break;
        }
        case 'Idle_1': {
          const t = elapsed * 1.8;
          rootY = Math.sin(t) * 2;
          headRot = 0.18 + Math.sin(t) * 0.05; // Curious head tilt
          leftArmRot = 0.2;
          rightArmRot = -0.3;
          break;
        }
        case 'Idle_2': {
          const t = elapsed * 1.8;
          rootY = Math.sin(t) * 2;
          headRot = -0.05;
          leftArmRot = 0.55; // Hands clasped in front
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

      // 2. Legs & Boots (Da nâu sẫm gập cổ như ảnh mẫu)
      const drawLeg = (legRot: number, isLeft: boolean) => {
        ctx.save();
        const legX = isLeft ? -15 : 15;
        ctx.translate(legX, -45);
        ctx.rotate(legRot);

        // Trousers/Tights
        ctx.fillStyle = '#473c35';
        ctx.fillRect(-6, 0, 12, 28);

        // Leather Boot with Folded Cuff
        ctx.fillStyle = '#8c532b';
        ctx.beginPath();
        ctx.roundRect(-8, 24, 16, 26, [3, 3, 5, 5]);
        ctx.fill();

        // Boot Folded Cuff Collar
        ctx.fillStyle = '#6e3f1e';
        ctx.beginPath();
        ctx.roundRect(-9, 22, 18, 9, 2);
        ctx.fill();

        // Boot Sole & Heel
        ctx.fillStyle = '#3f220f';
        ctx.fillRect(-9, 46, 18, 4);

        ctx.restore();
      };

      drawLeg(leftLegRot, true);
      drawLeg(rightLegRot, false);

      // 3. Torso & Forest Tunic (Áo Tunic xanh rêu với dây đai thắt như ảnh mẫu)
      ctx.save();
      ctx.rotate(spineRot);

      // Back Hair (Volumetric wavy locks seen behind neck)
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.ellipse(0, -95, 62, 54, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lower Tunic Skirt
      ctx.fillStyle = tunicColor;
      ctx.beginPath();
      ctx.moveTo(-32, -45);
      ctx.lineTo(32, -45);
      ctx.lineTo(38, -12);
      ctx.lineTo(-38, -12);
      ctx.closePath();
      ctx.fill();

      // Tunic Hem Shadow/Trim
      ctx.fillStyle = tunicTrim;
      ctx.fillRect(-38, -15, 76, 3);

      // Main Upper Tunic Torso
      ctx.fillStyle = tunicColor;
      ctx.beginPath();
      ctx.roundRect(-26, -92, 52, 50, [12, 12, 4, 4]);
      ctx.fill();

      // Leather Crossbody Strap (Dây đai da vắt chéo ngực từ vai trái qua hông phải)
      ctx.save();
      ctx.rotate(0.38);
      ctx.fillStyle = '#7a421d';
      ctx.fillRect(-8, -98, 9, 78);
      ctx.fillStyle = '#3a1f0d';
      ctx.fillRect(-9, -98, 1, 78);
      ctx.restore();

      // Front Tunic Cord Ties (Dây thắt cổ áo xỏ dây đan chéo như ảnh mẫu)
      ctx.strokeStyle = '#3e4922';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-6, -82);
      ctx.lineTo(6, -74);
      ctx.moveTo(6, -82);
      ctx.lineTo(-6, -74);
      ctx.stroke();

      // Adventure Leather Satchel (Túi đeo chéo bên hông có chùm lá cây trang trí như ảnh mẫu)
      ctx.save();
      ctx.translate(32, -34);
      ctx.rotate(-0.15 + (currentAnim === 'Jump' || currentAnim === 'Run' ? 0.3 : 0));
      // Satchel Body
      ctx.fillStyle = '#8f562b';
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 30, [4, 4, 10, 10]);
      ctx.fill();
      // Flap
      ctx.fillStyle = '#6d3c19';
      ctx.beginPath();
      ctx.roundRect(-15, -16, 30, 16, [4, 4, 6, 6]);
      ctx.fill();
      // Decorative Forest Leaves on Bag (Lá cây trang trí gắn trên túi)
      ctx.fillStyle = '#5c7832';
      ctx.beginPath();
      ctx.ellipse(-4, 4, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, 8, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Arms & Hands (Hai tay chắp trước bụng như ảnh mẫu)
      const drawArm = (armRot: number, isLeft: boolean) => {
        ctx.save();
        const armX = isLeft ? -24 : 24;
        ctx.translate(armX, -85);
        ctx.rotate(armRot);

        // Sleeve (Áo tay bồng màu xanh rêu)
        ctx.fillStyle = tunicColor;
        ctx.beginPath();
        ctx.roundRect(-7, 0, 14, 38, [6, 6, 4, 4]);
        ctx.fill();

        // Forearm / Hand
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

      // Spine Central Bone Point Indicator
      if (showBones) {
        bonePoints.push({ x: cx, y: cy - 70 * scale, color: '#06b6d4', label: 'bone_spine' });
      }

      // 4. Neck & Head
      ctx.translate(0, -92);
      ctx.rotate(headRot);

      if (showBones) {
        bonePoints.push({ x: cx, y: cy - 92 * scale, color: '#06b6d4', label: 'bone_neck' });
      }

      // Neck
      ctx.fillStyle = skinTone;
      ctx.fillRect(-7, -10, 14, 12);

      // Neck Collar Trim
      ctx.fillStyle = tunicTrim;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head Cranium (Chibi Round Head)
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.roundRect(-54, -105, 108, 98, [42, 42, 48, 48]);
      ctx.fill();

      if (!isBackView) {
        // --- FRONT FACE DETAILS (ANIME CHIBI EYES, NOSE, MOUTH, BLUSH) ---

        // Peach Blush Cheeks (Hai má ửng hồng dễ thương)
        ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-34, -45, 11, 6, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(34, -45, 11, 6, -0.05, 0, Math.PI * 2);
        ctx.fill();

        // Small Cute Chibi Nose
        ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
        ctx.beginPath();
        ctx.arc(0, -48, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Cute Mouth (Biểu cảm mỉm cười hoặc nói)
        ctx.strokeStyle = '#881337';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (mouthOpen > 0.1) {
          ctx.fillStyle = '#e11d48';
          ctx.ellipse(0, -36, 4.5, 4 * mouthOpen, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.arc(0, -38, 4.5, 0.2, Math.PI - 0.2);
          ctx.stroke();
        }

        // --- EXPONENTIALLY DETAILED ANIME CHIBI EYES ---
        const drawAnimeEye = (eyeX: number, isLeft: boolean) => {
          ctx.save();
          ctx.translate(eyeX, -58);
          ctx.scale(1, blinkState); // Blinking compression

          // Sclera (Tròng trắng)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 19, 0, 0, Math.PI * 2);
          ctx.fill();

          // Iris (Tròng mắt to tròn nâu hạt dẻ/hổ phách anime)
          const irisGrad = ctx.createLinearGradient(0, -18, 0, 18);
          irisGrad.addColorStop(0, '#2e1505');
          irisGrad.addColorStop(0.5, '#78350f');
          irisGrad.addColorStop(1, '#d97706');

          ctx.fillStyle = irisGrad;
          ctx.beginPath();
          ctx.ellipse(isLeft ? 1 : -1, 0, 13, 16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Deep Pupil (Đồng tử sẫm màu)
          ctx.fillStyle = '#1c0a02';
          ctx.beginPath();
          ctx.ellipse(isLeft ? 1 : -1, 1, 6, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dual Catchlights / Highlights (2 đốm sáng bắt ánh sáng long lanh như ảnh mẫu)
          // Primary Specular Sparkle (Góc 10h)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(isLeft ? -4 : -6, -6, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Secondary Catchlight (Góc 4h)
          ctx.beginPath();
          ctx.arc(isLeft ? 5 : 3, 6, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Upper Eyelash Arc (Hàng mi trên cong vút sắc nét)
          ctx.strokeStyle = '#271206';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, -2, 17, Math.PI + 0.35, Math.PI * 2 - 0.35);
          ctx.stroke();

          // Petite Eyelash Flick
          ctx.beginPath();
          ctx.moveTo(isLeft ? -14 : 14, -8);
          ctx.lineTo(isLeft ? -19 : 19, -12);
          ctx.stroke();

          // Eyebrows (Lông mày thanh mảnh)
          ctx.strokeStyle = hairColor;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, -24, 15, Math.PI + 0.45, Math.PI * 2 - 0.45);
          ctx.stroke();

          ctx.restore();
        };

        drawAnimeEye(-27, true);
        drawAnimeEye(27, false);
      }

      // 5. LAYERED VOLUMETRIC ANIME HAIR (Mái tóc bồng bềnh uốn sóng nhiều tầng như ảnh mẫu)
      ctx.fillStyle = hairColor;

      // Front Bangs (Tóc mái uốn cong tỉa nhánh rủ xuống trán)
      ctx.beginPath();
      // Center Bang
      ctx.moveTo(-16, -104);
      ctx.quadraticCurveTo(-8, -70, 0, -66);
      ctx.quadraticCurveTo(8, -70, 16, -104);
      // Left Bang Tufts
      ctx.quadraticCurveTo(-26, -72, -32, -68);
      ctx.quadraticCurveTo(-38, -85, -46, -100);
      // Right Bang Tufts
      ctx.quadraticCurveTo(26, -72, 32, -68);
      ctx.quadraticCurveTo(38, -85, 46, -100);
      ctx.closePath();
      ctx.fill();

      // Wavy Side Hair Locks (Hai lọn tóc mai uốn lượn phủ dài qua vai ôm má hệt ảnh mẫu)
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

        // Shading stroke
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      };

      drawSideLock(true);
      drawSideLock(false);

      // Back Hair (if looking from back)
      if (isBackView) {
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.roundRect(-56, -106, 112, 118, [50, 50, 20, 20]);
        ctx.fill();

        // Wavy Hair Grooves
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-20, -90);
        ctx.bezierCurveTo(-24, -40, -18, 0, -22, 16);
        ctx.moveTo(20, -90);
        ctx.bezierCurveTo(24, -40, 18, 0, 22, 16);
        ctx.stroke();
      }

      // 6. FOREST BERRY GARLAND CROWN (Vòng hoa lá quả mọng đỏ như ảnh mẫu Sếp gửi)
      ctx.save();
      // Vine Ring
      ctx.strokeStyle = '#4a5d23';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(0, -96, 52, 18, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Decorative Green Ivy Leaves (Các phiến lá xanh rêu đan quanh vòng hoa)
      const leafPositions = [
        { x: -44, y: -94, rot: -0.6 },
        { x: -30, y: -104, rot: -0.2 },
        { x: -14, y: -108, rot: 0.1 },
        { x: 14, y: -108, rot: -0.1 },
        { x: 30, y: -104, rot: 0.2 },
        { x: 44, y: -94, rot: 0.6 },
      ];

      ctx.fillStyle = '#5c7832';
      leafPositions.forEach(lp => {
        ctx.save();
        ctx.translate(lp.x, lp.y);
        ctx.rotate(lp.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ruby Red Berries (Các quả mọng đỏ rực rỡ điểm xuyết hệt ảnh mẫu)
      const berryPositions = [
        { x: -40, y: -97 },
        { x: -36, y: -100 },
        { x: -18, y: -109 },
        { x: 18, y: -109 },
        { x: 36, y: -100 },
        { x: 40, y: -97 },
      ];

      ctx.fillStyle = '#dc2626'; // Vivid Ruby Red
      berryPositions.forEach(bp => {
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 3.4, 0, Math.PI * 2);
        ctx.fill();

        // Berry highlight
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(bp.x - 1, bp.y - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
      });

      ctx.restore();

      ctx.restore(); // Restore Head
      ctx.restore(); // Restore Torso

      // 7. SKELETAL RIGGING OVERLAY (Spine-Style Bone Visualizer)
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

          // Bone Pulsing Reticle
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, 8, 0, Math.PI * 2);
          ctx.strokeStyle = bp.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        ctx.restore();
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [currentAnim, showBones, skinTone, hairColor, tunicColor, tunicTrim, age, isFemale]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain cursor-grab active:cursor-grabbing" />
    </div>
  );
}
