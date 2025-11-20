import os
import uuid
from typing import List, Dict, Any
from datetime import datetime
try:
    # Try relative imports (when run as module)
    from .schemas import AuditRequest, AuditResult, AuditSummary
    from .config import Config
    from .tools.git_tool import git_tool
    from .tools.compile_tool import compile_tool
    from .tools.slither_tool import slither_tool
    from .tools.search_tool import search_tool
    from .tools.explain_tool import explain_tool
    from .tools.report_tool import report_tool
except ImportError:
    # Fall back to absolute imports (when run as script)
    from schemas import AuditRequest, AuditResult, AuditSummary
    from config import Config
    from tools.git_tool import git_tool
    from tools.compile_tool import compile_tool
    from tools.slither_tool import slither_tool
    from tools.search_tool import search_tool
    from tools.explain_tool import explain_tool
    from tools.report_tool import report_tool


class AgentRunner:
    """
    Orchestrates the smart contract audit workflow using various analysis tools.
    """

    def __init__(self):
        """Initialize the agent runner."""
        pass

    def run_audit(self, req: AuditRequest) -> AuditResult:
        """
        Execute the complete audit workflow.

        Args:
            req: Audit request with repository details and parameters

        Returns:
            AuditResult with findings, explanations, and report URL
        """
        # Generate unique run ID
        run_id = str(uuid.uuid4())

        # Create artifacts directory
        artifacts_dir = os.path.join(Config.ARTIFACTS_DIR, run_id)
        os.makedirs(artifacts_dir, exist_ok=True)

        # Initialize audit data
        audit_data = {
            "run_id": run_id,
            "request": req.model_dump(),
            "timestamp": datetime.now().isoformat(),
            "status": "in_progress",
            "steps": []
        }

        try:
            repo_path = None

            if req.analysis_type == "repo":
                # Step 1: Clone repository
                print(f"[{run_id}] Cloning repository: {req.repo_url}")
                clone_result = self._clone_repository(req, run_id)
                audit_data["steps"].append({
                    "step": "clone",
                    "status": "success" if clone_result.get("path") else "failed",
                    "result": clone_result
                })

                if not clone_result.get("path"):
                    raise Exception(f"Repository cloning failed: {clone_result.get('error', 'Unknown error')}")

                repo_path = clone_result["path"]
            elif req.analysis_type == "files":
                # Step 1: Save uploaded files
                print(f"[{run_id}] Processing uploaded contract files")
                save_result = self._save_contract_files(req, run_id)
                audit_data["steps"].append({
                    "step": "save_files",
                    "status": "success" if save_result.get("path") else "failed",
                    "result": save_result
                })

                if not save_result.get("path"):
                    raise Exception(f"File saving failed: {save_result.get('error', 'Unknown error')}")

                repo_path = save_result["path"]

            # Step 2: Compile contracts
            print(f"[{run_id}] Compiling contracts: {req.contract_paths}")
            compile_result = self._compile_contracts(repo_path, req.contract_paths, run_id)
            audit_data["steps"].append({
                "step": "compile",
                "status": "success" if compile_result.get("compiled") else "failed",
                "result": compile_result
            })

            # Step 3: Run static analysis
            print(f"[{run_id}] Running static analysis")
            analysis_result = self._run_static_analysis(repo_path, req.contract_paths, run_id)
            audit_data["steps"].append({
                "step": "analysis",
                "status": "success" if analysis_result.get("findings") else "failed",
                "result": analysis_result
            })

            findings = analysis_result.get("findings", [])

            # Include compilation errors as critical findings
            compile_errors = compile_result.get("errors", [])
            for error in compile_errors:
                findings.append({
                    "name": "Compilation Error",
                    "severity": "High",  # Compilation errors are critical
                    "function": "N/A",
                    "line": 0,
                    "extra": {
                        "description": f"Contract compilation failed: {error}",
                        "confidence": "High",
                        "type": "Compilation"
                    }
                })

            # Step 4: Generate explanations for findings
            print(f"[{run_id}] Generating explanations for {len(findings)} findings")
            explanations = self._generate_explanations(findings, repo_path, run_id)
            audit_data["steps"].append({
                "step": "explanations",
                "status": "success",
                "count": len(explanations)
            })

            # Step 5: Generate final report
            print(f"[{run_id}] Generating audit report")
            audit_data.update({
                "findings": findings,
                "explanations": explanations,
                "status": "completed"
            })

            report_result = self._generate_report(audit_data, run_id)
            audit_data["steps"].append({
                "step": "report",
                "status": "success" if report_result.get("report_url") else "failed",
                "result": report_result
            })

            # Create summary
            summary = AuditSummary(
                findings_count=len(findings),
                status="completed"
            )

            return AuditResult(
                run_id=run_id,
                report_url=report_result.get("report_url", ""),
                summary=summary,
                findings=findings,
                explanations=explanations
            )

        except Exception as e:
            print(f"[{run_id}] Audit failed: {str(e)}")
            audit_data["status"] = "failed"
            audit_data["error"] = str(e)

            # Still try to generate a report with error information
            try:
                report_result = self._generate_report(audit_data, run_id)
                report_url = report_result.get("report_url", "")
            except:
                report_url = ""

            summary = AuditSummary(
                findings_count=0,
                status="failed"
            )

            return AuditResult(
                run_id=run_id,
                report_url=report_url,
                summary=summary,
                findings=[],
                explanations=[]
            )

    def _clone_repository(self, req: AuditRequest, run_id: str) -> Dict[str, Any]:
        """Clone the repository to a temporary directory."""
        temp_dir = os.path.join(Config.ARTIFACTS_DIR, run_id, "repository")

        result = git_tool(
            repo_url=str(req.repo_url),
            branch=req.branch,
            dest_dir=temp_dir
        )

        return result

    def _save_contract_files(self, req: AuditRequest, run_id: str) -> Dict[str, Any]:
        """Save uploaded contract files to a temporary directory."""
        try:
            temp_dir = os.path.join(Config.ARTIFACTS_DIR, run_id, "contracts")
            os.makedirs(temp_dir, exist_ok=True)

            contract_paths = []
            for i, contract_content in enumerate(req.contract_files):
                # Assume content is base64 encoded Solidity code
                # In production, you'd decode from base64
                filename = f"Contract_{i+1}.sol"
                filepath = os.path.join(temp_dir, filename)

                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(contract_content)

                contract_paths.append(filename)

            return {
                "path": temp_dir,
                "contract_paths": contract_paths,
                "status": "ok"
            }

        except Exception as e:
            return {"error": f"Failed to save contract files: {str(e)}"}

    def _compile_contracts(self, repo_path: str, contract_paths: List[str], run_id: str) -> Dict[str, Any]:
        """Compile the specified contracts."""
        result = compile_tool(repo_path, contract_paths)

        # Save compilation artifacts
        compile_artifacts_dir = os.path.join(Config.ARTIFACTS_DIR, run_id, "compilation")
        os.makedirs(compile_artifacts_dir, exist_ok=True)

        import json
        with open(os.path.join(compile_artifacts_dir, "compilation.json"), "w") as f:
            json.dump(result, f, indent=2)

        return result

    def _run_static_analysis(self, repo_path: str, contract_paths: List[str], run_id: str) -> Dict[str, Any]:
        """Run static analysis on the contracts."""
        result = slither_tool(contract_paths, repo_path)

        # Save analysis artifacts
        analysis_artifacts_dir = os.path.join(Config.ARTIFACTS_DIR, run_id, "analysis")
        os.makedirs(analysis_artifacts_dir, exist_ok=True)

        import json
        with open(os.path.join(analysis_artifacts_dir, "slither_results.json"), "w") as f:
            json.dump(result, f, indent=2)

        return result

    def _generate_explanations(self, findings: List[Dict[str, Any]], repo_path: str, run_id: str) -> List[Dict[str, Any]]:
        """Generate AI explanations for each finding."""
        explanations = []

        for finding in findings:
            try:
                # Get relevant code snippets (simplified - in production would extract from source)
                code_snippets = self._extract_code_snippets(repo_path, finding)

                # Generate explanation
                explain_result = explain_tool(finding, code_snippets)

                if explain_result.get("explanations"):
                    explanations.extend(explain_result["explanations"])

            except Exception as e:
                print(f"Failed to generate explanation for finding {finding.get('name', 'unknown')}: {e}")
                # Continue with other findings

        return explanations

    def _extract_code_snippets(self, repo_path: str, finding: Dict[str, Any]) -> List[str]:
        """Extract relevant code snippets for a finding (simplified implementation)."""
        # In a full implementation, this would read the source files and extract
        # relevant lines around the finding location
        try:
            # Mock implementation - return generic snippets
            return [
                f"// Contract code around {finding.get('function', 'unknown')} function",
                f"// Line {finding.get('line', 0)}: {finding.get('name', 'Finding')}"
            ]
        except:
            return ["// Code snippet extraction failed"]

    def _generate_report(self, audit_data: Dict[str, Any], run_id: str) -> Dict[str, Any]:
        """Generate the final audit report."""
        result = report_tool(audit_data)
        return result