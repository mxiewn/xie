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
- [ ] 4. mục tiêu 50 lượt + streak (hàm thuần + test)
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
- **cấp hiện tại tạm luôn là 1** vì chưa có xp. giai đoạn 4 chỉ cần sửa `currentLevel()` trong `js/levels.js` là tủ đồ tự mở khoá

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

## còn để giai đoạn sau

- kiểm tra trên **ios safari và chrome android thật** (kaomoji nào hiện ô vuông thì xoá): container chỉ có chromium linux, chưa thử được → làm ở giai đoạn 10
- `css/games.css` tạo ở giai đoạn 7
