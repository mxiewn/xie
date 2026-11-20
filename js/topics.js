// xie · topics.js — chủ đề writing task 2 / speaking (spec: nguồn từ vựng, nhánh academic).
// dùng cho "chủ đề ưu tiên" ở onboarding và cài đặt. icon + màu riêng làm ở giai đoạn 5.

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
