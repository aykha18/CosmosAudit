import subprocess
import os
import json
from typing import Dict, Any, List


def compile_tool(repo_path: str, contract_paths: List[str]) -> Dict[str, Any]:
    """
    Compile Solidity contracts using solc or forge.

    Args:
        repo_path: Path to the repository directory
        contract_paths: List of contract file paths relative to repo_path

    Returns:
        Dict with compiled contracts and any errors
    """
    compiled = []
    errors = []

    # Check if forge is available and there's a foundry project
    forge_available = _check_command("forge")
    foundry_project = os.path.exists(os.path.join(repo_path, "foundry.toml"))

    if forge_available and foundry_project:
        # Use forge build
        return _compile_with_forge(repo_path)
    else:
        # Use solc for individual files
        for contract_path in contract_paths:
            full_path = os.path.join(repo_path, contract_path)
            if not os.path.exists(full_path):
                errors.append(f"Contract file not found: {contract_path}")
                continue

            result = _compile_with_solc(full_path, contract_path)
            if result.get("error"):
                errors.append(result["error"])
            else:
                compiled.append(result)

    return {
        "compiled": compiled,
        "errors": errors
    }


def _check_command(cmd: str) -> bool:
    """Check if a command is available."""
    try:
        subprocess.run([cmd, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def _compile_with_forge(repo_path: str) -> Dict[str, Any]:
    """Compile using forge build."""
    try:
        result = subprocess.run(
            ["forge", "build"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode != 0:
            return {"compiled": [], "errors": [result.stderr.strip()]}

        # Forge outputs to out/ directory
        out_dir = os.path.join(repo_path, "out")
        compiled = []

        if os.path.exists(out_dir):
            for root, dirs, files in os.walk(out_dir):
                for file in files:
                    if file.endswith(".json"):
                        json_path = os.path.join(root, file)
                        try:
                            with open(json_path, 'r') as f:
                                contract_data = json.load(f)
                                if "bytecode" in contract_data and "abi" in contract_data:
                                    compiled.append({
                                        "file": os.path.relpath(json_path, repo_path),
                                        "bytecode": contract_data.get("bytecode", {}).get("object", ""),
                                        "abi": contract_data.get("abi", [])
                                    })
                        except (json.JSONDecodeError, KeyError):
                            continue

        return {"compiled": compiled, "errors": []}

    except subprocess.TimeoutExpired:
        return {"compiled": [], "errors": ["Forge compilation timed out"]}
    except Exception as e:
        return {"compiled": [], "errors": [f"Forge compilation error: {str(e)}"]}


def _compile_with_solc(contract_file: str, relative_path: str) -> Dict[str, Any]:
    """Compile a single contract with solc."""
    try:
        # Compile with bin and abi output
        cmd = ["solc", "--bin", "--abi", contract_file]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return {"error": f"Solc compilation failed for {relative_path}: {result.stderr.strip()}"}

        # Parse output - solc outputs binary and abi sections
        output = result.stdout
        lines = output.split('\n')

        bytecode = ""
        abi = []
        current_section = None

        for line in lines:
            line = line.strip()
            if line.startswith("Binary:"):
                current_section = "bytecode"
                bytecode = line.split(":", 1)[1].strip()
            elif line.startswith("Contract JSON ABI"):
                current_section = "abi"
                abi_str = line.split(":", 1)[1].strip()
                try:
                    abi = json.loads(abi_str)
                except json.JSONDecodeError:
                    abi = []
            elif current_section == "bytecode" and line and not line.startswith("Contract JSON ABI"):
                bytecode += line

        return {
            "file": relative_path,
            "bytecode": bytecode,
            "abi": abi
        }

    except subprocess.TimeoutExpired:
        return {"error": f"Solc compilation timed out for {relative_path}"}
    except Exception as e:
        return {"error": f"Solc compilation error for {relative_path}: {str(e)}"}