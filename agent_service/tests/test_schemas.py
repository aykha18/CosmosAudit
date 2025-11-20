import pytest
from pydantic import ValidationError
from agent_service.schemas import (
    AuditRequest, AuditResult, Finding, Explanation,
    Severity, RiskLabel, AuditSummary
)


class TestAuditRequest:
    def test_valid_request(self):
        """Test valid audit request creation."""
        request = AuditRequest(
            repo_url="https://github.com/aykha18/ETH_Intermediate_Assement",
            branch="main",
            contract_paths=["contracts/A.sol", "contracts/B.sol"],
            run_explainer=True
        )
        assert str(request.repo_url) == "https://github.com/aykha18/ETH_Intermediate_Assement"
        assert request.branch == "main"
        assert request.contract_paths == ["contracts/A.sol", "contracts/B.sol"]
        assert request.run_explainer is True

    def test_default_values(self):
        """Test default values for optional fields."""
        request = AuditRequest(
            repo_url="https://github.com/example/repo",
            contract_paths=["contracts/A.sol"]
        )
        assert request.branch == "main"
        assert request.run_explainer is True

    def test_invalid_repo_url(self):
        """Test invalid repository URL validation."""
        with pytest.raises(ValidationError):
            AuditRequest(
                repo_url="not-a-url",
                contract_paths=["contracts/A.sol"]
            )

    def test_empty_contract_paths_repo(self):
        """Test that empty contract paths are allowed in repo analysis."""
        # Empty contract_paths should be allowed for repo analysis
        request = AuditRequest(
            repo_url="https://github.com/example/repo",
            contract_paths=[],
            analysis_type="repo"
        )
        assert request.contract_paths == []
        assert request.analysis_type == "repo"

    def test_invalid_contract_paths(self):
        """Test validation for invalid contract paths."""
        with pytest.raises(ValidationError, match="Invalid contract path"):
            AuditRequest(
                repo_url="https://github.com/example/repo",
                contract_paths=["../malicious.sol"]
            )

        with pytest.raises(ValidationError, match="Invalid contract path"):
            AuditRequest(
                repo_url="https://github.com/example/repo",
                contract_paths=["/absolute/path.sol"]
            )


class TestFinding:
    def test_valid_finding(self):
        """Test valid finding creation."""
        finding = Finding(
            name="Reentrancy",
            severity=Severity.HIGH,
            function="withdraw",
            line=123,
            extra={"impact": "high"}
        )
        assert finding.name == "Reentrancy"
        assert finding.severity == Severity.HIGH
        assert finding.function == "withdraw"
        assert finding.line == 123
        assert finding.extra == {"impact": "high"}

    def test_invalid_severity(self):
        """Test invalid severity enum."""
        with pytest.raises(ValidationError):
            Finding(
                name="Test",
                severity="Invalid",  # Not in enum
                function="test",
                line=1
            )


class TestExplanation:
    def test_valid_explanation(self):
        """Test valid explanation creation."""
        explanation = Explanation(
            finding_id="reentrancy-001",
            risk_label=RiskLabel.CRITICAL,
            explanation="This is a critical vulnerability.",
            remediation_snippet="require(!locked, 'Reentrancy guard');",
            unit_test="function testReentrancy() public { /* test code */ }",
            confidence=0.95
        )
        assert explanation.finding_id == "reentrancy-001"
        assert explanation.risk_label == RiskLabel.CRITICAL
        assert explanation.confidence == 0.95

    def test_invalid_confidence(self):
        """Test confidence range validation."""
        with pytest.raises(ValidationError):
            Explanation(
                finding_id="test",
                risk_label=RiskLabel.HIGH,
                explanation="Test",
                remediation_snippet="code",
                unit_test="test",
                confidence=1.5  # > 1.0
            )

        with pytest.raises(ValidationError):
            Explanation(
                finding_id="test",
                risk_label=RiskLabel.HIGH,
                explanation="Test",
                remediation_snippet="code",
                unit_test="test",
                confidence=-0.1  # < 0.0
            )


class TestAuditResult:
    def test_valid_result(self):
        """Test valid audit result creation."""
        summary = AuditSummary(findings_count=5, status="completed")
        result = AuditResult(
            run_id="audit-123",
            report_url="http://example.com/report",
            summary=summary
        )
        assert result.run_id == "audit-123"
        assert result.summary.findings_count == 5
        assert result.summary.status == "completed"


class TestEnums:
    def test_severity_enum(self):
        """Test severity enum values."""
        assert Severity.HIGH.value == "High"
        assert Severity.MEDIUM.value == "Medium"
        assert Severity.LOW.value == "Low"

    def test_risk_label_enum(self):
        """Test risk label enum values."""
        assert RiskLabel.CRITICAL.value == "Critical"
        assert RiskLabel.HIGH.value == "High"
        assert RiskLabel.MEDIUM.value == "Medium"
        assert RiskLabel.LOW.value == "Low"