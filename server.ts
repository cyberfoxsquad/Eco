import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

interface SearchSource {
  title: string;
  uri: string;
}

interface WasteScanResult {
  itemName: string;
  category: "Biodegradable" | "Non-Biodegradable";
  subCategory: string;
  binColorName: string;
  binColorHex: string;
  disposalInstructions: string;
  preparationTip: string;
  estimatedWeightKg: number;
  estimatedPoints: number;
  co2SavedKg: number;
  confidenceScore: number;
  reasoning: string;
  googleGroundingSearchQuery?: string;
  searchSources?: SearchSource[];
}

function resolveFallbackClassification(label?: string): WasteScanResult {
  const normalized = (label || "plastic bottle").toLowerCase();

  if (
    normalized.includes("banana") ||
    normalized.includes("fruit") ||
    normalized.includes("organic") ||
    normalized.includes("food") ||
    normalized.includes("vegetable") ||
    normalized.includes("peel") ||
    normalized.includes("compost")
  ) {
    return {
      itemName: "Organic Kitchen & Fruit Waste",
      category: "Biodegradable",
      subCategory: "Wet Organic Compost",
      binColorName: "Green Bin (Wet/Organic)",
      binColorHex: "#16A34A",
      disposalInstructions: "Dispose directly into the Green Municipal Composting Bin.",
      preparationTip: "Separate any plastic wrappers or stickers before composting.",
      estimatedWeightKg: 0.6,
      estimatedPoints: 60,
      co2SavedKg: 1.5,
      confidenceScore: 0.98,
      reasoning: "Biodegradable organic matter degrades naturally in aerobic composters, saving methane emissions.",
      googleGroundingSearchQuery: "municipal wet waste organic composting segregation",
      searchSources: [
        {
          title: "Municipal Solid Waste Guidelines: Wet Waste & Composting",
          uri: "https://swachhbharatmission.gov.in/waste-segregation",
        },
        {
          title: "National Organic Waste Composting Manual",
          uri: "https://cpcb.nic.in/composting-guidelines",
        },
      ],
    };
  }

  if (
    normalized.includes("battery") ||
    normalized.includes("e-waste") ||
    normalized.includes("phone") ||
    normalized.includes("electronics") ||
    normalized.includes("wire")
  ) {
    return {
      itemName: "Lithium-Ion / Electronic Battery",
      category: "Non-Biodegradable",
      subCategory: "Hazardous E-Waste",
      binColorName: "Red/Amber Bin (Hazardous E-Waste)",
      binColorHex: "#DC2626",
      disposalInstructions: "Never mix with regular dry trash. Hand over at designated E-Waste drop center.",
      preparationTip: "Cover terminals with non-conductive tape to avoid short circuits.",
      estimatedWeightKg: 0.2,
      estimatedPoints: 50,
      co2SavedKg: 0.8,
      confidenceScore: 0.99,
      reasoning: "Lithium cells pose chemical fire risks and require insulated terminal drop-off.",
      googleGroundingSearchQuery: "E-waste management rules battery disposal safety guidelines",
      searchSources: [
        {
          title: "CPCB E-Waste Management & Handling Rules",
          uri: "https://cpcb.nic.in/e-waste-rules",
        },
        {
          title: "Battery Safety and Hazardous Materials Directives",
          uri: "https://epa.gov/recycle/used-lithium-ion-batteries",
        },
      ],
    };
  }

  if (
    normalized.includes("cardboard") ||
    normalized.includes("box") ||
    normalized.includes("paper") ||
    normalized.includes("carton")
  ) {
    return {
      itemName: "Corrugated Cardboard Box",
      category: "Non-Biodegradable",
      subCategory: "Paper & Pulp Recyclable",
      binColorName: "Blue Bin (Dry/Recyclable)",
      binColorHex: "#2563EB",
      disposalInstructions: "Place inside the Blue Dry Waste Bin or bundle for community paper drive.",
      preparationTip: "Flatten the cardboard box and remove packing tape.",
      estimatedWeightKg: 1.2,
      estimatedPoints: 120,
      co2SavedKg: 3.0,
      confidenceScore: 0.97,
      reasoning: "Clean corrugated fiberboard (OCC) has a 93% recycling recovery efficiency when flattened.",
      googleGroundingSearchQuery: "corrugated cardboard recycling standards blue bin",
      searchSources: [
        {
          title: "American Forest & Paper Association Recycling Standards",
          uri: "https://paperrecycling.org/cardboard",
        },
        {
          title: "Municipal Solid Waste Dry Recyclables Framework",
          uri: "https://mohua.gov.in/dry-waste-guidelines",
        },
      ],
    };
  }

  if (
    normalized.includes("can") ||
    normalized.includes("aluminum") ||
    normalized.includes("metal") ||
    normalized.includes("tin")
  ) {
    return {
      itemName: "Aluminum Beverage Can",
      category: "Non-Biodegradable",
      subCategory: "Metal / High-Value Recyclable",
      binColorName: "Blue Bin (Dry/Recyclable)",
      binColorHex: "#2563EB",
      disposalInstructions: "Deposit in the Blue Dry Recyclables Bin for scrap processing.",
      preparationTip: "Rinse residue with water and crush to save bin volume.",
      estimatedWeightKg: 0.4,
      estimatedPoints: 40,
      co2SavedKg: 1.8,
      confidenceScore: 0.96,
      reasoning: "Aluminum requires 95% less energy to recycle into new cans compared to raw bauxite smelting.",
      googleGroundingSearchQuery: "aluminum beverage can recycling energy efficiency blue bin",
      searchSources: [
        {
          title: "Aluminum Association Circularity Assessment",
          uri: "https://aluminum.org/recycling",
        },
      ],
    };
  }

  // Default: PET Plastic Bottle
  return {
    itemName: "Polyethylene Terephthalate (PET #1) Bottle",
    category: "Non-Biodegradable",
    subCategory: "PET Plastic (#1)",
    binColorName: "Blue Bin (Dry/Recyclable)",
    binColorHex: "#2563EB",
    disposalInstructions: "Deposit in the Blue Municipal Dry Recyclables Bin.",
    preparationTip: "Empty liquid contents, rinse with water, crush flat, and replace plastic cap.",
    estimatedWeightKg: 0.5,
    estimatedPoints: 50,
    co2SavedKg: 1.25,
    confidenceScore: 0.98,
    reasoning: "PET resin code #1 is a 100% recyclable thermoplastic suitable for polyester yarn and bottle flake re-pelletizing.",
    googleGroundingSearchQuery: "PET bottle recycling guidelines Blue Bin municipal collection",
    searchSources: [
      {
        title: "Association of Plastic Recyclers (APR) Design Guide",
        uri: "https://plasticsrecycling.org/apr-design-guide",
      },
      {
        title: "Plastic Waste Management Rules (CPCB Standard)",
        uri: "https://cpcb.nic.in/plastic-waste-rules",
      },
    ],
  };
}

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "EcoCollect" });
});

app.post("/api/classify-waste", async (req, res) => {
  const { imageBase64, sampleLabel, mimeType = "image/jpeg" } = req.body;

  const ai = getGemini();

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Return intelligent fallback classification
    const fallback = resolveFallbackClassification(sampleLabel);
    return res.json({ result: fallback, source: "offline-fallback" });
  }

  try {
    const prompt = `You are an expert waste segregation and municipal recycling AI assistant.
Analyze this item carefully. Use Google Search grounding to verify up-to-date municipal recycling regulations, material identification codes (e.g. SPI resin codes #1-#7, hazardous e-waste, composting guidelines), and segregation bin colors.
${sampleLabel ? `Item hint/label: "${sampleLabel}"` : ""}

Respond ONLY with a valid JSON object matching this schema (no markdown fences, just pure JSON):
{
  "itemName": "Specific item name",
  "category": "Biodegradable" or "Non-Biodegradable",
  "subCategory": "e.g. Organic Food Scraps, PET Plastic (#1), HDPE, Corrugated Cardboard, Hazardous E-Waste, Metal / Aluminum, Glass",
  "binColorName": "Green Bin (Wet/Organic)" or "Blue Bin (Dry/Recyclable)" or "Red/Amber Bin (Hazardous E-Waste)",
  "binColorHex": "#16A34A" for green or "#2563EB" for blue or "#DC2626" for red,
  "disposalInstructions": "Clear municipal instruction where and how to dispose",
  "preparationTip": "Clear preparation advice (e.g. rinse residue, crush flat, separate cap, or keep dry)",
  "estimatedWeightKg": 0.5,
  "estimatedPoints": 50,
  "co2SavedKg": 1.25,
  "confidenceScore": 0.98,
  "reasoning": "1-2 sentence explanation citing material recyclability or disposal standards",
  "googleGroundingSearchQuery": "search query used"
}`;

    const contents: Array<any> = [{ text: prompt }];

    if (imageBase64) {
      // Remove data URL prefix if included
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        temperature: 0.2,
        // @ts-ignore Google Search tool
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || "";
    const cleanJson = responseText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const startIdx = cleanJson.indexOf("{");
    const endIdx = cleanJson.lastIndexOf("}");

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const parsed = JSON.parse(cleanJson.substring(startIdx, endIdx + 1));

      // Extract search grounding metadata if present
      const candidates = response.candidates || [];
      const searchSources: SearchSource[] = [];
      const firstCandidate = candidates[0];
      // @ts-ignore
      const grounding = firstCandidate?.groundingMetadata;
      if (grounding?.groundingChunks) {
        for (const chunk of grounding.groundingChunks) {
          if (chunk.web?.uri) {
            searchSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri,
            });
          }
        }
      }

      const isBio =
        parsed.category === "Biodegradable" ||
        (typeof parsed.category === "string" && parsed.category.toLowerCase().includes("bio") && !parsed.category.toLowerCase().includes("non"));

      const result: WasteScanResult = {
        itemName: parsed.itemName || "Classified Waste Item",
        category: isBio ? "Biodegradable" : "Non-Biodegradable",
        subCategory: parsed.subCategory || (isBio ? "Wet Organic Compost" : "PET Plastic (#1)"),
        binColorName: parsed.binColorName || (isBio ? "Green Bin (Wet/Organic)" : "Blue Bin (Dry/Recyclable)"),
        binColorHex: parsed.binColorHex || (isBio ? "#16A34A" : "#2563EB"),
        disposalInstructions: parsed.disposalInstructions || "Deposit into municipal segregated collection.",
        preparationTip: parsed.preparationTip || "Segregate cleanly before drop-off.",
        estimatedWeightKg: Number(parsed.estimatedWeightKg) || 0.5,
        estimatedPoints: Number(parsed.estimatedPoints) || Math.max(10, Math.round((Number(parsed.estimatedWeightKg) || 0.5) * 100)),
        co2SavedKg: Number(parsed.co2SavedKg) || Math.round((Number(parsed.estimatedWeightKg) || 0.5) * 2.5 * 10) / 10,
        confidenceScore: Number(parsed.confidenceScore) || 0.95,
        reasoning: parsed.reasoning || "Verified according to municipal segregation standards.",
        googleGroundingSearchQuery: parsed.googleGroundingSearchQuery || grounding?.webSearchQueries?.[0],
        searchSources: searchSources.length > 0 ? searchSources : undefined,
      };

      return res.json({ result, source: "gemini-api" });
    }

    // If parsing failed, fallback
    const fallback = resolveFallbackClassification(sampleLabel);
    return res.json({ result: fallback, source: "offline-fallback" });
  } catch (err: any) {
    console.error("Gemini classification error:", err);
    const fallback = resolveFallbackClassification(sampleLabel);
    return res.json({ result: fallback, source: "offline-fallback", error: err?.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
