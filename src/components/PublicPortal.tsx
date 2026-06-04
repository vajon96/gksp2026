import React, { useState } from "react";
import { Notice, Event, OrgSettings } from "../types.ts";

interface PublicPortalProps {
  settings: OrgSettings;
  notices: Notice[];
  events: Event[];
  visitorCount: number;
  approvedCount: number;
  pendingCount: number;
  lang: "en" | "bn";
  onApplyClick: () => void;
  onLoginClick: () => void;
  onVolunteerRegister: (eventId: string, memberId: string) => Promise<void>;
  memberSession: { memberId: string; fullName: string } | null;
  onEmbedLogin?: (role: "admin" | "member", user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  settings,
  notices,
  events,
  visitorCount,
  approvedCount,
  pendingCount,
  lang,
  onApplyClick,
  onLoginClick,
  onVolunteerRegister,
  memberSession,
  onEmbedLogin,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "notices" | "events" | "contribute" | "verify" | "login">("home");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Donation Form States
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Temple Renovation");
  const [paymentMethod, setPaymentMethod] = useState("bKash Wallet");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Volunteers states inside public layout
  const [volunteerMemberId, setVolunteerMemberId] = useState(memberSession?.memberId || "");
  const [volunteerMsg, setVolunteerMsg] = useState<{ id: string; text: string; error: boolean } | null>(null);

  // Embedded Option Login States
  const [localLoginRole, setLocalLoginRole] = useState<"member" | "admin">("member");
  const [localUsername, setLocalUsername] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [localLoginError, setLocalLoginError] = useState("");
  const [localIsLoggingIn, setLocalIsLoggingIn] = useState(false);

  const handleLocalLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localLoginRole === "member" && !localUsername.trim()) return;
    if (!localPassword) return;

    setLocalIsLoggingIn(true);
    setLocalLoginError("");

    if (onEmbedLogin) {
      const result = await onEmbedLogin(localLoginRole, localUsername, localPassword);
      if (result && !result.success) {
        setLocalLoginError(result.message || "Invalid credentials.");
        setLocalIsLoggingIn(false);
      } else {
        setLocalUsername("");
        setLocalPassword("");
        setLocalIsLoggingIn(false);
      }
    } else {
      setLocalLoginError("Authentication configuration link is active but callback not set.");
      setLocalIsLoggingIn(false);
    }
  };

  const t = {
    en: {
      navHome: "Home Portal",
      navNotices: "Notice Board",
      navEvents: "Sacred Festivals",
      navContribute: "Temple Contribution",
      navVerify: "Verify ID Card",
      navLogin: "Security Login",
      applyBtn: "Join Member Seva",
      loginBtn: "Member Login",
      dashboardBtn: "Go To Cabinet",
      heroTitle: settings.orgName,
      heroSubtitle: settings.slogan,
      aboutUs: "Who We Are",
      mission: "Spiritual Mission",
      vision: "Our Broad Vision",
      leaders: "Executive Administrators",
      president: "Sri President Council",
      secretary: "General Coordinator Secretary",
      address: "Registered Headquarters",
      contacts: "Communications Desk",
      visitors: "Cumulative Visitors",
      totalMembers: "Verified Devotees",
      noticesHeading: "Latest CMS Announcement Circulars",
      eventsHeading: "Upcoming Celestial Celebrations",
      contributeHeading: "Secure Temple Seva Donation Gate",
      verifyHeading: "Automated QR Member Authentication",
      verifyPlaceholder: "Enter Member ID (e.g., SKSSF-2026-0001)",
      verifyBtn: "Scan & Validate Card",
      donorLabel: "Donor Legal Name",
      donorAmount: "Contributed Amount (BDT)",
      donorPurpose: "Purpose of Dedication",
      paymentWallet: "Selected Digital Wallet",
      trnxId: "Transaction TrxID (Bkash/Nagad)",
      submitDonation: "Verify & Dispatch Contribution",
      donationAlert: "Blessings! Your donation record has been submitted and is queued for verified approval ledger.",
    },
    bn: {
      navHome: "মূল পাতা",
      navNotices: "বিজ্ঞপ্তি বোর্ড",
      navEvents: "উৎসব ও সেবামূলক কাজ",
      navContribute: "মন্দির দান ও সেবা",
      navVerify: "আইডি কার্ড যাচাই",
      navLogin: "লগইন করুন",
      applyBtn: "সদস্যপদ আবেদন",
      loginBtn: "লগইন করুন",
      dashboardBtn: "আমার ক্যাবিনেট",
      heroTitle: settings.orgName,
      heroSubtitle: settings.slogan,
      aboutUs: "আমাদের সম্পর্কে",
      mission: "আধ্যাত্মিক লক্ষ্য (Mission)",
      vision: "ভবিষ্যত দর্শন (Vision)",
      leaders: "কার্যনির্বাহী নেতৃত্ব",
      president: "মাননীয় সভাপতি",
      secretary: "সাধারণ সম্পাদক",
      address: "নিবন্ধিত কার্যালয়ের ঠিকানা",
      contacts: "যোগাযোগ ডেস্ক",
      visitors: "মোট ফ্যান/ভিজিটর",
      totalMembers: "অনুমোদিত সদস্য",
      noticesHeading: "সর্বশেষ অফিসিয়াল বিজ্ঞপ্তি সমূহ",
      eventsHeading: "আসন্ন ধর্মীয় উৎসব ও সেবামূলক কার্যক্রম",
      contributeHeading: "মন্দির উন্নয়ন ফান্ড ও সেবা অনুদান",
      verifyHeading: "ডিজিটাল কিউআর কার্ড সত্যতা যাচাইকরণ",
      verifyPlaceholder: "সদস্য আইডি দিন (উদা: SKSSF-2026-0001)",
      verifyBtn: "যাচাই করুন",
      donorLabel: "দাতার পূর্ণ নাম",
      donorAmount: "অনুদানের পরিমাণ (টাকা)",
      donorPurpose: "অনুদানের খাত",
      paymentWallet: "পেমেন্ট মাধ্যম",
      trnxId: "লেনদেন ট্রানজেকশন আইডি (TrxID)",
      submitDonation: "অনুদান নিশ্চিত করুন",
      donationAlert: "ভগবানের অশেষ কৃপা! আপনার অনুদানের তথ্যটি রেকর্ড করা হয়েছে এবং টিম কর্তৃক যাচাইকরণের জন্য অপেক্ষমান রয়েছে।",
    },
  }[lang];

  // Call API for dynamic real-time validation of Member QR status
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyId.trim()) return;

    setIsVerifying(true);
    setVerifyError("");
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/verify-member/${verifyId.trim()}`);
      const data = await res.json();
      if (res.ok && data.verified) {
        setVerifyResult(data);
      } else {
        setVerifyError(data.message || "Invalid database identity stamp. Contact CMS admin.");
      }
    } catch {
      setVerifyError("Gateway error checking verification repository.");
    } finally {
      setIsVerifying(false);
    }
  };

  // self-declared temple payment submissions
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !amount) return;

    try {
      const res = await fetch("/api/add-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName,
          amount,
          purpose,
          paymentMethod,
          mobileNumber,
          transactionId,
          isAdminCreated: false,
        }),
      });

      if (res.ok) {
        setDonationSuccess(true);
        setDonorName("");
        setAmount("");
        setMobileNumber("");
        setTransactionId("");
        setTimeout(() => setDonationSuccess(false), 8000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVolunteerRegSubmit = async (eventId: string) => {
    const memId = memberSession?.memberId || volunteerMemberId;
    if (!memId.trim()) {
      setVolunteerMsg({ id: eventId, text: lang === "en" ? "Verified Member ID is required." : "সদস্য আইডি প্রদান করা আবশ্যক।", error: true });
      return;
    }

    try {
      await onVolunteerRegister(eventId, memId.trim());
      setVolunteerMsg({
        id: eventId,
        text: lang === "en" ? "Success! You are enrolled for volunteer seva." : "অভিনন্দন! আপনি সেবা কাজের জন্য নিবন্ধিত হয়েছেন।",
        error: false,
      });
      setTimeout(() => setVolunteerMsg(null), 5000);
    } catch (err: any) {
      setVolunteerMsg({ id: eventId, text: err.message || "Enrollment failed.", error: true });
    }
  };

  const primaryColor = settings.themePrimary || "#E05A10";
  const masterNavy = settings.themeSecondary || "#800000";
  const goldAccent = settings.themeGold || "#D4AF37";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sub Header Portal Navigation Section */}
      <nav className="bg-white border-b border-gray-100 py-3 shadow-sm px-6 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 md:gap-3 flex-wrap">
          {(["home", "notices", "events", "contribute", "verify", "login"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
                activeTab === tab
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: activeTab === tab ? primaryColor : "transparent",
              }}
            >
              {t[`nav${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof typeof t]}
            </button>
          ))}
        </div>

        {/* Action button controls */}
        <div className="flex gap-2.5">
          <button
            onClick={onApplyClick}
            className="px-4.5 py-2 hover:opacity-90 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            {t.applyBtn}
          </button>
          {memberSession ? (
            <button
              onClick={onLoginClick}
              className="px-4.5 py-2 hover:opacity-90 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all border cursor-pointer"
              style={{ backgroundColor: masterNavy, borderColor: goldAccent }}
            >
              {t.dashboardBtn}
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("login")}
              className="px-4.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer animate-pulse"
            >
              🔑 {t.loginBtn}
            </button>
          )}
        </div>
      </nav>

      <div 
        className="flex-1 p-6 md:p-10 transition-all duration-300" 
        style={
          settings.bgImageUrl 
            ? { 
                backgroundImage: `linear-gradient(rgba(252, 249, 245, 0.93), rgba(252, 249, 245, 0.93)), url(${settings.bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              } 
            : { backgroundColor: "#fcf9f5" }
        }
      >
        {/* TAB 1: PORTAL HOME */}
        {activeTab === "home" && (
          <div className="space-y-12">
            {/* Carousel Temple Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden h-[340px] md:h-[450px] shadow-2xl flex items-center">
              <img
                src={settings.bannerUrl || "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80"}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="relative max-w-3xl px-8 md:px-14 text-white space-y-4">
                <span
                  className="px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm"
                  style={{ color: goldAccent, borderColor: goldAccent }}
                >
                  {settings.shortName} DHARMA FEDERATION
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
                  {t.heroTitle}
                </h2>
                <p className="text-sm md:text-lg opacity-90 font-serif italic max-w-2xl">
                  " {t.heroSubtitle} "
                </p>
                <div className="pt-4 flex gap-4">
                  <button
                    onClick={onApplyClick}
                    className="px-6 py-3 bg-[#E05A10] text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-600 shadow-lg cursor-pointer transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {lang === "en" ? "Apply For Holy ID Card" : "ডিজিটাল আইডি কার্ডের আবেদন"}
                  </button>
                </div>
              </div>
            </div>

            {/* Saffron statistics meter bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.totalMembers}</p>
                  <h3 className="text-3xl font-black text-gray-800 mt-1">{approvedCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  👥
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{lang === "en" ? "Pending Approval" : "পেন্ডিং আবেদন"}</p>
                  <h3 className="text-3xl font-black mt-1" style={{ color: primaryColor }}>{pendingCount}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl" style={{ color: primaryColor }}>
                  ⏳
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{lang === "en" ? "Temples Network" : "নিবন্ধিত মন্দির"}</p>
                  <h3 className="text-3xl font-black text-gray-800 mt-1">12</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-amber-50 text-amber-600">
                  ⛩️
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.visitors}</p>
                  <h3 className="text-3xl font-black text-gray-800 mt-1">{visitorCount}</h3>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl text-green-600">
                  🌐
                </div>
              </div>
            </div>

            {/* Core Info & Temple Leaders layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About Us panel */}
              <div className="lg:col-span-2 space-y-6 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] block rounded mb-1" style={{ color: primaryColor }}>
                    OM NAMO BHAGAVATE VASUDEVAYA
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase">
                    {t.aboutUs}
                  </h3>
                  <div className="w-16 h-[3px] mt-2 rounded" style={{ backgroundColor: goldAccent }}></div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-sans text-justify">
                  {settings.about}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-2xl border border-gray-50" style={{ backgroundColor: `${primaryColor}05` }}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                      🪷 {t.mission}
                    </h4>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {settings.mission}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl border border-gray-50" style={{ backgroundColor: `${masterNavy}05` }}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                      🕉️ {t.vision}
                    </h4>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {settings.vision}
                    </p>
                  </div>
                </div>

                {settings.committeeInfo && (
                  <div className="mt-6 p-6 rounded-2xl border border-gray-100 bg-amber-50/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] space-y-3 transition-all duration-350">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-orange-100/60 pb-3">
                      🔱 {lang === "en" ? "Governing Committee Structure" : "পরিচালনা কমিটির তথ্য"}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line font-sans pl-1">
                      {settings.committeeInfo}
                    </p>
                  </div>
                )}
              </div>

              {/* Leaders Cabinet Panel */}
              <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900 border-l-4 pl-3.5 uppercase tracking-wide" style={{ borderColor: primaryColor }}>
                    {t.leaders}
                  </h3>
                  <div className="divide-y divide-gray-100 mt-6">
                    {/* President */}
                    <div className="py-4 flex gap-3.5 items-center">
                      <div className="w-12 h-12 rounded-full border bg-gray-50 flex items-center justify-center font-bold text-gray-400 overflow-hidden text-lg shrink-0">
                        👨‍🎓
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.president}</span>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">{settings.presidentName}</h4>
                      </div>
                    </div>
                    {/* Secretary */}
                    <div className="py-4 flex gap-3.5 items-center">
                      <div className="w-12 h-12 rounded-full border bg-gray-50 flex items-center justify-center font-bold text-gray-400 overflow-hidden text-lg shrink-0">
                        👨‍🏫
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.secretary}</span>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">{settings.secretaryName}</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct info list */}
                <div className="pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-3">
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block mb-1">{t.address}</span>
                    <p className="leading-relaxed">{settings.address}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block mb-1">{t.contacts}</span>
                    <p className="leading-relaxed font-mono">{settings.contactPhone}</p>
                    <p className="leading-relaxed font-mono text-[10px] text-gray-400">{settings.contactEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTICE BOARD */}
        {activeTab === "notices" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t.noticesHeading}</h3>
              <p className="text-xs text-gray-500 mt-2">{lang === "en" ? "Authentic official briefings authorized by centralized administrators." : "কেন্দ্রীয় প্রশাসন দ্বারা অনুমোদিত ও প্রকাশিত বিজ্ঞপ্তি সমূহ।"}</p>
            </div>

            <div className="space-y-6">
              {notices.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl text-gray-400 text-sm">
                  🔕 {lang === "en" ? "No notices have been published yet." : "কোন বিজ্ঞপ্তি পাওয়া যায়নি।"}
                </div>
              ) : (
                notices.map((n) => (
                  <div key={n.id} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: primaryColor }}></div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg text-white" style={{ backgroundColor: masterNavy }}>
                        {n.category || "GENERAL"}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">{n.date}</span>
                    </div>
                    <h4 className="text-md font-extrabold text-gray-900 mt-3 flex items-center gap-1.5 select-all">
                      📢 {n.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-4 leading-relaxed whitespace-pre-line text-justify font-sans select-all">
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SACRED FESTIVALS */}
        {activeTab === "events" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{t.eventsHeading}</h3>
              <p className="text-xs text-gray-500 mt-2">{lang === "en" ? "Register as volunteer and gain spiritual blessings by performing seva (physical services)." : "আজই স্বেচ্ছাসেবক হিসেবে আমাদের সেবামূলক কাজে অংশ নিন ও পুণ্য অর্জন করুন।"}</p>
            </div>

            <div className="space-y-6 animate-fadeIn">
              {events.length === 0 ? (
                <div className="text-center py-16 bg-white border rounded-3xl text-gray-400 text-sm">
                  📅 {lang === "en" ? "No upcoming events scheduled." : "কোন আসন্ন উৎসবের সূচী পাওয়া যায়নি।"}
                </div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between transition-all hover:shadow-md">
                    <div className="space-y-3 flex-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white ${e.status === "upcoming" ? "bg-green-600" : "bg-gray-400"}`}>
                          {e.status}
                        </span>
                        <span className="text-xs text-gray-400 font-mono font-bold">📍 {e.location}</span>
                      </div>
                      <h4 className="text-md font-black text-gray-900">{e.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed text-justify">{e.description}</p>

                      <div className="flex gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2">
                        <span>📅 {lang === "en" ? "Date:" : "তারিখ:"} <b className="text-gray-800 font-mono">{e.date}</b></span>
                        <span>🤝 {lang === "en" ? "Enrolled Volunteers:" : "নিবন্ধিত স্বেচ্ছাসেবক:"} <b className="text-gray-800 font-mono">{e.volunteers?.length || 0}</b></span>
                      </div>
                    </div>

                    {/* Volunteer quick action panel */}
                    <div className="shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 max-w-sm justify-items-end">
                      {e.volunteerRegistrationActive && e.status === "upcoming" ? (
                        <div className="space-y-2 text-right">
                          {!memberSession && (
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 block tracking-wider uppercase mb-1">Enter Member ID to register</label>
                              <input
                                type="text"
                                placeholder="e.g. SKSSF-2026-0001"
                                className="px-3 py-1.5 text-xs border rounded-lg w-40 font-mono focus:border-[#E05A10] outline-none"
                                value={volunteerMemberId}
                                onChange={(e) => setVolunteerMemberId(e.target.value)}
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleVolunteerRegSubmit(e.id)}
                            className="px-4.5 py-2.5 text-white hover:opacity-90 font-bold uppercase rounded-xl text-[10px] tracking-wider cursor-pointer shadow-sm w-full block text-center"
                            style={{ backgroundColor: primaryColor }}
                          >
                            🤝 {lang === "en" ? "Register Self Seva" : "স্বেচ্ছাসেবী নাম লিখান"}
                          </button>
                          {volunteerMsg && volunteerMsg.id === e.id && (
                            <p className={`text-[9px] font-bold text-center mt-1.5 ${volunteerMsg.error ? "text-red-500" : "text-green-600"}`}>
                              {volunteerMsg.text}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[10px] font-bold uppercase select-none p-3 bg-gray-50 rounded-xl block text-center">
                          🔒 Seva Registration Closed
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLE CONTRIBUTIONS (bKash Wallet simulation) */}
        {activeTab === "contribute" && (
          <div className="max-w-xl mx-auto space-y-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
            <div className="text-center space-y-2">
              <span className="text-3xl">🪙</span>
              <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">{t.contributeHeading}</h3>
              <p className="text-xs text-gray-500 leading-normal">{lang === "en" ? "Complete your Bkash/Nagad wallet transfers manually and log your transaction TrxID here." : "বিকাশ বা নগদ ট্রানজেকশন সফল করার পর ট্রানজেকশন আইডিটি এন্ট্রি করুন।"}</p>
            </div>

            {/* Simulated bKash instructions banner */}
            <div className="bg-amber-50 border border-amber-200/50 p-4.5 rounded-2xl text-xs space-y-1 text-amber-900 leading-normal">
              <p className="font-extrabold text-amber-950">💰 Bkash/Nagad Send Money Instructions:</p>
              <p>1. Open your dynamic mobile financial wallet app.</p>
              <p>2. Complete 'Send Money' or 'Cash In' of any devotional amount to: <b className="font-mono text-amber-950">{settings.contactPhone}</b>.</p>
              <p>3. Capture your generated 10-char alphanumeric Transaction ID.</p>
            </div>

            {donationSuccess ? (
              <div className="bg-green-50 border border-green-200 p-6 rounded-3xl text-center text-green-800 space-y-2">
                <span className="text-2xl">🙏</span>
                <p className="text-xs font-bold leading-relaxed">{t.donationAlert}</p>
              </div>
            ) : (
              <form onSubmit={handleDonationSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.donorLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sajon Dey"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none focus:border-[#E05A10]"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.donorAmount} *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      className="w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none focus:border-[#E05A10]"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.donorPurpose}</label>
                    <select
                      className="w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none focus:border-[#E05A10]"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      <option value="Temple Renovation">Temple Development</option>
                      <option value="Janmashtami Prasad">Janmashtami Feast</option>
                      <option value="Gita Path Srimad Fund">Vedic Book Fund</option>
                      <option value="General Volunteer Relief">Disaster Response Seva</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.paymentWallet}</label>
                    <select
                      className="w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none focus:border-[#E05A10]"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="bKash Wallet">bKash Mobile Wallet</option>
                      <option value="Nagad Wallet">Nagad Corporate System</option>
                      <option value="Direct IBAN Bank">IBAN Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Your Mobile Wallet Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712345678"
                      className="w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none focus:border-[#E05A10]"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t.trnxId} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK9X3J1K8L"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono tracking-widest outline-none focus:border-[#E05A10]"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 hover:opacity-90 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-lg ml-auto cursor-pointer block text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t.submitDonation} 🙏
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: PUBLIC VERIFY */}
        {activeTab === "verify" && (
          <div className="max-w-xl mx-auto space-y-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
            <div className="text-center space-y-2">
              <span className="text-3xl">🪪</span>
              <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">{t.verifyHeading}</h3>
              <p className="text-xs text-gray-500 mt-2">{lang === "en" ? "Enter the alphanumeric verified Member ID printed on the PVC Card to confirm security registry status." : "সদস্য পরিচয় যাচাই করতে আইডি নাম্বারটি নিচের ফর্মে প্রদান করে সার্চ করুন।"}</p>
            </div>

            <form onSubmit={handleVerify} className="flex gap-2.5">
              <input
                type="text"
                required
                className="flex-1 px-4 py-3 border rounded-xl text-xs font-mono uppercase tracking-widest outline-none focus:border-[#E05A10]"
                placeholder={t.verifyPlaceholder}
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-3 hover:opacity-90 text-white font-extrabold rounded-xl text-xs uppercase tracking-wide cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                {isVerifying ? "..." : t.verifyBtn}
              </button>
            </form>

            {verifyError && (
              <p className="text-xs font-bold text-center text-red-600 bg-red-50 p-3.5 border border-red-200 rounded-2xl">
                ❌ {verifyError}
              </p>
            )}

            {verifyResult && (
              <div className="bg-amber-50/50 border border-amber-200/50 p-6 rounded-3xl space-y-4 animate-fadeIn">
                <div className="flex border-b border-amber-200/30 pb-4 items-center gap-4">
                  <div className="w-14 h-18 bg-gray-100 rounded border overflow-hidden shrink-0">
                    {verifyResult.photoUrl ? (
                      <img src={verifyResult.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] bg-[#E05A10] text-white px-2 py-0.5 rounded-full font-bold uppercase inline-block">
                      {verifyResult.status}
                    </span>
                    <h4 className="text-md font-extrabold text-gray-900 mt-1">{verifyResult.fullName}</h4>
                    <p className="text-xs text-gray-500">{verifyResult.fullNameBangla}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                  <div>
                    <span className="text-gray-400 font-bold block text-[9px] uppercase">Member Identifier</span>
                    <span className="font-mono font-bold text-gray-800">{verifyResult.memberId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Official Role</span>
                    <span className="font-bold text-gray-800">{verifyResult.designation}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Blood Group</span>
                    <span className="font-extrabold text-red-600">{verifyResult.bloodGroup || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-bold">Authorized Start Date</span>
                    <span className="font-bold font-mono text-gray-800">{verifyResult.joinedDate}</span>
                  </div>
                </div>

                <p className="text-[10px] border-t border-amber-200/30 pt-3 text-center font-bold text-green-700 tracking-wide uppercase select-none">
                  ✔ Checked & Verified against {settings.orgName} central database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: EMBEDDED DUAL LOGIN OPTIONS */}
        {activeTab === "login" && (
          <div className="max-w-md mx-auto space-y-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-xl animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-4xl block">🔑</span>
              <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">
                {lang === "en" ? "Secure Portal Entrance" : "নিরাপদ লগইন পোর্টাল"}
              </h3>
              <p className="text-xs text-gray-500 leading-normal">
                {lang === "en"
                  ? "Access your personal cabinet workspace or centralized administrative command console."
                  : "আপনার ব্যক্তিগত ক্যাবিনেট বা কেন্দ্রীয় প্রশাসনিক নিয়ন্ত্রণ কক্ষে প্রবেশ করুন।"}
              </p>
            </div>

            {/* Embedded role toggle */}
            <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setLocalLoginRole("member");
                  setLocalLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  localLoginRole === "member" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                {lang === "en" ? "Member Login" : "সদস্য লগইন"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalLoginRole("admin");
                  setLocalLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  localLoginRole === "admin" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                {lang === "en" ? "Superadmin" : "সুপারএডমিন"}
              </button>
            </div>

            {localLoginError && (
              <p className="text-xs font-bold text-center text-red-655 bg-red-50 p-3 border border-red-200 rounded-xl">
                ❌ {localLoginError}
              </p>
            )}

            {memberSession && localLoginRole === "member" ? (
              <div className="text-center space-y-4 py-4 bg-green-50/50 border border-green-200/50 p-5 rounded-2xl">
                <p className="text-xs text-green-800 font-bold">
                  {lang === "en" 
                    ? `Active Session Detected: ${memberSession.fullName}` 
                    : `আপনি ইতিপূর্বে লগইন করেছেন: ${memberSession.fullName}`}
                </p>
                <button
                  type="button"
                  onClick={onLoginClick} // This redirects to cabinet view state in App
                  className="px-5 py-2.5 text-white text-[11px] font-bold uppercase tracking-wide rounded-xl shadow-sm block mx-auto hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {lang === "en" ? "Enter Cabinet Room" : "আমার ক্যাবিনেটে প্রবেশ"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleLocalLoginSubmit} className="space-y-4">
                {localLoginRole === "member" ? (
                  <>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                        {lang === "en" ? "Generated Account Username" : "জেনারেটকৃত ইউজারনেম"} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. sajondey"
                        className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none focus:border-[#E05A10]"
                        value={localUsername}
                        onChange={(e) => setLocalUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                        {lang === "en" ? "Assigned Password" : "নির্ধারিত পাসওয়ার্ড"} *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="e.g. 5x2p9r"
                        className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none focus:border-[#E05A10]"
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#800000] block mb-1">
                      {lang === "en" ? "Administrative Secret Key" : "প্রশাসনিক সিক্রেট কী"} *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder={lang === "en" ? "Enter Administrative Secret" : "সিক্রেট কী লিখুন"}
                      className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none focus:border-[#E05A10] font-mono tracking-widest"
                      value={localPassword}
                      onChange={(e) => setLocalPassword(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={localIsLoggingIn}
                  className="w-full py-3 hover:opacity-90 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg ml-auto cursor-pointer block text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {localIsLoggingIn 
                    ? "..." 
                    : (lang === "en" ? "Authorize & Unlock 🔑" : "অনুমোদন ও প্রবেশ 🔑")}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
