import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import _detect_lang, _clean_ai_text, _parse_json_lenient, _bilingual_payload, get_mock_translation

def run_tests():
    print("[Test 1] _detect_lang")
    assert _detect_lang("Bài 1 - Dãy số") == "vi", "Failed vi detect"
    assert _detect_lang("Arithmetic progression") == "en", "Failed en detect"
    assert _detect_lang("day so") == "vi", "Failed unaccented vi keyword"

    print("[Test 2] _clean_ai_text")
    dirty = (
        "<think>Thinking about sequences...</think>\n"
        "Pronunciation: For Vietnamese words, provide IPA or rough pronunciation.\n"
        "Now construct JSON.\n"
        'Check schema: "translation"\n'
        "Bài 1: Dãy số"
    )
    cleaned = _clean_ai_text(dirty)
    assert "<think>" not in cleaned, "Failed think strip"
    assert "Check schema" not in cleaned, "Failed bad line strip"
    assert "Bài 1: Dãy số" in cleaned, "Preserved actual content"

    print("[Test 3] _parse_json_lenient with preamble")
    raw_model_output = (
        "vietnamese (translation), example.\n"
        "Pronunciation: For Vietnamese words, provide IPA.\n"
        "Now construct JSON.\n"
        'Check schema: "translation"\n'
        "{\n"
        '  "translation": "Lesson 1: Sequences",\n'
        '  "translation_vi": "Bài 1: Dãy số",\n'
        '  "translation_en": "Lesson 1: Sequences",\n'
        '  "source_lang": "vi"\n'
        "}"
    )
    parsed = _parse_json_lenient(raw_model_output)
    assert parsed is not None, "Failed lenient parse"
    assert parsed.get("translation") == "Lesson 1: Sequences", "Wrong translation"

    print("[Test 4] get_mock_translation bidirectional")
    mock_vi = get_mock_translation("Bài 1 - Dãy số", direction="vi_en")
    assert mock_vi["source_lang"] == "vi"
    assert "Sequence" in mock_vi["translation"]

    mock_en = get_mock_translation("Arithmetic sequence", direction="en_vi")
    assert mock_en["translation_vi"] == "Dãy số"

    print("[Test 5] _bilingual_payload protection")
    payload = {
        "translation": "vietnamese (translation)\nLesson 1: Sequences",
        "summary": "Check schema: summary\nA math sequence",
        "theory": {
            "vi": "<think>reasoning</think>Lý thuyết dãy số",
            "en": "Theory of sequences"
        },
        "words": [
            {
                "word": "sequence",
                "vietnamese": "dãy số",
                "english": "sequence",
                "example": "Now construct JSON\ne.g. (un) is a sequence."
            }
        ]
    }
    bilingual = _bilingual_payload(payload, "Bài 1 - Dãy số", source_lang="vi")
    assert "<think>" not in bilingual["theory"]["vi"]
    assert "Check schema" not in bilingual["summary"]
    assert "Now construct JSON" not in bilingual["words"][0]["example"]
    assert bilingual["translation_vi"] == "Bài 1 - Dãy số"
    assert "Lesson 1: Sequences" in bilingual["translation_en"]

    print("ALL TRANSLATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
