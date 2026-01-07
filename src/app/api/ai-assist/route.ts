import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// --- 0. EDGE RUNTIME ---
export const runtime = 'edge';

// --- 1. CONFIGURATION ---
const TIMEOUT_MS = 4000;

// Removed Persona logic as requested. 
// Using a generic system instruction for stability.
const SYSTEM_INSTRUCTION = `
  CONSTRAINT: Be concise.
  ROLE: You are a helpful AI assistant integrated into a data platform.
`;

interface Message {
  role: string;
  text: string;
}

// --- UTILITY: TIMEOUT & DELAY ---

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

// --- PROVIDERS ---

// A. GROQ (Speed Layer)
async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No Groq Key");

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
    temperature: 0.7
  });
  return completion.choices[0]?.message?.content || "";
}

// B. CEREBRAS (Fast Layer)
async function callCerebras(prompt: string) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error("No Cerebras Key");

  const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3.1-8b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    })
  });
  if (!response.ok) throw new Error("Cerebras Error");
  const data = await response.json();
  return data.choices[0].message.content;
}

// C. UNIFIED CALLER
async function callProvider(provider: string, history: Message[]) {
  // Construct a prompt from history
  const conversation = history.map((m) => `${m.role === 'user' ? 'USER' : 'YOU'}: ${m.text}`).join('\n');
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nCONVERSATION:\n${conversation}\n\nREPLY:`;

  if (provider === 'groq') return await callGroq(fullPrompt);
  if (provider === 'cerebras') return await callCerebras(fullPrompt);

  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  if (provider === 'openrouter') {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: { "HTTP-Referer": "https://ezz-platform.com" },
    });
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{ role: "user", content: fullPrompt }],
    });
    return completion.choices[0].message.content || "";
  }

  if (provider === 'huggingface') {
    const token = process.env.HUGGING_FACE_TOKEN;
    if (!token) throw new Error("No HF Token");
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: fullPrompt, parameters: { max_new_tokens: 150, return_full_text: false } })
      }
    );
    if (!response.ok) throw new Error("HF Error");
    const res = await response.json();
    return Array.isArray(res) ? res[0].generated_text : "";
  }

  // Pollinations
  const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;
  const res = await fetch(url);
  return await res.text();
}

// --- MAIN HANDLER ---
export async function POST(req: Request) {
  try {
    const { history, overridePrompt } = await req.json();
    const recentHistory: Message[] = history ? history.slice(-6) : [];

    let responseText = "";

    // Inject system override if present (Incoming Transmission)
    if (overridePrompt) {
      recentHistory.push({ role: 'user', text: `[SYSTEM_INSTRUCTION]: ${overridePrompt}` });
    }

    // THE WATERFALL
    try {
      // 1. Groq
      responseText = await withTimeout(callProvider('groq', recentHistory), TIMEOUT_MS);
    } catch {
      try {
        // 2. Gemini
        responseText = await withTimeout(callProvider('gemini', recentHistory), TIMEOUT_MS);
      } catch {
        try {
          // 3. Cerebras
          responseText = await withTimeout(callProvider('cerebras', recentHistory), TIMEOUT_MS);
        } catch {
          try {
            // 4. OpenRouter
            responseText = await withTimeout(callProvider('openrouter', recentHistory), TIMEOUT_MS);
          } catch {
            try {
              // 5. Hugging Face
              responseText = await withTimeout(callProvider('huggingface', recentHistory), TIMEOUT_MS);
            } catch {
              // 6. Pollinations (Fail-safe)
              responseText = await callProvider('pollinations', recentHistory);
            }
          }
        }
      }
    }

    return NextResponse.json({ reply: responseText });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return NextResponse.json({ reply: ">> OFFLINE." }, { status: 500 });
  }
}