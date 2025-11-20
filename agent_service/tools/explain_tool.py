import os
import json
import uuid
from typing import Dict, Any, List
from datetime import datetime
import openai
try:
    # Try relative imports (when run as module)
    from ..config import Config
    from ..prompts.prompts import PromptTemplates
except ImportError:
    # Fall back to absolute imports (when run as script)
    from config import Config
    from prompts.prompts import PromptTemplates


def explain_tool(findings: Dict[str, Any], code_snippets: List[str]) -> Dict[str, Any]:
    """
    Generate AI-powered explanations for security findings.

    Args:
        findings: Security finding from static analysis (e.g., Slither)
        code_snippets: List of relevant code snippets from the contract

    Returns:
        Dict with explanations list and metadata
    """
    try:
        # Validate OpenAI API key
        if not Config.OPENAI_API_KEY or Config.OPENAI_API_KEY.startswith("sk-test"):
            return {
                "explanations": [],
                "error": "Valid OpenAI API key required for explanations"
            }

        # Prepare search context (mock RAG results for now)
        rag_hits = _get_search_context(findings)

        # Combine code snippets
        combined_code = "\n\n".join(code_snippets)

        # Format the explanation prompt
        prompt = PromptTemplates.format_explanation_prompt(
            finding_json=findings,
            code_snippet=combined_code,
            rag_hits=rag_hits
        )

        # Generate unique ID for this explanation
        explanation_id = str(uuid.uuid4())

        # Call OpenAI API
        response = _call_openai_api(prompt)

        if not response:
            return {"explanations": [], "error": "Failed to generate explanation"}

        # Parse and validate response
        explanation_data = _parse_and_validate_response(response)

        if not explanation_data:
            return {"explanations": [], "error": "Invalid explanation format"}

        # Save artifacts for auditability
        _save_artifacts(explanation_id, prompt, response, findings)

        # Format the explanation to match schema
        explanation = {
            "finding_id": findings.get("name", "unknown"),
            "risk_label": explanation_data.get("risk_label", "Medium"),
            "explanation": explanation_data.get("explanation", ""),
            "remediation_snippet": explanation_data.get("remediation_snippet", ""),
            "unit_test": explanation_data.get("unit_test", ""),
            "confidence": explanation_data.get("confidence", 0.5)
        }

        return {"explanations": [explanation]}

    except Exception as e:
        return {"explanations": [], "error": f"Explanation generation failed: {str(e)}"}


def _get_search_context(findings: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get relevant context from vector search (placeholder)."""
    # In production, this would call search_tool
    # For now, return mock relevant context
    finding_name = findings.get("name", "").lower()

    if "reentrancy" in finding_name:
        return [{
            "id": "reentrancy_pattern_001",
            "snippet": "Reentrancy occurs when external calls are made before state updates",
            "metadata": {"type": "security_pattern", "category": "reentrancy"}
        }]
    elif "overflow" in finding_name:
        return [{
            "id": "overflow_pattern_002",
            "snippet": "Use SafeMath or Solidity 0.8+ for arithmetic operations",
            "metadata": {"type": "vulnerability", "category": "arithmetic"}
        }]
    else:
        return [{
            "id": "general_security_003",
            "snippet": "Follow Solidity security best practices",
            "metadata": {"type": "best_practice", "category": "general"}
        }]


def _call_openai_api(prompt: str) -> str:
    """Call OpenAI API to generate explanation."""
    try:
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4",  # Use GPT-4 for better analysis
            messages=[
                {"role": "system", "content": "You are an expert smart contract security auditor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.1  # Low temperature for consistent, safe responses
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


def _parse_and_validate_response(response: str) -> Dict[str, Any]:
    """Parse and validate the AI response."""
    try:
        # Try to extract JSON from response
        # Sometimes AI includes extra text, so look for JSON block
        json_start = response.find('{')
        json_end = response.rfind('}') + 1

        if json_start == -1 or json_end == 0:
            return None

        json_str = response[json_start:json_end]
        data = json.loads(json_str)

        # Validate using PromptTemplates
        if PromptTemplates.validate_output_schema(json.dumps(data)):
            return data

        return None

    except (json.JSONDecodeError, KeyError):
        return None


def _save_artifacts(explanation_id: str, prompt: str, response: str, findings: Dict[str, Any]):
    """Save prompts and responses to artifacts for auditability."""
    try:
        # Create artifacts directory if it doesn't exist
        artifacts_dir = os.path.join(Config.ARTIFACTS_DIR, "explanations", explanation_id)
        os.makedirs(artifacts_dir, exist_ok=True)

        # Save timestamp
        timestamp = datetime.now().isoformat()

        # Save prompt
        with open(os.path.join(artifacts_dir, "prompt.txt"), "w") as f:
            f.write(f"Timestamp: {timestamp}\n\n")
            f.write("PROMPT:\n")
            f.write(prompt)

        # Save response
        with open(os.path.join(artifacts_dir, "response.txt"), "w") as f:
            f.write(f"Timestamp: {timestamp}\n\n")
            f.write("RESPONSE:\n")
            f.write(response)

        # Save findings context
        with open(os.path.join(artifacts_dir, "findings.json"), "w") as f:
            json.dump(findings, f, indent=2)

        # Save metadata
        metadata = {
            "explanation_id": explanation_id,
            "timestamp": timestamp,
            "finding_name": findings.get("name", "unknown"),
            "model": "gpt-4"
        }

        with open(os.path.join(artifacts_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

    except Exception as e:
        print(f"Failed to save artifacts: {e}")
        # Don't fail the explanation if artifact saving fails