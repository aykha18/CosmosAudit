import os
import json
import uuid
from typing import Dict, Any
from datetime import datetime
try:
    # Try relative imports (when run as module)
    from ..config import Config
except ImportError:
    # Fall back to absolute imports (when run as script)
    from config import Config


def report_tool(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate and save audit report to artifacts.

    Args:
        payload: Complete audit results payload containing run_id, findings, explanations, etc.

    Returns:
        Dict with report_url and run_id
    """
    try:
        # Extract or generate run_id
        run_id = payload.get("run_id")
        if not run_id:
            run_id = str(uuid.uuid4())
            payload["run_id"] = run_id

        # Create artifacts directory for this run
        run_artifacts_dir = os.path.join(Config.ARTIFACTS_DIR, run_id)
        os.makedirs(run_artifacts_dir, exist_ok=True)

        # Save the complete report as JSON
        report_path = os.path.join(run_artifacts_dir, "report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

        # Generate additional report files
        _generate_summary_report(run_artifacts_dir, payload)
        _generate_findings_report(run_artifacts_dir, payload)

        # Generate local file URL
        # In production, this would be a web-accessible URL
        # For now, return file:// URL for local access
        report_url = f"file://{os.path.abspath(report_path)}"

        return {
            "report_url": report_url,
            "id": run_id
        }

    except Exception as e:
        # Generate a fallback run_id for error cases
        error_run_id = str(uuid.uuid4())
        return {
            "report_url": "",
            "id": error_run_id,
            "error": f"Report generation failed: {str(e)}"
        }


def _generate_summary_report(artifacts_dir: str, payload: Dict[str, Any]):
    """Generate a human-readable summary report."""
    try:
        summary = {
            "run_id": payload.get("run_id", "unknown"),
            "timestamp": datetime.now().isoformat(),
            "repository": payload.get("repository", {}),
            "summary": {
                "total_findings": len(payload.get("findings", [])),
                "total_explanations": len(payload.get("explanations", [])),
                "status": payload.get("status", "completed")
            }
        }

        # Add severity breakdown
        findings = payload.get("findings", [])
        severity_counts = {}
        for finding in findings:
            severity = finding.get("severity", "UNKNOWN")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        summary["summary"]["findings_by_severity"] = severity_counts

        summary_path = os.path.join(artifacts_dir, "summary.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Failed to generate summary report: {e}")


def _generate_findings_report(artifacts_dir: str, payload: Dict[str, Any]):
    """Generate a detailed findings report."""
    try:
        findings = payload.get("findings", [])
        explanations = payload.get("explanations", [])

        # Create a mapping of findings to explanations
        findings_report = []
        for finding in findings:
            finding_id = finding.get("name", "unknown")
            explanation = _find_explanation(explanations, finding_id)

            findings_report.append({
                "finding": finding,
                "explanation": explanation
            })

        findings_path = os.path.join(artifacts_dir, "findings.json")
        with open(findings_path, "w", encoding="utf-8") as f:
            json.dump(findings_report, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Failed to generate findings report: {e}")


def _find_explanation(explanations: list, finding_id: str) -> Dict[str, Any]:
    """Find the explanation for a given finding."""
    for exp in explanations:
        if exp.get("finding_id") == finding_id:
            return exp
    return {}