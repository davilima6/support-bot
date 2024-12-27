# Slack Support Bot

This project is a Slack bot that uses AI to answer questions based on channel context. It uses the Slack API and AI models to provide intelligent responses to user queries.

## Prerequisites

- Node.js (v22 or later)
- pnpm
- Slack App credentials (Bot Token and Signing Secret)
- Anthropic API key (for Claude 3.5)
- OpenAI API key (for GPT-4, if used)

## Installation

1. Clone this repository
2. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

3. Configure environment variables:

| Variable               | Required | Description                                | Example               |
| ---------------------- | -------- | ------------------------------------------ | --------------------- |
| `SLACK_BOT_TOKEN`      | Yes      | Bot User OAuth Token from Slack            | `xoxb-your-token`     |
| `SLACK_SIGNING_SECRET` | Yes      | Signing Secret from Slack App settings     | `your-signing-secret` |
| `SLACK_CHANNEL_ID`     | No       | Default channel ID for bot to operate in   | `C0123456789`         |
| `ANTHROPIC_API_KEY`    | Yes\*    | API key for Claude 3.5 (\*if using Claude) | `sk-ant-your-key`     |
| `OPENAI_API_KEY`       | Yes\*    | API key for GPT-4 (\*if using GPT-4)       | `sk-your-key`         |
| `PORT`                 | No       | Port to run the server on (default: 3000)  | `3000`                |

You can create a `.env` file in the root directory with these variables:

\`\`\`env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CHANNEL_ID=C0123456789
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
PORT=3000
\`\`\`

## Data Flow

The following Mermaid chart illustrates the data flow in our Slack Support Bot:

```mermaid
graph TD
    A["User"] -->|"Sends message"| B["Slack Channel"]
    B -->|"Bot receives message"| C["Slack Bot"]
    C -->|"Fetches channel history"| D["Slack API"]
    D -->|"Returns messages"| C
    C -->|"Processes messages"| E["AI Workflow"]
    E -->|"Generates initial answer"| F["AI Model 1"]
    F -->|"Passes initial answer"| G["AI Model 2"]
    G -->|"Verifies and improves answer"| E
    E -->|"Returns final answer"| C
    C -->|"Sends response"| B
    B -->|"Displays response"| A
```

### Explanation of the Data Flow:

1. A user sends a message in a Slack channel where the bot is active.
2. The Slack Bot receives the message through the Slack API.
3. The bot fetches the channel history to provide context for the AI models.
4. The AI Workflow processes the messages, filtering only the ones from configured user (support team).
5. The first AI model (Claude 3.5 or GPT-4) generates an initial answer based on the question and context.
6. A second AI model verifies and improves the initial answer.
7. The final answer is sent back to the Slack channel through the Slack API.
8. The user sees the bot's response in the Slack channel.

This flow ensures that the bot provides contextually relevant and verified answers to user queries.

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
   - In Slack, go to the channel where you want to use the bot
   - Type `/invite @your_bot_name`

Now your Slack Support Bot should be installed and ready to use in your Slack organization. Users can configure the bot using the `/configure-ai-bot` slash command.
