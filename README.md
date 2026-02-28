# my-opencode

## Kimi K2.5 via Vertex AI Dedicated Endpoint

Kimi K2.5 is deployed as a dedicated Vertex AI endpoint (vLLM on NVIDIA B200 GPUs). It's not available as a MaaS model on Vertex AI, so it requires a custom provider config in `opencode.json`.

### Provider Config

```json
{
  "provider": {
    "kimi-vertex": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Kimi K2.5 (Vertex)",
      "options": {
        "baseURL": "https://[vertex-ai-endpoint-redacted]"
      },
      "models": {
        "moonshotai/Kimi-K2.5": {
          "name": "Kimi K2.5"
        }
      }
    }
  }
}
```

### Authentication

The dedicated endpoint uses Google Cloud OAuth tokens, not API keys. The token expires every hour.

```bash
# Get a fresh token
gcloud auth print-access-token
```

Then in OpenCode:
1. Run `/connect` and select `kimi-vertex`
2. Paste the token from the command above
3. Repeat every hour when the token expires

### Endpoint Details

| Field | Value |
|-------|-------|
| Endpoint Name | `[vertex-endpoint-id-redacted]` |
| Region | `us-central1` |
| Project | `[gcp-project-number-redacted]` |
| Model | `publishers/moonshotai/models/kimi-k2-5` |
| Hardware | `a4-highgpu-8g` (8x NVIDIA B200) |
| Max Context | 65536 tokens |