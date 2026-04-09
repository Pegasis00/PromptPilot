import unittest

from app.services.groq_service import _normalize_quality_analysis, _normalize_refine_response


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


if __name__ == "__main__":
    unittest.main()
