import React, { useState } from 'react';
import { Bell, Check, Award, FileText } from 'lucide-react';
import { UserProfile } from '../types';
import ProfileDetails from './ProfileDetails';

interface FrameComponentProps {
  profile: UserProfile;
  onChangeProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export default function FrameComponent({ profile, onChangeProfile, onLogout }: FrameComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editGroup, setEditGroup] = useState(profile.group);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', text: "Target of 4 hours daily study starts now!" },
    { id: 'n2', text: "Your printed ancient history PDF is ready for review." }
  ]);

  const handleSave = () => {
    if (editName.trim()) {
      onChangeProfile({
        ...profile,
        name: editName,
        group: editGroup
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 select-none" id="frame-profile-container">
      {/* Profile Info Row */}
      <div className="flex items-center gap-3">
        {/* Avatar with gold/white outline and status indicator */}
        <div className="relative shrink-0 cursor-pointer" onClick={() => setShowProfileDetails(true)}>
          <div className="w-13 h-13 rounded-full bg-white flex items-center justify-center text-slate-800 text-xl font-bold font-sans border-2 border-emerald-400 shadow-md hover:border-emerald-300 hover:scale-105 transition-all active:scale-95">
            {profile.avatarLetter}
          </div>
          <span className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] bg-[#0ec38c] border-2 border-[#125652] rounded-full" />
        </div>

        {/* Text descriptions and editing box */}
        <div className="min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-1.5 p-1 bg-white/10 rounded-lg border border-white/20">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-slate-900/60 text-white font-bold text-xs px-2 py-1 rounded border-none focus:outline-none focus:ring-1 focus:ring-emerald-400 w-[120px]"
                placeholder="Name"
                maxLength={18}
              />
              <select
                value={editGroup}
                onChange={(e) => setEditGroup(e.target.value)}
                className="bg-slate-900/60 text-white font-bold text-[10px] px-1.5 py-0.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-emerald-400 w-[120px]"
              >
                <option value="TNPSC Group 1 - 2026">TNPSC Group 1</option>
                <option value="TNPSC Group 2 - 2026">TNPSC Group 2</option>
                <option value="TNPSC Group 4 - 2026">TNPSC Group 4</option>
                <option value="UPSC Civil Services">UPSC Prelims</option>
              </select>
              <div className="flex gap-1 justify-end">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-1 text-[8px] bg-red-500/20 text-red-300 rounded font-bold uppercase"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="px-1.5 text-[8px] bg-emerald-500 text-slate-950 rounded font-black uppercase"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[17px] text-white tracking-tight truncate leading-tight block">
                  {profile.name}
                </span>
                {profile.isVerified && (
                  <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shrink-0" title="Verified Account">
                    <Check className="w-2.5 h-2.5 stroke-[4.5]" />
                  </span>
                )}
              </div>

              {/* Subtitle grouping badge — dynamic per selected exam */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {(() => {
                  const examType = profile.group.startsWith("NEET PG") ? "NEET PG"
                    : profile.group.startsWith("TNPSC") ? "TNPSC"
                    : profile.group.startsWith("UPSC") ? "UPSC"
                    : profile.group.startsWith("CSE") ? "CSE"
                    : "EXAM";
                  const examSub = profile.group.replace(/^(NEET PG|TNPSC|UPSC|CSE)[\s-]+/, '').trim();
                  return (
                    <>
                      <div className="inline-flex items-center gap-0.5 bg-emerald-600/30 border border-emerald-500/20 text-[#95efde] px-1.5 py-0.5 rounded font-mono text-[9px] font-bold shrink-0">
                        <FileText className="w-2.5 h-2.5 mt-[1px]" />
                        <span>{examType}</span>
                      </div>
                      {examSub && (
                        <span className="text-[11px] text-[#95efde] font-bold leading-none tracking-tight truncate">
                          {examSub}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Row - Notification Icon Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-11 h-11 rounded-full bg-[#5d8583] hover:bg-[#6c9593] active:scale-95 flex items-center justify-center transition relative cursor-pointer shadow-md"
          id="frame-bell-btn"
          style={{
            backgroundColor: '#5d8583',
          }}
        >
          <Bell className="w-5 h-5 text-[#fbc02d] fill-[#fbc02d]" strokeWidth={1.5} />
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#5d8583] flex items-center justify-center" />
          )}
        </button>

        {/* Notifications Popover */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-slate-900/95 border border-[#167e7c]/30 rounded-xl p-3 shadow-xl z-50 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 font-bold text-teal-350">
              <span className="uppercase text-[9px] tracking-widest text-[#0ec38c]">Live System Log</span>
              {notifications.length > 0 && (
                <button 
                  onClick={() => setNotifications([])} 
                  className="text-[9px] text-rose-300 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No new notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-2 bg-white/5 rounded-lg border border-white/5 text-slate-200">
                    {notif.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Premium Profile, Address, Refund & Order history view */}
      <ProfileDetails
        isOpen={showProfileDetails}
        onClose={() => setShowProfileDetails(false)}
        profile={profile}
        onChangeProfile={onChangeProfile}
        onLogout={onLogout}
      />
    </div>
  );
}
