import unittest

from app.services.groq_service import (
    _load_json_payload,
    _normalize_quality_analysis,
    _normalize_refine_response,
)


class GroqServiceNormalizationTestCase(unittest.TestCase):
    def test_normalize_refine_response_flattens_nested_prompt_objects(self):
        payload = {
            "refined_prompt": {
                "role": "Expert prompt engineer",
                "instructions": ["Do X", "Return JSON"],
            },
            "compressed_prompt": {"text": "Do X fast"},
            "quality_analysis": {
                "clarity": "92/100",
                "structure": 88,
                "specificity": "81",
                "token_efficiency": 79,
                "feedback": {"text": "Pretty solid."},
                "strengths": ["Clear goal", {"text": "Strong structure"}],
                "improvements": "Tighter constraints",
            },
        }

        normalized = _normalize_refine_response(payload)

        self.assertEqual(normalized["refined_prompt"], "Do X\n\nReturn JSON")
        self.assertEqual(normalized["compressed_prompt"], "Do X fast")
        self.assertEqual(normalized["quality_analysis"]["clarity"], 92)
        self.assertEqual(normalized["quality_analysis"]["improvements"], ["Tighter constraints"])

    def test_normalize_quality_analysis_defaults_missing_fields(self):
        normalized = _normalize_quality_analysis({"feedback": None})

        self.assertEqual(normalized["overall"], 0)
        self.assertEqual(normalized["feedback"], "")
        self.assertEqual(normalized["strengths"], [])
        self.assertEqual(normalized["improvements"], [])

    def test_load_json_payload_repairs_raw_newlines_inside_strings(self):
        malformed = """
        {
          "refined_prompt": "Line one
Line two",
          "compressed_prompt": "Short",
          "quality_analysis": {
            "clarity": 90,
            "structure": 88,
            "specificity": 86,
            "token_efficiency": 80,
            "overall": 86,
            "feedback": "Looks good"
          }
        }
        """

        parsed = _load_json_payload(malformed)

        self.assertEqual(parsed["refined_prompt"], "Line one\nLine two")
        self.assertEqual(parsed["compressed_prompt"], "Short")


if __name__ == "__main__":
    unittest.main()
