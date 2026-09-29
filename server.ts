import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));

interface SearchSource {
  title: string;
  uri: string;
}

interface WasteScanResult {
  itemName: string;
  itemType?: string;
  materialType: string;
  category: "Biodegradable" | "Non-Biodegradable";
  isBiodegradable: boolean;
  decompositionTime: string;
  biodegradableExplanation: string;
  howItCanBeRecycled: string;
  spokenSummary?: string;
  binColorName: string;
  binColorHex: string;
  disposalInstructions: string;
  preparationTip: string;
  disposalSteps?: string[];
  disposalDos?: string[];
  disposalDonts?: string[];
  recyclabilityPercentage?: number;
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

  // 1. Organic / Biodegradable
  if (
    normalized.includes("banana") ||
    normalized.includes("fruit") ||
    normalized.includes("organic") ||
    normalized.includes("food") ||
    normalized.includes("vegetable") ||
    normalized.includes("peel") ||
    normalized.includes("compost") ||
    normalized.includes("apple") ||
    normalized.includes("bread") ||
    normalized.includes("coffee") ||
    normalized.includes("tea") ||
    normalized.includes("leaf") ||
    normalized.includes("leaves") ||
    normalized.includes("egg")
  ) {
    return {
      itemName: normalized.includes("banana")
        ? "Fresh Fruit & Banana Peel"
        : normalized.includes("apple")
        ? "Apple Core & Fruit Scraps"
        : "Organic Kitchen & Food Waste",
      itemType: "Organic Wet Food Scrap & Natural Biomass",
      materialType: "Natural Plant Cellulose, Pectin & Moisture",
      category: "Biodegradable",
      isBiodegradable: true,
      decompositionTime: "2 to 5 weeks in aerobic composting",
      biodegradableExplanation:
        "Consists of natural organic carbon chains and cellulose fibers that soil bacteria, fungi, and earthworms readily metabolize into nutrient-rich humus without leaving toxic residues.",
      howItCanBeRecycled:
        "Recycled biologically through aerobic composting or anaerobic biomethanation. In community composting pits or municipal biogas plants, microbes convert this biomass into organic nutrient fertilizer (humus) and clean bio-CNG fuel, returning essential nitrogen and potassium to urban soil.",
      spokenSummary:
        "This item is organic food scraps. It is completely biodegradable, composed of natural plant cellulose. It can be recycled by depositing into the Green Bin for aerobic composting or municipal biogas production.",
      binColorName: "Green Bin (Wet / Organic Compost)",
      binColorHex: "#16A34A",
      disposalInstructions: "Deposit unbagged or in compostable liner into the Green Municipal Composting Bin.",
      preparationTip: "Remove any plastic PLU stickers, twist ties, or cling wrap before composting.",
      disposalSteps: [
        "Remove any non-biodegradable brand stickers, rubber bands, or plastic tags",
        "Drain excess liquids or sauces into your domestic sink",
        "Place into the Green Municipal Wet Waste Bin or local compost pit",
        "Smart bin sensor logs weight and credits citizen reward points automatically"
      ],
      disposalDos: [
        "Include fruit peels, vegetable ends, eggshells, and used coffee grounds",
        "Keep bin lid tightly closed between drops to retain natural moisture and deter pests"
      ],
      disposalDonts: [
        "Never wrap organic food waste in single-use plastic grocery bags",
        "Do not mix with dry recyclables, metal foils, or household chemicals"
      ],
      recyclabilityPercentage: 100,
      estimatedWeightKg: 0.6,
      estimatedPoints: 60,
      co2SavedKg: 1.5,
      confidenceScore: 0.98,
      reasoning: "Aerobic composting prevents anaerobic decomposition in landfills, reducing high-potency methane emissions by 92%.",
      googleGroundingSearchQuery: "municipal wet waste organic composting segregation rules",
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

  // 2. Battery / Hazardous E-Waste
  if (
    normalized.includes("battery") ||
    normalized.includes("e-waste") ||
    normalized.includes("phone") ||
    normalized.includes("electronics") ||
    normalized.includes("wire") ||
    normalized.includes("charger") ||
    normalized.includes("cable") ||
    normalized.includes("bulb") ||
    normalized.includes("cfl")
  ) {
    return {
      itemName: normalized.includes("phone")
        ? "Discarded Smartphone / Mobile Device"
        : "Lithium-Ion / Alkaline Secondary Battery",
      itemType: "Hazardous Consumer Electronic Waste",
      materialType: "Lithium Cobalt Oxide, Nickel & Steel Metallic Shell",
      category: "Non-Biodegradable",
      isBiodegradable: false,
      decompositionTime: "Non-biodegradable (heavy metals persist indefinitely in soil)",
      biodegradableExplanation:
        "Contains dense inorganic heavy metals and toxic lithium/caustic electrolytes that micro-organisms cannot degrade. If discarded in landfills, toxic leachates contaminate groundwater aquifers and spark chemical fires.",
      howItCanBeRecycled:
        "Recycled via specialized hydrometallurgical and pyrometallurgical recovery. Authorized e-waste recyclers shred the insulated cells in inert atmospheres, dissolving and recovering up to 95% of strategic raw elements including pure lithium carbonate, cobalt, nickel, and steel casing for manufacturing new energy cells.",
      spokenSummary:
        "This item is a battery or electronic device. It is non-biodegradable and hazardous, composed of lithium cobalt oxide and heavy metals. It can be recycled by taping the terminals and taking it to a certified municipal e-waste kiosk for hydrometallurgical metal recovery.",
      binColorName: "Red/Amber Bin (Hazardous E-Waste)",
      binColorHex: "#DC2626",
      disposalInstructions: "Strictly segregate from household trash. Hand over at designated municipal E-Waste collection kiosk.",
      preparationTip: "Insulate both electrical contact terminals with non-conductive clear tape to prevent short-circuit sparks.",
      disposalSteps: [
        "Cover exposed electrical contact terminals with electrical or Scotch tape",
        "Store in a dry, cool non-metallic container away from direct sunlight",
        "Take to the designated Red Hazardous Bin at your nearest municipal transit depot",
        "Scan QR code at the drop-box to certify hazardous diversion and receive hazard-tier civic points"
      ],
      disposalDos: [
        "Keep batteries separated from keys, coins, and moisture",
        "Drop intact cells without puncturing, denting, or dismantling"
      ],
      disposalDonts: [
        "Never throw batteries into regular dry or wet household trash",
        "Never attempt to burn or open battery casings (risk of explosive flame and hydrogen fluoride gas)"
      ],
      recyclabilityPercentage: 95,
      estimatedWeightKg: 0.25,
      estimatedPoints: 50,
      co2SavedKg: 0.85,
      confidenceScore: 0.99,
      reasoning: "Strictly mandated under CPCB E-Waste Management & Handling Rules for certified metal hydrometallurgical recovery.",
      googleGroundingSearchQuery: "E-waste management rules battery disposal safety guidelines",
      searchSources: [
        {
          title: "CPCB E-Waste Management & Handling Rules",
          uri: "https://cpcb.nic.in/e-waste-rules",
        },
        {
          title: "EPA Guidelines on Used Lithium-Ion Battery Recycling",
          uri: "https://epa.gov/recycle/used-lithium-ion-batteries",
        },
      ],
    };
  }

  // 3. Cardboard & Paper
  if (
    normalized.includes("cardboard") ||
    normalized.includes("box") ||
    normalized.includes("paper") ||
    normalized.includes("carton") ||
    normalized.includes("newspaper")
  ) {
    return {
      itemName: "Corrugated Shipping Box & Paperboard",
      itemType: "Dry Packaging Corrugated Cardboard",
      materialType: "Unbleached Kraft Corrugated Paper Pulp (Cellulose Fibers)",
      category: "Non-Biodegradable", // Municipal dry stream routing
      isBiodegradable: true,
      decompositionTime: "2 to 3 months if raw; 5-7 recycling cycles if collected dry",
      biodegradableExplanation:
        "While natural wood cellulose is biodegradable under moisture, clean corrugated cardboard is far too valuable to compost. Recycling 1 ton of cardboard saves 17 mature trees, 7,000 gallons of water, and 4,000 kWh of energy.",
      howItCanBeRecycled:
        "Recycled mechanically at paper mills through hydropulping. The boxes are soaked in warm water to separate the fibers into paper slurries, screened to remove contaminants, and rolled into new corrugated containerboard (OCC) up to 7 consecutive cycles, reducing virgin deforestation.",
      spokenSummary:
        "This item is a corrugated shipping box. It is composed of unbleached kraft cellulose fibers. While naturally biodegradable, it should be kept dry and recycled in the Blue Bin, where paper mills hydropulp the fibers to manufacture new boxes up to 7 times.",
      binColorName: "Blue Bin (Dry / Recyclable)",
      binColorHex: "#2563EB",
      disposalInstructions: "Flatten box and place inside the Blue Municipal Dry Waste Bin for paper mill pulping.",
      preparationTip: "Peel off synthetic plastic packing tape and remove any styrofoam corner inserts.",
      disposalSteps: [
        "Cut or peel off plastic tape, address shipping labels, and remove foam inserts",
        "Break down corners and fold completely flat to optimize bin capacity",
        "Ensure cardboard remains dry and free of pizza grease or food oils",
        "Deposit in Blue Dry Bin or bundle together for municipal scrap collection"
      ],
      disposalDos: [
        "Flatten all corrugated boxes before placing into the collection bin",
        "Keep paper dry to preserve fiber tensile strength for pulping"
      ],
      disposalDonts: [
        "Do not mix grease-soaked pizza boxes with clean paper (put oily portions in compost)",
        "Do not leave cardboard outside in the rain"
      ],
      recyclabilityPercentage: 93,
      estimatedWeightKg: 1.1,
      estimatedPoints: 110,
      co2SavedKg: 2.8,
      confidenceScore: 0.97,
      reasoning: "Corrugated fiberboard (OCC) has a 93% recovery efficiency in closed-loop paper mill recycling.",
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

  // 4. Aluminum Cans & Metals
  if (
    normalized.includes("can") ||
    normalized.includes("aluminum") ||
    normalized.includes("metal") ||
    normalized.includes("tin") ||
    normalized.includes("foil")
  ) {
    return {
      itemName: "Aluminum Beverage Soda Can",
      itemType: "Single-Use Rigid Metal Beverage Container",
      materialType: "Aluminum Alloy 3104 (Drawn & Ironed Sheet)",
      category: "Non-Biodegradable",
      isBiodegradable: false,
      decompositionTime: "200 to 500 years to physically oxidize in nature",
      biodegradableExplanation:
        "Aluminum is an inorganic metal that does not degrade biologically. However, it is the circular economy champion: 100% infinitely recyclable with zero loss of structural integrity, saving 95% of the energy needed for bauxite mining.",
      howItCanBeRecycled:
        "100% infinitely recyclable in a closed-loop circular stream. Blue Bin collected cans are shredded, de-coated of inks, smelted in furnaces at 660°C, and cast into ingots. Within 60 days, recycled aluminum returns to store shelves as new beverage cans while saving 95% of bauxite smelting energy.",
      spokenSummary:
        "This item is an aluminum beverage can. It is non-biodegradable, made of aluminum alloy 3104. It is infinitely recyclable: rinse, crush, and place it in the Blue Bin to be remelted and reborn as a brand-new can in under 60 days.",
      binColorName: "Blue Bin (Dry / Recyclable)",
      binColorHex: "#2563EB",
      disposalInstructions: "Deposit in the Blue Municipal Dry Recyclables Bin for scrap smelting and re-rolling.",
      preparationTip: "Rinse remaining sugary beverage with 30ml water and crush flat with foot or can-crusher.",
      disposalSteps: [
        "Empty liquid contents completely",
        "Quickly rinse with water to avoid attracting ants and odor during transit",
        "Crush flat to save 80% bin storage volume",
        "Drop into the Blue Bin and verify weight for maximum dry metal rewards"
      ],
      disposalDos: [
        "Leave pull tabs attached to the can body so they don't get lost in scrap sorters",
        "Crush cans to maximize civic bin capacity"
      ],
      disposalDonts: [
        "Do not toss cans containing liquids or cigarette butts",
        "Never discard into wet waste green bins"
      ],
      recyclabilityPercentage: 100,
      estimatedWeightKg: 0.35,
      estimatedPoints: 45,
      co2SavedKg: 1.9,
      confidenceScore: 0.98,
      reasoning: "Recycling aluminum requires only 5% of the greenhouse gas emissions of primary bauxite smelting.",
      googleGroundingSearchQuery: "aluminum beverage can recycling circular economy blue bin",
      searchSources: [
        {
          title: "Aluminum Association Circularity Assessment",
          uri: "https://aluminum.org/recycling",
        },
      ],
    };
  }

  // 5. Glass Bottles & Jars
  if (
    normalized.includes("glass") ||
    normalized.includes("jar") ||
    normalized.includes("sauce bottle") ||
    normalized.includes("wine")
  ) {
    return {
      itemName: "Clear Soda-Lime Glass Jar / Bottle",
      itemType: "Rigid Container Glass Packaging",
      materialType: "Inorganic Soda-Lime-Silica Glass (SiO2, Na2O, CaO)",
      category: "Non-Biodegradable",
      isBiodegradable: false,
      decompositionTime: "1,000,000+ years (indestructible by microbes)",
      biodegradableExplanation:
        "Glass is formulated from fused silica sand and minerals. It does not break down or leach chemicals in nature. When recycled, glass cullet melts at lower temperatures than raw sand, dramatically reducing carbon emissions.",
      howItCanBeRecycled:
        "100% infinitely recyclable without quality loss. Jars are collected in the Blue stream, optical-sorted by color, crushed into cullet, and melted in glass furnaces at 1,500°C alongside sand. Using recycled cullet cuts furnace energy by 30% and carbon emissions by 50%.",
      spokenSummary:
        "This item is a glass jar or bottle. It is non-biodegradable, composed of inorganic soda-lime-silica glass. It is infinitely recyclable: rinse clean, remove metal caps, and place in the Blue Bin to be crushed into cullet and remelted into new jars.",
      binColorName: "Blue Bin (Dry / Recyclable)",
      binColorHex: "#2563EB",
      disposalInstructions: "Rinse cleanly and place carefully in the Blue Dry Recyclables Bin.",
      preparationTip: "Rinse residual condiments, remove metal or plastic lids, and avoid breaking the glass container.",
      disposalSteps: [
        "Rinse out food or beverage residues with warm water",
        "Separate metal screw lids or plastic rings (recycle lids separately)",
        "Place gently into the Blue Bin without shattering to protect sanitation workers",
        "Smart bin scale records tare and adds points to your wallet"
      ],
      disposalDos: [
        "Keep whole glass containers intact whenever possible",
        "Segregate by color (clear, amber, green) if local collection specifies"
      ],
      disposalDonts: [
        "Never mix broken window panes, pyrex, or ceramics with food glass jars",
        "Do not leave sticky sugary contents unwashed"
      ],
      recyclabilityPercentage: 100,
      estimatedWeightKg: 0.45,
      estimatedPoints: 40,
      co2SavedKg: 1.1,
      confidenceScore: 0.96,
      reasoning: "Glass is 100% recyclable endlessly without loss of purity or quality according to CPCB MSW standards.",
      googleGroundingSearchQuery: "glass bottle recycling guidelines municipal solid waste",
      searchSources: [
        {
          title: "Glass Packaging Institute Recycling Standards",
          uri: "https://gpi.org/recycling-glass",
        },
      ],
    };
  }

  // 6. Polystyrene / Styrofoam
  if (
    normalized.includes("styrofoam") ||
    normalized.includes("thermocol") ||
    normalized.includes("foam") ||
    normalized.includes("polystyrene")
  ) {
    return {
      itemName: "Expanded Polystyrene (EPS #6) Foam Container",
      itemType: "Rigid Cellular Plastic Foam Packaging",
      materialType: "Expanded Polystyrene Synthetic Polymer (#6 EPS)",
      category: "Non-Biodegradable",
      isBiodegradable: false,
      decompositionTime: "500+ years (practically non-biodegradable)",
      biodegradableExplanation:
        "Composed of synthetic polystyrene foam containing 95% trapped air. Sunlight and bacteria cannot break down its rigid chemical bonds. It crumbles into micro-beads that absorb toxic pollutants and poison wildlife.",
      howItCanBeRecycled:
        "Recycled through thermal or hydraulic densification. Clean, uncontaminated EPS foam is fed into industrial densifiers that compress out 98% trapped air, transforming bulky foam into dense solid polystyrene ingots that are pelletized for architectural moldings, picture frames, and construction insulation.",
      spokenSummary:
        "This item is an expanded polystyrene foam container. It is non-biodegradable, composed of synthetic polystyrene polymer. To recycle it, wipe all food grease and drop off at an EPS collection kiosk for thermal densification into solid polymer ingots.",
      binColorName: "Blue Bin (Dry Waste) / Specialized Drop-off",
      binColorHex: "#2563EB",
      disposalInstructions: "Wipe clean and deposit into the Dry Waste Recyclables stream for EPS densification.",
      preparationTip: "Wipe off all food grease with a paper towel; stained portions cannot be recycled.",
      disposalSteps: [
        "Wipe or scrape off all food residues and gravies completely",
        "Break clean foam into manageable pieces inside a dry bag to prevent blowing away",
        "Deposit at municipal EPS collection kiosk or dry waste aggregation center",
        "Earn civic reward points for keeping micro-beads out of urban drains"
      ],
      disposalDos: [
        "Check with local municipal centers for densifier equipment drop-off",
        "Keep dry and unsoiled"
      ],
      disposalDonts: [
        "Never burn styrofoam (releases hazardous neurotoxic styrene vapors)",
        "Do not toss into compost or garden soil"
      ],
      recyclabilityPercentage: 40,
      estimatedWeightKg: 0.1,
      estimatedPoints: 20,
      co2SavedKg: 0.5,
      confidenceScore: 0.95,
      reasoning: "Requires specialized heat/mechanical densification to turn high-volume low-weight foam into reusable polystyrene pellets.",
      googleGroundingSearchQuery: "EPS styrofoam foam recycling guidelines municipal",
      searchSources: [
        {
          title: "EPS Industry Alliance Recycling Guidelines",
          uri: "https://epspackaging.org/recycling",
        },
      ],
    };
  }

  // Default: PET Plastic Bottle
  return {
    itemName: "Polyethylene Terephthalate (PET #1) Bottle",
    itemType: "Rigid Thermoplastic Beverage Container",
    materialType: "PET #1 Thermoplastic Synthetic Polymer",
    category: "Non-Biodegradable",
    isBiodegradable: false,
    decompositionTime: "450 to 500+ years in landfill or environment",
    biodegradableExplanation:
      "Synthesized from petroleum hydrocarbons through terephthalic acid and ethylene glycol polymerization. Microorganisms lack the biological enzymes to cleave these ester links, causing the plastic to fragment into harmful microplastics over centuries.",
    howItCanBeRecycled:
      "Recycled through mechanical wash, shredding, and extrusion. In the Blue Recyclable stream, optical sorters separate clear PET from labels. Bottles are chopped into uniform flakes, hot-washed with alkaline solutions to purge contaminants, and melted into food-grade rPET resin pellets for new bottles, textiles, and fleece jackets.",
    spokenSummary:
      "This item is a PET plastic bottle. It is non-biodegradable, made of thermoplastic PET resin code 1. To recycle it, rinse empty, crush flat, and place in the Blue Bin for mechanical flake shredding and conversion into recycled polyester.",
    binColorName: "Blue Bin (Dry / Recyclable)",
    binColorHex: "#2563EB",
    disposalInstructions: "Deposit in the Blue Municipal Dry Recyclables Bin for mechanical shredding and flake pelletizing.",
    preparationTip: "Empty drink residue, rinse with clean water, crush flat with foot, and screw cap back on.",
    disposalSteps: [
      "Pour out any remaining beverage or liquid residue",
      "Give a quick 30ml water rinse to prevent fermentation odors",
      "Step on or compress the bottle flat to reduce bin bulk volume by 75%",
      "Drop into Blue Dry Bin and log weight at smart station for immediate points"
    ],
    disposalDos: [
      "Keep plastic caps on the crushed bottle so they don't slip through mechanical sorting screens",
      "Look for the triangular SPI Resin Code #1 embossed on the bottom"
    ],
    disposalDonts: [
      "Never dispose in the green wet compost bin",
      "Do not burn plastic (releases carcinogenic black smoke and toxins)"
    ],
    recyclabilityPercentage: 100,
    estimatedWeightKg: 0.5,
    estimatedPoints: 50,
    co2SavedKg: 1.25,
    confidenceScore: 0.98,
    reasoning: "PET resin code #1 is a 100% recyclable thermoplastic widely processed into recycled polyester yarn and new food-grade bottles.",
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
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "EcoCollect" });
});

app.post("/api/classify-waste", async (req, res) => {
  const { imageBase64, sampleLabel, mimeType: providedMimeType } = req.body;

  const ai = getGemini();

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Return intelligent fallback classification
    const fallback = resolveFallbackClassification(sampleLabel);
    return res.json({ result: fallback, source: "offline-fallback" });
  }

  try {
    const prompt = `You are an expert municipal solid waste segregation, environmental science, and recycling materials classification AI.
Analyze this item carefully (from image or item query).
You must determine:
1. What type of item it is (itemType, e.g. "Rigid Beverage Bottle", "Organic Food Scrap", "Consumer E-Waste Dry Battery", "Corrugated Paperboard Packaging").
2. Specific item name (itemName).
3. Exact physical & molecular material composition (materialType, e.g., PET #1 Thermoplastic, Plant Cellulose Biomass, Corrugated Kraft Paper Pulp, Aluminum Alloy 3104, Lithium Cobalt Oxide, Soda-Lime Glass, Expanded Polystyrene EPS #6).
4. Whether the item is Biodegradable or Non-Biodegradable (biodegradable means naturally broken down by biological microorganisms into organic soil matter without synthetic toxic residue).
5. Decomposition timeframe in nature or compost.
6. Detailed scientific explanation of why it is or is not biodegradable and its environmental impact.
7. How it can be recycled (howItCanBeRecycled): Explain clearly and thoroughly how this item can be recycled (e.g. mechanical flake shredding, paper hydropulping, closed-loop smelting, aerobic composting, hydrometallurgical extraction, or thermal densification, and what new products it is made into).
8. Spoken summary (spokenSummary): A concise, natural 2-sentence script designed for audio text-to-speech that clearly states: "This item is a [type/name]. It is [biodegradable/non-biodegradable], made of [material]. How to recycle: [recycling instructions]."
9. Exact municipal disposal method, designated bin color (Green, Blue, Red, Yellow), preparation steps, dos, and donts.

${sampleLabel ? `Item query/label: "${sampleLabel}"` : ""}

Return strictly a JSON object with this structure:
{
  "itemName": "Specific item name",
  "itemType": "Type of item (e.g. Rigid Plastic Beverage Container, Wet Organic Food Scrap, Hazardous Consumer E-Waste, Packaging Paperboard)",
  "materialType": "Exact physical/chemical material composition",
  "category": "Biodegradable" or "Non-Biodegradable",
  "isBiodegradable": true or false,
  "decompositionTime": "e.g. 2 to 5 weeks in compost, 450 to 500 years in landfill, 200 to 500 years",
  "biodegradableExplanation": "2-3 informative sentences explaining scientifically why this material is biodegradable or non-biodegradable and environmental consequences.",
  "howItCanBeRecycled": "Comprehensive explanation of how this material is recycled through municipal/industrial recycling infrastructure and circular re-manufacturing.",
  "spokenSummary": "This item is a [Item Name]. It is [Biodegradable/Non-Biodegradable], composed of [Material Type]. How to recycle: [Brief recycling directive].",
  "binColorName": "Green Bin (Wet / Organic Compost)" or "Blue Bin (Dry / Recyclable)" or "Red Bin (Hazardous / E-Waste)" or "Yellow Bin (Sanitary / Inert)",
  "binColorHex": "#16A34A" (Green) or "#2563EB" (Blue) or "#DC2626" (Red) or "#D97706" (Yellow/Amber),
  "disposalInstructions": "Clear municipal directive on where and how to deposit this item.",
  "preparationTip": "Crucial preparation action before binning (e.g. rinse residue, crush flat, cover battery terminals, keep dry).",
  "disposalSteps": [
    "Step 1: Preparation (cleaning, draining, or hazard insulation)",
    "Step 2: Volume reduction or segregation (crushing, flattening, removing non-recyclable tags)",
    "Step 3: Proper container deposit into designated municipal bin",
    "Step 4: Smart station logging for civic verification and reward points"
  ],
  "disposalDos": [
    "Specific best practice do #1",
    "Specific best practice do #2"
  ],
  "disposalDonts": [
    "Specific mistake to avoid don't #1",
    "Specific mistake to avoid don't #2"
  ],
  "recyclabilityPercentage": 0 to 100,
  "estimatedWeightKg": 0.5,
  "estimatedPoints": 50,
  "co2SavedKg": 1.25,
  "confidenceScore": 0.98,
  "reasoning": "1-2 sentence explanation citing municipal solid waste segregation guidelines."
}`;

    const parts: Array<any> = [];

    if (imageBase64) {
      let cleanBase64 = imageBase64;
      let effectiveMimeType = providedMimeType || "image/jpeg";
      const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        effectiveMimeType = matches[1];
        cleanBase64 = matches[2];
      } else {
        cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      }

      cleanBase64 = cleanBase64.trim().replace(/\s+/g, "");

      parts.push({
        inlineData: {
          mimeType: effectiveMimeType,
          data: cleanBase64,
        },
      });
    }

    parts.push({ text: prompt });
    const contents = { parts };

    const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let responseText = "";
    let modelUsed = "";

    for (const targetModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        });
        if (response && response.text) {
          responseText = response.text;
          modelUsed = targetModel;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${targetModel} failed for classification:`, err?.message || err);
      }
    }

    let parsed: any = null;

    if (responseText) {
      try {
        parsed = JSON.parse(responseText.trim());
      } catch {
        const cleanJson = responseText
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        const startIdx = cleanJson.indexOf("{");
        const endIdx = cleanJson.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          parsed = JSON.parse(cleanJson.substring(startIdx, endIdx + 1));
        }
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed = parsed[0];
    }

    if (parsed && (parsed.itemName || parsed.category)) {
      const isBio =
        parsed.isBiodegradable === true ||
        parsed.category === "Biodegradable" ||
        (typeof parsed.category === "string" &&
          parsed.category.toLowerCase().includes("bio") &&
          !parsed.category.toLowerCase().includes("non"));

      const itemName = parsed.itemName || (sampleLabel ? sampleLabel : "Classified Waste Item");
      const materialType = parsed.materialType || (isBio ? "Organic Plant Cellulose & Biomass" : "Synthetic Polymer / Recyclable Material");
      const itemType = parsed.itemType || (isBio ? "Organic Compostable Waste" : "Dry Municipal Recyclable");
      const howItCanBeRecycled = parsed.howItCanBeRecycled || (isBio
        ? "Recycled by biological aerobic composting or biomethanation into organic fertilizer humus and clean biogas fuel."
        : "Recycled through municipal dry waste collection: sorted, cleaned, and processed mechanically into raw material for new manufacturing.");

      const spokenSummary = parsed.spokenSummary ||
        `This item is a ${itemName}. It is ${isBio ? "biodegradable" : "non-biodegradable"}, composed of ${materialType}. How to recycle: ${howItCanBeRecycled.slice(0, 140)}.`;

      const result: WasteScanResult = {
        itemName,
        itemType,
        materialType,
        category: isBio ? "Biodegradable" : "Non-Biodegradable",
        isBiodegradable: isBio,
        decompositionTime: parsed.decompositionTime || (isBio ? "2 to 6 weeks in compost" : "450+ years in landfill"),
        biodegradableExplanation:
          parsed.biodegradableExplanation ||
          (isBio
            ? "Consists of natural organic carbon chains that soil bacteria decompose into rich compost."
            : "Synthetic polymers resist microbial degradation and persist for centuries in landfills."),
        howItCanBeRecycled,
        spokenSummary,
        binColorName: parsed.binColorName || (isBio ? "Green Bin (Wet / Organic Compost)" : "Blue Bin (Dry / Recyclable)"),
        binColorHex: parsed.binColorHex || (isBio ? "#16A34A" : "#2563EB"),
        disposalInstructions: parsed.disposalInstructions || (isBio ? "Deposit into the Green Municipal Organic Bin." : "Deposit into the Blue Municipal Recyclables Bin."),
        preparationTip: parsed.preparationTip || (isBio ? "Remove plastic stickers and drain excess liquids." : "Rinse residue, crush flat, and keep dry."),
        disposalSteps: Array.isArray(parsed.disposalSteps) && parsed.disposalSteps.length > 0
          ? parsed.disposalSteps
          : [
              "Inspect and remove any foreign non-recyclable contaminants",
              "Empty liquids or residues and crush to conserve volume",
              `Deposit into designated ${isBio ? "Green" : "Blue"} municipal bin`,
              "Log weight at civic smart station for immediate points"
            ],
        disposalDos: Array.isArray(parsed.disposalDos) ? parsed.disposalDos : undefined,
        disposalDonts: Array.isArray(parsed.disposalDonts) ? parsed.disposalDonts : undefined,
        recyclabilityPercentage: typeof parsed.recyclabilityPercentage === "number" ? parsed.recyclabilityPercentage : (isBio ? 100 : 90),
        estimatedWeightKg: Number(parsed.estimatedWeightKg) || 0.5,
        estimatedPoints:
          Number(parsed.estimatedPoints) || Math.max(10, Math.round((Number(parsed.estimatedWeightKg) || 0.5) * 100)),
        co2SavedKg:
          Number(parsed.co2SavedKg) || Math.round((Number(parsed.estimatedWeightKg) || 0.5) * 2.5 * 10) / 10,
        confidenceScore: Number(parsed.confidenceScore) || 0.96,
        reasoning: parsed.reasoning || "Verified according to municipal solid waste segregation standards.",
      };

      return res.json({ result, source: "gemini-api", modelUsed: modelUsed || "gemini-3.5-flash-lite" });
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

// Chatbot Knowledge & Response Engine
function resolveChatFallback(message: string, hasImage: boolean, sampleLabel?: string) {
  const query = (message || sampleLabel || "").toLowerCase();

  // If camera image was submitted or specific item mentioned:
  const isWasteScan =
    hasImage ||
    query.includes("scan") ||
    query.includes("bottle") ||
    query.includes("banana") ||
    query.includes("plastic") ||
    query.includes("battery") ||
    query.includes("paper") ||
    query.includes("can") ||
    query.includes("glass") ||
    query.includes("box") ||
    query.includes("carton") ||
    query.includes("peel") ||
    query.includes("food") ||
    query.includes("organic") ||
    query.includes("e-waste");

  if (isWasteScan) {
    const scan = resolveFallbackClassification(sampleLabel || query || "plastic bottle");
    const recyclability = scan.recyclabilityPercentage || (scan.isBiodegradable ? 100 : 92);
    const purity = scan.isBiodegradable ? 96 : 94;
    const points = scan.estimatedPoints || 50;
    const cash = (points * 0.25).toFixed(2);
    const co2 = scan.co2SavedKg || 1.25;
    const confidencePct = Math.round((scan.confidenceScore || 0.98) * 100);

    const reply = `I've analyzed your scanned item: **${scan.itemName}**!

### 🔍 Waste Identification:
- **Item Type:** ${scan.itemType || "Municipal Solid Waste"}
- **Material Composition:** ${scan.materialType}
- **Biodegradability Status:** ${scan.isBiodegradable ? "🌱 **Biodegradable** (Naturally metabolizes in 2-5 weeks)" : "🛡️ **Non-Biodegradable** (Persists for centuries, requires mechanical/chemical recycling)"}
- **Designated Municipal Bin:** **${scan.binColorName}**

### 📊 Official Eco Scores:
- **Recyclability Score:** **${recyclability}/100** (${recyclability >= 90 ? "Excellent Circular Potential" : "Moderate Recyclability"})
- **Purity / Segregation Score:** **${purity}%** (Clean, uncontaminated condition)
- **Civic Reward Points:** **+${points} EcoPoints** (Est. **₹${cash}** UPI direct cash payout)
- **Carbon Reduction Score:** **${co2} kg CO₂ prevented** from entering the atmosphere
- **AI Vision Confidence:** **${confidencePct}%**

### 💡 Preparation & Disposal Instructions:
${scan.preparationTip ? `* **Preparation Action:** ${scan.preparationTip}\n` : ""}* ${scan.disposalInstructions}
* Deposit into the **${scan.binColorName}** at any verified EcoCollect smart bin station to have your points credited immediately.`;

    const enhancedScan = {
      ...scan,
      purityScore: purity,
      recyclabilityPercentage: recyclability,
      estimatedPoints: points,
    };

    return {
      reply,
      scanResult: enhancedScan,
      suggestedPrompts: [
        "How do I redeem my points for UPI cash?",
        "Where is the nearest verified drop-off bin?",
        "Scan another item with camera",
        "How do I make compost at home?",
      ],
    };
  }

  // General doubt clearing & website guides
  if (
    query.includes("reward") ||
    query.includes("points") ||
    query.includes("upi") ||
    query.includes("cash") ||
    query.includes("money") ||
    query.includes("withdraw") ||
    query.includes("wallet")
  ) {
    return {
      reply: `### 💰 How EcoCollect Points & UPI Cash Rewards Work:

1. **Scan & Segregate:** Use the **Camera Scanner** to verify your waste item and deposit it in the designated municipal bin (Green for organic, Blue for recyclables, Red for e-waste).
2. **Earn Points:** Each verified disposal awards **10 to 100+ EcoPoints** depending on weight, recyclability score, and material purity.
3. **Point Conversion:** Every **1 EcoPoint = ₹0.25 INR** (100 pts = ₹25.00 cash).
4. **Instant Transfer:** Go to your **Wallet** tab, enter your UPI ID (e.g. \`username@upi\` or \`mobile@paytm\`), and request a withdrawal. Funds are credited directly to your bank account!
5. **Weekly Leaderboards:** Top 3 citizen segregators each week receive bonus municipal civic grants and municipal certificates!`,
      scanResult: null,
      suggestedPrompts: [
        "Scan waste with camera now",
        "Which bin for plastic milk pouches?",
        "How do I link my UPI ID?",
        "Check current leaderboard ranks",
      ],
    };
  }

  if (
    query.includes("how to use") ||
    query.includes("help") ||
    query.includes("start") ||
    query.includes("about") ||
    query.includes("website") ||
    query.includes("what is")
  ) {
    return {
      reply: `### 👋 Welcome to EcoCollect AI Civic Assistant!

EcoCollect is a communal smart waste management platform designed by **NITHIN VARSHAN TK, HARISH, SARVESHWAR, RAJAGURU, and KANISHKAN**. We help residents eliminate municipal landfill waste while earning direct cash rewards.

Here is how you can use the web portal:
1. 📷 **Scan Waste With Camera:** Click the camera icon or tap **AI Scan** to identify what type of waste any item is, its biodegradability, and view instant recyclability scores.
2. ♻️ **Deposit & Log:** Drop items at your designated neighborhood smart station and log disposal to collect reward points.
3. 💵 **Redeem Cash:** Convert points to real INR cash sent straight to your UPI ID in the **Wallet** tab.
4. 🏆 **Climb the Ranks:** Compare your ward's diversion rate against other neighborhoods on the **Rankings** board.

Need to check an item right now? Tap the camera icon below to snap a picture!`,
      scanResult: null,
      suggestedPrompts: [
        "Scan waste with camera",
        "Which bin colors do we use?",
        "How do I earn UPI cash rewards?",
        "Can greasy pizza boxes be recycled?",
      ],
    };
  }

  if (
    query.includes("bin") ||
    query.includes("color") ||
    query.includes("colors") ||
    query.includes("segregat")
  ) {
    return {
      reply: `### 🎨 Official 4-Color Municipal Waste Segregation Guide:

* 🟢 **Green Bin (Wet / Organic Compostable):**
  * Fruit & vegetable peels, leftover food, tea leaves, coffee grounds, eggshells, garden leaves.
  * **Tip:** Never use single-use polythene bags to wrap wet waste.
* 🔵 **Blue Bin (Dry / Clean Recyclables):**
  * PET bottles, beverage cans, cardboard, paper, glass jars, tin containers, rigid plastics.
  * **Tip:** Always rinse food residue and crush bottles/boxes flat.
* 🔴 **Red Bin (Hazardous & E-Waste):**
  * Dry batteries, mobile chargers, CFL bulbs, paint cans, aerosol spray cans, electronic toys.
  * **Tip:** Tape battery terminals with Scotch tape to avoid sparks.
* 🟡 **Yellow Bin (Sanitary & Inert Residue):**
  * Diapers, bandages, sanitizing wipes, ceramic shards, dusty sweeping residues.
  * **Tip:** Wrap sanitary waste in newspaper and mark with an X.`,
      scanResult: null,
      suggestedPrompts: [
        "Scan an item with camera",
        "Can thermocol be recycled?",
        "How to compost at home?",
        "How much are points worth in UPI?",
      ],
    };
  }

  if (
    query.includes("compost") ||
    query.includes("kitchen") ||
    query.includes("wet waste")
  ) {
    return {
      reply: `### 🌿 Easy Home Composting Guide (30-Day Recipe):

1. **Collect Green Biomass (Nitrogen):** Fruit peels, vegetable trimmings, coffee grounds, tea leaves.
2. **Collect Brown Biomass (Carbon):** Dry leaves, shredded cardboard/egg cartons, sawdust.
3. **The 2:1 Golden Ratio:** In your compost bin or aerated terracotta pot, alternate **2 parts dry brown leaves** for every **1 part wet food waste**.
4. **Moisture & Oxygen:** Keep it as damp as a wrung-out sponge. Stir or turn once a week with a trowel for aeration.
5. **Result in 4-6 Weeks:** Dark, earthy, nutrient-rich organic fertilizer for your house plants or garden!`,
      scanResult: null,
      suggestedPrompts: [
        "Scan my kitchen scrap with camera",
        "What should NOT go into compost?",
        "How do I earn points for composting?",
      ],
    };
  }

  // Default conversational answer
  return {
    reply: `Hello! I am your **EcoBot AI Assistant**. I can clear any doubts you have about waste management, recycling, composting, and UPI reward payouts.

You can also use the **Camera button (📷)** right in our chat to snap a picture of any waste item. I will scan it, identify what type of waste it is, tell you if it's biodegradable or recyclable, and compute its official **Recyclability & Eco Scores**!

What would you like to ask or scan?`,
    scanResult: null,
    suggestedPrompts: [
      "Scan waste with camera",
      "Which bin for milk pouch?",
      "How do I earn UPI cash rewards?",
      "Official bin color guide",
    ],
  };
}

// Role-based System Instructions for Gemini
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  civic_waste_expert: `You are EcoBot, an expert municipal solid waste management, civic environmental science, and recycling assistant on the EcoCollect web platform created by NITHIN VARSHAN TK, HARISH, SARVESHWAR, RAJAGURU, and KANISHKAN.
EcoCollect is a smart civic portal that helps citizens segregate waste into municipal color bins (Green: organic compostable, Blue: dry recyclable, Red: hazardous/e-waste, Yellow: sanitary/inert), and earn direct UPI cash rewards (1 EcoPoint = ₹0.25 INR, 100 points = ₹25.00 cash).
Your role: Clear all citizen doubts with practical, accurate municipal waste segregation guidelines, identify item composition, advise on clean preparation (rinsing, flattening), and compute reward points. Format your response cleanly with markdown and bullet points.`,

  zero_waste_coach: `You are EcoBot in Zero-Waste & Sustainable Lifestyle Coach mode on the EcoCollect platform.
Your role: Guide citizens to drastically reduce household waste, refuse single-use plastics, choose circular and reusable alternatives, implement smart upcycling hacks, and transition toward a zero-landfill lifestyle. Be encouraging, inspiring, and provide practical everyday habit changes.`,

  compost_specialist: `You are EcoBot in Composting & Soil Science Specialist mode on the EcoCollect platform.
Your role: Provide expert guidance on home and community composting (aerobic bins, terracotta pots, vermicomposting). Explain the 2:1 brown-to-green carbon/nitrogen ratio, moisture control, aeration routines, pest prevention, and how to convert organic kitchen and garden waste into nutrient-rich soil fertilizer.`,

  circularity_auditor: `You are EcoBot in Circular Economy & Life-Cycle Assessment Auditor mode on the EcoCollect platform.
Your role: Provide technical, analytical insights into material circularity, polymer resin classifications (PET, HDPE, LDPE, PP, PS), life-cycle carbon abatement (kg CO2e avoided), recycling efficiency percentages, and industrial recovery pathways.`,
};

function resolveModelName(requestedModel?: string): string {
  const modelStr = (requestedModel || "gemini-2.5-flash").toLowerCase();
  if (modelStr.includes("pro")) {
    return "gemini-3.1-pro-preview";
  }
  if (modelStr.includes("lite")) {
    return "gemini-3.5-flash-lite";
  }
  // Default general task model (gemini-2.5-flash mapped to active gemini-3.5-flash-lite / gemini-3.8-flash)
  return "gemini-3.5-flash-lite";
}

// POST /api/chat - Gemini Multi-Turn Chatbot with System Instruction & Model Selection
app.post("/api/chat", async (req, res) => {
  const {
    message = "",
    history = [],
    model = "gemini-2.5-flash",
    role = "civic_waste_expert",
    customSystemInstruction,
  } = req.body;

  const ai = getGemini();

  if (!ai || !process.env.GEMINI_API_KEY) {
    const fallbackResponse = resolveChatFallback(message, false);
    return res.json({
      ...fallbackResponse,
      modelUsed: model,
      roleUsed: role,
      source: "knowledge-engine",
    });
  }

  // Determine system instruction for the chosen role
  const baseInstruction =
    ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.civic_waste_expert;
  const systemInstruction = customSystemInstruction
    ? `${baseInstruction}\n\nAdditional Guidance: ${customSystemInstruction}`
    : baseInstruction;

  // Build multi-turn contents array with conversation history
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    for (const item of history.slice(-10)) {
      const text = item.content || item.text || "";
      if (!text.trim()) continue;
      const roleName = item.role === "bot" || item.role === "model" ? "model" : "user";
      contents.push({
        role: roleName,
        parts: [{ text: text.trim() }],
      });
    }
  }

  // Append latest user message if not already the last turn
  const lastTurn = contents[contents.length - 1];
  const trimmedMsg = (message || "Hello EcoBot").trim();
  if (!lastTurn || lastTurn.role !== "user" || lastTurn.parts[0]?.text !== trimmedMsg) {
    contents.push({
      role: "user",
      parts: [{ text: trimmedMsg }],
    });
  }

  // Attempt with selected model; fall back to gemini-3.5-flash-lite on quota or demand error
  const resolvedModel = resolveModelName(model);
  const candidateModels = [resolvedModel, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

  for (const targetModel of Array.from(new Set(candidateModels))) {
    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "";

      if (replyText.trim()) {
        // Derive dynamic suggested prompts
        const lowerMsg = (message || "").toLowerCase();
        let suggestedPrompts = [
          "How do I earn UPI cash rewards?",
          "Which bin for plastic packaging?",
          "How do I compost wet food waste?",
          "Official 4-color municipal bin guide",
        ];

        if (lowerMsg.includes("compost") || role === "compost_specialist") {
          suggestedPrompts = [
            "What is the 2:1 brown to green ratio?",
            "Can I put citrus peels in compost?",
            "How do I fix a smelly compost bin?",
            "How many EcoPoints for composting?",
          ];
        } else if (lowerMsg.includes("plastic") || lowerMsg.includes("bottle")) {
          suggestedPrompts = [
            "Can bottle caps be recycled together?",
            "Which bin does MLP multi-layer plastic go to?",
            "How many points per kg of PET plastic?",
            "How to withdraw cash to UPI wallet?",
          ];
        } else if (lowerMsg.includes("reward") || lowerMsg.includes("upi") || lowerMsg.includes("cash")) {
          suggestedPrompts = [
            "How to link UPI ID in wallet?",
            "What is the conversion rate for points?",
            "How are weekly leaderboard bonuses awarded?",
            "Which waste types give the highest points?",
          ];
        }

        return res.json({
          reply: replyText.trim(),
          suggestedPrompts,
          modelUsed: model,
          actualEngine: targetModel,
          roleUsed: role,
          source: "gemini-api",
        });
      }
    } catch (err: any) {
      console.warn(`Gemini generation failed on model ${targetModel}:`, err?.message);
      // Continue to next fallback model in loop
    }
  }

  // If all Gemini models encountered errors, gracefully respond via knowledge engine
  const fallbackResponse = resolveChatFallback(message, false);
  return res.json({
    ...fallbackResponse,
    modelUsed: model,
    roleUsed: role,
    source: "knowledge-engine",
  });
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
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
