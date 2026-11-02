/**
 * storyChainEngine.js
 * LifeGraph v0.1 Prototype - 3 Interconnected Narrative Story Chains
 * Chain 1: Cơ nghiệp hay lời hứa? (Family Business vs Professional Career vs Succession)
 * Chain 2: Thành công và sự hiện diện (Specialist Promotion vs Family Care vs Trust)
 * Chain 3: Mái nhà và sự an toàn (Home Mortgage, Economic Shifts, Debt Resolution)
 */

import crypto from 'crypto';

export const STORY_CHAINS = {
  // =========================================================================
  // CHAIN 1: CƠ NGHIỆP HAY LỜI HỨA?
  // =========================================================================
  chain_family_business: {
    id: 'chain_family_business',
    title: 'Cơ Nghiệp Hay Lời Hứa?',
    description: 'Xung đột giữa việc gánh vác xưởng nghề của cha mẹ và hoài bão học tập chuyên môn riêng.',
    nodes: {
      // Mốc 1: Đầu đời (18 - 20 tuổi)
      node_biz_crossroads: {
        id: 'node_biz_crossroads',
        chain_id: 'chain_family_business',
        title: 'Ngã Rẽ Đầu Đời: Cửa Hàng Hay Đại Học?',
        summary: 'Cửa hàng cơ khí gia đình đang gặp khó khăn do cạnh tranh mới. Bạn vừa nhận giấy báo đỗ ngành chuyên môn tại đại học danh giá.',
        min_age: 18,
        max_age: 21,
        options: [
          {
            id: 'opt_pursue_study',
            label: 'Quyết Tâm Học Chuyên Môn',
            description: 'Tập trung học hành để trở thành chuyên gia. Gia đình phải tự xoay xở cửa hàng.',
            immediate_effects: {
              cash_delta: -3000, // Chi phí học phí
              ap_cost: 2,
              skills: { tech_logic: 1 },
              family_trust_delta: -15,
              flags_add: ['opted_academic_path']
            },
            pending_consequence: {
              delay_years: 5,
              title: 'Hệ quả lựa chọn đại học',
              description: 'Bằng cấp mở ra cơ hội làm việc tại tập đoàn lớn, nhưng cha mẹ già yếu vì gánh vác cửa hàng một mình.',
              effect: {
                income_boost: 8000,
                parent_health_delta: -20,
                flags_add: ['corporate_specialist_ready']
              }
            }
          },
          {
            id: 'opt_takeover_shop',
            label: 'Ở Lại Tiếp Quản Cửa Hàng',
            description: 'Gác lại việc học, trực tiếp cùng cha mẹ cải tổ và gánh vác sản nghiệp gia đình.',
            immediate_effects: {
              cash_delta: 1500, // Thu nhập phụ giúp cửa hàng
              ap_cost: 2,
              skills: { finance_market: 1 },
              family_trust_delta: 25,
              flags_add: ['opted_family_biz_path']
            },
            pending_consequence: {
              delay_years: 5,
              title: 'Cửa hàng vượt qua giai đoạn nguy khốn',
              description: 'Nhờ công sức của bạn, cửa hàng giữ được lượng khách quen và tạo ra dòng tiền ổn định.',
              effect: {
                business_revenue_boost: 5000,
                flags_add: ['master_craftsman_reputation']
              }
            }
          },
          {
            id: 'opt_hybrid_delegate',
            label: 'Vừa Học Vừa Thuê Quản Lý Hỗ Trợ',
            description: 'Vay một khoản nhỏ thuê thợ phụ cứng tay để duy trì cửa hàng trong khi bạn tiếp tục theo học.',
            immediate_effects: {
              cash_delta: -1500,
              debt_add: {
                name: 'Khoản vay hỗ trợ cửa hàng',
                principal: 4000,
                annual_payment: 600
              },
              ap_cost: 2,
              family_trust_delta: 5,
              flags_add: ['opted_hybrid_path']
            },
            pending_consequence: {
              delay_years: 5,
              title: 'Thử thách mô hình quản lý hỗn hợp',
              description: 'Cửa hàng không sụp đổ nhưng chi phí người ngoài cao, cần bạn đưa ra định hướng mới.',
              effect: {
                flags_add: ['hybrid_balance_tested']
              }
            }
          }
        ]
      },

      // Mốc 2: Trung niên (32 - 38 tuổi)
      node_biz_expansion: {
        id: 'node_biz_expansion',
        chain_id: 'chain_family_business',
        title: 'Cơ Hội Mở Rộng: Tăng Quy Mô Hay Gần Gũi Con Cái?',
        summary: 'Một chuỗi cung ứng đề xuất hợp tác mở rộng quy mô sản xuất, đòi hỏi bạn phải đi công tác xa nhà liên tục suốt 3 năm.',
        min_age: 32,
        max_age: 40,
        options: [
          {
            id: 'opt_expand_all_in',
            label: 'Tăng Quy Mô Toàn Lực (Làm Việc Xa)',
            description: 'Đánh đổi thời gian bên gia đình để đưa doanh nghiệp gia tộc lên quy mô hàng triệu đô.',
            immediate_effects: {
              cash_delta: -10000, // Vốn đối ứng mở rộng
              burnout_delta: 25,
              child_trust_delta: -25, // Con cái thiếu vắng sự chăm sóc
              flags_add: ['absent_entrepreneur_parent']
            },
            pending_consequence: {
              delay_years: 6,
              title: 'Thành quả kinh doanh và khoảng cách gia đình',
              description: 'Doanh nghiệp tăng trưởng mạnh tạo ra dòng tiền thụ động lớn, nhưng con cái hình thành tính cách độc lập xa cách bạn.',
              effect: {
                annual_cash_flow_boost: 12000,
                child_distance_permanent: true,
                flags_add: ['wealthy_but_distant']
              }
            }
          },
          {
            id: 'opt_maintain_scale',
            label: 'Giữ Quy Mô Vừa Phải Để Đồng Hành Cùng Con',
            description: 'Từ chối hợp đồng lớn, giữ xưởng ở mức vừa đủ để mỗi tối đều có mặt trong bữa cơm gia đình.',
            immediate_effects: {
              cash_delta: 0,
              burnout_delta: -10,
              child_trust_delta: 20,
              flags_add: ['family_first_entrepreneur']
            },
            pending_consequence: {
              delay_years: 6,
              title: 'Tình cảm gia đình bền chặt',
              description: 'Con cái xem bạn là chỗ dựa tinh thần lớn nhất và thấu hiểu giá trị của sự hy sinh thầm lặng.',
              effect: {
                child_loyalty_permanent: true,
                flags_add: ['close_knit_heir']
              }
            }
          },
          {
            id: 'opt_delegate_manager',
            label: 'Thuê Giám Đốc Điều Hành Ngoài',
            description: 'Chấp nhận chia sẻ 30% lợi nhuận để thuê người quản lý thay bạn bám công trường.',
            immediate_effects: {
              cash_delta: -4000,
              ap_cost: 1,
              burnout_delta: -5,
              flags_add: ['delegated_leadership']
            },
            pending_consequence: {
              delay_years: 6,
              title: 'Rủi ro quản trị từ người ngoài',
              description: 'Doanh nghiệp hoạt động ổn định nhưng xuất hiện thất thoát nguyên vật liệu cần chấn chỉnh.',
              effect: {
                flags_add: ['governance_challenge']
              }
            }
          }
        ]
      },

      // Mốc 3: Cuối đời (55 - 65 tuổi)
      node_succession_choice: {
        id: 'node_succession_choice',
        chain_id: 'chain_family_business',
        title: 'Trao Lại Ngọn Đuốc: Người Thừa Kế Đối Diện Cơ Nghiệp',
        summary: 'Bạn đã bước sang sườn dốc cuộc đời. Đến lúc họp gia đình để quyết định tương lai của sản nghiệp dòng họ.',
        min_age: 55,
        max_age: 70,
        options: [
          {
            id: 'opt_heir_full_takeover',
            label: 'Giao Toàn Quyền Cho Người Thừa Kế',
            description: 'Chuyển giao 100% quyền điều hành cho con cả/con thứ gánh vác cơ nghiệp.',
            immediate_effects: {
              ap_cost: 1,
              flags_add: ['heir_designated_full']
            },
            pending_consequence: {
              delay_years: 3,
              title: 'Thế hệ thứ hai chính thức cầm quyền',
              description: 'Người thừa kế mang tri thức thời đại mới vào tái cấu trúc toàn diện cơ nghiệp gia tộc.',
              effect: {
                flags_add: ['gen2_leadership_active']
              }
            }
          },
          {
            id: 'opt_respect_child_freedom',
            label: 'Tôn Trọng Quyền Tự Do (Chuyển Nhượng Doanh Nghiệp)',
            description: 'Nếu con cái muốn theo đuổi ước mơ riêng, bán lại doanh nghiệp thu về tiền mặt lập quỹ tín thác cho con.',
            immediate_effects: {
              cash_delta: 60000, // Bán doanh nghiệp
              child_trust_delta: 30,
              flags_add: ['sold_business_for_freedom']
            },
            pending_consequence: {
              delay_years: 3,
              title: 'Tự do của con và di sản tiền mặt',
              description: 'Con cái tự hào vì có người cha tôn trọng hoài bão, sử dụng quỹ tín thác để khởi nghiệp hướng đi riêng.',
              effect: {
                flags_add: ['independent_success_path']
              }
            }
          }
        ]
      }
    }
  },

  // =========================================================================
  // CHAIN 2: THÀNH CÔNG VÀ SỰ HIỆN DIỆN
  // =========================================================================
  chain_career_presence: {
    id: 'chain_career_presence',
    title: 'Thành Công & Sự Hiện Diện',
    description: 'Cuộc đấu tranh giằng xé giữa đỉnh cao sự nghiệp chuyên môn và trách nhiệm phụng dưỡng cha mẹ, chăm sóc con thơ.',
    nodes: {
      node_career_pivot: {
        id: 'node_career_pivot',
        chain_id: 'chain_career_presence',
        title: 'Lệnh Điều Động Thăng Tiến & Cơn Đau Của Cha Mẹ',
        summary: 'Bạn nhận được đề bạt lên vị trí Trưởng Khối Kỹ Thuật nhưng phải chuyển trụ sở sang thành phố khác đúng lúc cha mẹ bắt đầu đau ốm.',
        min_age: 25,
        max_age: 33,
        options: [
          {
            id: 'opt_career_first',
            label: 'Chấp Nhận Điều Động (Gửi Tiền Về Thuê Điều Dưỡng)',
            description: 'Tận dụng thời cơ vàng sự nghiệp để bứt phá thu nhập, chi trả viện phí từ xa cho cha mẹ.',
            immediate_effects: {
              cash_delta: 4000,
              skills: { tech_logic: 1, leadership_social: 1 },
              family_trust_delta: -10,
              flags_add: ['long_distance_child']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Cái giá của sự thăng tiến',
              description: 'Thu nhập tăng gấp đôi nhưng bạn bỏ lỡ những năm tháng cuối đời minh mẫn nhất của cha mẹ.',
              effect: {
                income_boost: 10000,
                regret_flag: 'missed_parent_elderly_years',
                flags_add: ['executive_track_achieved']
              }
            }
          },
          {
            id: 'opt_stay_care_parent',
            label: 'Từ Chối Thăng Chức, Ở Lại Chăm Sóc Cha Mẹ',
            description: 'Chấp nhận làm vị trí chuyên viên bình thường để mỗi ngày tan sở đều có thể qua nhà chăm sóc người thân.',
            immediate_effects: {
              cash_delta: 0,
              burnout_delta: 15,
              family_trust_delta: 30,
              flags_add: ['dutiful_caring_child']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Sự an lòng của đấng sinh thành',
              description: 'Cha mẹ ra đi trong thanh thản, gia tộc ca ngợi đức hiếu thảo của bạn, để lại phúc báo sâu dày.',
              effect: {
                karma_reward: 40,
                inner_peace_boost: 25,
                flags_add: ['filial_piety_legacy']
              }
            }
          }
        ]
      },

      node_career_harvest: {
        id: 'node_career_harvest',
        chain_id: 'chain_career_presence',
        title: 'Đỉnh Cao Danh Vọng & Bữa Cơm Độc Thoại',
        summary: 'Bạn nhận giải thưởng Doanh Nhân / Chuyên Gia Của Năm. Tại buổi tiệc vinh danh, chiếc ghế dành cho bạn đời và con cái bị bỏ trống.',
        min_age: 42,
        max_age: 52,
        options: [
          {
            id: 'opt_wake_up_call',
            label: 'Thức Tỉnh: Giảm Bớt Công Việc, Cứu Vãn Hôn Nhân',
            description: 'Chủ động từ nhiệm bớt vị trí hội đồng, đưa cả gia đình đi nghỉ dưỡng dài ngày để hàn gắn.',
            immediate_effects: {
              cash_delta: -5000,
              family_trust_delta: 25,
              burnout_delta: -20,
              flags_add: ['marriage_saved_in_time']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Mái ấm hồi sinh',
              description: 'Bạn đời tha thứ cho những năm tháng cô đơn, con cái mở lòng chia sẻ những trăn trở lập nghiệp.',
              effect: {
                flags_add: ['harmonious_golden_age']
              }
            }
          },
          {
            id: 'opt_pursue_apex',
            label: 'Tiếp Tục Leo Đỉnh: Danh Vọng Là Tất Cả',
            description: 'Xem sự vắng mặt của gia đình là cái giá tất yếu của kẻ thành công tột bậc.',
            immediate_effects: {
              cash_delta: 25000,
              family_trust_delta: -30,
              flags_add: ['cold_tycoon_alone']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Lạnh lẽo trên đỉnh danh vọng',
              description: 'Bạn sở hữu khối tài sản đồ sộ nhưng bạn đời đệ đơn ly hôn, con cái không muốn nói chuyện.',
              effect: {
                cash_delta: -40000, // Phân chia tài sản ly hôn
                flags_add: ['broken_marriage_divorced']
              }
            }
          }
        ]
      }
    }
  },

  // =========================================================================
  // CHAIN 3: MÁI NHÀ VÀ SỰ AN TOÀN
  // =========================================================================
  chain_housing_security: {
    id: 'chain_housing_security',
    title: 'Mái Nhà & Sự An Toàn',
    description: 'Quyết định đòn bẩy tài chính để sở hữu nơi an cư lạc nghiệp và đối mặt với cơn bão suy thoái kinh tế.',
    nodes: {
      node_mortgage_decision: {
        id: 'node_mortgage_decision',
        chain_id: 'chain_housing_security',
        title: 'Giấc Mơ An Cư: Vay Mua Nhà Phố Hay Tiếp Tục Thuê?',
        summary: 'Giá nhà đất bắt đầu rục rịch tăng. Bạn đứng trước lựa chọn vay 70% ngân hàng mua căn nhà đầu tiên hay tiếp tục thuê nhà giữ tiền mặt.',
        min_age: 26,
        max_age: 34,
        options: [
          {
            id: 'opt_buy_with_mortgage',
            label: 'Vay Đòn Bẩy Mua Nhà Phố (An Cư Lập Nghiệp)',
            description: 'Dồn toàn bộ tiền tiết kiệm đặt cọc 30%, vay 70% ngân hàng trả góp trong 15 năm.',
            immediate_effects: {
              cash_delta: -15000, // Tiền đối ứng
              asset_add: {
                type: 'real_estate',
                name: 'Nhà Phố An Cư Gia Đình',
                current_value: 50000,
                maintenance_cost: 300
              },
              debt_add: {
                name: 'Khoản vay thế chấp mua nhà',
                principal: 35000,
                annual_payment: 3800
              },
              family_trust_delta: 15,
              flags_add: ['homeowner_with_debt']
            },
            pending_consequence: {
              delay_years: 5,
              title: 'Sóng gió thị trường bất động sản',
              description: 'Kinh tế vĩ mô có dấu hiệu thắt chặt tín dụng, kiểm tra sức chịu đựng tài chính của gia đình bạn.',
              effect: {
                flags_add: ['macro_test_pending']
              }
            }
          },
          {
            id: 'opt_stay_renting_invest',
            label: 'Tiếp Tục Thuê Nhà & Giữ Dự Phòng Tiền Mặt',
            description: 'Tránh xa nợ nần thế chấp, dùng tiền nhàn rỗi đầu tư cổ phiếu/quỹ và duy trì dòng tiền linh hoạt.',
            immediate_effects: {
              cash_delta: 0,
              asset_add: {
                type: 'stock',
                name: 'Quỹ Đầu Tư An Toàn Chỉ Số',
                current_value: 12000,
                annual_cash_flow: 800
              },
              flags_add: ['flexible_renter_investor']
            },
            pending_consequence: {
              delay_years: 5,
              title: 'Sức mạnh của dòng tiền tự do',
              description: 'Khi thị trường biến động, bạn không chịu áp lực trả nợ ngân hàng và có tiền mặt để bắt đáy tài sản giá rẻ.',
              effect: {
                flags_add: ['cash_is_king_shield']
              }
            }
          }
        ]
      },

      node_market_shock: {
        id: 'node_market_shock',
        chain_id: 'chain_housing_security',
        title: 'Cơn Bão Lãi Suất & Thử Thách Thanh Khoản',
        summary: 'Ngân hàng trung ương tăng lãi suất đột ngột, khoản thanh toán hàng năm tăng vọt. Thu nhập từ công việc bị ảnh hưởng do làn sóng cắt giảm.',
        min_age: 35,
        max_age: 46,
        options: [
          {
            id: 'opt_austerity_repay',
            label: 'Thắt Lưng Buộc Bụng, Cắt Giảm Chi Tiêu Để Trả Dứt Điểm',
            description: 'Hủy toàn bộ chi tiêu giải trí, làm thêm ngoài giờ để bảo vệ căn nhà gia đình.',
            immediate_effects: {
              burnout_delta: 20,
              ap_cost: 1,
              debt_paydown: 8000,
              flags_add: ['austerity_survivor']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Căn nhà sạch nợ',
              description: 'Vượt qua giai đoạn lãi suất đỉnh, căn nhà tăng giá trị gấp rưỡi và thuộc quyền sở hữu trọn vẹn của bạn.',
              effect: {
                asset_value_boost: 25000,
                flags_add: ['debt_free_homeowner']
              }
            }
          },
          {
            id: 'opt_downscale_sell',
            label: 'Bán Cắt Lỗ Căn Nhà, Thu Hẹp Về Căn Hộ Nhỏ',
            description: 'Chấp nhận bán bớt tài sản để tất toán sạch nợ, dọn về chung cư vừa túi tiền.',
            immediate_effects: {
              cash_delta: 12000, // Tiền dư sau khi trả nợ ngân hàng
              burnout_delta: -15,
              flags_add: ['downscaled_clean_balance']
            },
            pending_consequence: {
              delay_years: 4,
              title: 'Thảnh thơi tài chính',
              description: 'Không còn gánh nặng nợ nần, gia đình có giấc ngủ yên ổn và ngân sách dồi dào cho con cái học hành.',
              effect: {
                flags_add: ['peaceful_solvency']
              }
            }
          }
        ]
      }
    }
  }
};

/**
 * Lấy danh sách chuỗi truyện khả dụng cho nhân vật dựa trên tuổi, cờ và trạng thái
 */
export function evaluateAvailableStoryNodes(character, activeChains = []) {
  if (!character || character.alive === false || character.is_dead) return [];
  const age = Number(character.age) || 0;
  const flags = new Set(character.hidden_flags || []);
  const available = [];

  for (const chain of Object.values(STORY_CHAINS)) {
    for (const node of Object.values(chain.nodes)) {
      // Đã giải quyết rồi thì không lặp lại
      if (flags.has(`resolved_${node.id}`)) continue;

      // Kiểm tra độ tuổi hợp lệ
      if (age >= node.min_age && age <= node.max_age) {
        // Kiểm tra tiền đề nếu có
        if (node.id === 'node_biz_expansion' && !flags.has('resolved_node_biz_crossroads')) continue;
        if (node.id === 'node_succession_choice' && !flags.has('resolved_node_biz_expansion')) continue;
        if (node.id === 'node_career_harvest' && !flags.has('resolved_node_career_pivot')) continue;
        if (node.id === 'node_market_shock' && !flags.has('resolved_node_mortgage_decision')) continue;

        available.push(node);
      }
    }
  }

  return available;
}

export const getAvailableStoryNodes = evaluateAvailableStoryNodes;

/**
 * Xử lý áp dụng lựa chọn của người chơi vào nhân vật và lên lịch hậu quả chờ
 */
export function resolveStoryDecision(character, node, optionId, currentYear) {
  const option = node.options.find(o => o.id === optionId);
  if (!option) throw new Error(`Lựa chọn không hợp lệ: ${optionId}`);

  const effects = option.immediate_effects || {};
  const historyItem = {
    year: currentYear,
    age: character.age,
    event: node.title,
    choice: option.label,
    effects_summary: []
  };

  // 1. Áp dụng Cash
  if (effects.cash_delta) {
    character.cash = Math.max(0, (Number(character.cash) || 0) + effects.cash_delta);
    historyItem.effects_summary.push(`${effects.cash_delta > 0 ? '+' : ''}$${effects.cash_delta.toLocaleString()}`);
  }

  // 2. Áp dụng Burnout
  if (effects.burnout_delta) {
    character.burnout = Math.max(0, Math.min(100, (Number(character.burnout) || 0) + effects.burnout_delta));
    historyItem.effects_summary.push(`${effects.burnout_delta > 0 ? '+' : ''}${effects.burnout_delta}% Căng Thẳng`);
  }

  // 3. Áp dụng Kỹ năng
  if (effects.skills) {
    if (!character.skills) character.skills = {};
    for (const [sKey, sLevelDelta] of Object.entries(effects.skills)) {
      if (!character.skills[sKey]) character.skills[sKey] = { level: 0, name: sKey };
      character.skills[sKey].level = Math.min(5, (character.skills[sKey].level || 0) + sLevelDelta);
    }
  }

  // 4. Ghi nhận cờ
  if (!character.hidden_flags) character.hidden_flags = [];
  character.hidden_flags.push(`resolved_${node.id}`);
  character.hidden_flags.push(`chose_${option.id}`);
  if (effects.flags_add) {
    character.hidden_flags.push(...effects.flags_add);
  }

  // 5. Lập lịch Hậu Quả Chờ (Pending Consequence)
  let scheduledConsequence = null;
  if (option.pending_consequence) {
    scheduledConsequence = {
      id: crypto.randomUUID(),
      source_decision_id: option.id,
      source_node_id: node.id,
      due_year: currentYear + (option.pending_consequence.delay_years || 5),
      title: option.pending_consequence.title,
      description: option.pending_consequence.description,
      effect: option.pending_consequence.effect || {},
      status: 'PENDING'
    };
  }

  return {
    character,
    historyItem,
    scheduledConsequence,
    newAsset: effects.asset_add || null,
    newDebt: effects.debt_add || null,
    debtPaydown: effects.debt_paydown || 0,
    familyTrustDelta: effects.family_trust_delta || 0,
    childTrustDelta: effects.child_trust_delta || 0
  };
}
