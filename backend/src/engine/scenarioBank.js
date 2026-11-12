import { getRandom } from './rng.js';
// Pre-generated Million-Combinatorial Vector Scenario Matrix Bank (LifeGraph V5 & V6)
// Spans all 5 interaction types: SPECTRUM, ILLUSION, TRILEMMA, TIME_SKIP, STANDARD
// Categorized by Life Stages with strict Age Gating and Once-in-a-Lifetime guarantees.

export const SCENARIO_MATRIX = [
  // =========================================================================
  // GIAI ĐOẠN 0: TUỔI THƠ & THIẾU NIÊN (0 - 17 TUỔI)
  // =========================================================================
  {
    id: "child_early_years",
    interaction_type: "STANDARD",
    tag: "infancy_milestone",
    min_age: 0,
    max_age: 5,
    target_vector: [0.03, 0.95, 0.01, 0.05, 0.70, 0.1],
    title: "Tiếng Khóc Đầu Đời & Vòng Tay Gia Đình",
    narrative: "Bạn đang trong những năm tháng chập chững đầu đời. Một trận sốt mọc răng giữa đêm khiến cha mẹ lo sốt vó, thức trắng đêm chườm trán cho bạn. Hơi ấm tình thân là cội nguồn nuôi dưỡng sinh mệnh non nớt.",
    options: [
      {
        id: "INF_A",
        label: "Ngoan ngoãn ngủ say trong lòng mẹ",
        action_title: "Ngoan ngoãn ngủ say trong vòng tay mẹ",
        consequence_hint: "+12 Sinh lực, +15 Nghiệp • Định hình khí chất Điềm Tĩnh, Ngoan Ngoãn",
        cost_ap: 0,
        effects: { vitality_delta: 12, karma_delta: 15, burnout_delta: -10, add_flags: ["calm_nature"] }
      },
      {
        id: "INF_B",
        label: "Khóc quấy ngằn ngặt đòi dỗ dành",
        action_title: "Khóc ré đòi bế & Khát khao sinh tồn",
        consequence_hint: "+6 Sinh lực, +8 Trí tuệ • Định hình khí chất Bướng Bỉnh, Đòi Hỏi",
        cost_ap: 0,
        effects: { vitality_delta: 6, burnout_delta: 5, add_flags: ["strong_willed"] }
      }
    ]
  },
  {
    id: "child_primary_school",
    interaction_type: "STANDARD",
    tag: "childhood_growth",
    min_age: 6,
    max_age: 12,
    target_vector: [0.09, 0.90, 0.02, 0.15, 0.65, 0.1],
    title: "Trường Lớp Đầu Tiên & Bạn Bè Trang Lứa",
    narrative: "Tiếng trống trường rộn rã khai giảng năm học mới. Thầy cô phân công bạn chăm sóc góc vườn sinh học của lớp và chia sẻ bàn học với một người bạn mới chuyển đến.",
    options: [
      {
        id: "PRI_A",
        label: "Chăm chỉ tưới cây & Giúp bạn học tập",
        action_title: "Trở thành học sinh gương mẫu",
        consequence_hint: "Rèn luyện tính kiên nhẫn, được thầy cô quý mến (+12 Thể lực, +15 Karma).",
        cost_ap: 1,
        effects: { vitality_delta: 12, karma_delta: 15, add_flags: ["diligent_child"] }
      },
      {
        id: "PRI_B",
        label: "Rủ bạn trốn ra sân bóng chơi đùa",
        action_title: "Thỏa sức nô đùa dưới nắng hè",
        consequence_hint: "Thể lực dẻo dai, tâm hồn vô tư hồn nhiên (+8 Thể lực, -15 Burnout).",
        cost_ap: 1,
        effects: { vitality_delta: 8, burnout_delta: -15, add_flags: ["playful_child"] }
      }
    ]
  },
  {
    id: "child_highschool_exam",
    interaction_type: "SPECTRUM",
    tag: "teen_study_vs_passion",
    min_age: 13,
    max_age: 17,
    target_vector: [0.15, 0.85, 0.03, 0.35, 0.60, 0.1],
    title: "Ngã Rẽ Thi Cử & Những Rung Động Tuổi Học Trò",
    narrative: "Kỳ thi chuyển cấp cận kề, gia đình kỳ vọng bạn thi đỗ trường chuyên lớp chọn. Trong khi đó, bạn ấp ủ đam mê công nghệ và những buổi sinh hoạt câu lạc bộ cùng mối tình đầu ngây thơ.",
    spectrum_data: {
      min_label: "Tập Trung Học Thêm (Trường Chuyên)",
      max_label: "Theo Đuổi Đam Mê & Tình Bạn",
      impact_metric: "burnout_vs_vitality",
      consequence_summary: "Kéo sang Trái: Điểm số cao, cha mẹ hài lòng nhưng chịu áp lực thi cử. Kéo sang Phải: Tự do khám phá nhưng phải tự lực cánh sinh."
    }
  },
  {
    id: "skip_childhood_peace",
    interaction_type: "TIME_SKIP",
    tag: "childhood_peaceful_leap",
    min_age: 1,
    max_age: 16,
    target_vector: [0.08, 0.95, 0.01, 0.10, 0.70, 0.1],
    title: "Những Năm Tháng Tuổi Thơ Vô Lo Vô Nghĩ",
    narrative: "Trôi qua 3 năm tuổi thơ êm đềm dưới mái nhà cha mẹ. Bạn lớn nhanh như thổi, được chăm sóc chu đáo, ngày ngày cắp sách tới trường và tận hưởng những bữa cơm gia đình đầm ấm.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 0,
      burnout_decay: 40,
      vitality_drift: 15,
      event_summary: "Trải qua 3 năm tuổi thơ lớn lên trong bình yên và tình yêu thương của gia đình."
    }
  },

  // =========================================================================
  // GIAI ĐOẠN 1: THANH XUÂN & BƯỚC VÀO ĐỜI (18 - 29 TUỔI)
  // =========================================================================
  {
    id: "spec_startup_burnout",
    interaction_type: "SPECTRUM",
    tag: "youth_startup_hustle",
    min_age: 18,
    max_age: 32,
    target_vector: [0.24, 0.80, 0.02, 0.60, 0.50, 0.1],
    title: "Khởi Nghiệp Bán Mạng Tuổi Hai Mươi",
    narrative: "Nhóm bạn đại học cùng lập dự án công nghệ. Nhà đầu tư thiên thần ép tiến độ hoàn thành MVP trong 30 ngày. Bạn đứng giữa hai lựa chọn: thức trắng đêm cày code đến rộc người hay duy trì nhịp sống cân bằng nhưng chấp nhận dự án chết yểu.",
    spectrum_data: {
      min_label: "Giữ Sức Khỏe (Chậm Lại)",
      max_label: "Thức Trắng Đêm (Tất Tay)",
      impact_metric: "burnout_vs_cash",
      consequence_summary: "Kéo về Phải: Thu nhập và cơ hội tăng vọt nhưng thanh xuân bị bào mòn bởi kiệt sức và stress."
    }
  },
  {
    id: "spec_passion_salary",
    interaction_type: "SPECTRUM",
    tag: "passion_vs_salary",
    min_age: 19,
    max_age: 30,
    target_vector: [0.22, 0.85, 0.01, 0.40, 0.60, 0.1],
    title: "Mức Lương Cơm Áo Hay Đam Mê Nghệ Thuật",
    narrative: "Một tập đoàn tài chính chào mời mức lương khởi điểm hậu hĩnh nhưng môi trường cực kỳ áp lực và vô hồn. Ngược lại, xưởng vẽ/studio âm nhạc bạn ao ước chỉ trả đủ tiền ăn bánh mì qua ngày.",
    spectrum_data: {
      min_label: "Chạy Theo Đam Mê (Chấp Nhận Nghèo)",
      max_label: "Bán Mình Cho Tư Bản (Lương Khủng)",
      impact_metric: "vitality_vs_wealth",
      consequence_summary: "Đánh đổi giữa sự tự do tâm hồn và khối tài sản tích lũy đầu đời."
    }
  },
  {
    id: "ill_early_fraud",
    interaction_type: "ILLUSION",
    tag: "crypto_scam_loss",
    min_age: 20,
    max_age: 32,
    once_in_a_lifetime: true,
    target_vector: [0.25, 0.70, 0.02, 0.70, 0.40, 0.2],
    title: "Cú Sốc Đa Cấp / Tiền Số Đầu Đời",
    narrative: "Dự án coin 'tiềm năng x100' mà người anh xã hội rủ rê đã rút sạch thanh khoản trong một đêm. Toàn bộ tiền tiết kiệm mấy năm làm thêm bốc hơi. Không có cơ quan nào bảo vệ, chỉ có vị đắng ngắt đầu đời.",
    illusion_data: {
      button_text: "Nuốt Nước Mắt Đứng Dậy",
      impact_hint: "Mất 40% tiền mặt, chỉ số kiệt sức tăng nhưng nhận về bài học xương máu (Karma +15).",
      drain_ratio: 0.40,
      karma_gain: 15
    }
  },
  {
    id: "ill_rental_scam",
    interaction_type: "ILLUSION",
    tag: "rental_deposit_scam",
    min_age: 18,
    max_age: 27,
    once_in_a_lifetime: true,
    target_vector: [0.20, 0.70, 0.01, 0.50, 0.40, 0.1],
    title: "Bẫy Tiền Cọc Chung Cư Mini Đầu Đời",
    narrative: "Tên 'chủ nhà ảo' ôm trọn 3 tháng tiền cọc nhà trọ rồi khóa máy biến mất. Đứng trước căn phòng bị khóa xích giữa đêm khuya, bạn cay đắng nhận ra xã hội này không hề màu hồng như trên mạng xã hội.",
    illusion_data: {
      button_text: "Tìm Chỗ Trọ Tạm & Nuốt Cay Đắng",
      impact_hint: "Mất 30% tiền mặt, chỉ số kiệt sức tăng nhưng nhận về bài học nhìn người (Karma +10).",
      drain_ratio: 0.30,
      karma_gain: 10
    }
  },
  {
    id: "ill_startup_layoff",
    interaction_type: "ILLUSION",
    tag: "startup_layoff_crisis",
    min_age: 21,
    max_age: 30,
    once_in_a_lifetime: true,
    target_vector: [0.24, 0.60, 0.02, 0.75, 0.30, 0.2],
    title: "Cắt Giảm Đột Ngột: Công Ty Khởi Nghiệp Vỡ Quỹ",
    narrative: "Công ty khởi nghiệp bất ngờ thông báo cắt giảm 70% nhân sự do quỹ đầu tư rút vốn. Bị nợ 2 tháng lương cùng lời xin lỗi lạnh lùng qua email, bạn đối mặt với áp lực hóa đơn cuối tháng.",
    illusion_data: {
      button_text: "Gom Đồ Rời Khỏi Văn Phòng",
      impact_hint: "Mất 25% tiền mặt tích lũy, tăng 20 Burnout nhưng trui rèn bản lĩnh tự lập (Karma +12).",
      drain_ratio: 0.25,
      karma_gain: 12
    }
  },
  {
    id: "ill_burnout_collapse",
    interaction_type: "ILLUSION",
    tag: "work_overload_collapse",
    min_age: 20,
    max_age: 34,
    once_in_a_lifetime: true,
    target_vector: [0.25, 0.40, 0.03, 0.90, 0.20, 0.3],
    title: "Cơn Đột Quỵ Bàn Làm Việc: Cảnh Báo Sinh Mệnh",
    narrative: "Làm thêm liên tục 3 tuần để kịp hạn chót khách hàng, mắt bạn mờ đi và ngã quỵ ngay trên bàn làm việc. Tỉnh dậy trong mùi thuốc sát trùng của phòng cấp cứu, bạn nhận ra ranh giới giữa tham vọng và sự sống mong manh đến thế nào.",
    illusion_data: {
      button_text: "Nằm Yên Truyền Dịch & Dưỡng Thần",
      impact_hint: "Mất viện phí khẩn cấp (-15% tiền), kiệt sức giảm một phần nhưng cơ thể đã có vết hằn cảnh báo (Karma +15).",
      drain_ratio: 0.15,
      karma_gain: 15
    }
  },
  {
    id: "ill_friend_joint_fail",
    interaction_type: "ILLUSION",
    tag: "friend_venture_loss",
    min_age: 22,
    max_age: 32,
    once_in_a_lifetime: true,
    target_vector: [0.26, 0.65, 0.02, 0.60, 0.50, 0.2],
    title: "Hùn Vốn Mở Quán Cùng Bạn Thân: Tan Vỡ Ước Mơ",
    narrative: "Dự án quán cà phê chung với nhóm bạn thân liên tục bù lỗ mặt bằng. Mâu thuẫn chia chác và sổ sách thiếu minh bạch khiến tình bạn nhiều năm tan vỡ, cửa hàng phải thanh lý lỗ nặng.",
    illusion_data: {
      button_text: "Ký Biên Bản Giải Thể Cửa Hàng",
      impact_hint: "Mất 35% vốn liếng đầu tư, rạn nứt bạn bè nhưng hiểu sâu sắc về nguyên tắc làm ăn (Karma +15).",
      drain_ratio: 0.35,
      karma_gain: 15
    }
  },
  {
    id: "ill_lost_laptop_data",
    interaction_type: "ILLUSION",
    tag: "harddrive_crash_data",
    min_age: 18,
    max_age: 28,
    once_in_a_lifetime: true,
    target_vector: [0.22, 0.70, 0.01, 0.65, 0.35, 0.1],
    title: "Hỏng Thiết Bị & Mất Sạch Dữ Liệu Quan Trọng",
    narrative: "Chiếc máy tính xách tay phát ra tiếng lạch cạch rồi đen ngòm. Toàn bộ tài liệu khóa luận, mã nguồn dự án và hợp đồng tự do chưa sao lưu lên đám mây đều biến mất. Bạn phải bỏ tiền cứu dữ liệu trong tuyệt vọng.",
    illusion_data: {
      button_text: "Thức Trắng Đêm Viết Lại Từ Đầu",
      impact_hint: "Mất chi phí sửa chữa khẩn cấp, chỉ số kiệt sức tăng nhưng hình thành thói quen cẩn trọng kỷ luật (Karma +10).",
      drain_ratio: 0.20,
      karma_gain: 10
    }
  },
  {
    id: "tri_career_love_study",
    interaction_type: "TRILEMMA",
    tag: "youth_trilemma",
    min_age: 21,
    max_age: 29,
    target_vector: [0.23, 0.75, 0.01, 0.50, 0.60, 0.1],
    title: "Tam Giác Tuổi 20: Du Học, Tình Đầu Hay Đi Làm Ngay",
    narrative: "Thư trúng tuyển học bổng du học toàn phần gửi đến. Cùng lúc, người yêu 4 năm đề nghị kết hôn để ổn định, còn gia đình ở quê thì cần bạn đi làm gửi tiền về phụ giúp.",
    trilemma_options: [
      {
        id: "TRI_YOUTH_A",
        action_title: "Xách Ba Lô Đi Du Học Khởi Nghiệp Bản Thân",
        consequence_hint: "Trang trải chi phí ban đầu, bươn chải vừa học vừa làm xứ người nhưng mở rộng chân trời tri thức (-4.000 USD, Burnout +20).",
        sacrifice_type: "relationship",
        effects: {
          cash_delta: -4000,
          vitality_delta: 5,
          burnout_delta: 20,
          karma_delta: 15,
          flags: ["abroad_study_hustle"],
          delayed_domino: {
            in_years: 3,
            flag: "abroad_graduation_honor",
            cash_delta: 20000,
            karma_delta: 25,
            title: "Tốt Nghiệp Thủ Khoa Du Học & Định Cư Nghề Nghiệp",
            milestone_summary: "Sau 3 năm vừa rửa bát vừa làm nghiên cứu sinh, bạn tốt nghiệp loại xuất sắc và được mời làm việc với thu nhập ổn định!"
          }
        }
      },
      {
        id: "TRI_YOUTH_B",
        action_title: "Ở Lại Kết Hôn Với Mối Tình Đầu & Lập Nghiệp Quê Hương",
        consequence_hint: "Giữ trọn lời thề son sắt, tổ chức lễ cưới giản dị và đồng lòng tích lũy tài chính (-2.000 USD, -25 Burnout, +25 Karma).",
        sacrifice_type: "cash",
        effects: {
          cash_delta: -2000,
          vitality_delta: 15,
          burnout_delta: -25,
          karma_delta: 25,
          flags: ["wedded_youth_sweetheart"],
          delayed_domino: {
            in_years: 2,
            flag: "happy_family_nest",
            karma_delta: 20,
            cash_delta: 15000,
            title: "Tổ Ấm Thuận Hòa, Kinh Tế Gia Đình Vững Bước",
            milestone_summary: "Hai vợ chồng đồng cam cộng khổ cùng quản lý chi tiêu. Mái ấm hòa thuận tích lũy được $15.000 quỹ sinh hoạt an toàn!"
          }
        }
      },
      {
        id: "TRI_YOUTH_C",
        action_title: "Cày Tiền Phụ Giúp Bố Mẹ & Trả Nợ Gia Đình",
        consequence_hint: "Làm tròn chữ hiếu, thể xác vắt kiệt làm 2 ca để gửi kiều hối/lương về nhà (+12.000 USD, -20 Vitality, +30 Burnout).",
        sacrifice_type: "vitality",
        effects: {
          cash_delta: 12000,
          vitality_delta: -20,
          burnout_delta: 30,
          karma_delta: 30,
          flags: ["filial_family_breadwinner"],
          delayed_domino: {
            in_years: 2,
            flag: "family_debt_cleared_relief",
            karma_delta: 30,
            burnout_delta: -20,
            title: "Trả Hết Món Nợ Gia Đình, Cha Mẹ Khỏe Mạnh",
            milestone_summary: "Gia đình thoát khỏi nợ nần nhờ mồ hôi nước mắt của bạn. Bố mẹ rơi nước mắt tự hào, gánh nặng tâm lý được trút bỏ!"
          }
        }
      }
    ]
  },
  {
    id: "skip_youth_grind",
    interaction_type: "TIME_SKIP",
    tag: "youth_peaceful_leap",
    min_age: 20,
    max_age: 29,
    target_vector: [0.24, 0.90, 0.03, 0.20, 0.70, 0.1],
    title: "Ba Năm Thanh Xuân Trầm Lặng Tích Lũy",
    narrative: "Không có biến động long trời lở đất. Bạn kiên trì đi làm công sở, học thêm ngoại ngữ vào buổi tối, ăn cơm quán quen. Ba năm trôi qua nhanh như một cái chớp mắt, tích lũy được tay nghề vững chãi.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 5000,
      burnout_decay: 30,
      vitality_drift: 0,
      event_summary: "Trải qua 3 năm tuổi trẻ chuyên tâm tích lũy tay nghề và tạo nền tảng."
    }
  },

  // =========================================================================
  // GIAI ĐOẠN 2: TRƯỞNG THÀNH, CƠ ĐỒ & GIA ĐÌNH (30 - 45 TUỔI)
  // =========================================================================
  {
    id: "spec_work_family",
    interaction_type: "SPECTRUM",
    tag: "career_vs_family",
    min_age: 28,
    max_age: 48,
    target_vector: [0.35, 0.70, 0.08, 0.50, 0.70, 0.2],
    title: "Bão Giá & Rạn Nứt Gia Đình",
    narrative: "Lãi suất thả nổi tăng vọt, tiền trả góp đè nặng mỗi tháng. Để bảo toàn vị thế, công ty yêu cầu bạn làm việc 14 tiếng/ngày. Vợ/chồng bạn rơi nước mắt vì những bữa cơm vắng mặt. Bạn buộc phải chọn mức độ đánh đổi.",
    spectrum_data: {
      min_label: "Bảo Vệ Gia Đình (Trượt Lại Sự Nghiệp)",
      max_label: "Tất Tay Cày Tiền (Đánh Đổi Người Thân)",
      impact_metric: "burnout_vs_affection",
      consequence_summary: "Kéo sang Trái: Giữ gia đình, giảm thu nhập. Kéo sang Phải: Đột phá tiền mặt nhưng đẩy gia đình vào đổ vỡ."
    }
  },
  {
    id: "spec_health_wealth",
    interaction_type: "SPECTRUM",
    tag: "health_vs_expansion",
    min_age: 32,
    max_age: 52,
    target_vector: [0.42, 0.55, 0.20, 0.65, 0.50, 0.3],
    title: "Bán Mạng Lấy Thị Phần",
    narrative: "Cơ hội mở rộng chuỗi chi nhánh đang ở thời điểm vàng. Nhưng huyết áp và chỉ số men gan của bạn đã ở mức báo động đỏ. Bác sĩ yêu cầu nghỉ ngơi ngay lập tức, còn đối tác hối thúc giải ngân hợp đồng triệu đô.",
    spectrum_data: {
      min_label: "Dưỡng Bệnh / Thu Hẹp Quy Mô",
      max_label: "Đốt Cháy Giai Đoạn / Cày Bất Chấp",
      impact_metric: "vitality_vs_wealth",
      consequence_summary: "Càng kéo về phía phải, tài sản tăng nhanh nhưng sinh lực và nhịp tim càng suy kiệt."
    }
  },
  {
    id: "ill_macro_recession",
    interaction_type: "ILLUSION",
    tag: "macro_catastrophe",
    min_age: 28,
    max_age: 58,
    target_vector: [0.40, 0.60, 0.15, 0.50, 0.50, 0.3],
    title: "Sóng Thần Khủng Hoảng Kinh Tế Toàn Cầu",
    narrative: "Chuỗi cung ứng đứt gãy, các ngân hàng lớn sụp đổ dây chuyền. Tài sản cổ phiếu và bất động sản của bạn bốc hơi một nửa trong đêm. Không có đàm phán, không có lối thoát. Bạn chỉ có thể bất lực nhìn dòng chảy lịch sử nghiền nát công sức nhiều năm.",
    illusion_data: {
      button_text: "Tiếp Nhận Hiện Thực Tàn Khốc",
      impact_hint: "Mất 30% tiền mặt, áp lực tâm lý tăng vọt nhưng bản năng sinh tồn được kích hoạt.",
      drain_ratio: 0.30,
      karma_gain: 10
    }
  },
  {
    id: "tri_macro_real_estate_bubble",
    interaction_type: "TRILEMMA",
    tag: "macro_catastrophe",
    min_age: 26,
    max_age: 65,
    target_vector: [0.35, 0.65, 0.10, 0.60, 0.40, 0.4],
    title: "Cơn Sốt Đất Ảo & Vỡ Bong Bóng Bất Động Sản",
    narrative: "Thị trường bất động sản đóng băng thanh khoản sau những đợt đầu cơ điên cuồng. Các ngân hàng siết chặt tín dụng, giá đất giảm không phanh. Những người ôm tài sản ngập trong nợ lãi, trong khi tiền mặt trở thành vua.",
    trilemma_options: [
      {
        id: "RE_BUBBLE_A",
        action_title: "Bán Tháo Cắt Lỗ (Bảo toàn vốn lưu động)",
        consequence_hint: "Chấp nhận lỗ 20% định giá nhưng thu về lượng tiền mặt dồi dào, giải phóng nợ vay (-$15.000, -10 Stress).",
        sacrifice_type: "cash",
        effects: { cash_delta: -15000, burnout_delta: -10, karma_delta: 5 }
      },
      {
        id: "RE_BUBBLE_B",
        action_title: "Tử Thủ Gồng Lãi (Thắt lưng buộc bụng)",
        consequence_hint: "Cắn răng trả lãi ngân hàng chờ chu kỳ mới hồi phục, bào mòn sức khỏe trầm trọng (-$30.000, HP -15, Burnout +25).",
        sacrifice_type: "vitality",
        effects: { cash_delta: -30000, vitality_delta: -15, burnout_delta: 25 }
      },
      {
        id: "RE_BUBBLE_C",
        action_title: "Ngược Dòng Bắt Đáy (Liều ăn nhiều)",
        consequence_hint: "Dốc hết tài lực gom các mảnh đất vị trí vàng bị siết nợ với giá 50%, cược vận mệnh vào tương lai (-$45.000, Karma +15).",
        sacrifice_type: "cash",
        effects: { cash_delta: -45000, burnout_delta: 15, karma_delta: 15 }
      }
    ]
  },
  {
    id: "tri_macro_crypto_stock_crash",
    interaction_type: "TRILEMMA",
    tag: "macro_catastrophe",
    min_age: 24,
    max_age: 60,
    target_vector: [0.45, 0.55, 0.15, 0.55, 0.45, 0.4],
    title: "Thiên Nga Đen: Sập Sàn Chứng Khoán & Khủng Hoảng Thanh Khoản",
    narrative: "Một tập đoàn tài chính xuyên quốc gia sụp đổ domino, bảng điện tử ngập trong sắc đỏ lau sàn nhiều tuần liền. Các quỹ đầu tư đồng loạt kích hoạt lệnh bán giải chấp tự động, cuốn phăng tài sản của hàng triệu người chơi.",
    trilemma_options: [
      {
        id: "CRASH_A",
        action_title: "Đóng Bảng Điện Tử (Không nhìn không đau)",
        consequence_hint: "Bảo toàn tâm lý bình an, coi như học phí trường đời, tập trung chuyên môn công việc chính (+10 Karma, -15 Stress).",
        sacrifice_type: "vitality",
        effects: { burnout_delta: -15, karma_delta: 10 }
      },
      {
        id: "CRASH_B",
        action_title: "Bơm Tiền Bắt Đáy Kỷ Lục (Gom cổ phiếu giá rẻ)",
        consequence_hint: "Dùng lượng tiền mặt dự phòng gom tài sản chia 3 chia 4, đối mặt rủi ro kẹp vốn dài hạn (-$20.000, +20 Karma).",
        sacrifice_type: "cash",
        effects: { cash_delta: -20000, burnout_delta: 10, karma_delta: 20 }
      },
      {
        id: "CRASH_C",
        action_title: "Cắt Toàn Bộ Danh Mục (Rút về tiền mặt trú ẩn)",
        consequence_hint: "Chấp nhận mất mát hiện tại để có giấc ngủ trọn vẹn, không còn nỗi lo thị trường (-$10.000, Vitality +10).",
        sacrifice_type: "cash",
        effects: { cash_delta: -10000, vitality_delta: 10, burnout_delta: -20 }
      }
    ]
  },
  {
    id: "tri_macro_tech_layoff_wave",
    interaction_type: "TRILEMMA",
    tag: "macro_catastrophe",
    min_age: 22,
    max_age: 55,
    target_vector: [0.50, 0.50, 0.20, 0.60, 0.40, 0.3],
    title: "Làn Sóng Sa Thải Công Nghệ & Trí Tuệ Nhân Tạo Quét Qua",
    narrative: "Các mô hình AI thế hệ mới tự động hóa hàng loạt quy trình phức tạp. Doanh nghiệp cắt giảm một nửa nhân sự để tối ưu biên lợi nhuận. Bạn và đồng nghiệp đứng trước nguy cơ mất việc hoặc phải làm gấp đôi công việc cũ.",
    trilemma_options: [
      {
        id: "LAYOFF_A",
        action_title: "Học Cấp Tốc Công Nghệ Mới (Làm chủ AI)",
        consequence_hint: "Thức trắng nhiều đêm nâng cấp kỹ năng, biến công cụ thành đòn bẩy (+15 Trí tuệ, -10 HP, Burnout +20).",
        sacrifice_type: "vitality",
        effects: { vitality_delta: -10, burnout_delta: 20, karma_delta: 15 }
      },
      {
        id: "LAYOFF_B",
        action_title: "Tự Do Khởi Nghiệp Độc Lập (Solo Builder)",
        consequence_hint: "Rời bỏ môi trường công sở, dùng kỹ năng xây dựng sản phẩm riêng kiếm thu nhập tự do (-$12.000, +25 Tự chủ).",
        sacrifice_type: "cash",
        effects: { cash_delta: -12000, burnout_delta: 5, karma_delta: 20 }
      },
      {
        id: "LAYOFF_C",
        action_title: "Chấp Nhận Giảm Lương Giữ Ghế (Ẩn mình an toàn)",
        consequence_hint: "Nhún nhường chia sẻ khó khăn với công ty, giữ nguồn thu nhập ổn định qua cơn bão kinh tế (-$8.000).",
        sacrifice_type: "cash",
        effects: { cash_delta: -8000, burnout_delta: -5, karma_delta: 5 }
      }
    ]
  },
  {
    id: "tri_macro_inflation_spike",
    interaction_type: "TRILEMMA",
    tag: "macro_catastrophe",
    min_age: 20,
    max_age: 70,
    target_vector: [0.40, 0.60, 0.10, 0.50, 0.50, 0.3],
    title: "Bão Giá Năng Lượng & Siêu Lạm Phát Phi Mã",
    narrative: "Chi phí xăng dầu, điện nước và thực phẩm tăng chóng mặt từng ngày. Tiền lương không đuổi kịp giá cả ngoài chợ. Chiếc bánh mỳ hay bát phở quen thuộc đều tăng giá gấp đôi khiến ngân sách gia đình đảo lộn.",
    trilemma_options: [
      {
        id: "INFLATION_A",
        action_title: "Cắt Giảm Tiêu Dùng Tối Đa (Lối sống khắc kỷ)",
        consequence_hint: "Tự nấu ăn tại nhà, hủy toàn bộ dịch vụ giải trí xa xỉ, bảo toàn tiền tiết kiệm (-10 Hạnh phúc, +10 Ý chí).",
        sacrifice_type: "vitality",
        effects: { burnout_delta: 5, karma_delta: 10 }
      },
      {
        id: "INFLATION_B",
        action_title: "Mua Vàng & Tài Sản Hiện Vật Trú Ẩn",
        consequence_hint: "Đổi tiền mặt lấy vàng tích lũy chống trượt giá, bảo toàn sức mua đường dài (-$15.000 vốn lưu động, +15 Điềm tĩnh).",
        sacrifice_type: "cash",
        effects: { cash_delta: -15000, burnout_delta: -10, karma_delta: 15 }
      },
      {
        id: "INFLATION_C",
        action_title: "Gia Tăng Làm Thêm Nghề Tay Trái",
        consequence_hint: "Chạy xe ôm công nghệ hoặc nhận thêm việc buổi tối để bù đắp thâm hụt (+ $6.000 tiền mặt, HP -12, Burnout +22).",
        sacrifice_type: "vitality",
        effects: { cash_delta: 6000, vitality_delta: -12, burnout_delta: 22 }
      }
    ]
  },
  {
    id: "tri_existential_crossroad",
    interaction_type: "TRILEMMA",
    tag: "impossible_triangle",
    min_age: 30,
    max_age: 50,
    target_vector: [0.38, 0.60, 0.10, 0.70, 0.50, 0.3],
    title: "Tam Giác Bất Khả Thi: Sự Nghiệp, Thể Lực Hay Tình Nghĩa",
    narrative: "Dự án tâm huyết đang đối mặt nguy cơ sụp đổ nếu thiếu bạn chèo lái 24/7. Cùng lúc, cơ thể bạn xuất hiện triệu chứng xuất huyết dạ dày, và người bạn đời đang đệ đơn ly thân vì bị bỏ rơi quá lâu. Bạn CHỈ CÓ THỂ cứu vãn 2 thứ, buộc phải buông bỏ 1 thứ.",
    trilemma_options: [
      {
        id: "TRI_A",
        action_title: "Hy sinh Tài chính (Bỏ dự án)",
        consequence_hint: "Cứu vãn hôn nhân và sức khỏe, chấp nhận mất tiền và thụt lùi sự nghiệp.",
        sacrifice_type: "cash",
        effects: { cash_delta: -35000, vitality_delta: 20, burnout_delta: -30 }
      },
      {
        id: "TRI_B",
        action_title: "Hy sinh Thể xác (Bán máu cứu vãn)",
        consequence_hint: "Giữ được tiền và người thân, nhưng cơ thể bị tàn phá suy kiệt cận kề đột quỵ.",
        sacrifice_type: "vitality",
        effects: { cash_delta: 25000, vitality_delta: -35, burnout_delta: 40 }
      },
      {
        id: "TRI_C",
        action_title: "Hy sinh Tình nghĩa (Cắt đứt gia đình)",
        consequence_hint: "Tập trung tối đa cho bản thân và tiền bạc, ký đơn ly hôn, trở thành kẻ cô độc.",
        sacrifice_type: "relationship",
        effects: { cash_delta: 40000, vitality_delta: -10, burnout_delta: 10, karma_delta: -20 }
      }
    ]
  },
  {
    id: "tri_spouse_startup_dream",
    interaction_type: "TRILEMMA",
    tag: "spouse_venture_crossroad",
    min_age: 30,
    max_age: 48,
    target_vector: [0.45, 0.55, 0.20, 0.60, 0.45, 0.4],
    title: "Tiếng Gọi Khởi Nghiệp Của Người Bạn Đời",
    narrative: "Người bạn đời sau cả thập kỷ hy sinh làm hậu phương nay ấp ủ ước mơ dồn toàn bộ tiền tiết kiệm gia đình để thành lập xưởng thiết kế / chuỗi kinh doanh riêng. Bạn đứng trước ba ngã rẽ định đoạt hạnh phúc lứa đôi.",
    trilemma_options: [
      {
        id: "TRI_SPOUSE_A",
        action_title: "Toàn Lực Đặt Cược (Cầm cố tài sản)",
        consequence_hint: "Ủng hộ trọn vẹn tình nghĩa vợ chồng, chấp nhận rủi ro tài chính lớn (-$25.000, Hạnh phúc +35, Karma +20).",
        sacrifice_type: "cash",
        effects: { cash_delta: -25000, burnout_delta: 10, karma_delta: 20 }
      },
      {
        id: "TRI_SPOUSE_B",
        action_title: "Từ Chối Dứt Khoát (Bảo toàn tích lũy)",
        consequence_hint: "Giữ an toàn dòng tiền gia đình, nhưng dập tắt ước mơ của bạn đời khiến hôn nhân rạn nứt sâu sắc.",
        sacrifice_type: "relationship",
        effects: { cash_delta: 0, burnout_delta: 15, karma_delta: -15 }
      },
      {
        id: "TRI_SPOUSE_C",
        action_title: "Đồng Hành Điều Hành (Cùng chịu trách nhiệm)",
        consequence_hint: "Tận dụng kỹ năng chuyên môn của bạn để cùng khởi nghiệp, vừa giữ vốn vừa cày kiệt sức.",
        sacrifice_type: "vitality",
        effects: { cash_delta: -10000, vitality_delta: -15, burnout_delta: 25, karma_delta: 15 }
      }
    ]
  },
  {
    id: "tri_child_scholarship_abroad",
    interaction_type: "TRILEMMA",
    tag: "child_destiny_crossroad",
    min_age: 42,
    max_age: 58,
    target_vector: [0.50, 0.50, 0.30, 0.65, 0.55, 0.3],
    title: "Cánh Cổng Du Học Của Con Hay Quỹ Dưỡng Già",
    narrative: "Đứa con mà bạn dốc lòng nuôi nấng bất ngờ đỗ học bổng tinh hoa tại viện đại học hàng đầu thế giới. Tuy nhiên, phí sinh hoạt và bảo lãnh tài chính quốc tế đòi hỏi ngay một khoản tiền khổng lồ vượt quá dự trù.",
    trilemma_options: [
      {
        id: "TRI_CHILD_A",
        action_title: "Thanh Lý Tài Sản Mở Lối Tương Lai Cho Con",
        consequence_hint: "Chấp nhận bán bớt cổ phiếu/bất động sản, dồn toàn lực chắp cánh cho con bay xa (-$35.000, Karma +35).",
        sacrifice_type: "cash",
        effects: { cash_delta: -35000, burnout_delta: -15, karma_delta: 35 }
      },
      {
        id: "TRI_CHILD_B",
        action_title: "Ép Con Học Đại Học Trong Nước",
        consequence_hint: "Giữ trọn quỹ hưu trí và căn nhà, nhưng ánh mắt đứa con nhìn bạn vĩnh viễn mang sự oán trách cay đắng.",
        sacrifice_type: "relationship",
        effects: { cash_delta: 5000, burnout_delta: 15, karma_delta: -25 }
      },
      {
        id: "TRI_CHILD_C",
        action_title: "Vay Nợ Gia Tộc & Cày Bạt Mạng Nuôi Con",
        consequence_hint: "Đứng ra bảo lãnh vay nợ đòn bẩy, làm thêm ngày đêm để vừa giữ nhà vừa lo cho con ăn học.",
        sacrifice_type: "vitality",
        effects: { cash_delta: -15000, vitality_delta: -25, burnout_delta: 35, karma_delta: 20 }
      }
    ]
  },
  {
    id: "tri_sibling_ancestral_land",
    interaction_type: "TRILEMMA",
    tag: "ancestral_heritage_crossroad",
    min_age: 48,
    max_age: 68,
    target_vector: [0.55, 0.45, 0.25, 0.70, 0.60, 0.3],
    title: "Tranh Chấp Mảnh Đất Tổ Tiên & Tình Máu Mủ",
    narrative: "Khu đất hương hỏa từ đường nhiều đời của gia tộc bất ngờ lọt vào quy hoạch khu đô thị mới, giá trị tăng gấp 10 lần. Anh em trong họ bắt đầu lục đục chia phe: nhóm muốn bán sạch chia tiền mặt, nhóm muốn giữ đất thờ tự.",
    trilemma_options: [
      {
        id: "TRI_LAND_A",
        action_title: "Dốc Tiền Túi Mua Lại Phần Anh Em Để Giữ Đất",
        consequence_hint: "Gánh vác toàn bộ để giữ trọn mộ phần tiền nhân. Tổn thất tiền bạc lớn nhưng trở thành trụ cột gia tộc (+45 Karma).",
        sacrifice_type: "cash",
        effects: { cash_delta: -40000, burnout_delta: 15, karma_delta: 45 }
      },
      {
        id: "TRI_LAND_B",
        action_title: "Đồng Ý Bán Sạch Chia Đều Tiền Mặt",
        consequence_hint: "Nhận về món tiền kếch xù giải quyết mọi nợ nần, nhưng mang tiếng bất hiếu với tổ tông dòng họ.",
        sacrifice_type: "karma",
        effects: { cash_delta: 65000, burnout_delta: -20, karma_delta: -35 }
      },
      {
        id: "TRI_LAND_C",
        action_title: "Khởi Kiện Tranh Chấp Quyền Thừa Kế Tại Tòa",
        consequence_hint: "Nhờ pháp luật can thiệp phân xử. Vụ kiện kéo dài nhiều năm, anh em từ mặt nhau, sức khỏe hao mòn.",
        sacrifice_type: "vitality",
        effects: { cash_delta: -12000, vitality_delta: -20, burnout_delta: 40, karma_delta: -15 }
      }
    ]
  },
  {
    id: "skip_peaceful_groove",
    interaction_type: "TIME_SKIP",
    tag: "peaceful_hiatus",
    min_age: 28,
    max_age: 48,
    target_vector: [0.35, 0.80, 0.08, 0.20, 0.60, 0.1],
    title: "Ba Năm Bình Lặng Trôi Qua...",
    narrative: "Không có biến cố dữ dội nào ập đến. Cuộc sống của bạn vận hành như một cỗ máy nhịp nhàng: sáng đi làm, tối trở về bên mâm cơm ấm cúng, ngày qua ngày. Thời gian lặng lẽ bòn rút thanh xuân nhưng đem lại cho bạn sự an yên hiếm có.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 6000,
      burnout_decay: 25,
      vitality_drift: -3,
      event_summary: "Trải qua 3 năm tích lũy bền bỉ và ổn định cuộc sống gia đình."
    }
  },

  // =========================================================================
  // GIAI ĐOẠN 3: TRUNG NIÊN & SÓNG GIÓ CUỘC ĐỜI (46 - 59 TUỔI)
  // =========================================================================
  {
    id: "ill_parent_passing",
    interaction_type: "ILLUSION",
    tag: "family_bereavement",
    min_age: 42,
    max_age: 60,
    once_in_a_lifetime: true, // STRICTLY ONCE!
    target_vector: [0.52, 0.55, 0.10, 0.60, 0.80, 0.3],
    title: "Hơi Thở Cuối Cùng Của Đấng Sinh Thành",
    narrative: "Chuông điện thoại reo vang lúc rạng sáng từ bệnh viện. Mẹ của bạn đã thanh thản trút hơi thở cuối cùng trong giấc ngủ. Giữa căn phòng tang lễ vắng lặng, mọi hào quang thành công hay bạc vàng bỗng trở nên vô nghĩa.",
    illusion_data: {
      button_text: "Tiễn Đưa Người Về Cõi Vĩnh Hằng",
      impact_hint: "Mất đi điểm tựa gia đình, tích lũy sự trưởng thành đau đớn, Karma +25.",
      drain_ratio: 0.10,
      karma_gain: 25
    }
  },
  {
    id: "spec_corporate_politics",
    interaction_type: "SPECTRUM",
    tag: "boardroom_power_struggle",
    min_age: 46,
    max_age: 62,
    target_vector: [0.54, 0.50, 0.40, 0.65, 0.40, 0.4],
    title: "Đấu Đá Quyền Lực Ở Tầng Lớp Thượng Tầng",
    narrative: "Thế hệ lãnh đạo trẻ đang rắp tâm đẩy bạn ra khỏi Hội đồng quản trị. Bạn có thể sử dụng các đòn bẩy pháp lý và quan hệ ngầm để triệt hạ đối thủ, hoặc buông tay rút về làm cố vấn danh dự trong yên bình.",
    spectrum_data: {
      min_label: "Rút Lui An Toàn (Làm Cố Vấn)",
      max_label: "Thanh Trừng Quyết Liệt (Giữ Quyền Lực)",
      impact_metric: "burnout_vs_cash",
      consequence_summary: "Kéo sang Trái: Giữ thanh thản tâm trí nhưng mất ghế chỉ đạo. Kéo sang Phải: Giành trọn quyền lực nhưng chuốc lấy thù hận và mất ngủ triền miên."
    }
  },
  {
    id: "tri_midlife_crisis",
    interaction_type: "TRILEMMA",
    tag: "midlife_turmoil",
    min_age: 45,
    max_age: 58,
    target_vector: [0.50, 0.55, 0.15, 0.70, 0.50, 0.3],
    title: "Cơn Khủng Hoảng Tuổi Ngũ Tuần",
    narrative: "Cơ thể bắt đầu xuất hiện những cơn đau ngực ngắt quãng. Con cái bước vào tuổi dậy thì ngỗ nghịch, còn công ty đang đứng trước đợt cắt giảm 40% nhân sự cấp cao.",
    trilemma_options: [
      {
        id: "TRI_MID_A",
        action_title: "Cứu Vãn Con Cái (Nghỉ việc đồng hành)",
        consequence_hint: "Cứu vãn tương lai của con, nhưng mất vị trí giám đốc và mất $40k thu nhập năm.",
        sacrifice_type: "cash",
        effects: { cash_delta: -40000, vitality_delta: 15, burnout_delta: -20, karma_delta: 25 }
      },
      {
        id: "TRI_MID_B",
        action_title: "Bám Trụ Ghế Nóng (Giao con cho gia sư)",
        consequence_hint: "Bảo toàn vị thế tài phiệt nhưng khoảng cách với con cái vĩnh viễn không thể hàn gắn.",
        sacrifice_type: "relationship",
        effects: { cash_delta: 50000, vitality_delta: -15, burnout_delta: 30, karma_delta: -20 }
      },
      {
        id: "TRI_MID_C",
        action_title: "Nhập Viện Dưỡng Bệnh Khẩn Cấp",
        consequence_hint: "Tạm dừng mọi thứ cứu lấy mạng sống trước nguy cơ đột quỵ cận kề.",
        sacrifice_type: "vitality",
        effects: { cash_delta: -20000, vitality_delta: 30, burnout_delta: -40, karma_delta: 10 }
      }
    ]
  },
  {
    id: "skip_midlife_zen",
    interaction_type: "TIME_SKIP",
    tag: "midlife_peace",
    min_age: 46,
    max_age: 58,
    target_vector: [0.50, 0.70, 0.20, 0.15, 0.70, 0.2],
    title: "Ba Năm Nhịp Sống Chậm Lại Của Tuổi Ngũ Tuần",
    narrative: "Sau bao năm giông bão nơi thương trường, bạn tìm thấy niềm vui trong những tách trà sớm và sách cũ. Con cái dần tự lập, dòng tiền thụ động đều đặn chảy về tài khoản.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 8000,
      burnout_decay: 35,
      vitality_drift: -4,
      event_summary: "Trôi qua 3 năm trung niên tĩnh lặng và phục hồi tâm trí."
    }
  },

  // =========================================================================
  // GIAI ĐOẠN 4: TUỔI XẾ CHIỀU, NGHỈ HƯU & CHUYỂN GIAO (60 - 74 TUỔI)
  // =========================================================================
  {
    id: "spec_estate_distribution",
    interaction_type: "SPECTRUM",
    tag: "inheritance_planning",
    min_age: 60,
    max_age: 76,
    target_vector: [0.66, 0.45, 0.30, 0.40, 0.75, 0.3],
    title: "Lập Di Chúc & Phân Chia Gia Sản Cho Con Cháu",
    narrative: "Ở tuổi gần thất thập, các con bắt đầu thăm dò về khối tài sản bạn đang nắm giữ. Nếu chia sớm, bạn sợ chúng ỷ lại lười biếng hoặc hắt hủi cha mẹ già. Nếu giữ chặt, anh em trong nhà ngấm ngầm kèn cựa mặt bằng tranh chấp.",
    spectrum_data: {
      min_label: "Giữ Trọn Đến Hơi Thở Cuối (Khóa Tài Sản)",
      max_label: "Chuyển Giao Hết Cho Con Cháu (Sống Tùy Nghi)",
      impact_metric: "affection_vs_security",
      consequence_summary: "Kéo sang Trái: Bảo đảm quyền lực tài chính tự thân. Kéo sang Phải: Trao quyền cho thế hệ sau nhưng đối mặt sự phụ thuộc hoàn toàn."
    }
  },
  {
    id: "ill_friend_passing",
    interaction_type: "ILLUSION",
    tag: "peer_bereavement",
    min_age: 60,
    max_age: 80,
    once_in_a_lifetime: true,
    target_vector: [0.65, 0.40, 0.25, 0.50, 0.80, 0.3],
    title: "Tiếng Chuông Tang Của Bạn Tri Kỷ Cùng Thời",
    narrative: "Người bạn thân nhất từng cùng bạn chia nhau gói mì tôm thời trẻ đã đột ngột qua đời vì bệnh tim. Đứng trước linh cữu người bạn cùng trang lứa, bạn giật mình nhận ra hàng ghế thời thanh xuân đang vơi dần từng người một.",
    illusion_data: {
      button_text: "Thắp Nén Nhang Tiễn Bạn",
      impact_hint: "Cảm nhận sâu sắc sự vô thường của kiếp người, giảm ham muốn tiền tài, Karma +20.",
      karma_gain: 20
    }
  },
  {
    id: "tri_retirement_dilemma",
    interaction_type: "TRILEMMA",
    tag: "elderly_health_struggle",
    min_age: 62,
    max_age: 78,
    target_vector: [0.68, 0.35, 0.20, 0.60, 0.60, 0.4],
    title: "Ngã Rẽ Bệnh Viện Tuổi Thất Thập",
    narrative: "Khớp gối thoái hóa nặng và bệnh lý tim mạch khiến việc tự sinh hoạt trở nên bất khả thi. Bạn cần một giải pháp lâu dài cho những năm tháng còn lại của cuộc đời.",
    trilemma_options: [
      {
        id: "TRI_ELD_A",
        action_title: "Vào Viện Dưỡng Lão Cao Cấp",
        consequence_hint: "Tốn $60k tiền túi, không làm phiền con cháu, nhưng mang nỗi cô đơn tuổi già.",
        sacrifice_type: "cash",
        effects: { cash_delta: -60000, vitality_delta: 15, burnout_delta: -15, karma_delta: 10 }
      },
      {
        id: "TRI_ELD_B",
        action_title: "Chuyển Về Sống Chung Cùng Con Gái",
        consequence_hint: "Được gần gũi cháu thơ, nhưng chịu đựng sự khó chịu từ con rể và xung đột sinh hoạt.",
        sacrifice_type: "relationship",
        effects: { cash_delta: -10000, vitality_delta: -10, burnout_delta: 25, karma_delta: 15 }
      },
      {
        id: "TRI_ELD_C",
        action_title: "Thuê Điều Dưỡng Riêng Tại Nhà",
        consequence_hint: "Giữ được căn nhà kỷ niệm, nhưng chi phí bào mòn liên tục mỗi tháng.",
        sacrifice_type: "vitality",
        effects: { cash_delta: -35000, vitality_delta: 10, burnout_delta: -10 }
      }
    ]
  },
  {
    id: "skip_elderly_garden",
    interaction_type: "TIME_SKIP",
    tag: "elderly_peaceful_leisure",
    min_age: 60,
    max_age: 75,
    target_vector: [0.65, 0.45, 0.15, 0.10, 0.85, 0.1],
    title: "Ba Năm Thảnh Thơi Bên Vườn Hoa Tuổi Già",
    narrative: "Mỗi sáng ngắm hoa lan nở, chiều dạo bộ quanh công viên cùng các cụ ông cụ bà lối xóm. Tiếng cười của đứa cháu nội làm căn nhà rộn rã. Cơ thể tuy có chậm chạp đi nhưng tâm hồn hoàn toàn tĩnh tại.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 4000,
      burnout_decay: 40,
      vitality_drift: -5,
      event_summary: "Trải qua 3 năm tuổi già an nhàn, sum vầy cùng cháu chắt."
    }
  },
  {
    id: "spec_charity_legacy",
    interaction_type: "SPECTRUM",
    tag: "charity_endowment",
    min_age: 63,
    max_age: 82,
    target_vector: [0.70, 0.40, 0.45, 0.30, 0.90, 0.3],
    title: "Quỹ Khuyến Học Hay Di Sản Gia Đình",
    narrative: "Trường cũ ngỏ lời mời bạn thành lập quỹ học bổng mang tên mình để nâng đỡ các sinh viên nghèo vượt khó. Quyết định này sẽ cắt bớt phần thừa kế mà các con bạn đang ngày đêm trông đợi.",
    spectrum_data: {
      min_label: "Giữ Trọn Cho Con (Ưu Tiên Gia Tộc)",
      max_label: "Hiến Tặng Xã Hội (Lưu Danh Sử Sách)",
      impact_metric: "karma_vs_cash",
      consequence_summary: "Kéo sang Trái: Giữ tiền cho con cháu. Kéo sang Phải: Tích lũy đại nghiệp lực (Karma vọt tăng) nhưng con cái bất mãn ra mặt."
    }
  },

  // =========================================================================
  // GIAI ĐOẠN 5: HOÀNG HÔN CUỘC ĐỜI & BẾN BỜ TỬ THẦN (75 - 100+ TUỔI)
  // =========================================================================
  {
    id: "ill_alzheimer_onset",
    interaction_type: "ILLUSION",
    tag: "memory_fading_decay",
    min_age: 75,
    max_age: 105,
    once_in_a_lifetime: true,
    target_vector: [0.82, 0.30, 0.20, 0.40, 0.70, 0.5],
    title: "Màn Sương Trí Nhớ & Dòng Ký Ức Phai Mờ",
    narrative: "Đôi khi bạn ngơ ngác không nhận ra căn nhà mình đang ở. Bạn nhầm lẫn tên các con với những người bạn thuở ấu thơ. Dòng chảy ký ức cả đời đang dần tan thành làn khói trắng xóa, chỉ còn lại ánh hoàng hôn lặng lẽ ngoài hiên.",
    illusion_data: {
      button_text: "Ôm Lấy Những Mảnh Ghép Cuối Cùng",
      impact_hint: "Trí nhớ phai mờ, buông bỏ mọi tham vọng vật chất, thanh thản bước vào chặng cuối kiếp người.",
      karma_gain: 25
    }
  },
  {
    id: "ill_spouse_passing",
    interaction_type: "ILLUSION",
    tag: "spouse_bereavement",
    min_age: 70,
    max_age: 95,
    once_in_a_lifetime: true,
    target_vector: [0.78, 0.35, 0.20, 0.60, 0.85, 0.4],
    title: "Buông Tay Người Bạn Đời Nửa Thế Kỷ",
    narrative: "Bàn tay nhăn nheo của người bạn đời từng cùng bạn vượt qua bao sóng gió nay đã lạnh dần trong phòng cấp cứu. Nửa thế kỷ đồng cam cộng khổ khép lại bằng một hơi thở nhẹ tựa lông hồng. Căn nhà rộng lớn giờ chỉ còn lại một chiếc bóng cô đơn.",
    illusion_data: {
      button_text: "Hẹn Gặp Lại Ở Kiếp Sau",
      impact_hint: "Cắt đứt sợi dây ràng buộc lớn nhất của trần thế, Karma +30.",
      karma_gain: 30
    }
  },
  {
    id: "spec_icu_will",
    interaction_type: "SPECTRUM",
    tag: "end_of_life_care",
    min_age: 76,
    max_age: 110,
    target_vector: [0.86, 0.20, 0.15, 0.50, 0.80, 0.5],
    title: "Bệnh Phòng Hồi Sức Cấp Cứu (ICU): Can Thiệp Hay Buông Xả",
    narrative: "Bác sĩ trưởng khoa đưa bản cam kết can thiệp máy thở và ép tim lồng ngực. Nếu tiếp tục dùng các thiết bị hiện đại, bạn có thể kéo dài sự sống thêm vài tháng nhưng cơ thể phải chịu vô vàn đau đớn.",
    spectrum_data: {
      min_label: "Để Tự Nhiên (Ra Đi Thanh Thản)",
      max_label: "Can Thiệp Tối Đa (Kéo Dài Hơi Thở)",
      impact_metric: "vitality_vs_burnout",
      consequence_summary: "Đánh đổi giữa vài tuần hơi thở mong manh bằng máy móc và sự an nghỉ nhẹ nhàng không đau đớn."
    }
  },
  {
    id: "tri_twilight_resolution",
    interaction_type: "TRILEMMA",
    tag: "twilight_legacy_peace",
    min_age: 75,
    max_age: 105,
    target_vector: [0.85, 0.25, 0.25, 0.30, 0.90, 0.3],
    title: "Tâm Nguyện Cuối Cùng Trước Ngưỡng Cửa Sinh Tử",
    narrative: "Sức lực đã cạn kiệt, bạn biết ngày giờ của mình không còn nhiều. Trước khi nhắm mắt xuôi tay, đâu là tâm nguyện cháy bỏng nhất bạn muốn hoàn thành?",
    trilemma_options: [
      {
        id: "TRI_TWI_A",
        action_title: "Hòa Giải Với Đứa Con Xa Xứ",
        consequence_hint: "Gọi điện trút bỏ mọi hận thù quá khứ, giải thoát tâm linh (Karma +40).",
        sacrifice_type: "relationship",
        effects: { burnout_delta: -40, karma_delta: 40 }
      },
      {
        id: "TRI_TWI_B",
        action_title: "Ký Tặng Toàn Bộ Di Sản Cho Xã Hội",
        consequence_hint: "Tặng sạch tiền mặt cho trại trẻ mồ côi, không giữ lại một đồng bạc trần gian.",
        sacrifice_type: "cash",
        effects: { cash_delta: -9999999, karma_delta: 50 }
      },
      {
        id: "TRI_TWI_C",
        action_title: "Tĩnh Lặng Lắng Nghe Hơi Thở",
        consequence_hint: "Không phiền lụy nhân gian, tĩnh tâm buông xả mọi duyên trần.",
        sacrifice_type: "vitality",
        effects: { vitality_delta: -15, burnout_delta: -50, karma_delta: 30 }
      }
    ]
  },
  {
    id: "skip_twilight_breath",
    interaction_type: "TIME_SKIP",
    tag: "twilight_peaceful_drift",
    min_age: 75,
    max_age: 105,
    target_vector: [0.88, 0.22, 0.10, 0.10, 0.95, 0.1],
    title: "Ba Năm Hoàng Hôn Yên Ả Bên Khung Cửa Sổ",
    narrative: "Thời gian trôi qua nhẹ nhàng như bóng mây qua thềm. Bạn ngồi bên khung cửa quen thuộc, nhấp từng ngụm nước ấm, nhìn lũ chim sẻ nhảy nhót trên cành bàng. Mọi được mất của cuộc đời hóa thành nụ cười bao dung.",
    time_skip_data: {
      years_jump: 3,
      yearly_income_save: 1000,
      burnout_decay: 50,
      vitality_drift: -8,
      event_summary: "Trải qua 3 năm tuổi già tĩnh tại, hòa mình vào sự vô vi của vạn vật."
    }
  },

  // =========================================================================
  // BIGDATA ASPIRATION-DRIVEN & SINE WAVE CLIMAX SCENARIOS
  // =========================================================================
  {
    id: "tri_scholar_crossroads",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["scholar_sage"],
    tag: "youth_scholar_climax",
    min_age: 18,
    max_age: 26,
    target_vector: [0.15, 0.85, 0.30, 0.20, 0.80, 0.2],
    title: "Tam Giác Định Mệnh: Nghiên Cứu Sinh, Thử Việc Big Tech hay Mái Ấm Giảng Viên?",
    narrative: "Bạn đứng trước ngã rẽ lớn của tuổi trẻ: Nhận học bổng toàn phần Tiến sĩ tại ĐH danh giá, lời mời làm Kỹ sư tập sự thử việc ở Thung Lũng Silicon, hay ở lại kết hôn và trở thành Giảng viên uy tín nơi quê nhà.",
    trilemma_options: [
      {
        id: "SCH_A",
        action_title: "Nghiên Cứu Sinh Viện Hàn Lâm (Học Bổng Toàn Phần)",
        consequence_hint: "Miễn 100% học phí, nhận trợ cấp sinh hoạt $3.500/tháng ở Ký túc xá, dồn tâm sức viết luận án (+25 Karma, +15 Stress).",
        sacrifice_type: "relationship",
        effects: {
          karma_delta: 25,
          burnout_delta: 15,
          cash_delta: 3500,
          flags: ["stanford_phd_scholar"],
          new_city: "California (ĐH Stanford, Hoa Kỳ)",
          new_housing: { name: "Ký túc xá ĐH Stanford", tier: 2, status: "rented" },
          occupation: "Nghiên cứu sinh Tiến sĩ",
          delayed_domino: {
            in_years: 3,
            flag: "doctoral_defense_passed",
            karma_delta: 35,
            cash_delta: 25000,
            occupation: "Tiến sĩ Viện Hàn Lâm",
            title: "Bảo Vệ Thành Công Luận Án Tiến Sĩ",
            milestone_summary: "Công trình nghiên cứu AI của bạn được công bố trên tạp chí khoa học quốc tế. Bạn chính thức nhận bằng Tiến sĩ và được mời làm Nghiên cứu viên cao cấp!"
          }
        }
      },
      {
        id: "SCH_B",
        action_title: "Thử Việc Kỹ Sư Tập Sự Big Tech (Thung Lũng Silicon)",
        consequence_hint: "Chuyển tới San Francisco với chi phí đắt đỏ, nhận trợ cấp thực tập sinh $5.000, cày 70h/tuần vượt qua thử việc để ký hợp đồng chính thức (+5.000 USD, Burnout +30).",
        sacrifice_type: "vitality",
        effects: {
          cash_delta: 5000,
          burnout_delta: 30,
          flags: ["bigtech_probation_period"],
          new_city: "San Francisco (Silicon Valley, Hoa Kỳ)",
          new_housing: { name: "Căn hộ ghép phòng San Francisco", tier: 2, status: "rented" },
          occupation: "Kỹ sư Thực tập sinh Big Tech",
          delayed_domino: {
            in_years: 2,
            flag: "bigtech_senior_confirmed",
            cash_delta: 75000,
            burnout_delta: 15,
            occupation: "Kỹ sư AI Chính thức (Big Tech)",
            title: "Kỳ Đánh Giá Thử Việc Big Tech Hoàn Tất",
            milestone_summary: "Sau 2 năm cày cuốc ngày đêm, năng lực chuyên môn của bạn được hội đồng công nhận: Thăng cấp Kỹ sư chính thức kèm gói thưởng cổ phiếu $75.000!"
          }
        }
      },
      {
        id: "SCH_C",
        action_title: "Ở Lại Kết Hôn & Làm Giảng Viên Địa Phương",
        consequence_hint: "Trân trọng hạnh phúc gia đình giản dị, truyền lửa tri thức cho thế hệ trẻ quê nhà (Hạnh phúc +30, Karma +25).",
        sacrifice_type: "cash",
        effects: {
          karma_delta: 25,
          burnout_delta: -25,
          cash_delta: 8000,
          flags: ["local_mentor_spouse"],
          occupation: "Giảng viên Đại học địa phương",
          delayed_domino: {
            in_years: 2,
            flag: "local_community_pillar",
            karma_delta: 25,
            cash_delta: 15000,
            title: "Uy Tín Giảng Dạy & Tình Nghĩa Quê Hương",
            milestone_summary: "Học trò bạn dìu dắt đạt giải thưởng nghiên cứu. Mái ấm gia đình hòa thuận, bạn được tín nhiệm làm Trưởng bộ môn!"
          }
        }
      }
    ]
  },

  // =========================================================================
  // DIVERSE REALISTIC LIFE PATHWAYS: ARTISAN, RETAIL, HEALTHCARE, INDUSTRY
  // =========================================================================
  {
    id: "tri_artisan_heritage",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["all", "scholar_sage", "first_pot_of_gold"],
    tag: "artisan_crossroads",
    min_age: 20,
    max_age: 32,
    target_vector: [0.10, 0.60, 0.20, 0.40, 0.70, 0.1],
    title: "Ngã Rẽ Làng Nghề: Kế Nghiệp Cổ Truyền, Xuất Khẩu Mỹ Nghệ hay Chuyển Nghề Công Nghiệp?",
    narrative: "Xưởng thủ công truyền thống của gia tộc đang đứng trước cơn lốc công nghiệp hóa. Bạn có kỹ năng đôi bàn tay khéo léo và phải quyết định hướng đi cho đôi tay và tâm hồn mình.",
    trilemma_options: [
      {
        id: "ART_A",
        action_title: "Kế Nghiệp Xưởng Cổ Truyền & Rèn Dũa Tay Nghề Nghệ Nhân",
        consequence_hint: "Chấp nhận thu nhập khởi điểm khiêm tốn, bảo tồn tinh hoa hoa văn của tổ tiên (+30 Karma, -15 Burnout).",
        sacrifice_type: "cash",
        effects: {
          karma_delta: 30,
          burnout_delta: -15,
          cash_delta: 4000,
          flags: ["master_artisan_apprentice"],
          occupation: "Nghệ nhân Thủ công Truyền thống",
          delayed_domino: {
            in_years: 3,
            flag: "cultural_heritage_master",
            karma_delta: 40,
            cash_delta: 22000,
            title: "Đạt Danh Hiệu Nghệ Nhân Di Sản Quốc Gia",
            milestone_summary: "Tác phẩm thủ công độc bản của bạn được trưng bày tại Bảo tàng Quốc gia và bán đấu giá thành công rực rỡ!"
          }
        }
      },
      {
        id: "ART_B",
        action_title: "Xây Dựng Thương Hiệu Mỹ Nghệ Xuất Khẩu Toàn Cầu",
        consequence_hint: "Đưa sản phẩm lên sàn thương mại quốc tế, vay vốn đầu tư thiết kế bao bì mới (+15.000 USD, +25 Burnout).",
        sacrifice_type: "vitality",
        effects: {
          cash_delta: 15000,
          burnout_delta: 25,
          vitality_delta: -8,
          flags: ["artisan_export_founder"],
          occupation: "Nhà sáng lập Thương hiệu Thủ công Mỹ nghệ",
          delayed_domino: {
            in_years: 2,
            flag: "global_artisan_brand_expansion",
            cash_delta: 45000,
            karma_delta: 20,
            title: "Đơn Hàng Xuất Khẩu Châu Âu & Nhật Bản Ký Kết",
            milestone_summary: "Thương hiệu mỹ nghệ của bạn ký được chuỗi phân phối 50 cửa hàng lưu niệm cao cấp tại Paris và Tokyo!"
          }
        }
      },
      {
        id: "ART_C",
        action_title: "Chuyển Sang Thiết Kế Sản Phẩm Công Nghiệp Cho Tập Đoàn",
        consequence_hint: "Làm việc tại tập đoàn đa quốc gia, lương tháng ổn định nhưng gác lại nghề tổ (+20.000 USD, -10 Karma).",
        sacrifice_type: "relationship",
        effects: {
          cash_delta: 20000,
          burnout_delta: 10,
          karma_delta: -10,
          flags: ["industrial_cad_designer"],
          occupation: "Chuyên viên Thiết kế Công nghiệp"
        }
      }
    ]
  },
  {
    id: "tri_medical_resident_crossroads",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["all", "scholar_sage", "adversity_phoenix"],
    tag: "medical_ethics_crossroads",
    min_age: 24,
    max_age: 36,
    target_vector: [0.05, 0.70, 0.40, 0.30, 0.90, 0.1],
    title: "Sứ Mệnh Áo Trắng: Trực Đêm Tuyến Đầu, Bệnh Viện Quốc Tế hay Bác Sĩ Bản Làng?",
    narrative: "Tốt nghiệp trường Y, bạn đứng trước các lựa chọn cống hiến: Gắn bó với phòng cấp cứu tuyến đầu đầy nghẹt bệnh nhân, làm việc tại phòng khám tư nhân thu nhập cao, hay mang tủ thuốc lên vùng núi cao cứu đồng bào.",
    trilemma_options: [
      {
        id: "MED_A",
        action_title: "Trực Đêm Cấp Cứu Tuyến Đầu (Bệnh Viện Công)",
        consequence_hint: "Ca trực 36 tiếng căng như dây đàn, lương phụ cấp khiêm tốn nhưng cứu được hàng ngàn mạng sống (+40 Karma, -15 Vitality, +35 Burnout).",
        sacrifice_type: "vitality",
        effects: {
          karma_delta: 40,
          vitality_delta: -15,
          burnout_delta: 35,
          cash_delta: 6000,
          flags: ["er_medical_resident"],
          occupation: "Bác sĩ Cấp cứu Tuyến đầu",
          delayed_domino: {
            in_years: 2,
            flag: "chief_surgeon_promotion",
            karma_delta: 35,
            cash_delta: 30000,
            occupation: "Bác sĩ Phẫu thuật Trưởng Khoa",
            title: "Bổ Nhiệm Bác Sĩ Trưởng Khoa Lâm Sàng",
            milestone_summary: "Sau hàng trăm ca phẫu thuật giành giật sự sống từ tay tử thần, bạn được vinh danh Thầy thuốc Ưu tú và đề bạt Trưởng khoa!"
          }
        }
      },
      {
        id: "MED_B",
        action_title: "Chuyển Sang Bệnh Viện Tư Nhân / Phòng Khám Quốc Tế",
        consequence_hint: "Môi trường máy lạnh tiện nghi, đãi ngộ tài chính cao ngất, ít ca hiểm nghèo (+35.000 USD, -15 Burnout).",
        sacrifice_type: "karma",
        effects: {
          cash_delta: 35000,
          burnout_delta: -15,
          vitality_delta: 5,
          karma_delta: 10,
          flags: ["private_clinic_physician"],
          occupation: "Bác sĩ Đa khoa Phòng khám Quốc tế"
        }
      },
      {
        id: "MED_C",
        action_title: "Tình Nguyện Làm Bác Sĩ Vùng Sâu Vùng Xa / Hải Đảo",
        consequence_hint: "Mang ánh sáng y học đến với bà con nghèo khó, điều kiện thiếu thốn nhưng bồi đắp Đại Thiện Nghiệp (+60 Karma, +20 Vitality dẻo dai).",
        sacrifice_type: "cash",
        effects: {
          karma_delta: 60,
          vitality_delta: 15,
          burnout_delta: -20,
          cash_delta: 3000,
          flags: ["volunteer_frontier_doctor"],
          occupation: "Bác sĩ Tình nguyện Vùng cao",
          delayed_domino: {
            in_years: 3,
            flag: "frontier_medical_hero",
            karma_delta: 50,
            title: "Huân Chương Cống Hiến & Tình Dân Sâu Nặng",
            milestone_summary: "Trạm y tế bạn xây dựng đã giúp đẩy lùi dịch bệnh cho hàng chục bản làng. Bạn trở thành biểu tượng y đức được nhân dân kính trọng!"
          }
        }
      }
    ]
  },
  {
    id: "tri_local_retail_crossroads",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["all", "first_pot_of_gold", "commercial_tycoon"],
    tag: "retail_commerce_crossroads",
    min_age: 22,
    max_age: 35,
    target_vector: [0.35, 0.40, 0.10, 0.80, 0.50, 0.1],
    title: "Thương Trường Phố Thị: Mở Tiệm Kinh Doanh Bản Địa, Nhượng Quyền hay Buôn Chuyến?",
    narrative: "Tích lũy được số vốn nhỏ, bạn quyết định bước chân vào thương trường buôn bán phố xá để tự làm chủ vận mệnh tài chính của mình.",
    trilemma_options: [
      {
        id: "RET_A",
        action_title: "Mở Tiệm Cà Phê / Cửa Hàng Bản Địa Với Vốn Tự Có",
        consequence_hint: "Tự tay làm chủ, chăm chút từng khách hàng quen, doanh thu xoay vòng đều đặn (+12.000 USD, +15 Karma, +10 Burnout).",
        sacrifice_type: "vitality",
        effects: {
          cash_delta: 12000,
          burnout_delta: 10,
          karma_delta: 15,
          flags: ["local_shopkeeper_owner"],
          occupation: "Chủ Cửa hàng Kinh doanh Phố thị",
          delayed_domino: {
            in_years: 2,
            flag: "local_shop_chain_success",
            cash_delta: 35000,
            karma_delta: 15,
            title: "Khai Trương Cơ Sở Thứ 2 & Dòng Tiền Ổn Định",
            milestone_summary: "Cửa hàng của bạn trở thành điểm đến quen thuộc của cả khu phố. Lợi nhuận ròng tăng trưởng vững chắc!"
          }
        }
      },
      {
        id: "RET_B",
        action_title: "Vay Vốn Ngân Hàng Mua Nhượng Quyền Thương Hiệu Lớn",
        consequence_hint: "Tận dụng thương hiệu có sẵn nhưng gánh áp lực trả lãi hàng tháng (+30.000 USD doanh thu, +30 Burnout).",
        sacrifice_type: "cash",
        effects: {
          cash_delta: 30000,
          burnout_delta: 30,
          flags: ["franchise_operator_debt"],
          occupation: "Chủ Đại lý Nhượng quyền Thương hiệu"
        }
      },
      {
        id: "RET_C",
        action_title: "Duy Trì Quy Mô Nhỏ & Tích Lũy Tiền Mua Đất Nền Vùng Ven",
        consequence_hint: "Chắt chiu từng đồng lời, không đua đòi mở rộng, tích trữ tiền mặt chờ cơ hội mua tài sản (-15 Burnout, +10 Karma).",
        sacrifice_type: "relationship",
        effects: {
          cash_delta: 18000,
          burnout_delta: -15,
          karma_delta: 10,
          flags: ["frugal_land_accumulator"],
          occupation: "Tiểu thương Tích lũy Bất động sản"
        }
      }
    ]
  },
  {
    id: "ill_thesis_dispute",
    interaction_type: "ILLUSION",
    aspiration_tags: ["scholar_sage"],
    tag: "academic_crisis",
    min_age: 22,
    max_age: 32,
    target_vector: [0.20, 0.70, 0.55, 0.25, 0.60, 0.2],
    title: "Cú Sốc Luận Án & Bị Tước Đoạt Quyền Đồng Tác Giả",
    narrative: "Một sự thật phũ phàng giáng xuống: Công trình nghiên cứu AI bạn cày suốt 2 năm trời đã bị giáo sư hướng dẫn đăng ký bằng sáng chế dưới tên riêng của ông mà không hề có tên bạn. Vị thế học trò bé nhỏ không cho phép bạn kiện tụng nếu không muốn bị đình chỉ học.",
    illusion_data: {
      forced_outcome: "Cắn răng chấp nhận bất công, thề rằng sẽ tự đứng trên đôi chân của chính mình.",
      effects: {
        burnout_delta: 28,
        vitality_delta: -5,
        karma_delta: 10,
        flags: ["academic_injustice_grit"]
      }
    }
  },
  {
    id: "spec_academic_vs_market",
    interaction_type: "SPECTRUM",
    aspiration_tags: ["scholar_sage"],
    tag: "scholar_spectrum",
    min_age: 20,
    max_age: 38,
    target_vector: [0.25, 0.80, 0.35, 0.30, 0.70, 0.2],
    title: "Cán Cân: Nghiên Cứu Viện Hàn Lâm vs Lập Trình Thương Mại Hái Ra Tiền",
    narrative: "Bạn phân bổ quỹ thời gian giữa việc viết bài báo khoa học nâng tầm học thuật và nhận hợp đồng viết phần mềm thương mại kiếm tiền tươi.",
    spectrum_data: {
      left_label: "Thuần Hàn Lâm (Karma & Uy Tín)",
      right_label: "Thuần Kiếm Tiền (Tài Chính & Hối Hả)",
      effects_ratio: {
        left: { karma_delta: 20, burnout_delta: -10 },
        right: { cash_delta: 45000, burnout_delta: 25 }
      }
    }
  },
  {
    id: "tri_debt_turnaround",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["adversity_phoenix"],
    tag: "phoenix_debt_crossroads",
    min_age: 19,
    max_age: 30,
    target_vector: [-0.30, 0.60, 0.75, -0.20, 0.50, 0.1],
    title: "Bão Giông Nợ Nần: Cày Kiệt Lực, Vay Xã Hội Đen hay Bán Kỷ Vật Gia Bảo?",
    narrative: "Chủ nợ đập cửa ầm ĩ giữa đêm, hạn chót thanh toán món nợ gia đình chỉ còn 48 giờ. Bạn bị dồn vào chân tường và phải đưa ra quyết định để giữ lấy sự tôn nghiêm cuối cùng của kiếp sống.",
    trilemma_options: [
      {
        id: "PHX_A",
        action_title: "Cày 3 Ca Xuyên Đêm Kiệt Sức",
        consequence_hint: "Lao động khổ sai để trả nợ sạch sẽ bằng mồ hôi nước mắt, chấp nhận thể xác tàn tạ (-20 Vitality, Karma +30).",
        sacrifice_type: "vitality",
        effects: { vitality_delta: -20, burnout_delta: 30, karma_delta: 30, flags: ["blood_sweat_cleared_debt"] }
      },
      {
        id: "PHX_B",
        action_title: "Vay Mượn Nóng Thế Chấp Danh Dự",
        consequence_hint: "Tạm thời dẹp yên chủ nợ cũ nhưng gánh thêm áp lực lãi mẹ đẻ lãi con, tâm trí chìm trong sợ hãi (Burnout +40).",
        sacrifice_type: "cash",
        effects: { burnout_delta: 40, flags: ["high_interest_burden"] }
      },
      {
        id: "PHX_C",
        action_title: "Bán Đứt Kỷ Vật Duy Nhất Của Cha Mẹ",
        consequence_hint: "Đổi lấy món tiền mặt xóa sạch nợ nần nhưng trong tim mang vết thương lòng không bao giờ lành (Tổn thất Nghĩa tình).",
        sacrifice_type: "relationship",
        effects: { cash_delta: 50000, burnout_delta: 15, karma_delta: -10, flags: ["sold_family_heirloom"] }
      }
    ]
  },
  {
    id: "ill_landlord_eviction",
    interaction_type: "ILLUSION",
    aspiration_tags: ["adversity_phoenix"],
    tag: "street_survival",
    min_age: 18,
    max_age: 28,
    target_vector: [-0.20, 0.65, 0.80, -0.10, 0.40, 0.1],
    title: "Nước Mắt Đêm Mưa: Bị Đuổi Khỏi Căn Phòng Trọ",
    narrative: "Chỉ vì chậm tiền trọ 3 ngày, chủ nhà đã ném toàn bộ vali quần áo của bạn ra ngoài lề đường giữa cơn mưa tầm tã buốt giá. Đứng nép dưới mái hiên cửa hàng tiện lợi, bạn thề với lòng kiếp này nhất định phải mua được căn nhà của riêng mình.",
    illusion_data: {
      button_text: "Nuốt Nước Mắt Đứng Dậy",
      forced_outcome: "Nuốt nước mắt gom đồ tìm chỗ trú chân qua đêm, hun đúc ý chí sắt đá.",
      effects: {
        vitality_delta: -8,
        burnout_delta: 20,
        karma_delta: 15,
        flags: ["phoenix_vow_home"]
      }
    }
  },

  // --- BIG DATA ILLUSION EXPANSIONS FOR YOUTH & ADULTHOOD ---
  {
    id: "ill_health_exhaustion",
    interaction_type: "ILLUSION",
    aspiration_tags: ["all", "young_scholar", "first_pot_of_gold"],
    tag: "health_breakdown_warning",
    min_age: 20,
    max_age: 35,
    target_vector: [0.30, 0.50, 0.70, 0.40, 0.50, 0.3],
    title: "Cơn Ngất Xỉu Tại Bàn Làm Việc",
    narrative: "Chuỗi ngày thức trắng cày thêm việc và ăn mì gói đã đòi nợ. Bạn ngã gục ngay tại bàn làm việc và tỉnh dậy trong phòng cấp cứu với ống truyền nước biển. Bác sĩ nghiêm giọng cảnh cáo nếu không dừng việc tàn phá thân xác, bạn sẽ phải trả giá bằng cả mạng sống.",
    illusion_data: {
      button_text: "Chấp Nhận Nghỉ Ngơi Dưỡng Sức",
      impact_hint: "Mất tiền viện phí, nhưng hiểu được giới hạn thể xác và nhận về sự thức tỉnh (+15 Karma).",
      drain_ratio: 0.15,
      karma_gain: 15
    }
  },
  {
    id: "ill_startup_patent_theft",
    interaction_type: "ILLUSION",
    aspiration_tags: ["young_scholar", "tech_pioneer_unicorn", "scholar_sage"],
    tag: "intellectual_theft_loss",
    min_age: 21,
    max_age: 35,
    target_vector: [0.40, 0.65, 0.50, 0.30, 0.60, 0.2],
    title: "Ý Tưởng Khởi Nghiệp Bị Đánh Cắp",
    narrative: "Dự án phần mềm bạn cùng nhóm bạn thân ấp ủ suốt 18 tháng đã bị một công ty lớn 'sao chép nguyên bản' và tung ra thị trường trước nhờ nguồn vốn khổng lồ. Luật sư nói rằng việc theo đuổi vụ kiện sẽ ngốn sạch gia sản của bạn mà không chắc thắng.",
    illusion_data: {
      button_text: "Nuốt Hận Bắt Đầu Lại Từ Đầu",
      impact_hint: "Dự án tan vỡ, nhưng tôi luyện bản lĩnh thương trường không bao giờ ngây thơ nữa (+20 Karma).",
      drain_ratio: 0.20,
      karma_gain: 20
    }
  },
  {
    id: "ill_family_medical_emergency",
    interaction_type: "ILLUSION",
    aspiration_tags: ["all", "first_pot_of_gold", "survivor_redemption"],
    tag: "family_health_burden",
    min_age: 23,
    max_age: 40,
    target_vector: [0.35, 0.60, 0.40, 0.50, 0.70, 0.2],
    title: "Hóa Đơn Viện Phí Của Người Thân",
    narrative: "Biến cố sức khỏe ập đến với người thân trong gia đình. Cầm tờ hóa đơn phẫu thuật trên tay, bạn nhận ra mọi số dư tài khoản vừa tích lũy được đều phải dồn hết để giành lại sự sống cho người ruột thịt.",
    illusion_data: {
      button_text: "Gánh Vác Trách Nhiệm Gia Đình",
      impact_hint: "Dốc sạch 35% tiền mặt chi trả viện phí, chữ hiếu vẹn toàn (+25 Karma vĩnh cửu).",
      drain_ratio: 0.35,
      karma_gain: 25
    }
  },
  {
    id: "ill_market_correction_crash",
    interaction_type: "ILLUSION",
    aspiration_tags: ["first_pot_of_gold", "wealth_tycoon", "empire_builder"],
    tag: "market_flash_crash",
    min_age: 24,
    max_age: 45,
    target_vector: [0.50, 0.65, 0.30, 0.60, 0.50, 0.3],
    title: "Cú Sập Hầm Thị Trường Tài Chính",
    narrative: "Một đợt điều chỉnh giảm đột ngột quét qua các sàn giao dịch tài sản. Danh mục đầu tư bạn vừa rót vốn sụt giảm 25% giá trị chỉ trong vài phiên. Không có đường lùi, chỉ có sự kiên định chờ đợi chu kỳ hồi phục.",
    illusion_data: {
      button_text: "Gồng Mình Chờ Sóng Hồi",
      impact_hint: "Mất 25% thanh khoản tiền mặt ngắn hạn, rèn luyện thần kinh thép trước thị trường (+15 Karma).",
      drain_ratio: 0.25,
      karma_gain: 15
    }
  },
  {
    id: "tri_ma_corporate_war",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["empire_builder"],
    tag: "corporate_ma_war",
    min_age: 30,
    max_age: 55,
    target_vector: [0.70, 0.60, 0.60, 0.70, 0.75, 0.4],
    title: "Bàn Cờ Thâu Tóm M&A: Nuốt Chửng Đối Thủ, Bán Mình Cho Quỹ Ngoại hay Cố Thủ?",
    narrative: "Cơn bão sáp nhập doanh nghiệp quét qua ngành nghề của bạn. Quỹ đầu tư mạo hiểm đưa ra tối hậu thư: hoặc chấp nhận bán mình với định giá 3 triệu USD, hoặc vay nợ đòn bẩy thâu tóm ngược đối thủ, hoặc sa thải 40% nhân sự để bảo toàn tiền mặt phòng thủ.",
    trilemma_options: [
      {
        id: "EMP_A",
        action_title: "Đòn Bẩy Cực Đại Thâu Tóm Ngược",
        consequence_hint: "Liều lĩnh vay nợ ngân hàng nuốt chửng đối thủ, vươn lên vị thế độc tôn nhưng đối mặt rủi ro vỡ nợ (Tiềm năng tài sản +2M USD).",
        sacrifice_type: "vitality",
        effects: { burnout_delta: 35, vitality_delta: -15, flags: ["hostile_takeover_king"] }
      },
      {
        id: "EMP_B",
        action_title: "Bán Đứt Doanh Nghiệp Cho Quỹ Ngoại",
        consequence_hint: "Bỏ túi ngay 2.500.000 USD tiền mặt dưỡng già nhưng vĩnh viễn mất quyền kiểm soát đứa con tinh thần dày công gầy dựng.",
        sacrifice_type: "cash",
        effects: { cash_delta: 2500000, burnout_delta: -25, flags: ["sold_out_founder"] }
      },
      {
        id: "EMP_C",
        action_title: "Sa Thải 40% Nhân Sự Kỳ Cựu Phòng Thủ",
        consequence_hint: "Bảo toàn dòng tiền công ty nhưng mang tiếng bạc bẽo với những cộng sự đã kề vai sát cánh từ ngày đầu.",
        sacrifice_type: "relationship",
        effects: { karma_delta: -25, burnout_delta: 15, flags: ["cold_hearted_ceo"] }
      }
    ]
  },
  {
    id: "tri_zen_renunciation",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["zen_master"],
    tag: "zen_crossroads",
    min_age: 28,
    max_age: 65,
    target_vector: [0.40, 0.75, 0.20, 0.40, 0.90, 0.2],
    title: "Tiếng Chuông Cửa Thiền: Xuất Gia Đoạn Duyên, Lập Quỹ Từ Thiện hay Tiếp Tục Bon Chen?",
    narrative: "Giữa đỉnh cao sự nghiệp danh vọng, một đêm thức trắng nhìn xuống dòng xe tấp nập, bạn nhận ra mọi hư vinh trần thế chỉ là mây khói. Tiếng chuông chùa xa xăm như thức tỉnh tâm thức.",
    trilemma_options: [
      {
        id: "ZEN_A",
        action_title: "Tạm Rời Hồng Trần Đi Khóa Tu Kín 1 Năm",
        consequence_hint: "Bàn giao hết công việc, buông xả danh lợi để chữa lành triệt để tâm trí (Tâm trí bình thản tuyệt đối, Karma +45).",
        sacrifice_type: "cash",
        effects: { burnout_delta: -60, karma_delta: 45, vitality_delta: 10, flags: ["zen_monk_retreat"] }
      },
      {
        id: "ZEN_B",
        action_title: "Mở Bếp Ăn Thiện Nguyện 0 Đồng",
        consequence_hint: "Trích 60% thu nhập nuôi dưỡng hàng trăm mảnh đời cơ nhỡ mỗi ngày, tích lũy công đức vô lượng (+50 Karma vĩnh cửu).",
        sacrifice_type: "cash",
        effects: { cash_delta: -80000, karma_delta: 50, burnout_delta: -20, flags: ["charity_patron_angel"] }
      },
      {
        id: "ZEN_C",
        action_title: "Ở Lại Làm Trụ Cột Hóa Giải Xung Đột Gia Tộc",
        consequence_hint: "Không chạy trốn thế gian, đem tâm từ bi và sự bao dung vào việc hòa giải hiềm khích anh em dòng họ.",
        sacrifice_type: "vitality",
        effects: { karma_delta: 30, burnout_delta: 10, flags: ["clan_peacemaker"] }
      }
    ]
  },
  {
    id: "tri_cybernetic_ascension",
    interaction_type: "TRILEMMA",
    aspiration_tags: ["transhuman_cyber"],
    tag: "cyber_ascension_climax",
    min_age: 45,
    max_age: 80,
    target_vector: [0.80, 0.50, 0.30, 0.85, 0.85, 0.5],
    title: "Ngưỡng Cửa Bán Thần: Cấy Ghép Chip Thần Kinh, Tiêm Tế Bào Gốc hay Giữ Lại Thân Xác Phàm?",
    narrative: "Tập đoàn công nghệ sinh học NeuralMatrix đưa ra 3 phương án can thiệp sinh học cấp cao để kéo dài năng lực của bạn qua ngưỡng tuổi già.",
    trilemma_options: [
      {
        id: "CYB_A",
        action_title: "Cấy Chip Neural Link Giao Diện Não Bộ",
        consequence_hint: "Tư duy kết nối trực tiếp với siêu máy tính, nhận thức tăng vọt nhưng mất đi một phần cảm xúc con người (Bán Thần).",
        sacrifice_type: "relationship",
        effects: { burnout_delta: -30, karma_delta: 10, flags: ["cyber_brain_implant"] }
      },
      {
        id: "CYB_B",
        action_title: "Trị Liệu Phôi Tế Bào Gốc Trẻ Hóa Tế Bào",
        consequence_hint: "Bỏ ra $400.000 để tái tạo toàn diện hệ tim mạch và khung xương, kéo dài thêm 15 năm sung mãn (+25 Max Vitality).",
        sacrifice_type: "cash",
        effects: { cash_delta: -400000, vitality_delta: 25, flags: ["stem_cell_rejuvenated"] }
      },
      {
        id: "CYB_C",
        action_title: "Chấp Nhận Quy Luật Tự Nhiên Thuần Khiết",
        consequence_hint: "Từ chối mọi can thiệp nhân tạo, thuận theo lẽ tự nhiên của đất trời, thanh thản đón nhận tuổi già (Karma +35).",
        sacrifice_type: "vitality",
        effects: { karma_delta: 35, burnout_delta: -40, flags: ["pure_organic_harmony"] }
      }
    ]
  }
];

// =========================================================================
// THE MILLION-NODE DYNAMIC COMBINATORIAL ENGINE
// Procedurally constructs infinite permutations tailored to character state
// =========================================================================
export function generateMillionProceduralScenario(character, netWorth, bannedTags = new Set()) {
  const age = typeof character.age === 'number' ? character.age : 25;
  const cash = Number(character.cash) || 10000;
  const burnout = Number(character.burnout) || 30;
  const vitality = Number(character.vitality) || 70;
  const flags = new Set(character.hidden_flags || []);

  const isOrphan = character.origin === 'orphan' ||
                   character.origin_background?.id === 'orphan' ||
                   flags.has("orphan") ||
                   flags.has("parents_deceased") ||
                   character.household?.parents_status === 'deceased_or_abandoned' ||
                   character.household?.parents_status === 'deceased';

  const hasLivingSpouse = flags.has("married") ||
                          (Array.isArray(character.relationships) && character.relationships.some(r => 
                            (r.type === 'spouse' || r.type === 'partner') && r.status !== 'deceased'));

  const hasChildren = Array.isArray(character.relationships) && 
                      character.relationships.some(r => r.type === 'child' && r.status !== 'deceased');

  // Determine age bracket strictly
  let stageKey = "youth";
  if (age < 12) stageKey = "childhood";
  else if (age < 18) stageKey = "adolescence";
  else if (age >= 75) stageKey = "twilight";
  else if (age >= 60) stageKey = "elderly";
  else if (age >= 45) stageKey = "midlife";
  else if (age >= 30) stageKey = "adulthood";

  const stageTemplates = {
    childhood: isOrphan ? [
      {
        title: "Tự Lập Thuở Nhỏ & Bài Học Sinh Tồn",
        narrative: "Không có sự bao bọc của cha mẹ, bạn sớm học cách tự chăm sóc bản thân, biết nấu cơm và giúp đỡ những mảnh đời cơ nhỡ cùng cảnh ngộ.",
        type: "STANDARD",
        optA: "Chăm Chỉ Đèn Sách Tự Lập",
        hintA: "Rèn luyện ý chí kiên định và tính tự giác cao (+10 Thể lực, +15 Karma).",
        optB: "Thích Nghi Mưu Sinh Sớm",
        hintB: "Nhạy bén với cuộc sống, tích lũy bản lĩnh (+8 Thể lực, +$50 tiền tiêu vặt)."
      },
      {
        title: "Cơn Sốt Đơn Độc Vượt Qua",
        narrative: "Thời tiết chuyển lạnh khiến bạn sốt cao giữa đêm. Bằng sự kiên cường và sự đùm bọc của thầy cô/bà con chòm xóm, bạn đã vượt qua cơn bạo bệnh.",
        type: "STANDARD",
        optA: "Uống Nước Ấm & Tự Chườm Khăn",
        hintA: "Cơ thể vượt qua thử thách, sức đề kháng tôi luyện (+12 Thể lực).",
        optB: "Nhờ Bà Con Chòm Xóm Giúp",
        hintB: "Cảm nhận sự ấm áp của tình làng nghĩa xóm (+6 Thể lực, +12 Karma)."
      }
    ] : [
      {
        title: "Kỷ Niệm Thuở Bé & Vòng Tay Gia Đình",
        narrative: "Tuổi ấu thơ trôi qua với những buổi chiều chạy nhảy trước sân nhà. Cha mẹ ân cần dạy bạn từng con chữ và cách ứng xử tử tế với xóm giềng.",
        type: "STANDARD",
        optA: "Ngoan Ngoãn Học Bài",
        hintA: "Được cha mẹ khen ngợi, bồi đắp tri thức đầu đời (+10 Thể lực, +15 Karma).",
        optB: "Thỏa Sức Khám Phá Xung Quanh",
        hintB: "Rèn luyện thể chất năng động và sự tò mò vô tận (+8 Thể lực, -15 Burnout)."
      },
      {
        title: "Bệnh Cảm Sốt Đầu Đời",
        narrative: "Thời tiết giao mùa khiến bạn bị sốt cao. Bát cháo hành nóng hổi của mẹ và bàn tay chăm sóc của gia đình giúp bạn vượt qua cơn mệt mỏi.",
        type: "STANDARD",
        optA: "Chịu Khó Uống Thuốc Đắng",
        hintA: "Hồi phục nhanh chóng, thấu hiểu tình thương của mẹ (+12 Thể lực).",
        optB: "Đòi Mẹ Ôm Cả Đêm",
        hintB: "Cảm nhận sự che chở ấm áp tuyệt đối (+6 Thể lực, +10 Karma)."
      }
    ],
    adolescence: isOrphan ? [
      {
        title: "Tự Chọn Con Đường Học Vấn Hay Mưu Sinh",
        narrative: "Tuổi mới lớn đứng trước ngưỡng cửa tương lai. Không có phụ mẫu định hướng, mọi quyết định tiếp tục thi đại học hay học nghề đều nằm trong tay bạn.",
        type: "STANDARD",
        optA: "Quyết Tâm Đỗ Đại Học Công Lập",
        hintA: "Nỗ lực đèn sách phi thường, mở khóa tương lai tri thức (+15 Karma).",
        optB: "Học Nghề Kỹ Thuật Thực Tế",
        hintB: "Sớm tự chủ tài chính mưu sinh (+10 Thể lực, +$300 tiền túi)."
      },
      {
        title: "Khẳng Định Lập Trường Tuổi Trẻ",
        narrative: "Bạn tự rèn luyện bản lĩnh sống tự lập. Những lời dị nghị của người ngoài không thể làm lung lay ý chí vươn lên thoát nghèo của bạn.",
        type: "SPECTRUM",
        min_label: "Khiêm Nhường Nhẫn Nại",
        max_label: "Tự Tin Bứt Phá",
        metric: "burnout_vs_vitality"
      }
    ] : [
      {
        title: "Thử Thách Khảo Sát & Ước Mơ Tuổi Trẻ",
        narrative: "Thầy cô yêu cầu mỗi học sinh viết bài luận về ước mơ tương lai. Bạn đứng trước nhiều hoài bão: trở thành kỹ sư, doanh nhân, hay người hoạt động xã hội.",
        type: "STANDARD",
        optA: "Đăng Ký Đội Tuyển Học Sinh Giỏi",
        hintA: "Rèn luyện tư duy logic xuất sắc, nhận cờ Nhạy Bén Tri Thức.",
        optB: "Tham Gia Đội Bóng Của Trường",
        hintB: "Sức sống dồi dào, mở rộng mạng lưới bạn bè chí cốt."
      },
      {
        title: "Mâu Thuẫn Quan Điểm Với Cha Mẹ",
        narrative: "Bạn bắt đầu có những suy nghĩ độc lập về phong cách sống và gu âm nhạc. Cha mẹ cảm thấy khó hiểu và lo lắng bạn đi chệch hướng.",
        type: "SPECTRUM",
        min_label: "Lắng Nghe & Nhượng Bộ Cha Mẹ",
        max_label: "Khẳng Định Cá Tính Riêng",
        metric: "burnout_vs_vitality"
      }
    ],
    youth: [
      {
        title: "Cơ Hội Hợp Tác Đầu Tư Mạo Hiểm",
        narrative: `Một đối tác tiềm năng đề nghị góp vốn cùng bạn mở rộng thị trường. Đòi hỏi bạn phải dồn hết số vốn $${Math.max(2000, Math.round(cash * 0.4)).toLocaleString()} và chịu áp lực làm việc không ngày nghỉ.`,
        type: "SPECTRUM",
        min_label: "Giữ Vốn An Toàn",
        max_label: "Tất Tay Mạo Hiểm",
        metric: "cash_vs_vitality"
      },
      hasLivingSpouse ? {
        title: "Khúc Mắc Trong Mối Quan Hệ Lứa Đôi",
        narrative: "Sự bận rộn và khoảng cách quan điểm sống bắt đầu tạo ra hố sâu giữa hai người. Một cuộc trò chuyện thẳng thắn có thể cứu vãn hoặc đặt dấu chấm hết.",
        type: "STANDARD",
        optA: "Chủ Động Nhượng Bộ",
        hintA: "Giữ hòa khí tình cảm, nhưng phải gánh thêm áp lực tâm lý.",
        optB: "Bảo Vệ Cái Tôi",
        hintB: "Dứt khoát giải thoát, tập trung cày tiền nhưng chịu nỗi cô đơn."
      } : {
        title: "Độc Thân Tự Lập & Cám Dỗ Chi Tiêu",
        narrative: "Sống một mình giữa phố thị mang lại sự tự do tuyệt đối, nhưng cũng kèm theo những cám dỗ về tiệc tùng và chi tiêu mua sắm quá tay vào cuối tuần.",
        type: "STANDARD",
        optA: "Kỷ Luật Tiết Kiệm & Ở Nhà Tự Nấu",
        hintA: "Giữ vững dòng tiền tích lũy, bảo toàn ví tiền (+10 Karma).",
        optB: "Tụ Tập Cùng Bạn Bè Đồng Nghiệp",
        hintB: "Xả stress công việc nhưng tiêu hao một phần tiền túi (-15 Burnout, -$200)."
      }
    ],
    adulthood: [
      {
        title: "Tái Cấu Trúc Tài Chính & Cắt Giảm Chi Phí",
        narrative: `Lạm phát và chi phí sinh hoạt tăng cao khiến ngân sách bị thâm hụt. Bạn cần đưa ra quyết định cân đối giữa chất lượng cuộc sống và sự an toàn dự phòng.`,
        type: "SPECTRUM",
        min_label: "Thắt Lưng Buộc Bụng",
        max_label: "Vay Mượn Duy Trì",
        metric: "burnout_vs_cash"
      },
      hasLivingSpouse ? {
        title: "Đề Bạt Thăng Chức Kèm Trách Nhiệm Nặng Nề",
        narrative: "Ban giám đốc trao cho bạn chiếc ghế quản trị vùng. Mức lương tăng thêm 35% nhưng đồng nghĩa với những chuyến công tác biền biệt xa gia đình.",
        type: "STANDARD",
        optA: "Nhận Ghế Quản Trị",
        hintA: "Tiền tài thăng tiến vượt bậc, nhưng bỏ rơi mái ấm.",
        optB: "Từ Chối An Phận",
        hintB: "Duy trì vị trí hiện tại, giữ trọn hạnh phúc gia đình."
      } : {
        title: "Bứt Phá Chuyên Môn Hay Cân Bằng Thể Lực",
        narrative: "Không vướng bận việc gia đình, bạn có toàn quyền dốc sức cho hoài bão sự nghiệp. Tuy nhiên những đêm thức trắng liên tục bắt đầu để lại dấu hiệu suy kiệt.",
        type: "SPECTRUM",
        min_label: "Giữ Gìn Sức Khỏe",
        max_label: "Bán Mạng Thâu Đêm",
        metric: "vitality_vs_wealth"
      }
    ],
    midlife: [
      {
        title: "Thoái Hóa Cột Sống & Cảnh Báo Của Thể Xác",
        narrative: "Cơn đau lưng dữ dội tái phát sau những giờ làm việc kéo dài. Kết quả chụp cộng hưởng từ cho thấy nguy cơ thoát vị đĩa đệm độ 3 nếu không phẫu thuật hoặc nghỉ ngơi dài hạn.",
        type: "SPECTRUM",
        min_label: "Nghỉ Việc Trị Liệu",
        max_label: "Uống Thuốc Giảm Đau Cày Tiếp",
        metric: "vitality_vs_wealth"
      },
      {
        title: "Ngã Rẽ Đầu Tư Bất Động Sản Nghỉ Dưỡng",
        narrative: "Một lô đất ven biển đang được bán thanh lý giá hời. Liệu bạn có nên rút toàn bộ quỹ tiết kiệm dưỡng già để đón đầu quy hoạch du lịch?",
        type: "STANDARD",
        optA: "Xuống Tiền Mua Đất",
        hintA: "Cơ hội nhân đôi tài sản, rủi ro thanh khoản đóng băng.",
        optB: "Giữ Tiền Mặt Thủ Thân",
        hintB: "Bảo toàn an toàn tài chính, chấp nhận lạm phát bào mòn."
      }
    ],
    elderly: [
      {
        title: "Hội Ngộ Trường Xưa Tuổi Xế Chiều",
        narrative: "Sau nửa thế kỷ, bạn có dịp gặp lại những người bạn cùng lớp thời niên thiếu. Những mái đầu bạc trắng và sự thấu suốt về cuộc đời mang lại xúc cảm bồi hồi khó tả.",
        type: "TIME_SKIP",
        years_jump: 2,
        event_summary: "Trải qua 2 năm hoài niệm thanh thản, hàn gắn những kỷ niệm xưa."
      },
      isOrphan ? {
        title: "Trùng Tu Nơi Chôn Nhau Cắt Rốn",
        narrative: `Ngôi chùa / xóm nghèo nơi cưu mang bạn thuở nhỏ nay đã xuống cấp. Việc ủng hộ tu sửa sẽ tốn khoảng $${Math.max(3000, Math.round(cash * 0.2)).toLocaleString()}.`,
        type: "STANDARD",
        optA: "Công Đức Trùng Tu",
        hintA: "Tri ân cội nguồn, phước đức vô lượng (+25 Karma).",
        optB: "Giữ Tiền Dự Phòng Y Tế",
        hintB: "Tiết kiệm tiền dưỡng lão, giữ an toàn bản thân."
      } : {
        title: "Cân Nhắc Sửa Lại Ngôi Nhà Cổ Của Tổ Tiên",
        narrative: `Mái ngói căn nhà cũ đã dột nát sau nhiều mùa mưa bão. Việc đại tu sẽ tốn khoảng $${Math.max(5000, Math.round(cash * 0.25)).toLocaleString()}, khoản tiền dự phòng viện phí của bạn.`,
        type: "STANDARD",
        optA: "Sửa Lại Nhà Tổ",
        hintA: "Lưu giữ ký ức gia đình, giảm bớt tài sản tiền mặt dự phòng.",
        optB: "Chấp Nhận Chắp Vá",
        hintB: "Tiết kiệm tiền thuốc men tuổi già, chấp nhận nhà dột."
      }
    ],
    twilight: [
      {
        title: "Tĩnh Lặng Nhìn Ánh Chiều Tà",
        narrative: "Mỗi nhịp thở giờ đây đều là một ân huệ của tạo hóa. Bạn ngồi yên lặng nhìn từng chiếc lá rơi ngoài sân, nhận ra mọi vinh nhục được mất trần gian cũng chỉ như mây khói thoảng qua.",
        type: "TIME_SKIP",
        years_jump: 2,
        event_summary: "Trải qua 2 năm hoàng hôn bình lặng, tâm thức nhẹ nhõm buông xả."
      },
      hasChildren ? {
        title: "Phân Phát Kỷ Vật Cuối Cùng Cho Con Cháu",
        narrative: "Bạn tự tay mở chiếc hòm gỗ cũ, trao tặng lại những chiếc đồng hồ, cuốn sổ nhật ký và kỷ vật cả đời cho các con cháu làm kỷ niệm trước ngày đi xa.",
        type: "STANDARD",
        optA: "Trao Tặng Tất Cả",
        hintA: "Thanh thản không vướng bận, con cháu xúc động (Karma +25).",
        optB: "Giữ Lại Bên Mình",
        hintB: "Ôm ấp ký ức đến hơi thở cuối cùng trong bệnh viện."
      } : {
        title: "Thành Lập Quỹ Khuyến Học Thiện Nguyện",
        narrative: "Không có con cháu nối dõi, bạn quyết định dành lại toàn bộ sản nghiệp và kỷ vật cả đời để thành lập quỹ học bổng cưu mang những em nhỏ cơ nhỡ.",
        type: "STANDARD",
        optA: "Hiến Tặng Toàn Bộ Di Sản",
        hintA: "Để lại tiếng thơm muôn đời, đại phước đức chuyển kiếp (+35 Karma).",
        optB: "Dành Cho Chi Phí Y Tế ICU",
        hintB: "Bảo đảm điều kiện chăm sóc giảm nhẹ tốt nhất những ngày cuối (+15 Thể lực)."
      }
    ]
  };

  const pool = stageTemplates[stageKey] || stageTemplates.youth;
  // Pick template that doesn't collide with recent tag
  const selected = pool[Math.floor(getRandom() * pool.length)];
  const uniqueTag = `dyn_${stageKey}_${age}_${Date.now() % 1000}`;

  if (selected.type === "SPECTRUM") {
    return {
      id: `dyn_${Date.now()}`,
      interaction_type: "SPECTRUM",
      tag: uniqueTag,
      title: selected.title,
      narrative: selected.narrative,
      spectrum_data: {
        min_label: selected.min_label,
        max_label: selected.max_label,
        impact_metric: selected.metric,
        consequence_summary: "Lựa chọn mức độ đánh đổi thích ứng theo hoàn cảnh hiện tại."
      }
    };
  }

  if (selected.type === "TIME_SKIP") {
    return {
      id: `dyn_${Date.now()}`,
      interaction_type: "TIME_SKIP",
      tag: uniqueTag,
      title: selected.title,
      narrative: selected.narrative,
      time_skip_data: {
        years_jump: selected.years_jump || 2,
        yearly_income_save: 3000,
        burnout_decay: 30,
        vitality_drift: -4,
        event_summary: selected.event_summary
      }
    };
  }

  // STANDARD option
  const isChild = age < 18;
  return {
    id: `dyn_${Date.now()}`,
    interaction_type: "STANDARD",
    tag: uniqueTag,
    title: selected.title,
    narrative: selected.narrative,
    options: [
      {
        id: "A",
        action_title: selected.optA || "Hành Động Thuận Ý",
        consequence_hint: selected.hintA || "Hậu quả cân bằng.",
        risk_percent: 15,
        cost_ap: isChild ? 0 : 1,
        effects: isChild
          ? { vitality_delta: 10, karma_delta: 10, burnout_delta: -5 }
          : { cash_delta: Math.round(cash * 0.1), vitality_delta: -5, burnout_delta: 10, karma_delta: 5 }
      },
      {
        id: "B",
        action_title: selected.optB || "Lối Đi Dự Phòng",
        consequence_hint: selected.hintB || "Lựa chọn cẩn trọng.",
        risk_percent: 40,
        cost_ap: isChild ? 0 : 1,
        effects: isChild
          ? { vitality_delta: 5, karma_delta: -5, burnout_delta: -10 }
          : { cash_delta: -Math.round(cash * 0.05), vitality_delta: 10, burnout_delta: -15, karma_delta: 10 }
      }
    ]
  };
}
