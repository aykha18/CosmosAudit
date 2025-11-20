# CosmoAudit Agent Service

A Python-based microservice that orchestrates AI-powered smart contract security audits using the OpenAI Agent SDK.

## Overview

The Agent Service provides automated security analysis of Solidity smart contracts through:

- **Repository Cloning**: Secure cloning of Git repositories
- **Contract Compilation**: Support for solc and Foundry compilation
- **Static Analysis**: Slither-based vulnerability detection
- **AI-Powered Explanations**: GPT-4 generated insights and remediation
- **Vector Search**: ChromaDB-powered knowledge retrieval
- **Comprehensive Reporting**: Detailed audit reports with artifacts

## Features

- 🔍 **Multi-tool Analysis**: Combines static analysis with AI insights
- 🤖 **OpenAI Integration**: GPT-4 powered explanations and recommendations
- 📊 **Vector Search**: Semantic search through security knowledge base
- 🐳 **Containerized**: Docker-ready for easy deployment
- 🔒 **Secure**: Input validation, secret redaction, and safe AI prompts
- 📈 **Scalable**: Async processing with proper error handling

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Tools** (optional, for full functionality)
   ```bash
   # Install Solidity compiler
   pip install solc-select
   solc-select install 0.8.19
   solc-select use 0.8.19

   # Install Slither
   pip install slither-analyzer
   ```

3. **Set Environment Variables**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   export ARTIFACTS_DIR="./artifacts"
   ```

4. **Run the Service**
   ```bash
   python start.py
   ```

5. **Test the API**
   ```bash
   curl http://localhost:8000/health
   ```

### Docker Deployment

```bash
# Build the image
docker build -t cosmosaudit-agent .

# Run the container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY="your-api-key" \
  cosmosaudit-agent
```

## API Usage

### Health Check
```bash
GET /health
```

### Run Audit
```bash
POST /api/v1/audit
Content-Type: application/json

{
  "repo_url": "https://github.com/example/smart-contract-repo",
  "branch": "main",
  "contract_paths": ["contracts/Token.sol", "contracts/DEX.sol"],
  "run_explainer": true
}
```

**Response:**
```json
{
  "run_id": "audit-123456",
  "summary": {
    "findings_count": 3,
    "status": "completed"
  },
  "findings": [...],
  "explanations": [...]
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | OpenAI API key for AI explanations |
| `ARTIFACTS_DIR` | `./artifacts` | Directory for audit artifacts and reports |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Agent Service  │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   git_tool      │    │  compile_tool   │    │  slither_tool   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  search_tool    │    │ explain_tool    │    │ report_tool     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development

### Running Tests

```bash
# Unit tests
pytest tests/test_tools.py -v

# Integration tests
pytest tests/test_api_integration.py -v

# All tests
pytest
```

### Code Quality

```bash
# Type checking
mypy agent_service/

# Linting
flake8 agent_service/

# Formatting
black agent_service/
```

## Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Input Validation**: All inputs are validated using Pydantic models
- **Secret Redaction**: Sensitive data is automatically redacted from logs
- **AI Safety**: Prompts include safeguards against jailbreak attempts
- **Resource Limits**: Rate limiting and timeout protections

## Troubleshooting

### Common Issues

1. **"Slither not installed"**
   ```bash
   pip install slither-analyzer
   ```

2. **Compilation Errors**
   - Ensure Solidity files are syntactically correct
   - Check for missing dependencies (OpenZeppelin, etc.)

3. **OpenAI API Errors**
   - Verify API key is valid and has sufficient credits
   - Check network connectivity

### Logs and Debugging

- **Service Logs**: Check console output for detailed error messages
- **Artifacts**: Audit artifacts are saved in `./artifacts/{run_id}/`
- **Debug Mode**: Set `LOG_LEVEL=DEBUG` for verbose logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is part of CosmoAudit. See main project for licensing information.