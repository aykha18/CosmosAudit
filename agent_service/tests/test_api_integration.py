import pytest
from fastapi.testclient import TestClient
from agent_service.app import app
from unittest.mock import patch, MagicMock


@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(app)


class TestAuditAPI:
    """Integration tests for the audit API."""

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    @patch('agent_service.app.AgentRunner.run_audit')
    def test_audit_endpoint_success(self, mock_run_audit, client):
        """Test successful audit request."""
        # Mock the audit runner
        mock_run_audit.return_value = {
            "run_id": "test-run-123",
            "summary": {"findings_count": 1, "status": "completed"},
            "findings": [{"name": "test", "severity": "High"}],
            "explanations": []
        }

        payload = {
            "repo_url": "https://github.com/test/repo",
            "branch": "main",
            "contract_paths": ["contracts/Test.sol"],
            "run_explainer": True
        }

        response = client.post("/api/v1/audit", json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["run_id"] == "test-run-123"
        assert data["summary"]["findings_count"] == 1
        assert len(data["findings"]) == 1

    def test_audit_endpoint_invalid_url(self, client):
        """Test audit request with invalid URL."""
        payload = {
            "repo_url": "not-a-url",
            "branch": "main",
            "contract_paths": ["contracts/Test.sol"],
            "run_explainer": True
        }

        response = client.post("/api/v1/audit", json=payload)

        # Should fail validation
        assert response.status_code == 422  # Validation error

    def test_audit_endpoint_empty_contracts(self, client):
        """Test audit request with empty contract paths."""
        payload = {
            "repo_url": "https://github.com/test/repo",
            "branch": "main",
            "contract_paths": [],
            "run_explainer": True
        }

        response = client.post("/api/v1/audit", json=payload)

        # Should fail validation
        assert response.status_code == 422  # Validation error

    @patch('agent_service.app.AgentRunner.run_audit')
    def test_audit_endpoint_with_compilation_errors(self, mock_run_audit, client):
        """Test audit with compilation errors in findings."""
        mock_run_audit.return_value = {
            "run_id": "test-run-456",
            "summary": {"findings_count": 2, "status": "completed"},
            "findings": [
                {
                    "name": "Compilation Error",
                    "severity": "High",
                    "function": "N/A",
                    "line": 0,
                    "extra": {
                        "description": "Contract compilation failed: Error: Types in storage containing (nested) mappings cannot be assigned to.",
                        "confidence": "High",
                        "type": "Compilation"
                    }
                },
                {
                    "name": "Compilation Error",
                    "severity": "High",
                    "function": "N/A",
                    "line": 0,
                    "extra": {
                        "description": "Contract compilation failed: Error: Source \"@openzeppelin/contracts/utils/math/SafeMath.sol\" not found",
                        "confidence": "High",
                        "type": "Compilation"
                    }
                }
            ],
            "explanations": []
        }

        payload = {
            "repo_url": "https://github.com/test/repo",
            "branch": "main",
            "contract_paths": ["contracts/Test.sol"],
            "run_explainer": True
        }

        response = client.post("/api/v1/audit", json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["summary"]["findings_count"] == 2
        assert len(data["findings"]) == 2
        assert all(f["severity"] == "High" for f in data["findings"])
        assert all("Compilation Error" in f["name"] for f in data["findings"])


class TestCORS:
    """Test CORS functionality."""

    def test_cors_headers(self, client):
        """Test that CORS headers are present."""
        response = client.options("/api/v1/audit")

        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers


class TestErrorHandling:
    """Test error handling scenarios."""

    @patch('agent_service.app.AgentRunner.run_audit')
    def test_audit_internal_error(self, mock_run_audit, client):
        """Test handling of internal audit errors."""
        mock_run_audit.side_effect = Exception("Internal error")

        payload = {
            "repo_url": "https://github.com/test/repo",
            "branch": "main",
            "contract_paths": ["contracts/Test.sol"],
            "run_explainer": True
        }

        response = client.post("/api/v1/audit", json=payload)

        # Should return 500 for internal errors
        assert response.status_code == 500