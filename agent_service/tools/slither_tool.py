import subprocess
import json
from typing import Dict, Any, List


def slither_tool(contract_paths: List[str], repo_dir: str) -> Dict[str, Any]:
    """
    Run Slither static analysis on Solidity contracts.

    Args:
        contract_paths: List of contract file paths relative to repo_dir
        repo_dir: Directory containing the contracts

    Returns:
        Dict with findings list and raw output
    """
    try:
        # Check if slither is available
        if not _check_command("slither"):
            return {"findings": [], "raw": {}, "error": "Slither not installed"}

        # Prepare contract paths for slither
        # Slither can take multiple files
        cmd = ["slither", "--json", "-"] + contract_paths

        result = subprocess.run(
            cmd,
            cwd=repo_dir,
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout for analysis
        )

        # Slither returns non-zero exit code when findings are detected
        # So we don't treat non-zero as error, but check if JSON was produced

        # Parse JSON output
        try:
            raw_output = json.loads(result.stdout)
        except json.JSONDecodeError:
            return {
                "findings": [],
                "raw": {},
                "error": f"Failed to parse Slither JSON output: {result.stdout[:200]}..."
            }

        # Extract findings
        findings = _extract_findings(raw_output)

        return {
            "findings": findings,
            "raw": raw_output
        }

    except subprocess.TimeoutExpired:
        return {"findings": [], "raw": {}, "error": "Slither analysis timed out"}
    except Exception as e:
        return {"findings": [], "raw": {}, "error": f"Unexpected error: {str(e)}"}


def _check_command(cmd: str) -> bool:
    """Check if a command is available."""
    try:
        subprocess.run([cmd, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def _extract_findings(raw_output: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract and normalize findings from Slither JSON output.

    Maps Slither's output to our Finding schema format.
    """
    findings = []

    # Slither results are typically in 'results' or 'success' keys
    results = raw_output.get("results", {})
    detectors = results.get("detectors", [])

    for detector in detectors:
        # Each detector result may have multiple elements
        elements = detector.get("elements", [])
        for element in elements:
            finding = {
                "name": detector.get("check", detector.get("id", "Unknown")),
                "severity": _map_severity(detector.get("impact", "Informational")),
                "function": element.get("name", "Unknown"),
                "line": element.get("line", 0),
                "extra": {
                    "description": detector.get("description", ""),
                    "confidence": detector.get("confidence", "Unknown"),
                    "source_mapping": element.get("source_mapping", {}),
                    "type": detector.get("type", "Unknown")
                }
            }
            findings.append(finding)

    return findings


def _map_severity(slither_impact: str) -> str:
    """
    Map Slither impact levels to our severity enum values.

    Slither uses: High, Medium, Low, Informational
    Our enum values: High, Medium, Low
    """
    mapping = {
        "High": "High",
        "Medium": "Medium",
        "Low": "Low",
        "Informational": "Low"  # Map informational to Low
    }
    return mapping.get(slither_impact, "Low")