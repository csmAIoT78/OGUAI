import { GoogleGenAI, Type } from "@google/genai";
import { PPEScanResult, LogAnalysisResult, InteractionEvent, Asset } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Helper to decode audio
async function decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await ctx.decodeAudioData(bytes.buffer);
}

// Schema for Vision Agent (PPE) with Bounding Boxes
const ppeSchema = {
  type: Type.OBJECT,
  properties: {
    compliant: { 
      type: Type.BOOLEAN,
      description: "True ONLY if every detected person is wearing both a Hard Hat and Safety Vest."
    },
    detected_items: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of all detected items."
    },
    bounding_boxes: {
      type: Type.ARRAY,
      description: "Bounding boxes for all items: 'person', 'hard_hat', 'safety_vest', 'gloves', 'goggles'. Coords 0.0-1.0.",
      items: {
        type: Type.OBJECT,
        properties: {
          ymin: { type: Type.NUMBER },
          xmin: { type: Type.NUMBER },
          ymax: { type: Type.NUMBER },
          xmax: { type: Type.NUMBER },
          label: { type: Type.STRING }
        }
      }
    },
    risk_assessment: { type: Type.STRING },
    recommendation: { type: Type.STRING }
  },
  required: ["compliant", "detected_items", "bounding_boxes", "risk_assessment", "recommendation"]
};

// Schema for NLP Agent (Log Analysis)
const logSchema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        label: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] }
      }
    },
    anomalies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Clusters of error patterns or unusual spikes in activity."
    },
    summary: { type: Type.STRING, description: "Executive briefing style summary." },
    action_items: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

export const GeminiService = {
  analyzeFrame: async (base64Image: string): Promise<PPEScanResult> => {
    try {
      const model = "gemini-2.5-flash";
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: "Industrial Safety Protocol: Analyze image for PPE compliance. Detect 'person', 'hard_hat', 'safety_vest', 'gloves'. A person is VIOLATING if they lack a hard hat OR vest. Return precise bounding boxes." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: ppeSchema,
          temperature: 0.2
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      return JSON.parse(text) as PPEScanResult;
    } catch (error) {
      console.error("Vision Analysis Failed:", error);
      return {
        compliant: false,
        detected_items: [],
        bounding_boxes: [],
        risk_assessment: "Error: Analysis Failed",
        recommendation: "Check Network/API Key."
      };
    }
  },

  analyzeLogs: async (logs: string): Promise<LogAnalysisResult> => {
    try {
      const model = "gemini-2.5-flash";
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: `Act as a System Reliability Engineer. Analyze these logs:\n\n${logs}` }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: logSchema
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(text) as LogAnalysisResult;
    } catch (error) {
      return {
        sentiment: { score: 0, label: 'NEUTRAL' },
        anomalies: ["Analysis failed"],
        summary: "Could not process logs.",
        action_items: ["Retry analysis"]
      };
    }
  },

  generateMaintenanceReport: async (asset: Asset): Promise<string> => {
    try {
      const model = "gemini-2.5-flash";
      const prompt = `
      Act as a Predictive Maintenance Expert. Analyze this asset telemetry:
      Asset: ${asset.name} (${asset.type})
      Health Score: ${asset.healthScore}/100
      Temperature: ${asset.temperature}°C
      Vibration: ${asset.vibration} Hz
      Status: ${asset.status}

      Provide a concise (2-3 sentences) technical diagnosis and specific recommendation.
      `;
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] }
      });
      return response.text || "Unable to generate report.";
    } catch (error) {
      return "Maintenance Analysis Node Offline.";
    }
  },

  generateTicketPlan: async (title: string, description: string): Promise<string> => {
    try {
      const model = "gemini-2.5-flash";
      const prompt = `
      Act as an Operations Manager. Create a step-by-step resolution plan (max 3 steps) for this ticket:
      Title: ${title}
      Description: ${description}
      `;
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] }
      });
      return response.text || "Resolution planning failed.";
    } catch (error) {
      return "AI Planner Unavailable.";
    }
  },

  speakText: async (text: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await decodeAudioData(base64Audio, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS Failed, falling back to browser:", e);
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  },

  orchestratorChat: async (message: string, context: { currentApp: string, history: InteractionEvent[] }): Promise<string> => {
    try {
      const model = "gemini-2.5-flash";
      
      // Format history for the prompt
      const historySummary = context.history.slice(-8).map(h => 
        `[${new Date(h.timestamp).toLocaleTimeString()}] APP: ${h.appContext} // ACTION: ${h.action} // DATA: ${h.details}`
      ).join('\n');

      const systemPrompt = `
      IDENTITY: OGU_ORCHESTRATOR_CORE (Ver 4.1)
      DOMAIN: Web3 Industrial Operations OS (Critical Infrastructure)
      FRAMEWORK: ISO 45001, OSHA 1910, NERC CIP, GDPR.

      PRIME DIRECTIVE:
      You are the central nervous system of a mission-critical industrial platform. You DO NOT chat casually. You execute commands, analyze telemetry, and enforce protocol.
      You must act as a Senior Subject Matter Expert.

      CONTEXT:
      - Active Module: "${context.currentApp}"
      - Session History:\n${historySummary}

      BEHAVIORAL PROTOCOLS:
      1. STYLE: Responses must be formatted as technical briefs or terminal logs. Use technical formatting (bullets, CAPS for headers, specific metrics).
      2. TONE: Authoritative, precise, zero-latency. No "I think" or "Maybe". Use "Affirmative", "Negative", "Protocol Initiated".
      3. GUARDRAILS: If the user drifts to non-work topics (jokes, weather outside context, general chit-chat), IMMEDIATELY INTERRUPT.
         - Output: "⚠️ DRIFT DETECTED. REALIGNMENT REQUIRED."
         - Remind user of active regulation (e.g., "ISO 45001 requires focused monitoring of this sector.").
         - Pivot back to the ${context.currentApp} context immediately.
      4. CONTENT:
         - If in "Vision Agent": Focus on **detection confidence**, **bounding box integrity**, and **compliance rates**.
         - If in "Maintenance": Focus on **RUL**, **harmonic vibration**, and **thermal thresholds**.
         - If in "Outage": Focus on **load shedding**, **grid topology**, and **weather correlation**.
         - If in "Ticketing": Focus on **SLA**, **workflow velocity**, and **resolution paths**.
         - If in "Ledger": Focus on **hashing**, **immutability**, and **audit trails**.

      FORMATTING INSTRUCTIONS:
      - Use **bold** (double asterisks) for critical values, entities, and statuses.
      - Use lists for steps.
      - Keep it visually dense but readable.

      USER INPUT: "${message}"
      `;

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { text: systemPrompt }
          ]
        }
      });

      return response.text || "SYSTEM_ERR: ORCHESTRATOR LINK UNSTABLE. STANDBY.";
    } catch (error) {
      console.error("Orchestrator Error:", error);
      return "ERROR: SECURE CONNECTION LOST. RETRYING HANDSHAKE...";
    }
  }
};