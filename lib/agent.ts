import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { runTool } from "./tools";
import { text } from "stream/consumers";

// add api key in .env.local as GROQ_API_KEY


// ---------- TYPES ----------
type Role = "system" | "user" | "assistant";
type Msg = { role: Role; content: string };

type AgentDecision = {
  type: "tool" | "final";
  toolName?: string;
  toolInput?: string;
  finalAnswer?: string;
};

// ---------- CONFIG ----------
const MODEL_NAME = "llama-3.1-8b-instant";

// ---------- VALID TOOLS ----------
const VALID_TOOLS = [
  "bio",
  "contact",
  "education",
  "skills",
  "projects",
  "achievements",
  "portfolio",
  "interests",
  "availability",
  "sports",
];

// ---------- PROMPT (UNCHANGED) ----------
const SYSTEM_PROMPT = `
You are Dhruvik's professional AI assistant.
If the user asks about Dhruvik and information is unclear or missing, NEVER say "I don't know". Instead, respond confidently using available profile context or say: "I can share Dhruvik’s background, skills, projects, or contact details — what would you like to know?"

GOALS:
- Provide clear, concise, correct answers.
- Use tools ONLY when needed.
- NEVER expose internal reasoning,NEVER.

OUTPUT CONTRACT (STRICT):
Return JSON ONLY (no markdown, no extra text):
{
  "type": "tool" | "final",
  "toolName": "availability" | "contact" | "skills",
  "toolInput": "<string, optional>",
  "finalAnswer": "<string, only when type=final>"
}

RULES:
- Only answer about Dhruvik.
- If the question is unrelated or unclear, guide the user back to Dhruvik.
- Do NOT explain general topics.
- Keep answers short and relevant.
- If a tool is required → type="tool" and provide toolName.
- If not → type="final" with finalAnswer.
- Do NOT include any keys beyond the contract.
- Do NOT include Thought/Action text.
- Keep finalAnswer natural and user-friendly.
- Be clear, natural, and professional
- Do NOT expose internal reasoning


Available tools:
- bio
- contact
- education
- skills
- projects
- achievements
- portfolio
- interests
- availability
- sports

RULES:
- Use tool if question is about Dhruvik's info
- Use final if general question
- NEVER include extra text outside JSON
`;

// ---------- HELPERS ----------
function safeParse(text: string) {
  try {
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

function clean(text: string) {
  return (text || "").trim();
}



// here add
// ---------- SMART ROUTER ----------
function detectTool(input: string): string | null {
  const text = input.toLowerCase().trim();

  if (text === "@@@@@" || text.includes("who @@@@@@@") || text.includes("@@@@@@@ who")) {
    return "bio";
  }

  // identity / about
  if (
    text.includes("who is @@@@@@@") ||
    text.includes("about @@@@@@@")||
    text === "dhruvik" ||
    text.includes("who @@@@@@@") ||
    text.includes("@@@@@@@ who")
  ) return "bio";

  // contact
  if (
    text.includes("contact") ||
    text.includes("email") ||
    text.includes("reach")
  ) return "contact";

  // skills
  if (
    text.includes("skill") ||
    text.includes("tech") ||
    text.includes("stack")
  ) return "skills";

  // projects
  if (
    text.includes("project") ||
    text.includes("github") ||
    text.includes("work")
  ) return "projects";

  // education
  if (
    text.includes("study") ||
    text.includes("college") ||
    text.includes("education")
  ) return "education";

  // achievements
  if (
    text.includes("achievement") ||
    text.includes("rank") ||
    text.includes("score")
  ) return "achievements";

  // portfolio
  if (text.includes("portfolio") || text.includes("website"))
    return "portfolio";

  // interests
  if (text.includes("interest") || text.includes("hobby"))
    return "interests";

  // sports
  if (text.includes("sport") || text.includes("play"))
    return "sports";

  // availability
  if (
    text.includes("available") ||
    text.includes("free") ||
    text.includes("time")
  ) return "availability";

  
  return null;
}




// ---------- LLM ----------
async function callLLM(messages: Msg[]) {
  const res = await generateText({
    model: groqClient(MODEL_NAME),
    messages,
    temperature: 0.2,
  });

  return clean(res.text || "");
}

// ---------- MAIN ----------
export async function runAgent(userInput: string): Promise<string> {
  const input = clean(userInput);

const forcedTool = detectTool(input);

  if (forcedTool) {
    const toolResult = await runTool(forcedTool, input);

    const final = await callLLM([
      {
        role: "system",
        content: "Convert into a natural answer. Do not mention tools.",
      },
      { role: "user", content: input },
      { role: "assistant", content: toolResult },
    ]);

    return final || toolResult;
  }


  const base: Msg[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: input },
  ];

  let decision: AgentDecision;

  // ---------- STEP 1: DECISION ----------
  try {
    const raw = await callLLM(base);
    const parsed = safeParse(raw);

    if (
      parsed &&
      (parsed.type === "tool" || parsed.type === "final") &&
      (parsed.type !== "tool" || VALID_TOOLS.includes(parsed.toolName))
    ) {
      decision = parsed;
    } else {
      decision = { type: "final" };
    }
  } catch {
    decision = { type: "final" };
  }

  // ---------- STEP 2: FINAL ----------
  if (decision.type === "final") {
    const res = await callLLM([
      {
        role: "system",
        content: "Answer clearly. No JSON. No internal reasoning.",
      },
      { role: "user", content: input },
    ]);

    return res || "Sorry, I couldn't respond.";
  }

  // ---------- STEP 3: TOOL EXECUTION ----------
  let toolResult = "";

  try {
    const tool = decision.toolName;

    if (tool === "bio") {
      toolResult = await runTool("bio", input);
    }else if (tool === "contact") {
      toolResult = await runTool("contact", input);
    } else if (tool === "education") {
      toolResult = await runTool("education", input);
    } else if (tool === "skills") {
      toolResult = await runTool("skills", input);
    } else if (tool === "projects") {
      toolResult = await runTool("projects", input);
    } else if (tool === "achievements") {
      toolResult = await runTool("achievements", input);
    } else if (tool === "portfolio") {
      toolResult = await runTool("portfolio", input);
    } else if (tool === "interests") {
      toolResult = await runTool("interests", input);
    } else if (tool === "availability") {
      toolResult = await runTool("availability", input);
    } else if (tool === "sports") {
      toolResult = await runTool("sports", input);
    } else {
      return await callLLM([
        {
          role: "system",
          content: "Answer clearly. No JSON. No internal reasoning.",
        },
        { role: "user", content: input },
      ]);
    }
  } catch {
    return "Error using tool.";
  }

  // ---------- STEP 4: FINAL RESPONSE ----------
  try {
    const final = await callLLM([
      {
        role: "system",
        content: "Convert into natural answer. Do not mention tools.",
      },
      { role: "user", content: input },
      { role: "assistant", content: toolResult },
    ]);

    return final || toolResult;
  }
  
  catch {
    return toolResult;
  }
}