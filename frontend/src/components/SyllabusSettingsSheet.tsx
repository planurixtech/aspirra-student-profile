import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SyllabusSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isRevisionMode: boolean;
  onConfirm: (revisionMode: boolean, resetSyllabus: boolean) => void;
}

export default function SyllabusSettingsSheet({
  isOpen,
  onClose,
  isRevisionMode,
  onConfirm,
}: SyllabusSettingsSheetProps) {
  const [draftRevision, setDraftRevision] = useState(isRevisionMode);
  const [draftReset, setDraftReset] = useState(false);

  // Sync state whenever the sheet is opened or values change
  useEffect(() => {
    if (isOpen) {
      setDraftRevision(isRevisionMode);
      setDraftReset(false);
    }
  }, [isOpen, isRevisionMode]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center select-none" id="syllabus-settings-sliding-overlay">
      {/* Dark background backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-up sheet container */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-[#e9f1f7] shadow-2xl rounded-t-[32px] px-6 pt-5 pb-8 flex flex-col z-50 border-t border-white/20 select-none text-slate-800"
        style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}
      >
        {/* Grab bar indicator */}
        <div className="w-12 h-1 bg-slate-450/40 rounded-full mx-auto mb-4" />

        {/* Top bar with close button on far right */}
        <div className="flex items-center justify-end mb-4">
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow hover:opacity-95 active:scale-90 transition cursor-pointer"
            title="Close Settings Panel"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* List of cards */}
        <div className="space-y-3.5 mb-6">
          
          {/* Card 1: Revision Mode Toggle */}
          <div className="bg-white rounded-2xl p-4.5 flex items-center justify-between shadow-sm border border-slate-150">
            <span className="text-[14.5px] font-black text-slate-900 leading-none">
              Revision Mode
            </span>
            <button
              type="button"
              onClick={() => setDraftRevision(!draftRevision)}
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border border-slate-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                draftRevision ? 'bg-black' : 'bg-white'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-md transition duration-200 ease-in-out ${
                  draftRevision ? 'translate-x-[24px] bg-white' : 'translate-x-[1px] translate-y-[0.5px] bg-slate-900'
                }`}
              />
            </button>
          </div>

          {/* Card 2: Reset Syllabus Toggle */}
          <div className="bg-white rounded-2xl p-4.5 flex items-center justify-between shadow-sm border-2 border-[#5c21df]/50">
            <span className="text-[14.5px] font-black text-slate-900 leading-none">
              Reset Syllabus
            </span>
            <button
              type="button"
              onClick={() => setDraftReset(!draftReset)}
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border border-slate-800 transition-colors duration-200 ease-in-out focus:outline-none ${
                draftReset ? 'bg-black' : 'bg-white'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-md transition duration-200 ease-in-out ${
                  draftReset ? 'translate-x-[24px] bg-white' : 'translate-x-[1px] translate-y-[0.5px] bg-slate-900'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Action Button: Confirm */}
        <div className="w-full flex justify-center mt-2">
          <button
            type="button"
            onClick={() => onConfirm(draftRevision, draftReset)}
            className="px-8 py-3 rounded-xl text-sm font-black tracking-wide bg-[#125652] hover:bg-[#0d423f] text-white shadow-md active:scale-95 transition-all text-center cursor-pointer select-none"
          >
            Confirm
          </button>
        </div>

      </motion.div>
    </div>
  );
}
