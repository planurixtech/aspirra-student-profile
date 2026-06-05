import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Crown, 
  MapPin, 
  IndianRupee, 
  ShoppingBag, 
  Calendar, 
  SlidersHorizontal, 
  FileText, 
  Headphones, 
  MoreVertical,
  ChevronUp,
  ChevronDown,
  X,
  Edit3,
  Trash2,
  Plus,
  Compass,
  AlertCircle,
  Save,
  CheckCircle2,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

type OrderStatus = 'Delivered' | 'Cancelled' | 'In Transit' | 'Pending';

interface OrderItem {
  id: string;
  title: string;
  pages: number;
  date: string;
  status: OrderStatus;
  orderId?: string;
  time?: string;
  price?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface ProfileDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onChangeProfile: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export default function ProfileDetails({ isOpen, onClose, profile, onChangeProfile, onLogout }: ProfileDetailsProps) {
  const [activeTab, setActiveTab ] = useState<'orders' | 'subscriptions'>('orders');
  const [isHovered, setIsHovered] = useState<string | null>(null);
  
  // Real Local state-driven elements so absolute editability is guaranteed!
  const [profileName, setProfileName] = useState(profile.name);
  const [profilePhone, setProfilePhone] = useState(profile.phone || '+91 9845678734');
  const [profileEmail, setProfileEmail] = useState(profile.email || 'anusha1890@gmail.com');
  const [profileGroup, setProfileGroup] = useState(profile.group || 'TNPSC Group 1 - 2026');
  const [profileVerified, setProfileVerified] = useState(profile.isVerified !== false);
  const [overallProgress, setOverallProgress] = useState(40); // Matches "Over all 40%"

  // Subscription gold badge details
  const [premiumTitle, setPremiumTitle] = useState('Aspirra Premium');
  const [premiumDesc, setPremiumDesc] = useState('Free access to all PYQs for 15 more days');
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(15);
  const [premiumStatusActive, setPremiumStatusActive] = useState(true);

  // Saved Address destination text
  const [addressDetails, setAddressDetails] = useState('12B, North Avenue, Anna Nagar, Chennai - 600040, Tamil Nadu');
  
  // My Refund state log description
  const [refundStatusMessage, setRefundStatusMessage] = useState('No active refunds found in your log pipeline. All transactions are fully cleared.');

  // Live order list mapping exactly to screenshot:
  const [orders, setOrders] = useState<OrderItem[]>([
    { 
      id: 'ord-1', 
      title: 'Indian Polity Notes', 
      pages: 120, 
      date: 'Mar 22 , 2026', 
      status: 'Delivered' as const,
      orderId: 'ORD 1786543',
      time: '11 : 00 AM',
      price: 149,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid - Online'
    },
    { 
      id: 'ord-2', 
      title: 'Maths Pdf', 
      pages: 130, 
      date: 'Mar 18 , 2026', 
      status: 'Cancelled' as const,
      orderId: 'ORD 1786548',
      time: '01 : 00 PM',
      price: 80,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid - Online'
    }
  ]);

  // Navigation states for custom interactive sub-views (Image 1, Image 2, Image 3 & Image 4)
  const [currentScreen, setCurrentScreen] = useState<'profile' | 'order-delivered' | 'order-cancelled' | 'my-refunds' | 'request-refund'>('profile');
  const [selectedOrderIdx, setSelectedOrderIdx] = useState<number | null>(null);

  // Accordion details for Refund Sub-flow options
  const [refundReason, setRefundReason] = useState<'mistake' | 'content' | 'other'>('content');
  const [refundOtherText, setRefundOtherText] = useState('');
  const [isReasonOpen, setIsReasonOpen] = useState(true); // default open matching the screenshot open dropdown

  // Seed Refunds Ledger list with image default and load persistent submissions:
  const [refunds, setRefunds] = useState(() => {
    const saved = localStorage.getItem('aspirra_refunds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore & fallback
      }
    }
    return [
      { 
        id: 'ref-1', 
        title: 'Indian Polity Notes', 
        orderId: 'ORD178654', 
        date: 'Mar 18, 2026 01 : 00 PM', 
        status: 'Pending' as const 
      }
    ];
  });

  const saveRefunds = (updatedRefunds: typeof refunds) => {
    setRefunds(updatedRefunds);
    localStorage.setItem('aspirra_refunds', JSON.stringify(updatedRefunds));
  };

  // Subscription packs mock state
  const [subscriptionsList, setSubscriptionsList] = useState([
    { id: 'sub-1', title: 'TNPSC Group 1 Unlimited mock packs', expiresOn: 'Jun 15, 2026' }
  ]);

  // Active Bottom Sheet Customizer panel states
  const [editTarget, setEditTarget] = useState<'profile' | 'premium' | 'address' | 'refund' | 'orders' | 'add_order' | null>(null);

  // Notification Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for sub-forms
  const [formName, setFormName] = useState(profileName);
  const [formPhone, setFormPhone] = useState(profilePhone);
  const [formEmail, setFormEmail] = useState(profileEmail);
  const [formGroup, setFormGroup] = useState(profileGroup);
  const [formProgress, setFormProgress] = useState(overallProgress);

  const [formPremTitle, setFormPremTitle] = useState(premiumTitle);
  const [formPremDesc, setFormPremDesc] = useState(premiumDesc);
  const [formPremDays, setFormPremDays] = useState(premiumDaysLeft);

  const [formAddress, setFormAddress] = useState(addressDetails);
  const [formRefund, setFormRefund] = useState(refundStatusMessage);

  // Triggered when editing specific targets
  const openEditor = (target: 'profile' | 'premium' | 'address' | 'refund' | 'orders') => {
    if (target === 'profile') {
      setFormName(profileName);
      setFormPhone(profilePhone);
      setFormEmail(profileEmail);
      setFormGroup(profileGroup);
      setFormProgress(overallProgress);
    } else if (target === 'premium') {
      setFormPremTitle(premiumTitle);
      setFormPremDesc(premiumDesc);
      setFormPremDays(premiumDaysLeft);
    } else if (target === 'address') {
      setFormAddress(addressDetails);
    } else if (target === 'refund') {
      setFormRefund(refundStatusMessage);
    }
    setEditTarget(target);
  };

  // Save specific models
  const saveProfileFields = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileName(formName);
    setProfilePhone(formPhone);
    setProfileEmail(formEmail);
    setProfileGroup(formGroup);
    setOverallProgress(formProgress);

    // Call dynamic callback to sync home page
    onChangeProfile({
      ...profile,
      name: formName,
      phone: formPhone,
      email: formEmail,
      group: formGroup,
      avatarLetter: formName.charAt(0).toUpperCase() || 'A',
      isVerified: profileVerified
    });

    setEditTarget(null);
    showToast('Profile information successfully saved!');
  };

  const savePremiumFields = (e: React.FormEvent) => {
    e.preventDefault();
    setPremiumTitle(formPremTitle);
    setPremiumDesc(formPremDesc);
    setPremiumDaysLeft(formPremDays);
    setEditTarget(null);
    showToast('Premium package details updated!');
  };

  const saveAddressField = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressDetails(formAddress);
    setEditTarget(null);
    showToast('Delivery address rewritten!');
  };

  const saveRefundField = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundStatusMessage(formRefund);
    setEditTarget(null);
    showToast('Refund statement updated!');
  };

  // Manage Live Orders
  const [editingOrderIdx, setEditingOrderIdx] = useState<number | null>(null);
  const [orderFormTitle, setOrderFormTitle] = useState('');
  const [orderFormPages, setOrderFormPages] = useState(100);
  const [orderFormDate, setOrderFormDate] = useState('Mar 20, 2026');
  const [orderFormStatus, setOrderFormStatus] = useState<'Delivered' | 'Cancelled' | 'In Transit' | 'Pending'>('Delivered');

  const startEditOrder = (idx: number) => {
    const o = orders[idx];
    setEditingOrderIdx(idx);
    setOrderFormTitle(o.title);
    setOrderFormPages(o.pages);
    setOrderFormDate(o.date);
    setOrderFormStatus(o.status);
    setEditTarget('orders');
  };

  const handleSaveOrderChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrderIdx !== null) {
      const updated = [...orders];
      updated[editingOrderIdx] = {
        id: orders[editingOrderIdx].id,
        title: orderFormTitle,
        pages: Number(orderFormPages),
        date: orderFormDate,
        status: orderFormStatus
      };
      setOrders(updated);
      setEditingOrderIdx(null);
      setEditTarget(null);
      showToast('Order details modified successfully!');
    }
  };

  const handleDeleteOrder = (idx: number) => {
    const updated = orders.filter((_, i) => i !== idx);
    setOrders(updated);
    setEditingOrderIdx(null);
    setEditTarget(null);
    showToast('Order deleted from dispatch logs.');
  };

  const startAddOrder = () => {
    setOrderFormTitle('History PYQ Hand Book');
    setOrderFormPages(140);
    setOrderFormDate('May 28, 2026');
    setOrderFormStatus('Delivered');
    setEditTarget('add_order');
  };

  const handleAddNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      id: `ord-${Date.now()}`,
      title: orderFormTitle,
      pages: Number(orderFormPages),
      date: orderFormDate,
      status: orderFormStatus
    };
    setOrders([...orders, newOrder]);
    setEditTarget(null);
    showToast(`Added order: ${orderFormTitle}`);
  };

  // Helper toaster function
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end select-none" id="profile-details-fullview-overlay">
      {/* Background glass overlay */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Main container sliding in from Right (Matches exact layout in the screenshot) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-sm bg-[#f2f6fc] flex flex-col h-full z-50 shadow-2xl overflow-hidden"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* PROGRESS TOAST NOTIFICATION CONTAINER */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 16, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="absolute top-4 left-4 right-4 bg-slate-900/95 text-emerald-400 px-4 py-3 rounded-2xl border border-emerald-500/20 shadow-2xl flex items-center gap-2.5 z-[1300] text-xs font-bold"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE MAIN BODY VIEWPORT */}
        <div className="flex-1 overflow-y-auto pb-10">
          
          {/* PROFILE EXTRA-DEEP TEAL CURVED HEADER SECTION (Matches exact header styling) */}
          <div 
            className="w-full bg-[#125652] pt-5 pb-6 px-4 text-white relative flex flex-col shrink-0"
            style={{
              borderBottomLeftRadius: '32px',
              borderBottomRightRadius: '32px',
              boxShadow: '0px 6px 20px rgba(18, 86, 82, 0.25)'
            }}
          >
            {/* Top Navigation Row matching header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={onClose}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 active:scale-95 transition"
                title="Back to home screen"
              >
                <ChevronLeft className="w-5 h-5 text-slate-800 stroke-[3]" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEditor('profile')}
                  className="px-3 py-1 text-[11px] font-bold border border-white/20 hover:bg-white/10 rounded-full flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white stroke-[2.3]" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to log out?')) {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('authUser');
                      onLogout?.();
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-white cursor-pointer transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Profile Detail Row (Exact align & verified checkmark) */}
            <div className="flex items-start gap-4 mt-2">
              
              {/* White Avatar Badge w/ Green Online indicator */}
              <div 
                className="p-0.5 bg-white/20 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition"
                onClick={() => openEditor('profile')}
                title="Click to edit Name/Avatar"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-800 text-3xl font-black shadow-lg border-2 border-[#125652]">
                    {profileName.charAt(0).toUpperCase() || 'A'}
                  </div>
                  {/* Visual online indicator */}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#38c172] border-2 border-[#125652] rounded-full shadow-sm animate-pulse" />
                </div>
              </div>

              {/* Identification details block */}
              <div className="flex-1 space-y-1 text-left min-w-0">
                <div 
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => openEditor('profile')}
                >
                  <h3 className="font-extrabold text-[21px] tracking-tight text-white leading-none truncate group-hover:underline">
                    {profileName}
                  </h3>
                  {profileVerified && (
                    <div className="w-4.5 h-4.5 rounded-full bg-[#38c172] flex items-center justify-center shadow-sm shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[4]" />
                    </div>
                  )}
                </div>

                <p 
                  className="text-[12.5px] text-teal-100 font-bold tracking-wide leading-none cursor-pointer hover:underline"
                  onClick={() => openEditor('profile')}
                >
                  {profilePhone}
                </p>

                <p 
                  className="text-[12.5px] text-teal-150/90 font-medium tracking-wide truncate pb-1 cursor-pointer hover:underline"
                  onClick={() => openEditor('profile')}
                >
                  {profileEmail}
                </p>

                {/* Subtitle group tag (Matches TNPSC Group 1 pill badge) */}
                <div 
                  onClick={() => openEditor('profile')}
                  className="inline-flex items-center gap-2 cursor-pointer pt-0.5"
                >
                  <span className="text-[10px] font-black bg-white text-[#125652] px-2 py-0.5 rounded-md leading-none shadow-sm">
                    TNPSC
                  </span>
                  <span className="text-[12.5px] font-extrabold text-white tracking-tight leading-none">
                    {profileGroup.replace('TNPSC ', '').replace(' - 2026', '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Over All Progress Tracker row (Matching "Over all 40%") */}
            <div 
              className="mt-5 space-y-2 text-left cursor-pointer group"
              onClick={() => openEditor('profile')}
              title="Click to override progress"
            >
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span className="tracking-tight text-teal-150 group-hover:underline flex items-center gap-1">
                  Overall Progress <Edit3 className="w-3 h-3 opacity-60" />
                </span>
                <span className="text-[#3ee0ad] text-[13.5px] tracking-tight font-black">
                  Over all {overallProgress}%
                </span>
              </div>
              
              {/* Process Bar container with green active flow */}
              <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1ae2a0] rounded-full transition-all duration-500" 
                  style={{ width: `${overallProgress}%` }} 
                />
              </div>
            </div>
          </div>

          {/* DRIVER EDITING ADVICE BANNER */}
          <div className="mx-4 mt-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl text-left text-[11px] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Click on any section or card lower down to edit it!</span>
          </div>

          {/* MAIN SPACE CARDS BLOCK */}
          <div className="px-4 mt-4 space-y-4">
            
            {/* CARD A: ASPIRRA PREMIUM BADGE CARD (Matches gold palette perfectly) */}
            <div 
              className="w-full p-4 rounded-[24px] border border-[#f1d176]/50 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition duration-200 group"
              style={{ background: 'linear-gradient(to right, #FDE8BF 0%, #F2D480 40%, #F1D176 46%, #FEEDC8 100%)' }}
              onClick={() => openEditor('premium')}
              title="Configure subscription tier details"
            >
              <div className="flex items-center gap-3">
                {/* White circular Crown shield */}
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500 shrink-0 border border-[#fbd0a0]">
                  <Crown className="w-5 h-5 text-amber-600 fill-amber-500" strokeWidth={2} />
                </div>
                
                {/* Premium Description Texts */}
                <div className="text-left space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[14.5px] text-slate-850 leading-none group-hover:underline">
                      {premiumTitle}
                    </span>
                    {premiumStatusActive && (
                      <span className="px-1.5 py-0.2 text-[9.5px] font-black text-white bg-emerald-600 rounded-full flex items-center justify-center leading-none">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-650 font-bold leading-tight">
                    {premiumDesc}
                  </p>
                </div>
              </div>

              {/* Right section: Days Left Circular icon & up-chevron */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Round badge tracker */}
                <div className="w-12 h-12 bg-white/50 border border-amber-350/20 rounded-full flex flex-col items-center justify-center text-slate-800 leading-none">
                  <span className="text-[14px] font-black">{premiumDaysLeft}</span>
                  <span className="text-[8px] font-bold text-slate-500 scale-95 mt-0.5">Days Left</span>
                </div>
                
                {/* Up/down chevron */}
                <ChevronUp className="w-4 h-4 text-slate-600 stroke-[3.5]" />
              </div>
            </div>

            {/* CARD B & C: HORIZONTAL ACTION BUTTONS ROW (Matches exact layout in Screenshot 3) */}
            <div className="bg-white rounded-[24px] border border-slate-205/60 shadow-sm p-3.5 flex items-center justify-between gap-1.5">
              
              {/* Left Action Column (Saved Address) */}
              <div 
                className="flex-1 flex items-center justify-between cursor-pointer group pr-2.5"
                onClick={() => openEditor('address')}
                title="Edit Saved Delivery Location"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Pale Green MapPin placeholder */}
                  <div className="w-8 h-8 bg-[#ecfdf5] rounded-xl flex items-center justify-center shrink-0 border border-[#d1fae5]/50">
                    <MapPin className="w-4 h-4 text-[#059669] fill-[#a7f3d0]/30" />
                  </div>
                  <span className="text-[12.5px] font-bold text-slate-800 truncate group-hover:text-[#059669] transition">
                    Saved Address
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[3.5] group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Solid Vertical Divider */}
              <div className="h-6 w-px bg-slate-200" />

              {/* Right Action Column (My Refund) */}
              <div 
                className="flex-1 flex items-center justify-between cursor-pointer group pl-2.5"
                onClick={() => setCurrentScreen('my-refunds')}
                title="View Refund Logs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Pale Green Rupee placeholder */}
                  <div className="w-8 h-8 bg-[#ecfdf5] rounded-xl flex items-center justify-center shrink-0 border border-[#d1fae5]/50">
                    <IndianRupee className="w-4 h-4 text-[#059669] stroke-[2.8]" />
                  </div>
                  <span className="text-[12.5px] font-bold text-slate-800 truncate group-hover:text-[#059669] transition">
                    My Refund
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[3.5] group-hover:translate-x-0.5 transition-transform" />
              </div>

            </div>

            {/* CARD D: ORDER HISTORY BLOCK (White Card base with Inner list) */}
            <div className="bg-white rounded-[28px] border border-slate-200/75 p-5 shadow-sm space-y-4 text-left">
              
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-[15.5px] text-slate-900 tracking-tight leading-none mb-1">
                  Order History
                </h4>
                
                {/* Quick Add Order option */}
                <button 
                  onClick={startAddOrder}
                  className="text-[11px] font-black text-[#125652] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Insert custom order log item"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Log
                </button>
              </div>

              {/* Tab options strip & Filter key settings */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {/* Tab Option 1 */}
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer min-w-[85px] justify-center ${
                      activeTab === 'orders' 
                        ? 'bg-[#125652] text-white shadow-sm' 
                        : 'text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </button>

                  {/* Tab Option 2 */}
                  <button 
                    onClick={() => setActiveTab('subscriptions')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-w-[110px] justify-center ${
                      activeTab === 'subscriptions' 
                        ? 'bg-[#125652] text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Subscriptions</span>
                  </button>
                </div>

                {/* Filter / Settings Button icon */}
                <button 
                  onClick={() => showToast('Order filter preferences saved')}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-650 cursor-pointer transition border border-slate-150"
                  title="Filter logs list"
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[2.3]" />
                </button>
              </div>

              {/* Conditional List Output */}
              {activeTab === 'orders' ? (
                <div className="space-y-3">
                  
                  {orders.map((o, idx) => (
                    <div 
                      key={o.id}
                      onClick={() => {
                        setSelectedOrderIdx(idx);
                        if (o.status === 'Delivered') {
                          setCurrentScreen('order-delivered');
                        } else if (o.status === 'Cancelled') {
                          setCurrentScreen('order-cancelled');
                        } else {
                          startEditOrder(idx);
                        }
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2.5xl border border-slate-150 hover:border-slate-350 cursor-pointer transition bg-slate-50/50 hover:bg-slate-50"
                      title="Click to view details or request refund"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Styled green folder icon */}
                        <div className="w-10 h-10 bg-emerald-50 border border-emerald-250/20 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5.5 h-5.5 stroke-[2.3]" />
                        </div>
                        
                        <div className="text-left space-y-0.5 min-w-0">
                          <h5 className="font-extrabold text-[13.5px] text-slate-850 truncate leading-none">
                            {o.title}
                          </h5>
                          {/* Note spacing before comma exactly matches screenshot */}
                          <p className="text-[11px] text-slate-500 font-bold leading-tight">
                            • {o.pages} Pages • Ordered on {o.date.replace('o', ' o')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-1 text-[9.5px] font-black rounded-lg font-mono ${
                          o.status === 'Delivered' 
                            ? 'text-emerald-700 bg-emerald-50' 
                            : o.status === 'Cancelled'
                            ? 'text-rose-600 bg-rose-50'
                            : o.status === 'In Transit'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-amber-600 bg-amber-50'
                        }`}>
                          {o.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <p className="text-sm text-slate-400 py-6 text-center font-bold">No orders found. Add one with the "Add Log" button above.</p>
                  )}

                </div>
              ) : (
                /* Subscriptions selection */
                <div className="space-y-3.5 py-2">
                  {subscriptionsList.map((sub, i) => (
                    <div 
                      key={sub.id}
                      onClick={() => {
                        const updated = [...subscriptionsList];
                        const inputTitle = prompt('Edit subscription title:', sub.title);
                        if (inputTitle) {
                          updated[i].title = inputTitle;
                          setSubscriptionsList(updated);
                          showToast('Subscription updated');
                        }
                      }}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer"
                    >
                      <div className="text-left">
                        <h5 className="text-xs font-black text-slate-800">{sub.title}</h5>
                        <p className="text-[10px] text-slate-500 font-bold">Renews until {sub.expiresOn}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

        {/* VIEW 1: ORDER DELIVERED DETAILS SCREEN */}
        <AnimatePresence>
          {currentScreen === 'order-delivered' && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#f2f6fc] z-40 flex flex-col overflow-hidden"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <div className="w-full bg-[#125652] pt-5 pb-5 px-4 text-white relative flex flex-col shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentScreen('profile')}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 active:scale-95 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-800 stroke-[3.5]" />
                  </button>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-extrabold text-[17px] tracking-tight text-white leading-tight truncate">
                      {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.title : 'Indian Polity Notes'}
                    </h3>
                    <p className="text-[11px] text-teal-200/80 font-bold tracking-wide mt-0.5">
                      Order Details
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable details wrapper */}
              <div className="flex-1 overflow-y-auto pb-8 pt-4 space-y-4">
                {/* Visual item spec card */}
                <div className="bg-white rounded-[20px] p-4 mx-4 shadow-sm border border-slate-150/70 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-250/20 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5.5 h-5.5 stroke-[2.3]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-900 text-[13.5px] leading-none">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.title : 'Indian Polity Notes'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">
                        • {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.pages : 120} Pages
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-[#059669] bg-[#ecfdf5] border border-[#34d399]/40 px-2.5 py-1 rounded-lg">
                    {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.status : 'Delivered'}
                  </span>
                </div>

                {/* Details list card */}
                <div className="bg-white rounded-[24px] p-5 mx-4 shadow-sm border border-slate-150/70 text-left space-y-4">
                  <h4 className="font-extrabold text-[13.5px] text-slate-900 tracking-tight leading-none pb-2 border-b border-b-slate-100">
                    Order Details
                  </h4>

                  <div className="space-y-3.5 text-xs font-bold font-sans">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order ID</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.orderId : 'ORD 1786543'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order Date</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.date : 'Mar 22 , 2026'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order Time</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.time : '11 : 00 AM'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Amount</span>
                      <span className="text-slate-805 font-black">
                        ₹ {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.price : 149}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Payment Method</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.paymentMethod : 'UPI'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Payment Status</span>
                      <span className="text-[#38c172] font-black">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.paymentStatus : 'Paid - Online'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 2: ORDER CANCELLED DETAILS SCREEN */}
        <AnimatePresence>
          {currentScreen === 'order-cancelled' && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#f2f6fc] z-40 flex flex-col overflow-hidden"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <div className="w-full bg-[#125652] pt-5 pb-5 px-4 text-white relative flex flex-col shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentScreen('profile')}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 active:scale-95 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-800 stroke-[3.5]" />
                  </button>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-extrabold text-[17px] tracking-tight text-white leading-tight truncate">
                      {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.title : 'Maths Pdf'}
                    </h3>
                    <p className="text-[11px] text-teal-200/80 font-bold tracking-wide mt-0.5">
                      Order Details
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable details wrapper */}
              <div className="flex-1 overflow-y-auto pb-8 pt-4 space-y-4">
                {/* Visual item spec card */}
                <div className="bg-white rounded-[20px] p-4 mx-4 shadow-sm border border-slate-150/70 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5.5 h-5.5 stroke-[2.3]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-900 text-[13.5px] leading-none">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.title : 'Maths Pdf'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">
                        • {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.pages : 130} Pages
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-rose-600 bg-[#fef2f2] border border-rose-250/20 px-2.5 py-1 rounded-lg">
                    {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.status : 'Cancelled'}
                  </span>
                </div>

                {/* Details list card */}
                <div className="bg-white rounded-[24px] p-5 mx-4 shadow-sm border border-slate-150/70 text-left space-y-5">
                  <h4 className="font-extrabold text-[13.5px] text-slate-900 tracking-tight leading-none pb-2 border-b border-b-slate-100">
                    Order Details
                  </h4>

                  <div className="space-y-3.5 text-xs font-bold font-sans">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order ID</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.orderId : 'ORD 1786543'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order Date</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.date : 'Mar 22 , 2026'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Order Time</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.time : '11 : 00 AM'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Amount</span>
                      <span className="text-slate-880 font-black">
                        ₹ {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.price : 80}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Payment Method</span>
                      <span className="text-slate-800 font-extrabold">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.paymentMethod : 'UPI'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Payment Status</span>
                      <span className="text-rose-600 font-black">Cancelled</span>
                    </div>
                  </div>

                  {/* Request Refund button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentScreen('request-refund')}
                      className="w-full bg-[#125652] hover:bg-[#18645f] text-white rounded-[10px] py-2.5 font-bold text-xs tracking-wide shadow-md transition duration-150 cursor-pointer text-center select-none"
                    >
                      Request Refund
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 3: REQUEST REFUND BOTTOM-TO-UP SLIDING SCREEN */}
        <AnimatePresence>
          {currentScreen === 'request-refund' && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 bg-[#f2f6fc] z-50 flex flex-col overflow-hidden"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <div className="w-full bg-[#125652] pt-5 pb-5 px-4 text-white relative flex flex-col shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentScreen('order-cancelled')}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 active:scale-95 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-800 stroke-[3.5]" />
                  </button>
                  <h3 className="font-extrabold text-[17px] tracking-tight text-white leading-none">
                    Request Refund
                  </h3>
                </div>
              </div>

              {/* Scrollable Form contents */}
              <div className="flex-1 overflow-y-auto pb-8 pt-4 space-y-4">
                
                {/* Visual item card */}
                <div className="bg-white rounded-[20px] p-4 mx-4 shadow-sm border border-slate-150/70 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-750 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5.5 h-5.5 stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-900 text-[13.5px] leading-tight">
                        {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.title : 'Maths Pdf'}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">
                        • {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.pages : 130} Pages
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-rose-600 bg-[#fef2f2] border border-rose-250/20 px-2.5 py-1 rounded-lg">
                    Cancelled
                  </span>
                </div>

                {/* Refund Details specifications layout */}
                <div className="mx-4 text-left space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-mono">
                    Refund Details
                  </span>

                  <div className="bg-white rounded-[20px] p-4.5 shadow-sm border border-slate-150/70 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Refund Amount</span>
                    <span className="font-black text-rose-600 text-sm">
                      ₹ {selectedOrderIdx !== null ? orders[selectedOrderIdx]?.price : 80}
                    </span>
                  </div>
                </div>

                {/* Interactive Refund Form input cards */}
                <div className="mx-4 text-left space-y-20">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1 font-mono">
                      Request for Refund
                    </span>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-150/70 space-y-4">
                      {/* Choose a reason custom accordion bar */}
                      <div 
                        onClick={() => setIsReasonOpen(!isReasonOpen)}
                        className="flex justify-between items-center cursor-pointer select-none py-1 border-b border-slate-100"
                      >
                        <span className="text-xs font-extrabold text-slate-850">
                          Choose a reason
                        </span>
                        {isReasonOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-600 stroke-[3.5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600 stroke-[3.5]" />
                        )}
                      </div>

                      {isReasonOpen && (
                        <div className="space-y-4 pt-1.5">
                          {/* Option 1: Purchased by mistake */}
                          <div 
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => setRefundReason('mistake')}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                              refundReason === 'mistake' ? 'border-[#125652]' : 'border-slate-300'
                            }`}>
                              {refundReason === 'mistake' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#125652]" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              Purchased by mistake
                            </span>
                          </div>

                          {/* Option 2: Content not as expected */}
                          <div 
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => setRefundReason('content')}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                              refundReason === 'content' ? 'border-[#125652]' : 'border-slate-300'
                            }`}>
                              {refundReason === 'content' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#125652]" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              Content not as expected
                            </span>
                          </div>

                          {/* Option 3: Other - please specify */}
                          <div 
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => setRefundReason('other')}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                              refundReason === 'other' ? 'border-[#125652]' : 'border-slate-300'
                            }`}>
                              {refundReason === 'other' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#125652]" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              Other ( Please Specify )
                            </span>
                          </div>

                          {/* Animated Other specifications field */}
                          <div className="pt-2">
                            <textarea
                              value={refundOtherText}
                              onChange={(e) => setRefundOtherText(e.target.value.slice(0, 100))}
                              placeholder="Tell us more about the issue..."
                              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-[#125652] focus:bg-white text-xs font-medium leading-relaxed resize-none text-black"
                              maxLength={100}
                            />
                            <div className="flex justify-end text-[10px] text-slate-400 font-bold mt-1 font-mono">
                              {refundOtherText.length}/100
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Submit Request button */}
                <div className="px-4 pt-4 shrink-0">
                  <button
                    onClick={() => {
                      const selectedOrder = selectedOrderIdx !== null ? orders[selectedOrderIdx] : null;
                      const refundTitle = selectedOrder ? selectedOrder.title : 'Maths pdf';
                      const orderCodeId = selectedOrder ? selectedOrder.orderId : 'ORD 1786548';
                      const refundAmount = selectedOrder ? selectedOrder.price : 80;

                      // Create a log item that can also be accessed by the admin panel
                      const formattedDateCode = orderCodeId.replace(/\s+/g, '');
                      const newRefundItem = {
                        id: `ref-${Date.now()}`,
                        title: refundTitle,
                        orderId: formattedDateCode,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' 01 : 00 PM',
                        status: 'Pending' as const,
                        reason: refundReason,
                        message: refundReason === 'other' ? refundOtherText : 'Content not as expected'
                      };

                      const updatedRefundsList = [newRefundItem, ...refunds];
                      saveRefunds(updatedRefundsList);

                      // Administrative log message is also printed to the console as instructed
                      console.log(`[Aspirra Admin Channel] New Refund Requested! Item: ${refundTitle} | Reason: ${refundReason} | Specific Message: ${refundOtherText || 'N/A'}`);

                      showToast(`Refund Request Submitted successfully for ₹${refundAmount}!`);
                      setRefundOtherText('');
                      
                      // Slide right-to-left into My Refunds (Image 4)
                      setCurrentScreen('my-refunds');
                    }}
                    className="w-full bg-[#125652] hover:bg-[#18645f] text-white rounded-[10px] py-2.5 font-bold text-xs tracking-wide shadow-md transition duration-150 cursor-pointer text-center select-none"
                  >
                    Submit Request Refund
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 4: MY REFUNDS SCREEN (LEDGER TRACKER) */}
        <AnimatePresence>
          {currentScreen === 'my-refunds' && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#f2f6fc] z-40 flex flex-col overflow-hidden"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <div className="w-full bg-[#125652] pt-5 pb-5 px-4 text-white relative flex flex-col shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentScreen('profile')}
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 active:scale-95 transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-800 stroke-[3.5]" />
                    </button>
                    <h3 className="font-extrabold text-[17px] tracking-tight text-white leading-tight">
                      My Refunds
                    </h3>
                  </div>

                  {/* High quality Outlined Help Button */}
                  <button 
                    onClick={() => {
                      const noteText = prompt("Do you need help with a transaction? Send a message to admin:");
                      if (noteText) {
                        console.log(`[Admin Help Pipeline] Ticket Raised: ${noteText}`);
                        showToast("Help ticket dispatched successfully to support!");
                      } else {
                        showToast("Aspirra Support channels are active.");
                      }
                    }}
                    className="border border-white/40 text-white rounded-full px-4.5 py-1 text-xs font-bold font-sans hover:bg-white/10 active:scale-95 transition cursor-pointer select-none"
                  >
                    Help
                  </button>
                </div>
              </div>

              {/* Scrollable refunds list */}
              <div className="flex-1 overflow-y-auto pb-10 pt-4 px-4 space-y-3.5">
                {refunds.map((ref) => (
                  <div
                    key={ref.id}
                    onClick={() => {
                      showToast(`Transaction details for order ${ref.orderId} is currently ${ref.status}`);
                    }}
                    className="relative bg-white rounded-[20px] p-4.5 shadow-sm border border-slate-150/60 text-left cursor-pointer hover:border-slate-350 transition flex justify-between tracking-tight"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Document vector-like icon */}
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5.5 h-5.5 stroke-[2]" />
                      </div>

                      <div className="space-y-1 text-left min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {ref.title}
                        </h4>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-slate-400 leading-none">
                            Order ID : {ref.orderId}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 leading-tight">
                            Requested on {ref.date}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pending label on the right */}
                    <div className="flex flex-col items-end justify-between shrink-0 pl-2">
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/50 px-3 py-0.5 rounded-full select-none">
                        {ref.status}
                      </span>

                      {/* Small chevron in bottom right matching Image 4 */}
                      <ChevronRight className="w-4 h-4 text-slate-300 stroke-[3] mt-3" />
                    </div>
                  </div>
                ))}

                {refunds.length === 0 && (
                  <p className="text-slate-450 text-center py-10 text-xs font-bold font-sans">No refund records submitted yet.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* FULL-SCALE DRAWER / BOTTOM SHEET SLIDEOUT EDIT PANEL */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-[1200] flex items-end justify-center select-none" id="live-bottom-sheet-customizer">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
              onClick={() => setEditTarget(null)} 
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 210 }}
              className="bg-white border-t border-slate-200 rounded-t-[32px] max-w-sm w-full p-6 shadow-2xl relative z-20 text-left space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#125652]/10 flex items-center justify-center text-[#125652]">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-950 text-[15px] tracking-tight">
                    {editTarget === 'profile' && 'Edit User Profile Information'}
                    {editTarget === 'premium' && 'Customize Subscription Card'}
                    {editTarget === 'address' && 'Modify Saved Destination Address'}
                    {editTarget === 'refund' && 'Change Refund Log Message'}
                    {editTarget === 'orders' && 'Edit Active Study Material Order'}
                    {editTarget === 'add_order' && 'Insert New Dispatched Material'}
                  </h4>
                </div>
                <button 
                  onClick={() => setEditTarget(null)} 
                  className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* PROFILE EDITOR FORM */}
              {editTarget === 'profile' && (
                <form onSubmit={saveProfileFields} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">Full Handle Name</label>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] focus:bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Phone Code (+91...)</label>
                    <input 
                      type="text" 
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] focus:bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Verified Email Address</label>
                    <input 
                      type="email" 
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] focus:bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Selected Syllabus Category</label>
                    <select 
                      value={formGroup}
                      onChange={(e) => setFormGroup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-sm"
                    >
                      <option value="TNPSC Group 1 - 2026">TNPSC Group 1</option>
                      <option value="TNPSC Group 2 - 2026">TNPSC Group 2</option>
                      <option value="TNPSC Group 4 - 2026">TNPSC Group 4</option>
                    </select>
                  </div>

                  {/* Dynamic Progress Controller */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-slate-600">Overall Progress Percentage</label>
                      <span className="text-[#125652] font-black">{formProgress}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={formProgress}
                      onChange={(e) => setFormProgress(Number(e.target.value))}
                      className="w-full accent-[#125652] h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Verification Checkmark block */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <input 
                      type="checkbox"
                      id="verified-profile-check"
                      checked={profileVerified}
                      onChange={(e) => setProfileVerified(e.target.checked)}
                      className="w-4 h-4 text-[#125652] accent-[#125652] rounded border-slate-300 focus:ring-0"
                    />
                    <label htmlFor="verified-profile-check" className="text-slate-700 font-bold select-none cursor-pointer">
                      Show Verified badge icon next to name
                    </label>
                  </div>

                  <div className="pt-3">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#125652] text-white rounded-xl text-center text-xs font-black shadow-md cursor-pointer hover:bg-[#19635f] transition flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Save Profile Details
                    </button>
                  </div>
                </form>
              )}

              {/* SUBSCRIPTION EDITOR FORM */}
              {editTarget === 'premium' && (
                <form onSubmit={savePremiumFields} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">Subscription Title</label>
                    <input 
                      type="text" 
                      value={formPremTitle}
                      onChange={(e) => setFormPremTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Promotional Description</label>
                    <input 
                      type="text" 
                      value={formPremDesc}
                      onChange={(e) => setFormPremDesc(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#cadbe8] rounded-xl focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Days Left Count (Numbers only)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="365"
                      value={formPremDays}
                      onChange={(e) => setFormPremDays(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox"
                      id="status-active-check"
                      checked={premiumStatusActive}
                      onChange={(e) => setPremiumStatusActive(e.target.checked)}
                      className="w-4 h-4 accent-[#125652]"
                    />
                    <label htmlFor="status-active-check" className="text-slate-700">
                      Show Green "Active" pill tag
                    </label>
                  </div>

                  <div className="pt-3">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#125652] text-white rounded-xl text-center text-xs font-black shadow-md cursor-pointer hover:bg-[#19635f] transition"
                    >
                      Update Subscription Card info
                    </button>
                  </div>
                </form>
              )}

              {/* ADDRESS EDITOR FORM */}
              {editTarget === 'address' && (
                <form onSubmit={saveAddressField} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">Saved Address details</label>
                    <textarea 
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-xs font-medium leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#125652] text-white rounded-xl text-center text-xs font-black shadow-md cursor-pointer hover:bg-[#19635f] transition"
                    >
                      Apply New Address Location
                    </button>
                  </div>
                </form>
              )}

              {/* REFUND LOG EDITOR FORM */}
              {editTarget === 'refund' && (
                <form onSubmit={saveRefundField} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">Refund status message info</label>
                    <textarea 
                      value={formRefund}
                      onChange={(e) => setFormRefund(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-xs font-medium text-black"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#125652] text-white rounded-xl text-center text-xs font-black shadow-md cursor-pointer hover:bg-[#19635f] transition"
                    >
                      Update Refund Logs
                    </button>
                  </div>
                </form>
              )}

              {/* ORDER MANAGEMENT FORM (EDIT OR DELETE ACTIVE) */}
              {editTarget === 'orders' && editingOrderIdx !== null && (
                <form onSubmit={handleSaveOrderChanges} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">Dispatched Item Name</label>
                    <input 
                      type="text" 
                      value={orderFormTitle}
                      onChange={(e) => setOrderFormTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block mb-1.5 text-slate-600">Pages Count</label>
                      <input 
                        type="number" 
                        min="1"
                        value={orderFormPages}
                        onChange={(e) => setOrderFormPages(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-600">Purchase Date</label>
                      <input 
                        type="text" 
                        value={orderFormDate}
                        onChange={(e) => setOrderFormDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Logistical Dispatch Status</label>
                    <select 
                      value={orderFormStatus}
                      onChange={(e) => setOrderFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleDeleteOrder(editingOrderIdx)}
                      className="flex-1 py-3 border border-rose-200 text-rose-600 rounded-xl text-center font-bold font-sans hover:bg-rose-50 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Order
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-[#125652] text-white rounded-xl text-center font-black hover:bg-[#18645f]"
                    >
                      Apply Changes
                    </button>
                  </div>
                </form>
              )}

              {/* NEW ORDER FORM */}
              {editTarget === 'add_order' && (
                <form onSubmit={handleAddNewOrderSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5 text-slate-600">New Item Name</label>
                    <input 
                      type="text" 
                      value={orderFormTitle}
                      onChange={(e) => setOrderFormTitle(e.target.value)}
                      placeholder="e.g. Science Revision Handbook"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125652] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block mb-1.5 text-slate-600">Pages Count</label>
                      <input 
                        type="number" 
                        min="1"
                        value={orderFormPages}
                        onChange={(e) => setOrderFormPages(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-slate-600">Order Date</label>
                      <input 
                        type="text" 
                        value={orderFormDate}
                        onChange={(e) => setOrderFormDate(e.target.value)}
                        placeholder="e.g. May 31, 2026"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-600">Initial Status</label>
                    <select 
                      value={orderFormStatus}
                      onChange={(e) => setOrderFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="pt-3">
                    <button 
                      type="submit"
                      className="w-full py-3 bg-[#125652] text-white rounded-xl text-center text-xs font-black shadow-md cursor-pointer hover:bg-[#19635f] transition"
                    >
                      Insert Into Dispatch logs
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
