import React, { useState, useEffect } from "react";
import { Notice, Event, OrgSettings } from "../types.ts";
import { Search, Award, Calendar, ShieldCheck, Megaphone, Heart, MapPin, Globe, CheckCircle2, ChevronRight, FileText, QrCode } from "lucide-react";

interface PublicPortalProps {
  settings: OrgSettings;
  notices: Notice[];
  events: Event[];
  visitorCount: number;
  approvedCount: number; // mapped from certificates.length
  pendingCount: number;
  lang: "en" | "bn";
  onApplyClick: () => void;
  onLoginClick: () => void;
  onVolunteerRegister: (eventId: string, memberId: string) => Promise<void>;
  memberSession: any;
  onEmbedLogin?: (role: "admin" | "member", user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  settings,
  notices,
  events,
  visitorCount,
  approvedCount,
  lang,
  onApplyClick,
  onLoginClick,
  onVolunteerRegister,
  memberSession,
  onEmbedLogin,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "notices" | "events" | "contribute" | "verify">("home");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Donation Form States
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("ক্রীড়া ফান্ড");
  const [paymentMethod, setPaymentMethod] = useState("bKash Wallet");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get("verify") || params.get("cert") || params.get("id");
    if (qrParam) {
      setActiveTab("verify");
      setVerifyId(qrParam);
      runVerification(qrParam);
    }
  }, []);

  const runVerification = async (code: string) => {
    if (!code.trim()) return;
    setIsVerifying(true);
    setVerifyError("");
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/verify-certificate/${code.trim()}`);
      const data = await res.json();
      if (res.ok && data.verified) {
        setVerifyResult(data);
      } else {
        setVerifyError(data.message || "সার্টিফিকেট তথ্য পাওয়া যায়নি। অনুগ্রহ করে ইউনিক আইডি বা কিউআর কোড সঠিক কিনা চেক করুন।");
      }
    } catch {
      setVerifyError("সার্ভার যাচাইকরণ পোর্টালে সংযোগ করা যাচ্ছে না।");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runVerification(verifyId);
  };

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

  const t = {
    en: {
      navHome: "Home Portal",
      navNotices: "Notice Board",
      navEvents: "Events Calendar",
      navContribute: "Donation Desks",
      navVerify: "Verify Certificate",
      heroTitle: settings.orgName,
      heroSubtitle: settings.slogan,
      aboutUs: "About Ganaraj",
      address: "Headquarters Address",
      contacts: "Communications Window",
      visitors: "Portal Visitors",
      totalCerts: "Verified Certificates",
      noticesHeading: "Announcement Circulars",
      eventsHeading: "Events and Festivals Portfolio",
      contributeHeading: "Social Service Donation Gateway",
      verifyHeading: "Digital Certificate Authenticator",
      verifyPlaceholder: "Enter Certificate Unique ID (e.g. CERT-1001 or GR-XXXX)",
      verifyBtn: "Verify Online",
      donorLabel: "Donor Name",
      donorAmount: "Donation Amount (BDT)",
      donorPurpose: "Purpose",
      paymentWallet: "Payment Method",
      trnxId: "Transaction TrxID",
      submitDonation: "Submit Donation Details",
      donationAlert: "Thank you! Your donation request is recorded and waiting for administrator verification.",
    },
    bn: {
      navHome: "মূল পাতা",
      navNotices: "বিজ্ঞপ্তি সমূহ",
      navEvents: "সকল ইভেন্ট",
      navContribute: "অনুদান ও সহায়তা",
      navVerify: "সনদপত্র যাচাইকরণ",
      heroTitle: settings.orgName,
      heroSubtitle: settings.slogan,
      aboutUs: "সংঘ পরিচিতি",
      address: "সংঘের ঠিকানা",
      contacts: "যোগাযোগ ডেস্ক",
      visitors: "মোট ভিজিটর",
      totalCerts: "সত্যতা যাচাইকৃত সনদসমূহ",
      noticesHeading: "অফিসিয়াল নোটিশ বোর্ড",
      eventsHeading: "গণরাজ একতা সংঘ ইভেন্ট গ্যালারি",
      contributeHeading: "সমাজসেবামূলক কাজে অনুদান ও সহায়তা",
      verifyHeading: "ডিজিটাল কিউআর সনদপত্র সত্যতা যাচাইকরণ",
      verifyPlaceholder: "সার্টিফিকেটের আইডি নাম্বার বা ইউনিক কিউআর কোড দিন (উদা: CERT-1001)",
      verifyBtn: "সনদপত্র যাচাই করুন",
      donorLabel: "দানকারীর নাম",
      donorAmount: "অনুদানের পরিমাণ (টাকা)",
      donorPurpose: "অনুদানের খাত",
      paymentWallet: "পেমেন্টের মাধ্যম",
      trnxId: "ট্রানজেকশন আইডি (TrxID)",
      submitDonation: "অনুদান জমা দিন",
      donationAlert: "ধন্যবাদ! আপনার অনুদানের তথ্যটি সংরক্ষিত হয়েছে এবং আমাদের টিম কর্তৃক যাচাইয়ের জন্য অপেক্ষমান তালিকায় দেয়া হয়েছে।",
    },
  }[lang];

  const primaryColor = settings.themePrimary || "#E05A10";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Sub-navigation Bar */}
      <nav className="bg-white border-b border-gray-100 py-3 shadow-xs px-6 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2.5 flex-wrap">
          {(["home", "notices", "events", "verify", "contribute"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "verify") {
                  setVerifyResult(null);
                  setVerifyError("");
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: activeTab === tab ? primaryColor : "transparent",
              }}
            >
              {tab === "home" && "🏠 "}
              {tab === "notices" && "📢 "}
              {tab === "events" && "🗓️ "}
              {tab === "verify" && "🎖️ "}
              {tab === "contribute" && "🤝 "}
              {t[`nav${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof typeof t]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onApplyClick}
            style={{
              backgroundColor: "#ffb100",
              textAlign: "right",
              fontStyle: "normal",
              fontWeight: "bold",
              textDecorationLine: "none",
              fontFamily: "monospace",
              height: "32.5px",
              borderStyle: "groove",
              color: "#3b00ff",
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all text-[11px] shadow-md shadow-emerald-750/10"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {lang === "en" ? "Apply Membership" : "সদস্যপদ আবেদন"}
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 bg-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            {lang === "en" ? "Verify Certificate" : "সার্টিফিকেট ভেরিফাই"}
          </button>
        </div>
      </nav>

      {/* Main Container Content */}
      <div 
        className="flex-1 p-4 md:p-10 transition-all duration-300 animate-fadeIn" 
        style={
          settings.bgImageUrl 
            ? { 
                backgroundImage: `linear-gradient(rgba(252, 249, 245, 0.94), rgba(252, 249, 245, 0.94)), url(${settings.bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              } 
            : { backgroundColor: "#fcf9f5" }
        }
      >
        {/* TAB 1: HOME */}
        {activeTab === "home" && (
          <div className="space-y-10 max-w-7xl mx-auto">
            {/* Elegant Hero Slider Card */}
            <div className="relative rounded-3xl overflow-hidden h-[360px] md:h-[480px] shadow-lg flex items-center">
              <img
                src={settings.bannerUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80"}
                alt="Banner Hero"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              <div className="relative max-w-3xl px-6 md:px-14 text-white space-y-4">
                <span
                  className="px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm inline-block"
                  style={{ color: settings.themeGold || "#D4AF37", borderColor: settings.themeGold || "#D4AF37" }}
                >
                  {settings.shortName} OFFICIAL PORTAL
                </span>
                <h2 className="text-3.5xl md:text-5.5xl font-black tracking-tight leading-none uppercase">
                  {t.heroTitle}
                </h2>
                <p className="text-sm md:text-lg opacity-90 font-serif italic max-w-2xl">
                  " {t.heroSubtitle} "
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <button
                    onClick={onApplyClick}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-emerald-700/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === "en" ? "Apply for Membership" : "সদস্যপদ আবেদন ফরম"}
                  </button>
                  <button
                    onClick={() => setActiveTab("verify")}
                    className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 shadow-lg cursor-pointer transition-all flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Award className="w-4 h-4" />
                    {lang === "en" ? "Verify Award Certificate" : "ডিজিটাল সনদপত্র যাচাই করুন"}
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    {lang === "en" ? "Explore Events" : "ইভেন্ট সমূহ দেখুন"}
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Dashboard Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.totalCerts}</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{approvedCount || 0}</h3>
                </div>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl bg-orange-50 text-orange-600">
                  🎖️
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === "en" ? "Total Events" : "মোট ইভেন্ট সংখ্যা"}</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{events.length}</h3>
                </div>
                <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center text-xl text-teal-600">
                  🗓️
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{lang === "en" ? "Completed Events" : "সম্পন্ন ইভেন্ট"}</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{events.filter(e => e.status === "completed").length}</h3>
                </div>
                <div className="w-11 h-11 bg-blue-50 bg-opacity-70 rounded-lg flex items-center justify-center text-xl text-blue-600">
                  ✅
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.visitors}</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{visitorCount}</h3>
                </div>
                <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center text-xl text-purple-600">
                  🌐
                </div>
              </div>
            </div>

            {/* About us & Leadership Committee */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6 bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] block rounded mb-1" style={{ color: primaryColor }}>
                    GANARAJ EKTA SANGHA
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase">
                    {t.aboutUs}
                  </h3>
                  <div className="w-16 h-[3px] mt-2 rounded" style={{ backgroundColor: primaryColor }}></div>
                </div>
                <p className="text-xs md:text-sm text-gray-650 leading-relaxed font-sans text-justify">
                  {settings.about}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl border border-blue-50/50 bg-blue-50/20">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      🎖️ {lang === "en" ? "Our Mission" : "আমাদের লক্ষ্য"}
                    </h4>
                    <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                      {settings.mission}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-50/55 bg-amber-50/20">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      ⚡ {lang === "en" ? "Our Vision" : "ভবিষ্যত রূপরেখা"}
                    </h4>
                    <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                      {settings.vision}
                    </p>
                  </div>
                </div>

                {settings.committeeInfo && (
                  <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2 mt-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-850 flex items-center gap-2 border-b border-gray-100 pb-2">
                       💼 {lang === "en" ? "Managing Council Information" : "সংঘের কার্যনির্বাহী পরিষদ ও কমিটি গঠন"}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line font-sans pl-1">
                      {settings.committeeInfo}
                    </p>
                  </div>
                )}
              </div>

              {/* Contacts and details card */}
              <div className="space-y-6 bg-white border border-gray-100 p-8 rounded-3xl shadow-xs flex flex-col">
                <div>
                  <h3 className="text-md font-black text-gray-900 border-l-4 pl-3.5 uppercase tracking-wide" style={{ borderColor: primaryColor }}>
                    {lang === "en" ? "Address & Contacts" : "ঠিকানা ও যোগাযোগ ডেস্ক"}
                  </h3>
                </div>

                <div className="text-xs text-gray-600 space-y-4 pt-2">
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9.5px] block mb-1">{t.address}</span>
                    <p className="leading-relaxed text-gray-700">{settings.address}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9.5px] block mb-1">{t.contacts}</span>
                    <p className="leading-relaxed font-mono font-bold text-gray-800">{settings.contactPhone}</p>
                    <p className="leading-relaxed font-mono text-[10.5px] text-gray-400">{settings.contactEmail}</p>
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
              <h3 className="text-2.5xl font-black text-gray-950 uppercase tracking-tight flex items-center justify-center gap-2">
                <Megaphone className="w-7 h-7 text-orange-500" />
                {t.noticesHeading}
              </h3>
              <p className="text-xs text-gray-500 mt-2">{lang === "en" ? "Official updates, notifications, and directives from the committee." : "সংঘের কার্যাবলি ও নির্দেশাবলী সংক্রান্ত সর্বশেষ নির্ভরযোগ্য নোটিশ সমূহ।"}</p>
            </div>

            <div className="space-y-6">
              {notices.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl text-gray-400 text-sm">
                  🔕 {lang === "en" ? "No notification bulletins posted." : "কোন নোটিশ পাওয়া যায়নি।"}
                </div>
              ) : (
                notices.map((n) => (
                  <div key={n.id} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-xs relative overflow-hidden transition-all hover:shadow-xs">
                    <div className="absolute top-0 left-0 w-2.5 h-full" style={{ backgroundColor: primaryColor }}></div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-lg text-white" style={{ backgroundColor: primaryColor }}>
                        {n.category || "GENERAL"}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">{n.date}</span>
                    </div>
                    <h4 className="text-[15px] font-black text-gray-900 mt-3 select-all">
                      📢 {n.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-3.5 leading-relaxed whitespace-pre-line text-justify font-sans select-all border-t border-gray-50 pt-3">
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES AND EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center">
              <h3 className="text-2.5xl font-black text-gray-900 uppercase tracking-tight">{t.eventsHeading}</h3>
              <p className="text-xs text-gray-500 mt-2">{lang === "en" ? "Check out completed and upcoming events managed by the association." : "গণরাজ একতা সংঘ কর্তৃক সুচারুরূপে পরিচালিত অতীতের ও সামনের সকল সেবামূলক কার্যক্রমের তালিকা।"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white border rounded-3xl text-gray-400 text-sm">
                  📅 {lang === "en" ? "No events are recorded." : "কোনো ইভেন্টের তথ্য পাওয়া যায়নি।"}
                </div>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-md">
                    <div>
                      {/* Image header context */}
                      <div className="h-44 w-full relative">
                        <img 
                          src={e.bannerUrl || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=cropw=700&q=80"}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-800 flex items-center gap-1 border">
                          <span className={`w-1.5 h-1.5 rounded-full ${e.status === "completed" ? "bg-blue-500" : "bg-green-500"}`}></span>
                          {e.status === "completed" ? (lang === "en" ? "Completed" : "সম্পন্ন") : (lang === "en" ? "Upcoming" : "আসন্ন")}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white font-mono px-3 py-1 rounded-md text-[10px] font-bold">
                          {e.category || "General"}
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h4 className="text-md font-black text-gray-900 leading-tight">{e.title}</h4>
                        <p className="text-xs text-gray-550 leading-relaxed text-justify line-clamp-3">{e.description}</p>
                        
                        {e.organizerName && (
                          <div className="text-[10.5px] text-gray-400 pt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {lang === "en" ? "Organized by:" : "আয়োজক:"} <b className="text-gray-600">{e.organizerName}</b>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-50 flex items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">📅 {lang === "en" ? "Date" : "তারিখ"}</p>
                        <p className="text-xs font-mono font-extrabold text-gray-800">{e.date}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">📍 {lang === "en" ? "Venue / Route" : "স্থান / গন্তব্য"}</p>
                        <p className="text-xs font-bold text-gray-800 max-w-[150px] truncate">{e.location}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VERIFY CERTIFICATE (PRIMARY SPEC) */}
        {activeTab === "verify" && (
          <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-4.5xl inline-block bg-orange-50 border border-orange-100 p-3 rounded-full text-orange-600">🎖️</span>
              <h3 className="text-2.5xl font-black text-gray-900 uppercase tracking-tight">{t.verifyHeading}</h3>
              <p className="text-xs text-gray-550 max-w-md mx-auto">{lang === "en" ? "Verify the digital merit credential or volunteer appreciation plaque against Ganaraj database registry." : "গণরাজ একতা সংঘের অফিসিয়াল ইভেন্টে অংশগ্রহণমূলক ও স্বেচ্ছাসেবী ডিজিটাল সার্টিফিকেট এর সত্যতা যাচাই করুন।"}</p>
            </div>

            <form onSubmit={handleVerifySubmit} className="max-w-xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-xs font-mono uppercase tracking-widest outline-none focus:border-orange-500 bg-white"
                  placeholder={t.verifyPlaceholder}
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-3 hover:opacity-95 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                {isVerifying ? "যাচাই হচ্ছে..." : t.verifyBtn}
              </button>
            </form>

            {verifyError && (
              <div className="max-w-xl mx-auto bg-red-50 border border-red-200/50 p-4.5 rounded-2xl text-center">
                <p className="text-xs font-bold text-red-600">❌ {verifyError}</p>
              </div>
            )}

            {/* Display High Fidelity Print-Ready Certificate Card Mockup! */}
            {verifyResult && (
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Official verified badge details card */}
                <div className="bg-emerald-50 border border-emerald-150 p-4.5 rounded-2xl flex items-center gap-3 shadow-xs">
                  <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0 animate-bounce" />
                  <div>
                    <h5 className="text-emerald-950 text-xs font-black uppercase tracking-wide">
                      {lang === "en" ? "Certificate Verified Successfully" : "ডিজিটাল সার্টিফিকেটের সত্যতা নিশ্চিতকরণ"}
                    </h5>
                    <p className="text-[11px] text-emerald-800 mt-0.5 font-sans leading-relaxed">
                      {lang === "en" 
                        ? `Valid award logged under Central Ledger. Serial ID: ${verifyResult.id} (UUID: ${verifyResult.uuid})` 
                        : `এই সার্টিফিকেটটি গণরাজ একতা সংঘের কেন্দ্রীয় রেজিস্টার ডাটাবেজে যথাযথভাবে নথিভুক্ত এবং বৈধ। সিরিয়াল আইডি: ${verifyResult.id}`}
                    </p>
                  </div>
                </div>

                {/* Decorative Virtual Frame of the Printable A4 Certificate */}
                <div className="border-[8px] border-amber-950/20 bg-[#fdfaf5] p-6 md:p-14 rounded-3xl relative overflow-hidden shadow-2xl space-y-6 select-all font-serif">
                  
                  {/* Filigree corner accents */}
                  <div className="absolute top-4 left-4 text-orange-900 opacity-20 text-3xl">🔱</div>
                  <div className="absolute top-4 right-4 text-orange-900 opacity-20 text-3xl">🔱</div>
                  <div className="absolute bottom-4 left-4 text-orange-900 opacity-20 text-3xl">🔱</div>
                  <div className="absolute bottom-4 right-4 text-orange-900 opacity-20 text-3xl">🔱</div>

                  {/* Watermark in center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[120px]">🎖️</span>
                  </div>

                  {/* Header Branded Section */}
                  <div className="text-center space-y-2 relative">
                    <div className="w-12 h-12 bg-orange-50 border border-orange-100 flex items-center justify-center rounded-full mx-auto select-none">
                      <Award className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-2.5xl md:text-3xl font-black text-orange-950 tracking-tight leading-none uppercase font-sans">
                      {verifyResult.orgName}
                    </h3>
                    <p className="text-xs text-orange-900 italic font-medium leading-none font-sans">
                      " {verifyResult.slogan} "
                    </p>
                    <div className="w-36 h-[2.5px] bg-orange-900/30 mx-auto mt-3"></div>
                  </div>

                  <div className="text-center pt-4 space-y-4 relative">
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-900 font-sans px-3.5 py-1.5 bg-amber-50 rounded-xl border border-amber-200 inline-block">
                      {verifyResult.titleText || "সনদপত্র"}
                    </span>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest leading-none font-sans">
                      {verifyResult.subtitleText || "সফলতার স্বীকৃতিস্বরূপ"}
                    </h4>
                  </div>

                  {/* Main certificate narrative body */}
                  <div className="max-w-2xl mx-auto text-center py-4 relative">
                    <p className="text-xs text-gray-400 capitalize italic mb-3 font-sans">প্রদান করা যাচ্ছে যে,</p>
                    <h3 className="text-xl md:text-2.5xl font-black text-gray-900 underline decoration-amber-600 underline-offset-8 decoration-2 mb-4">
                      {verifyResult.recipientName}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 leading-loose max-w-xl mx-auto font-sans leading-relaxed">
                      {verifyResult.mainBodyText || `যিনি অত্যন্ত দক্ষতার সাথে "${verifyResult.eventTitle}" নামক সামাজিক কল্যাণমূলক এবং ধর্মীয় উৎসবে অংশগ্রহণ করেছেন। উনার এই অবদানের স্বীকৃতিস্বরূপ এই প্রশংসাপত্র প্রদানপূর্বক সম্মানিত করা হলো।`}
                    </p>
                  </div>

                  {/* Footer Seal, sign block & QR code verification */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-150/40 relative">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">{lang === "en" ? "Issued on" : "প্রদানের তারিখ"}</div>
                      <div className="font-sans text-xs font-extrabold text-gray-800">{verifyResult.issueDate}</div>
                    </div>
                    
                    {/* Generative dynamic QR Code */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-16 h-16 border p-1 rounded-lg bg-white select-none">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "?verify=" + verifyResult.id)}`}
                          alt="Verification QR"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[7.5px] font-mono tracking-widest text-[#E05A10] uppercase pt-1">QR CODE VERIFIED</span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">{lang === "en" ? "Authorized Signature" : "অনুমোদিত স্বাক্ষর ও সিল"}</div>
                      <div className="font-sans text-xs font-extrabold text-gray-800 text-center border-t border-dashed border-gray-300 px-4 pt-1.5 mt-1">
                        {verifyResult.signatureText || "সভাপতি"}
                        <p className="text-[9px] text-gray-400 font-normal leading-relaxed">{verifyResult.sealText || "গণরাজ একতা সংঘ"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic print layout guide indicator */}
                  <div className="border border-dashed border-gray-200/60 rounded-xl p-2 bg-gray-50/50 text-center text-[9px] text-gray-400 leading-none">
                    🖨️ For premium print, save on landscape mode and choose A4 template scale of 90%.
                  </div>
                </div>

                <div className="flex justify-center gap-3 select-none">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-[#4a0e0e] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {lang === "en" ? "Print Certificate" : "সার্টিফিকেট প্রিন্ট করুন"}
                  </button>
                  <button
                    onClick={() => {
                      setVerifyResult(null);
                      setVerifyId("");
                    }}
                    className="px-5 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-750 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    {lang === "en" ? "Verify Another" : "আরেকটি যাচাই করুন"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TEMPLE CONTRIBUTIONS (Donation Gateway) */}
        {activeTab === "contribute" && (
          <div className="max-w-xl mx-auto space-y-6 bg-white border border-gray-100 p-8 rounded-3xl shadow-lg">
            <div className="text-center space-y-2">
              <span className="text-[34px] block animate-bounce">🪙</span>
              <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight">{t.contributeHeading}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{lang === "en" ? "Complete your mobile money transfer and submit information below for auditing and verification." : "সংঘের সেবামূলক তহবিল পরিচালনায় নিম্নোক্ত মোবাইল ওয়ালেটে দান পাঠিয়ে নিচে ট্রানজেকশন তথ্য এন্ট্রি করুন।"}</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs space-y-1 text-orange-950 font-sans leading-relaxed">
              <p className="font-extrabold text-orange-950"> bKash Send Money instructions:</p>
              <p>১. আপনার ব্যক্তিগত বিকাশ ও নগদ বা মোবাইল ওয়ালেট অ্যাপে যান।</p>
              <p>২. "Send Money" অপশনে গিয়ে সংঘের নির্দিষ্ট নাম্বারে দান প্রেরণ করুন:  <b className="font-mono text-orange-950">{settings.contactPhone}</b>।</p>
              <p>৩. প্রেরণের পর প্রাপ্ত ১০ অঙ্কের ট্রানজেকশন আইডিটি নিচে জমা দিন।</p>
            </div>

            {donationSuccess ? (
              <div className="bg-emerald-50 border border-emerald-150 p-6 rounded-2xl text-center text-emerald-950 space-y-2 animate-fadeIn">
                <span className="text-2xl block">🙏</span>
                <p className="text-xs font-bold leading-normal">{t.donationAlert}</p>
              </div>
            ) : (
              <form onSubmit={handleDonationSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t.donorLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: সজন কুন্ডু"
                    className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t.donorAmount} *</label>
                    <input
                      type="number"
                      required
                      placeholder="উদা: ৫০০০"
                      className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t.donorPurpose}</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      <option value="ক্রীড়া ও ক্রীড়া উপকরণ">ক্রীড়া ও সাংস্কৃতিক ফান্ড</option>
                      <option value="সমাজসেবা ও শীতবস্ত্র ত্রাণ"> শীতবস্ত্র ও ত্রাণ ফান্ড</option>
                      <option value="সংঘ কার্যালয় উন্নয়ন">সংঘ কার্যালয় উন্নয়ন</option>
                      <option value="সাধারণ তহবিল">সাধারণ অনুদান তহবিল</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t.paymentWallet}</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="bKash Wallet">বিকাশ মোবাইল ওয়ালেট</option>
                      <option value="Nagad Wallet">নগদ মোবাইল ওয়ালেট</option>
                      <option value="Direct IBAN Bank">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{lang === "en" ? "Sender Mobile Number" : "দানকারী মোবাইল নম্বর"} *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01700000000"
                      className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs outline-none focus:border-orange-500 bg-white"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{t.trnxId} *</label>
                  <input
                    type="text"
                    required
                    placeholder="BK9X3J1K8L"
                    className="w-full px-3.5 py-2.5 border border-gray-150 rounded-xl text-xs font-mono tracking-widest uppercase outline-none focus:border-orange-500 bg-white"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 hover:opacity-95 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md cursor-pointer block text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t.submitDonation} 🙏
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
