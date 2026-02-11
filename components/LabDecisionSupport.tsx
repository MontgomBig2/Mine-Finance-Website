import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { GitCompare, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ComparisonInput {
  name: string;
  investment: number | '';
  revenue: number | '';
  life: number | '';
}

interface ChartDataPoint {
  rate: number;
  npvA: number;
  npvB: number;
}

export const LabDecisionSupport: React.FC = () => {
  const [projA, setProjA] = useState<ComparisonInput>({ name: 'Project A', investment: 50, revenue: 12, life: 10 });
  const [projB, setProjB] = useState<ComparisonInput>({ name: 'Project B', investment: 80, revenue: 18, life: 12 });
  
  const [verdict, setVerdict] = useState<string>('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!process.env.API_KEY) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Get Verdict Text
      const textPrompt = `
        Perform Incremental Analysis for two projects:
        Project A: Investment $${projA.investment}M, Revenue $${projA.revenue}M, Life ${projA.life}yrs.
        Project B: Investment $${projB.investment}M, Revenue $${projB.revenue}M, Life ${projB.life}yrs.
        
        Calculate the Incremental IRR and the Crossover Rate (where NPV_A = NPV_B).
        Return a 'Verdict' explaining which project is safer versus which is more profitable.
        Use Markdown for formatting.
      `;

      const textOp = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
      });

      // 2. Get Chart Data
      const dataPrompt = `
        For Project A (Inv ${projA.investment}, Rev ${projA.revenue}, Life ${projA.life}) 
        and Project B (Inv ${projB.investment}, Rev ${projB.revenue}, Life ${projB.life}):
        Provide a JSON array of NPV values for Project A and Project B at discount rates ranging from 0% to 30% in 2% increments.
        IMPORTANT OUTPUT RULES:
        1. Round all NPV values to exactly 4 decimal places.
        2. Do NOT use scientific notation (e.g. avoid 1.23E10).
        3. Output plain floating point numbers only.
        
        Use this schema: { rate: number, npvA: number, npvB: number }.
      `;

      const dataOp = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: dataPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rate: { type: Type.NUMBER },
                        npvA: { type: Type.NUMBER },
                        npvB: { type: Type.NUMBER }
                    }
                }
            }
        }
      });

      const [textRes, dataRes] = await Promise.all([textOp, dataOp]);
      
      setVerdict(textRes.text || 'Analysis failed.');
      if (dataRes.text) {
          let cleanText = dataRes.text.trim();
          
          // Robust extraction for JSON array
          const firstSquare = cleanText.indexOf('[');
          const lastSquare = cleanText.lastIndexOf(']');
          
          if (firstSquare !== -1 && lastSquare !== -1) {
              cleanText = cleanText.substring(firstSquare, lastSquare + 1);
          }
          
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
          
          try {
            const parsed = JSON.parse(cleanText);
            setChartData(parsed);
          } catch (e) {
            console.error("JSON Parse Error:", e, "Raw Text:", cleanText);
            setVerdict(prev => prev + '\n\n**Error:** Could not generate comparison chart data.');
          }
      }

    } catch (error) {
      console.error(error);
      setVerdict('An error occurred during AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs Column */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            {/* Project A */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h4 className="font-bold text-gold-500 mb-3">{projA.name}</h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-400">Initial Inv ($M)</label>
                        <input 
                            type="number" 
                            value={projA.investment} 
                            onChange={(e) => setProjA({...projA, investment: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Annual Rev ($M)</label>
                        <input 
                            type="number" 
                            value={projA.revenue} 
                            onChange={(e) => setProjA({...projA, revenue: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Life (Years)</label>
                        <input 
                            type="number" 
                            value={projA.life} 
                            onChange={(e) => setProjA({...projA, life: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Project B */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <h4 className="font-bold text-blue-400 mb-3">{projB.name}</h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-400">Initial Inv ($M)</label>
                        <input 
                            type="number" 
                            value={projB.investment} 
                            onChange={(e) => setProjB({...projB, investment: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Annual Rev ($M)</label>
                        <input 
                            type="number" 
                            value={projB.revenue} 
                            onChange={(e) => setProjB({...projB, revenue: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Life (Years)</label>
                        <input 
                            type="number" 
                            value={projB.life} 
                            onChange={(e) => setProjB({...projB, life: parseFloat(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>

        <button 
            onClick={handleCompare}
            disabled={loading}
            className="w-full bg-gold-600 text-white py-3 rounded-lg font-bold hover:bg-gold-500 transition-colors flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="animate-spin" /> : <GitCompare />}
            Run Incremental Analysis
        </button>

        {verdict && (
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{verdict}</div>
            </div>
        )}
      </div>

      {/* Chart Column */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 min-h-[400px]">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">NPV Profile & Crossover</h3>
          {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="rate" 
                        stroke="#94a3b8" 
                        tickFormatter={(v) => `${v}%`}
                        label={{ value: 'Discount Rate (%)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                      />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <ReferenceLine y={0} stroke="#64748b" />
                      <Line type="monotone" dataKey="npvA" name="Project A" stroke="#eab308" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="npvB" name="Project B" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  </LineChart>
              </ResponsiveContainer>
          ) : (
              <div className="h-full flex items-center justify-center text-slate-600">
                  <GitCompare size={48} strokeWidth={1} />
              </div>
          )}
      </div>
    </div>
  );
};