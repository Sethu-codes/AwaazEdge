import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TEMPLATES, ReplyTemplate } from '../../mock/templates.js';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Languages,
  Edit2,
  Save,
  Tag
} from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const [templateList, setTemplateList] = useState<ReplyTemplate[]>(TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ReplyTemplate>(TEMPLATES[0]);
  const [editedText, setEditedText] = useState(TEMPLATES[0].template);

  const slotChips = ['{name}', '{ref_id}', '{station}', '{asset}', '{eta}'];

  const handleSelectTemplate = (tpl: ReplyTemplate) => {
    setSelectedTemplate(tpl);
    setEditedText(tpl.template);
  };

  const handleToggleReviewed = (id: string) => {
    setTemplateList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isReviewed: !item.isReviewed } : item))
    );
    if (selectedTemplate.id === id) {
      setSelectedTemplate((prev) => ({ ...prev, isReviewed: !prev.isReviewed }));
    }
  };

  const handleInsertSlot = (slot: string) => {
    setEditedText((prev) => prev + ' ' + slot);
  };

  const handleSave = () => {
    setTemplateList((prev) =>
      prev.map((item) => (item.id === selectedTemplate.id ? { ...item, template: editedText } : item))
    );
    alert('Template saved successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Response Template Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage standardized pre-approved responses per department × language × urgency band.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Templates List Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Templates Directory ({templateList.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Dept</th>
                  <th className="py-2.5">Lang</th>
                  <th className="py-2.5">Band</th>
                  <th className="py-2.5">Native Review</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {templateList.map((item) => {
                  const isSelected = item.id === selectedTemplate.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectTemplate(item)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 dark:bg-teal-950/40' : ''
                      }`}
                    >
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {item.department.replace('_', ' ')}
                      </td>
                      <td className="py-3 font-mono uppercase text-slate-600 dark:text-slate-400">
                        {item.language}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.band}
                        </span>
                      </td>
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleReviewed(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            item.isReviewed
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {item.isReviewed ? 'Reviewed ✓' : 'Needs Review !'}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleSelectTemplate(item)}
                          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Template Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 block">
                {selectedTemplate.id}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedTemplate.department.toUpperCase()} • {selectedTemplate.language.toUpperCase()} • {selectedTemplate.band}
              </span>
            </div>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>

          {/* Slot Chips Inserter */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Insert Slot Token:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {slotChips.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleInsertSlot(slot)}
                  className="px-2 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 block">
              Template Body
            </label>
            <textarea
              rows={7}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-xs font-medium p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed resize-none focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Review status note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
            {selectedTemplate.isReviewed ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Native speaker verified for metro operations.
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Requires native linguist verification prior to automated dispatch.
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
