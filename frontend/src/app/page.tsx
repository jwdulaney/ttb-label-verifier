'use client';

import React, { useState } from 'react';

// Configure API base URL for local development or production deployment
// Default to Render production URL, can be overridden by NEXT_PUBLIC_API_URL env var
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ttb-label-verifier-jd.onrender.com';
const API_BASE_URL = rawUrl.replace(/\/$/, '');

interface VerificationResult {
  overall_status: string;
  government_warning_pass: boolean;
  warning_notes?: string;
  brand_match_score?: number;
  brand_status?: string;
}

interface BatchFileResult {
  filename: string;
  overall_status: string;
  government_warning_pass: boolean;
  field_results: Array<{
    field_name: string;
    expected: string;
    extracted: string | null;
    match_score: number;
    status: string;
  }>;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [batchResult, setBatchResult] = useState<{
    total_processed: number;
    total_time_seconds: number;
    results: BatchFileResult[];
  } | null>(null);

  const [appData, setAppData] = useState({
    brand_name: 'OLD TOM DISTILLERY',
    class_type: 'Kentucky Straight Bourbon Whiskey',
    alcohol_content: '45% Alc./Vol. (90 Proof)',
    net_contents: '750 mL',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleBatchFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    setFiles(selectedFiles);
  };

  const handleVerify = async () => {
    if (!file) {
      alert('Please upload a label artwork image first.');
      return;
    }

    setLoading(true);
    setResult(null);
    setBatchResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_json', JSON.stringify(appData));

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Verification Error:", err);
      alert(`Verification failed: ${err.message || 'Network request failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async () => {
    if (!files.length) {
      alert('Please select at least one label artwork image first.');
      return;
    }

    setLoading(true);
    setResult(null);
    setBatchResult(null);

    const formData = new FormData();
    files.forEach((selectedFile) => {
      formData.append('files', selectedFile);
    });
    formData.append('application_json', JSON.stringify(appData));

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBatchResult(data);
    } catch (err: any) {
      console.error("Batch Verification Error:", err);
      alert(`Batch verification failed: ${err.message || 'Network request failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            TTB Label Compliance Audit Tool
          </h1>
          <p className="text-sm text-slate-600">
            Automated Verification Prototype (Compliance Division)
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          Standalone Proof of Concept
        </span>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              1. COLA Application Data
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={appData.brand_name}
                  onChange={(e) => setAppData({ ...appData, brand_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Class / Type
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={appData.class_type}
                  onChange={(e) => setAppData({ ...appData, class_type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Alcohol Content (ABV)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={appData.alcohol_content}
                  onChange={(e) => setAppData({ ...appData, alcohol_content: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Net Contents
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={appData.net_contents}
                  onChange={(e) => setAppData({ ...appData, net_contents: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              2. Single Label Upload
            </h2>
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            {preview && (
              <div className="mb-6 border rounded-lg overflow-hidden bg-slate-50 p-2 flex justify-center max-h-80">
                <img src={preview} alt="Label Preview" className="object-contain max-h-72 rounded" />
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || !file}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                loading || !file
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              {loading ? 'Processing Label Verification...' : 'Run Automated Compliance Check'}
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              3. Batch Label Upload
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBatchFilesChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            {files.length > 0 && (
              <div className="mb-4 text-sm text-slate-600">
                Selected files: {files.map((f) => f.name).join(', ')}
              </div>
            )}

            <button
              onClick={handleBatchVerify}
              disabled={loading || files.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-white transition ${
                loading || files.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 shadow-md'
              }`}
            >
              {loading ? 'Processing Batch...' : 'Run Batch Verification'}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
            Verification Results
          </h2>

          {!result && !batchResult && !loading && (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
              <p>Upload a label image and run verification to view results.</p>
            </div>
          )}

          {loading && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-600">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="font-medium">Extracting fields and matching compliance rules...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-lg flex justify-between items-center ${
                  result.overall_status === 'PASS'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    Overall Recommendation
                  </span>
                  <span className="text-xl font-extrabold">{result.overall_status}</span>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    result.overall_status === 'PASS'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {result.overall_status === 'PASS' ? 'Ready for Approval' : 'Requires Manual Review'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">Brand Name Verification</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        result.brand_status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Score: {result.brand_match_score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Expected: <span className="font-medium text-slate-800">{appData.brand_name}</span>
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">
                      Government Health Warning Check
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        result.government_warning_pass
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {result.government_warning_pass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mandatory all-caps header "GOVERNMENT WARNING:" and required Surgeon General text.
                  </p>
                </div>
              </div>
            </div>
          )}

          {batchResult && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-violet-900">
                <div className="text-xs font-bold uppercase tracking-wider">Batch Summary</div>
                <div className="text-xl font-extrabold mt-1">
                  {batchResult.total_processed} files processed
                </div>
                <div className="text-sm mt-1">
                  Total time: {batchResult.total_time_seconds}s
                </div>
              </div>

              {batchResult.results.map((item) => (
                <div key={item.filename} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">{item.filename}</span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        item.overall_status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.overall_status === 'NEEDS_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.overall_status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    {item.field_results.map((field) => (
                      <div key={field.field_name} className="flex justify-between gap-3">
                        <span>{field.field_name}</span>
                        <span className="font-medium text-slate-700">{field.status}</span>
                        <span>{field.match_score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
