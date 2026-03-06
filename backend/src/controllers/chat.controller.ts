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
  // Groq already returns well-formatted text, so minimal cleaning needed
  let cleaned = text
    .trim();

  // Only fix multiple spaces to single spaces
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned;
}

/* ===============================
   STREAM CHAT
================================ */

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = req.body.message;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const systemPrompt = buildSystemPrompt();

    // Check for GROQ API key
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not set");
      return res.status(500).json({
        success: false,
        message: "AI service not configured. Please contact support.",
      });
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 400,
      top_p: 0.8,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });

    let fullResponse = "";

    // Collect all chunks
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }

    if (!fullResponse.trim()) {
      return res.status(500).json({
        success: false,
        message: "Failed to get response from AI service",
      });
    }

    // Clean the response
    const cleanedResponse = cleanAndFormatResponse(fullResponse);

    // Save chat to database
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

    // Return JSON response
    return res.status(200).json({
      success: true,
      data: {
        message,
        response: cleanedResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("CHAT ERROR:", error);
    const errorMessage =
      error.status === 429
        ? "Rate limited. Please wait before trying again."
        : error.message?.includes("API key")
        ? "AI service authentication failed"
        : "Failed to process your request. Please try again.";

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
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
