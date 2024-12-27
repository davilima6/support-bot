# Slack Support Bot

This project is a Slack bot that uses AI to answer questions based on channel context. It uses the Slack API and AI models to provide intelligent responses to user queries.

## Table of Contents

- [Data Flow](#data-flow)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Caching with Vercel KV (optional)](#caching-withvercel-kv-optional)
- [Installing the bot in a Slack organization](#installing-the-bot-in-a-slack-organization)

### Data Flow

```mermaid
graph TD
    A["User"] -->|"Sends message"| B["Slack Channel"]
    B -->|"Bot receives message"| C["Slack Bot"]
    C -->|"Fetches channel history"| D["Slack API"]
    D -->|"Returns messages"| C
    C -->|"Processes messages"| E["AI Workflow"]
    E -->|"Generates initial answer"| F["AI Service"]
    F -->|"Passes initial answer"| G["AI Model 1"]
    G -->|"Verifies and improves answer"| H["AI Model 2"]
    H -->|"Returns improved answer"| F
    subgraph App
        C
        E
    end
    subgraph Optional Caching
        E -.->|"Caches answer"| I["Vercel KV"]
        I -.->|"Returns cached answer"| C
    end
    E -->|"Returns final answer"| C
    C -->|"Sends response"| B
    B -->|"Displays response"| A
    subgraph Data Sources
        C -->|"Fetches data"| D
        E -->|"Fetches data"| F
        F -->|"Fetches data"| G
        G -->|"Fetches data"| H
    end
```

## Prerequisites

- Node.js (v22 or later)
- pnpm
- Slack App credentials (Bot Token and Signing Secret)
- Anthropic API key (for Claude 3.5)
- OpenAI API key (for GPT-4, if used)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

Please copy the provided `.env.example` file as `.env`.

Required environment variables:

| Variable               | Description                                | Example               |
| ---------------------- | ------------------------------------------ | --------------------- |
| `SLACK_BOT_TOKEN`      | Bot User OAuth Token from Slack            | `xoxb-your-token`     |
| `SLACK_SIGNING_SECRET` | Signing Secret from Slack App settings     | `your-signing-secret` |
| `ANTHROPIC_API_KEY`\*  | API key for Claude 3.5 (\*if using Claude) | `sk-ant-your-key`     |
| `OPENAI_API_KEY`\*     | API key for GPT-4 (\*if using GPT-4)       | `sk-your-key`         |

### Caching with Vercel KV (optional)

The bot supports two caching modes:

- `no-cache` (default): No caching, fresh context retrieval for every processed message
- `kv`: [Vercel KV](https://vercel.com/docs/storage/vercel-kv)-based caching (recommended for production)

To enable Vercel KV caching:

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Create a new KV database:

```bash
vercel kv create slack-support-bot-cache
```

3. Link the database to your project:

```bash
vercel link
vercel env pull
```

4. Configure the additional environment variables in your deployment:

```bash
vercel env add KV_URL
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add KV_REST_API_READ_ONLY_TOKEN
```

## Installing the bot in a Slack organization

1. Create a new Slack App:

   - Go to https://api.slack.com/apps and click "Create New App"
   - Choose "From scratch" and give your app a name
   - Select the workspace where you want to install the app

2. Set up your app:

   - In the "Basic Information" section, note down the "Signing Secret"
   - Go to "OAuth & Permissions" and add the following bot token scopes:
     - `channels:history`
     - `chat:write`
     - `commands`
   - Scroll up and click "Install to Workspace", then authorize the app

3. Get your bot token:

   - After installation, you'll be redirected to the "OAuth & Permissions" page
   - Copy the "Bot User OAuth Token" (it starts with `xoxb-`)

4. Set up slash commands:

   - Go to "Slash Commands" and click "Create New Command"
   - Set the command to `/configure-ai-bot`
   - Set the request URL to `https://your-app-url.com/slack/events`
   - Add a short description and usage hint

5. Set up interactivity:

   - Go to "Interactivity & Shortcuts"
   - Turn on interactivity
   - Set the request URL to `https://your-app-url.com/slack/events`

6. Update your environment variables:

   - Set `SLACK_BOT_TOKEN` to the Bot User OAuth Token
   - Set `SLACK_SIGNING_SECRET` to the Signing Secret

7. Deploy your bot to a hosting platform (e.g., Heroku, AWS, or DigitalOcean)

8. Invite the bot to your desired Slack channel:
   - In Slack, go to the channel where you want to use the bot - Type `/invite @your_bot_name`Now your Slack Support Bot should be installed and ready to use in your Slack organization. Users can configure the bot using the `/configure-ai-bot` slash command.
