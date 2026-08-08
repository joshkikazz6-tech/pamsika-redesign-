import React, { useState } from 'react';

interface DownloadAppViewProps {
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

const APK_URL =
  'https://github.com/joshkikazz6-tech/nEW-pA-mSiKA/releases/download/latest/pamsika.apk';

const INSTALL_STEPS = [
  {
    icon: 'download',
    title: 'Download the APK',
    desc: 'Tap the "Download APK" button above and wait for the download to complete.'
  },
  {
    icon: 'folder_open',
    title: 'Open the downloaded file',
    desc: 'Open the APK from your Downloads folder or the browser\u2019s download notification.'
  },
  {
    icon: 'admin_panel_settings',
    title: 'Allow installation',
    desc: 'If Android blocks the install, tap "Settings", enable "Allow apps from this source" (or "Install unknown apps"), then return to the installer.'
  },
  {
    icon: 'install_mobile',
    title: 'Install the app',
    desc: 'Tap "Install" and wait a moment for the installation process to finish.'
  },
  {
    icon: 'check_circle',
    title: 'Open Pa_mSikA',
    desc: 'Tap "Open" and sign in with your existing Pa_mSikA account to get started.'
  }
];

const TROUBLESHOOTING = [
  {
    q: 'APK not downloading',
    a: 'Check your internet connection and make sure your browser allows downloads. Try again, or open the link in Chrome if it fails elsewhere.'
  },
  {
    q: 'Installation blocked by Android',
    a: 'Go to Settings > Apps > Special access > Install unknown apps, select your browser, and enable "Allow from this source".'
  },
  {
    q: 'Parse error while installing',
    a: 'This usually means the download was incomplete or corrupted. Delete the file and download the APK again.'
  },
  {
    q: 'App not opening after install',
    a: 'Restart your phone, then try opening Pa_mSikA again. If it still fails, uninstall and reinstall the APK.'
  },
  {
    q: 'Insufficient storage',
    a: 'Free up at least 100MB of storage on your device, then retry the installation.'
  }
];

export const DownloadAppView: React.FC<DownloadAppViewProps> = ({ onBack, onShowToast }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(APK_URL);
    onShowToast('Download link copied to clipboard!');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Sub-header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full hover:bg-[#EDE9FE] dark:hover:bg-zinc-800 flex items-center justify-center text-[#111827] dark:text-white transition-colors shrink-0"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-serif-source text-lg font-bold text-[#111827] dark:text-white">
          Settings
        </h2>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-16 h-16 rounded-2xl bg-[#6D28D9] text-white flex items-center justify-center shadow-lg shadow-[#6D28D9]/20 mb-4 transition-transform hover:scale-105">
          <span className="material-symbols-outlined text-[32px]">android</span>
        </div>
        <h1 className="font-serif-source text-2xl font-bold text-[#111827] dark:text-white">
          Download Pa_mSikA Mobile App
        </h1>
        <p className="text-xs text-[#4B5563] dark:text-zinc-400 mt-2 max-w-sm">
          Get the Android app for a faster, smoother, and more convenient Pa_mSikA
          experience &mdash; right from your home screen.
        </p>
      </div>

      {/* App Info Card */}
      <section className="bg-[#F9FAFB] dark:bg-[#0a0a0a] rounded-2xl border border-[#E5E7EB] dark:border-zinc-800 p-4 space-y-3">
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] px-1">
          App Information
        </h3>
        <div className="bg-white dark:bg-[#0d0d0d] rounded-xl border border-[#E5E7EB] dark:border-zinc-800 divide-y divide-[#E5E7EB] dark:divide-zinc-800 text-xs">
          {[
            { label: 'App Name', value: 'Pa_mSikA' },
            { label: 'Platform', value: 'Android' },
            { label: 'Type', value: 'Official Pa_mSikA Mobile App' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Source', value: 'Official GitHub Release' }
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-[#4B5563] dark:text-zinc-400 font-medium">{row.label}</span>
              <span className="font-bold text-[#111827] dark:text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Download Section */}
      <section className="space-y-3">
        <a
          href={APK_URL}
          className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5b21b6] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#6D28D9]/25 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Download APK
        </a>
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 bg-[#F9FAFB] dark:bg-[#0a0a0a] hover:bg-[#EDE9FE] dark:hover:bg-zinc-800 active:scale-[0.98] text-[#6D28D9] dark:text-[#c084fc] border border-[#E5E7EB] dark:border-zinc-800 py-3 rounded-2xl font-bold text-xs transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          Copy Download Link
        </button>
        <p className="text-[11px] text-center text-[#4B5563] dark:text-zinc-400 px-4">
          The file will be downloaded directly from the official Pa_mSikA GitHub release.
        </p>
      </section>

      {/* Installation Guide */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Installation Guide
        </h3>
        <div className="bg-[#F9FAFB] dark:bg-[#0a0a0a] rounded-2xl border border-[#E5E7EB] dark:border-zinc-800 divide-y divide-[#E5E7EB] dark:divide-zinc-800">
          {INSTALL_STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3 p-4">
              <div className="w-9 h-9 rounded-full bg-[#EDE9FE] dark:bg-[#6D28D9]/20 text-[#6D28D9] dark:text-[#c084fc] flex items-center justify-center font-bold text-xs shrink-0 relative">
                {i + 1}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="material-symbols-outlined text-[16px] text-[#6D28D9] dark:text-[#c084fc]">
                    {step.icon}
                  </span>
                  <p className="font-bold text-sm text-[#111827] dark:text-white">
                    {step.title}
                  </p>
                </div>
                <p className="text-[11px] text-[#4B5563] dark:text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Troubleshooting */}
      <section>
        <h3 className="text-xs font-bold text-[#6D28D9] uppercase tracking-[0.2em] mb-2 px-1">
          Having Trouble Installing?
        </h3>
        <div className="bg-[#F9FAFB] dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-zinc-800 divide-y divide-[#E5E7EB] dark:divide-zinc-800">
          {TROUBLESHOOTING.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 flex items-center justify-between hover:bg-white dark:hover:bg-[#111111] text-left transition-colors"
              >
                <span className="font-bold text-sm text-[#111827] dark:text-white">
                  {item.q}
                </span>
                <span
                  className={`material-symbols-outlined text-[#4B5563] dark:text-zinc-400 transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-[11px] text-[#4B5563] dark:text-zinc-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-[#EDE9FE] dark:bg-[#6D28D9]/10 rounded-2xl border border-[#6D28D9]/20 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0d0d0d] flex items-center justify-center text-[#6D28D9] dark:text-[#c084fc] shrink-0 shadow-sm">
          <span className="material-symbols-outlined">shield</span>
        </div>
        <div>
          <p className="font-bold text-sm text-[#111827] dark:text-white mb-1">
            Safe Installation
          </p>
          <p className="text-[11px] text-[#4B5563] dark:text-zinc-300 leading-relaxed">
            This APK is the official Pa_mSikA mobile app, distributed only through the
            official Pa_mSikA GitHub release. For your safety, only ever download the
            app from this official link &mdash; never from third-party sites.
          </p>
        </div>
      </section>
    </div>
  );
};
