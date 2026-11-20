// xie · badges.js — huy hiệu (spec mục 13: ít nhất 20, tên viết thường).
// thuần javascript: mỗi huy hiệu đọc một con số từ bảng thành tích (progress-core.js → buildStats)
// rồi so với mốc. huy hiệu đã nhận thì giữ mãi (lưu ngày nhận), kể cả khi con số sau đó giảm.
// huy hiệu của các phần làm ở giai đoạn sau (kho output, câu tự viết, part 2…) đã có sẵn ở đây,
// tới lúc các phần đó ghi dữ liệu là tự mở.

export const BADGE_GROUPS = [
  { id: 'chuoi', label: 'chuỗi ngày' },
  { id: 'output', label: 'từ thành output' },
  { id: 'luyen', label: 'viết & nói' },
  { id: 'chinh-xac', label: 'chính xác' },
  { id: 'nhip', label: 'nhịp học' },
];

const kindN = (s, kind) => s.kinds?.[kind]?.n || 0;
const kindOk = (s, kind) => s.kinds?.[kind]?.ok || 0;

export const BADGES = [
  // chuỗi ngày
  { id: 'ngay-dau-tien', group: 'chuoi', name: 'ngày đầu tiên', desc: 'đạt mục tiêu lượt lần đầu', icon: '୨୧', target: 1, value: (s) => s.metDays },
  { id: 'chuoi-7', group: 'chuoi', name: 'tuần lễ nơ hồng', desc: 'giữ chuỗi 7 ngày liền', icon: '🎀', target: 7, value: (s) => s.longest },
  { id: 'chuoi-30', group: 'chuoi', name: 'tháng không nghỉ', desc: 'giữ chuỗi 30 ngày liền', icon: '✿', target: 30, value: (s) => s.longest },
  { id: 'chuoi-100', group: 'chuoi', name: 'trăm ngày nơ hồng', desc: 'giữ chuỗi 100 ngày liền', icon: '♛', target: 100, value: (s) => s.longest },
  { id: 'bang-cuu', group: 'chuoi', name: 'được băng cứu', desc: 'băng giữ chuỗi cứu một ngày vắng', icon: '❄︎', target: 1, value: (s) => s.frozenDays },
  { id: 'noi-lai-chuoi', group: 'chuoi', name: 'nối lại chuỗi', desc: 'chuỗi từ 3 ngày bị đứt, rồi quay lại giữ chuỗi mới 3 ngày liền', icon: '♡', target: 1, value: (s) => (s.comeback ? 1 : 0) },

  // từ thành output
  { id: 'output-50', group: 'output', name: '50 từ của riêng bạn', desc: '50 từ vào kho output', icon: '✧', target: 50, value: (s) => s.outputWords },
  { id: 'output-100', group: 'output', name: 'trăm từ tự dùng', desc: '100 từ vào kho output', icon: '✦', target: 100, value: (s) => s.outputWords },
  { id: 'output-300', group: 'output', name: 'kho từ ba trăm', desc: '300 từ vào kho output', icon: '❀', target: 300, value: (s) => s.outputWords },
  { id: 'so-tay-rieng', group: 'output', name: 'sổ tay riêng', desc: 'thêm 20 từ gặp ngoài đời vào "từ của tui"', icon: '✎', target: 20, value: (s) => s.myWords },

  // viết & nói
  { id: 'cau-50', group: 'luyen', name: '50 câu tự viết', desc: 'tự viết 50 câu dùng từ mục tiêu', icon: '✍︎', target: 50, value: (s) => kindN(s, 'sentence') },
  { id: 'part2-10', group: 'luyen', name: 'mười cue card', desc: 'nói trọn 10 lần speaking part 2', icon: '♪', target: 10, value: (s) => kindN(s, 'speaking_p2') },
  { id: 'sprint-10', group: 'luyen', name: 'chạy nước rút', desc: 'xong 10 topic sprint', icon: '⏱︎', target: 10, value: (s) => kindN(s, 'topic_sprint') },
  { id: 'paraphrase-20', group: 'luyen', name: 'thợ paraphrase', desc: 'paraphrase 20 đề task 2', icon: '⇄', target: 20, value: (s) => kindN(s, 'paraphrase') },
  { id: 'part3-20', group: 'luyen', name: 'trả lời có lý lẽ', desc: 'trả lời 20 câu speaking part 3', icon: '❝', target: 20, value: (s) => kindN(s, 'speaking_p3') },

  // chính xác
  { id: 'gioi-tu-tuan', group: 'chinh-xac', name: 'tuần không sai giới từ', desc: '7 ngày liền, mỗi ngày ≥ 5 câu giới từ và không sai câu nào', icon: '⌘', target: 7, value: (s) => s.prepWeek },
  { id: 'khong-sai', group: 'chinh-xac', name: 'không sai câu nào', desc: 'một ngày làm ≥ 30 câu mà không sai câu nào', icon: '✓', target: 1, value: (s) => (s.perfectDay ? 1 : 0) },
  { id: 'combo-20', group: 'chinh-xac', name: 'combo 20', desc: 'trả lời đúng 20 câu liền', icon: '⚡︎', target: 20, value: (s) => s.bestCombo },
  { id: 'ngu-phap-100', group: 'chinh-xac', name: 'ngữ pháp vững', desc: 'làm đúng 100 câu ngữ pháp', icon: '§', target: 100, value: (s) => kindOk(s, 'grammar') },
  { id: 'ne-bay-40', group: 'chinh-xac', name: 'né 40 bẫy', desc: 'làm đúng 40 câu bẫy người việt', icon: '⚑', target: 40, value: (s) => kindOk(s, 'trap') },

  // nhịp học
  { id: 'ngay-200', group: 'nhip', name: 'ngày 200 lượt', desc: 'một ngày làm đủ 200 lượt', icon: '☄︎', target: 200, value: (s) => s.bestDay },
  { id: 'cu-dem', group: 'nhip', name: 'cú đêm', desc: 'làm ≥ 10 lượt sau 23 giờ', icon: '☾', target: 10, value: (s) => s.bestNight },
  { id: 'chim-som', group: 'nhip', name: 'chim sớm', desc: 'làm ≥ 10 lượt trước 7 giờ sáng', icon: '☀︎', target: 10, value: (s) => s.bestEarly },
  { id: 'muc-tieu-lon', group: 'nhip', name: 'mục tiêu lớn', desc: 'đạt mục tiêu ngày khi đặt từ 120 lượt trở lên', icon: '⛰︎', target: 1, value: (s) => s.bigGoalDays },
  { id: 'thu-thach-7', group: 'nhip', name: 'bảy thử thách', desc: 'hoàn thành 7 thử thách mỗi ngày', icon: '✪', target: 7, value: (s) => s.challengesDone },
  { id: 'cap-5', group: 'nhip', name: 'nửa đường lên trăng', desc: 'lên cấp 5 · thỏ hoa anh đào', icon: '❁', target: 5, value: (s) => s.level },
];

export function badgeInfo(id) {
  return BADGES.find((b) => b.id === id) || null;
}

// tiến độ một huy hiệu: { value (đã chặn ở mốc), target, ratio, done }
export function badgeProgress(badge, stats) {
  const raw = Number(badge.value(stats || {})) || 0;
  const value = Math.max(0, Math.min(raw, badge.target));
  return { value, target: badge.target, ratio: value / badge.target, done: raw >= badge.target };
}

// huy hiệu mới đạt (chưa có trong "earned")
export function newlyEarned(stats, earned = {}) {
  return BADGES.filter((b) => !earned[b.id] && badgeProgress(b, stats).done).map((b) => b.id);
}
