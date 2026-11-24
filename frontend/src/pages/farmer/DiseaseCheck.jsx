import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Pill, 
  Leaf, 
  History, 
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { diseaseAPI } from '../../api/endpoints';

export default function DiseaseCheck() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('organic'); // 'organic', 'chemical', 'prevention'
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await diseaseAPI.getHistory();
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleRunPrediction = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await diseaseAPI.predict(formData);
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail?.detail || 'Disease diagnosis inference failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo sample loader for easy testing
  const handleSelectSample = async (sampleName, sampleUrl) => {
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], `${sampleName}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(sampleUrl);
      setResult(null);
      setError('');
    } catch (e) {
      setError('Could not load demo sample leaf');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-brand-600" />
          Plant Leaf Health AI Diagnostic
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          In-process MobileNetV2 transfer learning engine trained on PlantVillage (38 crop classes) with organic & chemical treatment protocols
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Upload & Image Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <span className="text-xs font-bold text-slate-900 block">
              1. Upload Crop Leaf Photo
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 min-h-[220px] flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Leaf Scan Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-sm"
                  />
                  <div className="text-[11px] text-brand-600 font-bold hover:underline">
                    Click to replace photo
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">Click or Drag Leaf Image</div>
                  <div className="text-[10px] text-slate-400">Supports JPEG, PNG up to 5MB</div>
                </div>
              )}
            </div>

            {/* Quick Demo Sample Picker */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Or pick a demo sample leaf:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSelectSample('tomato_early_blight', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-brand-500 text-left bg-white font-medium text-slate-700 transition-colors truncate"
                >
                  🍅 Tomato Blight
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('healthy_apple', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600')}
                  className="p-2 rounded-xl border border-slate-200 hover:border-brand-500 text-left bg-white font-medium text-slate-700 transition-colors truncate"
                >
                  🍏 Apple Scab
                </button>
              </div>
            </div>

            <button
              onClick={handleRunPrediction}
              disabled={!selectedFile || loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Plant Pathology...' : 'Run Leaf Diagnostic Scan'}</span>
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Diagnosis & Remedies Result */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-6 animate-in fade-in zoom-in-95">
              
              {/* Uncertainty Banner (<60% confidence per FR-08) */}
              {result.is_uncertain && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-900">
                      Uncertain Diagnostic Confidence (&lt; 60%)
                    </div>
                    <div className="text-[11px] text-amber-800 leading-relaxed">
                      The confidence level is below 60%. Please verify with a local agricultural extension officer, Krishi Vigyan Kendra (KVK), or submit an in-focus leaf photo taken in natural sunlight.
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis Top Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Disease Classification
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {result.predicted_class.replace(/___/g, ' - ').replace(/_/g, ' ')}
                  </h2>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Model Version: {result.model_version} • MobileNetV2 Softmax
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-brand-600">
                    {(result.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence Score</div>
                </div>
              </div>

              {/* Top-3 Alternatives Bar (FR-06) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Top-3 Model Predictions
                </span>
                <div className="space-y-2">
                  {result.top3?.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">
                          {item.class.replace(/___/g, ' - ').replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono font-bold text-slate-600">
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-brand-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(item.confidence * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment Tabs (FR-07) */}
              {result.treatment && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center border-b border-slate-200 gap-4 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('organic')}
                      className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                        activeTab === 'organic'
                          ? 'border-emerald-600 text-emerald-800'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5" />
                      <span>Organic Remedies</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chemical')}
                      className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                        activeTab === 'chemical'
                          ? 'border-brand-600 text-brand-800'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Chemical Control</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('prevention')}
                      className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                        activeTab === 'prevention'
                          ? 'border-indigo-600 text-indigo-800'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Prevention & Dosage</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {activeTab === 'organic' && (
                      <div className="space-y-2">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <Leaf className="w-4 h-4 text-emerald-600" /> Bio-Pesticide & Natural Management
                        </div>
                        <p>{result.treatment.organic || 'Maintain compost mulch and remove infected plant debris.'}</p>
                      </div>
                    )}
                    {activeTab === 'chemical' && (
                      <div className="space-y-2">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-slate-600" /> Recommended Fungicide / Bactericide
                        </div>
                        <p>{result.treatment.chemical || 'Consult agricultural officer for registered active ingredients.'}</p>
                      </div>
                    )}
                    {activeTab === 'prevention' && (
                      <div className="space-y-3">
                        <div>
                          <div className="font-bold text-slate-900">Application Dosage:</div>
                          <p>{result.treatment.dosage || 'Follow label instructions strictly.'}</p>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Field Prevention Advice:</div>
                          <p>{result.treatment.prevention || 'Ensure proper spacing and crop rotation.'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[360px] bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Diagnostic Report Pending</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload or capture an in-focus photo of an infected leaf. The AI model will classify the pathology, compute confidence probabilities, and supply treatment protocols.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Historical Diagnostics (FR-09) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            Previous Diagnostic Scans Log
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{history.length} Saved Scans</span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No diagnostic history recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Leaf Photo</th>
                  <th className="p-4">Diagnosis</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="p-4">
                      <img
                        src={h.image_url}
                        alt="Scan"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {h.predicted_class.replace(/___/g, ' - ').replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">
                      {(h.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="p-4">
                      {h.is_uncertain ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Uncertain
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Confident
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
