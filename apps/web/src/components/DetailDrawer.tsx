import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import { STATIONS, ASSETS } from '../mock/stationsAssets.js';
import { TEMPLATES, fillTemplate } from '../mock/templates.js';
import { UrgencyBadge } from './UrgencyBadge.js';
import { matchLexicon } from '@transit-triage/core';
import {
  X,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  Edit3,
  ArrowRight,
  ShieldAlert,
  Bot
} from 'lucide-react';

export const DetailDrawer: React.FC = () => {
  const { t } = useTranslation();
  const {
    complaints,
    selectedComplaintId,
    setSelectedComplaintId,
    overrideUrgency,
    moveDepartment,
    approveDraft,
    sendReply
  } = useAppStore();

  const complaint = complaints.find((c) => c.id === selectedComplaintId);

  // Local state for interactive editing
  const [showNormalized, setShowNormalized] = useState(false);
  const [overrideScoreInput, setOverrideScoreInput] = useState<number>(complaint?.urgencyScore || 50);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const [selectedTargetDept, setSelectedTargetDept] = useState(complaint?.primaryDepartment || 'safety');
  const [moveReason, setMoveReason] = useState('');
  const [showMoveForm, setShowMoveForm] = useState(false);

  const [draftLang, setDraftLang] = useState<'en' | 'gu' | 'hi'>('en');
  const [draftText, setDraftText] = useState(complaint?.replyText || '');

  if (!complaint) return null;

  const station = STATIONS.find((s) => s.id === complaint.stationId);
  const asset = ASSETS.find((a) => a.id === complaint.assetId);

  // Trigger words highlighting via lexicon
  const matchedTerms = matchLexicon(complaint.originalText, complaint.normalizedText);

  // Render text with highlighted spans
  const renderHighlightedText = () => {
    if (matchedTerms.length === 0) {
      return <span>{complaint.originalText}</span>;
    }

    const segments: React.ReactNode[] = [];
    let currentIndex = 0;

    for (let i = 0; i < matchedTerms.length; i++) {
      const match = matchedTerms[i];
      if (match.startIndex > currentIndex) {
        segments.push(
          <span key={`text-${currentIndex}`}>
            {complaint.originalText.slice(currentIndex, match.startIndex)}
          </span>
        );
      }

      segments.push(
        <mark
          key={`mark-${match.startIndex}-${match.endIndex}`}
          className={`px-1.5 py-0.5 rounded font-medium ${
            match.isDanger
              ? 'bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/60 dark:text-red-200'
              : 'bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-900/60 dark:text-teal-200'
          }`}
          title={`${match.department} | ${match.subtopic}${match.isDanger ? ` [Floor ${match.dangerFloor}]` : ''}${match.isNegated ? ' [NEGATED]' : ''}`}
        >
          {complaint.originalText.slice(match.startIndex, match.endIndex)}
          {match.isNegated && (
            <span className="ml-1 text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">
              [negated]
            </span>
          )}
        </mark>
      );

      currentIndex = match.endIndex;
    }

    if (currentIndex < complaint.originalText.length) {
      segments.push(
        <span key={`tail-${currentIndex}`}>
          {complaint.originalText.slice(currentIndex)}
        </span>
      );
    }

    return segments;
  };

  // Preload template when language is switched
  const handleLoadTemplate = (lang: 'en' | 'gu' | 'hi') => {
    setDraftLang(lang);
    const tpl =
      TEMPLATES.find((t) => t.department === complaint.primaryDepartment && t.language === lang) ||
      TEMPLATES.find((t) => t.language === lang) ||
      TEMPLATES[0];

    const filled = fillTemplate(tpl.template, {
      name: complaint.contactName || 'Passenger',
      ref_id: complaint.trackingId,
      station: station?.name || 'Ahmedabad Metro',
      asset: asset?.name || 'facility',
      eta: complaint.urgencyBand === 'Critical' ? '5 minutes' : '20 minutes'
    });

    setDraftText(filled);
  };

  const currentTemplate = TEMPLATES.find(
    (t) => t.department === complaint.primaryDepartment && t.language === draftLang
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-400">
                {complaint.trackingId}
              </span>
              <UrgencyBadge band={complaint.urgencyBand} score={complaint.urgencyScore} size="sm" />
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {complaint.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged via {complaint.channel.toUpperCase()} • {new Date(complaint.createdAt).toLocaleTimeString()}
            </div>
          </div>

          <button
            onClick={() => setSelectedComplaintId(null)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Section 1: Complaint Text & Script Highlights */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t('admin.detail.originalText')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Script: {complaint.script}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Lang: {complaint.lang_guess.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {renderHighlightedText()}
            </div>

            {/* Normalized Text Toggle */}
            <div className="mt-2.5">
              <button
                onClick={() => setShowNormalized(!showNormalized)}
                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showNormalized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{t('admin.detail.normalizedText')}</span>
              </button>
              {showNormalized && (
                <div className="mt-1.5 p-2.5 rounded bg-slate-100 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  {complaint.normalizedText}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Labels, Confidence Bars & Fusion Sources */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t('admin.detail.confidenceBars')}
              </span>
              <button
                onClick={() => setShowMoveForm(!showMoveForm)}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{t('admin.detail.moveQueue')}</span>
              </button>
            </div>

            {/* Department Confidences */}
            <div className="space-y-2.5">
              {(['safety', 'lifts', 'cleanliness', 'fare', 'staff_behaviour'] as const).map((dept) => {
                const isPrimary = complaint.primaryDepartment === dept;
                const isSecondary = complaint.secondaryDepartments.includes(dept);
                const score = isPrimary ? 94 : isSecondary ? 72 : 8;

                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize">{dept.replace('_', ' ')}</span>
                        {isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-teal-600 text-white">
                            Primary
                          </span>
                        )}
                        {isSecondary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Secondary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-[10px] font-mono text-slate-400">
                          {isPrimary && <span className="text-teal-600 font-semibold">lexicon</span>}
                          {isPrimary && <span>model</span>}
                        </div>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{score}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPrimary
                            ? 'bg-teal-600 dark:bg-teal-500'
                            : isSecondary
                            ? 'bg-teal-400/60'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Move Queue / Correction Form */}
            {showMoveForm && (
              <div className="mt-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-2 animate-in fade-in">
                <div className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                  Select corrected department (Creates training correction):
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedTargetDept}
                    onChange={(e) => setSelectedTargetDept(e.target.value)}
                    className="text-xs p-1.5 rounded border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 flex-1"
                  >
                    <option value="safety">Safety & Security</option>
                    <option value="lifts">Lifts & Escalators</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="fare">Fare & Ticketing</option>
                    <option value="staff_behaviour">Staff Behaviour</option>
                  </select>
                  <input
                    type="text"
                    value={moveReason}
                    onChange={(e) => setMoveReason(e.target.value)}
                    placeholder="Reason (e.g., misclassified)"
                    className="text-xs p-1.5 rounded border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 flex-1"
                  />
                  <button
                    onClick={() => {
                      moveDepartment(complaint.id, selectedTargetDept, moveReason || 'Controller manual correction');
                      setShowMoveForm(false);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Urgency Breakdown Chips */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t('admin.detail.urgencyBreakdown')}
              </span>
              <button
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{t('admin.detail.overrideUrgency')}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {complaint.urgencyBreakdown?.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <span className="font-bold text-teal-700 dark:text-teal-400">+{item.points}</span>
                  <span>{item.name}</span>
                </span>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Total:</span>
                <UrgencyBadge band={complaint.urgencyBand} score={complaint.urgencyScore} size="sm" />
              </div>
            </div>

            {/* Override Urgency Form */}
            {showOverrideForm && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2 animate-in fade-in">
                <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Override Urgency Score (0 - 100):
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overrideScoreInput}
                    onChange={(e) => setOverrideScoreInput(Number(e.target.value))}
                    className="w-20 text-xs p-1.5 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Reason for manual override"
                    className="flex-1 text-xs p-1.5 rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
                  />
                  <button
                    onClick={() => {
                      overrideUrgency(complaint.id, overrideScoreInput, overrideReason || 'Manual adjustment');
                      setShowOverrideForm(false);
                    }}
                    className="px-3 py-1.5 rounded text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Draft Reply Editor */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t('admin.detail.replyEditor')}
                </span>
                {currentTemplate && !currentTemplate.isReviewed && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Needs native speaker review
                  </span>
                )}
              </div>

              {/* Language Switcher for Reply */}
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                {(['en', 'gu', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLoadTemplate(lang)}
                    className={`px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                      draftLang === lang
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'gu' ? 'ગુજ' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={draftText || complaint.replyText || ''}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Compose response with template slots {name}, {ref_id}, {station}, {asset}, {eta}..."
              className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed focus:border-teal-500 transition-colors"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Status: <span className="font-bold uppercase text-teal-700 dark:text-teal-400">{complaint.replyStatus || 'draft'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveDraft(complaint.id, draftText)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('admin.detail.approve')}</span>
                </button>
                <button
                  onClick={() => sendReply(complaint.id)}
                  disabled={complaint.replyStatus === 'sent'}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{complaint.replyStatus === 'sent' ? 'Dispatched' : t('admin.detail.send')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Audit Trail */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>{t('admin.detail.auditTrail')}</span>
            </div>
            <div className="space-y-2">
              {complaint.auditTrail?.map((log, i) => (
                <div key={i} className="text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-slate-500 ml-1.5">by {log.actor}</span>
                    {log.note && <div className="text-slate-600 dark:text-slate-400 mt-0.5">{log.note}</div>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
