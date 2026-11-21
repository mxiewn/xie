#!/usr/bin/env python3
# xie · tools/import-xlsx.py — nhập "sổ của tui" từ data/source/so-tu-vung-theo-chu-de.xlsx
# chạy: python3 tools/import-xlsx.py   (cần openpyxl: pip install openpyxl)
#
# ra: data/vocab/excel-<slug-chủ-đề>.json (mỗi chủ đề một file) + data/vocab/index.json
# luật (spec "nguồn từ vựng"):
#   - bỏ sheet "mục lục"; dòng bắt đầu bằng "▸" là tên nhóm con
#   - tách cách nói tương tự theo xuống dòng hoặc " / "
#   - giữ nguyên chữ hoa/thường của cụm từ và ví dụ; "(sth)" là phần tuỳ chọn khi chấm gõ (xử lý ở js)
#   - KHÔNG sửa nghĩa, ví dụ, ghi chú gốc
#   - "câu của tôi" và "đã dùng khi nói?" nếu có thì vào "seed" (tiến độ ban đầu)
#   - in số cụm mỗi chủ đề và tổng. tổng phải đúng 157, lệch thì dừng (mã lỗi 1), không ghi file

import json
import re
import sys
import unicodedata
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit('thiếu openpyxl: pip install openpyxl')

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'data' / 'source' / 'so-tu-vung-theo-chu-de.xlsx'
OUT = ROOT / 'data' / 'vocab'
EXPECTED_TOTAL = 157

USE_FOR = {'nói': 'speaking', 'viết': 'writing', 'cả hai': 'both'}
USED = {'có': True, 'chưa': False}


def slugify(text):
    t = unicodedata.normalize('NFD', text.lower()).replace('đ', 'd')
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def clean(value):
    if value is None:
        return ''
    return unicodedata.normalize('NFC', str(value)).strip()


def split_alternatives(text):
    if not text:
        return []
    parts = re.split(r'\n|\s/\s', text)
    return [p.strip() for p in parts if p.strip()]


def split_examples(text):
    if not text:
        return []
    return [p.strip() for p in text.split('\n') if p.strip()]


def read_sheet(ws, slug, label):
    rows = list(ws.iter_rows(values_only=True))
    header = next((i for i, r in enumerate(rows) if clean(r[0]).lower() == 'stt'), None)
    if header is None:
        raise SystemExit(f'sheet "{label}": không thấy dòng tiêu đề STT')
    items = []
    subgroup = ''
    for r in rows[header + 1:]:
        cells = [clean(c) for c in (list(r) + [None] * 9)[:9]]
        stt, phrase, alts, meaning, example, use_for, note, mine, used = cells
        if stt.startswith('▸'):
            subgroup = stt.lstrip('▸').strip()
            continue
        if not phrase:
            continue
        if not re.fullmatch(r'\d+', stt):
            raise SystemExit(f'sheet "{label}": dòng lạ, cột STT = "{stt}" (cụm "{phrase}")')
        use_key = use_for.lower()
        if use_key and use_key not in USE_FOR:
            raise SystemExit(f'sheet "{label}" #{stt}: "dùng cho" lạ: "{use_for}"')
        used_key = used.lower()
        if used_key and used_key not in USED:
            raise SystemExit(f'sheet "{label}" #{stt}: "đã dùng khi nói?" lạ: "{used}"')
        item = {
            'id': f'{slug}-{int(stt)}',
            'source': 'excel',
            'track': 'daily',
            'topic': slug,
            'subgroup': subgroup,
            'type': 'phrase',
            'phrase': phrase,
            'alternatives': split_alternatives(alts),
            'meaning_vi': meaning,
            'examples': split_examples(example),
            'use_for': USE_FOR.get(use_key, 'speaking'),
            'note': note,
            'level': '',
            'speaking_questions': [],
        }
        seed = {}
        if mine:
            seed['my_sentence'] = mine
        if used_key:
            seed['used_speaking'] = USED[used_key]
        if seed:
            item['seed'] = seed
        items.append(item)
    return items


def main():
    wb = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
    topics = []
    all_items = {}
    for name in wb.sheetnames:
        label = clean(name)
        if label.lower() == 'mục lục':
            continue
        slug = slugify(label)
        items = read_sheet(wb[name], slug, label)
        topics.append({'id': slug, 'label': label.lower(), 'source': 'excel', 'track': 'daily',
                       'file': f'excel-{slug}.json', 'count': len(items)})
        all_items[slug] = items

    ids = [i['id'] for items in all_items.values() for i in items]
    if len(ids) != len(set(ids)):
        raise SystemExit('trùng id cụm từ')

    width = max(len(t['label']) for t in topics)
    for t in topics:
        print(f"  {t['label']:<{width}}  {t['count']:>3} cụm")
    total = len(ids)
    print(f'  tổng: {total} cụm, {len(topics)} chủ đề')
    if total != EXPECTED_TOTAL:
        print(f'✗ tổng phải đúng {EXPECTED_TOTAL}, đang là {total}. dừng, không ghi file.', file=sys.stderr)
        sys.exit(1)

    OUT.mkdir(parents=True, exist_ok=True)
    for t in topics:
        payload = {'topic': {k: t[k] for k in ('id', 'label', 'source', 'track')}, 'items': all_items[t['id']]}
        (OUT / t['file']).write_text(json.dumps(payload, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    index_path = OUT / 'index.json'
    index = json.loads(index_path.read_text(encoding='utf-8')) if index_path.exists() else {'version': 1, 'topics': []}
    others = [t for t in index.get('topics', []) if t.get('source') != 'excel']
    index['topics'] = topics + others
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'✓ đã ghi {len(topics)} file + index.json vào data/vocab/')


if __name__ == '__main__':
    main()
