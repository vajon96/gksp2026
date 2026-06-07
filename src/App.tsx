import React, { useState, useEffect } from "react";
import { Notice, Event, OrgSettings, Donation, CustomPage, AdminLog, Certificate, Application, Member } from "./types.ts";
import { PublicPortal } from "./components/PublicPortal.tsx";
import { AdminPanel } from "./components/AdminPanel.tsx";
import { RegistrationForm } from "./components/RegistrationForm.tsx";
import { MemberCabinet } from "./components/MemberCabinet.tsx";
import { Award, Lock, ShieldCheck, RefreshCw, LogOut } from "lucide-react";

const DEFAULT_SETTINGS: OrgSettings = {
  orgName: "গণরাজ একতা সংঘ",
  shortName: "গণরাজ",
  slogan: "২৬শে আমাদের প্রথম প্রয়াস",
  about: "গণরাজ একতা সংঘ সামাজিক উন্নয়ন, যুব কল্যাণ, এবং সৌহার্দ্যপূর্ণ সমাজ গঠনে নিবেদিত একটি স্বেচ্ছাসেবী সংগঠন। ২৬শে ডিসেম্বর থেকে শুরু হওয়া আমাদের প্রথম প্রয়াসের মাধ্যমে আমরা তরুণ সমাজকে প্রশিক্ষিত, সচেতন এবং মানবিক কার্যক্রমে সম্পৃক্ত করতে কাজ করে যাচ্ছি।",
  mission: "তরুণদের সৃজনশীল এবং দায়িত্বশীল নাগরিক হিসেবে গড়ে তোলা, আর্তমানবতার সেবায় এগিয়ে আসা এবং ঐক্যবদ্ধ সমাজ গঠন করা।",
  vision: "একটি দক্ষ, সচেতন এবং মানবিক মূল্যবোধসম্পন্ন যুবসমাজ গঠন যারা উন্নত সমাজ বিনির্মাণে নেতৃত্ব দেবে।",
  presidentName: "সভাপতি (গণরাজ একতা সংঘ)",
  presidentPhotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  vicePresidentName: "সহ-সভাপতি (গণরাজ একতা সংঘ)",
  vicePresidentPhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  secretaryName: "সাধারণ সম্পাদক (গণরাজ একতা সংঘ)",
  address: "ঢাকা, বাংলাদেশ",
  contactPhone: "+8801700000000",
  contactEmail: "contact@ganaraj-ekta.org",
  themePrimary: "#2563EB", 
  themeSecondary: "#1E3A8A", 
  themeGold: "#D4AF37", 
  footerText: "© 2026 গণরাজ একতা সংঘ। সর্বস্বত্ব সংরক্ষিত।",
  bannerUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80", 
  logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80", 
  socialFacebook: "https://facebook.com/ganaraj.ekta",
  socialTwitter: "https://twitter.com/ganaraj_ekta",
  socialYoutube: "https://youtube.com/c/ganaraj_ekta"
};

export default function App() {
  const [panelWrapper, setPanelWrapper] = useState<"public" | "admin" | "apply" | "member-cabinet">("public");
  
  const [lang, setLang] = useState<"en" | "bn">("bn");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Database synchronization states
  const [settings, setSettings] = useState<OrgSettings | null>(DEFAULT_SETTINGS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [visitorCount, setVisitorCount] = useState<number>(108);

  const [adminToken, setAdminToken] = useState<string>(localStorage.getItem("cms_admin_token") || "");
  const [memberToken, setMemberToken] = useState<string>(localStorage.getItem("cms_member_token") || "");
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

  // Login Modal options
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "member">("member");
  const [passwordInput, setPasswordInput] = useState(""); // used for admin PIN
  const [usernameInput, setUsernameInput] = useState(""); // used for member ID/username
  const [memberPasswordInput, setMemberPasswordInput] = useState(""); // used for member pass
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const syncRepository = async () => {
    try {
      const res = await fetch("/api/public-info");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || null);
        setNotices(data.notices || []);
        setEvents(data.events || []);
        setVisitorCount(data.visitorCount || 108);
        
        // sync certificates count safely
        if (adminToken) {
          await syncAdminProtectedData();
        }
      }
    } catch (err) {
      console.error("Public sync failed:", err);
    }
  };

  const syncAdminProtectedData = async () => {
    try {
      const res = await fetch("/api/admin/system-data", {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
        setLogs(data.logs || []);
        setCertificates(data.certificates || []);
        setApplications(data.applications || []);
        setMembers(data.members || []);
        setCustomPages(data.customPages || []);
      } else if (res.status === 401) {
        handleAdminLogout();
      }
    } catch (err) {
      console.error("Admin sync failed:", err);
    }
  };

  const syncMemberProfileData = async (tokenVal: string) => {
    try {
      const res = await fetch("/api/member/profile", {
        headers: { "Authorization": `Bearer ${tokenVal}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveMember(data.member || null);
        setActiveApplication(data.application || null);
      } else {
        handleMemberLogout();
      }
    } catch (err) {
      console.error("Member profile fetch failed:", err);
    }
  };

  useEffect(() => {
    syncRepository();
    // increase visitor tick
    fetch("/api/visitor-tick").then(() => {}).catch(() => {});
  }, []);

  useEffect(() => {
    if (adminToken) {
      syncAdminProtectedData();
    }
  }, [adminToken]);

  useEffect(() => {
    if (memberToken) {
      syncMemberProfileData(memberToken);
    } else {
      setActiveMember(null);
      setActiveApplication(null);
    }
  }, [memberToken]);

  useEffect(() => {
    if (settings) {
      if (settings.orgName) {
        document.title = settings.orgName + (settings.slogan ? ` - ${settings.slogan}` : "");
      }
      if (settings.faviconUrl) {
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = settings.faviconUrl;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = settings.faviconUrl;
          document.head.appendChild(newLink);
        }
      }
    }
  }, [settings]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      if (loginRole === "admin") {
        if (!passwordInput) {
          setLoginError("পিন কোড প্রদান করুন");
          setIsLoggingIn(false);
          return;
        }
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: passwordInput })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("cms_admin_token", data.token);
          setAdminToken(data.token);
          setPanelWrapper("admin");
          setShowLoginModal(false);
          setPasswordInput("");
        } else {
          setLoginError(data.message || "ভুল পিন কোড প্রদান করা হয়েছে।");
        }
      } else {
        if (!usernameInput || !memberPasswordInput) {
          setLoginError("ইউজারনেম এবং পাসওয়ার্ড উভয়ই প্রদান করুন।");
          setIsLoggingIn(false);
          return;
        }
        const res = await fetch("/api/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameInput, password: memberPasswordInput })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("cms_member_token", data.token);
          setMemberToken(data.token);
          setPanelWrapper("member-cabinet");
          setShowLoginModal(false);
          setUsernameInput("");
          setMemberPasswordInput("");
        } else {
          setLoginError(data.message || "ভুল ইউজারনেম অথবা পাসওয়ার্ড।");
        }
      }
    } catch {
      setLoginError("সার্ভার সংযোগী ত্রুটি।");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("cms_admin_token");
    setAdminToken("");
    setPanelWrapper("public");
  };

  const handleMemberLogout = () => {
    localStorage.removeItem("cms_member_token");
    setMemberToken("");
    setPanelWrapper("public");
    setActiveMember(null);
    setActiveApplication(null);
  };

  const triggerUpdateBrandingSettings = async (updatedSettings: Partial<OrgSettings>) => {
    const res = await fetch("/api/admin/update-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(updatedSettings)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerResetAllData = async () => {
    const res = await fetch("/api/admin/reset-data", {
      method: "POST",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
    await syncAdminProtectedData();
  };

  const triggerAddNotice = async (title: string, content: string, category: string) => {
    const res = await fetch("/api/admin/add-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ title, content, category })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerDeleteNotice = async (id: string) => {
    const res = await fetch(`/api/admin/delete-notice/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerUpdateNotice = async (id: string, title: string, content: string, category: string, isPinned: boolean) => {
    const res = await fetch("/api/admin/update-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ id, title, content, category, isPinned })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerTogglePinNotice = async (id: string, isPinned: boolean) => {
    const res = await fetch("/api/admin/toggle-pin-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ id, isPinned })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerAddEvent = async (eventObj: any) => {
    const res = await fetch("/api/admin/add-event", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(eventObj)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerUpdateEvent = async (eventObj: any) => {
    const res = await fetch("/api/admin/update-event", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(eventObj)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerDeleteEvent = async (id: string) => {
    const res = await fetch(`/api/admin/delete-event/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  const triggerApproveDonation = async (id: string) => {
    const res = await fetch(`/api/admin/approve-donation/${id}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerAddDonationDirect = async (name: string, amount: number, purpose: string, method: string, mobile: string, trnx: string) => {
    const res = await fetch("/api/add-donation", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ donorName: name, amount, purpose, paymentMethod: method, mobileNumber: mobile, transactionId: trnx, isAdminCreated: true })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerChangeAdminPassword = async (oldPasswordText: string, newPasswordText: string) => {
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ oldPassword: oldPasswordText, newPassword: newPasswordText })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  // Certificate API Handlers
  const triggerAddCertificate = async (cert: Partial<Certificate>) => {
    const res = await fetch("/api/admin/add-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(cert)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerBulkAddCertificates = async (list: Partial<Certificate>[]) => {
    const res = await fetch("/api/admin/bulk-add-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ certificates: list })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerUpdateCertificate = async (cert: Partial<Certificate>) => {
    const res = await fetch("/api/admin/update-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(cert)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerDeleteCertificate = async (id: string) => {
    const res = await fetch(`/api/admin/delete-certificate/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  // Application and Custom Page API Handlers
  const triggerApproveApplication = async (appId: string, designation: string) => {
    const res = await fetch("/api/admin/approve-application", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationId: appId, designation })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerRejectApplication = async (appId: string, reason: string) => {
    const res = await fetch("/api/admin/reject-application", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationId: appId, reason })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerBulkApprove = async (appIds: string[]) => {
    const res = await fetch("/api/admin/bulk-approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationIds: appIds })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerDeleteApplication = async (id: string) => {
    const res = await fetch(`/api/admin/delete-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerToggleMemberStatus = async (memberId: string, status: string) => {
    const res = await fetch("/api/admin/toggle-member-status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ memberId, status })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerAddCustomPage = async (slug: string, title: string, html: string, css: string, js: string) => {
    const res = await fetch("/api/admin/add-custom-page", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ slug, title, html, css, js })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const triggerDeleteCustomPage = async (id: string) => {
    const res = await fetch(`/api/admin/delete-custom-page/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncAdminProtectedData();
  };

  const handleUpdateMemberProfile = async (fields: Partial<Application>) => {
    if (!memberToken) return;
    const res = await fetch("/api/member/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${memberToken}` },
      body: JSON.stringify(fields)
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncMemberProfileData(memberToken);
    await syncRepository();
  };

  const handleQuickVolunteerRegister = async (eventId: string, memberId: string) => {
    const res = await fetch("/api/volunteer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, memberId })
    });
    if (!res.ok) throw new Error((await res.json()).error || "Registration failed");
    await syncRepository();
    if (memberToken) {
      await syncMemberProfileData(memberToken);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f5] space-y-4">
        <span className="text-4xl animate-spin text-orange-600">🎖️</span>
        <p className="text-xs uppercase font-extrabold text-orange-950 tracking-widest animate-pulse">গণরাজ একতা সংঘ CMS লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-950" : "bg-[#faf8f5]"}`}>
      
      {/* Dynamic top bar header */}
      <header className="bg-white border-b border-gray-100 py-4.5 px-6 md:px-10 flex flex-wrap items-center justify-between gap-4 shadow-xs z-30 select-none">
        
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPanelWrapper("public")}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-orange-100 flex items-center justify-center bg-orange-50 shrink-0">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🎖️</span>
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none">
              {settings.orgName}
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{settings.shortName} MEMBER HUB</p>
          </div>
        </div>

        {/* Navigation toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPanelWrapper("public")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              panelWrapper === "public" ? "bg-orange-50 text-orange-950 shadow-inner" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            🕊️ ওয়েব পোর্টাল (Web Portal)
          </button>
          
          {memberToken && activeMember ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPanelWrapper("member-cabinet")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  panelWrapper === "member-cabinet" ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-100 text-emerald-850 font-black hover:opacity-90"
                }`}
              >
                🚩 মেম্বার ক্যাবিনেট (Cabinet)
              </button>
              <button
                onClick={handleMemberLogout}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-500 hover:text-red-900 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                title={lang === "en" ? "Sign Out" : "লগআউট"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "Exit" : "লগআউট"}</span>
              </button>
            </div>
          ) : adminToken ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPanelWrapper("admin")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  panelWrapper === "admin" ? "bg-orange-650 text-white shadow-xs" : "bg-orange-100 text-orange-700 font-black hover:opacity-90"
                }`}
              >
                🚩 অ্যাডমিন প্যানেল
              </button>
              <button
                onClick={handleAdminLogout}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-150 hover:bg-gray-100 text-gray-500 hover:text-red-650 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                title={lang === "en" ? "Sign Out" : "লগআউট"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "Exit" : "লগআউট"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginRole("member");
                setShowLoginModal(true);
              }}
              className="px-3.5 py-1.5 bg-orange-600 font-extrabold hover:bg-orange-700 text-white text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 transition-all text-[11px] shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {lang === "en" ? "Member / Admin Login" : "লগইন পোর্টাল / প্রবেশ করুন"}
            </button>
          )}

          {/* Language toggler */}
          <div className="flex gap-1 border-l pl-3 border-gray-150">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="px-2.5 py-1.5 hover:bg-gray-50 text-[10px] font-black text-gray-800 rounded-lg border border-gray-150 cursor-pointer"
            >
              {lang === "en" ? "বাংলা" : "ENG"}
            </button>
          </div>
        </div>
      </header>

      {/* Main viewport segment */}
      <main className="flex-1 min-h-[500px]">
        {panelWrapper === "public" && (
          <PublicPortal
            settings={settings}
            notices={notices}
            events={events}
            visitorCount={visitorCount}
            approvedCount={members.length || certificates.length || 7}
            pendingCount={applications.filter(a => a.status === "pending").length}
            lang={lang}
            onApplyClick={() => setPanelWrapper("apply")}
            onLoginClick={() => {
              setLoginRole("member");
              setShowLoginModal(true);
            }}
            onVolunteerRegister={async (eventId, memberId) => {
              await handleQuickVolunteerRegister(eventId, memberId);
            }}
            memberSession={activeMember}
          />
        )}

        {panelWrapper === "apply" && (
          <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-gray-100 shadow-xs select-none">
              <button
                onClick={() => setPanelWrapper("public")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                ← {lang === "en" ? "Return Home" : "হোমে ফিরে যান"}
              </button>
              <h2 className="text-sm font-black uppercase text-gray-800 tracking-wider">
                {lang === "en" ? "Membership Application" : "সদস্যপদ আবেদনপত্র"}
              </h2>
            </div>
            
            <RegistrationForm
              lang={lang}
              onSubmit={async (appData) => {
                try {
                  const res = await fetch("/api/apply-membership", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(appData)
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    alert(`${lang === "en" ? "Application Submitted Successfully!" : "আবেদন সফলভাবে দাখিল করা হয়েছে!"}\n\nApp ID: ${data.applicationId}\n\n${lang === "en" ? "Wait for Admin review." : "দয়া করে এডমিন প্যানেল কর্তৃক পর্যালোচনার জন্য অপেক্ষা করুন।"}`);
                    setPanelWrapper("public");
                    syncRepository();
                  } else {
                    alert(data.message || "Error submitting application.");
                  }
                } catch {
                  alert("Internal Server Error.");
                }
              }}
            />
          </div>
        )}

        {panelWrapper === "member-cabinet" && activeMember && activeApplication && (
          <div className="p-4 md:p-8">
            <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center select-none">
              <button
                onClick={() => setPanelWrapper("public")}
                className="px-4 py-1.5 bg-white border border-gray-150 hover:bg-gray-100 text-gray-750 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                ← {lang === "en" ? "Portal Home" : "পোর্টাল হোম"}
              </button>
              <div className="text-xs text-green-700 font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Secured Member Node
              </div>
            </div>
            <MemberCabinet
              member={activeMember}
              application={activeApplication}
              settings={settings}
              events={events}
              lang={lang}
              onLogout={handleMemberLogout}
              onUpdateProfile={handleUpdateMemberProfile}
              onVolunteerRegister={handleQuickVolunteerRegister}
            />
          </div>
        )}

        {panelWrapper === "admin" && adminToken && (
          <AdminPanel
            settings={settings}
            applications={applications}
            members={members}
            notices={notices}
            events={events}
            donations={donations}
            customPages={customPages}
            logs={logs}
            visitorCount={visitorCount}
            lang={lang}
            token={adminToken}
            onLogout={handleAdminLogout}
            onRefresh={syncRepository}
            onApproveApplication={triggerApproveApplication}
            onRejectApplication={triggerRejectApplication}
            onBulkApprove={triggerBulkApprove}
            onDeleteApplication={triggerDeleteApplication}
            onToggleMemberStatus={triggerToggleMemberStatus}
            onUpdateSettings={triggerUpdateBrandingSettings}
            onResetAllData={triggerResetAllData}
            onAddNotice={triggerAddNotice}
            onUpdateNotice={triggerUpdateNotice}
            onTogglePinNotice={triggerTogglePinNotice}
            onDeleteNotice={triggerDeleteNotice}
            onAddEvent={async (title, desc, d, loc, act) => {
              await triggerAddEvent({ title, description: desc, date: d, location: loc, volunteerRegistrationActive: act, category: "সাধারণ", organizerName: settings.orgName });
            }}
            onDeleteEvent={triggerDeleteEvent}
            onApproveDonation={triggerApproveDonation}
            onAddDonationDirect={triggerAddDonationDirect}
            onAddCustomPage={triggerAddCustomPage}
            onDeleteCustomPage={triggerDeleteCustomPage}
            onChangeAdminPassword={triggerChangeAdminPassword}
            
            // Certificate dynamic properties passed down
            certificates={certificates}
            onAddCertificate={triggerAddCertificate}
            onBulkAddCertificates={triggerBulkAddCertificates}
            onUpdateCertificate={triggerUpdateCertificate}
            onDeleteCertificate={triggerDeleteCertificate}
            onUpdateEventComplex={triggerUpdateEvent}
            onAddEventComplex={triggerAddEvent}
          />
        )}
      </main>

      {/* DUAL LOGIN OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6.5 shadow-2xl border border-gray-100 overflow-hidden relative animate-fadeIn font-sans">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
                setPasswordInput("");
                setUsernameInput("");
                setMemberPasswordInput("");
              }}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-150 text-gray-500 hover:text-gray-900 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center space-y-1 mb-5">
              <span className="text-3xl">🔓</span>
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">গণরাজ একতা সংঘ</h3>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">MEMBERSHIP HUB LOGIN</p>
            </div>

            {/* DUAL ROLE TAB PICKER */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-50 rounded-xl mb-4.5 border border-gray-150 select-none">
              <button
                onClick={() => {
                  setLoginRole("member");
                  setLoginError("");
                }}
                className={`py-2 text-center text-xs font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                  loginRole === "member" ? "bg-white text-orange-750 shadow-xs border border-gray-100" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                👥 মেম্বার
              </button>
              <button
                onClick={() => {
                  setLoginRole("admin");
                  setLoginError("");
                }}
                className={`py-2 text-center text-xs font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer ${
                  loginRole === "admin" ? "bg-white text-orange-750 shadow-xs border border-gray-100" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                🔐 অ্যাডমিন
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginRole === "admin" ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-orange-900">অ্যাডমিন সিক্রেট পিন (Secret Code)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-gray-50 border border-gray-150 focus:border-orange-600 focus:bg-white text-sm font-bold rounded-xl outline-hidden tracking-widest text-orange-950 transition-all font-sans"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-orange-900">{lang === "en" ? "Member Username / ID" : "ইউজারনেম অথবা মেম্বার আইডি"}</label>
                    <input
                      type="text"
                      placeholder="e.g. GR-2026-0001"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-orange-600 focus:bg-white text-xs font-bold rounded-xl outline-hidden transition-all text-gray-800"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-orange-900">{lang === "en" ? "Member Password" : "ব্যক্তিগত পাসওয়ার্ড"}</label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={memberPasswordInput}
                      onChange={(e) => setMemberPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-150 focus:border-orange-600 focus:bg-white text-xs font-bold rounded-xl outline-hidden transition-all text-gray-800"
                    />
                  </div>
                </div>
              )}

              {loginError && (
                <div className="bg-red-50 text-red-750 p-2.5 rounded-lg text-[10px] font-bold border border-red-100 leading-snug">
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-stone-900 hover:bg-stone-950 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 select-none flex items-center justify-center gap-1.5"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-3 animate-spin" />
                    লগইন হচ্ছে...
                  </>
                ) : (
                  "সেশন সাইন-ইন / SignIn"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
