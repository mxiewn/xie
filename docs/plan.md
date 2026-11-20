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
| buồn / ngủ | thỏ **tai cụp**: đổi sang đôi tai rũ xuống hai bên đầu |
| tủ đồ của thỏ | `#/wardrobe` (trong tab tui). mỗi cấp mở 1 bộ đồ theo thứ tự spec: nơ cài tai → chuỗi ngọc trai → cổ áo ren → vòng hoa anh đào → vương miện nhỏ → vương miện lớn → áo choàng tuyết → vầng trăng sau lưng (cấp 1 là nơ cổ cơ bản). bộ khoá vẫn **mặc thử** được nhưng không chọn được. bộ đang mặc hiện ở trang chủ và tab tui. lưu ở key `xie:skin` |
| màu trang phục | biến `--acc-…` riêng cho từng chế độ; vầng trăng ban ngày nhạt, ban đêm sáng + quầng sáng |
| màu nhấn chữ | `#E57A9C` trên nền trắng chỉ đạt 2.76:1 nên chỉ dùng cho trang trí; chữ nhấn + viền focus dùng `#B23F68` (5.52:1); nút chính là nền `#F8C8DC` + chữ cacao |
| điều hướng | hash: `#/home`, `#/vocab`, `#/practice[/writing|speaking|grammar|upgrade]`, `#/games`, `#/me`, `#/lab` (phòng thử, ẩn) |
| lưu chế độ giao diện | key riêng `xie:theme` = `system` / `light` / `dark` / `time`, để script trong `<head>` đọc nhanh |
| múi giờ | dùng `Asia/Ho_Chi_Minh` (tên chuẩn của `Asia/Saigon`) |
| file thêm ngoài spec | `js/theme.js`, `js/bunny.js`, `js/levels.js`, `js/views/`, `package.json` (chỉ để node chạy tools/test dạng es module), `.nojekyll` |

## các giai đoạn (spec mục 16)

- [x] **1. khung + điều hướng + coquette + font + thỏ + lowercase** (kèm 2 chế độ sáng/tối của mục 3b)
- [ ] 2. hệ thống giọng nói, thoại, kaomoji (kèm duyệt chống cringe → `tools/lines-review.md`)
- [ ] 3. onboarding + lưu trữ (state đầy đủ, số version schema, nâng cấp)
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

## còn để giai đoạn sau

- kiểm tra trên **ios safari và chrome android thật** (kaomoji nào hiện ô vuông thì xoá): container chỉ có chromium linux, chưa thử được → làm ở giai đoạn 10
- thoại hiện đang là vài câu tạm trong `js/views/home.js`; giai đoạn 2 chuyển sang `data/voice.json`
- `tools/validate.js` sẽ thêm kiểm tra json, thoại, kaomoji, chữ thường ở giai đoạn 2
- `css/games.css` tạo ở giai đoạn 7
