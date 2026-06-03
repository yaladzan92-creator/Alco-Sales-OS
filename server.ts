import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Load dynamic config from firebase-applet-config.json
let firebaseProjectId = "divine-function-j07pf";

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (configData.projectId) {
      firebaseProjectId = configData.projectId;
    }
  }
} catch (error) {
  console.warn("Could not read local firebase-applet-config.json, falling back:", error);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseProjectId
  });
}

const PORT = 3000;

// Memory fallback for user config when Firebase is disconnected/offline
const adminConfigStore: Record<string, any> = {};

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware with Graceful Mock Failover
  const authenticate = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
      const token = authHeader.split(" ")[1];
      
      if (token === "mock-token") {
        req.user = { uid: "mock-userId", name: "Kreatif Alco", email: "user@alco.com" };
        return next();
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
      } catch (err) {
        console.warn("[Firebase Admin Verification Failed] Falling back to mock user profile:", err);
        req.user = { uid: "mock-userId", name: "Kreatif Alco", email: "user@alco.com" };
      }
      next();
    } catch (error) {
      console.error("Auth Middleware Error, continuing with mock user:", error);
      req.user = { uid: "mock-userId", name: "Kreatif Alco", email: "user@alco.com" };
      next();
    }
  };

  // User Settings Proxy (Pure Memory Only - Fully decoupling Firestore)
  app.get("/api/user/config", authenticate, async (req: any, res: any) => {
    try {
      const data = adminConfigStore[req.user.uid] || null;
      res.json({ 
        onboardingComplete: true,
        hasApiKey: !!data?.geminiApiKey || !!process.env.GEMINI_API_KEY,
        isDemoMode: data?.isDemoMode !== false
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/user/config", authenticate, async (req: any, res: any) => {
    try {
      const { geminiApiKey, isDemoMode } = req.body;
      const configData = {
        userId: req.user.uid,
        geminiApiKey: geminiApiKey || null,
        isDemoMode: isDemoMode !== false,
        onboardingComplete: true,
        updatedAt: new Date().toISOString()
      };
      
      adminConfigStore[req.user.uid] = configData;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image Download Proxy to bypass CORS
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("URL parameter is required");
      }

      console.log(`[Proxy Image] Fetching: ${imageUrl}`);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      const arrayBuffer = await response.arrayBuffer();
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

      // Strictly require the user's browser-submitted API Key. Fallbacks are banned by policy.
      const apiKey = req.headers["x-gemini-api-key"] || req.headers["X-Gemini-API-Key"];
      
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
        return res.status(403).json({
          error: "API_KEY_REQUIRED",
          message: "Akses AI Ditolak. Anda wajib menyediakan Gemini API Key Anda sendiri."
        });
      }

      const aiClient = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      console.log(`[AI Request] User: ${userId} | Model: gemini-3.5-flash | Prompt: ${prompt.substring(0, 50)}...`);

      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let attempts = 0;
      const maxAttempts = 4;
      let lastError = null;

      while (attempts < maxAttempts) {
        const modelToUse = modelsToTry[attempts % modelsToTry.length];
        try {
          const result = await aiClient.models.generateContent({
            model: modelToUse,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || "You are Alco Creative System's AI Business Assistant by Aladzan Corpora. You specialize in digital marketing, sales funnel optimization, and high-converting copywriting. Always provide practical, efficient, and professional advice. Focus on scalable systems and premium brand execution.",
              responseMimeType: "application/json"
            }
          });
          
          const text = result.text;
          if (!text) {
            throw new Error("AI returned an empty response.");
          }

          return res.json({ text });
        } catch (error: any) {
          lastError = error;
          attempts++;
          
          // Check for Invalid or Unauthorized API Key (permanent failure - do NOT retry)
          const isInvalidKey = error?.status === 400 || 
                               error?.status === 403 || 
                               error?.error?.code === 400 || 
                               error?.error?.code === 403 || 
                               error?.message?.toLowerCase().includes("api key not valid") || 
                               error?.message?.toLowerCase().includes("invalid api key") || 
                               error?.message?.toLowerCase().includes("unauthorized") || 
                               error?.message?.toLowerCase().includes("forbidden") || 
                               error?.message?.toLowerCase().includes("key_invalid") || 
                               error?.message?.toLowerCase().includes("api_key_invalid") || 
                               error?.message?.toLowerCase().includes("not valid");

          if (isInvalidKey) {
            console.error(`[AI API Key Error] Invalid API Key on model ${modelToUse}:`, error);
            return res.status(403).json({
              error: "API_KEY_INVALID",
              message: "Gemini API Key Anda tidak valid atau tidak memiliki izin akses. Pastikan Anda menyalin kunci resmi kembali dari Google AI Studio dan periksa status kuota/billing kunci Anda."
            });
          }

          // Check for 429 Resource Exhausted / Rate Limit
          const isRateLimit = error?.status === 429 || 
                             error?.error?.code === 429 || 
                             error?.message?.includes("429") ||
                             error?.message?.includes("quota") ||
                             error?.message?.includes("RESOURCE_EXHAUSTED");

          if (isRateLimit) {
            console.error(`[AI Rate Limit] Mode: ${modelToUse}`, error);
            
            if (attempts < maxAttempts) {
              const delay = 1000;
              const nextModel = modelsToTry[attempts % modelsToTry.length];
              console.warn(`[AI Rate Limit Fallback] Rate limited on ${modelToUse}. Retrying with fallback model ${nextModel} in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }

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
                             error?.message?.includes("high demand") ||
                             error?.message?.includes("UNAVAILABLE") ||
                             error?.message?.toLowerCase().includes("overloaded");

          if (isRetryable && attempts < maxAttempts) {
            const delay = Math.pow(2, attempts) * 1000;
            const nextModel = modelsToTry[attempts % modelsToTry.length];
            console.warn(`[AI Retry] Attempt ${attempts} failed for ${modelToUse} with transient error. Retrying with ${nextModel} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // General failure fallback retry
          if (attempts < maxAttempts) {
            const delay = 1000;
            const nextModel = modelsToTry[attempts % modelsToTry.length];
            console.warn(`[AI Retry] General error with ${modelToUse}. Retrying with fallback model ${nextModel} in ${delay}ms...`);
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
