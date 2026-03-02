import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/* ===============================
   SYSTEM PROMPT - CLEAN & DIRECT
================================ */

const buildSystemPrompt = () => {
  return `You are a helpful men's health advisor. Keep responses clear and well-formatted.

Your response MUST follow this format EXACTLY:

[Opening sentence with main answer]

[Detailed explanation - can be multiple sentences]

[Key actionable tips with line breaks between each]

[Closing encouragement]

CRITICAL: Use proper punctuation and spaces. Write like normal conversation.
- Do NOT write "sleepqualityis" - write "Sleep quality is"
- Do NOT bunch words together
- Write: "Go to bed at the same time daily." NOT "Gotobedasthesametim..."
- Use periods to end sentences. Add blank lines between ideas.
- Keep under 200 words.`;
};

/* ========================
   FUNCTION: Clean response
======================== */

function cleanAndFormatResponse(text: string): string {
  let cleaned = text;

  // Step 1: Fix basic case transitions
  cleaned = cleaned
    .replace(/([a-z])([A-Z])/g, "$1 $2")  // camelCase -> camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")  // HTMLParser -> HTML Parser
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")  // text123 -> text 123
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2");  // 123text -> 123 text

  // Step 2: Fix MASSIVE bunching issue - insert spaces between words that got joined
  // Common patterns where words are bunched together
  const wordBunches = [
    // Sleep related
    /improving/gi, /sleep/gi, /quality/gi, /establish/gi, /bedtime/gi,
    /routine/gi, /bedroom/gi, /comfortable/gi, /environment/gi,
    /avoid/gi, /caffeine/gi, /exercise/gi, /regular/gi, /schedule/gi,
    /stress/gi, /relaxation/gi, /meditation/gi, /breathing/gi,
    // Common words that get bunched
    /daily/gi, /every/gi, /morning/gi, /evening/gi, /night/gi,
    /week/gi, /month/gi, /year/gi, /minutes/gi, /hours/gi,
    /start/gi, /begin/gi, /continue/gi, /maintain/gi, /improve/gi,
    /increase/gi, /decrease/gi, /reduce/gi, /build/gi, /develop/gi,
    /health/gi, /fitness/gi, /wellness/gi, /energy/gi, /strength/gi,
  ];

  // Add spaces before common words if they're bunched
  cleaned = cleaned
    .replace(/([a-z])(improving)/gi, "$1 $2")
    .replace(/([a-z])(sleep)/gi, "$1 $2")
    .replace(/([a-z])(quality)/gi, "$1 $2")
    .replace(/([a-z])(establish)/gi, "$1 $2")
    .replace(/([a-z])(bedtime)/gi, "$1 $2")
    .replace(/([a-z])(routine)/gi, "$1 $2")
    .replace(/([a-z])(bedroom)/gi, "$1 $2")
    .replace(/([a-z])(comfortable)/gi, "$1 $2")
    .replace(/([a-z])(environment)/gi, "$1 $2")
    .replace(/([a-z])(avoid)/gi, "$1 $2")
    .replace(/([a-z])(caffeine)/gi, "$1 $2")
    .replace(/([a-z])(exercise)/gi, "$1 $2")
    .replace(/([a-z])(regular)/gi, "$1 $2")
    .replace(/([a-z])(schedule)/gi, "$1 $2")
    .replace(/([a-z])(stress)/gi, "$1 $2")
    .replace(/([a-z])(relaxation)/gi, "$1 $2")
    .replace(/([a-z])(meditation)/gi, "$1 $2")
    .replace(/([a-z])(breathing)/gi, "$1 $2")
    .replace(/([a-z])(daily)/gi, "$1 $2")
    .replace(/([a-z])(every)/gi, "$1 $2")
    .replace(/([a-z])(morning)/gi, "$1 $2")
    .replace(/([a-z])(evening)/gi, "$1 $2")
    .replace(/([a-z])(night)/gi, "$1 $2")
    .replace(/([a-z])(week)/gi, "$1 $2")
    .replace(/([a-z])(month)/gi, "$1 $2")
    .replace(/([a-z])(year)/gi, "$1 $2")
    .replace(/([a-z])(minutes)/gi, "$1 $2")
    .replace(/([a-z])(hours)/gi, "$1 $2")
    .replace(/([a-z])(start)/gi, "$1 $2")
    .replace(/([a-z])(begin)/gi, "$1 $2")
    .replace(/([a-z])(continue)/gi, "$1 $2")
    .replace(/([a-z])(maintain)/gi, "$1 $2")
    .replace(/([a-z])(improve)/gi, "$1 $2")
    .replace(/([a-z])(increase)/gi, "$1 $2")
    .replace(/([a-z])(decrease)/gi, "$1 $2")
    .replace(/([a-z])(reduce)/gi, "$1 $2")
    .replace(/([a-z])(build)/gi, "$1 $2")
    .replace(/([a-z])(develop)/gi, "$1 $2")
    .replace(/([a-z])(health)/gi, "$1 $2")
    .replace(/([a-z])(fitness)/gi, "$1 $2")
    .replace(/([a-z])(wellness)/gi, "$1 $2")
    .replace(/([a-z])(energy)/gi, "$1 $2")
    .replace(/([a-z])(strength)/gi, "$1 $2")
    // Articles and prepositions
    .replace(/([a-z])(and)/gi, "$1 $2")
    .replace(/([a-z])(or)/gi, "$1 $2")
    .replace(/([a-z])(the)/gi, "$1 $2")
    .replace(/([a-z])(a )/gi, "$1 $2")
    .replace(/([a-z])(an )/gi, "$1 $2")
    .replace(/([a-z])(in)/gi, "$1 $2")
    .replace(/([a-z])(on)/gi, "$1 $2")
    .replace(/([a-z])(at)/gi, "$1 $2")
    .replace(/([a-z])(to)/gi, "$1 $2")
    .replace(/([a-z])(for)/gi, "$1 $2")
    .replace(/([a-z])(with)/gi, "$1 $2")
    .replace(/([a-z])(by)/gi, "$1 $2")
    .replace(/([a-z])(from)/gi, "$1 $2")
    .replace(/([a-z])(your)/gi, "$1 $2")
    .replace(/([a-z])(you)/gi, "$1 $2")
    .replace(/([a-z])(is)/gi, "$1 $2")
    .replace(/([a-z])(are)/gi, "$1 $2")
    .replace(/([a-z])(was)/gi, "$1 $2")
    .replace(/([a-z])(were)/gi, "$1 $2")
    .replace(/([a-z])(can)/gi, "$1 $2")
    .replace(/([a-z])(will)/gi, "$1 $2")
    .replace(/([a-z])(should)/gi, "$1 $2")
    .replace(/([a-z])(help)/gi, "$1 $2")
    .replace(/([a-z])(makes)/gi, "$1 $2")
    .replace(/([a-z])(doing)/gi, "$1 $2")
    .replace(/([a-z])(getting)/gi, "$1 $2")
    .replace(/([a-z])(better)/gi, "$1 $2");

  // Step 3: Add proper line breaks after periods and dashes
  cleaned = cleaned
    .replace(/\.\s+(?=[A-Z])/g, ".\n\n")  // Period followed by capital = new paragraph
    .replace(/-\s+/g, "\n- ");  // Dashes become bullet points with line breaks

  // Step 4: Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ");  // Multiple spaces -> single space

  return cleaned.trim();
}

/* ===============================
   STREAM CHAT
================================ */

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const message = req.body.message;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    /* SET STREAM HEADERS */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const systemPrompt = buildSystemPrompt();

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      temperature: 0.3,  // Very low for consistency
      max_tokens: 400,
      top_p: 0.8,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });

    let fullResponse = "";

    // STEP 1: Collect all chunks first
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }

    // STEP 2: Clean the ENTIRE response
    const cleanedResponse = cleanAndFormatResponse(fullResponse);

    // STEP 3: Stream the cleaned response to frontend in chunks (every 10 chars for smooth display)
    const chunkSize = 10;
    for (let i = 0; i < cleanedResponse.length; i += chunkSize) {
      const chunk = cleanedResponse.slice(i, i + chunkSize);
      res.write(`data: ${chunk}\n\n`);
    }

    // Save chat to database with cleaned response
    try {
      await prisma.chatLog.create({
        data: {
          userId: req.user.userId,
          message,
          response: cleanedResponse,
        },
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
    }

    // Send completion signal
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.write(
      `data: Sorry, I couldn't process that. Please try again.\n\n`
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
};

/* ===============================
   CHAT HISTORY
================================ */

export const getChatHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const history = await prisma.chatLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    res.json({
      success: true,
      data: history.reverse(),
    });
  } catch (error) {
    console.error("HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};
