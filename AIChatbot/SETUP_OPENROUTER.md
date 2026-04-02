# OpenRouter AI Setup Guide

## Why OpenRouter?

OpenRouter provides access to multiple AI models with generous free tier:
- **Free tier**: $5 credit (lasts 4+ months for typical chatbot usage)
- **No rate limits** on free models
- **Multiple models**: Access to Llama, Mistral, and more
- **Better reliability** than Google's free tier

## Setup Steps

### 1. Get Your Free API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Click "Sign In" (top right)
3. Sign in with Google, GitHub, or email
4. Go to [Keys page](https://openrouter.ai/keys)
5. Click "Create Key"
6. Copy your API key

### 2. Update Configuration

Open `AIChatbot/.env` and replace:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

With your actual API key:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### 3. Install Dependencies

```bash
cd AIChatbot
pip install -r requirements.txt
```

### 4. Start the Chatbot Server

```bash
python chatbot_server.py
```

The server will start on `http://localhost:5001`

## Available Models

The chatbot currently uses: `meta-llama/llama-3.1-8b-instruct:free`

Other free models you can try:
- `meta-llama/llama-3.1-8b-instruct:free` (Current - Best balance)
- `mistralai/mistral-7b-instruct:free` (Fast responses)
- `google/gemma-7b-it:free` (Google's model)

To change the model, edit `chatbot_server.py` line 145:
```python
"model": "meta-llama/llama-3.1-8b-instruct:free",
```

## Free Tier Details

- **$5 free credit** on signup
- **No expiration** (credits don't expire)
- **Free models** have no rate limits
- Typical usage: ~$0.01 per 100 messages
- **Lasts 4+ months** for a chatbot with moderate traffic

## Troubleshooting

### Error: "OPENROUTER_API_KEY not set"
- Make sure you updated the `.env` file
- Restart the chatbot server after updating

### Error: "AI service temporarily unavailable"
- Check your API key is valid
- Verify you have credits remaining at https://openrouter.ai/credits
- Try a different model

### Slow responses
- Try switching to `mistralai/mistral-7b-instruct:free` for faster responses

## Monitoring Usage

Check your usage at: https://openrouter.ai/activity

You can see:
- Total requests
- Credits used
- Model performance

## Upgrading (Optional)

If you need more:
1. Add credits at https://openrouter.ai/credits
2. Use paid models for better quality
3. No rate limits even on paid tier

## Support

- OpenRouter Docs: https://openrouter.ai/docs
- Discord: https://discord.gg/openrouter
