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
- cấp (đúng 9 bậc, xp tăng dần), huy hiệu (ít nhất 20, không trùng, viết thường), thử thách mỗi ngày

test tự động: thoại (gọi 100 lần mỗi nhóm, không lặp 15 câu gần nhất, câu ghép vẫn đạt luật, mật độ thoại…), hồ sơ + lưu trữ, mục tiêu lượt + chuỗi ngày (học liên tục, đạt lúc 23:59 và 00:01, có học chưa đủ 50, bỏ ngày có / không băng, bỏ 2–3 ngày với 1–2 băng, nhận băng ở mốc 7 / 14, đủ 2 băng, đổi múi giờ máy, mở web nhiều lần trong ngày, game tối đa 25 lượt, điều kiện 10 lượt output, chống cày):

```bash
npm test
```

(hoặc `node --test tests/*.test.js`)

## phòng thử của thỏ

mở `#/lab` (hoặc vào tab **tui** → **phòng thử của thỏ**) để xem bằng mắt:
- đủ 10 dáng của thỏ, chọn được bộ trang phục để xem từng dáng mặc ra sao
- chuỗi `ẩn ẵ ậ ữ ỷ ơ ư đ ộ ỡ ặ ừ ẫ` ở mọi cỡ chữ
- kaomoji, thỏ ascii, bảng màu của chế độ hiện tại
- **giả lập ngày học**: bấm trả lời các loại bài, thử chống cày, qua ngày mới, vắng ngày mai, đủ 7 ngày liền… để xem vòng lượt, lịch nơ, băng giữ chuỗi, cấp, huy hiệu và thoại chạy ra sao. chạy đúng luật thật nhưng trên dữ liệu tạm, **không đụng tiến độ thật**

## mục tiêu lượt và chuỗi ngày

- mỗi ngày cần đủ mục tiêu lượt (50 / 80 / 120 / 200, chọn ở cài đặt), trong đó ít nhất **10 lượt output**. đủ thì chuỗi +1 và lịch có một cái nơ hồng
- 1 câu trả lời được chấm = 1 lượt. output tính nhiều hơn: tự viết câu 3, paraphrase 5, speaking part 1 3, part 3 5, topic sprint 10, part 2 10
- lượt game tính tối đa 25 cho mục tiêu (xp vẫn đủ)
- không tính lượt: trả lời lại một câu trong 10 phút, bấm nhanh dưới 1 giây liên tục, bài output dưới 5 từ
- giữ chuỗi tròn 7 ngày nhận 1 **băng giữ chuỗi** (giữ tối đa 2). ngày nào chưa đủ, băng tự cứu ngày đó, lần mở web sau thỏ báo. hết băng thì chuỗi về 0
- ngày tính theo giờ việt nam, đổi múi giờ máy không ảnh hưởng
- trang chủ: vòng "32/50 lượt", thanh "output 6/10", thỏ cầm cà rốt lớn dần, chuỗi + lịch nơ tuần này, thử thách hôm nay. bấm vào thẻ chuỗi để xem **lịch nơ** cả tháng
- tab tui: cấp + xp, **huy hiệu** (26 cái), tủ đồ mở theo cấp

## từ vựng

- **kho từ** (tab từ vựng): lọc theo nguồn, nhánh, chủ đề, nhóm con, mức thành thạo, chỉ từ hay sai. mỗi chủ đề có icon + màu riêng và tiến độ "x/y đã thành output"
- **học hôm nay**: ôn từ đến hạn trước (trộn chủ đề) → từ mới (mặc định 8/ngày) → bài output với từ đã tới mức 4. sai thì câu đó quay lại sau vài câu
- **4 mức**, đi qua lần lượt: 1 nhận biết (chọn nghĩa) → 2 nhớ lại (gõ ra cụm; gợi ý chữ đầu → số chữ cái → câu ví dụ có chỗ trống; không phân biệt hoa thường; cụm dài cho sai 1 ký tự; "(sth)" tuỳ chọn) → 3 dùng có hướng dẫn (điền vào câu, chọn cụm hợp ngữ cảnh; từ loại "word" có thêm word form, giới từ, collocation, sửa câu sai) → 4 dùng tự do (tự viết hoặc nói to, xem câu mẫu, tự chấm theo checklist)
- **kho output**: một từ vào kho khi qua mức 4 ở 2 ngày khác nhau. con số chính trên trang chủ
- **lặp lại ngắt quãng**: leitner 5 hộp, mỗi mức một bộ hộp. sai về hộp 1 (gặp lại sau 10 phút), bấm "khó" thì quay lại sớm. từ đã vào kho vẫn ôn thưa
- **thẻ từ**: mặt trước en → vi / vi → en / ngẫu nhiên (nhớ lựa chọn), nghe từ và từng ví dụ, mặt sau chia tab. sổ của tui chỉ sửa "câu của tôi" và "đã dùng khi nói"
- **từ của tui**: thêm từ gặp ngoài đời (bắt buộc từ + nghĩa), tự vào bài ôn
- **câu của tui + nhờ claude chấm**: mọi câu tự viết được lưu; gom lại thành prompt (band mục tiêu, từ mục tiêu, yêu cầu chấm word form, giới từ, collocation, độ tự nhiên, sửa lỗi, bản band 7), copy dán vào claude, rồi đánh dấu "đã chấm" và dán câu đã sửa
- **sổ lỗi**: câu sai tự lưu, phân loại (nghĩa, word form, giới từ, collocation, ngữ pháp). nút "ôn lỗi sai"
- **cài đặt**: mặt trước thẻ, từ mới lấy từ đâu (50% sổ của tui · 25% daily · 25% academic, chỉnh được), giọng đọc en-gb / en-us + tốc độ, âm thanh, rung. trình duyệt không đọc được tiếng anh thì nút loa tự ẩn

## nhập lại sổ từ vựng excel

sửa `data/source/so-tu-vung-theo-chu-de.xlsx` rồi chạy (cần python 3 + openpyxl):

```bash
pip install openpyxl
```

```bash
python3 tools/import-xlsx.py
```

script in số cụm mỗi chủ đề và tổng. tổng phải đúng 157, lệch thì dừng, không ghi gì. thêm / bớt cụm trong excel thì sửa `EXPECTED_TOTAL` trong script và số 157 trong `tools/validate.js`. tiến độ học không mất vì id cụm là `<chủ-đề>-<số thứ tự>`. cụm tui thấy chưa tự nhiên được ghi ở `tools/review-vocab.md` để bạn duyệt (tui không sửa gì trong sổ).

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
js/levels.js        9 cấp (xp + điều kiện hai bậc cuối) + trang phục mở khoá theo cấp (tủ đồ)
js/daily-goal.js    mục tiêu lượt: số lượt mỗi loại bài, chống cày, game 25, output 10, thử thách mỗi ngày (thuần, có test)
js/streak.js        chuỗi ngày, băng giữ chuỗi, lịch tháng / tuần (thuần, có test)
js/badges.js        26 huy hiệu (thuần, có test)
js/progress-core.js tiến độ: schema xie:progress, ghi câu trả lời → lượt, chuỗi, xp, cấp, huy hiệu, sự kiện (thuần, có test)
js/progress.js      tiến độ trên trình duyệt + thỏ ăn mừng (thoại, confetti hình nơ, thông báo nhỏ)
js/progress-ui.js   mảnh giao diện: vòng lượt, thanh output, dải tuần, lịch tháng, thẻ báo băng / đứt chuỗi
js/nav-today.js     thanh menu desktop: kaomoji ngẫu nhiên sau tên web, nút sáng | tối, thẻ "hôm nay" (cà rốt theo lượt, chuỗi, số băng)
js/storage.js       đọc/ghi localStorage có bọc try/catch
js/state-core.js    dữ liệu người học: schema có version, nâng cấp, chuẩn hoá, ngày giờ việt nam (thuần, có test)
js/state.js         đọc/ghi hồ sơ trên trình duyệt, ghé thăm, xuất / nhập / xoá dữ liệu
js/topics.js        chủ đề, kỹ năng, mức mục tiêu lượt
js/ui.js            helper giao diện, icon, bong bóng thoại
js/voice-core.js    lõi giọng nói: chọn câu, ghép mảnh, chống lặp, luật viết (thuần, có test)
js/voice.js         giọng nói trên trình duyệt: tải kho thoại, lưu lịch sử, cài đặt nói nhiều/vừa/ít
js/srs.js           lặp lại ngắt quãng: leitner 5 hộp riêng từng mức, mở mức, kho output (thuần, có test)
js/vocab-core.js    lõi từ vựng: chuẩn hoá mục từ, chấm câu gõ, đục lỗ ví dụ, câu hỏi 4 mức, chọn từ mới, từ của ngày, prompt nhờ claude chấm (thuần, có test)
js/vocab-state.js   dữ liệu học: xie:vocab, câu của tui, sổ lỗi, từ của tui, kế hoạch hôm nay (thuần, có test)
js/vocab-store.js   từ vựng trên trình duyệt: tải chủ đề khi cần, lưu, ghi mỗi lần trả lời vào srs + lượt + sổ lỗi
js/speech.js        phát âm (web speech api), ẩn nút nếu không hỗ trợ
js/sound.js         âm thanh tạo bằng web audio + rung nhẹ
js/views/           màn hình: welcome (làm quen), home, streak (lịch nơ), vocab, study (phiên học), word (thẻ từ), my-word (từ của tui),
                    grade (câu của tui + nhờ claude chấm), practice, games, me, badges, settings, wardrobe, lab (+ lab-sim)
data/voice.json     kho thoại + kaomoji của thỏ
data/tips.json      mẹo ielts (hiện ở màn hình đang tải)
data/vocab/         kho từ: index.json + mỗi chủ đề một file (excel-<chủ-đề>.json là sổ của tui)
data/source/        sổ từ vựng excel gốc
tools/import-xlsx.py  nhập sổ excel → data/vocab/
tools/review-vocab.md cụm cần bạn duyệt
tools/validate.js   kiểm tra
tools/lines-review.md  câu thoại bị loại khi duyệt chống cringe
tests/              test tự động
docs/               spec + kế hoạch
```

## dữ liệu của bạn

mọi thứ lưu trong localStorage của trình duyệt, key có tiền tố `xie:`. hồ sơ học nằm ở `xie:state`, tiến độ (lượt từng ngày, chuỗi, xp, huy hiệu) ở `xie:progress`, tiến độ từ vựng ở `xie:vocab`, câu tự viết ở `xie:sentences`, sổ lỗi ở `xie:mistakes`, từ của tui ở `xie:my-words`; mỗi key có số `version` để sau này nâng cấp không mất dữ liệu. vào **tui → hồ sơ & cài đặt → dữ liệu** để:
- **xuất dữ liệu**: tải về file `xie-du-lieu-ngày.json` để sao lưu hoặc chuyển sang máy khác
- **nhập dữ liệu**: chọn lại file đó (file lạ hoặc hỏng sẽ bị từ chối, không ghi gì)
- **xoá toàn bộ dữ liệu**: phải bấm xác nhận 2 lần

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

### từ vựng (`data/vocab/`)

cách dễ nhất: thêm trong app (**từ vựng → thêm từ của tui**). muốn thêm thẳng vào kho thì tạo file chủ đề `data/vocab/<tên>.json`
và khai báo nó trong `data/vocab/index.json` (`{ "id": "<chủ-đề>", "label": "tên chủ đề viết thường", "source": "xie", "track": "academic", "file": "<tên>.json", "count": 1 }`).

mẫu một cụm (type "phrase"):

```json
{
 "topic": { "id": "an-uong", "label": "ăn uống & nấu ăn", "source": "xie", "track": "daily" },
 "items": [
  {
   "id": "an-uong-1", "source": "xie", "track": "daily", "topic": "an-uong", "subgroup": "món ruột",
   "type": "phrase", "phrase": "my comfort food", "alternatives": ["my go-to dish"],
   "meaning_vi": "món ăn làm mình thấy dễ chịu", "examples": ["Instant noodles are my comfort food on rainy days."],
   "use_for": "speaking", "note": "", "level": "B2",
   "speaking_questions": ["What kind of food do you like?"]
  }
 ]
}
```

mẫu một từ học thuật (type "word", thêm các trường riêng). trường nào không chắc thì để rỗng, **không bịa**:

```json
{
 "id": "education-1", "source": "xie", "track": "academic", "topic": "education", "subgroup": "",
 "type": "word", "phrase": "beneficial", "alternatives": [], "meaning_vi": "có lợi",
 "examples": ["Regular exercise is beneficial to students' concentration."],
 "use_for": "writing", "note": "", "level": "B2", "speaking_questions": [],
 "ipa": "/ˌben.ɪˈfɪʃ.əl/", "pos": "adjective",
 "word_family": { "noun": ["benefit"], "verb": ["benefit"], "adjective": ["beneficial"], "adverb": ["beneficially"], "negative": [] },
 "prepositions": [{ "pattern": "beneficial to sb/sth", "example": "Sleep is beneficial to memory." }],
 "collocations": { "verb": ["prove beneficial"], "adj": ["highly beneficial"], "noun": [] },
 "register": "trang trọng, hợp writing", "common_mistakes_vi": [{ "wrong": "beneficial for to students", "right": "beneficial to students", "why": "thừa giới từ" }],
 "synonyms": [{ "word": "advantageous", "note": "trang trọng hơn" }], "antonyms": ["detrimental"], "band_booster": true
}
```

id phải không trùng, `count` trong index phải khớp số mục. chạy `node tools/validate.js` để kiểm tra.
