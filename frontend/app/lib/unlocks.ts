// Mở khoá dần (progressive disclosure): hàm thuần, chỉ quyết định HIỂN THỊ, không xoá hệ thống nào.
// Lõi (chỉ số, học tập, gia đình, tuổi thơ, chết/tái sinh/người kế thừa) luôn mở.

export interface Unlocks {
  /** Luôn mở: chỉ số lõi, kịch bản học tập/gia đình/tuổi thơ. */
  core: true;
  /** >= 18 tuổi */
  assets: boolean;
  careers: boolean;
  overtime: boolean;
  network: boolean;
  gamble: boolean;
  /** Kiếp 2 trở đi (hoặc có tiền nhân thật trong gia phả) */
  pets: boolean;
  skillTree: boolean;
  aspiration: boolean;
  /** >= 60 tuổi hoặc Kiếp 3 trở đi */
  breakthrough: boolean;
  transhumanism: boolean;
}

export const UNLOCK_HINTS = {
  adult: '🔒 Mở khoá ở 18 tuổi',
  rebirth: '🔒 Mở khoá ở Kiếp 2',
  late: '🔒 Mở khoá ở 60 tuổi/Kiếp 3',
} as const;

const isDemoAncestor = (a: any) => a?.is_demo === true || a?.id === 'founder_gen_1';

export function getUnlocks(character: any, account: any, lineage: any[] = []): Unlocks {
  const age = Number(character?.age) || 0;
  const rebirths = Number(account?.reincarnation_count) || 0;
  const hasRealAncestor = Array.isArray(lineage) && lineage.some((a) => !isDemoAncestor(a));

  const adult = age >= 18;
  const veteran = rebirths >= 1 || hasRealAncestor;
  const late = age >= 60 || rebirths >= 2;

  return {
    core: true,
    assets: adult,
    careers: adult,
    overtime: adult,
    network: adult,
    gamble: adult,
    pets: veteran,
    skillTree: veteran,
    aspiration: veteran,
    breakthrough: late,
    transhumanism: late,
  };
}

/** Mặc định khi không truyền gì: mở hết (giữ nguyên hành vi cũ cho nơi dùng lại component). */
export const ALL_UNLOCKED: Unlocks = {
  core: true, assets: true, careers: true, overtime: true, network: true, gamble: true,
  pets: true, skillTree: true, aspiration: true, breakthrough: true, transhumanism: true,
};
