import { getRandom } from './rng.js';
// backend/src/engine/incomingSocialEngine.js

export function evaluateIncomingNpcEvent(character, relationships = []) {
  if (!character || character.age < 6 || character.is_deceased) return null;

  // 35% chance an NPC reaches out at the start of a year
  if (getRandom() > 0.40) return null;

  const validContacts = (relationships || []).filter(r => r.status !== 'deceased');
  if (validContacts.length === 0) return null;

  const contact = validContacts[Math.floor(getRandom() * validContacts.length)];
  const contactName = contact.name || "Người quen";
  const contactType = contact.type || "friend";
  const age = character.age || 0;

  if (contactType === 'parent' || contactType === 'father' || contactType === 'mother') {
    return {
      id: `incoming_parent_${age}`,
      npcName: contactName,
      npcRole: contactType === 'mother' ? 'Mẹ ruột' : 'Bố ruột',
      npcAvatar: '👵',
      title: `${contactName} Gọi Điện Cuối Tuần`,
      message: `"${character.name ? character.name : 'Con'} dạo này gầy đi nhiều thế? Cuối tuần này về nhà ăn cơm, mẹ nấu nồi canh gà bồi bổ cho nhé?"`,
      options: [
        {
          id: 'accept',
          label: 'Về Nhà Ăn Cơm (-1 AP)',
          costAp: 1,
          hint: 'Ấm lòng gia đạo, giảm 25% Stress, hồi phục 15 Thể lực.',
          effect(char) {
            char.burnout = Math.max(0, (char.burnout || 0) - 25);
            char.vitality = Math.min(char.max_vitality || 100, (char.vitality || 80) + 15);
            char.karma = Math.min(100, (char.karma || 100) + 10);
            return 'Về nhà quây quần bên mâm cơm gia đình, ấm lòng và hồi phục sinh lực (-25 Stress, +15 HP).';
          }
        },
        {
          id: 'decline',
          label: 'Từ Chối Để Tập Trung Làm Việc',
          costAp: 0,
          hint: 'Tiết kiệm AP nhưng phụ mẫu hơi buồn lòng.',
          effect(char) {
            char.burnout = Math.min(100, (char.burnout || 0) + 5);
            return 'Khéo léo từ chối vì bận công việc, tự hứa sẽ về vào dịp khác.';
          }
        }
      ]
    };
  }

  if (contactType === 'spouse' || contactType === 'partner') {
    return {
      id: `incoming_spouse_${age}`,
      npcName: contactName,
      npcRole: 'Bạn đời',
      npcAvatar: '💍',
      title: `${contactName} Muốn Hẹn Hò Kỷ Niệm`,
      message: `"Hôm nay là kỷ niệm ngày hai đứa mình gặp nhau. Tối nay mình đi ăn tối ở quán quen rồi đi dạo bờ hồ nhé anh/em?"`,
      options: [
        {
          id: 'accept',
          label: 'Đặt Bàn Nhà Hàng Hẹn Hò (-1 AP, -$500)',
          costAp: 1,
          costCash: 500,
          hint: 'Hàn gắn tình cảm bạn đời (+25 Hảo cảm, -20 Stress).',
          effect(char) {
            char.cash = (Number(char.cash) || 0) - 500;
            char.burnout = Math.max(0, (char.burnout || 0) - 20);
            return `Buổi hẹn hò lãng mạn cùng ${contactName}, hâm nóng tình cảm gia đình (-20 Stress).`;
          }
        },
        {
          id: 'decline',
          label: 'Tặng Quà Bù Sau',
          costAp: 0,
          hint: 'Tiết kiệm thời gian, duy trì công việc ổn định.',
          effect() {
            return 'Bạn hẹn dịp khác sẽ bù đắp một bữa tiệc ấm cúng hơn.';
          }
        }
      ]
    };
  }

  // Default Friends / Peers
  return {
    id: `incoming_friend_${age}`,
    npcName: contactName,
    npcRole: 'Bạn thân',
    npcAvatar: '🍻',
    title: `${contactName} Rủ Hợp Tác Làm Ăn Nhỏ`,
    message: `"Tao vừa khảo sát được một mặt bằng nhỏ cạnh trường đại học rất có tiềm năng. Mày có hứng thú chung vốn $1,500 làm thử không?"`,
    options: [
      {
        id: 'accept',
        label: 'Góp Vốn $1,500 Cùng Bạn (-1 AP)',
        costAp: 1,
        costCash: 1500,
        hint: 'Cơ hội nhận lợi tức 70% hoặc bài học kinh doanh (+30 EXP).',
        effect(char) {
          char.cash = (Number(char.cash) || 0) - 1500;
          const won = getRandom() < 0.65;
          if (won) {
            char.cash += 3500;
            return `Dự án kinh doanh cùng ${contactName} có lãi lớn! Nhận về $3,500 lợi nhuận.`;
          } else {
            return `Dự án hòa vốn, nhưng bạn và ${contactName} học thêm được nhiều bài học thực chiến.`;
          }
        }
      },
      {
        id: 'decline',
        label: 'Từ Chối An Toàn',
        costAp: 0,
        hint: 'Bảo toàn tiền mặt cá nhân.',
        effect() {
          return 'Bạn lịch sự từ chối để giữ nguồn tiền mặt dự phòng an toàn.';
        }
      }
    ]
  };
}
