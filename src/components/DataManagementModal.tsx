import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataManagementModal({ isOpen, onClose }: DataManagementModalProps) {
  const { exportData, importData, resetToDefaultData, clearAllData, tasks } = useTracker();
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-progress-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg({ text: 'Data exported successfully as JSON file!', type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleImportJSON = () => {
    if (!importText.trim()) return;
    const ok = importData(importText.trim());
    if (ok) {
      setMsg({ text: 'Backup imported successfully!', type: 'success' });
      setImportText('');
      setTimeout(() => {
        setMsg(null);
        onClose();
      }, 1200);
    } else {
      setMsg({ text: 'Invalid JSON format. Please verify the backup contents.', type: 'error' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="data-mgmt-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="data-mgmt-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Data & Backup Management</h3>
              <p className="text-xs text-slate-500">Export, import, or restore sample analytics</p>
            </div>
          </div>
          <button
            id="close-data-mgmt-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Export section */}
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Export Tracker Data</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save all {tasks.length} tasks, daily logs, and templates to a JSON file.
                </p>
              </div>
              <button
                id="download-backup-btn"
                onClick={handleDownloadJSON}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Import Backup</h4>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Select .json File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-slate-400">or paste JSON below</span>
            </div>
            <textarea
              rows={3}
              placeholder="Paste JSON backup payload here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
            {importText.trim() && (
              <button
                id="confirm-import-btn"
                onClick={handleImportJSON}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Apply Imported Data
              </button>
            )}
          </div>

          {/* Reset / Clear Actions */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button
              id="reset-demo-btn"
              onClick={() => {
                if (window.confirm('Reset tracker to demo sample history (30-day realistic records)?')) {
                  resetToDefaultData();
                  setMsg({ text: 'Sample history restored!', type: 'success' });
                  setTimeout(() => setMsg(null), 2500);
                }
              }}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>

            <button
              id="clear-all-data-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear ALL tasks and logs? This cannot be undone.')) {
                  clearAllData();
                  setMsg({ text: 'All data has been cleared.', type: 'success' });
                  setTimeout(() => setMsg(null), 2500);
                }
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
