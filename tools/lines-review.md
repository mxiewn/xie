# duyệt thoại chống cringe

file này ghi lại quy trình duyệt kho thoại `data/voice.json` theo spec mục 4, để bạn xem lại.

## quy trình

1. mỗi nhóm viết **gấp đôi** số câu tối thiểu (nhóm 40 câu → viết ~80, nhóm 16 câu → viết ~32, mỗi nhóm chào 20 câu → viết ~40).
2. đọc to từng câu, chấm thang cringe 1–5 (1 = tự nhiên như bạn bè nhắn, 5 = muốn độn thổ). **chỉ giữ câu ≤ 2**. điểm của câu được giữ nằm ở trường `cringe` trong json.
3. câu bị loại ghi bên dưới, kèm điểm và lý do.
4. đọc lại cả nhóm một lượt, bỏ bớt câu cùng một kiểu đùa (lý do `trùng kiểu`).

sau đó `node tools/validate.js` soát lại bằng máy: từ cấm, tối đa 1 từ lóng, độ dài (việt ≤ 14 từ, anh ≤ 12 từ), tối đa 1 dấu chấm than, không kéo dài chữ quá 3 ký tự, không chữ hoa, tỉ lệ giọng 45/25/30, tối đa 15% câu chép nguyên mẫu.

## kết quả

| | số câu |
| --- | --- |
| viết nháp | 1.208 |
| giữ lại (cringe ≤ 2) | 644 |
| loại | 564 |

tỉ lệ giọng của câu giữ lại: genz 40% · ấm áp 26% · có tiếng anh 34% (mục tiêu 45/25/30, cho lệch ±7).

## ký hiệu lý do

- **chồng lóng**: hơn 1 từ lóng, hoặc nhồi lóng cho có
- **poster**: triết lý sáo rỗng, giọng poster động lực
- **quảng cáo**: nghe như fanpage, banner, quảng cáo
- **sách vở**: giọng công sở hoặc sách giáo khoa
- **giải thích đùa**: tự giải thích câu đùa
- **trùng kiểu**: cùng kiểu đùa với một câu đã giữ trong nhóm
- **baby talk**: nũng nịu quá đà
- **dài**: vượt giới hạn độ dài hoặc đọc mệt
- **anh gượng**: tiếng anh không tự nhiên, dịch từng chữ
- **áp lực**: chê bai, gây áp lực, so sánh
- **meme cũ**: meme lỗi thời hoặc brainrot
- **sai kiến thức**: thông tin chưa chắc đúng, không đưa vào
- **lạc nhóm**: không hợp tình huống của nhóm

## câu bị loại theo nhóm

### onboarding (loại 14)
- "xin chào và chào mừng bạn đến với hành trình chinh phục ielts" · 5 · quảng cáo
- "hellooo bestie, tên bạn là gì nè" · 4 · chồng lóng, baby talk
- "trước khi bắt đầu, vui lòng cung cấp tên của bạn" · 4 · sách vở
- "tui là thỏ nè, tui siêu dễ thương luôn á" · 4 · baby talk
- "what's your name, my dear future band 9 legend?" · 4 · anh gượng, quảng cáo
- "{name}, cái tên này slay quá trời luôn" · 4 · chồng lóng
- "đẹp như tên của bạn vậy {name}" · 3 · nịnh gượng
- "{name} ơi, từ nay tụi mình là gen z học ielts" · 5 · từ cấm "gen z tụi mình"
- "hello {name}, let's make magic happen together" · 4 · poster
- "thành công đến từ những bước nhỏ, {name} à" · 5 · poster, từ cấm
- "setup xong rồi nè, giờ thì cùng nhau toả sáng nhé" · 4 · poster
- "your journey to fluency begins now" · 4 · quảng cáo
- "xong rồi, giờ bạn không được lười nữa đâu" · 5 · áp lực, từ cấm
- "hoàn tất cài đặt. chúc bạn học tập hiệu quả" · 4 · sách vở

### chao_sang (loại 20)
- "chào buổi sáng tốt lành, chúc bạn một ngày học tập hiệu quả" · 4 · sách vở
- "rise and shine bestie, đỉnh nóc kịch trần luôn" · 5 · meme cũ, từ cấm
- "sáng nay bạn đã sẵn sàng chinh phục những đỉnh cao mới chưa" · 5 · poster
- "good morning sunshine, the world is yours" · 4 · poster
- "dậy đi dậy đi dậy điiii" · 3 · kéo dài chữ quá 3, áp lực
- "buổi sáng xịn xò, từ vựng khét lẹt" · 4 · chồng lóng
- "người thành công luôn dậy sớm đó" · 5 · poster, so sánh
- "sáng rồi mà còn ngủ là hơi lười đó nha" · 5 · từ cấm, áp lực
- "morning vibes only, let's slay this day" · 4 · chồng lóng, quảng cáo
- "cà phê sữa đá và từ vựng, combo hoàn hảo cho một buổi sáng tuyệt vời" · 3 · dài, quảng cáo
- "chào sáng, hôm nay học thêm vài từ để tiến gần giấc mơ du học nha" · 3 · dài, gượng
- "thỏ đã thức dậy và sẵn sàng đồng hành cùng bạn" · 3 · sách vở
- "ngày mới năng lượng mới, gét gô" · 3 · trùng câu cửa miệng, sáo
- "sáng sớm mà học là não hấp thụ gấp mười lần luôn" · 3 · sai kiến thức (con số bịa)
- "the early bird catches the worm. you are the bird" · 3 · giải thích đùa
- "sáng nay trời trong xanh như tương lai của bạn" · 4 · poster
- "dậy rồi hả, mắt còn díp lại kìa, dễ thương ghê" · 3 · baby talk
- "sáng nay học không? học đi mà, đi mà" · 3 · nài nỉ, áp lực
- "buổi sáng là thời điểm vàng để não bộ tiếp thu kiến thức mới" · 3 · sách vở
- "hello buổi sáng, hôm nay mình cùng nhau cố gắng nhé" · 2 · trùng kiểu với câu đã giữ (bỏ khi đọc lại cả nhóm)

### chao_trua_chieu (loại 20)
- "buổi chiều an lành, chúc bạn học tập thật hiệu quả" · 4 · sách vở
- "chiều rồi mà vẫn chưa học là hơi kém đó" · 5 · từ cấm, áp lực
- "afternoon grind never stops, let's gooo" · 4 · poster, kéo dài chữ
- "trưa nắng chang chang mà vẫn học, đỉnh của chóp" · 4 · meme cũ
- "chiều nay chill chill, học xíu cho xịn" · 4 · chồng lóng
- "một buổi chiều năng suất bắt đầu từ một quyết định nhỏ" · 4 · poster
- "ăn trưa xong buồn ngủ là do đường huyết, học xíu cho tỉnh nha" · 3 · giải thích dài, gượng
- "đừng để buổi chiều trôi qua vô nghĩa" · 4 · áp lực, poster
- "hey bestie, siesta xong chưa" · 3 · chồng lóng gượng
- "chiều chiều ra đứng bờ sông, học từ vựng thay chồng" · 4 · gượng, lạc nhóm
- "it's afternoon. you know what that means" · 3 · nhạt, không có nội dung
- "buổi chiều hôm nay sẽ là buổi chiều đáng nhớ" · 3 · quảng cáo
- "thỏ đã ăn trưa xong và sẵn sàng học cùng bạn rồi đây" · 3 · sách vở, trùng kiểu cà rốt
- "học vào buổi chiều giúp ghi nhớ tốt hơn 30%" · 4 · sai kiến thức
- "trưa rồi, đi ăn đi, à mà học trước đã" · 3 · lủng củng
- "chiều tà buông xuống, từ vựng lên ngôi" · 4 · văn vẻ gượng
- "bạn ơi chiều rồi nè, học hông học hông" · 3 · nài nỉ, baby talk
- "afternoon tea and vocabulary, très chic" · 3 · anh gượng, lạc giọng
- "giữa ngày mà vẫn chăm chỉ, đúng là hình mẫu lý tưởng" · 3 · nịnh gượng
- "trà sữa trân châu và từ vựng, chân ái là đây" · 3 · trùng kiểu với câu trà sữa đã giữ

### chao_toi_khuya (loại 20)
- "chúc bạn buổi tối an lành và học tập hiệu quả" · 4 · sách vở
- "khuya rồi mà còn học, đúng là chiến thần" · 3 · lóng cũ
- "night grind, no sleep, all gain" · 5 · poster, khuyên thức khuya
- "thức khuya học bài là bí quyết của người thành công" · 5 · poster, sai kiến thức
- "đêm nay trăng sáng như ước mơ band 7 của bạn" · 4 · poster
- "khuya rồi ngủ đi cục cưng" · 5 · từ cấm baby talk
- "học đến sáng luôn đi, tui thức cùng" · 4 · khuyến khích thức khuya
- "đêm khuya thanh vắng, chỉ có bạn và từ vựng" · 3 · văn vẻ
- "good night and sweet vocabulary dreams" · 3 · anh gượng
- "trăng lên rồi, sao cũng lên, điểm cũng lên" · 3 · gượng vần
- "khuya rồi, hôm nay bạn đã làm được gì cho tương lai chưa" · 4 · áp lực
- "tối nay chill nhẹ, học xíu cho xịn" · 4 · chồng lóng
- "cú đêm chính hiệu đây rồi, tui là cú thỏ" · 3 · trùng kiểu cú đêm
- "ngủ trước 11 giờ giúp tăng điểm ielts" · 5 · sai kiến thức
- "the night is young and so is your vocabulary" · 3 · nhạt, lạc nghĩa
- "đèn ngủ bật chưa? bật xong rồi học" · 2 · trùng kiểu ánh đèn (bỏ khi đọc lại cả nhóm)
- "tối nay tâm trạng sao, kể tui nghe với" · 3 · lạc nhóm
- "khuya quá rồi, mai dậy không nổi thì đừng trách tui" · 4 · áp lực
- "sleep is for the weak? nah, sleep is for memory" · 3 · dài, giải thích đùa
- "tối rồi, đi tắm rồi vô học nha" · 2 · lạc nhóm (bỏ khi đọc lại cả nhóm)

### dung (loại 38)
- "chúc mừng bạn đã trả lời chính xác" · 5 · sách vở, gần câu cấm
- "đỉnh nóc kịch trần bay phấp phới luôn" · 5 · từ cấm
- "slay quá trời slay, khét lẹt" · 5 · chồng lóng
- "bạn là thiên tài ngôn ngữ" · 4 · nịnh quá đà
- "giỏi hơn mọi người luôn á" · 5 · so sánh, từ cấm
- "correct! you're amazing! keep it up!" · 4 · nhiều dấu chấm than, quảng cáo
- "đúng rồi nè, giỏi quá đi mất thôi" · 3 · baby talk
- "xuất sắc, tiếp tục phát huy nhé" · 4 · sách vở
- "w rizz vocabulary" · 5 · meme cũ, từ cấm
- "đúng rồi, bạn đang trên con đường chinh phục ielts" · 4 · poster
- "chuẩn không cần chỉnh" · 3 · sáo
- "ăn trọn điểm, xịn xò con bò" · 4 · chồng lóng
- "đúng rồi, tui biết ngay mà, tui tin bạn từ đầu" · 3 · dài, nịnh
- "that's what i'm talking about!" · 3 · quảng cáo
- "trả lời đúng rồi, điểm cộng cho sự chăm chỉ" · 3 · sách vở
- "đúng rồi, như vậy là bạn đã nắm được kiến thức" · 4 · sách vở
- "you are the main character today" · 3 · lạc nhóm, đã dùng cho mất streak
- "đúng, khét, xịn, đỉnh" · 5 · chồng lóng
- "aura +1000" · 5 · từ cấm
- "đúng như dự đoán của tui, vì tui đã dạy bạn mà" · 3 · tự khen, dài
- "đúng rồi, examiner chắc đang mỉm cười" · 2 · trùng kiểu examiner gật đầu
- "đúng, cà rốt cho bạn nè, ăn đi" · 2 · trùng kiểu cà rốt
- "ok đúng, sang câu khác cho nhanh" · 3 · nhạt, hơi phũ
- "nice one, bestie" · 3 · lóng hạn chế, nhạt
- "đúng rồi đó, thấy chưa, dễ mà" · 3 · coi nhẹ, hơi áp lực khi sai lần sau
- "đúng! tuyệt vời! xuất sắc!" · 5 · nhiều dấu chấm than
- "điểm 10 cho chất lượng" · 3 · sáo
- "đúng rồi, tui vỗ tay nè, bốp bốp bốp" · 3 · trùng kiểu vỗ tay
- "the vocabulary gods are pleased" · 3 · gượng
- "đúng, não bạn chắc to lắm" · 3 · gượng
- "bạn học kiểu gì mà giỏi vậy, chỉ tui với" · 3 · nịnh, dài
- "đúng rồi đó, đừng tự mãn nha" · 4 · áp lực
- "correct answer detected" · 3 · máy móc
- "đúng, nhớ ghi lại vào sổ tay nhé" · 3 · sách vở
- "ok ngon, ăn được, chấm điểm 9 trên 10" · 3 · lủng củng
- "chuẩn chỉnh từng milimet" · 3 · sáo
- "đúng rồi đó bạn hiền" · 3 · lỗi thời
- "đúng rồi, bạn xứng đáng nhận một tràng pháo tay" · 3 · sách vở, sáo

### combo (loại 15)
- "{n} câu liên tiếp, bạn là huyền thoại sống" · 4 · nịnh quá đà
- "combo khét lẹt, xịn xò, đỉnh cao" · 5 · chồng lóng
- "unstoppable! unbeatable! unbelievable!" · 5 · nhiều dấu chấm than, quảng cáo
- "let them cook. người đang cook là bạn" · 3 · chồng lóng (cook ×2)
- "combo này mà lên tiktok là viral" · 3 · lạc nhóm
- "đúng liên tiếp {n} câu, tiếp tục phát huy nhé" · 4 · sách vở
- "you're on fire, literally" · 3 · anh gượng
- "ai cản được bạn nữa đâu" · 3 · sáo
- "tay nóng, não nóng, máy cũng nóng" · 3 · trùng kiểu nóng tay
- "combo này phải đóng khung treo tường" · 2 · trùng kiểu với điểm tuyệt đối (bỏ khi đọc lại)
- "{n} hit combo, sigma grindset" · 5 · từ cấm, meme cũ
- "đừng dừng lại, dừng lại là thua" · 4 · áp lực
- "streak trong streak trong streak" · 3 · giải thích đùa thừa
- "combo này mà thi thật thì band 9 chắc rồi" · 4 · hứa hão
- "liên hoàn cước từ vựng" · 3 · gượng

### diem_tuyet_doi (loại 15)
- "error 404: mistakes not found" · 2 · không có từ tiếng anh thông dụng nên máy đọc sai giọng; giữ ý ở câu khác
- "chúc mừng bạn đã đạt điểm tuyệt đối trong bài học hôm nay" · 5 · sách vở, gần câu cấm
- "hoàn hảo! xuất sắc! không thể tin được!" · 5 · nhiều dấu chấm than
- "100 điểm không có nhưng, đỉnh nóc kịch trần" · 5 · từ cấm
- "you are literally a genius, no cap" · 4 · chồng lóng, nịnh
- "điểm tuyệt đối, giỏi hơn 99% người học" · 5 · so sánh, sai kiến thức
- "perfect score, perfect you" · 4 · quảng cáo
- "tui cảm động muốn khóc luôn đó" · 3 · baby talk
- "không sai câu nào, đúng là con nhà người ta" · 4 · so sánh
- "flawless victory" · 3 · meme game cũ
- "full điểm, slay, ăn trọn" · 5 · chồng lóng
- "ielts 9.0 trong tầm tay rồi" · 4 · hứa hão
- "tuyệt đối điện ảnh" · 3 · lóng cũ
- "đúng hết rồi, giờ thì nghỉ ngơi đi, không cần học thêm" · 3 · lạc nhóm, khuyên sai
- "you understood the assignment" · 3 · meme cũ

### sai (loại 39)
- "sai rồi, cố gắng hơn nhé" · 4 · sách vở, áp lực
- "sai nữa rồi, hơi kém đó" · 5 · từ cấm, chê
- "câu này dễ vậy mà cũng sai hả" · 5 · chê, áp lực
- "không sao, ai cũng có lúc dở" · 5 · từ cấm
- "thất bại là mẹ thành công, thành công là con thất bại" · 3 · giải thích đùa, dài
- "the comeback is stronger than the setback" · 5 · từ cấm, poster
- "sai rồi hihi" · 4 · kết bằng hihi
- "đừng buồn nha cục cưng" · 5 · từ cấm
- "oops, wrong answer! try again!" · 4 · nhiều dấu chấm than
- "ngu ngơ chút thôi mà" · 5 · từ cấm
- "người khác cũng sai câu này nhiều lắm" · 4 · so sánh, từ cấm
- "sai là chuyện thường ở huyện" · 3 · thành ngữ cũ
- "sai rồi nè, buồn ghê á" · 3 · baby talk
- "believe in yourself, bạn làm được" · 5 · từ cấm
- "lỗi sai là bậc thang dẫn tới thành công" · 5 · poster
- "trật lất rồi, xem lại đi" · 3 · phũ
- "keo lì tái châu luôn câu này" · 5 · từ cấm
- "chưa đúng, hãy đọc kỹ đề bài trước khi trả lời" · 4 · sách vở, áp lực
- "sai rồi, nhưng không sao vì bạn vẫn dễ thương" · 3 · lạc ý
- "mistakes are proof that you are trying" · 4 · poster
- "đáp án là ... thôi khỏi nói, bạn tự biết" · 3 · khó hiểu
- "hơi trượt, như trượt vỏ chuối" · 3 · gượng
- "sai một li đi một dặm" · 4 · gây áp lực
- "tui buồn vì bạn sai" · 4 · đổ lỗi cảm xúc
- "sai rồi, tui đã nói rồi mà" · 4 · trách
- "giới từ này troll bạn rồi" · 3 · lóng cũ
- "đừng lo, examiner cũng từng sai" · 3 · trùng kiểu "native speakers"
- "sai, cà rốt bị trừ một củ" · 3 · phạt, áp lực
- "không sao đâu, mai làm lại" · 2 · trùng kiểu với câu đã giữ (bỏ khi đọc lại)
- "wrong, but in a cute way" · 3 · baby talk
- "sai thì đã sao, đời còn dài" · 3 · sáo
- "lần sau cẩn thận hơn nhé" · 4 · sách vở
- "chỗ này hơi kém tập trung rồi" · 5 · từ cấm
- "sai mà vẫn tự tin là được" · 3 · khuyên sai
- "this is fine. everything is fine" · 3 · meme cũ
- "câu này khó, bạn sai cũng đúng thôi" · 2 · lủng củng (bỏ khi đọc lại)
- "sai nhưng có tâm" · 3 · lóng cũ
- "tui sẽ không nói với ai là bạn sai đâu" · 3 · gượng
- "sai rồi kìa, ủa alo" · 3 · lóng sai chỗ

### sai_nhieu (loại 14)
- "từ này keo thật. nhưng bạn keo hơn" · 2 · mẫu hay nhưng 2 từ lóng (keo ×2), viết lại thành câu "dai"
- "đừng bỏ cuộc, bạn là chiến binh" · 4 · poster
- "sai nhiều quá rồi, nghỉ đi" · 4 · áp lực
- "ôm ôm iu iu nè" · 5 · từ cấm baby talk
- "it's okay to not be okay" · 4 · poster, lạc nhóm
- "bạn đã cố gắng rất nhiều, tui tự hào về bạn" · 3 · sáo
- "sai liền mấy câu là do bạn mệt hay do bạn lười" · 5 · từ cấm, áp lực
- "every expert was once a beginner" · 4 · poster
- "mưa rồi sẽ tạnh, sai rồi sẽ đúng" · 4 · poster
- "đây là lúc thử thách bản lĩnh của bạn" · 4 · áp lực
- "tui cũng sai hoài nè, đừng buồn nha bạn iu" · 4 · baby talk
- "sai là để biết đường sửa, sửa là để đúng" · 3 · vòng vo
- "nghỉ ngơi đi, mai mình chiến tiếp" · 2 · trùng kiểu nghỉ 10 giây (bỏ khi đọc lại)
- "dở chút thôi mà" · 5 · từ cấm

### goi_y (loại 15)
- "gợi ý: từ này bắt đầu bằng chữ cái đầu tiên" · 3 · giải thích đùa
- "đây là gợi ý siêu bí mật chỉ dành cho bạn" · 3 · quảng cáo
- "hint: the answer is the answer" · 3 · nhạt
- "dễ mà, sao chưa ra" · 4 · áp lực
- "tui gợi ý xịn xò, bạn trả lời khét lẹt nha" · 4 · chồng lóng
- "think outside the box" · 4 · poster
- "gợi ý số 1, gợi ý số 2, gợi ý số 3" · 3 · máy móc
- "cần gợi ý hả, vậy là chưa thuộc bài rồi" · 4 · áp lực
- "examiner không cho gợi ý đâu, tận hưởng đi" · 2 · trùng kiểu examiner (bỏ khi đọc lại)
- "psst psst psst psst" · 3 · lặp gượng
- "use your brain, bestie" · 4 · phũ, lóng
- "gợi ý thì gợi ý, nhưng đừng quen nha" · 3 · áp lực
- "manh mối đầu tiên: nhìn vào câu" · 3 · nhạt
- "sherlock mode: on" · 3 · lạc giọng
- "tui biết đáp án mà tui hông nói, hihi" · 4 · kết hihi

### nghe_phat_am (loại 15)
- "hãy lắng nghe và lặp lại theo phát âm chuẩn" · 4 · sách vở
- "nghe nè, giọng tui chuẩn british luôn" · 3 · thỏ không phát âm, sai vai
- "listen and repeat, repeat and listen" · 3 · máy móc
- "phát âm chuẩn như người bản xứ trong 7 ngày" · 5 · quảng cáo
- "tai thỏ thính lắm đó, nghe đi" · 2 · trùng kiểu tai dài (bỏ khi đọc lại)
- "nghe xịn sò, đọc khét lẹt" · 4 · chồng lóng
- "giọng của bạn nghe như mật ong" · 3 · nịnh gượng
- "đừng phát âm kiểu việt nha" · 4 · chê
- "pronunciation is the key to success" · 4 · poster
- "nghe lại 10 lần cho thuộc" · 3 · áp lực
- "âm cuối mà nuốt là examiner nuốt luôn điểm" · 3 · áp lực, gượng
- "nghe giọng mỹ cho sang" · 3 · thiên vị giọng
- "hãy chú ý trọng âm của từ" · 3 · sách vở
- "tune in, vocabulary radio" · 3 · gượng
- "nghe mà không đọc theo là phí" · 3 · áp lực nhẹ

### tu_viet (loại 14)
- "writer era: on" · 2 · mẫu hay nhưng thiếu từ tiếng anh thông dụng để máy nhận giọng; viết lại thành "your writer era is on"
- "hãy viết một câu hoàn chỉnh sử dụng từ vừa học" · 4 · sách vở
- "viết đi, viết như chưa từng được viết" · 4 · poster
- "the pen is mightier than the sword" · 3 · sáo
- "viết xấu là do bút, không phải do bạn" · 3 · gượng
- "viết mà không dùng collocation là viết chay" · 3 · áp lực
- "câu này phải viết cho slay" · 3 · lóng gượng
- "viết thật hay để examiner khóc luôn" · 3 · gượng
- "shakespeare đang nhìn bạn đó" · 3 · áp lực
- "viết ít nhất 20 từ nha" · 3 · máy móc
- "bạn viết hay quá, làm nhà văn được luôn" · 4 · nịnh
- "write like nobody's reading" · 2 · trùng kiểu "speak like nobody is grading" (bỏ khi đọc lại)
- "câu tự viết là câu chất lượng nhất vũ trụ" · 3 · nói quá
- "viết câu nào sai tui chấm đỏ nha" · 4 · áp lực

### noi_to (loại 15)
- "hãy luyện nói to và rõ ràng mỗi ngày" · 4 · sách vở
- "speak up, the world is listening" · 4 · poster
- "nói to lên cho cả xóm nghe luôn" · 2 · trùng kiểu hàng xóm (bỏ khi đọc lại)
- "nói sai là xấu hổ lắm đó" · 5 · áp lực
- "the mic is yours. well, imaginary mic. because no recording" · 3 · giải thích đùa
- "nói như người bản xứ đi" · 4 · áp lực
- "bật mode tự tin 100%" · 3 · sáo
- "nói đi, sợ gì, sợ thì sợ examiner" · 3 · lủng củng
- "your voice matters" · 4 · poster
- "đọc to như đọc rap luôn" · 3 · gượng
- "nói đi bestie, slay cái speaking này" · 4 · chồng lóng
- "giọng hay như ca sĩ" · 3 · nịnh, lạc nhóm
- "cứ nói đi, sai thì tui sửa" · 3 · sai vai (web không nghe được)
- "tập nói trước gương 30 phút mỗi ngày" · 3 · áp lực, máy móc
- "nói chưa hay thì nói nhiều cho hay" · 2 · trùng kiểu (bỏ khi đọc lại)

### tu_moi (loại 15)
- "new word unlocked: {word}" · 2 · mẫu hay nhưng thiếu từ tiếng anh thông dụng để máy nhận giọng; viết lại thành "a new word for you"
- "xin giới thiệu từ mới của ngày hôm nay: {word}" · 4 · sách vở
- "{word} – từ vựng đắt giá giúp bạn đạt band 9" · 4 · quảng cáo
- "{word} slay vãi" · 4 · lóng thô
- "hôm nay học {word}, mai học {word} nữa" · 3 · lủng củng
- "{word} is the new black" · 3 · sáo
- "từ này xịn xò con bò" · 4 · lóng cũ
- "học thuộc {word} ngay và luôn" · 3 · áp lực
- "{word} đây, học hay không tuỳ bạn" · 3 · phũ
- "{word} sẽ thay đổi cuộc đời bạn" · 4 · nói quá
- "breaking news: {word}" · 3 · gượng
- "{word} nghe như tên một loại bánh" · 2 · tuỳ từ, có khi sai (bỏ)
- "{word} là chìa khoá vàng" · 4 · sáo
- "cùng chào đón {word} bằng một tràng pháo tay" · 3 · sách vở
- "từ này người bản xứ dùng hằng ngày" · 3 · có khi sai kiến thức

### tu_output (loại 15)
- "chúc mừng! {word} đã được thêm vào kho output" · 4 · sách vở
- "{word} giờ là của bạn mãi mãi" · 3 · hứa quá (vẫn cần ôn)
- "{word} unlocked, achievement get" · 3 · meme game
- "giỏi quá, {word} thuộc rồi kìa" · 3 · trùng kiểu
- "you own {word} now. literally" · 3 · anh gượng
- "{word} đã gia nhập biệt đội" · 2 · trùng kiểu "về đội" (bỏ khi đọc lại)
- "kho output +1, đỉnh nóc" · 5 · từ cấm
- "{word} thành output rồi, học thêm 999 từ nữa là xong" · 4 · áp lực
- "từ vựng của bạn đang tăng trưởng thần tốc" · 3 · quảng cáo
- "{word} đã tốt nghiệp loại xuất sắc" · 2 · trùng kiểu "graduated" (bỏ khi đọc lại)
- "{word} ơi, chào mừng về nhà" · 3 · baby talk
- "slay cái {word} này luôn" · 3 · lóng gượng
- "output level: legendary" · 3 · nói quá
- "kho output đầy dần như ví cuối tháng... à không" · 3 · giải thích đùa
- "{word} giờ đã là output, hãy sử dụng nó trong writing task 2" · 3 · sách vở, dài

### tien_do (loại 15)
- "còn {left} lượt nữa, cố lên cố lên cố lên" · 3 · lặp, áp lực
- "chỉ còn {left} lượt, đừng bỏ cuộc giữa chừng" · 4 · áp lực
- "you're almost there, don't give up now!" · 4 · poster
- "{left} lượt nữa là xong, nhanh lên" · 4 · thúc ép
- "nửa đường rồi, nửa còn lại là nửa khó" · 3 · gây nản
- "keep pushing, champion" · 4 · poster
- "{left} lượt nữa thôi bestie, gét gô" · 4 · chồng lóng
- "tiến độ hôm nay: {left} lượt còn lại" · 3 · máy móc
- "dừng bây giờ là mất chuỗi đó nha" · 4 · áp lực
- "sắp tới đích rồi, đích là cà rốt" · 2 · trùng kiểu cà rốt (bỏ khi đọc lại)
- "halfway there, livin' on a prayer" · 3 · meme cũ
- "còn {left} lượt, nhanh như một cái chớp mắt" · 3 · sáo
- "thêm {left} lượt nữa là trở thành phiên bản tốt hơn" · 4 · poster
- "chặng cuối luôn là chặng khó nhất" · 3 · gây nản
- "sắp xong rồi, đi uống nước rồi quay lại làm nốt" · 3 · lạc nhóm

### streak_giu (loại 15)
- "chuỗi {streak} ngày, bạn là tấm gương sáng" · 4 · nịnh
- "{streak} ngày liên tiếp, hãy tiếp tục duy trì phong độ" · 4 · sách vở
- "consistency is the key to success" · 5 · poster
- "{streak} ngày, khét lẹt, xịn xò" · 5 · chồng lóng
- "chuỗi đẹp quá, đừng để đứt nha, đứt là buồn lắm" · 4 · áp lực
- "{streak} ngày, ai bằng bạn" · 4 · so sánh
- "streak goes brrr" · 3 · meme cũ
- "lửa đã cháy, đừng để tắt" · 3 · trùng kiểu lửa
- "bạn đã học {streak} ngày, chỉ còn 365 ngày nữa là thành thạo" · 4 · sai kiến thức, áp lực
- "{streak} ngày không nghỉ, kỷ luật thép" · 3 · nói quá
- "mỗi ngày một chút, góp gió thành bão" · 4 · sáo
- "{streak} days of pure dedication" · 3 · quảng cáo
- "chuỗi {streak} ngày, thỏ tự hào lắm luôn á" · 3 · baby talk
- "giữ chuỗi xong rồi, giờ thì đi ngủ hoặc học tiếp tuỳ bạn" · 3 · dài, nhạt
- "lịch nơ hồng hôm nay lại thêm nơ" · 2 · trùng kiểu lịch nơ (bỏ khi đọc lại)

### moc_streak (loại 15)
- "7 ngày rồi. tặng bạn một bé băng giữ chuỗi, cất đó xài khi cần" · 2 · mẫu hay nhưng 15 từ (quá 14), rút gọn lại
- "chúc mừng bạn đã đạt mốc 7 ngày học liên tục" · 4 · sách vở
- "30 ngày! bạn là huyền thoại!" · 4 · nhiều dấu chấm than
- "100 ngày, bạn đã thay đổi cuộc đời mình" · 4 · nói quá
- "milestone achieved, legend status unlocked" · 3 · meme game
- "một tuần rồi đó, giỏi hơn 90% người dùng" · 5 · so sánh, sai kiến thức
- "7 ngày không bỏ cuộc, ý chí sắt đá" · 3 · nói quá
- "30 ngày, 30 bước tới thành công" · 4 · poster
- "100 ngày, phần thưởng là... sự tự hào" · 3 · nhạt
- "băng giữ chuỗi nè, đừng xài hoang phí nha" · 3 · áp lực
- "mốc mới, xịn sò, khét lẹt" · 5 · chồng lóng
- "this is just the beginning" · 4 · poster
- "100 ngày rồi mà vẫn chưa band 7 hả" · 5 · chê
- "mốc này đáng ăn mừng bằng trà sữa full topping" · 2 · trùng kiểu ăn mừng (bỏ khi đọc lại)
- "hành trình vạn dặm bắt đầu từ một bước chân" · 4 · sáo

### dung_freeze (loại 15)
- "hôm qua bạn đã quên học, may mà có băng giữ chuỗi" · 3 · trách nhẹ
- "băng giữ chuỗi đã được sử dụng thành công" · 4 · máy móc
- "lần sau đừng quên nữa nha" · 4 · áp lực
- "your streak was saved by a miracle" · 3 · nói quá
- "băng tan rồi, chuỗi còn, nhưng lần sau không chắc đâu" · 4 · áp lực
- "freeze activated, crisis averted" · 3 · máy móc
- "hôm qua đi chơi vui không, tui ở nhà giữ chuỗi nè" · 3 · trách khéo
- "chuỗi được cứu, khét lẹt" · 3 · lóng gượng
- "băng giữ chuỗi: 1, sự lười biếng: 0" · 5 · từ cấm
- "đừng dựa vào băng quá nha" · 3 · áp lực
- "ice ice baby" · 3 · meme cũ
- "băng đã hy sinh để chuỗi được sống" · 3 · kịch quá
- "chuỗi lạnh rồi, hâm nóng bằng vài câu" · 2 · trùng kiểu ướp lạnh (bỏ khi đọc lại)
- "nghỉ một hôm không sao, nhưng đừng nghỉ hoài" · 4 · áp lực
- "streak saved. you owe me two carrots now" · 2 · trùng ý mẫu (bỏ khi đọc lại)

### mat_streak (loại 15)
- "chuỗi đứt rồi, tiếc ghê, phải chi hôm qua học" · 4 · trách
- "mất chuỗi là do không kiên trì" · 5 · chê
- "rơi chuỗi rồi, buồn quá đi mất" · 3 · baby talk
- "the comeback is stronger than the setback" · 5 · từ cấm
- "không sao, thất bại là mẹ thành công" · 3 · trùng câu nhóm sai
- "chuỗi đứt thì làm lại, nhưng đừng để đứt nữa" · 4 · áp lực
- "everyone falls. champions get up" · 4 · poster
- "streak: 0. motivation: 100" · 3 · gượng
- "kỷ lục cũ khóc rồi kìa" · 3 · gây buồn
- "ngày 1 lại rồi, quen mà" · 4 · mỉa
- "rise from the ashes like a phoenix" · 4 · poster
- "chuỗi mất nhưng tình yêu với tiếng anh còn" · 4 · sến
- "người khác giữ chuỗi được đó" · 5 · từ cấm, so sánh
- "đứt chuỗi, không đứt hy vọng" · 3 · sáo
- "bắt đầu lại nha, lần này nhớ học đều" · 3 · áp lực nhẹ

### quay_lai (loại 15)
- "{name} đi đâu mà lâu thế, tui giận rồi đó" · 4 · trách
- "chào mừng trở lại, hãy tiếp tục hành trình của bạn" · 4 · sách vở
- "welcome back, legend! we missed you so much!" · 4 · nhiều dấu chấm than
- "vắng {days} ngày, từ vựng quên hết rồi kìa" · 4 · áp lực
- "nhớ quá trời quá đất luôn á" · 3 · baby talk
- "the prodigal student returns" · 3 · gượng
- "cuối cùng bạn cũng nhớ tới tui" · 4 · trách
- "{days} ngày không học, bạn lười quá" · 5 · từ cấm
- "tui tưởng bạn bỏ tui rồi" · 4 · gây tội lỗi
- "quay lại rồi thì học bù gấp đôi nha" · 4 · áp lực
- "back again, khét lẹt" · 3 · lóng gượng
- "{name} về rồi, cả thế giới vui mừng" · 3 · nói quá
- "hello stranger" · 3 · mỉa nhẹ
- "lâu ngày không gặp, bạn có khoẻ không" · 3 · sách vở
- "cà rốt mốc hết rồi, tại bạn đó" · 3 · trách

### xong_muc_tieu (loại 15)
- "chúc mừng bạn đã hoàn thành nhiệm vụ hôm nay" · 5 · từ cấm
- "{goal}/{goal}, bạn là nhà vô địch" · 3 · nói quá
- "mission accomplished, soldier" · 3 · lạc giọng
- "xong rồi, nhưng học thêm thì tốt hơn đó" · 4 · áp lực
- "goal crushed! you're unstoppable!" · 4 · nhiều dấu chấm than
- "xong mục tiêu, khét lẹt, chill thôi" · 4 · chồng lóng
- "hôm nay đã xong, mai lại tiếp tục nha" · 3 · nhạt
- "mục tiêu hoàn thành, hãy tự thưởng cho mình" · 3 · sách vở
- "đủ {goal} lượt, giỏi hơn hôm qua" · 3 · so sánh không cần
- "you did it! i'm so proud!" · 4 · nhiều dấu chấm than
- "xong rồi đó, đi ngủ sớm đi, nghe lời tui" · 3 · ra lệnh
- "100% hoàn thành, 0% lười biếng" · 5 · từ cấm
- "xong mục tiêu, cà rốt xong luôn" · 2 · trùng kiểu cà rốt (bỏ khi đọc lại)
- "thành công nhỏ mỗi ngày tạo nên thành công lớn" · 5 · poster
- "goal reached. now touch grass" · 2 · trùng câu nhóm nghỉ (bỏ khi đọc lại)

### len_level (loại 15)
- "chúc mừng bạn đã thăng cấp thành công" · 4 · sách vở
- "level up! you're a legend now!" · 4 · nhiều dấu chấm than
- "lên cấp rồi, slay quá, khét quá" · 5 · chồng lóng
- "lên level mới, bạn giỏi hơn mọi người rồi" · 5 · so sánh, từ cấm
- "{level} unlocked, aura +100" · 5 · từ cấm
- "cấp mới, trách nhiệm mới" · 4 · áp lực
- "lên cấp nhanh vậy, chắc gian lận hả" · 4 · nghi ngờ, chê
- "new level, new me" · 3 · sáo
- "từ bé thỏ con lên thỏ nơ hồng, đổi đời rồi" · 2 · chỉ hợp một cấp (bỏ, dùng {level})
- "lên cấp là phải khao" · 3 · lạc nhóm
- "the grind paid off" · 3 · poster
- "level up, bạn đã tiến hoá" · 3 · meme game
- "chỉ còn vài cấp nữa là tối thượng" · 3 · áp lực
- "{level}? nghe sang chảnh ghê" · 2 · trùng kiểu (bỏ khi đọc lại)
- "giờ bạn là {level}, hãy sống xứng đáng với danh hiệu này" · 4 · sách vở, áp lực

### nhac_hoc (loại 38)
- "hôm nay bạn chưa học, đừng lười nha" · 5 · từ cấm
- "streak sắp đứt rồi đó, nhanh lên" · 4 · áp lực
- "bạn quên tui rồi hả" · 4 · gây tội lỗi
- "học đi, tương lai đang chờ" · 4 · poster
- "your future self is disappointed" · 5 · áp lực
- "không học hôm nay, mai hối hận" · 5 · áp lực
- "examiner không chờ ai cả" · 4 · áp lực
- "5 phút thôi mà, đi mà, đi mà" · 3 · nài nỉ
- "tui buồn quá vì bạn chưa học" · 4 · gây tội lỗi
- "hey bestie, học hông, khét lắm nè" · 4 · chồng lóng
- "học tập là con đường duy nhất dẫn tới thành công" · 5 · poster
- "đến giờ học rồi, vui lòng mở bài học" · 4 · sách vở
- "người khác đang học đó" · 5 · so sánh, từ cấm
- "don't break the chain!" · 3 · áp lực
- "ielts không tự đến đâu" · 3 · áp lực
- "học đi, hông thì tui giận" · 4 · đe doạ
- "flashcard đang khóc thét" · 3 · kịch quá
- "this is your sign to study" · 3 · meme cũ
- "học 5 phút bằng lướt tiktok 5 phút" · 2 · trùng kiểu lướt mạng xã hội (bỏ khi đọc lại)
- "bạn có biết 1 ngày không học là quên 50% từ" · 4 · sai kiến thức
- "tui đã chờ bạn 24 tiếng rồi đó" · 3 · gây tội lỗi
- "hôm nay học chưa? chưa à? sao vậy?" · 4 · tra hỏi
- "come back, we have carrots" · 2 · trùng kiểu cà rốt (bỏ khi đọc lại)
- "lười là kẻ thù số một" · 5 · từ cấm
- "học xong mới được chơi nha" · 3 · ra lệnh
- "từ vựng đang chờ bạn từng giây từng phút" · 3 · kịch
- "nhắc nhở: bạn có bài cần ôn" · 4 · máy móc
- "học đi rồi đẹp trai đẹp gái" · 3 · gượng
- "tui nhắc lần thứ 3 rồi đó" · 4 · áp lực
- "you can do it, believe in yourself" · 5 · từ cấm
- "đừng để ngày hôm nay trôi qua vô ích" · 4 · poster, áp lực
- "streak của bạn đang hấp hối" · 4 · kịch, áp lực
- "học hông, hông học thì thôi" · 3 · dỗi
- "5 phút học bằng 5 năm thành công" · 5 · poster, sai
- "một ngày không học, ba thu không gặp" · 3 · gượng
- "đến giờ rồi, gét gô, slay" · 4 · chồng lóng
- "xie nhớ bạn, thỏ nhớ bạn, cà rốt cũng nhớ bạn" · 3 · dài, sến
- "ủa alo, học đi chứ" · 3 · phũ

### nghi_giai_lao (loại 15)
- "bạn đã học {minutes} phút, hãy nghỉ ngơi để đảm bảo sức khoẻ" · 4 · sách vở
- "nghỉ đi, học nhiều quá hại não đó" · 3 · sai kiến thức
- "take a break, you deserve it, queen" · 4 · lóng gượng
- "touch grass, bestie" · 3 · chồng lóng
- "học {minutes} phút rồi, siêu nhân quá" · 3 · nói quá
- "nghỉ 5 phút, uống nước, vươn vai, hít thở sâu" · 3 · liệt kê máy móc
- "não bạn đang bốc khói kìa" · 2 · trùng kiểu nóng máy (bỏ khi đọc lại)
- "nghỉ giải lao là quyền lợi chính đáng" · 3 · sách vở
- "pause. breathe. slay." · 4 · lóng gượng
- "ngồi lâu quá là đau lưng, đau lưng là hết học" · 3 · lủng củng
- "nghỉ đi, không thì tui khoá app" · 4 · đe doạ
- "rest is part of the process" · 3 · poster
- "chill xíu đi, xịn lắm rồi" · 4 · chồng lóng
- "học tiếp là đuối đó nha" · 3 · gây nản
- "mắt bạn cần 20-20-20" · 3 · khó hiểu nếu không giải thích

### dem_nguoc (loại 14)
- "chỉ còn {days} ngày, bạn đã sẵn sàng chưa" · 4 · áp lực
- "{days} ngày nữa thi rồi, run chưa" · 4 · gây lo
- "the countdown has begun. panic mode on" · 4 · gây hoảng
- "còn {days} ngày, cố lên chiến binh" · 4 · poster
- "{days} days to glory" · 3 · quảng cáo
- "còn {days} ngày mà chưa thuộc từ nào hả" · 5 · chê
- "đếm ngược tới ngày thay đổi cuộc đời" · 4 · nói quá
- "thời gian không chờ đợi ai" · 4 · áp lực, sáo
- "còn {days} ngày, học ngày học đêm đi" · 4 · áp lực, khuyên sai
- "mai thi rồi, thức trắng ôn nha" · 5 · khuyên sai
- "{days} ngày nữa, band 7 trong tầm tay" · 4 · hứa hão
- "tuần cuối rồi, học thêm 500 từ mới đi" · 4 · khuyên sai
- "exam in {days} days. no pressure. just kidding" · 3 · áp lực ngầm
- "{days} ngày nữa là gặp examiner, sợ hông" · 3 · gây lo

### minigame (loại 15)
- "ready, set, gooo" · 3 · kéo dài chữ, nhạt
- "trò chơi bắt đầu, chúc bạn may mắn" · 4 · sách vở
- "game on, bestie, slay it" · 4 · chồng lóng
- "victory royale" · 3 · meme game
- "thắng rồi, đỉnh nóc kịch trần" · 5 · từ cấm
- "you win! you're the best! amazing!" · 5 · nhiều dấu chấm than
- "kỷ lục mới, phá đảo luôn" · 3 · lóng cũ
- "new record, sigma move" · 5 · từ cấm
- "thua rồi, gà quá" · 5 · chê
- "game over. try harder" · 4 · áp lực
- "thua là do game khó, không phải do bạn kém" · 5 · từ cấm
- "thua thì chơi lại, chơi lại thì thua tiếp" · 4 · gây nản
- "kỷ lục mới, người khác hít khói" · 5 · so sánh, từ cấm
- "bắt đầu thôi, đừng để thỏ thất vọng" · 4 · áp lực
- "gg ez" · 4 · meme cũ, khoe khoang

### cham_tho (loại 33)
- "đừng chạm vào tui, tui ngại" · 3 · baby talk
- "chọc gì chọc hoài vậy" · 3 · cáu
- "ui da, đau" · 3 · gây tội lỗi
- "tap tap tap, bạn rảnh quá ha" · 4 · mỉa
- "fun fact: 'set' có hơn 400 nghĩa" · 3 · sai kiến thức (con số khác nhau theo từ điển)
- "fun fact: tiếng anh có 1 triệu từ" · 3 · sai kiến thức (con số không thống nhất)
- "fun fact: 'queue' là từ duy nhất đọc như chữ cái đầu" · 4 · sai kiến thức
- "fun fact: người anh nói 'sorry' 8 lần mỗi ngày" · 4 · sai kiến thức (số liệu không rõ nguồn)
- "fun fact: thỏ có thể nhảy cao 1 mét" · 2 · không phải fun fact từ vựng (lạc nhóm)
- "fun fact: 'set' là từ nhiều nghĩa nhất trong từ điển oxford" · 3 · chưa chắc (phiên bản mới, 'run' vượt) → viết lại an toàn hơn
- "fun fact: 'the' chiếm 7% mọi văn bản tiếng anh" · 3 · số liệu chưa chắc
- "'data' luôn là số nhiều" · 3 · sai kiến thức ('data is' cũng được dùng phổ biến)
- "'beneficial to' someone, not 'beneficial for' everything" · 3 · sai kiến thức ('beneficial for' cũng đúng)
- "'pose a threat' sounds smarter than 'make a threat'" · 3 · sai kiến thức (hai cụm khác nghĩa)
- "chạm vào tai tui là phải học 10 từ" · 4 · ép buộc
- "tui là thỏ, không phải đồ chơi" · 3 · cáu
- "bạn chọc tui {n} lần rồi, đủ đổi một củ cà rốt" · 2 · trùng kiểu đếm lần chọc (bỏ khi đọc lại)
- "boop boop boop" · 3 · nhạt
- "ê, rảnh quá thì học đi" · 4 · phũ
- "chọc nữa tui báo công an" · 3 · lạc giọng
- "tickle tickle" · 3 · baby talk
- "hey, personal space" · 2 · nhạt (bỏ khi đọc lại)
- "'fun' là danh từ không đếm được, nói 'a lot of fun' nhé" · 2 · trùng kiểu danh từ không đếm được (bỏ khi đọc lại)
- "'despite' + danh từ, 'although' + mệnh đề" · 2 · trùng chủ đề với câu 'despite' đã giữ
- "tui biết bạn thích tui mà" · 3 · tự luyến
- "fun fact: tui là thỏ" · 3 · nhạt
- "'make' hay 'do' thì cứ đoán đại" · 4 · khuyên sai
- "chạm tui nhiều sẽ may mắn đó" · 3 · mê tín
- "fun fact: 'dreamt' là từ duy nhất kết thúc bằng 'mt'" · 3 · chưa chắc (còn 'undreamt')
- "đừng chọc nữa, tui đang ôn từ" · 2 · trùng kiểu (bỏ khi đọc lại)
- "aura tai thỏ +100" · 5 · từ cấm
- "chọc tui là bạn đang procrastinate đó, biết hông" · 2 · trùng ý mẫu procrastinate
- "fun fact: 'incorrectly' is spelled incorrectly in every dictionary" · 3 · đùa cũ, dễ gây hiểu lầm

### da_luu (loại 15)
- "lưu thành công" · 3 · máy móc
- "dữ liệu của bạn đã được lưu trữ an toàn" · 4 · sách vở
- "saved! yay!" · 3 · nhiều dấu chấm than
- "lưu rồi, khét lẹt" · 3 · lóng gượng
- "đã lưu vào bộ nhớ vĩnh cửu" · 3 · nói quá
- "lưu xong, tui hứa giữ bí mật" · 2 · trùng kiểu (bỏ khi đọc lại)
- "cất vào két sắt rồi" · 2 · trùng kiểu "vault" (bỏ khi đọc lại)
- "ok lưu" · 3 · cộc lốc
- "xoá thành công" · 3 · máy móc
- "xoá rồi, buồn ghê, tiếc ghê" · 3 · gây tiếc
- "deleted forever and ever" · 3 · gây lo
- "dữ liệu đã bị xoá vĩnh viễn" · 4 · sách vở, gây lo
- "xoá xong, coi như chưa có gì xảy ra nha" · 2 · trùng kiểu (bỏ khi đọc lại)
- "bay màu, mất xác" · 3 · lóng thô
- "xoá rồi, đừng hối hận nha" · 4 · gây áp lực

### trang_thai (loại 15)
- "không có dữ liệu" · 3 · máy móc
- "trang này trống, vui lòng quay lại sau" · 4 · sách vở
- "nothing to see here" · 3 · nhạt
- "trống như tâm hồn tui" · 3 · tối
- "đã xảy ra lỗi, vui lòng thử lại" · 4 · sách vở
- "lỗi rồi, tại bạn đó" · 5 · đổ lỗi
- "error. bunny.exe has stopped working" · 3 · giải thích đùa
- "oops, có gì đó không ổn" · 2 · trùng kiểu "sai sai" (bỏ khi đọc lại)
- "web sập rồi, cứu" · 3 · gây hoảng
- "đang tải, vui lòng chờ trong giây lát" · 4 · sách vở
- "loading... loading... loading..." · 3 · máy móc
- "đang tải, kiên nhẫn là một đức tính" · 4 · poster
- "chờ xíu, tui đang chạy bằng chân thỏ" · 2 · trùng kiểu chạy nhanh (bỏ khi đọc lại)
- "tải chậm là do mạng nhà bạn" · 4 · đổ lỗi
- "đang tải, trong lúc chờ hãy nhớ uống nước" · 3 · lạc nhóm

### doi_giao_dien (loại 15)
- "đã chuyển sang chế độ tối thành công" · 4 · máy móc
- "chế độ tối giúp bảo vệ mắt và tiết kiệm pin" · 3 · sách vở
- "dark mode activated, villain arc begins" · 3 · lạc giọng
- "đêm trăng huyền ảo, thỏ ngọc lung linh" · 3 · văn vẻ
- "night mode: on. vocabulary: still on" · 2 · mẫu hay nhưng thiếu từ tiếng anh thông dụng để máy nhận giọng; viết lại thành câu có "is"
- "lights on. good morning, sunshine" · 2 · mẫu hay nhưng sai giờ khi bật sáng lúc tối; viết lại không gắn với giờ
- "tối thui rồi, bật đèn lên đi" · 3 · ngược nghĩa
- "sáng choang, chói mắt quá" · 3 · chê giao diện
- "chế độ sáng, sáng như tương lai bạn" · 4 · poster
- "đổi giao diện xịn xò, khét lẹt" · 5 · chồng lóng
- "welcome to the dark side" · 3 · meme cũ
- "dark mode = pro mode" · 3 · khoe
- "chuyển sang sáng rồi, tạm biệt bóng đêm" · 3 · sến
- "bật tối là thỏ đi ngủ đó" · 2 · trùng kiểu ca đêm (bỏ khi đọc lại)
- "ban ngày ban mặt mà bật tối là sao" · 3 · trách
