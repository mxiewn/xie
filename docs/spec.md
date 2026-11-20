Build cho tôi website học tiếng Anh tên "xie" (luôn viết thường).
Mục tiêu: giúp tôi đạt IELTS 6.5–7.0 và thấy vui, muốn quay lại mỗi ngày.
Triết lý cốt lõi: từ vựng phải thành OUTPUT (tôi tự dùng được khi viết và nói), không dừng ở INPUT (nhìn thấy thì nhận ra nghĩa). Mọi tính năng phải đẩy tôi TỰ NHỚ RA từ và TỰ DÙNG từ.
Trao đổi với tôi bằng tiếng Việt. Nội dung học bằng tiếng Anh, giải thích bằng tiếng Việt.

Trước khi code: đọc hết yêu cầu, viết kế hoạch ngắn (cấu trúc file, schema dữ liệu, thứ tự làm, chỗ cần tôi quyết định) rồi mới bắt đầu.

════════ 1. KỸ THUẬT ════════
- Web tĩnh thuần HTML + CSS + JavaScript (ES modules), không framework, không backend, không build step, deploy thẳng lên GitHub Pages. Chỉ dùng đường dẫn tương đối để chạy được ở link dạng username.github.io/ten-repo/.
- Cấu trúc (mọi tên file, thư mục, class, id, key JSON đều viết thường, dùng kebab-case hoặc snake_case):
  index.html
  css/ (base.css, components.css, games.css)
  js/ (app, router, storage, srs, streak, daily-goal, vocab, output, grammar, games/, voice, ui, sound)
  data/ (vocab-<topic>.json, grammar.json, upgrade.json, traps.json, prompts.json, voice.json, tips.json)
  tools/validate.js
- Điều hướng: thanh tab dưới cùng gồm trang chủ | từ vựng | luyện nói & viết | game | tui. Ngữ pháp và nâng cấp câu đặt ở tab hợp lý nhất, bạn đề xuất.
- Mobile-first, thiết kế cho màn 375px:
  • nút ≥ 44px, không cuộn ngang
  • ô nhập có font-size ≥ 16px (iOS không tự zoom)
  • dùng 100dvh, tôn trọng safe-area-inset
  • touch-action: manipulation cho nút game
  Desktop vẫn phải đẹp.
- Lưu dữ liệu bằng localStorage, bọc try/catch, có số version schema để nâng cấp sau này. Chỉ tải JSON của chủ đề khi cần.
- Phát âm bằng Web Speech API (speechSynthesis). Chọn được giọng en-GB / en-US và tốc độ đọc. Không hỗ trợ thì ẩn nút, không báo lỗi.
- KHÔNG dùng micro, KHÔNG ghi âm, KHÔNG nhận diện giọng nói.
- Âm thanh hiệu ứng tạo bằng Web Audio API (không dùng file có bản quyền), có nút tắt. Rung nhẹ bằng navigator.vibrate khi máy hỗ trợ.
- README tiếng Việt: cách bật GitHub Pages; cách thêm từ, câu hỏi, câu thoại, kaomoji (kèm mẫu JSON); cách chạy tools/validate.js.

════════ 2. LOWERCASE ════════
- TOÀN BỘ chữ giao diện viết thường. Gồm: tiêu đề, tab, nút, nhãn, thông báo, thoại, onboarding, tên level, tên huy hiệu, thẻ <title>, tên chủ đề, cài đặt, trang trống, lỗi. Tên người dùng cũng hiển thị viết thường.
- Viết thường ngay trong source. Thêm class .ui (text-transform: lowercase) cho vùng giao diện làm lưới an toàn.
- NGOẠI LỆ, giữ viết hoa đúng chuẩn tiếng Anh:
  • câu ví dụ, câu mẫu band 7, đề Writing, câu hỏi Speaking, câu trong bài ngữ pháp, đáp án viết lại câu
  • danh từ riêng, chữ "I"
  • IPA giữ nguyên
  (Lý do: IELTS chấm cả viết hoa, web không được dạy sai.)
  Từ vựng đơn lẻ trên thẻ thì viết thường như từ điển.
- Khi chấm đáp án gõ: không phân biệt hoa thường. Riêng bài viết lại câu thì nhắc nhẹ nếu quên viết hoa đầu câu.

════════ 3. PHONG CÁCH: COQUETTE + THỎ ════════
- Nền trắng TUYẾT (#FFFFFF, #FCFCFF), tuyệt đối không dùng trắng ngà hay kem.
  Hồng phấn (#F8C8DC, #FBE3EC), điểm nhấn hồng hoa hồng (#E57A9C), chữ chính nâu cacao đậm (#5A3E3E).
  Độ tương phản đạt WCAG AA.
- Chi tiết: nơ satin, viền ren, ngọc trai, trái tim, gingham hồng rất nhạt, hoa anh đào, góc bo lớn, bóng mềm. Tất cả tự vẽ bằng CSS/SVG, không dùng ảnh có bản quyền.
- Linh vật: bé thỏ trắng tuyết đeo nơ hồng, SVG tự vẽ, nhân vật gốc không giống nhân vật có sẵn nào. Trạng thái:
  vui, buồn nhẹ, ngủ, nhảy múa, cầm cà rốt, ôm tim, đội vương miện, cầm bút, cầm micro (chỉ trang trí), quấn khăn (dùng freeze).
  Đứng yên thì thở nhẹ và nháy mắt ngẫu nhiên.
- Font BẮT BUỘC hỗ trợ đầy đủ tiếng Việt, Google Fonts subset vietnamese:
  • tiêu đề: "Mali" hoặc "Baloo 2"
  • nội dung: "Nunito" hoặc "Quicksand"
  Thêm display=swap + font dự phòng. Kiểm tra chuỗi "ẩn ẵ ậ ữ ỷ ơ ư đ ộ ỡ ặ ừ ẫ" ở mọi cỡ chữ, không rơi font, không lệch dấu.
- Hoạt ảnh nhẹ: lật thẻ, tim hoặc hoa anh đào bay khi đúng, thỏ nhún nhảy, confetti hình nơ khi lên level. Tôn trọng prefers-reduced-motion.

════════ 4. GIỌNG NÓI CỦA XIE ════════
Xie nói chuyện như đứa bạn thân GenZ nhắn tin: ngắn, tự nhiên, hơi khô và có duyên, luôn đứng về phía tôi.

Xưng hô (áp dụng cho TOÀN BỘ chữ trên web):
- Web luôn xưng "tui".
- Gọi người dùng là "bạn". Ở màn chào mở đầu, trang chủ và khoảnh khắc lớn (lên level, mốc streak, quay lại sau nhiều ngày) thì gọi bằng {name}.

Ngôn ngữ:
- Tỉ lệ gợi ý trong kho thoại:
  • ~45% tiếng Việt có chút GenZ
  • ~25% tiếng Việt ấm áp bình thường
  • ~30% có tiếng Anh, gồm cả câu TOÀN tiếng Anh
- Câu tiếng Anh phải đúng ngữ pháp và tự nhiên như người bản xứ trẻ nói. Được viết tắt kiểu chat (rn, lil, ngl) nhưng tiết kiệm.
- Từ GenZ được dùng (mỗi câu tối đa 1): khét, xịn, chuẩn bài, out trình, ăn trọn, gét gô, keo, khum, hông, xỉu, ủa alo, chill, flex, real, mood, green flag, ổn áp, slay (rất hạn chế), bestie (rất hạn chế).
- Phần GIẢI THÍCH kiến thức (nghĩa, ngữ pháp, lỗi sai) viết rõ ràng, chuẩn, không lóng.

CẤM:
- từ "lầy" và "lầy lội" ở bất kỳ đâu
- chê bai hoặc gây áp lực: lười, kém, tệ, dở, ngu; so sánh với người khác; chế giễu khi sai
- giọng công sở hoặc sách giáo khoa trong thoại ("chúc mừng bạn đã hoàn thành nhiệm vụ")

CHỐNG CRINGE (bắt buộc):
- Đọc to câu lên: nghe phải như bạn bè nhắn tin thật, không như quảng cáo, poster động lực hay bài đăng fanpage.
- Tối đa 1 từ lóng mỗi câu. Không chồng lóng, không nhồi lóng cho có.
- Humor đến từ TÌNH HUỐNG học (từ vựng, giới từ, examiner, cà rốt, chính con thỏ), không đến từ việc dùng lóng.
- Không giải thích câu đùa. Không kết bằng "haha", "hihi", "kkk".
- Không triết lý sáo rỗng ("thành công đến từ nỗ lực", "the comeback is stronger than the setback", "believe in yourself").
- Không meme brainrot hoặc lỗi thời: skibidi, rizz, sigma, gyatt, ohio, aura +…, đỉnh nóc kịch trần (bay phấp phới), chằm zn, trẻ trâu, keo lì tái châu, hết nước chấm.
- Không baby talk quá đà (iu iu, cục cưng, dạ dạ). Không tự nhận "gen z tụi mình".
- Kéo dài chữ tối đa 3 ký tự ("cônggg" được, "quááááá" không). Tối đa 1 dấu chấm than. Không thêm emoji rời ngoài kaomoji (tối đa 1 emoji đồ vật như 🥕).
- Độ dài: câu tiếng Việt ≤ 14 từ, câu tiếng Anh ≤ 12 từ.
- Quy trình duyệt:
  1. Viết GẤP ĐÔI số câu cần cho mỗi nhóm.
  2. Tự chấm từng câu theo thang cringe 1–5 (1 = tự nhiên, 5 = muốn độn thổ). Chỉ giữ câu điểm ≤ 2.
  3. Ghi các câu bị loại và lý do vào tools/lines-review.md để tôi xem.
  4. Sau đó đọc lại cả nhóm một lượt để chắc không có hai câu cùng một kiểu đùa.

CHỐNG LẶP:
- Câu mẫu ở mục 5 CHỈ LÀ MẪU PHONG CÁCH. Tối đa 15% kho được lấy nguyên văn từ mẫu, còn lại tự viết mới, không trùng ý.
- Số lượng:
  • nhóm hay hiện (đúng, sai, chào, chạm thỏ, nhắc học): ít nhất 40 câu
  • nhóm còn lại: ít nhất 15 câu
- Ghép mảnh để tăng độ đa dạng: [mở đầu tuỳ chọn] + [thân câu] + [đuôi tiếng Anh tuỳ chọn] + [kaomoji].
  Mở đầu ví dụ: "ê {name},", "khoan,", "ủa,". Đuôi ví dụ: "no cap.", "we move.", "noted.".
  Mỗi mảnh có kho riêng. Chỉ ghép khi câu vẫn tự nhiên; câu nào đã đủ ý thì không gắn thêm.
- Nhớ 15 câu gần nhất của mỗi nhóm (lưu localStorage). Không hiện lại các câu này. Ưu tiên câu chưa hiện trong 7 ngày.
- Mật độ thoại:
  • trả lời đúng thường: thoại khoảng 1/3 lần, còn lại chỉ có kaomoji và hiệu ứng
  • sự kiện lớn: luôn có thoại
  • cài đặt "thỏ nói nhiều / vừa / ít"
- Thoại theo ngữ cảnh: giờ trong ngày, độ dài streak, độ chính xác hôm nay, số lượt còn thiếu, số phút đã học, số ngày đến kỳ thi.
- Bong bóng thoại hiện cạnh thỏ, tự ẩn sau 3–5 giây, chạm thì ẩn.

════════ 5. TÌNH HUỐNG: KAOMOJI + CÂU THOẠI ════════
Lưu trong data/voice.json dạng { "tinh_huong": { "kaomoji": [...], "lines": [...], "conditions": {...} } }.

Kaomoji:
- Hiển thị trong <span class="kao"> với font hệ thống: system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Sans", "Noto Sans Symbols 2", sans-serif. Không dùng font tiêu đề/nội dung.
- white-space: nowrap. Kaomoji nhiều dòng dùng <pre class="kao-art">.
- Kiểm tra trên iOS Safari và Chrome Android. Cái nào hiện ô vuông hoặc lệch thì XOÁ, không thay bằng ký tự lạ khác.
- Mỗi nhóm ít nhất 20 kaomoji (bổ sung đúng tinh thần nhóm), không lặp 3 cái gần nhất.

Biến: {name} {streak} {n} {left} {word} {days} {level} {minutes} {goal}

[chào mở đầu / onboarding]
kao: (˶ᵔ ᵕ ᵔ˶)ﾉ | ₍ᐢ•ﻌ•ᐢ₎ ? | ( ˶ˆᗜˆ˵ ) | ૮ ・ﻌ・ა ? | (◍•ᴗ•◍)ゝ | ヾ(・ω・*)ノ | ( ´ ꒳ ` )ﾉ♡ | (｡•̀ᴗ-)✧ | (｡･ω･｡)ﾉ♡ | ( ˊᵕˋ )ﾉ | (っ ᵔ◡ᵔ)っ | ʕ•ᴥ•ʔﾉ | (✿◠‿◠) | (｡◕‿◕｡) | (ᵔᴥᵔ)
mẫu:
- "hii, tui là thỏ của xie. bạn tên gì?"
- "{name}. tên đẹp, tui nhớ rồi"
- "welcome to your ielts era, {name}"
- "setup xong. gét gô"

[chào sáng]
kao: (˶ᵔ ᵕ ᵔ˶)☀︎ | ₍ᐢ. .ᐢ₎ ♡ | ૮ ˶ᵔ ᵕ ᵔ˶ ა | (っ˘ω˘ς )☕ | ⸜(｡˃ ᵕ ˂ )⸝♡ | ヾ(˶ᵔ ᗜ ᵔ˶)ﾉ | (*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ | ( ˘▽˘)っ🍵 | (๑˃̵ᴗ˂̵)و | (◕ᴗ◕✿) | ✿◕ ‿ ◕✿ | (*^▽^*) | (◠‿◠✿) | ٩(｡•́‿•̀｡)۶ | (⑅˘꒳˘)
mẫu:
- "sáng rồi {name}. vài từ vựng thay cà phê hông?"
- "good morning. your brain is fresh, let's use it"
- "rise and grind? nah. rise and review"

[chào trưa/chiều]
kao: ( ´ ▽ ` )ﾉ | (｡･ω･｡)ﾉ♡ | ૮ ・ﻌ・ა ♪ | (◍•ᴗ•◍)✧ | (˶˃ ᵕ ˂˶) 🍓 | ( ◜‿◝ )♡ | (๑•ᴗ•๑)♡ | (っ˘ڡ˘ς)🍰 | (｡♥‿♥｡) | (◡‿◡✿) | (´꒳`)ﾉ | (ɔ◔‿◔)ɔ ♥ | (っ´▽`)っ | (｡•ᴗ•｡)♡
mẫu:
- "chiều buồn ngủ hả. một ván game là tỉnh"
- "afternoon slump? we fight it with vocabulary"
- "ủa alo, đúng giờ học luôn nè"

[chào tối/khuya]
kao: (ᴗ˳ᴗ)ᶻ𝗓𝐰 | ( ˘ᵕ˘ ) ☾ | ₍ᐢ‥ᐢ₎ zZ | (っ- ‸ – ς) | ૮ ˶ᵕ ༝ ᵕ˶ა ⋆｡˚☽ | (｡-ω-)zzz | (∪｡∪)｡｡｡zzZ | ( ˶˘ ᵕ ˘˶ )🌙 | (－ω－) zzZ | (˘ω˘) | (－_－) zzZ | ( ˘ω˘ )ｽﾔｧ | (っ˕ -｡) | (⸝⸝ᵕᴗᵕ⸝⸝)
mẫu:
- "khuya rồi {name}, học xíu rồi ngủ nha"
- "fun fact: your brain saves new words while you sleep. so… sleep"

[đúng]
kao: (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ | ٩(ˊᗜˋ*)و ♡ | (๑˃ᴗ˂)ﻭ | ( ˶ˊᵕˋ)੭♡ | ₍ᐢ•ﻌ•ᐢ₎ ♡ | (,,> ᴗ <,,) | ✧˖°(◕ᴗ◕✿) | (≧◡≦) ♡ | ٩(◕‿◕｡)۶ | (๑>◡<๑) | ヽ(・∀・)ﾉ | (*≧ω≦*) | ヽ(>∀<☆)ノ | ＼(^o^)／ | (☆▽☆) | o(≧▽≦)o | ヾ(≧▽≦*)o | ⸜(*ˊᗜˋ*)⸝ | (ﾉ^ヮ^)ﾉ*:・ﾟ✧
mẫu:
- "ok ngon rồi, ráng tí nữa là ielts 9.0"
- "khét"
- "examiner nhìn câu này chắc gật đầu"
- "correct. obviously."
- "that's a w. logging it."
- "the prepositions fear you now"

[combo đúng liên tiếp]
kao: ₍₍ ◝(•̀ㅂ•́)◟ ⁾⁾ | ⁽⁽◝( ˙ ꒳ ˙ )◜⁾⁾ | ᕙ( •̀ ᗜ •́ )ᕗ | ☆ﾟ.*･｡ﾟ(ﾉ´ヮ`)ﾉ | ✩°｡⋆⸜(ˊᗜˋ )⸝ | ( •̀ ω •́ )✧ | ♪┏(・o･)┛♪ | ٩( ᐛ )و | ┌(・。・)┘♪ | └(・。・)┐ | (〜￣▽￣)〜 | 〜(￣▽￣〜) | ヘ(￣ω￣ヘ) | (ノ￣ω￣)ノ | (ง ˙o˙)ว
mẫu:
- "{n} câu liền rồi, đừng dừng"
- "let them cook. người đang cook là bạn"
- "{n} in a row. who taught you this? oh wait, me"

[điểm tuyệt đối]
kao: ✧*。٩(ˊᗜˋ*)و✧*。 | (ﾉ≧∀≦)ﾉ | ☆*:.｡.o(≧▽≦)o.｡.:*☆ | ヽ(♡‿♡)ノ | ✿ヽ(•▽•)ノ✿ | (っ˘ڡ˘ς)🥕 | (/≧▽≦)/ | (ﾉ´ヮ`)ﾉ*: ･ﾟ | (｡♥‿♥｡) | w(°ｏ°)w
mẫu:
- "error 404: mistakes not found"
- "you ate. no crumbs left"
- "không sai câu nào, flex được rồi đó"

[sai]
kao: (｡•́︿•̀｡) | (っ◞‸◟ c) | (ó﹏ò｡) | ( •̯́ ₃ •̯̀) | (｡ŏ﹏ŏ) | ₍ᐢ. ̫.ᐢ₎ ? | (・_・;) | (>﹏<) | (｡>﹏<｡) | (〃＞＿＜;〃) | (´・ω・`) | (｡•́ - •̀｡) | (◞‸◟) | (´ . .̫ . `) | (ノ_<。) | (⊙_⊙;)
mẫu:
- "hông sao, thất bại là mẹ thành cônggg"
- "bình tĩnh, tự tin, không cay cú"
- "sai ở đây free. sai trong phòng thi mới tốn tiền"
- "even native speakers mess this up. probably."
- "ghi vào sổ lỗi rồi, lần sau nó hết đường chạy"

[sai nhiều lần liền / an ủi]
kao: (づ ᴗ _ᴗ)づ♡ | ( ˘͈ ᵕ ˘͈♡) | (っ˘̩╭╮˘̩)っ | ૮ ˶• ﻌ •˶ ა ♡ | (๑´•.̫ • `๑) | ʚ♡ɞ | (づ｡◕‿‿◕｡)づ | (´｡• ᵕ •｡`) ♡ | (っ´ω`)ﾉ | (つ≧▽≦)つ | ⊂(・﹏・⊂) | (っ ᵔ◡ᵔ)っ | (∩˃o˂∩)♡ | (ㅅ´ ˘ `)
mẫu:
- "từ này keo thật. nhưng bạn keo hơn"
- "nghỉ 10 giây, uống miếng nước rồi quay lại"
- "hard words stick longer. that's science. kind of."

[gợi ý]
kao: (｡•̀ᴗ-)✧ | ( ˙꒳​˙ )ゞ | (・ω・)ノ💡 | ₍ᐢ. .ᐢ₎ ? | ( ⸝⸝´꒳`⸝⸝) | (๑•̀ㅁ•́๑)✧ | ( ◕ᴗ◕)っ📖 | (¬‿¬) | (≖ᴗ≖๑) | (￣ー￣) | (｡・ω・｡)? | ( •̀ - •́ ) | (・・ ) ?
mẫu:
- "psst. chữ cái đầu nè"
- "i'm not saying it starts with that letter. but it does"

[nghe phát âm]
kao: ( ˘▽˘)っ🎧 | (・ω・)ﾉ🔊 | ₍ᐢ. .ᐢ₎🎧 | ( ˶ˊᵕˋ)🎵 | ♪(´ε｀ ) | ♪～(￣ε￣) | (ᵔᴥᵔ)♪
mẫu:
- "repeat after me. yes, out loud"

[tự viết câu / viết đoạn]
kao: ( ˶ˊᵕˋ)✍ | (๑•̀ᴗ•́)و ✎ | ₍ᐢ. .ᐢ₎✎ | (｀・ω・´)ゞ✎ | φ(゜▽゜*)♪ | ✍(◔◡◔) | _φ(°-°=) | φ(．．) | _〆(・∀・＠) | (•̀ᴗ•́)و ✎
mẫu:
- "câu tự viết mới là từ của bạn thật"
- "câu này mà vào writing là có điểm vocab"
- "writer era: on"

[nói to / speaking]
kao: ( ˶ˆᗜˆ˵ )🎤 | (っ˘ω˘ς )♪ | ヾ(´〇`)ﾉ♪♪♪ | ₍ᐢ•ﻌ•ᐢ₎🎤 | (ﾉ´ з `)ノ | (`•ω•´)ゞ
mẫu:
- "nói to lên, nói sai cũng được"
- "hàng xóm nghe thì coi như họ học ké"
- "the mic is yours. well, imaginary mic."

[từ mới / từ của ngày]
kao: ✧˖°(◕ᴗ◕✿) | ₍ᐢ•ﻌ•ᐢ₎✨ | (๑˃ᴗ˂)ﻭ📖 | ( ˶ˆ꒳ˆ˵ )✨ | (☆▽☆) | (｡◕‿◕｡)
mẫu:
- "từ hôm nay: {word}. nghe sang hông"
- "new word unlocked: {word}"

[từ thành OUTPUT]
kao: ૮ ˶ᵔ ᵕ ᵔ˶ ა 🎀 | ✧*。٩(ˊᗜˋ*)و✧*。 | ヽ(♡‿♡)ノ | ⸜(｡˃ ᵕ ˂ )⸝♡ | (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
mẫu:
- "{word} giờ là từ của bạn. no take-backs"
- "{word} has joined your active vocabulary. welcome"

[tiến độ trong ngày: còn ít lượt]
kao: (ง •̀_•́)ง | (๑•̀ㅂ•́)و✧ | ( •̀ ω •́ )✧ | (｀・ω・´) | ᕦ(ò_óˇ)ᕤ
mẫu:
- "còn {left} lượt nữa là giữ chuỗi"
- "{left} more. you're basically there"

[streak giữ]
kao: ₍ᐢ. .ᐢ₎♡ | (๑ᵔ⤙ᵔ๑)🎀 | ପ(๑•ᴗ•๑)ଓ ♡ | ٩(๑❛ᴗ❛๑)۶ | (˶ᵔ ᵕ ᵔ˶)🎀 | (ﾉ´ヮ`)ﾉ | (✿◠‿◠) | (｡♥‿♥｡)
mẫu:
- "{streak} ngày liền. đều tay ghê"
- "{streak} days. consistency looks good on you"

[mốc streak 7/30/100 + nhận freeze]
kao: ૮ ˶ᵔ ᵕ ᵔ˶ ა 🎁 | ✧*。٩(ˊᗜˋ*)و✧*。🧊 | ヽ(♡‿♡)ノ👑 | (ﾉ≧∀≦)ﾉ | (っ˘ڡ˘ς)❄︎ | ☆*:.｡.o(≧▽≦)o.｡.:*☆
mẫu:
- "7 ngày rồi. tặng bạn một bé băng giữ chuỗi, cất đó xài khi cần"
- "milestone unlocked. the bunny is proud"

[dùng freeze]
kao: (⸝⸝ᵕᴗᵕ⸝⸝) ❄︎ | ₍ᐢ. .ᐢ₎🧊 | (づ ᴗ _ᴗ)づ🧊 | ૮ ˶ᵕ ༝ ᵕ˶ა ❆ | ( ˘ ³˘)♥
mẫu:
- "hôm qua bạn vắng, băng giữ chuỗi cứu kịp rồi"
- "streak saved. you owe me a carrot"

[mất streak]
kao: (˚ ˃̣̣̥⌓˂̣̣̥ ) | ( ˃̣̣̥ᯅ˂̣̣̥ ) | (◞‸◟；) | (´｡• ᵕ •｡`) | (｡╯︵╰｡) | (´；ω；`)
mẫu:
- "chuỗi đứt rồi. ngày 1 mới, tui vẫn ở đây"
- "kỷ lục {n} ngày vẫn là của bạn. giờ làm phần 2"
- "new season, same main character"

[quay lại sau nhiều ngày]
kao: (*´▽`*) | ૮ ˶ᵔ ᵕ ᵔ˶ ა | (っ˘ω˘ς ) | ヾ(・ω・*)ノ | (づ￣ ³￣)づ | (つ≧▽≦)つ | (ノ´ з `)ノ
mẫu:
- "{name}! đi đâu mất tiêu, tui nhớ xỉu"
- "look who's back. hi"

[xong mục tiêu ngày]
kao: (˶˃ ᵕ ˂˶) ♡ | ( ´ ▽ ` )ﾉ🥕 | ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა 🎀 | (๑˘︶˘๑) ✿ | ₍ᐢ•ﻌ•ᐢ₎🥕 | ( ˶ˆ꒳ˆ˵ )🥕 | (*´ڡ`●) | (っ˘ڡ˘ς)
mẫu:
- "{goal}/{goal}. hôm nay xong rồi, đi chill đi"
- "mission complete. here's your carrot"

[lên level / huy hiệu]
kao: ✧*。٩(ˊᗜˋ*)و✧*。 | ⸜(｡˃ ᵕ ˂ )⸝♡ | (ﾉ´ヮ`)ﾉ*: ･ﾟ👑 | ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧ | (ﾉ≧∀≦)ﾉ🎀 | w(°ｏ°)w | ( ˶°ㅁ°) !!
mẫu:
- "lên level rồi {name}. giờ bạn là {level}"
- "level up. same you, bigger vocabulary"

[nhắc học / thỏ chờ]
kao: (・・ ) ? | ૮ ・ﻌ・ა ... | (｡･ω･｡)ﾉ♡ | (っ˘ω˘ς ) | ₍ᐢ. .ᐢ₎ | (´・ω・`)? | ( ꒪⌓꒪)
mẫu:
- "5 phút thôi, hứa"
- "{n} từ đang chờ ôn, tụi nó nhớ bạn"
- "your streak is looking at you. kindly."

[nghỉ giải lao — học quá 25 phút]
kao: ( ˘ω˘ )🍵 | (っ˘ڡ˘ς)🍓 | ₍ᐢ‥ᐢ₎ ☁︎ | (￣▽￣)ノ
mẫu:
- "học {minutes} phút rồi. đi touch grass xíu"

[đếm ngược ngày thi]
kao: (ง •̀_•́)ง | ᕙ( •̀ ᗜ •́ )ᕗ | (๑•̀ㅂ•́)و✧ | (ง'̀-'́)ง | ( •̀ᴗ•́ )و ̑̑ | ᕦ(ò_óˇ)ᕤ
mẫu:
- "còn {days} ngày. chưa phải lúc hoảng, là lúc tăng tốc"
- "{days} days left. plenty of time to become dangerous"

[minigame: bắt đầu / thắng / kỷ lục / thua]
kao: (ง •̀_•́)ง | ₍ᐢ•ﻌ•ᐢ₎ ready? | ٩(ˊᗜˋ*)و 🏆 | ( ˶°ㅁ°) !! | Σ(°△°|||)︴ | (っ˘̩╭╮˘̩)っ | (｡ŏ﹏ŏ) | ε=ε=(ノ≧∇≦)ノ
mẫu:
- "ready? gét gô"
- "new high score. the carrots are shaking"
- "ván này là khởi động thôi. run it back?"

[chạm thỏ]
kao: (˶ᵔ ᵕ ᵔ˶) | ₍ᐢ. .ᐢ₎ ? | ( ⸝⸝´꒳`⸝⸝) | ૮ ˶ᵕ ༝ ᵕ˶ა | (｡•̀ᴗ-)✧ | ʕ•ᴥ•ʔ | (〃▽〃) | (*/ω＼*) | (//▽//) | (⊙ˍ⊙)
mẫu:
- "ơi? gọi tui hả"
- "fun fact: 'procrastinate' là việc bạn đang làm khi chọc tui"
- "tap me again and i'm giving you a quiz"
- "đã chọc tui {n} lần. tui đếm hết đó"
(Nhóm này nên có nhiều fun fact từ vựng thật, ngắn, chính xác.)

[đã lưu / đã xoá]
kao: (•ᴗ•)♡ | ₍ᐢ. .ᐢ₎📌 | ( ˘ ³˘)♥ | (・_・)ノ | (っ ᵔ◡ᵔ)っ
mẫu:
- "saved. safe and sound"

[trang trống / lỗi / đang tải]
kao: ( ˙꒳​˙ ) | ૮ ・ﻌ・ა | (・・ ) ? | ⊂(・▽・⊂) | (˶ᵔ ᵕ ᵔ˶) ₊˚⊹ | ε=ε=┌( >_<)┘ | ┐(￣ヘ￣)┌
mẫu:
- "ở đây trống trơn. tạo cái đầu tiên nha"
- "ủa alo, có gì đó sai sai. thử lại giùm tui"
(Màn hình tải: kèm 1 mẹo ielts ngắn, chính xác, từ kho ít nhất 40 mẹo.)

[trang trí / ngăn cách]
୨୧ | ʚ♡ɞ | ⊹₊ ˚‧︵‿₊୨୧₊‿︵‧ ˚ ₊⊹ | ✧˖° | ⋆｡‧˚ʚ🍓ɞ˚‧｡⋆ | ˗ˋˏ ♡ ˎˊ˗ | ‧₊˚✧ | ⋆｡˚ ☁︎ ˚｡⋆ | ✿ ❀ ✿ | ♡︎ ⋆ ♡︎ | ❀˖° | ⋆˙⟡

[thỏ ASCII nhiều dòng — trang chủ, trang trống]
(\_/)
( •.•)
/ >🥕

 /)/)
( . .)
( づ♡

(\(\
( -.-)
o_(")(")

════════ 6. MỤC TIÊU HẰNG NGÀY: 50 LƯỢT ════════
Để được tính streak trong ngày, phải đạt ÍT NHẤT 50 lượt.

Cách tính lượt:
- 1 lượt = 1 câu trả lời được chấm: thẻ nhận biết, nhớ lại, dùng có hướng dẫn, câu ngữ pháp, câu trong game, bẫy người Việt.
- Hoạt động OUTPUT tính nhiều hơn:
  • tự viết 1 câu (mức 4): 3 lượt
  • paraphrase đề: 5 lượt
  • speaking part 1: 3 lượt
  • speaking part 3: 5 lượt
  • topic sprint: 10 lượt
  • speaking part 2: 10 lượt

Điều kiện:
- Trong 50 lượt phải có ÍT NHẤT 10 lượt từ OUTPUT.
- Lượt từ minigame tính tối đa 25 cho mục tiêu streak (vẫn được XP đầy đủ).

Chống "cày" ảo:
- Trả lời lại đúng câu đó trong vòng 10 phút thì không tính.
- Trả lời nhanh hơn 1 giây liên tục thì không tính.
- Bài output dưới 5 từ thì không tính.

Hiển thị và cài đặt:
- Mục tiêu chọn được 50 (tối thiểu, mặc định) / 80 / 120 / 200. Không cho chọn dưới 50.
- Trang chủ có vòng tiến độ "32/50 lượt", kèm thanh nhỏ "output 6/10". Thỏ cầm củ cà rốt lớn dần theo tiến độ.
- Ở 25 lượt và khi còn ≤ 5 lượt thì hiện thoại nhóm "tiến độ trong ngày".

════════ 7. CÁ NHÂN HOÁ ════════
- Onboarding 5 bước, vuốt qua lại, thỏ dẫn dắt:
  tên gọi → band mục tiêu (6.5 / 7.0) → ngày thi (tuỳ chọn, hiện đếm ngược) → mục tiêu lượt mỗi ngày → chủ đề ưu tiên + kỹ năng yếu nhất (writing / speaking / ngữ pháp / từ vựng).
- Trang chủ gồm:
  • lời chào theo giờ (Asia/Saigon) gọi bằng {name}
  • thỏ + bong bóng thoại
  • vòng tiến độ 50 lượt
  • streak + lịch nơ
  • số từ trong kho OUTPUT
  • từ của ngày
  • đếm ngược kỳ thi
  • nút "học hôm nay"
- "kế hoạch hôm nay" tự sinh cho đủ mục tiêu lượt, ưu tiên kỹ năng yếu: ôn từ đến hạn → từ mới (mặc định 8/ngày, chỉnh được) → bài output (đủ ≥ 10 lượt) → minigame → ngữ pháp.
- Sổ lỗi sai: tự lưu mọi câu sai, phân loại (nghĩa, word form, giới từ, collocation, ngữ pháp, bẫy người Việt). Có chế độ "ôn lỗi sai".
- "câu của tui": lưu mọi câu và đoạn tôi tự viết. Lọc theo từ, chủ đề, ngày. Đánh dấu câu đã được claude chấm.
- "từ của tui": form thêm từ gặp ngoài đời (bắt buộc từ + nghĩa, còn lại tuỳ chọn), tự vào SRS.
- Thống kê (tab tui):
  • số từ ở từng mức, số từ OUTPUT
  • độ chính xác theo loại bài, biểu đồ lượt 14 ngày
  • điểm yếu nhất nói bằng lời dễ hiểu ("bạn hay sai giới từ sau tính từ")
- Cài đặt:
  • tên, mục tiêu band, ngày thi, mục tiêu lượt, số từ mới mỗi ngày
  • mặt trước thẻ, giọng và tốc độ đọc
  • âm thanh, rung, cỡ chữ
  • thỏ nói nhiều / vừa / ít
  • xuất / nhập / xoá dữ liệu (xoá phải xác nhận 2 lần)

════════ 8. TỪ VỰNG (TRỌNG TÂM) ════════
Mỗi từ có đủ các trường sau (schema JSON rõ ràng; trường nào không có thì để rỗng, KHÔNG BỊA):
- word, IPA (UK), loại từ, nghĩa tiếng Việt (ngắn + chi tiết)
- word family: noun / verb / adjective / adverb + dạng phủ định nếu có (vd: sustain → sustainable → sustainability → sustainably → unsustainable)
- giới từ đi kèm, kèm ví dụ ngắn (vd: beneficial to sb, have an impact on sth)
- collocations chia nhóm: động từ + từ, tính từ + từ, từ + danh từ (vd: pose a threat, a significant impact, heavily reliant on)
- ngữ cảnh và sắc thái:
  • dùng khi nào
  • trang trọng hay thân mật
  • hợp writing, speaking hay cả hai
  • khác gì từ gần nghĩa
  • cảnh báo nếu quá informal cho writing
- lỗi người Việt hay mắc ("discuss about" ✗)
- ít nhất 4 ví dụ khác ngữ cảnh: writing task 2, speaking part 1, speaking part 3, đời thường (viết hoa đúng chuẩn)
- đồng nghĩa (kèm sắc thái), trái nghĩa
- chủ đề, mức (B2/C1), nhãn "band booster" nếu là từ đắt giá

Thẻ học:
- Nút chuyển mặt trước: EN → VI, VI → EN, ngẫu nhiên. Nhớ lựa chọn.
- Mặt sau chia tab: nghĩa | word form | giới từ & collocation | ngữ cảnh | ví dụ | lỗi hay gặp.
- Nghe được từ và từng ví dụ.

Bốn mức thành thạo, đi qua lần lượt:
1. Nhận biết: nhìn hoặc nghe từ, chọn nghĩa.
2. Nhớ lại: nhìn nghĩa hoặc ngữ cảnh tiếng Việt, GÕ ra từ. Cho sai 1 ký tự với từ dài; gợi ý lần lượt chữ cái đầu → số ký tự → collocation.
3. Dùng có hướng dẫn: điền word form, chọn hoặc gõ giới từ, ghép collocation, sửa câu sai chứa từ.
4. Dùng tự do (OUTPUT): TỰ VIẾT 1 câu theo đề gợi ý, hoặc nói to 1 câu trả lời speaking có dùng từ rồi tự tick.
   Sau đó hiện câu mẫu band 7 + checklist tự chấm (đúng word form? đúng giới từ? collocation tự nhiên? hợp ngữ cảnh?).

"kho từ OUTPUT": một từ được tính khi qua mức 4 ít nhất 2 lần ở 2 ngày khác nhau. Đây là thước đo chính trên trang chủ.

Lặp lại ngắt quãng:
- SM-2 rút gọn (hoặc Leitner 5 hộp), theo dõi riêng từng mức.
- Ôn từ đến hạn trước, trộn chủ đề. Sai hoặc bấm "khó" thì quay lại sớm. Từ OUTPUT vẫn ôn thưa để không quên.

"nhờ claude chấm":
- Gom câu tôi viết hôm nay thành prompt hoàn chỉnh, copy vào clipboard.
- Prompt gồm: band mục tiêu, từ mục tiêu, câu của tôi, yêu cầu chấm word form, giới từ, collocation, độ tự nhiên, sửa lỗi, và bản nâng cấp band 7.
- Có nút đánh dấu "đã chấm" và ô dán lại câu đã sửa.

════════ 9. LUYỆN OUTPUT: VIẾT & NÓI (KHÔNG GHI ÂM) ════════
1. topic sprint (writing):
   - Chọn chủ đề task 2 → đề + 3 từ mục tiêu + 1 linking word → viết 2–4 câu kiểu thân bài, đồng hồ 5 phút.
   - Sau đó: checklist (đủ từ chưa? có câu phức? có ví dụ cụ thể?), đoạn mẫu tham khảo, nút "nhờ claude chấm".
2. paraphrase đề: gõ lại đề task 2 theo cách khác. So với 2–3 bản mẫu và chỉ ra kỹ thuật (đổi word form, đổi cấu trúc, đồng nghĩa).
3. speaking part 1: câu hỏi + 2 từ mục tiêu, đồng hồ 30 giây, nói to, tự tick từ đã dùng.
4. speaking part 2 cue card:
   - 1 phút chuẩn bị (có ô ghi chú) → 2 phút nói, kèm 3–4 từ mục tiêu.
   - Xong thì tự tick từ đã dùng + checklist tự đánh giá (nói đủ 2 phút? có ví dụ? có ngắt quãng dài không?).
   - Tuỳ chọn: gõ lại ý chính để gửi "nhờ claude chấm".
5. speaking part 3: câu hỏi mở rộng + khung trả lời (ý chính → lý do → ví dụ) + từ mục tiêu, tự tick.
- Mọi bài output lưu vào "câu của tui", tính cho mức 4 của từ đã dùng và tính lượt output.

════════ 10. MINIGAME (BẮT BUỘC, ÍT NHẤT 8) ════════
Dùng kho từ của chính tôi, ưu tiên từ đang học, từ hay sai và "từ của tui". Mỗi game có:
- điểm cao nhất, combo, độ khó tăng dần
- kaomoji + thoại đúng nhóm, âm thanh nhẹ
- mượt trên cảm ứng, ván ngắn 1–3 phút

Danh sách game:
1. bunny hop: đúng thì thỏ nhảy qua một ô tới củ cà rốt, sai thì trượt lại. Câu hỏi trộn nghĩa, word form, giới từ.
2. word form ladder: leo thang bằng cách điền đúng noun/verb/adj/adv vào từng câu.
3. preposition pop: bong bóng chứa giới từ bay lên, chạm đúng giới từ trước khi bóng bay mất.
4. collocation match: lật thẻ trí nhớ ghép cặp (pose ↔ a threat), có đếm giờ.
5. sentence unscramble: kéo thả mảnh thành câu học thuật đúng.
6. upgrade it!: câu đơn giản ("Technology is very good for students") → chọn hoặc gõ bản band 7.
7. speed spell: nghe phát âm rồi gõ lại từ, có combo.
8. spot the trap: chạm vào lỗi người Việt hay mắc trong câu rồi sửa.
9. carrot rush: 60 giây trả lời nhanh nhất, mỗi câu đúng thỏ ăn 1 củ cà rốt.

════════ 11. NGỮ PHÁP ════════
- Chủ đề: tenses, conditionals (cả mixed), passive, relative clauses (cả rút gọn), comparatives, modal verbs (cả modal perfect), articles, subject-verb agreement, gerund vs infinitive, inversion, cleft sentences, noun clauses, participle clauses.
- Ba dạng bài: trắc nghiệm, tìm và sửa lỗi, viết lại câu (gõ, chấp nhận nhiều đáp án đúng).
- Mức cơ bản và nâng cao (band 7).
- Sai thì hiện giải thích ngắn bằng tiếng Việt + ví dụ đúng + một câu áp dụng vào writing.
- Gắn nhãn cấu trúc nào giúp tăng điểm grammatical range and accuracy.

════════ 12. NÂNG CẤP CÂU & BẪY NGƯỜI VIỆT ════════
- Nâng cấp từ: good → beneficial, bad → detrimental, show → demonstrate, a lot of → a substantial number of... Kèm sắc thái và lúc nào KHÔNG nên thay.
- Paraphrase, linking words theo chức năng (thêm ý, đối lập, nguyên nhân, kết quả, ví dụ), nối câu đơn thành câu phức.
- Bẫy người Việt: ít nhất 40 lỗi phổ biến (dịch word-by-word, thừa giới từ, sai word form, sai mạo từ, nhầm affect/effect, economic/economical, lose/loose...). Mỗi lỗi có giải thích và ví dụ sửa.

════════ 13. STREAK & GAME HOÁ ════════
Streak:
- Ngày tính theo Asia/Saigon. Đạt mục tiêu ở mục 6 thì streak +1.
- Lịch tháng: nơ hồng = đạt, băng tuyết = ngày được freeze cứu, chấm nhỏ = có học nhưng chưa đủ 50. Có kỷ lục streak dài nhất.

Streak freeze:
- CHỈ nhận được sau khi giữ đủ 7 ngày liên tiếp. Mỗi mốc 7 ngày nhận 1, giữ tối đa 2.
- Mỗi ngày không đạt mục tiêu tự động dùng 1 freeze (không cộng streak nhưng giữ chuỗi), lần mở web tiếp theo thì báo cho tôi.
- Thiếu freeze thì streak về 0.
- Hàm tính streak viết riêng, thuần, có test:
  học liên tục; đạt lúc 23:59 và 00:01; có học nhưng chưa đủ 50; bỏ 1 ngày có/không freeze; bỏ 2–3 ngày với 1 hoặc 2 freeze; nhận freeze ở mốc 7/14; đủ 2 freeze thì không nhận thêm; đổi múi giờ thiết bị; mở web nhiều lần trong ngày; giới hạn 25 lượt từ game; điều kiện 10 lượt output.

Game hoá:
- XP: output > dùng có hướng dẫn > nhận biết.
- Level (viết thường), tăng dần độ khó:
  1. bé thỏ con
  2. thỏ nơ hồng
  3. thỏ ngọc trai
  4. thỏ ren trắng
  5. thỏ hoa anh đào
  6. thỏ công chúa
  7. thỏ hoàng gia
  8. thỏ nữ hoàng tuyết
  9. thỏ cung trăng (bậc tối thượng)
  Hai bậc cuối cần cả XP lẫn số từ OUTPUT (vd: nữ hoàng tuyết ≥ 300 từ output, cung trăng ≥ 500 từ output và streak kỷ lục ≥ 60 ngày).
  Mỗi bậc thỏ có phụ kiện riêng: nơ → ngọc trai → ren → hoa → vương miện nhỏ → vương miện lớn → áo choàng tuyết → vầng trăng sau lưng.
- Huy hiệu (ít nhất 20, tên viết thường): 7/30/100 ngày, 50/100/300 từ output, 50 câu tự viết, 10 lần nói part 2, tuần không sai giới từ, ngày 200 lượt, cú đêm, chim sớm, comeback sau khi mất streak...
- Thử thách mỗi ngày, xoay vòng theo kỹ năng yếu.

════════ 14. NỘI DUNG BAN ĐẦU ════════
- Ít nhất 200 từ B2–C1 cho band 6.5–7.0, chia 10 chủ đề: education, environment, technology, health, work, society, crime, media, globalisation, urbanisation. Ưu tiên từ đắt giá cho writing task 2 và speaking.
- Ít nhất 120 câu ngữ pháp (đủ 3 dạng), 50 bài nâng cấp câu, 40 bẫy người Việt.
- Ít nhất 30 đề topic sprint, 40 câu part 1, 20 cue card part 2, 30 câu part 3.
- Kho thoại và kaomoji đủ số lượng như mục 4–5. Ít nhất 40 mẹo ielts.
- Sinh dữ liệu theo TỪNG chủ đề, tự rà lại sau mỗi chủ đề: IPA đúng, word form có thật, giới từ đúng, collocation tự nhiên, ví dụ tự nhiên. Không chắc thì bỏ, không bịa.

════════ 15. KIỂM THỬ & CHẤT LƯỢNG ════════
tools/validate.js kiểm tra:
- JSON hợp lệ, đủ trường bắt buộc, không trùng từ, không trùng câu thoại
- mọi biến {…} được hỗ trợ
- không có từ cấm (mục 4) và cụm brainrot/cringe trong danh sách cấm
- câu thoại không vượt giới hạn độ dài, không quá 1 dấu chấm than, không kéo dài chữ quá 3 ký tự
- chữ giao diện và thoại không có chữ hoa (trừ "I" và vùng nội dung học)
- mỗi nhóm thoại và kaomoji đủ số lượng tối thiểu

Test khác:
- thoại: gọi 100 lần mỗi nhóm, không lặp trong 15 câu gần nhất, câu ghép đọc tự nhiên
- streak và mục tiêu 50 lượt như mục 6 và 13
- khung 375px và 414px:
  • font tiếng Việt và kaomoji hiển thị đúng
  • iOS không zoom khi nhập
  • thanh tab không che nội dung
  • game chạm mượt, không cuộn ngang
- mở từ link GitHub Pages, đường dẫn tương đối hoạt động

════════ 16. CÁCH LÀM ════════
Thứ tự:
1. khung + điều hướng + coquette + font + thỏ + lowercase
2. hệ thống giọng nói, thoại, kaomoji (kèm duyệt chống cringe)
3. onboarding + lưu trữ
4. mục tiêu 50 lượt + streak (kèm test)
5. từ vựng + SRS + kho từ output
6. luyện viết và nói
7. minigame
8. ngữ pháp + nâng cấp câu + bẫy người Việt
9. nội dung (từng chủ đề)
10. kiểm thử mục 15

════════ 3B. CHẾ ĐỘ SÁNG & TỐI ════════
Có 2 giao diện, mỗi cái được THIẾT KẾ RIÊNG, không phải đảo màu của nhau:
- chế độ sáng "tuyết": chính là phong cách ở mục 3 (nền trắng tuyết, hồng phấn, ban ngày).
- chế độ tối "đêm trăng": coquette ban đêm, cùng cá tính nhưng bảng màu và đồ trang trí riêng.

Cách bật:
- Có 4 lựa chọn: sáng / tối / theo máy (prefers-color-scheme) / theo giờ (tối từ 18:00 đến 6:00, giờ Asia/Saigon). Mặc định là "theo máy".
- Có nút đổi nhanh trên thanh đầu trang chủ (mặt trời ↔ trăng, chạm thì thỏ lật người đổi ca), và một mục trong cài đặt. Lưu lựa chọn vào localStorage.
- Đặt data-theme trên <html> bằng một đoạn script nhỏ trong <head>, chạy TRƯỚC khi CSS hiển thị, để không bị nháy trắng khi mở web lúc tối.
- Có color-scheme và <meta name="theme-color"> riêng cho từng chế độ, để thanh trình duyệt, ô nhập, thanh cuộn trên điện thoại đổi màu theo.
- Chuyển chế độ có hiệu ứng mờ 250ms. Tắt hiệu ứng nếu prefers-reduced-motion.

Bảng màu "đêm trăng" (gợi ý, chỉnh cho đẹp nhưng giữ tinh thần):
- nền: tím than đêm #1E1A2B. Bề mặt thẻ: #2A2338, #342B45. KHÔNG dùng đen tuyền #000.
- chữ chính: trắng tuyết #F7F4FA. Chữ phụ: tím khói #CBBFD9.
- điểm nhấn: hồng sáng hơn bản ngày (#FF9EC4, #F7B6D2) để nổi trên nền tối.
- phụ: bạc ngọc trai #E3DDF0, vàng trăng nhạt #F6E7B0 (chỉ dùng cho trăng, sao, vương miện).
- Độ tương phản đạt WCAG AA ở CẢ HAI chế độ, kiểm tra riêng từng cặp màu chữ/nền.

Đồ trang trí riêng cho từng chế độ (không dùng chung một bộ):
- sáng: mây, nắng nhẹ, hoa anh đào, gingham hồng, ren trắng, bóng đổ hồng mềm.
- tối: trăng lưỡi liềm, sao lấp lánh nhẹ, ren ánh bạc, ngọc trai phát sáng, cánh hoa anh đào mờ trong suốt. Gingham chỉ còn rất nhạt hoặc bỏ hẳn.
- Bóng: ban ngày dùng bóng đổ mềm. Ban đêm KHÔNG dùng bóng đen, mà dùng viền sáng mảnh hoặc glow nhẹ để tách lớp.

Thỏ ở mỗi chế độ (tránh xung đột hình ảnh):
- sáng: thỏ trắng tuyết đặt trên nền trắng tuyết sẽ chìm, nên phải có viền hồng xám mềm, má hồng rõ, bóng dưới chân.
- tối: thỏ vẫn trắng tuyết nhưng có quầng sáng nhẹ quanh người để không thành một "lỗ trắng" chói mắt. Có thêm mũ ngủ nhỏ hoặc ngôi sao cài nơ.
- Phụ kiện level (vương miện, áo choàng tuyết, vầng trăng của thỏ cung trăng) có màu riêng cho từng chế độ. Vầng trăng ban ngày nhạt, ban đêm sáng hơn.

Quy tắc kỹ thuật để không xung đột:
- TẤT CẢ màu khai báo bằng CSS custom properties trong css/themes.css: một bộ cho [data-theme="light"], một bộ cho [data-theme="dark"].
- Component, SVG, game, biểu đồ, confetti, bong bóng thoại chỉ được dùng biến màu, KHÔNG viết mã màu cứng. SVG dùng currentColor hoặc var(--…).
- Mỗi minigame có màu riêng cho từng chế độ: bong bóng giới từ, thẻ lật, đường đi của bunny hop, cà rốt.
- Kaomoji dùng màu chữ của chế độ hiện tại. Emoji giữ màu gốc nhưng kiểm tra không bị lạc tông trên nền tối.
- Viền focus, trạng thái đúng/sai (xanh/hồng đỏ) có bản riêng cho nền tối, vẫn phân biệt được với người khó nhìn màu (kèm icon ✓/✗, không chỉ dựa vào màu).
- Ảnh hay hoạ tiết dùng opacity khác nhau cho từng chế độ, để nền tối không bị rối.

Thoại khi đổi chế độ (thêm nhóm "đổi giao diện" vào data/voice.json, tuân thủ mọi luật ở mục 4: lowercase, chống cringe, chống lặp, ít nhất 15 câu, ít nhất 20 kaomoji):
kao: (˶ᵔ ᵕ ᵔ˶)☀︎ | ( ˘ᵕ˘ ) ☾ | ₍ᐢ‥ᐢ₎ ⋆｡˚ | ૮ ˶ᵕ ༝ ᵕ˶ა ☽ | (◕ᴗ◕✿)☀︎ | (っ- ‸ – ς)☾ | ⋆｡˚ ☁︎ ˚｡⋆ | ✧˖°
mẫu:
- "đèn tắt. thỏ chuyển sang ca đêm"
- "lights on. good morning, sunshine"
- "chế độ tối bật rồi, mắt bạn cảm ơn tui đó"
- "night mode: on. vocabulary: still on"

Kiểm thử thêm (gộp vào mục 15):
- Chụp hoặc xem từng màn hình ở CẢ HAI chế độ, khung 375px: trang chủ, thẻ từ, mọi minigame, ngữ pháp, luyện viết/nói, thống kê, cài đặt, onboarding, trang trống, lỗi.
- Kiểm tra: không chỗ nào còn nền trắng lọt vào chế độ tối (hoặc ngược lại); thỏ không bị chìm hay chói; chữ đạt độ tương phản; đồ trang trí không đè lên nội dung.
- tools/validate.js báo lỗi nếu tìm thấy mã màu (#hex, rgb, hsl) nằm ngoài css/themes.css.
- Mở web lúc tối với chế độ "theo máy" / "theo giờ": không được nháy trắng.

Thứ tự làm: dựng hệ thống biến màu + 2 chế độ ngay ở giai đoạn 1 (cùng khung giao diện), để mọi phần làm sau đều tự có đủ 2 chế độ.
════════ NGUỒN TỪ VỰNG: SỔ CỦA TUI + XIE TẠO THÊM ════════
Web có 3 kho, dùng CHUNG một hệ thống thẻ, SRS, game, kho output:
A. "sổ của tui": nhập 100% từ data/source/so-tu-vung-theo-chu-de.xlsx (157 cụm, 12 chủ đề). Đây là kho ưu tiên.
B. "daily": cụm từ speaking cho chủ đề đời thường mới, Xie tạo.
C. "academic": từ và cụm học thuật cho writing task 2, Xie tạo.

── bước 1: nhập excel (không đọc cả file) ──
- Chỉ in tên sheet, tên cột, 5 dòng đầu của 2 sheet. Cấu trúc mỗi sheet chủ đề:
  stt | cụm từ chính | cách nói tương tự (đã gộp) | nghĩa | ví dụ | dùng cho (nói / cả hai) | ghi chú | câu của tôi | đã dùng khi nói? (có / chưa)
- Dòng bắt đầu bằng "▸" là tên nhóm con. Bỏ qua sheet "mục lục".
- Viết tools/import-xlsx.(js|py) chuyển sang data/vocab/excel-<slug-chủ-đề>.json:
  • tách alternatives theo xuống dòng hoặc " / "
  • giữ nguyên chữ hoa/thường trong phrase và example; "(sth)" là phần tuỳ chọn khi chấm gõ
  • "câu của tôi" và "đã dùng khi nói?" nếu có thì đưa vào tiến độ ban đầu
- Script in số cụm mỗi chủ đề và tổng. Tổng phải đúng 157, lệch thì dừng và báo tôi.
- KHÔNG sửa nghĩa, ví dụ, ghi chú gốc. Cụm nào thấy chưa tự nhiên thì ghi vào tools/review-vocab.md để tôi duyệt.

── schema chung (data/vocab/*.json) ──
- Mọi mục có:
  id, source ("excel" | "xie"), track ("daily" | "academic"), topic, subgroup,
  type ("phrase" | "word"), phrase, alternatives, meaning_vi, examples[], use_for ("speaking" | "writing" | "both"),
  note, level (B1/B2/C1), speaking_questions[] (câu hỏi part 1/3 mà cụm này trả lời được)
- type "word" (chủ yếu academic) có thêm: ipa, pos, word_family, prepositions, collocations (nhóm theo verb+/adj+/+noun), register, common_mistakes_vi, synonyms (kèm sắc thái), antonyms, band_booster.
- Trường nào không chắc thì để rỗng, KHÔNG BỊA.

── bước 2: xie tạo thêm (làm theo LÔ, mỗi lô 1 chủ đề, commit rồi /clear giữa các lô) ──
Trước mỗi lô: chạy tools/dedupe.js so với TOÀN BỘ kho (phrase + alternatives, đã chuẩn hoá chữ thường, bỏ "(sth)"). Không tạo cụm trùng hoặc gần trùng với sổ của tui.

B. daily (speaking), ít nhất 15 cụm mỗi chủ đề, cùng phong cách sổ của tui (cụm tự nhiên người bản xứ hay nói, có cách nói tương tự, ví dụ đời thường):
   1. ăn uống & nấu ăn
   2. thời tiết & mùa
   3. ngủ & sinh hoạt hằng ngày
   4. mua sắm & tiền bạc
   5. thể thao & vận động
   6. phim, sách & giải trí
   7. quê hương & thành phố
   8. cuối tuần & thời gian rảnh
   9. nghệ thuật & sáng tạo
   10. gia đình & tuổi thơ
   + mở rộng 12 chủ đề của sổ của tui: mỗi chủ đề thêm 5–8 cụm mới, source "xie", hiển thị tách khỏi cụm gốc (nhãn "xie gợi ý thêm").

C. academic (writing task 2), ít nhất 20 mục mỗi chủ đề, đủ schema "word", ưu tiên từ đắt giá band 6.5–7.0:
   1. education
   2. environment
   3. technology
   4. health
   5. work & employment
   6. society & family
   7. crime & law
   8. media & advertising
   9. globalisation & culture
   10. urbanisation & housing
   11. government & economy
   12. science & research
   Mỗi chủ đề có thêm: 5 câu mở đoạn mẫu, 5 cụm diễn đạt quan điểm/nguyên nhân/hệ quả hay dùng cho chủ đề đó.

Thứ tự lô ưu tiên: nhập excel → academic 1–6 → daily 1–5 → mở rộng sổ của tui → academic 7–12 → daily 6–10.
Sau mỗi lô: chạy tools/validate.js, in số mục đã thêm, cập nhật tools/content-progress.md (lô nào xong, lô nào còn). Lần sau tôi chỉ cần nói "làm lô tiếp theo".

── giao diện kho từ ──
- Tab từ vựng có bộ lọc: nguồn (sổ của tui / xie thêm), nhánh (daily / academic), chủ đề, nhóm con, mức thành thạo, chỉ từ hay sai.
- Mỗi chủ đề có icon và màu riêng (đủ cho cả chế độ sáng và tối), hiện tiến độ: x/y cụm đã thành output.
- Thẻ type "phrase": phrase, nghĩa, ví dụ, cách nói tương tự (nhãn "nhận ra là đủ"), ghi chú, câu hỏi speaking dùng được.
- Thẻ type "word": như mục 8 (tab nghĩa | word form | giới từ & collocation | ngữ cảnh | ví dụ | lỗi hay gặp).
- Mức 3–4 cho phrase: điền chỗ trống trong câu ví dụ, chọn cách nói đúng ngữ cảnh, rồi nói to hoặc viết câu của riêng mình. Phrase "dùng cho = nói" chỉ cần nói. "Cả hai" thì thêm bài viết.
- "Kế hoạch hôm nay" mặc định lấy từ mới theo tỉ lệ: 50% sổ của tui, 25% daily, 25% academic. Chỉnh được trong cài đặt, hoặc tự nghiêng về nhánh ứng với kỹ năng yếu nhất.
- Từ Xie tạo có nút ẩn, sửa, xoá. Từ sổ của tui chỉ được sửa "câu của tôi" và trạng thái.
- Nút "xuất sổ ra excel": tải về file .xlsx cùng cấu trúc cột gốc, có thêm sheet cho daily và academic, kèm câu của tui và trạng thái "đã dùng khi nói" mới nhất (dùng thư viện SheetJS qua CDN, chỉ tải khi bấm nút).
