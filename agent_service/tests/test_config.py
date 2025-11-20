import os
import pytest
from unittest.mock import patch
from dotenv import load_dotenv
from agent_service.config import Config


class TestConfig:
    def setup_method(self):
        """Load test environment variables."""
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env.test'), override=True)

    def test_config_loading(self):
        """Test configuration loading from environment."""
        # Reload config to pick up new env vars
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        # Expected configuration values from test environment (excluding sensitive API key)
        expected_config = {
            "VECTOR_DB_URL": "http://localhost:8000",
            "ARTIFACTS_DIR": "/tmp/test_artifacts",
            "LOG_LEVEL": "DEBUG",
            "LOG_LEVEL_VALUE": 10,  # DEBUG level
        }

        # Assert each configuration attribute matches expected value
        for attr, expected in expected_config.items():
            actual = getattr(Config, attr)
            assert actual == expected, f"{attr} mismatch: expected {expected}, got {actual}"

        # Validate API key is loaded and has correct format (schema validation)
        api_key = Config.OPENAI_API_KEY
        assert api_key, "OPENAI_API_KEY must be set"
        assert api_key.startswith("sk-"), "OPENAI_API_KEY must start with 'sk-'"
        assert len(api_key) > 50, f"OPENAI_API_KEY must be longer than 50 characters, got {len(api_key)}"

        # Test that configuration validates successfully
        Config.validate()  # Should not raise ValueError

    @patch.dict(os.environ, {}, clear=True)
    def test_config_defaults(self):
        """Test default values when env vars not set."""
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        assert Config.OPENAI_API_KEY == ""
        assert Config.VECTOR_DB_URL is None
        assert Config.ARTIFACTS_DIR == "./artifacts"
        assert Config.LOG_LEVEL == "INFO"
        assert Config.LOG_LEVEL_VALUE == 20  # INFO level

    @patch.dict(os.environ, {"OPENAI_API_KEY": ""}, clear=True)
    def test_validation_missing_api_key(self):
        """Test validation fails when OPENAI_API_KEY is missing."""
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        with pytest.raises(ValueError, match="OPENAI_API_KEY environment variable is required"):
            Config.validate()

    @patch.dict(os.environ, {
        "OPENAI_API_KEY": "sk-test",
        "LOG_LEVEL": "INVALID"
    })
    def test_validation_invalid_log_level(self):
        """Test validation fails for invalid LOG_LEVEL."""
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        with pytest.raises(ValueError, match="Invalid LOG_LEVEL"):
            Config.validate()

    @patch.dict(os.environ, {
        "OPENAI_API_KEY": "sk-test",
        "ARTIFACTS_DIR": ""
    })
    def test_validation_empty_artifacts_dir(self):
        """Test validation fails for empty ARTIFACTS_DIR."""
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        with pytest.raises(ValueError, match="ARTIFACTS_DIR cannot be empty"):
            Config.validate()


class TestRedactSecrets:
    def test_redact_openai_key(self):
        """Test redaction of OpenAI API keys."""
        text = "My key is sk-abcdefghijklmnopqrstuvwx123456789012345678"
        redacted = Config.redact_secrets(text)
        assert "sk-***REDACTED***" in redacted
        assert "abcdefghijklmnopqrstuvwx123456789012345678" not in redacted

    def test_redact_hex_strings(self):
        """Test redaction of long hex strings (potential private keys)."""
        text = "Private key: a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
        redacted = Config.redact_secrets(text)
        assert "***REDACTED***" in redacted
        assert "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" not in redacted

    def test_redact_common_secrets(self):
        """Test redaction of common secret patterns."""
        text = 'api_key: "secret123", password: "mypass", token: "tok123"'
        redacted = Config.redact_secrets(text)
        assert 'api_key: "***REDACTED***"' in redacted
        assert 'password: "***REDACTED***"' in redacted
        assert 'token: "***REDACTED***"' in redacted

    def test_no_redaction_needed(self):
        """Test text without secrets remains unchanged."""
        text = "This is normal text without secrets."
        redacted = Config.redact_secrets(text)
        assert redacted == text

    def test_empty_text(self):
        """Test redaction of empty text."""
        redacted = Config.redact_secrets("")
        assert redacted == ""

    def test_none_text(self):
        """Test redaction of None."""
        redacted = Config.redact_secrets(None)
        assert redacted is None


class TestSetupLogging:
    @patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test"}, clear=True)
    @patch("os.makedirs")
    @patch("logging.basicConfig")
    @patch("logging.FileHandler")
    def test_setup_logging(self, mock_file_handler, mock_basic_config, mock_makedirs):
        """Test logging setup."""
        import importlib
        import agent_service.config
        importlib.reload(agent_service.config)
        from agent_service.config import Config

        Config.setup_logging()

        # Check that artifacts directory is created
        mock_makedirs.assert_called_once_with("./artifacts", exist_ok=True)

        # Check that basicConfig is called
        mock_basic_config.assert_called_once()
        args, kwargs = mock_basic_config.call_args
        assert kwargs["level"] == 20  # INFO

        # Check that FileHandler was called with correct path
        expected_path = os.path.join("./artifacts", "agent.log")
        mock_file_handler.assert_called_once_with(expected_path, mode='a')
        assert kwargs["handlers"][1] == mock_file_handler.return_value