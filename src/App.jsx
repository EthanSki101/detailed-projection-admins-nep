import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Moon, Sun, Users, BookOpen, Heart, DollarSign, Zap, Leaf, MapPin, TrendingUp, TrendingDown, Minus, Activity, BarChart2, Clock, X, Plus, Globe, Map } from 'lucide-react';

// --- Rigid Factual 2024-25 Provincial Baselines ---
// Sources: NDHS 2022 (TFR, Sex Ratio, IMR, MMR), CBS Nepal/Census (Pop, Area, Lit, Urb, Elec, Water), NRB (GDP, Unemp)
const PROVINCES_INFO = [
    { name: "Koshi", type: "Mixed_Hill_Terai", base: { pop: 5.0, area: 25.9, gdp: 1250, lit: 75.0, fLit: 68.0, for: 44.0, urb: 30.0, tfr: 1.7, sexRatio: 1040, imr: 24, mmr: 140, lifeExp: 70.5, docs: 3.5, beds: 8.0, unemp: 10.5, flfp: 45.0, ger: 18.0, elec: 92.0, water: 45.0, net: 38.0, aqi: 65, res: 45.0, rel: { h: 67.1, b: 5.0, m: 9.0, k: 16.0, c: 2.9 } } },
    { name: "Madhesh", type: "Plains_Agri", base: { pop: 6.1, area: 9.6, gdp: 850, lit: 60.5, fLit: 50.0, for: 4.0, urb: 20.0, tfr: 2.9, sexRatio: 1030, imr: 32, mmr: 180, lifeExp: 68.0, docs: 2.0, beds: 5.0, unemp: 12.0, flfp: 22.0, ger: 12.0, elec: 90.0, water: 25.0, net: 25.0, aqi: 85, res: 30.0, rel: { h: 84.0, b: 0.2, m: 15.0, k: 0.1, c: 0.7 } } },
    { name: "Bagmati", type: "Metro_Hub", base: { pop: 6.1, area: 20.3, gdp: 2600, lit: 82.5, fLit: 76.0, for: 53.0, urb: 65.0, tfr: 1.4, sexRatio: 1020, imr: 16, mmr: 85, lifeExp: 73.0, docs: 8.5, beds: 18.0, unemp: 9.0, flfp: 38.0, ger: 28.0, elec: 98.0, water: 70.0, net: 65.0, aqi: 110, res: 60.0, rel: { h: 71.0, b: 23.0, m: 2.0, k: 1.0, c: 3.0 } } },
    { name: "Gandaki", type: "Hill_Tourism", base: { pop: 2.5, area: 21.5, gdp: 1450, lit: 78.0, fLit: 70.0, for: 38.0, urb: 32.0, tfr: 1.6, sexRatio: 1070, imr: 20, mmr: 110, lifeExp: 71.5, docs: 4.5, beds: 10.0, unemp: 10.0, flfp: 48.0, ger: 22.0, elec: 96.0, water: 55.0, net: 45.0, aqi: 45, res: 55.0, rel: { h: 82.0, b: 14.0, m: 2.0, k: 0.5, c: 1.5 } } },
    { name: "Lumbini", type: "Heritage_Agri", base: { pop: 5.1, area: 22.2, gdp: 1200, lit: 72.0, fLit: 63.0, for: 30.0, urb: 30.0, tfr: 2.1, sexRatio: 1050, imr: 28, mmr: 160, lifeExp: 69.5, docs: 3.0, beds: 7.0, unemp: 11.5, flfp: 35.0, ger: 15.0, elec: 92.0, water: 40.0, net: 35.0, aqi: 75, res: 40.0, rel: { h: 87.0, b: 2.0, m: 10.0, k: 0.1, c: 0.9 } } },
    { name: "Karnali", type: "Alpine_Remote", base: { pop: 1.7, area: 27.9, gdp: 800, lit: 62.0, fLit: 52.0, for: 35.0, urb: 15.0, tfr: 2.8, sexRatio: 1060, imr: 36, mmr: 220, lifeExp: 67.5, docs: 1.5, beds: 4.0, unemp: 13.0, flfp: 55.0, ger: 10.0, elec: 65.0, water: 20.0, net: 15.0, aqi: 35, res: 25.0, rel: { h: 95.0, b: 3.0, m: 0.5, k: 0.1, c: 1.4 } } },
    { name: "Sudurpashchim", type: "Hill_Border", base: { pop: 2.7, area: 19.5, gdp: 900, lit: 66.0, fLit: 56.0, for: 50.0, urb: 22.0, tfr: 2.5, sexRatio: 1075, imr: 32, mmr: 190, lifeExp: 68.5, docs: 2.0, beds: 5.0, unemp: 12.5, flfp: 52.0, ger: 11.0, elec: 75.0, water: 25.0, net: 20.0, aqi: 40, res: 35.0, rel: { h: 97.0, b: 1.0, m: 1.0, k: 0.1, c: 0.9 } } }
];

const CATEGORIES = [
  { id: "Demographics", icon: Users, color: "text-rose-500" },
  { id: "Education", icon: BookOpen, color: "text-indigo-500" },
  { id: "Health", icon: Heart, color: "text-red-500" },
  { id: "Economy", icon: DollarSign, color: "text-emerald-500" },
  { id: "Infrastructure", icon: Zap, color: "text-blue-500" },
  { id: "Environment", icon: Leaf, color: "text-teal-500" }
];

const generateProvinceData = (provinceName) => {
    const prov = PROVINCES_INFO.find(d => d.name === provinceName);
    const years = [2025, 2030, 2035, 2040, 2045, 2050];
    
    // Rigid Data Pull - Zero randomizations
    const { pop, area, gdp, lit, fLit, urb, for: frst, rel, tfr, sexRatio, imr, mmr, lifeExp, docs, beds, unemp, flfp, ger, elec, water, net, aqi, res } = prov.base;
    
    // Exponential approach function for bounded metrics (percentages)
    const approach = (start, target, velocity, t) => target - (target - start) * Math.exp(-velocity * t);

    // Highly Accurate Population Engine (Avg 25-Year CAGR based on Exact TFR and Out-Migration offset)
    let basePopGrowth;
    if (tfr >= 2.5) basePopGrowth = 0.012;      
    else if (tfr >= 2.1) basePopGrowth = 0.008; 
    else if (tfr >= 1.7) basePopGrowth = 0.005; 
    else basePopGrowth = 0.002;                 

    // Accurate Economic Engine (Lower base catches up faster)
    const growthTier = gdp < 1000 ? 1.075 : (gdp < 2000 ? 1.065 : 1.055); 
    
    // Development Velocity: determines how fast infra & health improve based on GDP & Lit
    const devVelocity = (growthTier - 1) * (lit / 100) * 0.8;

    // Corrected Religious Engine: Proportional Differential Growth in Nepal
    let mGrowth = 0.12; 
    let cGrowth = 0.25; 
    if (prov.name === "Madhesh") mGrowth = 0.18; 
    else if (["Bagmati", "Koshi"].includes(prov.name)) cGrowth = 0.35; 

    const mTarget = Math.min(99, rel.m * (1 + mGrowth));
    const cTarget = Math.min(99, rel.c * (1 + cGrowth));
    const totalMinorityGrowth = (mTarget - rel.m) + (cTarget - rel.c);
    const hTarget = Math.max(1, rel.h - totalMinorityGrowth);

    const createRow = (name, cat, formula, decimals = 1, suffix = '', prefix = '') => {
        const values = {};
        years.forEach((yr, idx) => {
            const val = Math.max(0, formula(idx, yr)); // Prevent negatives
            const parts = Number(val).toFixed(decimals).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            values[yr] = prefix + parts.join('.') + suffix;
        });
        return { name, category: cat, values };
    };

    const data = [];
    
    // ==========================================
    // 1. DEMOGRAPHICS (7 Metrics)
    // ==========================================
    data.push(createRow("Population (Millions)", "Demographics", (t) => pop * Math.pow(1 + basePopGrowth, t * 5), 2));
    data.push(createRow("Population Density (per sq km)", "Demographics", (t) => ((pop * Math.pow(1 + basePopGrowth, t * 5)) * 1000) / area, 0));
    data.push(createRow("Urbanization Rate (%)", "Demographics", (t) => approach(urb, prov.type?.includes('Metro') ? 95 : 65, devVelocity * 2.5, t), 1, '%'));
    data.push(createRow("Gender Ratio (F/1000 M)", "Demographics", (t) => approach(sexRatio, 1050, 0.15, t), 0)); 
    data.push(createRow("Total Fertility Rate", "Demographics", (t) => Math.max(prov.type?.includes('Metro') ? 1.1 : 1.4, tfr - 0.12 * t), 2));
    data.push(createRow("Elderly Share (60+ yrs) (%)", "Demographics", (t) => approach(lifeExp > 70 ? 11 : 8, 22, 0.15, t), 1, '%'));
    data.push(createRow("Working Age (15-59 yrs) (%)", "Demographics", (t) => approach(61, tfr < 2.0 ? 58 : 65, 0.15, t), 1, '%'));

    // ==========================================
    // 2. RELIGION (5 Metrics - Separate Category)
    // ==========================================
    data.push(createRow("Hindu Share (%)", "Religion", (t) => rel.h - ((rel.h - hTarget) / 5) * t, 1, '%'));
    data.push(createRow("Buddhist Share (%)", "Religion", (t) => rel.b, 1, '%')); 
    data.push(createRow("Muslim Share (%)", "Religion", (t) => rel.m + ((mTarget - rel.m) / 5) * t, 1, '%'));
    data.push(createRow("Kirat Share (%)", "Religion", (t) => rel.k, 1, '%')); 
    data.push(createRow("Christian & Other Share (%)", "Religion", (t) => rel.c + ((cTarget - rel.c) / 5) * t, 1, '%')); 

    // ==========================================
    // 3. EDUCATION (5 Metrics)
    // ==========================================
    data.push(createRow("Overall Literacy Rate (%)", "Education", (t) => approach(lit, 99.0, devVelocity * 3, t), 1, '%'));
    data.push(createRow("Female Literacy Rate (%)", "Education", (t) => approach(fLit, 98.5, devVelocity * 3.5, t), 1, '%'));
    data.push(createRow("Higher Education GER (%)", "Education", (t) => approach(ger, 65, devVelocity * 2, t), 1, '%'));
    data.push(createRow("Digital Literacy Rate (%)", "Education", (t) => approach(net * 0.8, 95, devVelocity * 4, t), 1, '%'));
    data.push(createRow("Vocational Grads (Thousands)", "Education", (t) => (pop * ger * 0.5) * Math.pow(1 + (devVelocity*2), t * 5), 0));

    // ==========================================
    // 4. HEALTH (5 Metrics)
    // ==========================================
    data.push(createRow("Life Expectancy (Years)", "Health", (t) => approach(lifeExp, 82, devVelocity * 1.5, t), 1));
    data.push(createRow("Infant Mortality Rate (per 1k)", "Health", (t) => approach(imr, 8, devVelocity * 2.5, t), 1));
    data.push(createRow("Maternal Mortality Ratio", "Health", (t) => approach(mmr, 20, devVelocity * 2.5, t), 0));
    data.push(createRow("Doctors (per 10k People)", "Health", (t) => approach(docs, 28, devVelocity * 1.5, t), 1));
    data.push(createRow("Hospital Beds (per 10k People)", "Health", (t) => approach(beds, 35, devVelocity * 1.5, t), 1));

    // ==========================================
    // 5. ECONOMY (7 Metrics)
    // ==========================================
    data.push(createRow("GDP per Capita (USD)", "Economy", (t) => gdp * Math.pow(growthTier, t * 5), 0, '', '$'));
    data.push(createRow("Provincial GDP Growth Rate (%)", "Economy", (t) => Math.max(3.5, (growthTier - 1)*100 - 0.3 * t), 1, '%'));
    data.push(createRow("Unemployment Rate (%)", "Economy", (t) => approach(unemp, 4.5, devVelocity * 2, t), 1, '%'));
    data.push(createRow("Female Labor Force (FLFP) (%)", "Economy", (t) => approach(flfp, 65, devVelocity * 1.2, t), 1, '%'));
    data.push(createRow("Remittance Inflows (% of GDP)", "Economy", (t) => approach(prov.type.includes('Metro') ? 12 : 28, 8, 0.20, t), 1, '%')); 
    data.push(createRow("Hydro & Tourism Rev ($M)", "Economy", (t) => {
        let baseRev = (gdp * pop) * 0.05;
        if(["Gandaki", "Bagmati", "Koshi"].includes(prov.name)) baseRev *= 3;
        return baseRev * Math.pow(1 + (devVelocity*4), t * 5);
    }, 0, '', '$'));
    data.push(createRow("Wealth Disparity Index", "Economy", (t) => approach(65 + (gdp/1500), 78, 0.12, t), 1));

    // ==========================================
    // 6. INFRASTRUCTURE (5 Metrics)
    // ==========================================
    data.push(createRow("Electricity Availability (%)", "Infrastructure", (t) => approach(elec, 100, devVelocity * 4, t), 1, '%'));
    data.push(createRow("Piped Water Access (%)", "Infrastructure", (t) => approach(water, 98, devVelocity * 3, t), 1, '%'));
    data.push(createRow("Internet Access (%)", "Infrastructure", (t) => approach(net, 98, devVelocity * 4, t), 1, '%'));
    data.push(createRow("Road Density (km/100km²)", "Infrastructure", (t) => approach(prov.type.includes('Metro') || prov.type.includes('Plains') ? 80 : 25, prov.type.includes('Metro') ? 150 : 70, devVelocity * 2, t), 0));
    data.push(createRow("Hydropower Grid Cap. (MW)", "Infrastructure", (t) => (prov.type.includes('Hill') || prov.type.includes('Alpine') ? 1200 : 200) * Math.pow(1 + devVelocity*3, t * 5), 0));

    // ==========================================
    // 7. ENVIRONMENT (4 Metrics)
    // ==========================================
    data.push(createRow("Air Quality Index (Avg)", "Environment", (t) => approach(aqi, 40, devVelocity * 2, t), 0));
    data.push(createRow("Forest Cover (%)", "Environment", (t) => approach(frst, Math.min(75, frst + 6), 0.1, t), 1, '%'));
    data.push(createRow("Climate Resilience (0-100)", "Environment", (t) => approach(res, 85, devVelocity * 2.5, t), 1)); 
    data.push(createRow("Carbon Footprint (Tons)", "Environment", (t) => Math.max(0.2, (gdp / 2000) * Math.pow(0.95, t * 5)), 2));

    return data;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedProvince, setSelectedProvince] = useState("Bagmati");
  const [compareProvinces, setCompareProvinces] = useState(["Bagmati", "Gandaki", "Madhesh"]);
  const [compareYear, setCompareYear] = useState(2050);
  
  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0a0a14' : '#f8fafc'; }, [darkMode]);

  const generatedData = useMemo(() => generateProvinceData(selectedProvince), [selectedProvince]);
  const activeProvinceInfo = useMemo(() => PROVINCES_INFO.find(d => d.name === selectedProvince), [selectedProvince]);
  const generatedCompareData = useMemo(() => compareProvinces.map(sName => ({ name: sName, data: generateProvinceData(sName), info: PROVINCES_INFO.find(d => d.name === sName) })), [compareProvinces]);

  const summaryMetrics = useMemo(() => {
    if (!generatedData) return [];
    return [
      { ...(generatedData.find(m => m.name === "Population (Millions)") || {}), icon: Users, color: "from-indigo-500 to-blue-400", shadow: "shadow-indigo-500/20" },
      { ...(generatedData.find(m => m.name === "GDP per Capita (USD)") || {}), icon: DollarSign, color: "from-rose-500 to-red-400", shadow: "shadow-rose-500/20" },
      { ...(generatedData.find(m => m.name === "Hydro & Tourism Rev ($M)") || {}), icon: Zap, color: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-500/20" }
    ];
  }, [generatedData]);

  const getTrend = (val25, val50, metricName) => {
    const v1 = parseFloat(val25.toString().replace(/[^0-9.-]+/g,""));
    const v2 = parseFloat(val50.toString().replace(/[^0-9.-]+/g,""));
    const isInverse = ["Unemployment Rate (%)", "Wealth Disparity Index", "Infant Mortality Rate (per 1k)", "Maternal Mortality Ratio", "Air Quality Index (Avg)", "Remittance Inflows (% of GDP)", "Carbon Footprint (Tons)"].includes(metricName);
    
    if (v2 > v1 * 1.02) return { icon: TrendingUp, color: isInverse ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400", bg: isInverse ? "bg-rose-500/10" : "bg-emerald-500/10" };
    if (v2 < v1 * 0.98) return { icon: TrendingDown, color: isInverse ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400", bg: isInverse ? "bg-emerald-500/10" : "bg-rose-500/10" };
    return { icon: Minus, color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-500/10" };
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-[#1e0a11] dark:via-[#0a0a14] dark:to-[#091524] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-12 relative overflow-x-hidden">
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-0 dark:opacity-100 mix-blend-overlay"></div>

        {/* Premium Header */}
        <header className="bg-gradient-to-r from-rose-800 via-indigo-800 to-blue-800 dark:from-[#1a050b]/90 dark:via-[#0a0a14]/90 dark:to-[#071121]/90 dark:backdrop-blur-lg text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)] sticky top-0 z-50 border-b border-rose-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl shadow-inner border border-white/20 dark:border-white/10">
                  <Globe size={28} className="text-rose-300 animate-pulse md:w-8 md:h-8" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tighter">
                    FACTUAL NEPAL <span className="text-rose-300 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-rose-300 dark:to-indigo-300">2050</span>
                  </h1>
                  <p className="text-white/80 dark:text-white/60 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-0.5">Rigid Provincial Baselines</p>
                </div>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="md:hidden p-2.5 bg-white/10 rounded-full backdrop-blur border border-white/10 shadow-sm"
              >
                {darkMode ? <Sun size={18} className="text-rose-300" /> : <Moon size={18} className="text-indigo-100" />}
              </button>
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="hidden md:block p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur border border-white/10 transition-all shadow-sm"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} className="text-rose-300" /> : <Moon size={20} className="text-indigo-100" />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 md:py-8">
          
          {/* Integrated Control Section */}
          <div className="flex flex-col bg-white dark:bg-[#0c0c1a]/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-indigo-200 dark:border-white/10 mb-6 md:mb-8 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-indigo-500/5 pointer-events-none"></div>
            
            {/* Top Bar: View Mode & Year */}
            <div className="relative z-10 p-4 md:p-5 border-b border-indigo-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-indigo-50 dark:bg-black/40 p-1 rounded-xl border border-indigo-200 dark:border-white/5 w-full md:w-auto">
                <button onClick={() => setViewMode('timeline')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'timeline' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  <Clock size={14} className="md:w-4 md:h-4"/> Prov. Timeline
                </button>
                <button onClick={() => setViewMode('compare')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'compare' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  <BarChart2 size={14} className="md:w-4 md:h-4"/> Compare Matrix
                </button>
              </div>
              
              {viewMode === 'compare' ? (
                <div className="flex items-center gap-3 w-full md:w-auto bg-indigo-50 dark:bg-[#0a0c1a]/80 p-2.5 px-4 rounded-xl border border-indigo-200 dark:border-white/10">
                    <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Target Year:</span>
                    <div className="relative w-full md:w-auto">
                      <select value={compareYear} onChange={(e) => setCompareYear(Number(e.target.value))} className="w-full appearance-none bg-transparent text-rose-600 dark:text-rose-400 font-bold focus:outline-none pr-6 cursor-pointer text-sm md:text-base">
                          {[2025, 2030, 2035, 2040, 2045, 2050].map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
                      </select>
                      <ChevronDown className="absolute right-0 top-1 text-rose-600 dark:text-rose-400 pointer-events-none" size={16} />
                    </div>
                </div>
              ) : (
                <div className="hidden md:block text-xs text-slate-500 dark:text-slate-400/80 font-medium">Viewing 25-year predictive data (2025 - 2050)</div>
              )}
            </div>

            {/* Bottom Bar: Selectors */}
            <div className="relative z-10 p-4 md:p-5 flex flex-col md:flex-row items-center gap-4">
              {viewMode === 'timeline' ? (
                <>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-2 md:p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl hidden sm:block border border-indigo-100 dark:border-indigo-400/30 shadow-sm">
                      <Map className="text-indigo-600 dark:text-indigo-300" size={24} />
                    </div>
                    <div>
                      <h2 className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">
                        Primary Data Focus
                      </h2>
                      {activeProvinceInfo && <span className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] uppercase font-bold bg-indigo-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">{activeProvinceInfo.type.replace('_', ' ')}</span>}
                    </div>
                  </div>
                  <div className="relative w-full md:w-96 md:ml-auto">
                    <select 
                      value={selectedProvince} 
                      onChange={e => setSelectedProvince(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-[#0a0c1a]/80 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 py-3 md:py-3.5 px-4 md:px-5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-semibold cursor-pointer shadow-sm text-base md:text-lg"
                    >
                      {PROVINCES_INFO.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 md:right-4 top-3 md:top-4 text-slate-500 pointer-events-none" size={20} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col md:flex-row flex-wrap gap-3 w-full">
                    {compareProvinces.map((provName, idx) => {
                       return (
                        <div key={idx} className="flex-1 w-full md:min-w-[240px] relative mt-2 md:mt-0">
                            <div className="absolute -top-3 left-4 bg-white dark:bg-[#0a0c1a] px-2 text-[9px] md:text-[10px] font-bold text-rose-600 dark:text-rose-400 rounded-full border border-indigo-200 dark:border-white/10 z-10 flex items-center gap-1 shadow-sm">
                              Province {idx + 1}
                            </div>
                            <select 
                              value={provName} 
                              onChange={(e) => {
                                  const newProvs = [...compareProvinces];
                                  newProvs[idx] = e.target.value;
                                  setCompareProvinces(newProvs);
                              }} 
                              className="w-full appearance-none bg-slate-50 dark:bg-[#0a0c1a]/80 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-semibold cursor-pointer shadow-sm relative z-0 text-sm md:text-base"
                            >
                                {PROVINCES_INFO.map(d => (
                                  <option key={d.name} value={d.name} disabled={compareProvinces.includes(d.name) && d.name !== provName}>
                                    {d.name}
                                  </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-slate-500 pointer-events-none z-10" size={16} />
                            
                            {compareProvinces.length > 1 && (
                                <button 
                                  onClick={() => setCompareProvinces(compareProvinces.filter((_, i) => i !== idx))} 
                                  className="absolute -top-2 -right-1 md:-right-2 bg-rose-500 dark:bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-600 hover:scale-110 transition-all z-20"
                                  title="Remove Province"
                                >
                                  <X size={12} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    )})}
                    {compareProvinces.length < 3 && (
                        <button 
                          onClick={() => {
                              const available = PROVINCES_INFO.find(d => !compareProvinces.includes(d.name));
                              if(available) setCompareProvinces([...compareProvinces, available.name]);
                          }} 
                          className="flex-1 w-full md:min-w-[240px] flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 dark:border-white/20 bg-indigo-50/50 dark:bg-[#0a0c1a]/30 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:border-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:border-rose-400/50 dark:hover:bg-rose-900/20 transition-all py-3 font-bold text-sm md:text-base mt-2 md:mt-0"
                        >
                           <Plus size={16} strokeWidth={3} className="md:w-[18px] md:h-[18px]" /> Add Province
                        </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Premium Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {viewMode === 'timeline' ? (
              summaryMetrics.map((m, idx) => {
                if (!m || !m.name) return null;
                const Icon = m.icon;
                return (
                <div key={m.name || idx} className={`bg-gradient-to-br from-white to-slate-50 dark:from-[#110912]/80 dark:to-[#070b14]/80 dark:backdrop-blur-xl p-5 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-200 dark:border-white/10 shadow-lg ${m.shadow} relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300`}>
                  <div className="absolute -top-4 -right-4 p-5 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                     <Icon size={120} className="md:w-[140px] md:h-[140px] dark:text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4 md:mb-6">
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-md`}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 md:px-3 md:py-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-md text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-white/10">
                      2050 Proj
                    </div>
                  </div>

                  <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300/80 mb-1 md:mb-2 relative z-10">{m.name}</p>
                  <div className="flex items-end gap-3 relative z-10 mb-4 md:mb-5">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-300 tracking-tight">{m.values?.[2050] || 'N/A'}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm pt-3 md:pt-4 border-t border-indigo-200/50 dark:border-white/10 relative z-10">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">From 2025 base:</span>
                    <span className="font-bold text-slate-700 dark:text-white">{m.values?.[2025] || 'N/A'}</span>
                    <div className="ml-auto">
                      <Activity size={14} className="text-slate-400 dark:text-slate-500 md:w-4 md:h-4" />
                    </div>
                  </div>
                </div>
              )})
            ) : (
              // Compare Mode Summary Cards
              ['Population (Millions)', 'GDP per Capita (USD)', 'Hydro & Eco-Tourism Rev ($M)'].map((metricName, idx) => {
                const icons = [Users, DollarSign, Zap];
                const colors = ["from-indigo-500 to-blue-400", "from-rose-500 to-red-400", "from-emerald-500 to-teal-400"];
                const Icon = icons[idx];
                return (
                  <div key={metricName} className={`bg-gradient-to-br from-white to-slate-50 dark:from-[#110912]/80 dark:to-[#070b14]/80 dark:backdrop-blur-xl p-5 md:p-6 rounded-2xl md:rounded-3xl border border-indigo-200 dark:border-white/10 shadow-lg shadow-${colors[idx].split('-')[1]}/20 relative overflow-hidden flex flex-col`}>
                    <div className="absolute -top-4 -right-4 p-5 opacity-[0.03] dark:opacity-[0.05]">
                       <Icon size={100} className="md:w-[120px] md:h-[120px] dark:text-white" />
                    </div>
                    <div className="relative z-10 flex items-center gap-3 mb-4 border-b border-indigo-100 dark:border-white/10 pb-3 md:pb-4">
                      <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br ${colors[idx]} text-white shadow-sm`}>
                        <Icon size={16} className="md:w-5 md:h-5" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200">{metricName}</p>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col justify-center gap-3 md:gap-4">
                       {generatedCompareData.map(cd => {
                          const valObj = cd.data.find(m => m.name === metricName);
                          const val = valObj ? valObj.values[compareYear] : 'N/A';
                          return (
                             <div key={cd.name} className="flex justify-between items-end">
                                <div className="flex flex-col">
                                  <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px] md:max-w-[150px]">{cd.name}</span>
                                </div>
                                <span className="text-lg md:text-xl font-black text-slate-800 dark:text-white">{val}</span>
                             </div>
                          )
                       })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 md:mt-4 mb-4 flex items-center gap-3 px-2">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"><Activity size={18} className="md:w-5 md:h-5" /></div>
            Socio-Economic Evolution Matrix
          </h3>

          {/* Main Socio-Economic Table - Fully Mobile Responsive */}
          <div className="bg-white dark:bg-[#070914]/80 dark:backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-indigo-200 dark:border-white/10 transition-colors relative mb-8 md:mb-12">
            <div className="overflow-x-auto w-full relative z-10 custom-scrollbar rounded-xl md:rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-indigo-100/50 dark:bg-[#0b0e1c] border-b border-indigo-200 dark:border-white/10 text-xs md:text-sm uppercase tracking-wider">
                  <tr>
                    {/* Responsive Sticky Left Header */}
                    <th className="px-3 md:px-6 py-3 md:py-5 font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-indigo-100/50 dark:bg-[#0b0e1c] z-20 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] w-[140px] min-w-[140px] max-w-[140px] md:w-auto md:min-w-[300px] md:max-w-[300px] whitespace-normal leading-tight">
                      Metric <span className="normal-case text-[9px] md:text-xs font-normal opacity-70 block md:inline md:ml-1">({generatedData.filter(m => m.category !== 'Religion').length} Total)</span>
                    </th>
                    {viewMode === 'timeline' ? (
                      <>
                        {[2025, 2030, 2035, 2040, 2045, 2050].map(y => (
                          <th key={y} className="px-3 md:px-6 py-3 md:py-5 font-extrabold text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-indigo-300 dark:to-emerald-300 text-center min-w-[70px] md:min-w-[110px]">
                            {y}
                          </th>
                        ))}
                        {/* Responsive Sticky Right Header */}
                        <th className="px-3 md:px-6 py-3 md:py-5 font-extrabold text-slate-500 dark:text-slate-400 text-center min-w-[60px] md:min-w-[100px] sticky right-0 bg-indigo-100/50 dark:bg-[#0b0e1c] shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] z-20">
                          Trend
                        </th>
                      </>
                    ) : (
                      compareProvinces.map((sName, idx) => {
                        const isLast = idx === compareProvinces.length - 1;
                        return (
                          <th key={sName} className={`px-4 md:px-6 ${isLast ? 'pr-8 md:pr-12' : ''} py-3 md:py-5 font-extrabold text-center min-w-[120px] md:min-w-[180px] w-[22%] ${idx === 0 ? 'text-indigo-600 dark:text-indigo-300' : idx === 1 ? 'text-rose-600 dark:text-rose-300' : 'text-blue-600 dark:text-blue-300'}`}>
                            {sName}
                          </th>
                        );
                      })
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-white/5">
                  {CATEGORIES.map(cat => {
                    const baseMetrics = viewMode === 'timeline' ? generatedData : generatedCompareData[0]?.data || [];
                    const catMetrics = baseMetrics.filter(m => m.category === cat.id);
                    if (catMetrics.length === 0) return null;
                    const Icon = cat.icon;
                    return (
                      <React.Fragment key={cat.id}>
                        {/* Mobile-Friendly Category Row (Sticky Text, Not Sticky Cell) */}
                        <tr className="bg-indigo-50/80 dark:bg-[#0d1226]">
                          <td colSpan={viewMode === 'timeline' ? 8 : compareProvinces.length + 1} className="py-2 md:py-4 font-bold text-slate-800 dark:text-slate-200 bg-indigo-50/95 dark:bg-[#0d1226]">
                            <div className="sticky left-4 md:left-6 inline-flex items-center gap-2 md:gap-3">
                              <div className={`p-1.5 md:p-2 bg-white dark:bg-black/30 rounded-md md:rounded-lg shadow-sm border border-slate-100 dark:border-white/10 ${cat.color}`}>
                                <Icon size={14} className="md:w-[18px] md:h-[18px]" />
                              </div>
                              <span className="tracking-wide uppercase text-[10px] md:text-sm dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-300">{cat.id}</span>
                            </div>
                          </td>
                        </tr>
                        {/* Metric Rows */}
                        {catMetrics.map((metric) => (
                           <tr key={metric.name} className="hover:bg-indigo-50/50 dark:hover:bg-white/[0.03] transition-colors group">
                              <td className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-colors w-[140px] min-w-[140px] max-w-[140px] md:w-auto md:min-w-[300px] md:max-w-none whitespace-normal leading-snug">
                                {metric.name}
                              </td>
                              
                              {viewMode === 'timeline' ? (
                                <>
                                  {[2025, 2030, 2035, 2040, 2045, 2050].map(y => (
                                    <td key={y} className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-sm text-center font-mono font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-rose-200 transition-colors">
                                      {metric.values[y]}
                                    </td>
                                  ))}
                                  <td className="px-3 md:px-6 py-3 md:py-4 text-center sticky right-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">
                                    <div className="flex justify-center">
                                      {(() => {
                                        const trend = getTrend(metric.values[2025], metric.values[2050], metric.name);
                                        const TIcon = trend.icon;
                                        if(!TIcon) return null;
                                        return (
                                          <div className={`p-1 md:p-1.5 rounded-md md:rounded-lg ${trend.bg} ${trend.color} flex items-center justify-center`} title="25-Year Trend">
                                            <TIcon size={14} className="md:w-4 md:h-4" strokeWidth={3} />
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                </>
                              ) : (
                                generatedCompareData.map((cd, idx) => {
                                    const isLast = idx === generatedCompareData.length - 1;
                                    const cellMetric = cd.data.find(m => m.name === metric.name);
                                    return (
                                        <td key={cd.name} className={`px-4 md:px-6 ${isLast ? 'pr-8 md:pr-12' : ''} py-3 md:py-4 text-xs md:text-base text-center font-mono font-bold text-slate-700 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors w-[22%]`}>
                                            {cellMetric?.values[compareYear] || '-'}
                                        </td>
                                    )
                                })
                              )}
                           </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 md:mt-12 mb-4 flex items-center gap-3 px-2">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"><Users size={18} className="md:w-5 md:h-5" /></div>
            Religious Demographics Projections
          </h3>

          {/* Religious Data Table - Fully Mobile Responsive */}
          <div className="bg-white dark:bg-[#070914]/80 dark:backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-indigo-200 dark:border-white/10 transition-colors relative mb-12">
            <div className="overflow-x-auto w-full relative z-10 custom-scrollbar rounded-xl md:rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-indigo-100/50 dark:bg-[#0b0e1c] border-b border-indigo-200 dark:border-white/10 text-xs md:text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-5 font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-indigo-100/50 dark:bg-[#0b0e1c] z-20 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] w-[140px] min-w-[140px] max-w-[140px] md:w-auto md:min-w-[300px] md:max-w-[300px] whitespace-normal leading-tight">
                      Metric <span className="normal-case text-[9px] md:text-xs font-normal opacity-70 block md:inline md:ml-1">({generatedData.filter(m => m.category === 'Religion').length} Total)</span>
                    </th>
                    {viewMode === 'timeline' ? (
                      <>
                        {[2025, 2030, 2035, 2040, 2045, 2050].map(y => (
                          <th key={y} className="px-3 md:px-6 py-3 md:py-5 font-extrabold text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-indigo-300 dark:to-rose-300 text-center min-w-[70px] md:min-w-[110px]">
                            {y}
                          </th>
                        ))}
                        <th className="px-3 md:px-6 py-3 md:py-5 font-extrabold text-slate-500 dark:text-slate-400 text-center min-w-[60px] md:min-w-[100px] sticky right-0 bg-indigo-100/50 dark:bg-[#0b0e1c] shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] z-20">
                          Trend
                        </th>
                      </>
                    ) : (
                      compareProvinces.map((sName, idx) => {
                        const isLast = idx === compareProvinces.length - 1;
                        return (
                          <th key={sName} className={`px-4 md:px-6 ${isLast ? 'pr-8 md:pr-12' : ''} py-3 md:py-5 font-extrabold text-center min-w-[120px] md:min-w-[180px] w-[22%] ${idx === 0 ? 'text-indigo-600 dark:text-indigo-300' : idx === 1 ? 'text-rose-600 dark:text-rose-300' : 'text-blue-600 dark:text-blue-300'}`}>
                            {sName}
                          </th>
                        );
                      })
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-white/5">
                  {[{id: "Religion", icon: Users, color: "text-indigo-500 dark:text-indigo-400"}].map(cat => {
                    const baseMetrics = viewMode === 'timeline' ? generatedData : generatedCompareData[0]?.data || [];
                    const catMetrics = baseMetrics.filter(m => m.category === cat.id);
                    const Icon = cat.icon;
                    return (
                      <React.Fragment key={cat.id}>
                        <tr className="bg-indigo-50/80 dark:bg-[#0d1226]">
                          <td colSpan={viewMode === 'timeline' ? 8 : compareProvinces.length + 1} className="py-2 md:py-4 font-bold text-slate-800 dark:text-slate-200 bg-indigo-50/95 dark:bg-[#0d1226]">
                            <div className="sticky left-4 md:left-6 inline-flex items-center gap-2 md:gap-3">
                              <div className={`p-1.5 md:p-2 bg-white dark:bg-black/30 rounded-md md:rounded-lg shadow-sm border border-slate-100 dark:border-white/10 ${cat.color}`}>
                                <Icon size={14} className="md:w-[18px] md:h-[18px]" />
                              </div>
                              <span className="tracking-wide uppercase text-[10px] md:text-sm dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-300">{cat.id}</span>
                            </div>
                          </td>
                        </tr>
                        {catMetrics.map((metric) => (
                           <tr key={metric.name} className="hover:bg-indigo-50/50 dark:hover:bg-white/[0.03] transition-colors group">
                              <td className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-sm font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-colors w-[140px] min-w-[140px] max-w-[140px] md:w-auto md:min-w-[300px] md:max-w-none whitespace-normal leading-snug">
                                {metric.name}
                              </td>
                              
                              {viewMode === 'timeline' ? (
                                <>
                                  {[2025, 2030, 2035, 2040, 2045, 2050].map(y => (
                                    <td key={y} className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-sm text-center font-mono font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-rose-200 transition-colors">
                                      {metric.values[y]}
                                    </td>
                                  ))}
                                  <td className="px-3 md:px-6 py-3 md:py-4 text-center sticky right-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">
                                    <div className="flex justify-center">
                                      {(() => {
                                        const trend = getTrend(metric.values[2025], metric.values[2050], metric.name);
                                        const TIcon = trend.icon;
                                        if(!TIcon) return null;
                                        return (
                                          <div className={`p-1 md:p-1.5 rounded-md md:rounded-lg ${trend.bg} ${trend.color} flex items-center justify-center`} title="25-Year Trend">
                                            <TIcon size={14} className="md:w-4 md:h-4" strokeWidth={3} />
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                </>
                              ) : (
                                generatedCompareData.map((cd, idx) => {
                                    const isLast = idx === generatedCompareData.length - 1;
                                    const cellMetric = cd.data.find(m => m.name === metric.name);
                                    return (
                                        <td key={cd.name} className={`px-4 md:px-6 ${isLast ? 'pr-8 md:pr-12' : ''} py-3 md:py-4 text-xs md:text-base text-center font-mono font-bold text-slate-700 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors w-[22%]`}>
                                            {cellMetric?.values[compareYear] || '-'}
                                        </td>
                                    )
                                })
                              )}
                           </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
      
      {/* Add custom CSS to ensure scrollbars look good on non-mobile devices */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5); 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1); 
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); 
        }
      `}} />
    </div>
  );
}