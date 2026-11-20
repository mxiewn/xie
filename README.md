# xie

web học từ vựng ielts (mục tiêu 6.5–7.0). triết lý: từ vựng phải thành **output**, tức là tự viết và tự nói ra được, không dừng ở mức nhìn thấy thì nhận ra nghĩa.

web tĩnh thuần html + css + javascript (es modules): không framework, không backend, không build step.
spec đầy đủ ở [`docs/spec.md`](docs/spec.md), kế hoạch và tiến độ ở [`docs/plan.md`](docs/plan.md).

giao diện thiết kế cho cả hai loại màn hình: điện thoại (dọc, thanh tab dưới) và máy tính (màn ngang, thanh điều hướng bên trái, nội dung chia nhiều cột).

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

script kiểm tra:
- mã màu (`#hex`, `rgb()`, `hsl()`) chỉ được nằm trong `css/themes.css`
- từng cặp màu chữ/nền đạt chuẩn tương phản wcag aa ở **cả hai** chế độ sáng và tối
- kho thoại `data/voice.json`: json hợp lệ, đủ trường, không trùng câu, biến `{…}` hợp lệ, không từ cấm, tối đa 1 từ lóng mỗi câu, không chữ hoa, độ dài (việt ≤ 14 từ, anh ≤ 12 từ), tối đa 1 dấu chấm than, không kéo dài chữ quá 3 ký tự, đủ số câu và kaomoji mỗi nhóm, tỉ lệ giọng 45/25/30, tối đa 15% câu chép nguyên mẫu
- kho mẹo `data/tips.json`: ít nhất 40 mẹo, viết thường, không trùng

test tự động (gọi thoại 100 lần mỗi nhóm, không lặp 15 câu gần nhất, câu ghép vẫn đạt luật, mật độ thoại…):

```bash
npm test
```

(hoặc `node --test tests/*.test.js`)

## phòng thử của thỏ

mở `#/lab` (hoặc vào tab **tui** → **phòng thử của thỏ**) để xem bằng mắt:
- đủ 10 dáng của thỏ, chọn được bộ trang phục để xem từng dáng mặc ra sao
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
js/bunny.js         thỏ svg: 10 trạng thái + 9 bộ trang phục
js/levels.js        9 cấp + trang phục mở khoá theo cấp (tủ đồ)
js/storage.js       đọc/ghi localStorage có bọc try/catch
js/ui.js            helper giao diện, icon, bong bóng thoại
js/voice-core.js    lõi giọng nói: chọn câu, ghép mảnh, chống lặp, luật viết (thuần, có test)
js/voice.js         giọng nói trên trình duyệt: tải kho thoại, lưu lịch sử, cài đặt nói nhiều/vừa/ít
js/views/           màn hình: home, vocab, practice, games, me, wardrobe, lab
data/voice.json     kho thoại + kaomoji của thỏ
data/tips.json      mẹo ielts (hiện ở màn hình đang tải)
data/source/        sổ từ vựng excel gốc
tools/validate.js   kiểm tra
tools/lines-review.md  câu thoại bị loại khi duyệt chống cringe
tests/              test tự động
docs/               spec + kế hoạch
```

## đổi màu, thêm chế độ

mọi màu khai báo bằng css custom properties trong `css/themes.css`. component, svg, thỏ… chỉ dùng `var(--…)`, không viết mã màu cứng. muốn chỉnh màu thì sửa ở đó, rồi chạy `node tools/validate.js` để chắc vẫn đạt tương phản.

## thêm câu thoại, kaomoji, mẹo

### câu thoại và kaomoji (`data/voice.json`)

mỗi nhóm là một tình huống. thêm câu vào `lines`, thêm kaomoji vào `kaomoji`:

```json
"dung": {
 "label": "trả lời đúng",
 "density": 0.33,
 "kaomoji": ["(๑˃ᴗ˂)ﻭ", "(☆▽☆)"],
 "lines": [
  { "text": "đúng rồi, nhớ cảm giác này nha", "tone": "warm", "cringe": 1, "join": "tail" },
  { "text": "the bunny approves this answer", "tone": "en", "cringe": 1 },
  { "text": "{word} hả, dễ ợt với bạn rồi", "tone": "genz", "cringe": 1 }
 ]
}
```

- `tone`: `genz` (việt có chút genz) · `warm` (việt ấm áp, không lóng) · `en` (có tiếng anh). giữ tỉ lệ khoảng 45 / 25 / 30.
- `cringe`: điểm tự chấm 1 hoặc 2. câu từ 3 trở lên thì đừng thêm.
- `join` (tuỳ chọn): cho phép ghép mảnh mở đầu (`opener`, vd "khoan,"), đuôi tiếng anh (`tail`, vd "noted.") hoặc cả hai (`both`). chỉ đặt khi câu ghép vẫn tự nhiên.
- `when` (tuỳ chọn): điều kiện, vd `{ "kind": "dark" }`, `{ "days": [0, 7] }`. nhóm có `kinds` thì mỗi loại cần ít nhất 2 câu.
- biến dùng được: `{name}` `{streak}` `{n}` `{left}` `{word}` `{days}` `{level}` `{minutes}` `{goal}`.
- luật viết: toàn chữ thường, tối đa 1 từ lóng, việt ≤ 14 từ, anh ≤ 12 từ, tối đa 1 dấu chấm than, không "lầy", không chê bai, không meme cũ. đọc to lên nghe phải như bạn bè nhắn tin.
- kaomoji: mỗi nhóm ít nhất 20 cái. cái nào hiện ô vuông trên điện thoại thì xoá.

### mẹo ielts (`data/tips.json`)

```json
{ "skill": "writing", "text": "kết bài task 2 chỉ tóm tắt lý do và nhắc lại quan điểm, không đưa thêm ý mới." }
```

viết thường, tối đa 170 ký tự, chính xác, không lóng.

thêm xong luôn chạy `node tools/validate.js` và `npm test`. muốn nghe thử câu mới thì vào phòng thử `#/lab` → **nghe thử thoại**.

### từ vựng, câu hỏi speaking/writing

có từ giai đoạn 5 (từ vựng) và 6 (luyện nói & viết). khi đó tui sẽ thêm mẫu json vào đây.
