import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import {
  QrCode,
  Image as ImageIcon,
  Mic,
  Send,
  AlertCircle,
  WifiOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const SubmitPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addComplaint, isSimulatedOffline } = useAppStore();

  const qrAssetParam = searchParams.get('asset');

  // Form State
  const [text, setText] = useState('');
  const [stationId, setStationId] = useState('STN-01');
  const [assetId, setAssetId] = useState('');
  const [isQrLocked, setIsQrLocked] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle QR code deep link ?asset=LIFT-03
  useEffect(() => {
    if (qrAssetParam) {
      const foundAsset = ASSETS.find(
        (a) => a.id.toLowerCase() === qrAssetParam.toLowerCase()
      );
      if (foundAsset) {
        setStationId(foundAsset.stationId);
        setAssetId(foundAsset.id);
        setIsQrLocked(true);
      }
    }
  }, [qrAssetParam]);

  // Filter assets by selected station
  const availableAssets = ASSETS.filter((a) => a.stationId === stationId);

  // Quick example phrases
  const examplePhrases = [
    'lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe',
    'પ્લેટફોર્મ ૧ પર કચરો અને ગંદકી છે',
    'टिकट मशीन ने 100 रुपये काट लिए पर टिकट नहीं दिया',
    'The escalator is stopped near entry gate'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg('Please describe what happened');
      return;
    }

    if ((contactName.trim() || contactPhone.trim()) && !consentGiven) {
      setErrorMsg('Please give consent to receive SMS updates for contact info');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newComplaint = await addComplaint({
        originalText: text.trim(),
        stationId,
        assetId: assetId || undefined,
        channel: 'app',
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined
      });

      navigate(`/app/confirm/${newComplaint.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Offline Banner */}
      {isSimulatedOffline && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-xs">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Offline Mode Active</div>
            <div>{t('passenger.offlineNotice')}</div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-sm">
        
        {/* Title & Helper */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {t('passenger.heading')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {t('passenger.helperText')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Complaint Text Area */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="complaint-text" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Complaint Description *
              </label>
              <span className={`text-[11px] font-mono ${text.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {text.length} / 500
              </span>
            </div>
            
            <textarea
              id="complaint-text"
              rows={4}
              maxLength={500}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('passenger.placeholder')}
              className="w-full text-sm sm:text-base p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none shadow-2xs"
            />

            {/* Quick multilingual inspiration chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-teal-600" /> Examples:
              </span>
              {examplePhrases.map((phrase, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setText(phrase)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 transition-colors truncate max-w-[200px] cursor-pointer"
                  title={phrase}
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>

          {/* Station and Asset Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="station-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('passenger.stationLabel')} *
              </label>
              <select
                id="station-select"
                disabled={isQrLocked}
                value={stationId}
                onChange={(e) => {
                  setStationId(e.target.value);
                  setAssetId('');
                }}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 disabled:opacity-70 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="asset-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {t('passenger.assetLabel')}
              </label>
              <select
                id="asset-select"
                disabled={isQrLocked}
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 disabled:opacity-70 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                <option value="">{t('passenger.assetPlaceholder')}</option>
                {availableAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QR Code Deep Link Chip */}
          {isQrLocked && assetId && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold">
              <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{t('passenger.scannedFromQR', { asset: assetId })}</span>
              <button
                type="button"
                onClick={() => setIsQrLocked(false)}
                className="ml-auto text-[11px] underline text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Unlock
              </button>
            </div>
          )}

          {/* Optional Media (Photo & Voice note button) */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>{photoPreview ? 'Photo Selected' : t('passenger.photoUpload')}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => alert('Voice note recording is coming in Phase 2!')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-slate-400" />
              <span>{t('passenger.voiceNote')}</span>
            </button>
          </div>

          {/* Photo Thumbnail Preview */}
          {photoPreview && (
            <div className="relative inline-block mt-2">
              <img
                src={photoPreview}
                alt="Complaint attachment"
                className="w-20 h-20 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs shadow-md"
              >
                ✕
              </button>
            </div>
          )}

          {/* Contact Details (Optional) */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('passenger.contactHeading')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t('passenger.namePlaceholder')}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80"
              />

              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={t('passenger.phonePlaceholder')}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono"
              />
            </div>

            {(contactName || contactPhone) && (
              <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="leading-snug">{t('passenger.consentCheckbox')}</span>
              </label>
            )}
          </div>

          {/* Big Tap Target Submit Button (Min 48px height) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? t('passenger.submitting') : t('passenger.submitButton')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
