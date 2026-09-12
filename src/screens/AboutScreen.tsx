import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  Recycle,
  Calculator,
  Search,
  HelpCircle,
  Mail,
  CheckCircle2,
  ChevronDown,
  Building2,
  Phone,
  Sparkles,
  Award,
  Globe2,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';

interface WasteItemGuide {
  name: string;
  category: 'Biodegradable' | 'Non-Biodegradable' | 'Hazardous' | 'E-Waste';
  binColor: 'green' | 'blue' | 'red' | 'yellow';
  binLabel: string;
  pointsPerKg: number;
  preparationTip: string;
}

const WASTE_DIRECTORY: WasteItemGuide[] = [
  {
    name: 'Vegetable & Fruit Peels',
    category: 'Biodegradable',
    binColor: 'green',
    binLabel: 'Green Bin (Wet)',
    pointsPerKg: 100,
    preparationTip: 'Drain excess liquid before dropping into bin.',
  },
  {
    name: 'Cooked Food Leftovers',
    category: 'Biodegradable',
    binColor: 'green',
    binLabel: 'Green Bin (Wet)',
    pointsPerKg: 100,
    preparationTip: 'Avoid plastic or foil wrapping; compost friendly.',
  },
  {
    name: 'PET Water & Beverage Bottles (#1)',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 120,
    preparationTip: 'Empty, rinse briefly, crush bottle, keep cap on.',
  },
  {
    name: 'Cardboard & Amazon Delivery Boxes',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 110,
    preparationTip: 'Remove plastic tape and flatten completely.',
  },
  {
    name: 'Newspapers & Office Paper',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 100,
    preparationTip: 'Keep dry and bundled; no soiled tissues.',
  },
  {
    name: 'Aluminum Beverage Cans',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 150,
    preparationTip: 'Rinse cleanly and crush to save bin volume.',
  },
  {
    name: 'Glass Jam & Sauce Jars',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 90,
    preparationTip: 'Wash thoroughly; separate metal lid into dry bin.',
  },
  {
    name: 'Alkaline & Lithium Batteries',
    category: 'Hazardous',
    binColor: 'red',
    binLabel: 'Red Bin (Domestic Hazardous)',
    pointsPerKg: 200,
    preparationTip: 'Tape terminals with masking tape to prevent shorts.',
  },
  {
    name: 'Expired Medicines & Blister Packs',
    category: 'Hazardous',
    binColor: 'red',
    binLabel: 'Red Bin (Domestic Hazardous)',
    pointsPerKg: 150,
    preparationTip: 'Never flush into sinks; place in sealed clear bag.',
  },
  {
    name: 'Old Smartphone / USB Chargers',
    category: 'E-Waste',
    binColor: 'yellow',
    binLabel: 'Yellow Bin (E-Waste Kiosk)',
    pointsPerKg: 250,
    preparationTip: 'Factory reset digital devices before deposit.',
  },
  {
    name: 'Milk Pouches (LDPE #4)',
    category: 'Non-Biodegradable',
    binColor: 'blue',
    binLabel: 'Blue Bin (Dry Recyclable)',
    pointsPerKg: 130,
    preparationTip: 'Rinse with water, dry thoroughly, do not snip corner off completely.',
  },
  {
    name: 'Tea Leaves & Coffee Grounds',
    category: 'Biodegradable',
    binColor: 'green',
    binLabel: 'Green Bin (Wet)',
    pointsPerKg: 100,
    preparationTip: 'Remove synthetic tea bags or staples before composting.',
  },
];

export const AboutScreen: React.FC = () => {
  const { setCurrentRoute } = useEco();

  // Carbon Calculator state
  const [wasteType, setWasteType] = useState<'plastic' | 'organic' | 'paper' | 'metal'>('plastic');
  const [weightKgInput, setWeightKgInput] = useState<number>(5);

  // Search in Waste Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact Form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    ward: 'Green Valley Ward 4',
    subject: 'Feedback & Smart Bin Query',
    message: '',
  });

  // Carbon math calculations
  const calculateMetrics = () => {
    const factors = {
      plastic: { co2PerKg: 1.8, treesRatio: 0.08, pointsPerKg: 120, inrRate: 12 },
      organic: { co2PerKg: 0.9, treesRatio: 0.04, pointsPerKg: 100, inrRate: 10 },
      paper: { co2PerKg: 1.3, treesRatio: 0.06, pointsPerKg: 110, inrRate: 11 },
      metal: { co2PerKg: 4.2, treesRatio: 0.18, pointsPerKg: 150, inrRate: 15 },
    };

    const currentFactor = factors[wasteType];
    const co2Saved = (weightKgInput * currentFactor.co2PerKg).toFixed(1);
    const treesEquivalent = (weightKgInput * currentFactor.treesRatio).toFixed(2);
    const potentialPoints = Math.round(weightKgInput * currentFactor.pointsPerKg);
    const potentialInr = (potentialPoints * 0.1).toFixed(2);

    return { co2Saved, treesEquivalent, potentialPoints, potentialInr };
  };

  const metrics = calculateMetrics();

  const filteredDirectory = WASTE_DIRECTORY.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preparationTip.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const faqs = [
    {
      q: 'How are my waste drop-offs verified at the smart bins?',
      a: 'EcoCollect smart bins feature high-precision optical load cells and camera sensors. When you deposit sorted waste, the smart bin detects the delta weight in kilograms and validates the barcode or QR session. Furthermore, community ward marshals conduct random spot audits to maintain a 99% segregation fidelity rate.',
    },
    {
      q: 'How does the Point-to-Cash UPI transfer work?',
      a: 'Every 10 points accumulated equals ₹1.00 INR. Once your balance reaches a minimum of 100 points (₹10.00), you can request an instant payout to any UPI ID (Google Pay, PhonePe, Paytm, BHIM) or direct bank transfer. Withdrawals are processed within seconds via automated banking rail webhooks.',
    },
    {
      q: 'What happens if I accidentally deposit mixed waste into a smart bin?',
      a: 'If mixed waste is detected, the disposal entry is automatically marked as "Flagged" by the optical classifier or ward marshal. You will receive an educational alert with segregation tips, and points for that batch are paused until audited. We prioritize citizen education over penalization.',
    },
    {
      q: 'Can our Housing Society or RWA join the EcoCollect program?',
      a: 'Yes! Over 120 Resident Welfare Associations (RWAs) are registered. Housing complexes that achieve over 85% segregation compliance receive dedicated municipal composting units, bulk smart bin collection, and communal amenity grant funding.',
    },
    {
      q: 'Is the AI camera scanner trained on Indian/regional packaging?',
      a: 'Yes. EcoCollect’s vision model (powered by Google Gemini) is fine-tuned to recognize regional FMCG packaging, local produce skins, dairy pouches, multi-layer plastics, e-waste, and medical blister packs with over 96% accuracy.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactFormData({
        name: '',
        email: '',
        ward: 'Green Valley Ward 4',
        subject: 'Feedback & Smart Bin Query',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. MUNICIPAL HEADER BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles size={14} />
            <span>Official Smart City Initiative • Municipal Waste Division</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            Transforming Urban Waste into Community Value
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            EcoCollect is the communal smart waste platform connecting citizens, IoT disposal bins,
            and municipal recycling centers. By using advanced computer vision and direct UPI cash
            rewards, we make source segregation effortless, rewarding, and accountable for every
            household.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentRoute('scanner')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Recycle size={18} />
              <span>Try AI Segregation Scanner</span>
            </button>
            <button
              onClick={() => setCurrentRoute('disposal')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Building2 size={18} />
              <span>Find Smart Bins</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. THREE PILLARS / HOW IT WORKS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            How EcoCollect Works
          </h2>
          <p className="text-slate-600 text-sm">
            A transparent closed-loop system designed for high civic participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">AI Waste Classification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Snap a picture or point your phone camera at any household item. Our Gemini Vision model
              identifies the material, estimates weight, and prescribes the exact colored bin with
              preparation tips.
            </p>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>96.4% segregation precision</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Smart Bin Drop-Off</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Deposit your pre-sorted waste at your designated neighborhood smart station. Solar-powered
              IoT scales verify the weight and synchronize drop-off records directly to your account.
            </p>
            <div className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Real-time fill sensor alerts</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Direct UPI Cashout</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn 100 to 150 points for every kilogram of properly sorted recyclables or organic waste.
              Redeem anytime directly to your Google Pay, PhonePe, or bank account at 10 pts = ₹1 INR.
            </p>
            <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Zero transaction fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE CARBON & CO2 SAVINGS CALCULATOR */}
      <section className="bg-linear-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calculator size={16} />
              <span>Civic Sustainability Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading mt-1">
              Calculate Your Household Eco-Impact
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              See the exact greenhouse gas reduction and cash earnings from your weekly segregation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Waste Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'plastic', label: 'Plastic / PET', icon: '🧴' },
                  { id: 'organic', label: 'Wet Food Waste', icon: '🥗' },
                  { id: 'paper', label: 'Cardboard / Paper', icon: '📦' },
                  { id: 'metal', label: 'Aluminum / Cans', icon: '🥫' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setWasteType(cat.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      wasteType === cat.id
                        ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Estimated Weight: <span className="text-emerald-400 text-sm font-black">{weightKgInput} kg</span>
                </label>
                <span className="text-[11px] text-slate-400">Weekly family average: ~4-8 kg</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={0.5}
                value={weightKgInput}
                onChange={(e) => setWeightKgInput(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 kg</span>
                <span>15 kg</span>
                <span>30 kg</span>
                <span>50 kg</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <span className="text-xs text-emerald-300 font-medium block">CO2e Emissions Averted</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black font-heading text-white">{metrics.co2Saved}</span>
                <span className="text-xs text-emerald-300 font-bold">kg CO2</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Equivalent to avoiding ~{(parseFloat(metrics.co2Saved) * 4.2).toFixed(0)} km car travel</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <span className="text-xs text-emerald-300 font-medium block">Mature Tree-Years</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black font-heading text-white">{metrics.treesEquivalent}</span>
                <span className="text-xs text-emerald-300 font-bold">trees</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Annual oxygen output absorption equivalent</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <span className="text-xs text-amber-300 font-medium block">Earnable Points</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black font-heading text-white">+{metrics.potentialPoints}</span>
                <span className="text-xs text-amber-300 font-bold">pts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">100% redeemable on UPI</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <span className="text-xs text-amber-300 font-medium block">Instant Cash Payout</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black font-heading text-amber-300">₹{metrics.potentialInr}</span>
                <span className="text-[10px] text-amber-200 uppercase font-semibold">INR</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Direct deposit into your UPI account</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OFFICIAL WASTE SEGREGATION DIRECTORY */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Official Waste Segregation Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Search any household item to find the right municipal bin, points rate, and drop-off guidance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search items (e.g. Milk pouch, Batteries)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Biodegradable">Biodegradable (Green)</option>
              <option value="Non-Biodegradable">Non-Biodegradable (Blue)</option>
              <option value="Hazardous">Domestic Hazardous (Red)</option>
              <option value="E-Waste">E-Waste (Yellow)</option>
            </select>
          </div>
        </div>

        {/* Directory Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDirectory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.binColor === 'green'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.binColor === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : item.binColor === 'red'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.binLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">{item.preparationTip}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">Reward Rate</span>
                <span className="font-extrabold text-emerald-700">
                  {item.pointsPerKg} pts/kg (₹{(item.pointsPerKg * 0.1).toFixed(1)})
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredDirectory.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No items matched "{searchQuery}". Try searching for plastic, food, paper, or batteries.
          </div>
        )}
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <HelpCircle size={15} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about points, smart bins, and municipal guidelines.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-slate-50/40"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. MUNICIPAL CONTACT & ISSUE REPORTING FORM */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <Phone size={14} />
              <span>Civic Support & Helpline</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Have a Query or Need Smart Bin Assistance?
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Reach out to your local Ward Waste Management Officer, report an overflowing bin, or
              inquire about neighborhood community incentives.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Toll-Free Helpline</div>
                  <div className="text-xs text-slate-500">1800-ECO-TRASH (Mon-Sat 7am - 9pm)</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Email Correspondence</div>
                  <div className="text-xs text-slate-500">support@ecocollect.gov.in</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Central Municipal Operations</div>
                  <div className="text-xs text-slate-500">Civic Centre, Smart City Mission Floor 4</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200">
            {contactSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your message has been assigned Ticket #ECO-{Math.floor(100000 + Math.random() * 900000)}.
                  A ward coordinator will follow up within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sundaram"
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="priya@example.com"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Ward / Area</label>
                    <select
                      value={contactFormData.ward}
                      onChange={(e) => setContactFormData({ ...contactFormData, ward: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Green Valley Ward 4">Green Valley Ward 4</option>
                      <option value="Downtown Central Ward 7">Downtown Central Ward 7</option>
                      <option value="Riverside Colony Ward 12">Riverside Colony Ward 12</option>
                      <option value="Silicon Heights Ward 15">Silicon Heights Ward 15</option>
                      <option value="Other Ward">Other Municipal Ward</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                    <select
                      value={contactFormData.subject}
                      onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="Feedback & Smart Bin Query">General Feedback & Query</option>
                      <option value="Report Overflowing Bin">Report Overflowing / Damaged Smart Bin</option>
                      <option value="Housing Society Registration">RWA / Society Onboarding</option>
                      <option value="UPI Payout Support">Reward & UPI Payout Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or the specific bin location..."
                    value={contactFormData.message}
                    onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Send Inquiry to Ward Officer
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
