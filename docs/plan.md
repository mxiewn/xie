# kế hoạch xie

file này để mỗi phiên làm việc mới đọc lại là biết đang ở đâu. spec gốc: [`spec.md`](spec.md).

## quyết định đã chốt

| chủ đề | quyết định |
| --- | --- |
| font | **mali** (tiêu đề) + **nunito** (nội dung), google fonts, `display=swap`, có subset vietnamese |
| ngữ pháp + nâng cấp câu | nằm trong tab **luyện nói & viết**, chia 4 mục: viết · nói · ngữ pháp · nâng cấp câu (gồm linking words + bẫy người việt) |
| nhãn tab | thanh dưới ghi `nói & viết`; tiêu đề trong trang ghi đủ `luyện nói & viết` |
| nơ của thỏ | nằm ở **cổ**, không ở đầu. đồ cầm tay (cà rốt, tim, bút, micro) che lên nơ; riêng khăn nằm **sau** nơ |
| thỏ ban đêm | **ngôi sao cài chính giữa nơ cổ** (không dùng mũ ngủ để khỏi đụng vương miện của các level sau) |
| buồn / ngủ | thỏ **tai cụp**: tai rũ xuống hai bên đầu, vẽ **liền một khối với đầu** (chỉ có viền ngoài, không nét chia, không lộ lòng tai hồng) |
| ôm tim | tim màu **hồng nhạt** viền hồng đậm, để tách khỏi màu nơ |
| phụ kiện cổ | chuỗi ngọc, cổ áo ren, cổ lông **luồn dưới cằm** (vẽ sau thân, trước đầu) nên không lộ cổ; nơ luôn đứng trước, chính giữa |
| áo choàng tuyết | nối từ cổ lông, là **lớp sau cùng** (sau cả đuôi); bông tuyết chỉ ở áo choàng, có ở cả hai chế độ |
| dáng "đội vương miện" | bộ tiara / vương miện lớn giữ vương miện của bộ; bộ khác cất đồ đội đầu và đội vương miện thường |
| bố cục | **điện thoại** (< 768px): dọc, thanh tab dưới. **máy tính bảng dọc** (768–899px): dọc, thanh tab nổi. **desktop** (≥ 900px): **màn ngang**, thanh điều hướng bên trái, nội dung chia nhiều cột, không dùng hình nền lấp chỗ trống |
| tủ đồ của thỏ | `#/wardrobe` (trong tab tui). mỗi cấp mở 1 bộ đồ theo thứ tự spec: nơ cài tai → chuỗi ngọc trai → cổ áo ren → vòng hoa anh đào → vương miện nhỏ → vương miện lớn → áo choàng tuyết → vầng trăng sau lưng (cấp 1 là nơ cổ cơ bản). bộ khoá vẫn **mặc thử** được nhưng không chọn được. bộ đang mặc hiện ở trang chủ và tab tui. lưu ở key `xie:skin` |
| màu trang phục | biến `--acc-…` riêng cho từng chế độ; vầng trăng ban ngày nhạt, ban đêm sáng + quầng sáng |
| màu nhấn chữ | `#E57A9C` trên nền trắng chỉ đạt 2.76:1 nên chỉ dùng cho trang trí; chữ nhấn + viền focus dùng `#B23F68` (5.52:1); nút chính là nền `#F8C8DC` + chữ cacao |
| điều hướng | hash: `#/home`, `#/vocab`, `#/practice[/writing|speaking|grammar|upgrade]`, `#/games`, `#/me`, `#/lab` (phòng thử, ẩn) |
| lưu chế độ giao diện | key riêng `xie:theme` = `system` / `light` / `dark` / `time`, để script trong `<head>` đọc nhanh |
| múi giờ | dùng `Asia/Ho_Chi_Minh` (tên chuẩn của `Asia/Saigon`) |
| file thêm ngoài spec | `js/theme.js`, `js/bunny.js`, `js/levels.js`, `js/views/`, `package.json` (chỉ để node chạy tools/test dạng es module), `.nojekyll` |

## các giai đoạn (spec mục 16)

- [x] **1. khung + điều hướng + coquette + font + thỏ + lowercase** (kèm 2 chế độ sáng/tối của mục 3b)
- [x] **2. hệ thống giọng nói, thoại, kaomoji** (kèm duyệt chống cringe → `tools/lines-review.md`)
- [x] **3. onboarding + lưu trữ** (state đầy đủ, số version schema, nâng cấp)
- [x] **4. mục tiêu 50 lượt + streak** (hàm thuần + test), kèm xp, 9 cấp, 26 huy hiệu, thử thách mỗi ngày
- [ ] 5. từ vựng + srs + kho từ output
- [ ] 6. luyện viết và nói
- [ ] 7. minigame
- [ ] 8. ngữ pháp + nâng cấp câu + bẫy người việt
- [ ] 9. nội dung (từng chủ đề, theo lô: nhập excel → academic 1–6 → daily 1–5 → mở rộng sổ của tui → academic 7–12 → daily 6–10)
- [ ] 10. kiểm thử mục 15

## giai đoạn 1: đã làm

- `css/themes.css`: 2 bộ biến màu riêng ("tuyết" và "đêm trăng"); `tools/validate.js` đo 26 cặp chữ/nền mỗi chế độ, đều đạt aa
- chống nháy trắng: script trong `<head>` đặt `data-theme` + `color-scheme` trước khi css chạy; `theme-color` lấy từ `--theme-color`
- 4 chế độ: theo máy (mặc định) / sáng / tối / theo giờ (tối 18:00–6:00 giờ việt nam, kiểm tra lại mỗi phút); đổi có hiệu ứng mờ 250ms, tắt khi giảm chuyển động
- nút mặt trời ↔ trăng ở trang chủ: thỏ lật người rồi mới đổi ca; trong tab tui có mục chọn 4 chế độ
- thanh tab 5 mục, safe-area, `100dvh`, nút ≥ 44px; desktop thành thanh nổi ở giữa
- trang trí riêng từng chế độ: ngày (mây, nắng, hoa anh đào, gingham, ren hồng) / đêm (trăng, sao lấp lánh, ren bạc, ngọc phát sáng, cánh hoa mờ)
- thỏ svg tự vẽ, 10 trạng thái: vui, buồn nhẹ, ngủ, nhảy múa, cầm cà rốt (cà rốt phóng to được bằng `--carrot-scale`), ôm tim, đội vương miện, cầm bút, cầm micro, quấn khăn. thở nhẹ + nháy mắt ngẫu nhiên. có sẵn `.b-accessory` để gắn phụ kiện level
- bong bóng thoại: tự ẩn sau 3–5 giây, chạm thì ẩn
- lowercase: chữ giao diện viết thường trong source + class `.ui`; `.keep-case`, `.kao`, `.kao-art` giữ nguyên chữ
- các tab còn lại: trang trống có thỏ ascii (nội dung thật làm ở các giai đoạn sau)
- `#/lab`: phòng thử để kiểm tra bằng mắt

## giai đoạn 1: đã kiểm tra (chromium trong container)

- khung 375px và 414px × sáng/tối × 6 màn: không cuộn ngang, thanh tab không che nội dung, mọi nút ≥ 44px, font mali/nunito tải đủ, không lỗi console
- css tải chậm 1.5 giây khi máy đang tối: `data-theme="dark"` có ngay từ đầu (không nháy trắng)
- chạy ở đường dẫn con `/xie/` giống github pages
- localStorage bị chặn hoàn toàn: web vẫn chạy, đổi chế độ vẫn được trong phiên
- route lạ thì về trang chủ; mở thẳng `#/practice/upgrade` thì đúng mục

## sau giai đoạn 1: tinh chỉnh thỏ + tủ đồ

- nơ dời xuống cổ, sao đêm nằm giữa nơ, khăn nằm sau nơ, đồ cầm tay che nơ
- buồn và ngủ: tai cụp
- tủ đồ của thỏ với 9 bộ đồ theo cấp; phòng thử có ô chọn trang phục để soi cả 10 dáng
- ~~cấp hiện tại tạm luôn là 1~~ → giai đoạn 4: cấp tính từ xp thật (`js/progress.js` cấp qua `setLevelProvider`), tủ đồ tự mở khoá

## sau giai đoạn 1: chỉnh tạo hình thỏ lần 2 + desktop màn ngang

- tai cụp liền khối với đầu (vẽ 2 lượt: viền dày rồi tô phủ), tim sáng màu, ngọc trai / cổ ren / cổ lông luồn dưới cằm, áo choàng nối từ cổ lông và nằm sau cùng, bỏ bông tuyết trên đầu
- đã soi đủ 9 bộ × 10 dáng × 2 chế độ trong phòng thử
- desktop: trang chủ (khung trời trái, thẻ phải), tủ đồ (người mẫu trái, lưới đồ phải), tab tui (2 cột), game (lưới trải ngang), phòng thử (2 cột)
- đã kiểm tra 375, 414 (điện thoại), 844×390 (điện thoại xoay ngang), 768, 820 (máy tính bảng), 1024, 1280, 1920 (desktop): không cuộn ngang, thanh tab/thanh trái không che nội dung

## giai đoạn 2: giọng nói, thoại, kaomoji

- `js/voice-core.js` (thuần, có test): chọn câu theo nhóm + điều kiện (giờ, streak, ngày thi, số phút…), ghép mảnh [mở đầu] + [thân] + [đuôi tiếng anh] chỉ khi câu ghép vẫn đạt luật, nhớ 15 câu gần nhất mỗi nhóm, ưu tiên câu chưa hiện trong 7 ngày, không lặp 3 kaomoji gần nhất, mật độ thoại (đúng ≈ 1/3, sự kiện lớn luôn nói) × cài đặt nói nhiều / vừa / ít
- `js/voice.js`: tải kho khi cần, lưu lịch sử (`xie:voice`), cài đặt (`xie:talk`), số lần chạm thỏ (`xie:taps`)
- `data/voice.json`: 31 nhóm, 644 câu, 681 kaomoji. tỉ lệ genz 40% · ấm áp 26% · tiếng anh 34%. 11% câu chép nguyên mẫu (giới hạn 15%)
- **quyết định**: "chào" (nhóm hay hiện) chia 3 nhóm theo giờ, cộng lại ≥ 40 câu, mỗi nhóm ≥ 20 câu; nhóm thường ≥ 16 câu (spec ghi 15, cần 16 để thật sự không lặp 15 câu gần nhất)
- duyệt chống cringe: viết 1.208 câu nháp, giữ 644, loại 564 (lý do từng câu ở `tools/lines-review.md`)
- `data/tips.json`: 314 mẹo, hiện ở màn hình đang tải. 44 mẹo cơ bản + 147 mẹo rút từ **sổ lỗi writing của bạn** (l1–l16, gia đình động từ, cụm từ hay dùng sai, khung câu an toàn, cách dùng sổ; màn hình tải ghi rõ "sổ lỗi của bạn · l4") + 123 mẹo ngoài lề (task 1, task 2, speaking, reading, listening, từ vựng, ngữ pháp, cách học, ngày thi)
- sổ lỗi l1–l16 cũng là nguồn cho phần **sổ lỗi sai** và **ngữ pháp** (giai đoạn 8): các câu 🧪 tự kiểm tra có thể thành bài tập
- đã gắn vào web: lời chào theo giờ, chạm thỏ (nhiều fun fact từ vựng), đổi giao diện, lưu đồ trong tủ, trang lỗi, màn hình đang tải + mẹo. tab tui có cài đặt **thỏ nói**. phòng thử có **nghe thử thoại** (gọi 100 lần để tự kiểm tra)
- các nhóm còn lại (đúng, sai, combo, streak, mốc, freeze, lên level, nhắc học…) đã có thoại, sẽ được gọi khi các giai đoạn 3–8 làm ra tính năng tương ứng
- test: `npm test` → 90 test qua (100 lần mỗi nhóm/mỗi loại không lặp 15 câu gần nhất, câu ghép đạt luật, mật độ, giờ chào, biến tên)

## giai đoạn 3: làm quen + lưu trữ

- `js/state-core.js` (thuần, có test): schema v1 ở `xie:state` (onboarded, profile, settings, visits), nâng cấp từ dữ liệu chưa có version, chuẩn hoá mọi giá trị (mục tiêu không dưới 50, tên viết thường ≤ 24 ký tự, ngày thi hợp lệ, tối đa 4 chủ đề…), ngày theo giờ việt nam, ghi nhận ghé thăm, xuất / nhập
- `js/state.js`: đọc/ghi trên trình duyệt, dữ liệu hỏng thì bắt đầu lại không sập, localStorage bị chặn thì vẫn chạy trong phiên
- **làm quen** `#/welcome` (lần đầu mở web tự vào, ẩn thanh điều hướng): tên → band 6.5 / 7.0 → ngày thi (tuỳ chọn, hiện còn bao nhiêu ngày) → 50 / 80 / 120 / 200 lượt → kỹ năng yếu nhất + tối đa 4 chủ đề ưu tiên. vuốt trái / phải để đi tiếp / quay lại, nút tiếp / quay lại, báo lỗi rõ khi thiếu. thỏ đổi dáng và nói câu riêng từng bước (thêm 12 câu vào nhóm onboarding). desktop: thỏ bên trái, khung bên phải
- **cài đặt** `#/settings`: sửa hồ sơ (tên, band, ngày thi, mục tiêu lượt, số từ mới 3–20, kỹ năng yếu, chủ đề), cỡ chữ nhỏ / vừa / lớn, xuất / nhập / xoá dữ liệu (xoá bấm 2 lần), làm lại phần làm quen. lưu ngay khi đổi, thỏ báo "đã lưu"
- **trang chủ**: gọi bằng tên (viết thường), thẻ đếm ngược ngày thi kèm câu thoại nhóm đếm ngược, vắng từ 3 ngày thì thỏ chào nhóm "quay lại"
- **tab tui**: thẻ hồ sơ & cài đặt (band, mục tiêu, kỹ năng ưu tiên, số ngày tới kỳ thi)
- test: `npm test` → 109 test (thêm 19 test state: dữ liệu hỏng, mục tiêu < 50, nâng cấp version, 23:59 / 00:01 giờ việt nam, năm nhuận, ghé thăm nhiều lần trong ngày, xuất / nhập). playwright: đi hết 5 bước, vuốt, lỗi nhập, lưu, cài đặt, xuất / nhập / xoá, quay lại sau 5 ngày, state hỏng, desktop sáng / tối
- **để sau**: giọng đọc + tốc độ đọc và mặt trước thẻ (giai đoạn 5), âm thanh + rung (khi có sound.js)

## giai đoạn 4: mục tiêu lượt + chuỗi ngày + game hoá

### lõi thuần (có test)
- `js/daily-goal.js`: số lượt mỗi loại bài (nhận biết / nhớ lại / dùng có hướng dẫn / ngữ pháp / bẫy / game = 1; tự viết câu 3, paraphrase 5, part 1 3, part 3 5, topic sprint 10, part 2 10), xp mỗi loại, chống cày, `goalStatus()` (lượt tính vào mục tiêu, output, game, còn thiếu, đã đạt), thử thách mỗi ngày
- `js/streak.js`: `computeStreak(days, today)` **tính lại từ nhật ký ngày** (không cộng dồn mỗi lần mở web) → chuỗi, kỷ lục, băng, lịch (`met` / `frozen` / `partial`), sự kiện (mốc, nhận băng, dùng băng, đứt chuỗi, nối lại chuỗi). lịch tháng / tuần bắt đầu thứ hai
- `js/badges.js`: 26 huy hiệu, 5 nhóm (chuỗi ngày, từ thành output, viết & nói, chính xác, nhịp học)
- `js/levels.js`: thêm xp từng cấp + `levelFor()` / `levelProgress()`
- `js/progress-core.js`: schema `xie:progress` v1, `recordAnswer()` ráp tất cả lại và trả về sự kiện, `takeNotices()` (tin băng / đứt chuỗi chưa báo), `syncToday()` (đổi mục tiêu giữa ngày), `updateCounters()` (số liệu giai đoạn sau)
- test: `npm test` → 164 test (thêm 19 chuỗi ngày, 14 mục tiêu lượt, 23 ráp nối). đủ các tình huống spec mục 13

### quyết định
| chủ đề | quyết định |
| --- | --- |
| lưu ở đâu | key riêng `xie:progress` (có version), tách khỏi hồ sơ `xie:state`. xuất / nhập dữ liệu đã gồm key này và chuẩn hoá khi nhập |
| "đạt" của một ngày | lưu `met_at` lúc đạt. đã đạt thì giữ đạt kể cả khi sau đó nâng mục tiêu; hạ mục tiêu xuống mức đã đủ thì ghi đạt ngay |
| 10 lượt output | tính trong lượt, cố định 10 cho mọi mức mục tiêu (spec: "output 6/10") |
| "trả lời lại câu đó trong 10 phút" | đo từ lần trả lời **được tính** gần nhất của cùng id câu hỏi (`item`) |
| "nhanh hơn 1 giây liên tục" | câu nhanh đầu tiên vẫn tính (biết ngay là chuyện thường), từ câu nhanh thứ 2 **liền nhau** thì không tính. chậm lại (≥ 1 giây) là tính tiếp. không có `ms` thì đo từ câu trước |
| "bài output dưới 5 từ" | chỉ áp dụng khi có chữ (`words`). bài nói tự tick không có chữ thì vẫn tính |
| "ở 25 lượt" | thoại "nửa chặng" khi qua **nửa mục tiêu** (= 25 với mục tiêu 50); "sắp xong" khi còn ≤ 5 lượt. mỗi loại 1 lần/ngày |
| băng giữ chuỗi | nhận ở mỗi mốc chuỗi chia hết cho 7 (7, 14, 21…), giữ tối đa 2. ngày chưa đủ (kể cả có học) thì tự dùng 1 băng, lịch hiện băng tuyết. băng chỉ dùng khi đang có chuỗi |
| báo tin lúc mở web | `notified_until`: tin tới ngày hôm qua đã báo thì thôi. trang chủ hiện thẻ báo (bấm ok để ẩn), thỏ quấn khăn (dùng băng) hoặc buồn nhẹ (đứt chuỗi) và nói câu nhóm `dung_freeze` / `mat_streak` |
| xp | nhận biết 2 · nhớ lại 4 · ngữ pháp / bẫy 5 · dùng có hướng dẫn 6 · game 3 · output 18–60 · sai 1 · xong thử thách +50. ≈ 200 xp một ngày đủ 50 lượt |
| cấp | 0 · 200 · 700 · 1.800 · 3.500 · 6.000 · 9.500 · 14.000 (+ 300 từ output) · 20.000 (+ 500 từ output + kỷ lục chuỗi 60 ngày). học đều thì cung trăng khoảng 4 tháng |
| huy hiệu | đã nhận thì giữ (lưu ngày). huy hiệu của phần chưa làm (kho output, câu tự viết, part 2…) đã có sẵn, sẽ tự mở khi giai đoạn sau ghi dữ liệu. "nối lại chuỗi" chỉ tính khi chuỗi bị đứt dài từ 3 ngày |
| thử thách mỗi ngày | 12 bài, 3 bài mỗi kỹ năng. có kỹ năng yếu thì 2/3 số ngày là thử thách kỹ năng đó, ngày còn lại xoay 3 kỹ năng kia; chưa chọn thì xoay đều 4 kỹ năng. xong +50 xp |
| nghỉ giải lao | phiên học (nghỉ quá 5 phút là phiên mới) dài quá 25 phút thì thỏ nhắc 1 lần |
| confetti hình nơ | khi lên cấp và chạm mốc chuỗi 7 / 30 / 100. tắt khi giảm chuyển động |

### giao diện
- **trang chủ**: thẻ báo tin chuỗi (nếu có) → **hôm nay** (vòng "32/50 lượt", thanh output 6/10, thanh lượt game khi có chơi, dòng còn thiếu gì, xp hôm nay) → **chuỗi** (số ngày, 2 ô băng, kỷ lục, dải tuần t2–cn có nơ / băng / chấm, bấm vào là tới lịch nơ) → **thử thách hôm nay** → đếm ngược → nhà mới đang dọn. thỏ cầm cà rốt, cà rốt lớn dần theo tiến độ (0.6 → 1.5). tối (từ 19 giờ) mà chưa xong thì thỏ nhắc học thay câu chào
- **lịch nơ** `#/streak`: 4 ô số (chuỗi, kỷ lục, băng, ngày đạt), lịch tháng lùi / tới được (không lùi quá tháng đầu có dữ liệu), chú thích, luật giữ chuỗi
- **huy hiệu** `#/badges` và **cấp + xp** trong tab tui
- **phòng thử** → giả lập ngày học (dữ liệu tạm)
- đã kiểm tra: 375 / 414 / 1280px, sáng + tối, thẻ báo dùng băng / đứt chuỗi, ngày đã xong, chưa học gì; không cuộn ngang, nút ≥ 44px, không lỗi console, localStorage bị chặn vẫn chạy, tủ đồ mở đúng theo cấp thật

### chỉnh sau góp ý (giai đoạn 4)
- **bong bóng ↔ thỏ**: bong bóng neo theo đầu thỏ (đáy khung), không neo đỉnh khung nữa → khung cao bao nhiêu cũng chỉ cách đỉnh thỏ ≈ cú nhún + đuôi (≈ 37px ở điện thoại, trước là 71px). làm quen cũng thu khoảng cách tương tự
- **kaomoji**: giữ nguyên toàn bộ kaomoji gốc (kể cả loại có dấu chồng như `•̀`, theo ý bạn), có thêm vài cái mới cho đa dạng. `.kao` khoá hướng chữ trái → phải (`unicode-bidi: bidi-override`, để ﻌ و ٩ không bị đảo), tắt kerning / ghép chữ, `inline-block` cho cả mặt nằm trọn một khối. trong bong bóng, kaomoji xuống dòng riêng, căn giữa, to hơn chữ một chút
- **desktop thẳng hàng**: lề trên / dưới của nội dung và thanh menu đều 32px. khung thỏ đứng yên (`sticky`), cao đúng một màn: chữ xie ngang mép trên khung thỏ, thẻ "hôm nay" ở chân menu ngang mép dưới, cuộn tới đâu cũng vậy
- **thẻ "hôm nay" ở chân menu** (`js/nav-today.js`, chỉ desktop): củ cà rốt dài theo số lượt, nơ = chuỗi ngày, bông tuyết = số băng. bấm vào về trang chủ
- **số băng**: hiện "số băng đang có: 1" (một con số), không còn kiểu 1/2 hay hai ô
- **luật giữ chuỗi** rút còn 5 dòng ngắn
- **mây**: thêm 3 mây ban ngày (che hờ chân mặt trời, bên trái thỏ, sát đất) và 2 mây đêm mỏng quanh trăng
- **nắng / trăng**: dời sang cạnh phải, ngang đầu thỏ (canh theo `--bunny-size` đặt ở `.hero`), xa nút đổi chế độ ~230px trên điện thoại, không chạm bong bóng. desktop: nút đổi chế độ dời xuống chân thanh menu thành viên thuốc "sáng | tối" (đang ở trang chủ thì thỏ vẫn lật người đổi ca qua sự kiện `xie:theme-request`), khung thỏ bỏ hàng trên cho trời thoáng
- **tên web**: nơ đứng trước "xie", sau tên là kaomoji ngẫu nhiên (`randomKao()` trong `ui.js`), đổi cái khác mỗi lần quay lại màn; kaomoji trên thẻ cà rốt ở chân menu cũng vậy
- **trang trí canh theo cỡ thỏ**: nắng, trăng, mây, cành hoa tính theo `--bunny-size` với tỉ lệ lấy từ điện thoại (thỏ 172px: nắng 54px = 0.314 cỡ thỏ…) → desktop giống hệt điện thoại, chỉ to hơn. mây luôn che hờ chân nắng / trăng và nằm trọn trong khung. desktop thêm 2 mây ở phần trời phía trên (`cloud-f`, `cloud-g`)
- **tên web**: nơ nhỏ xíu (19px) dán sát trước "xie", kaomoji cao bằng nửa thân chữ, đứng ngang hàng giữa chữ
- **thỏ và cà rốt**: chưa có lượt nào trong ngày thì thỏ không cầm cà rốt (dáng vui). từ lượt đầu tiên thì cầm, cà rốt to dần 0.6 → 1.5 tới khi đủ mục tiêu; đang mở trang chủ mà làm lượt đầu thì thỏ tự cầm lên
- **nơ trong vòng tròn** (khi đủ mục tiêu): đứng thẳng (trước bị xoay ngang theo vòng tròn)
- **thẻ cà rốt**: thân có vân xen kẽ trên / dưới; đầy 50/50 thì cà rốt kín thanh + ✓
- **đuôi cà rốt**: thanh tiến độ kết thúc bằng hình tròn (tâm đúng đầu thanh, bán kính = nửa bề dày) + tam giác nối từ hai tiếp điểm tới chóp → thân, vai tròn, chóp liền một mạch

### giai đoạn 5–8 nối vào thế nào
```js
import { recordAnswer, celebrate, setCounters } from './progress.js';
import { reasonText } from './daily-goal.js';

const result = recordAnswer({ kind: 'recall', item: 'vocab:sustain:recall', correct: true, ms: 4200, tags: ['prep'] });
celebrate(result.events, { bubble, bunny });       // thoại + dáng thỏ + confetti + thông báo nhỏ
if (!result.counted) showToast(reasonText(result.reason));
setCounters({ output_words: 57, my_words: 12 });   // kho output / từ của tui đổi thì báo cho tiến độ
```
- `kind`: recognition · recall · guided · grammar · trap · game · sentence · paraphrase · speaking_p1 · speaking_p2 · speaking_p3 · topic_sprint
- `item`: id câu hỏi (bắt buộc nên có, để chống trả lời lại trong 10 phút). `words`: số từ của bài viết. `tags`: `prep` cho câu giới từ (huy hiệu "tuần không sai giới từ")
- giai đoạn 5 thêm nút **học hôm nay** + kế hoạch hôm nay vào trang chủ, từ của ngày, số từ kho output (thay mục "nhà mới đang dọn")
- thoại "đúng" / "sai" / "điểm tuyệt đối" do màn bài tập tự gọi (giai đoạn 5–8); `celebrate()` lo phần sự kiện lớn

## còn để giai đoạn sau

- kiểm tra trên **ios safari và chrome android thật** (kaomoji nào hiện ô vuông thì xoá): container chỉ có chromium linux, chưa thử được → làm ở giai đoạn 10
- `css/games.css` tạo ở giai đoạn 7
