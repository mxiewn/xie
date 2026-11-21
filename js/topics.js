// xie · topics.js — chủ đề writing task 2 / speaking (spec: nguồn từ vựng, nhánh academic).
// dùng cho "chủ đề ưu tiên" ở onboarding và cài đặt. icon + màu riêng của từng chủ đề từ vựng ở cuối file.

export const TOPICS = [
  { id: 'education', label: 'giáo dục' },
  { id: 'environment', label: 'môi trường' },
  { id: 'technology', label: 'công nghệ' },
  { id: 'health', label: 'sức khoẻ' },
  { id: 'work', label: 'công việc' },
  { id: 'society', label: 'xã hội & gia đình' },
  { id: 'crime', label: 'tội phạm & luật' },
  { id: 'media', label: 'truyền thông & quảng cáo' },
  { id: 'globalisation', label: 'toàn cầu hoá & văn hoá' },
  { id: 'urbanisation', label: 'đô thị hoá & nhà ở' },
  { id: 'government', label: 'chính phủ & kinh tế' },
  { id: 'science', label: 'khoa học & nghiên cứu' },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);

export const SKILLS = [
  { id: 'writing', label: 'writing', desc: 'viết câu, viết đoạn task 2' },
  { id: 'speaking', label: 'speaking', desc: 'nói trôi chảy, có ý' },
  { id: 'grammar', label: 'ngữ pháp', desc: 'câu đúng cấu trúc, ít lỗi' },
  { id: 'vocab', label: 'từ vựng', desc: 'nhớ từ và tự dùng được' },
];

export const GOAL_OPTIONS = [
  { value: 50, label: '50 lượt', desc: 'mức tối thiểu để giữ chuỗi' },
  { value: 80, label: '80 lượt', desc: 'đều tay mỗi ngày' },
  { value: 120, label: '120 lượt', desc: 'chăm, có thời gian rảnh' },
  { value: 200, label: '200 lượt', desc: 'ôn thi nước rút' },
];

export const topicLabel = (id) => TOPICS.find((t) => t.id === id)?.label ?? id;
export const skillLabel = (id) => SKILLS.find((s) => s.id === id)?.label ?? '';

// ---------- icon + màu của chủ đề từ vựng ----------
// màu là biến --tN / --tN-ink trong css/themes.css (mỗi chế độ một bộ). icon là ký hiệu chữ (font kaomoji).
const TOPIC_STYLE = {
  // sổ của tui (excel)
  'cam-xuc-so-thich': { icon: '♡', hue: 1 },
  'quan-ao-thoi-trang': { icon: '✂', hue: 7 },
  'am-nhac': { icon: '♪', hue: 6 },
  'hoc-tap-ky-nang': { icon: '✎', hue: 5 },
  'muc-tieu-thoi-quen': { icon: '✧', hue: 3 },
  'do-dung-cong-nghe': { icon: '☏', hue: 10 },
  'don-dep-ngan-nap': { icon: '❖', hue: 4 },
  'ban-be-giao-tiep': { icon: '✉', hue: 2 },
  'du-lich-di-lai': { icon: '✈︎', hue: 12 },
  'nha-o-moi-truong': { icon: '⌂', hue: 9 },
  'suc-khoe-ap-luc': { icon: '✚', hue: 8 },
  'kinh-doanh': { icon: '✦', hue: 11 },
  // academic (giai đoạn 9)
  education: { icon: '✎', hue: 5 },
  environment: { icon: '❀', hue: 4 },
  technology: { icon: '⚙︎', hue: 10 },
  health: { icon: '✚', hue: 8 },
  work: { icon: '✦', hue: 11 },
  society: { icon: '⌂', hue: 2 },
  crime: { icon: '⚖︎', hue: 12 },
  media: { icon: '☆', hue: 7 },
  globalisation: { icon: '✈︎', hue: 6 },
  urbanisation: { icon: '▦', hue: 9 },
  government: { icon: '♛', hue: 3 },
  science: { icon: '⚗︎', hue: 1 },
  // từ của tui
  'tu-cua-tui': { icon: '✿', hue: 1 },
};

export function topicStyle(id) {
  if (TOPIC_STYLE[id]) return TOPIC_STYLE[id];
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { icon: '✿', hue: (h % 12) + 1 };
}
