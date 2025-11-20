import subprocess
import os
import tempfile
from typing import Dict, Any


def git_tool(repo_url: str, branch: str, dest_dir: str) -> Dict[str, Any]:
    """
    Clone a git repository to a specified directory.

    Args:
        repo_url: URL of the git repository to clone
        branch: Branch to clone
        dest_dir: Directory to clone into

    Returns:
        Dict with status, path, commit on success, or error on failure
    """
    try:
        # Ensure destination directory exists
        os.makedirs(dest_dir, exist_ok=True)

        # Execute git clone command
        cmd = ["git", "clone", "-b", branch, repo_url, dest_dir]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            return {"error": f"Git clone failed: {result.stderr.strip()}"}

        # Get the commit SHA of the cloned branch
        commit_cmd = ["git", "rev-parse", "HEAD"]
        commit_result = subprocess.run(
            commit_cmd,
            cwd=dest_dir,
            capture_output=True,
            text=True
        )

        if commit_result.returncode != 0:
            return {"error": f"Failed to get commit SHA: {commit_result.stderr.strip()}"}

        commit_sha = commit_result.stdout.strip()

        return {
            "path": dest_dir,
            "commit": commit_sha,
            "status": "ok"
        }

    except subprocess.TimeoutExpired:
        return {"error": "Git clone timed out"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}