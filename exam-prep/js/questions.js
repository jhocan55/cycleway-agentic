// GitHub Certified Agentic AI Developer — Exam Question Bank
// Aligned to the AGENTIC certification study guide

export const DOMAINS = {
  'agentic-fundamentals': {
    title: 'Agentic AI Fundamentals',
    weight: '25–30%',
    icon: '🧠',
    color: '#1a6bb4',
    description: 'Agent patterns, orchestration, tool use, ReAct loops, multi-agent systems'
  },
  'copilot-agentic': {
    title: 'Copilot Agentic Features',
    weight: '25–30%',
    icon: '🤖',
    color: '#6d28d9',
    description: 'Agent Mode, Edit Mode, Copilot Extensions, GitHub Models, Spaces, Spark'
  },
  'mcp-tools': {
    title: 'MCP & Tool Integration',
    weight: '15–20%',
    icon: '🔌',
    color: '#2d5a3d',
    description: 'Model Context Protocol, tool definitions, MCP servers, function calling'
  },
  'building-agents': {
    title: 'Building Agentic Apps',
    weight: '15–20%',
    icon: '🏗️',
    color: '#c47a00',
    description: 'LLM proxies, observability, spec-driven dev, streaming, CI/CD for agents'
  },
  'responsible-agentic': {
    title: 'Responsible Agentic AI',
    weight: '10–15%',
    icon: '⚖️',
    color: '#c0392b',
    description: 'Guardrails, human-in-the-loop, content filtering, safety, bias mitigation'
  }
};

export const QUESTIONS = {

  // ═══════════════════════════════════════════════════════
  // DOMAIN 1 — Agentic AI Fundamentals (25–30%)
  // ═══════════════════════════════════════════════════════
  'agentic-fundamentals': [
    {
      id: 'af-01',
      q: 'What is the key characteristic that distinguishes an AI agent from a simple LLM chat interface?',
      options: [
        'An agent uses a larger language model',
        'An agent can take actions, use tools, and make sequential decisions to complete multi-step goals',
        'An agent always requires internet access',
        'An agent can only run in the cloud'
      ],
      answer: 1,
      explanation: 'Agents are autonomous — they perceive state, decide actions, call tools, observe results, and iterate until the goal is reached. A chat interface just returns a single response.'
    },
    {
      id: 'af-02',
      q: 'In the ReAct (Reason + Act) pattern, what is the correct cycle order?',
      options: [
        'Act → Observe → Reason → Repeat',
        'Reason → Act → Observe → Repeat',
        'Observe → Act → Reason → Repeat',
        'Plan → Execute → Report → End'
      ],
      answer: 1,
      explanation: 'ReAct: the model Reasons about what to do, Acts (calls a tool), Observes the result, then Reasons again. This loop continues until the task is complete.'
    },
    {
      id: 'af-03',
      q: 'What problem does an orchestrator agent solve in a multi-agent system?',
      options: [
        'It stores conversation history in a database',
        'It coordinates multiple specialised sub-agents, routing tasks and aggregating results',
        'It provides the user interface for the application',
        'It handles authentication and authorisation'
      ],
      answer: 1,
      explanation: 'The orchestrator is the "brain" — it decides which sub-agent handles which task and merges their outputs, enabling parallel specialised work.'
    },
    {
      id: 'af-04',
      q: 'Which of the following best describes "tool use" in the context of AI agents?',
      options: [
        'The model switching between different programming languages',
        'The model calling external functions (APIs, databases, code execution) to get real-world data or take actions',
        'The use of IDE plugins to assist coding',
        'Running multiple AI models in sequence'
      ],
      answer: 1,
      explanation: 'Tool use (function calling) lets agents interact with the world — fetching weather, running queries, reading files, calling APIs — beyond what the LLM knows from training.'
    },
    {
      id: 'af-05',
      q: 'What is a primary risk of an agentic loop without a termination condition?',
      options: [
        'The agent will produce lower-quality responses',
        'The agent may run indefinitely, consuming compute and potentially taking unintended actions',
        'The agent will switch to a smaller model automatically',
        'The agent will stop responding after 10 steps'
      ],
      answer: 1,
      explanation: 'Without max-iteration limits or goal-completion checks, agents can loop forever. Always define stopping conditions and set token/step budgets.'
    },
    {
      id: 'af-06',
      q: 'In a parallel tool-call pattern, what is the main benefit over sequential calls?',
      options: [
        'Parallel calls use less memory',
        'Parallel calls reduce total latency by executing independent tasks simultaneously',
        'Parallel calls are more accurate',
        'Parallel calls avoid rate limits'
      ],
      answer: 1,
      explanation: 'When tasks are independent (e.g., fetch weather AND fetch traffic at the same time), parallelism cuts total wall-clock time from sum-of-latencies to max-of-latencies.'
    },
    {
      id: 'af-07',
      q: 'What does "context window management" mean in long-running agent tasks?',
      options: [
        'Resizing the browser window for the agent UI',
        'Summarising or pruning conversation history so the agent stays within the LLM token limit',
        'Managing CPU and memory on the host machine',
        'Setting the timeout for each tool call'
      ],
      answer: 1,
      explanation: 'LLMs have fixed context limits. Long agent runs must compress or summarise prior steps — otherwise the agent loses access to early context or hits token limits.'
    },
    {
      id: 'af-08',
      q: 'What is "grounding" in the context of agentic AI?',
      options: [
        'Connecting the agent to a physical device',
        'Anchoring agent responses to verified, current data sources rather than relying solely on training data',
        'Limiting the agent to only safe topics',
        'Compiling the agent code before deployment'
      ],
      answer: 1,
      explanation: 'Grounding reduces hallucination by giving agents access to real-time facts via tool calls, RAG, or injected context rather than relying on potentially stale training knowledge.'
    }
  ],

  // ═══════════════════════════════════════════════════════
  // DOMAIN 2 — Copilot Agentic Features (25–30%)
  // ═══════════════════════════════════════════════════════
  'copilot-agentic': [
    {
      id: 'ca-01',
      q: 'What is GitHub Copilot Agent Mode?',
      options: [
        'A mode that lets Copilot only suggest single-line completions',
        'An autonomous mode where Copilot iterates across multiple files, runs terminal commands, and self-corrects until a task is complete',
        'A mode for generating GitHub Actions workflows',
        'A read-only mode for code review'
      ],
      answer: 1,
      explanation: 'Agent Mode turns Copilot into an orchestrator — it plans multi-step tasks, edits files, reads compiler errors, runs tests, and iterates. The user approves terminal commands.'
    },
    {
      id: 'ca-02',
      q: 'How does Copilot Edit Mode differ from Agent Mode?',
      options: [
        'Edit Mode is faster because it uses a smaller model',
        'Edit Mode applies targeted edits across specified files with user direction; Agent Mode autonomously plans and executes the full workflow',
        'Edit Mode only works in VS Code; Agent Mode works everywhere',
        'Edit Mode cannot modify existing files'
      ],
      answer: 1,
      explanation: 'Edit Mode is user-directed multi-file editing. Agent Mode is autonomous — it decides what files to touch, what commands to run, and iterates on failures without prompting.'
    },
    {
      id: 'ca-03',
      q: 'What are GitHub Models and why are they useful for agentic development?',
      options: [
        'Custom ML models you train on your own code',
        'A free inference API on GitHub that lets you test and switch between LLMs (GPT-4o, Llama, Phi) without credit cards or quotas',
        'GitHub\'s proprietary AI models only available for enterprises',
        'Models that auto-generate GitHub Actions workflows'
      ],
      answer: 1,
      explanation: 'GitHub Models provides free access to frontier models via an OpenAI-compatible endpoint. Ideal for prototyping agents without committing to a paid API key.'
    },
    {
      id: 'ca-04',
      q: 'What is a GitHub Copilot Extension?',
      options: [
        'A VS Code plugin that adds syntax highlighting',
        'A GitHub App that integrates a custom agent or external tool directly into the Copilot Chat interface',
        'A browser extension for GitHub.com',
        'An extension that increases Copilot\'s context window'
      ],
      answer: 1,
      explanation: 'Copilot Extensions let developers expose their own agents (or third-party services) as @-mentionable skills in Copilot Chat — e.g., @datadog, @sentry, or a custom deployment agent.'
    },
    {
      id: 'ca-05',
      q: 'In Copilot Agent Mode, what is the purpose of the "human confirmation" step before running terminal commands?',
      options: [
        'To slow down the agent so it does not use too many tokens',
        'To maintain human oversight — the user reviews and approves each shell command before it executes',
        'To allow the agent to request more context',
        'To prevent the agent from accessing the internet'
      ],
      answer: 1,
      explanation: 'This is the human-in-the-loop safety mechanism. Agentic systems that can execute code must require approval for irreversible or high-impact actions.'
    },
    {
      id: 'ca-06',
      q: 'What is Copilot Workspace?',
      options: [
        'A folder on your computer where Copilot stores its cache',
        'An AI-native dev environment that takes a GitHub Issue and generates a full plan, code changes, and PR — all from the browser',
        'A shared workspace for pair programming with a colleague',
        'The VS Code workspace settings file'
      ],
      answer: 1,
      explanation: 'Copilot Workspace bridges issue → implementation. It generates a spec, a plan, and code edits for a GitHub Issue, letting you review and iterate before opening a PR.'
    },
    {
      id: 'ca-07',
      q: 'What distinguishes GitHub Copilot Spark from other Copilot products?',
      options: [
        'Spark is a command-line tool for generating bash scripts',
        'Spark enables non-developers to build and deploy full web apps through natural language alone — no code required',
        'Spark provides faster code completions in the IDE',
        'Spark is an AI model optimised for speed over accuracy'
      ],
      answer: 1,
      explanation: 'Spark democratises app creation — it targets business users and non-coders, generating full micro-apps from prompts and deploying them automatically.'
    },
    {
      id: 'ca-08',
      q: 'What is the role of GITHUB_TOKEN when using GitHub Models in LiteLLM or similar proxies?',
      options: [
        'It authenticates git push operations',
        'It authorises the inference API calls to the Azure-backed GitHub Models endpoint',
        'It encrypts the model responses',
        'It is only needed for private repositories'
      ],
      answer: 1,
      explanation: 'GitHub Models uses the GitHub REST API token for auth. The endpoint is OpenAI-compatible; you pass the GITHUB_TOKEN as the Bearer token.'
    }
  ],

  // ═══════════════════════════════════════════════════════
  // DOMAIN 3 — MCP & Tool Integration (15–20%)
  // ═══════════════════════════════════════════════════════
  'mcp-tools': [
    {
      id: 'mt-01',
      q: 'What is the Model Context Protocol (MCP)?',
      options: [
        'A protocol for compressing LLM context windows',
        'An open standard that defines how AI agents discover and invoke external tools and data sources over a standard interface',
        'A GitHub authentication protocol for AI services',
        'A way to limit how many tokens an LLM can generate'
      ],
      answer: 1,
      explanation: 'MCP is a universal plug-in standard — any AI client (Claude, Copilot, etc.) can connect to any MCP server (databases, code tools, APIs) without custom integrations.'
    },
    {
      id: 'mt-02',
      q: 'In the MCP architecture, what role does an MCP Host play?',
      options: [
        'The MCP Host stores the vector embeddings for RAG',
        'The MCP Host is the AI application (e.g., Claude Code, VS Code) that manages connections to MCP servers and calls their tools',
        'The MCP Host is the physical server running the LLM',
        'The MCP Host enforces rate limits on tool calls'
      ],
      answer: 1,
      explanation: 'The Host (AI client) discovers available tools from connected MCP Servers and decides when to invoke them based on user requests or agent reasoning.'
    },
    {
      id: 'mt-03',
      q: 'What transport mechanisms does MCP support for server-client communication?',
      options: [
        'Only WebSockets',
        'stdio (local process) and HTTP with Server-Sent Events (remote)',
        'Only REST over HTTPS',
        'gRPC and GraphQL only'
      ],
      answer: 1,
      explanation: 'stdio is used for local MCP servers (spawned as subprocesses). HTTP+SSE is for remote/hosted MCP servers. Both use the same JSON-RPC message format.'
    },
    {
      id: 'mt-04',
      q: 'Which of the following is an example of an MCP "tool" vs an MCP "resource"?',
      options: [
        'A tool reads static data; a resource executes code',
        'A tool performs an action with side effects (e.g., run a query, create a file); a resource exposes read-only data (e.g., a file, a database row)',
        'Tools and resources are identical concepts',
        'A tool is server-side; a resource is client-side'
      ],
      answer: 1,
      explanation: 'MCP distinguishes: Resources (read-only data exposed to the LLM as context) vs Tools (callable functions that take parameters and can have side effects).'
    },
    {
      id: 'mt-05',
      q: 'What does "function calling" (tool use) in an LLM API allow an agent to do?',
      options: [
        'Call JavaScript functions directly from the model weights',
        'Signal to the calling code which external function to invoke with which arguments, enabling structured tool dispatch',
        'Call other AI models from within a single inference request',
        'Access the host file system directly from the model'
      ],
      answer: 1,
      explanation: 'Function calling lets the LLM output a structured JSON object describing the tool name and arguments. The calling code executes the actual function and feeds results back as context.'
    },
    {
      id: 'mt-06',
      q: 'Why is Serena a useful MCP server for AI coding agents?',
      options: [
        'Serena provides free GPU compute for model inference',
        'Serena exposes semantic code navigation tools (find symbol, search patterns, get file overview) so agents understand codebases structurally, not just by text search',
        'Serena manages GitHub pull request reviews automatically',
        'Serena provides internet search capabilities to the agent'
      ],
      answer: 1,
      explanation: 'Serena uses Language Server Protocol (LSP) under the hood to give agents symbol-aware navigation — much more reliable than grep for refactoring or understanding large codebases.'
    }
  ],

  // ═══════════════════════════════════════════════════════
  // DOMAIN 4 — Building Agentic Applications (15–20%)
  // ═══════════════════════════════════════════════════════
  'building-agents': [
    {
      id: 'ba-01',
      q: 'What is the primary purpose of an LLM proxy like LiteLLM in an agentic application?',
      options: [
        'To train custom models on your data',
        'To provide a single OpenAI-compatible endpoint that routes requests to multiple LLM backends with fallback, key management, and observability',
        'To cache all LLM responses permanently',
        'To compress prompts before sending them to the model'
      ],
      answer: 1,
      explanation: 'An LLM proxy decouples your application from any specific provider. Swap Ollama for GPT-4o, add Langfuse tracing, or enforce rate limits — all without changing app code.'
    },
    {
      id: 'ba-02',
      q: 'What does agent observability via a tool like Langfuse enable that standard application logs do not?',
      options: [
        'Lower API costs by caching responses',
        'Trace-level visibility into every LLM call: inputs, outputs, token counts, latency, and multi-step agent reasoning chains',
        'Automatic bug fixing in agent code',
        'Blocking harmful model outputs in real time'
      ],
      answer: 1,
      explanation: 'Langfuse captures the full agent trace — every prompt, every tool call, every sub-agent response — making it possible to debug why an agent made a decision or where it failed.'
    },
    {
      id: 'ba-03',
      q: 'What is Spec-Driven Development (SDD) and why is it recommended for agentic projects?',
      options: [
        'Writing unit tests before writing code',
        'Defining a formal specification (user stories, acceptance criteria, module contracts) before any code is written, so both humans and AI agents have unambiguous intent to work from',
        'Generating code automatically from database schemas',
        'Using static analysis tools to check code correctness'
      ],
      answer: 1,
      explanation: 'SDD gives AI coding agents precise contracts and constraints to work within, reducing hallucinated features and scope creep. Tools like spec-kit formalise this workflow.'
    },
    {
      id: 'ba-04',
      q: 'What is Server-Sent Events (SSE) streaming used for in agentic LLM applications?',
      options: [
        'Sending push notifications to mobile devices',
        'Delivering LLM token output incrementally to the client as it is generated, enabling real-time streaming responses',
        'Synchronising state between multiple agent instances',
        'Compressing large model responses before transmission'
      ],
      answer: 1,
      explanation: 'SSE lets the browser receive each generated token as it arrives instead of waiting for the full response. This dramatically improves perceived responsiveness for long agent outputs.'
    },
    {
      id: 'ba-05',
      q: 'In a CI/CD pipeline for an agentic app, what should the "validate" job check beyond normal code linting?',
      options: [
        'Whether the LLM is online and responding',
        'That all agent configuration files (LLM config, tool definitions, system prompts) are valid and all required modules exist',
        'That the agent has passed a Turing test',
        'That the model weights have not changed'
      ],
      answer: 1,
      explanation: 'Agent apps have extra artefacts — YAML configs, prompt templates, tool schemas, spec docs — that must be validated in CI to catch misconfigurations before deployment.'
    },
    {
      id: 'ba-06',
      q: 'What is the fallback pattern in assistant.js of CycleWay, and why is it important?',
      options: [
        'It switches to a different routing API if GraphHopper is down',
        'It tries LiteLLM proxy first; if unavailable it falls back to direct Ollama — ensuring the agent works even when the proxy is offline',
        'It falls back to a simpler model if the primary model returns an error',
        'It caches the last successful response and reuses it on failure'
      ],
      answer: 1,
      explanation: 'Resilient agents must handle infrastructure failures gracefully. The LiteLLM→Ollama fallback ensures the AI advisor keeps working even if the Docker stack is not running.'
    }
  ],

  // ═══════════════════════════════════════════════════════
  // DOMAIN 5 — Responsible Agentic AI (10–15%)
  // ═══════════════════════════════════════════════════════
  'responsible-agentic': [
    {
      id: 'ra-01',
      q: 'What is "prompt injection" in the context of AI agents, and why is it more dangerous than in basic chat?',
      options: [
        'Sending very long prompts to overwhelm the model',
        'Malicious content in agent inputs that hijacks the agent\'s instructions — more dangerous because agents can take real-world actions (run code, call APIs, modify files)',
        'Injecting SQL into database queries via the AI',
        'Using special characters to confuse the tokeniser'
      ],
      answer: 1,
      explanation: 'In chat, a successful injection just changes the response. In an agent, it can cause the agent to exfiltrate data, execute malicious code, or take destructive actions on external systems.'
    },
    {
      id: 'ra-02',
      q: 'What is the principle of "minimal footprint" for AI agents?',
      options: [
        'Using the smallest possible LLM to reduce cost',
        'Agents should request only necessary permissions, avoid storing sensitive data, and prefer reversible actions — limiting potential damage if something goes wrong',
        'Minimising the number of tokens in each prompt',
        'Running agents on low-power hardware'
      ],
      answer: 1,
      explanation: 'Like the principle of least privilege in security, minimal footprint limits the blast radius of agent errors. An agent that only has read access cannot accidentally delete data.'
    },
    {
      id: 'ra-03',
      q: 'What is a "guardrail" in an agentic AI system?',
      options: [
        'A physical safety barrier around server hardware',
        'A validation layer that checks inputs and outputs against rules — blocking harmful content, off-topic requests, or policy violations before they reach or leave the model',
        'A rate limiter that prevents too many API calls',
        'A monitoring tool that alerts on model downtime'
      ],
      answer: 1,
      explanation: 'Guardrails are the safety net. Input guardrails block prompt injections and policy violations. Output guardrails catch hallucinations, PII leakage, or harmful content before it reaches users.'
    },
    {
      id: 'ra-04',
      q: 'Why is "human-in-the-loop" (HITL) especially important for agentic AI compared to passive AI tools?',
      options: [
        'Because agents are less accurate than non-agentic models',
        'Because agents can take irreversible real-world actions — human approval checkpoints prevent accidental data deletion, unintended deployments, or harmful API calls',
        'Because regulations require human approval for all AI outputs',
        'Because agents cannot understand context without human clarification'
      ],
      answer: 1,
      explanation: 'HITL is the primary mitigation for agentic risk. Before irreversible actions (delete, deploy, send), require explicit human confirmation. This is why Copilot Agent Mode shows command previews before execution.'
    },
    {
      id: 'ra-05',
      q: 'What does it mean for an AI agent to be "transparent" to its users?',
      options: [
        'The agent\'s source code must be publicly available',
        'Users should be clearly informed they are interacting with an AI, understand what actions it can take, and be able to audit its decisions and tool calls',
        'The agent must explain every line of code it generates',
        'The agent must display its confidence score for every response'
      ],
      answer: 1,
      explanation: 'Transparency builds appropriate trust. Users who understand the agent\'s capabilities and limitations make better decisions about when to rely on it vs seek human expertise.'
    },
    {
      id: 'ra-06',
      q: 'How should an agentic application handle a situation where the AI model refuses to complete a task?',
      options: [
        'Automatically retry with a different prompt until it succeeds',
        'Surface the refusal clearly to the user, explain why the task could not be completed, and offer alternative actions — never silently fail or bypass safety measures',
        'Log the failure and attempt the task with a less restrictive model',
        'Clear the conversation history and restart the agent'
      ],
      answer: 1,
      explanation: 'Silent failures or automatic bypasses of safety measures destroy user trust and create unpredictable behaviour. Surfacing refusals maintains transparency and keeps humans in control.'
    }
  ]

};

export function getQuestionsByDomain(domainKey) {
  return QUESTIONS[domainKey] || [];
}

export function getAllQuestions() {
  return Object.entries(QUESTIONS).flatMap(([domain, qs]) =>
    qs.map(q => ({ ...q, domain }))
  );
}

export function getTotalQuestions() {
  return getAllQuestions().length;
}
