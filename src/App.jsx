import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Moon, Sun, Users, BookOpen, Heart, DollarSign, Zap, Leaf, MapPin, TrendingUp, TrendingDown, Minus, Activity, BarChart2, Clock, X, Plus, Globe } from 'lucide-react';

function cyrb128(str){let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;for(let i=0,k;i<str.length;i++){k=str.charCodeAt(i);h1=h2^Math.imul(h1^k,597399067);h2=h3^Math.imul(h2^k,2869860233);h3=h4^Math.imul(h3^k,951274213);h4=h1^Math.imul(h4^k,2716044179);}h1=Math.imul(h3^(h1>>>18),597399067);h2=Math.imul(h4^(h2>>>22),2869860233);h3=Math.imul(h1^(h3>>>17),951274213);h4=Math.imul(h2^(h4>>>19),2716044179);return[(h1^h2^h3^h4)>>>0,(h2^h1)>>>0,(h3^h1)>>>0,(h4^h1)>>>0];}
function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;var t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=c<<21|c>>>11;c=c+t|0;return(t>>>0)/4294967296;}}
function getSeededRandom(seedStr){const seed=cyrb128(seedStr);return sfc32(seed[0],seed[1],seed[2],seed[3]);}

// --- Nepal Provinces Baseline Data (Approx 2025 Estimates) ---
const PROVINCES_INFO = [
    { name: "Koshi", type: "Mixed_Hill_Terai", base: { pop: 5.1, gdp: 1200, lit: 72, for: 44, urb: 25 } },
    { name: "Madhesh", type: "Plains_Agri", base: { pop: 6.3, gdp: 1000, lit: 55, for: 4, urb: 20 } },
    { name: "Bagmati", type: "Metro_Hub", base: { pop: 6.2, gdp: 2500, lit: 82, for: 53, urb: 65 } },
    { name: "Gandaki", type: "Hill_Tourism", base: { pop: 2.5, gdp: 1400, lit: 76, for: 38, urb: 30 } },
    { name: "Lumbini", type: "Heritage_Agri", base: { pop: 5.2, gdp: 1150, lit: 68, for: 30, urb: 28 } },
    { name: "Karnali", type: "Alpine_Remote", base: { pop: 1.8, gdp: 850, lit: 58, for: 35, urb: 15 } },
    { name: "Sudurpashchim", type: "Hill_Border", base: { pop: 2.8, gdp: 900, lit: 62, for: 50, urb: 22 } }
];

const CATEGORIES = [
  { id: "Demographics", icon: Users, color: "text-indigo-500 dark:text-indigo-400" },
  { id: "Education", icon: BookOpen, color: "text-blue-500 dark:text-blue-400" },
  { id: "Health", icon: Heart, color: "text-rose-500 dark:text-rose-400" },
  { id: "Economy", icon: DollarSign, color: "text-red-500 dark:text-red-400" },
  { id: "Infrastructure", icon: Zap, color: "text-indigo-600 dark:text-indigo-500" },
  { id: "Environment", icon: Leaf, color: "text-emerald-500 dark:text-emerald-400" }
];

const generateProvinceData = (provinceName) => {
    const prov = PROVINCES_INFO.find(d => d.name === provinceName);
    const rand = getSeededRandom(provinceName);
    const years = [2025, 2030, 2035, 2040, 2045, 2050];
    const { pop, gdp, lit, urb, for: frst } = prov.base;
    const vf = 1 + (rand() * 0.1 - 0.05); 
    const approach = (start, target, rate, t) => target - (target - start) * Math.exp(-rate * t);

    // Nepal specific logic: High emigration (youth leaving), leading to slower pop growth but high remittances.
    const popGrowthRate = prov.type.includes('Metro') || prov.type.includes('Plains') ? 0.025 : 0.005; // Growth concentrated in Terai/KTM
    const popCurve = 0.005;

    const createRow = (name, cat, formula, decimals = 1, suffix = '', prefix = '') => {
        const values = {};
        years.forEach((yr, idx) => {
            const val = formula(idx, yr);
            const parts = Number(val).toFixed(decimals).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            values[yr] = prefix + parts.join('.') + suffix;
        });
        return { name, category: cat, values };
    };

    const data = [];
    
    // 1. Demographics
    data.push(createRow("Population (Millions)", "Demographics", (t) => pop * (1 + popGrowthRate * t - popCurve * t * t) * vf, 2));
    data.push(createRow("Population Density (per sq km)", "Demographics", (t) => (pop * 1000000 / (prov.type.includes('Metro') ? 3000 : (prov.type.includes('Alpine') ? 15000 : 8000))) * (1 + popGrowthRate * t) * vf, 0));
    data.push(createRow("Urbanization Rate (%)", "Demographics", (t) => approach(urb, prov.type.includes('Metro') ? 92 : 55, 0.25, t), 1, '%'));
    data.push(createRow("Gender Ratio (Females/1000 Males)", "Demographics", (t) => approach(1020 + rand()*30, 1050, 0.2, t), 0)); // High due to male out-migration
    data.push(createRow("Total Fertility Rate", "Demographics", (t) => Math.max(1.6, 2.0 - rand()*0.1 - 0.08 * t), 2));
    data.push(createRow("Elderly Population (60+ yrs) Share (%)", "Demographics", (t) => 9 + rand()*2 + 2.0 * t, 1, '%'));
    data.push(createRow("Working Age (15-59 yrs) Share (%)", "Demographics", (t) => 60 + rand()*2 - 0.4 * t, 1, '%')); 

    // 2. Education
    data.push(createRow("Overall Literacy Rate (%)", "Education", (t) => approach(lit, 95.0, 0.35, t), 1, '%'));
    data.push(createRow("Female Literacy Rate (%)", "Education", (t) => approach(Math.max(40, lit - 12), 94.0, 0.4, t), 1, '%'));
    data.push(createRow("Higher Education Gross Enrollment (%)", "Education", (t) => approach(15 + rand()*10, 55, 0.25, t), 1, '%'));
    data.push(createRow("Digital Literacy Rate (%)", "Education", (t) => approach(30 + urb*0.4, 88, 0.4, t), 1, '%'));

    // 3. Health
    data.push(createRow("Life Expectancy (Years)", "Health", (t) => approach(70 + rand()*3, 81, 0.2, t), 1));
    data.push(createRow("Infant Mortality Rate (per 1000 births)", "Health", (t) => approach(25 - rand()*5, 8, 0.35, t), 1));
    data.push(createRow("Maternal Mortality Ratio (per 100,000)", "Health", (t) => approach(140 - rand()*20, 35, 0.3, t), 0));
    data.push(createRow("Doctors (per 10,000 People)", "Health", (t) => approach(4 + rand()*3, 22, 0.3, t), 1));

    // 4. Economy
    data.push(createRow("GDP per Capita (USD)", "Economy", (t) => gdp * Math.pow(1.065, t * 5), 0, '', '$')); 
    data.push(createRow("Provincial GDP Growth Rate (%)", "Economy", (t) => Math.max(3.5, 7.5 - rand()*1.0 - 0.3 * t), 1, '%'));
    data.push(createRow("Unemployment Rate (%)", "Economy", (t) => Math.max(4.0, 10.5 - rand()*2.0 - 0.4 * t), 1, '%'));
    data.push(createRow("Remittance Inflows (% of GDP)", "Economy", (t) => approach(prov.type.includes('Metro') ? 15 : 28, 10, 0.2, t), 1, '%')); // Crucial metric, drops as domestic economy improves
    data.push(createRow("Hydro & Eco-Tourism Rev ($M)", "Economy", (t) => (prov.type.includes('Tourism') || prov.type.includes('Metro') ? 120 : 30) * Math.pow(1.6, t) * vf, 0, '', '$'));
    data.push(createRow("Wealth Disparity Index (0-100)", "Economy", (t) => approach(65 + (gdp/1500) + rand()*4, 78 + rand()*6, 0.15, t), 1));

    // 5. Infrastructure
    data.push(createRow("Electricity Availability (% Households)", "Infrastructure", (t) => approach(90, 100, 0.6, t), 1, '%'));
    data.push(createRow("Piped Water Access (% Households)", "Infrastructure", (t) => approach(45 + rand()*20, 95, 0.4, t), 1, '%'));
    data.push(createRow("Internet Penetration (%)", "Infrastructure", (t) => approach(40 + rand()*15, 96, 0.4, t), 1, '%'));
    data.push(createRow("Road Network Density (km/100 sq km)", "Infrastructure", (t) => approach(prov.type.includes('Metro') || prov.type.includes('Plains') ? 80 : 20, prov.type.includes('Metro') ? 150 : 60, 0.2, t), 0));

    // 6. Environment
    data.push(createRow("Air Quality Index (Annual Avg)", "Environment", (t) => approach(prov.type.includes('Metro') || prov.type.includes('Plains') ? 140 : 45, 55, 0.3, t), 0));
    data.push(createRow("Forest & Tree Cover (%)", "Environment", (t) => approach(frst, Math.min(65, frst + 5), 0.15, t), 1, '%'));
    data.push(createRow("Climate Resilience Index (0-100)", "Environment", (t) => approach(35 + rand()*10, 85, 0.35, t), 1)); 

    return data;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedProvince, setSelectedProvince] = useState("Bagmati");
  const [compareProvinces, setCompareProvinces] = useState(["Bagmati", "Gandaki", "Koshi"]);
  const [compareYear, setCompareYear] = useState(2050);
  
  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0a0a14' : '#f8fafc'; }, [darkMode]);

  const generatedData = useMemo(() => generateProvinceData(selectedProvince), [selectedProvince]);
  const activeProvinceInfo = useMemo(() => PROVINCES_INFO.find(d => d.name === selectedProvince), [selectedProvince]);
  const generatedCompareData = useMemo(() => compareProvinces.map(sName => ({ name: sName, data: generateProvinceData(sName), info: PROVINCES_INFO.find(d => d.name === sName) })), [compareProvinces]);

  const summaryMetrics = [
    { ...generatedData.find(m => m.name === "Population (Millions)"), icon: Users, color: "from-indigo-500 to-blue-400", shadow: "shadow-indigo-500/20" },
    { ...generatedData.find(m => m.name === "GDP per Capita (USD)"), icon: DollarSign, color: "from-rose-500 to-red-400", shadow: "shadow-rose-500/20" },
    { ...generatedData.find(m => m.name === "Hydro & Eco-Tourism Rev ($M)"), icon: Zap, color: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-500/20" }
  ];

  const getTrend = (val25, val50, metricName) => {
    const v1 = parseFloat(val25.toString().replace(/[^0-9.-]+/g,""));
    const v2 = parseFloat(val50.toString().replace(/[^0-9.-]+/g,""));
    const isInverse = ["Unemployment Rate (%)", "Wealth Disparity Index (0-100)", "Infant Mortality Rate (per 1000 births)", "Maternal Mortality Ratio (per 100,000)", "Air Quality Index (Annual Avg)"].includes(metricName);
    
    if (v2 > v1 * 1.02) return { icon: TrendingUp, color: isInverse ? "text-rose-500 dark:text-rose-400" : "text-emerald-500 dark:text-emerald-400", bg: isInverse ? "bg-rose-500/10" : "bg-emerald-500/10" };
    if (v2 < v1 * 0.98) return { icon: TrendingDown, color: isInverse ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400", bg: isInverse ? "bg-emerald-500/10" : "bg-rose-500/10" };
    return { icon: Minus, color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-500/10" };
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-[#1e0a11] dark:via-[#0a0a14] dark:to-[#091524] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-12 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-0 dark:opacity-100 mix-blend-overlay"></div>

        <header className="bg-gradient-to-r from-rose-800 via-indigo-800 to-blue-800 dark:from-[#1a050b]/90 dark:via-[#0a0a14]/90 dark:to-[#071121]/90 dark:backdrop-blur-lg text-white shadow-xl sticky top-0 z-50 border-b border-rose-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl shadow-inner border border-white/20 dark:border-white/10">
                <Globe size={32} className="text-rose-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">NEPAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-white to-indigo-300">2050</span></h1>
                <p className="text-indigo-100 text-xs font-semibold tracking-widest uppercase mt-0.5 opacity-80">National Projections Dashboard</p>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur transition-all shadow-sm border border-white/10">
              {darkMode ? <Sun size={20} className="text-rose-300" /> : <Moon size={20} className="text-indigo-100" />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col bg-white dark:bg-[#0c0c1a]/60 dark:backdrop-blur-xl rounded-2xl shadow-md border border-indigo-200 dark:border-white/10 mb-8 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-indigo-500/5 pointer-events-none"></div>
            <div className="relative z-10 p-5 border-b border-indigo-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex bg-indigo-50 dark:bg-black/40 p-1.5 rounded-xl border border-indigo-200 dark:border-white/5 w-full md:w-auto">
                <button onClick={() => setViewMode('timeline')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-[#1a0e14] text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Clock size={16}/> Province Timeline</button>
                <button onClick={() => setViewMode('compare')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'compare' ? 'bg-white dark:bg-[#0a0e1f] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><BarChart2 size={16}/> Compare Provinces</button>
              </div>
              {viewMode === 'compare' ? (
                <div className="flex items-center gap-3 w-full md:w-auto bg-indigo-50 dark:bg-[#0a0c1a] p-2.5 px-5 rounded-xl border border-indigo-200 dark:border-white/10 shadow-sm">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Target Year:</span>
                    <select value={compareYear} onChange={(e) => setCompareYear(Number(e.target.value))} className="bg-transparent text-rose-600 dark:text-rose-400 font-bold focus:outline-none pr-2 cursor-pointer text-base">
                        {[2025, 2030, 2035, 2040, 2045, 2050].map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
                    </select>
                </div>
              ) : <div className="text-xs text-slate-500 font-medium">Projecting 25 years of socio-economic evolution</div>}
            </div>

            <div className="relative z-10 p-5 flex flex-col md:flex-row items-center gap-4">
              {viewMode === 'timeline' ? (
                <>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hidden sm:block border dark:border-indigo-500/20"><MapPin className="text-indigo-600 dark:text-indigo-400" size={24} /></div>
                    <div><h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">Select Province <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-100 dark:bg-white/10 text-indigo-700 dark:text-indigo-300">{activeProvinceInfo.type.replace('_', ' ')}</span></h2></div>
                  </div>
                  <div className="relative w-full md:w-96 md:ml-auto">
                    <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} className="w-full appearance-none bg-indigo-50 dark:bg-[#0a0c1a] border border-indigo-200 dark:border-white/10 text-slate-800 dark:text-slate-200 py-3.5 px-5 rounded-xl font-semibold shadow-sm focus:ring-2 focus:ring-rose-500">{PROVINCES_INFO.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-500 pointer-events-none" size={20} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full">
                    {compareProvinces.map((dist, idx) => (
                        <div key={idx} className="flex-1 min-w-[240px] relative">
                            <div className="absolute -top-3 left-4 bg-white dark:bg-[#0a0c1a] px-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-full border border-indigo-200 dark:border-white/10 z-10 shadow-sm">Province {idx + 1}</div>
                            <select value={dist} onChange={(e) => { const n = [...compareProvinces]; n[idx] = e.target.value; setCompareProvinces(n); }} className="w-full appearance-none bg-indigo-50 dark:bg-[#0a0c1a] border border-indigo-200 dark:border-white/10 text-slate-800 dark:text-slate-200 py-3.5 px-4 rounded-xl font-semibold shadow-sm relative z-0">{PROVINCES_INFO.map(d => <option key={d.name} value={d.name} disabled={compareProvinces.includes(d.name) && d.name !== dist}>{d.name}</option>)}</select>
                            {compareProvinces.length > 1 && <button onClick={() => setCompareProvinces(compareProvinces.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:scale-110 z-20"><X size={12} strokeWidth={3} /></button>}
                        </div>
                    ))}
                    {compareProvinces.length < 3 && <button onClick={() => { const a = PROVINCES_INFO.find(d => !compareProvinces.includes(d.name)); if(a) setCompareProvinces([...compareProvinces, a.name]); }} className="flex-1 min-w-[240px] flex justify-center gap-2 border-2 border-dashed border-indigo-300 dark:border-white/20 bg-indigo-50/50 dark:bg-white/5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-white py-3 font-bold transition-colors"><Plus size={18} strokeWidth={3} /> Add Province</button>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {viewMode === 'timeline' ? (
              summaryMetrics.map((m) => {
                const Icon = m.icon;
                return (
                <div key={m.name} className={`bg-gradient-to-br from-white to-slate-50 dark:from-[#110912]/80 dark:to-[#070b14]/80 dark:backdrop-blur-xl p-6 rounded-3xl border border-indigo-200 dark:border-white/10 shadow-lg ${m.shadow} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                  <div className="absolute -top-4 -right-4 p-5 opacity-[0.03] dark:opacity-[0.05]"><Icon size={140} className="dark:text-white" /></div>
                  <div className="relative z-10 flex justify-between items-start mb-6"><div className={`p-3 rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-md`}><Icon size={24} /></div><div className="text-[10px] uppercase font-bold px-3 py-1.5 bg-indigo-100 dark:bg-white/10 rounded-full dark:text-indigo-200">2050 Proj.</div></div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 relative z-10">{m.name}</p>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-5 relative z-10 tracking-tight">{m.values[2050]}</h3>
                  <div className="flex items-center gap-2 text-sm pt-4 border-t border-indigo-200/50 dark:border-white/10 relative z-10"><span className="text-slate-500">2025:</span><span className="font-bold text-slate-700 dark:text-slate-200">{m.values[2025]}</span></div>
                </div>
              )})
            ) : (
              summaryMetrics.map((m, idx) => {
                const colors = ["from-indigo-500 to-blue-400", "from-rose-500 to-red-400", "from-emerald-500 to-teal-400"];
                const Icon = m.icon;
                return (
                  <div key={m.name} className={`bg-gradient-to-br from-white to-slate-50 dark:from-[#110912]/80 dark:to-[#070b14]/80 dark:backdrop-blur-xl p-6 rounded-3xl border border-indigo-200 dark:border-white/10 shadow-lg relative flex flex-col`}>
                    <div className="relative z-10 flex items-center gap-3 mb-5 border-b pb-4 border-indigo-100 dark:border-white/10"><div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[idx]} text-white`}><Icon size={20} /></div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.name}</p></div>
                    <div className="relative z-10 flex-1 flex flex-col justify-center gap-4">
                       {generatedCompareData.map(cd => (
                             <div key={cd.name} className="flex justify-between items-end">
                                <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase">{cd.info.type.replace('_', ' ')}</span><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cd.name}</span></div>
                                <span className="text-xl font-black text-slate-900 dark:text-white">{cd.data.find(x => x.name === m.name).values[compareYear]}</span>
                             </div>
                       ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          <div className="bg-white dark:bg-[#070914]/80 dark:backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-indigo-200 dark:border-white/10">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-indigo-100/50 dark:bg-[#0b0e1c] border-b border-indigo-200 dark:border-white/10 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-5 font-bold sticky left-0 bg-indigo-100/50 dark:bg-[#0b0e1c] z-20 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] w-1/3 min-w-[320px] text-slate-600 dark:text-slate-300">Metric <span className="normal-case text-xs font-normal opacity-70 ml-1">(42 Total)</span></th>
                    {viewMode === 'timeline' ? (
                      <>
                        {[2025, 2030, 2035, 2040, 2045, 2050].map(y => <th key={y} className="px-6 py-5 font-extrabold text-indigo-600 dark:text-rose-400 text-center min-w-[110px]">{y}</th>)}
                        <th className="px-6 py-5 font-extrabold text-center sticky right-0 bg-indigo-100/50 dark:bg-[#0b0e1c] z-20 shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] text-slate-500 dark:text-slate-400">Trend</th>
                      </>
                    ) : compareProvinces.map((d, i) => <th key={d} className={`px-6 ${i === compareProvinces.length-1?'pr-12':''} py-5 font-extrabold text-center w-[22%] ${i===0?'text-indigo-600 dark:text-indigo-400':i===1?'text-rose-600 dark:text-rose-400':'text-blue-600 dark:text-blue-400'}`}>{d}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 dark:divide-white/5">
                  {CATEGORIES.map(cat => {
                    const baseMetrics = viewMode === 'timeline' ? generatedData : generatedCompareData[0]?.data || [];
                    const catMetrics = baseMetrics.filter(m => m.category === cat.id);
                    return (
                      <React.Fragment key={cat.id}>
                        <tr className="bg-indigo-50/50 dark:bg-[#0d1226]"><td colSpan={viewMode === 'timeline'?8:compareProvinces.length+1} className="px-6 py-4 font-bold sticky left-0 bg-indigo-50/95 dark:bg-[#0d1226] z-10 text-slate-800 dark:text-slate-200 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]"><div className="flex items-center gap-3"><div className={`p-1.5 rounded-lg bg-white dark:bg-white/5 shadow-sm ${cat.color}`}><cat.icon size={18} /></div> <span className="tracking-widest uppercase text-xs">{cat.id}</span></div></td></tr>
                        {catMetrics.map((metric) => (
                           <tr key={metric.name} className="hover:bg-indigo-50/50 dark:hover:bg-white/[0.02] group transition-colors">
                              <td className="px-6 py-4 text-sm font-medium sticky left-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 text-slate-700 dark:text-slate-300 shadow-[1px_0_0_0_#e0e7ff] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">{metric.name}</td>
                              {viewMode === 'timeline' ? (
                                <>
                                  {[2025, 2030, 2035, 2040, 2045, 2050].map(y => <td key={y} className="px-6 py-4 text-sm text-center font-mono text-slate-600 dark:text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-rose-200 transition-colors">{metric.values[y]}</td>)}
                                  <td className="px-6 py-4 text-center sticky right-0 bg-white dark:bg-[#050814] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#080d1c] z-10 shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.05)] transition-colors">
                                      {(() => { const t = getTrend(metric.values[2025], metric.values[2050], metric.name); return <div className={`inline-flex p-1.5 rounded-lg ${t.bg} ${t.color}`} title="25-Year Trend"><t.icon size={16} strokeWidth={3}/></div>; })()}
                                  </td>
                                </>
                              ) : generatedCompareData.map((cd, i) => <td key={cd.name} className={`px-6 ${i===generatedCompareData.length-1?'pr-12':''} py-4 text-center font-mono font-bold text-slate-700 dark:text-slate-200 ${i===0?'group-hover:text-indigo-600 dark:group-hover:text-indigo-300':i===1?'group-hover:text-rose-600 dark:group-hover:text-rose-300':'group-hover:text-blue-600 dark:group-hover:text-blue-300'} transition-colors w-[22%]`}>{cd.data.find(m=>m.name===metric.name)?.values[compareYear]}</td>)}
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
    </div>
  );
}