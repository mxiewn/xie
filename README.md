# xie

web học từ vựng ielts (mục tiêu 6.5–7.0). triết lý: từ vựng phải thành **output**, tức là tự viết và tự nói ra được, không dừng ở mức nhìn thấy thì nhận ra nghĩa.

web tĩnh thuần html + css + javascript (es modules): không framework, không backend, không build step.
spec đầy đủ ở [`docs/spec.md`](docs/spec.md), kế hoạch và tiến độ ở [`docs/plan.md`](docs/plan.md).

## chạy thử trên máy

es modules không chạy khi mở thẳng file `index.html` (đường dẫn `file://`), nên cần một server tĩnh nhỏ:

```bash
python3 -m http.server 8000
```

rồi mở http://localhost:8000.

muốn thử y như github pages (web nằm ở đường dẫn con `/xie/`) thì đứng ở thư mục **cha** của repo:

```bash
cd .. && python3 -m http.server 8000
```

rồi mở http://localhost:8000/xie/.

## bật github pages

1. vào repo trên github → **settings** → **pages**
2. mục **build and deployment** → **source**: chọn **deploy from a branch**
3. **branch**: chọn `main` (hoặc nhánh muốn đăng), thư mục `/ (root)` → **save**
4. đợi 1–2 phút, web sẽ ở `https://<username>.github.io/xie/`

web chỉ dùng đường dẫn tương đối và điều hướng bằng hash (`#/vocab`, `#/practice`…), nên chạy được ở đường dẫn con mà không cần cấu hình gì thêm. file `.nojekyll` báo github pages đăng nguyên trạng, không xử lý qua jekyll.

## kiểm tra dữ liệu và giao diện

cần node 18 trở lên:

```bash
node tools/validate.js
```

hiện script kiểm tra:
- mã màu (`#hex`, `rgb()`, `hsl()`) chỉ được nằm trong `css/themes.css`
- từng cặp màu chữ/nền đạt chuẩn tương phản wcag aa ở **cả hai** chế độ sáng và tối

các giai đoạn sau sẽ thêm kiểm tra json, câu thoại, kaomoji, chữ thường.

## phòng thử của thỏ

mở `#/lab` (hoặc vào tab **tui** → **phòng thử của thỏ**) để xem bằng mắt:
- đủ 10 dáng của thỏ
- chuỗi `ẩn ẵ ậ ữ ỷ ơ ư đ ộ ỡ ặ ừ ẫ` ở mọi cỡ chữ
- kaomoji, thỏ ascii, bảng màu của chế độ hiện tại

## cấu trúc thư mục

```
index.html          khung trang + script chống nháy trắng trong <head>
css/themes.css      toàn bộ mã màu: [data-theme="light"] và [data-theme="dark"]
css/base.css        reset, font, lowercase (.ui), kaomoji (.kao), giảm chuyển động
css/components.css  khung app, thanh tab, thẻ, nút, trang trí, thỏ, bong bóng thoại
js/app.js           điểm khởi động
js/router.js        điều hướng bằng hash, tải màn khi cần
js/theme.js         4 chế độ: theo máy / sáng / tối / theo giờ (giờ việt nam)
js/bunny.js         thỏ svg + 10 trạng thái
js/storage.js       đọc/ghi localStorage có bọc try/catch
js/ui.js            helper giao diện, icon, bong bóng thoại
js/views/           màn hình từng tab: home, vocab, practice, games, me, lab
data/source/        sổ từ vựng excel gốc
tools/validate.js   kiểm tra
docs/               spec + kế hoạch
```

## đổi màu, thêm chế độ

mọi màu khai báo bằng css custom properties trong `css/themes.css`. component, svg, thỏ… chỉ dùng `var(--…)`, không viết mã màu cứng. muốn chỉnh màu thì sửa ở đó, rồi chạy `node tools/validate.js` để chắc vẫn đạt tương phản.

## thêm từ, câu hỏi, câu thoại, kaomoji

phần này có từ giai đoạn 2 (thoại, kaomoji) và giai đoạn 5 (từ vựng). khi đó tui sẽ thêm mẫu json vào đây.
