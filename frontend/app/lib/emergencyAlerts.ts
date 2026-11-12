import type { EmergencyAlert } from '../components/EmergencyNotificationHub';

// Aggregated Emergency Alerts for the top notification hub (extracted from page.tsx)
export function buildEmergencyAlerts(character: any, dismissedAlerts: string[], transhumanNotice: string | null): EmergencyAlert[] {
  const emergencyAlerts: EmergencyAlert[] = [];
if (character) {
  if ((character.age || 0) >= 18 && character.cash < 0 && !dismissedAlerts.includes('debt_crisis')) {
    emergencyAlerts.push({
      id: 'debt_crisis',
      type: 'critical',
      title: 'Báo Động Nợ Nần Cấp Bách',
      message: `Tài khoản âm -$${Math.abs(character.cash).toLocaleString()}. Lãi suất ngầm sẽ bào mòn sinh mệnh mỗi năm!`,
      actionHint: 'Vào Sàn Tài Sản bán bớt danh mục hoặc Cày Thêm Việc ngay.'
    });
  }
  if ((character.vitality || 100) < 25 && !dismissedAlerts.includes('vitality_crisis')) {
    emergencyAlerts.push({
      id: 'vitality_crisis',
      type: 'critical',
      title: 'Nguy Kịch Sinh Mệnh',
      message: `Thể lực chỉ còn ${character.vitality}%. Nguy cơ đột tử hoặc bạo bệnh trút hơi thở cuối cùng!`,
      actionHint: 'Dưỡng Sinh Tịnh Tâm hoặc Thỉnh Phước Hộ Thể tại Đền Thờ Nghiệp Quả.'
    });
  }
  if ((character.burnout || 0) >= 80 && !dismissedAlerts.includes('burnout_crisis')) {
    emergencyAlerts.push({
      id: 'burnout_crisis',
      type: 'critical',
      title: 'Khủng Hoảng Kiệt Sức',
      message: `Mức độ Burnout chạm ${character.burnout}%. Tinh thần suy sụp nghiêm trọng!`,
      actionHint: 'Nghỉ ngơi dưỡng sinh để hạ nhiệt áp lực.'
    });
  }
  // Operational errorMsg handled via sleek non-intrusive floating toast

  if (transhumanNotice && !dismissedAlerts.includes('transhuman_notice')) {
    emergencyAlerts.push({
      id: 'transhuman_notice',
      type: 'info',
      title: 'Kỷ Nguyên Bất Tử',
      message: transhumanNotice
    });
  }
}
  return emergencyAlerts;
}
