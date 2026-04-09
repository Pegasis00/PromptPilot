import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from main import app


class PromptRoutesTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint_returns_healthy(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "healthy", "service": "PromptPilot AI"},
        )

    def test_refine_endpoint_rejects_empty_input(self):
        response = self.client.post(
            "/api/prompt/refine",
            json={
                "raw_input": "   ",
                "target_model": "claude",
                "mode": "balanced",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Input cannot be empty")

    def test_refine_endpoint_handles_normalized_service_response(self):
        mocked_result = {
            "refined_prompt": "Create a polished onboarding email sequence.",
            "compressed_prompt": "Write an onboarding email sequence.",
            "quality_analysis": {
                "clarity": 90,
                "structure": 88,
                "specificity": 85,
                "token_efficiency": 82,
                "overall": 86,
                "feedback": "Clear and well-structured.",
                "strengths": ["Clear goal", "Good structure"],
                "improvements": ["Add one concrete example"],
            },
        }

        with patch(
            "app.api.routes.prompt.refine_prompt",
            new=AsyncMock(return_value=mocked_result),
        ):
            response = self.client.post(
                "/api/prompt/refine",
                json={
                    "raw_input": "make me a better onboarding prompt",
                    "target_model": "claude",
                    "mode": "balanced",
                },
            )

        body = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["refined_prompt"], mocked_result["refined_prompt"])
        self.assertEqual(body["compressed_prompt"], mocked_result["compressed_prompt"])
        self.assertEqual(body["quality_score"]["overall"], 86)
        self.assertGreater(body["token_stats"]["optimized_tokens"], 0)

    def test_compress_endpoint_returns_service_result(self):
        with patch(
            "app.api.routes.prompt.compress_prompt",
            new=AsyncMock(return_value="Shortened prompt"),
        ):
            response = self.client.post(
                "/api/prompt/compress",
                json={
                    "prompt": "A long prompt that needs to be compressed.",
                    "target_reduction": 30,
                    "target_model": "gpt",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["compressed_prompt"], "Shortened prompt")

    def test_analyze_endpoint_returns_scores(self):
        mocked_analysis = {
            "clarity": 91,
            "structure": 87,
            "specificity": 84,
            "token_efficiency": 80,
            "overall": 86,
            "feedback": "Good prompt.",
            "strengths": ["Clear intent"],
            "improvements": ["Add constraints"],
        }

        with patch(
            "app.api.routes.prompt.analyze_prompt",
            new=AsyncMock(return_value=mocked_analysis),
        ):
            response = self.client.post(
                "/api/prompt/analyze",
                json={
                    "prompt": "Analyze this prompt",
                    "target_model": "gemini",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["quality_score"]["clarity"], 91)


if __name__ == "__main__":
    unittest.main()
