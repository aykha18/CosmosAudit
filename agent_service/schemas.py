from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator
from typing import List, Dict, Any, Optional, Union
from enum import Enum


class Severity(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class RiskLabel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class AuditRequest(BaseModel):
    # Repository-based analysis
    repo_url: Optional[HttpUrl] = Field(None, description="Git repository URL to audit")
    branch: Optional[str] = Field("main", description="Branch to clone")

    # File-based analysis
    contract_files: Optional[List[str]] = Field(None, description="Base64 encoded contract files")

    # Analysis options
    contract_paths: Optional[List[str]] = Field(None, description="List of contract file paths to analyze")
    run_explainer: bool = Field(default=True, description="Whether to run AI explanations")
    analysis_type: str = Field(default="repo", description="Analysis type: 'repo' or 'files'")

    @field_validator('contract_paths')
    @classmethod
    def validate_contract_paths(cls, v):
        if v is None:
            return v
        for path in v:
            if ".." in path or path.startswith("/"):
                raise ValueError(f"Invalid contract path: {path}")
        return v

    @field_validator('analysis_type')
    @classmethod
    def validate_analysis_type(cls, v):
        if v not in ["repo", "files"]:
            raise ValueError("analysis_type must be 'repo' or 'files'")
        return v

    @model_validator(mode='after')
    def validate_input_method(self):
        repo_url = self.repo_url
        contract_files = self.contract_files
        analysis_type = self.analysis_type

        if analysis_type == "repo" and not repo_url:
            raise ValueError("repo_url is required for repository analysis")
        elif analysis_type == "files" and not contract_files:
            raise ValueError("contract_files is required for file analysis")

        return self


class Finding(BaseModel):
    name: str = Field(..., description="Finding name")
    severity: Severity = Field(..., description="Severity level")
    function: str = Field(..., description="Function where finding occurs")
    line: int = Field(..., description="Line number")
    extra: Dict[str, Any] = Field(default_factory=dict, description="Additional finding data")


class Explanation(BaseModel):
    finding_id: str = Field(..., description="Unique finding identifier")
    risk_label: RiskLabel = Field(..., description="Risk assessment label")
    explanation: str = Field(..., description="Human-readable explanation")
    remediation_snippet: str = Field(..., description="Code remediation snippet")
    unit_test: str = Field(..., description="Unit test skeleton")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence score")


class AuditSummary(BaseModel):
    findings_count: int = Field(..., description="Total number of findings")
    status: str = Field(..., description="Audit status (completed, failed, etc.)")


class AuditResult(BaseModel):
    run_id: str = Field(..., description="Unique audit run identifier")
    report_url: str = Field(..., description="URL to access the full report")
    summary: AuditSummary = Field(..., description="Audit summary")
    findings: Optional[List[Finding]] = Field(None, description="Security findings")
    explanations: Optional[List[Explanation]] = Field(None, description="AI explanations")


class ToolOutput(BaseModel):
    """Base schema for tool execution results"""
    status: str = Field(..., description="Execution status")
    error: str = Field(default="", description="Error message if failed")


class GitToolOutput(ToolOutput):
    path: str = Field(default="", description="Local repository path")
    commit: str = Field(default="", description="Commit SHA")


class CompileToolOutput(ToolOutput):
    compiled: List[Dict[str, Any]] = Field(default_factory=list, description="Compiled contract data")
    errors: List[str] = Field(default_factory=list, description="Compilation errors")


class SlitherToolOutput(ToolOutput):
    findings: List[Finding] = Field(default_factory=list, description="Security findings")
    raw: Dict[str, Any] = Field(default_factory=dict, description="Raw Slither output")


class SearchToolOutput(BaseModel):
    results: List[Dict[str, Any]] = Field(default_factory=list, description="Search results")


class ExplainToolOutput(BaseModel):
    explanations: List[Explanation] = Field(default_factory=list, description="AI explanations")


class ReportToolOutput(ToolOutput):
    report_url: str = Field(default="", description="Report URL")
    id: str = Field(default="", description="Report ID")