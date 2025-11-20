import pytest
import os
import tempfile
from unittest.mock import patch, MagicMock
from agent_service.tools.git_tool import git_tool
from agent_service.tools.compile_tool import compile_tool
from agent_service.tools.slither_tool import slither_tool
from agent_service.tools.search_tool import search_tool
from agent_service.tools.explain_tool import explain_tool
from agent_service.tools.report_tool import report_tool


class TestGitTool:
    """Test git_tool functionality."""

    @patch('agent_service.tools.git_tool.subprocess.run')
    def test_git_tool_success(self, mock_run):
        """Test successful git clone."""
        # Mock successful git clone
        mock_run.return_value = MagicMock(returncode=0, stderr='')

        # Mock git rev-parse
        def side_effect(cmd, **kwargs):
            if 'rev-parse' in cmd:
                result = MagicMock()
                result.returncode = 0
                result.stdout = 'abc123\n'
                return result
            return MagicMock(returncode=0, stderr='')

        mock_run.side_effect = side_effect

        with tempfile.TemporaryDirectory() as tmpdir:
            result = git_tool('https://github.com/test/repo.git', 'main', tmpdir)

            assert result['status'] == 'ok'
            assert result['commit'] == 'abc123'
            assert result['path'] == tmpdir

    @patch('agent_service.tools.git_tool.subprocess.run')
    def test_git_tool_clone_failure(self, mock_run):
        """Test git clone failure."""
        mock_run.return_value = MagicMock(returncode=1, stderr='Repository not found')

        with tempfile.TemporaryDirectory() as tmpdir:
            result = git_tool('https://github.com/test/repo.git', 'main', tmpdir)

            assert 'error' in result
            assert 'Repository not found' in result['error']


class TestCompileTool:
    """Test compile_tool functionality."""

    @patch('agent_service.tools.compile_tool._check_command')
    @patch('agent_service.tools.compile_tool.subprocess.run')
    def test_compile_tool_missing_dependencies(self, mock_run, mock_check):
        """Test compilation with missing dependencies."""
        mock_check.return_value = False  # solc not available

        with tempfile.TemporaryDirectory() as tmpdir:
            # Create a dummy contract file
            contract_path = os.path.join(tmpdir, 'test.sol')
            with open(contract_path, 'w') as f:
                f.write('// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\ncontract Test {}')

            result = compile_tool(tmpdir, ['test.sol'])

            assert 'errors' in result
            assert len(result['errors']) > 0
            assert 'Contract file not found' not in result['errors'][0]  # File should be found


class TestSlitherTool:
    """Test slither_tool functionality."""

    @patch('agent_service.tools.slither_tool._check_command')
    def test_slither_tool_not_available(self, mock_check):
        """Test slither tool when not available."""
        mock_check.return_value = False

        result = slither_tool(['test.sol'], '/tmp')

        assert 'error' in result
        assert 'Slither not installed' in result['error']

    @patch('agent_service.tools.slither_tool._check_command')
    @patch('agent_service.tools.slither_tool.subprocess.run')
    def test_slither_tool_success(self, mock_run, mock_check):
        """Test successful slither analysis."""
        mock_check.return_value = True

        # Mock slither output
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.stdout = '{"results": {"detectors": []}}'
        mock_run.return_value = mock_process

        result = slither_tool(['test.sol'], '/tmp')

        assert 'findings' in result
        assert 'raw' in result
        assert isinstance(result['findings'], list)


class TestSearchTool:
    """Test search_tool functionality."""

    def test_search_tool_basic(self):
        """Test basic search functionality."""
        result = search_tool("reentrancy")

        assert isinstance(result, list)
        assert len(result) > 0
        assert 'id' in result[0]
        assert 'score' in result[0]
        assert 'snippet' in result[0]
        assert 'metadata' in result[0]


class TestExplainTool:
    """Test explain_tool functionality."""

    @patch('agent_service.tools.explain_tool.Config')
    def test_explain_tool_missing_api_key(self, mock_config):
        """Test explain tool with missing API key."""
        mock_config.OPENAI_API_KEY = 'sk-test123'

        result = explain_tool({"name": "test"}, ["code"])

        assert 'error' in result
        assert 'Valid OpenAI API key required' in result['error']


class TestReportTool:
    """Test report_tool functionality."""

    @patch('agent_service.tools.report_tool.Config')
    def test_report_tool_success(self, mock_config):
        """Test successful report generation."""
        mock_config.ARTIFACTS_DIR = '/tmp'

        payload = {
            "run_id": "test-run-123",
            "findings": [{"name": "test", "severity": "High"}],
            "explanations": []
        }

        with patch('os.makedirs'), \
             patch('builtins.open', create=True), \
             patch('json.dump'):

            result = report_tool(payload)

            assert 'report_url' in result
            assert 'id' in result
            assert result['id'] == 'test-run-123'