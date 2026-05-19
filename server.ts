import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "divine-function-j07pf"
  });
}

const db = getFirestore("ai-studio-2f7f0cc9-7462-47bf-bddf-7237ccbb2d17");
const PORT = 3000;
const CONFIG_COLLECTION = "settings";
const CONFIG_DOC = "config";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_VALIDATION_MODEL = process.env.GEMINI_VALIDATION_MODEL || GEMINI_MODEL;
const SENSITIVE_CONFIG_KEYS = new Set(["developerPassword", "rebrandingPassword"]);

function sanitizeConfig(config: Record<string, any> = {}) {
  return Object.fromEntries(
    Object.entries(config)
      .filter(([key]) => !SENSITIVE_CONFIG_KEYS.has(key))
      .map(([key, value]) => [
        key,
        value && typeof value === "object" && !Array.isArray(value) ? sanitizeConfig(value) : value
      ])
  );
}

function validateConfigAccess(req: any, mode: "developer" | "rebrand") {
  const password = req.headers["x-config-password"];
  const expected = mode === "developer" ? process.env.DEVELOPER_PASSWORD : process.env.REBRANDING_PASSWORD;
  return typeof password === "string" && Boolean(expected) && password === expected;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticate = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // User Settings Proxy
  app.get("/api/user/config", authenticate, async (req: any, res: any) => {
    try {
      const doc = await db.collection("userSettings").doc(req.user.uid).get();
      if (!doc.exists) {
        return res.json({ onboardingComplete: false });
      }
      const data = doc.data();
      res.json({ 
        onboardingComplete: data?.onboardingComplete || false,
        hasApiKey: !!data?.geminiApiKey,
        isDemoMode: data?.isDemoMode || false
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/user/config", authenticate, async (req: any, res: any) => {
    try {
      const { geminiApiKey, onboardingComplete } = req.body;
      if (!geminiApiKey) {
        return res.status(400).json({
          error: "PERSONAL_API_KEY_REQUIRED",
          message: "Setiap user wajib memasukkan Gemini API key dari Google AI Studio milik akunnya sendiri."
        });
      }
      
      // Validate API Key if provided
      try {
        const genAI = new GoogleGenAI({ 
          apiKey: geminiApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        
        await genAI.models.generateContent({
          model: GEMINI_VALIDATION_MODEL, 
          contents: "hi"
        });
      } catch (e: any) {
        const errorMessage = e.message || "";
        console.error("API Key Validation Failed Detail:", errorMessage);
        return res.status(400).json({ 
          error: "GEMINI_API_KEY_VALIDATION_FAILED",
          message: "API key tidak bisa digunakan untuk Gemini API. Pastikan key dibuat dari Google AI Studio pada akun Google user tersebut, dan kuota/free tier project masih aktif.",
          details: errorMessage
        });
      }

      await db.collection("userSettings").doc(req.user.uid).set({
        userId: req.user.uid,
        geminiApiKey,
        isDemoMode: false,
        onboardingComplete: !!onboardingComplete,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/app-config", async (_req, res) => {
    try {
      const doc = await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).get();
      res.json(doc.exists ? sanitizeConfig(doc.data()) : {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/app-config/verify", authenticate, async (req: any, res: any) => {
    const mode = req.body?.accessLevel === "branding" ? "rebrand" : "developer";
    if (!validateConfigAccess(req, mode)) {
      return res.status(403).json({ error: "CONFIG_ACCESS_DENIED" });
    }
    res.json({ success: true });
  });

  app.post("/api/app-config", authenticate, async (req: any, res: any) => {
    try {
      const mode = req.body?.accessLevel === "branding" ? "rebrand" : "developer";
      if (!validateConfigAccess(req, mode)) {
        return res.status(403).json({ error: "CONFIG_ACCESS_DENIED" });
      }

      const incoming = sanitizeConfig(req.body?.config || {});
      await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).set({
        ...incoming,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.uid
      }, { merge: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image Download Proxy to bypass CORS
  app.get("/api/proxy-image", authenticate, async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("URL parameter is required");
      }

      const parsed = new URL(imageUrl);
      const allowedHosts = ["image.pollinations.ai", "oaidalleapiprodscus.blob.core.windows.net"];
      if (!["https:"].includes(parsed.protocol) || !allowedHosts.includes(parsed.hostname)) {
        return res.status(400).send("Image host is not allowed");
      }

      console.log(`[Proxy Image] Fetching: ${imageUrl}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.startsWith("image/")) {
        return res.status(400).send("URL did not return an image");
      }
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > 8 * 1024 * 1024) {
        return res.status(413).send("Image is too large");
      }
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error: any) {
      console.error("Proxy Image Error:", error);
      res.status(500).send(error.message);
    }
  });

  // Gemini API Proxy
  app.post("/api/ai/generate", authenticate, async (req: any, res: any) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const userId = req.user.uid;

      // Check for User's private API Key
      const userSettingsDoc = await db.collection("userSettings").doc(userId).get();
      const userSettings = userSettingsDoc.exists ? userSettingsDoc.data() : null;
      
      const apiKey = userSettings?.geminiApiKey;
      if (!apiKey) {
        return res.status(403).json({ 
          error: "AI_REQUIRED", 
          message: "AI Connection not found. Please complete onboarding with your own Google AI Studio Gemini API key." 
        });
      }

      // Lazy init with the chosen API Key
      const aiClient = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      console.log(`[AI Request] User: ${userId} | PRIVATE_USER_KEY | Prompt: ${prompt.substring(0, 50)}...`);

      // Retry mechanism for 503 errors
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const response = await aiClient.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || "You are Alco Creative System's AI Business Assistant by Aladzan Corpora. You specialize in digital marketing, sales funnel optimization, and high-converting copywriting. Always provide practical, efficient, and professional advice. Focus on scalable systems and premium brand execution.",
              responseMimeType: "application/json"
            }
          });
          
          if (!response.text) {
            throw new Error("AI returned an empty response.");
          }

          return res.json({ text: response.text });
        } catch (error: any) {
          lastError = error;
          attempts++;
          
          // Check for 429 Resource Exhausted / Rate Limit
          const isRateLimit = error?.status === 429 || 
                             error?.error?.code === 429 || 
                             error?.message?.includes("429") ||
                             error?.message?.includes("quota") ||
                             error?.message?.includes("RESOURCE_EXHAUSTED");

          if (isRateLimit) {
            console.error("[AI Rate Limit]", error);
            
            // Try to find retry delay in Google RPC details
            let retryAfter = "someday";
            if (error?.error?.details) {
              const retryInfo = error.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
              if (retryInfo?.retryDelay) {
                retryAfter = retryInfo.retryDelay;
              }
            }

            return res.status(429).json({ 
              error: "AI Quota Exceeded", 
              message: `You have exceeded your daily Gemini API quota. Please try again after ${retryAfter}.`,
              details: error.message,
              retryAfter
            });
          }

          // Check if it's a 503 error or other transient error
          const isRetryable = error?.message?.includes("503") || 
                             error?.status === 503 ||
                             error?.error?.code === 503 ||
                             error?.message?.includes("high demand");

          if (isRetryable && attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 1000;
            console.warn(`[AI Retry] Attempt ${attempts} failed with 503. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          break; // Not retryable or max attempts reached
        }
      }

      throw lastError;
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during AI generation." });
    }
  });

  // Since I need to use the exact patterns from skill
  app.post("/api/ai/stream", async (req, res) => {
    // For streaming if needed
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Cleanup removed global ai definition
startServer().catch(console.error);
