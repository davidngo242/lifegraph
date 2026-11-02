// Dynamic Avatar & Visual VFX Engine for LifeGraph V4

export function generateCharacterVisuals(character, assets = []) {
  const { age, vitality, cash, burnout, hidden_flags = [], nationality, background } = character;
  const flags = new Set(hidden_flags);
  const netWorth = cash + (assets || []).reduce((sum, a) => sum + Number(a.current_value || 0), 0);

  // 1. Determine Visual Filter & Aura
  let vfxFilter = "normal";
  if (vitality < 35 || flags.has("chronic_condition") || flags.has("substance_dependent")) {
    vfxFilter = "grayscale_sick";
  } else if (netWorth > 1000000) {
    vfxFilter = "golden_electric_aura";
  } else if (burnout > 80) {
    vfxFilter = "dark_psych_glitch";
  }

  // 2. Generate Cinematic AI Image Prompt (Ready for DALL-E / Imagen)
  const ageGroup = age < 20 ? "young 18-year-old" : age < 35 ? "30-year-old" : age < 55 ? "45-year-old mature" : age < 75 ? "65-year-old elder" : "85-year-old frail ancient";
  const clothing = netWorth > 1000000 ? "wearing an immaculate bespoke charcoal suit" : cash < 0 ? "wearing a faded worn-out shirt with frayed collar" : "dressed in simple casual working-class attire";
  const expression = burnout > 75 ? "hollow eyes with deep dark circles, trembling lips, haunted look" : vitality < 40 ? "pale sickly skin, labored breathing, tired gaze" : "sharp determined gaze, resilient expression";
  const lighting = netWorth > 1000000 ? "cinematic golden rim light, luxury penthouse background" : cash < 0 ? "harsh fluorescent lighting, cramped dim room with stacks of unpaid bills" : "moody cinematic atmospheric lighting";

  const aiImagePrompt = `A cinematic hyper-realistic portrait of an Asian ${ageGroup} person from ${nationality || "Vietnam"}, ${clothing}, ${expression}, ${lighting}, 8k resolution, photorealistic, 35mm lens, masterpiece.`;

  // 3. Mood Description
  let moodDescription = "Điềm tĩnh, quan sát cuộc đời.";
  if (burnout > 80) moodDescription = "Ánh mắt đờ đẫn, thần kinh căng như dây đàn sắp đứt.";
  else if (vitality < 30) moodDescription = "Hơi thở dốc, sắc diện nhợt nhạt suy kiệt.";
  else if (netWorth > 1000000) moodDescription = "Uy nghi, kiêu hãnh nhưng ánh mắt toát lên sự hoài nghi cô độc.";
  else if (cash < 0) moodDescription = "Căng thẳng tột độ, bất an trước từng tiếng gõ cửa.";

  // 4. Procedural SVG Portrait Data (Zero external latency, renders immediately)
  const avatarSvg = generateProceduralSvgAvatar(character, vfxFilter, netWorth);

  return {
    portrait_url: `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`,
    vfx_filter: vfxFilter,
    mood_description: moodDescription,
    ai_image_prompt: aiImagePrompt
  };
}

function generateProceduralSvgAvatar(character, vfxFilter, netWorth) {
  const { age, burnout, vitality } = character;
  
  // Colors based on age & state
  const skinTone = vitality < 35 ? "#94a3b8" : age > 65 ? "#cbd5e1" : "#fcd34d";
  const hairColor = age > 60 ? "#e2e8f0" : age > 45 ? "#64748b" : "#1e293b";
  const eyeColor = burnout > 75 ? "#ef4444" : "#38bdf8";
  const borderColor = netWorth > 1000000 ? "#fbbf24" : burnout > 80 ? "#f43f5e" : "#6366f1";

  // Wrinkles for old age
  const wrinkles = age > 50 ? `<path d="M 35,45 Q 50,42 65,45 M 32,52 Q 50,49 68,52" stroke="#475569" stroke-width="1.2" fill="none" opacity="0.7"/>` : "";
  // Dark eye bags for burnout
  const eyeBags = burnout > 60 ? `<path d="M 36,65 Q 43,70 48,65 M 52,65 Q 57,70 64,65" stroke="#be123c" stroke-width="1.5" fill="none" opacity="0.8"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      ${netWorth > 1000000 ? `<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ""}
    </defs>
    <!-- Background Circle -->
    <rect width="100" height="100" rx="20" fill="url(#bgGrad)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="${borderColor}" stroke-width="${netWorth > 1000000 ? '3' : '1.5'}" ${netWorth > 1000000 ? 'filter="url(#glow)"' : ''}/>
    
    <!-- Shoulders / Torso -->
    <path d="M 18,96 Q 50,75 82,96 Z" fill="${netWorth > 1000000 ? '#1e293b' : '#0f172a'}" stroke="#334155" stroke-width="1"/>
    ${netWorth > 1000000 ? `<path d="M 45,86 L 50,96 L 55,86 Z" fill="#fbbf24"/>` : ""}

    <!-- Head & Neck -->
    <rect x="44" y="68" width="12" height="15" fill="${skinTone}" opacity="0.9"/>
    <ellipse cx="50" cy="52" rx="20" ry="24" fill="${skinTone}"/>

    <!-- Hair -->
    <path d="M 28,45 Q 50,22 72,45 Q 74,32 50,26 Q 26,32 28,45 Z" fill="${hairColor}"/>

    <!-- Eyes -->
    <ellipse cx="42" cy="54" rx="3.5" ry="2.2" fill="#0f172a"/>
    <circle cx="42" cy="54" r="1.5" fill="${eyeColor}"/>
    <ellipse cx="58" cy="54" rx="3.5" ry="2.2" fill="#0f172a"/>
    <circle cx="58" cy="54" r="1.5" fill="${eyeColor}"/>

    ${eyeBags}
    ${wrinkles}

    <!-- Nose & Mouth -->
    <path d="M 50,56 L 48,63 L 52,63" stroke="#475569" stroke-width="1" fill="none"/>
    <path d="M 44,69 Q 50,${burnout > 70 ? '66' : '71'} 56,69" stroke="#334155" stroke-width="1.5" fill="none"/>

    <!-- Subtle Glitch Lines when Burnout > 80 -->
    ${burnout > 80 ? `<line x1="10" y1="35" x2="90" y2="35" stroke="#f43f5e" stroke-width="0.8" opacity="0.6"/><line x1="20" y1="62" x2="80" y2="62" stroke="#38bdf8" stroke-width="0.8" opacity="0.5"/>` : ""}
  </svg>`;
}
