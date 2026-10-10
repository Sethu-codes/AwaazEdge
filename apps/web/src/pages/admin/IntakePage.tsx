import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import {
  FileText,
  Upload,
  PlusCircle,
  ScanLine,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  Layers,
  ArrowRight
} from 'lucide-react';

export const IntakePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addComplaint, batchTriageComplaints } = useAppStore();

  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'scan'>('batch');

  // Single Intake Form
  const [singleText, setSingleText] = useState('');
  const [singleStation, setSingleStation] = useState('STN-01');
  const [singleAsset, setSingleAsset] = useState('');
  const [singleChannel, setSingleChannel] = useState<'paper' | 'email' | 'social'>('paper');
  const [isSingleSubmitting, setIsSingleSubmitting] = useState(false);

  // Batch Intake Form
  const sampleBatchCSV = `app,STN-02,LIFT-03,lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe
paper,STN-01,TOI-01,ટોયલેટમાં ભારે ગંદકી અને કચરો છે
social,STN-05,,Counter staff shouting @ahmedabadmetro fix this
email,STN-04,TVM-03,टिकट मशीन ने 100 रुपये काट लिए पर टिकट नहीं दिया
paper,STN-01,ESC-01,Escalator ESC-01 completely stopped at Kalupur concourse
app,STN-01,ESC-01,kalupur escalator stopped again crowd waiting
app,STN-01,ESC-01,એસ્કેલેટર બંધ છે કાલુપુર પર જલ્દી રિપેર કરો
app,STN-06,,Pregnant lady fainted near Paldi gate help
email,STN-03,,kal me subway gaya tha sandwich khane`;

  const [batchRawText, setBatchRawText] = useState(sampleBatchCSV);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResultSummary, setBatchResultSummary] = useState<string | null>(null);

  // Paper Scan state
  const [scanPreview, setScanPreview] = useState<string | null>(null);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleText.trim()) return;

    setIsSingleSubmitting(true);
    try {
      await addComplaint({
        originalText: singleText.trim(),
        stationId: singleStation,
        assetId: singleAsset || undefined,
        channel: singleChannel
      });
      navigate('/admin');
    } finally {
      setIsSingleSubmitting(false);
    }
  };

  const handleBatchTriage = async () => {
    if (!batchRawText.trim()) return;

    setIsBatchProcessing(true);
    setBatchProgress(15);
    setBatchResultSummary(null);

    // Parse lines or CSV (channel,station_id,asset_id,text)
    const lines = batchRawText.split('\n').filter((l) => l.trim().length > 0);
    const parsedItems: Array<{ text: string; stationId: string; assetId?: string; channel?: string }> = [];

    for (const line of lines) {
      if (line.includes(',')) {
        const parts = line.split(',');
        if (parts.length >= 4) {
          const channel = parts[0].trim();
          const stationId = parts[1].trim();
          const assetId = parts[2].trim() || undefined;
          const text = parts.slice(3).join(',').trim();
          parsedItems.push({ text, stationId, assetId, channel });
          continue;
        }
      }
      // Fallback single line text
      parsedItems.push({ text: line.trim(), stationId: 'STN-01', channel: 'paper' });
    }

    setBatchProgress(45);
    await new Promise((r) => setTimeout(r, 200));

    setBatchProgress(80);
    const res = await batchTriageComplaints(parsedItems);

    setBatchProgress(100);
    setIsBatchProcessing(false);
    setBatchResultSummary(`Successfully triaged ${res.count} complaints in ${res.elapsedMs} ms on-device.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Manual Intake & Batch Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingest complaints from station counter registers, inbound emails, paper forms, and batch CSV dumps.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'batch'
              ? 'border-teal-700 text-teal-800 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Paste Batch / CSV (Fast Triage)</span>
        </button>

        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'single'
              ? 'border-teal-700 text-teal-800 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Single Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'scan'
              ? 'border-teal-700 text-teal-800 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>Scan Paper Form</span>
        </button>
      </div>

      {/* Tab 1: Batch Paste / CSV */}
      {activeTab === 'batch' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Paste Text Lines or CSV Dump
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Format: channel,station_id,asset_id,text
              </span>
            </div>
            <textarea
              rows={9}
              value={batchRawText}
              onChange={(e) => setBatchRawText(e.target.value)}
              placeholder="Paste raw complaints, one per line..."
              className="w-full text-xs sm:text-sm font-mono p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 leading-relaxed resize-none focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Progress Bar & Summary */}
          {isBatchProcessing && (
            <div className="space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-xs font-semibold text-teal-700 dark:text-teal-400">
                <span>Classifying on-device...</span>
                <span>{batchProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          {batchResultSummary && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs sm:text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{batchResultSummary}</span>
              </div>
              <button
                onClick={() => navigate('/admin')}
                className="text-xs font-bold underline flex items-center gap-1 hover:text-teal-950 cursor-pointer"
              >
                <span>View in Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-400">
              {batchRawText.split('\n').filter((l) => l.trim()).length} lines detected
            </span>
            <button
              onClick={handleBatchTriage}
              disabled={isBatchProcessing || !batchRawText.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isBatchProcessing ? 'Processing...' : 'Triage All Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Single Intake Form */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint Text *
            </label>
            <textarea
              rows={4}
              required
              value={singleText}
              onChange={(e) => setSingleText(e.target.value)}
              placeholder="Enter complaint in Gujarati, Hindi, English, or Gujlish..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Station</label>
              <select
                value={singleStation}
                onChange={(e) => setSingleStation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Asset</label>
              <select
                value={singleAsset}
                onChange={(e) => setSingleAsset(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">General Station Area</option>
                {ASSETS.filter((a) => a.stationId === singleStation).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Source Channel</label>
              <select
                value={singleChannel}
                onChange={(e) => setSingleChannel(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="paper">Station Paper Register</option>
                <option value="email">Inbound Email</option>
                <option value="social">Social Media Feed</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSingleSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-teal-700 hover:bg-teal-800 cursor-pointer shadow-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSingleSubmitting ? 'Logging...' : 'Classify & Add to Queue'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Scan Paper Form (UI + file upload placeholder) */}
      {activeTab === 'scan' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto">
            <ScanLine className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Scan Handwritten or Printed Grievance Form
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Upload photo of station grievance register (Form G-14). OCR extraction with offline Indic language transcription will run automatically.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-700 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs cursor-pointer hover:bg-teal-100 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Select Form Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setScanPreview('scanned_preview_loaded');
                }
              }}
            />
          </label>

          {scanPreview && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono text-left max-w-md mx-auto space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-teal-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> OCR Extracted text:
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                "લિફ્ટ નંબર 01 કાલુપુર ખાતે બપોરે ૨ વાગ્યાથી બંધ છે અને વૃદ્ધોને મુશ્કેલી પડે છે"
              </p>
              <button
                onClick={() => {
                  setSingleText('લિફ્ટ નંબર 01 કાલુપુર ખાતે બપોરે ૨ વાગ્યાથી બંધ છે');
                  setActiveTab('single');
                }}
                className="text-xs font-bold text-teal-700 underline"
              >
                Transfer to Single Intake Editor
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
