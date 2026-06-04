import React, { useState, useEffect } from "react";
import { Notice, Event, OrgSettings, Application, Member, Donation, CustomPage, AdminLog } from "./types.ts";
import { PublicPortal } from "./components/PublicPortal.tsx";
import { RegistrationForm } from "./components/RegistrationForm.tsx";
import { MemberCabinet } from "./components/MemberCabinet.tsx";
import { AdminPanel } from "./components/AdminPanel.tsx";

export default function App() {
  // Global View Layout routers
  const [panelWrapper, setPanelWrapper] = useState<"public" | "register" | "cabinet" | "admin">("public");
  
  // Custom states
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Database synchronizations states
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [visitorCount, setVisitorCount] = useState<number>(108);

  // Authentication session roles
  const [adminToken, setAdminToken] = useState<string>(localStorage.getItem("cms_admin_token") || "");
  const [memberSession, setMemberSession] = useState<{ memberId: string; fullName: string; token: string } | null>(
    JSON.parse(localStorage.getItem("cms_member_session") || "null")
  );

  // Global Multi-role Login Overlay inputs
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "member">("member");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Synchronize entire directory counts from server API
  const syncRepository = async () => {
    try {
      const res = await fetch("/api/public-info");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || null);
        setNotices(data.notices || []);
        setEvents(data.events || []);
        setVisitorCount(data.visitorCount || 108);
        setCustomPages(data.customPages || data.customPagesList || []);

        // Calculate count ratios
        const appCounts = data.approvedCount || 0;
        // If logged in, grab secure data
        if (adminToken) {
          await syncAdminProtectedData();
        }
      }
    } catch (err) {
      console.error("Filing sync failed:", err);
    }
  };

  const syncAdminProtectedData = async () => {
    try {
      const res = await fetch("/api/admin/system-data", {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setMembers(data.members || []);
        setDonations(data.donations || []);
        setLogs(data.logs || []);
        setCustomPages(data.customPages || data.customPagesList || []);
      } else if (res.status === 401) {
        handleAdminLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    syncRepository();
    // Re-verify counter on mount
    fetch("/api/visitor-tick");
  }, []);

  useEffect(() => {
    if (adminToken) {
      syncAdminProtectedData();
    }
  }, [adminToken]);

  // Dynamically synchronize favicon elements and tab metadata attributes with latest settings
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

  // Handle Multi-role Logins
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const endpoint = loginRole === "admin" ? "/api/admin/login" : "/api/member/login";
      const payload = loginRole === "admin" 
        ? { secret: passwordInput } 
        : { username: usernameInput.trim(), password: passwordInput };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (loginRole === "admin") {
          localStorage.setItem("cms_admin_token", data.token);
          setAdminToken(data.token);
          setPanelWrapper("admin");
        } else {
          const mSession = { memberId: data.memberId, fullName: data.fullName, token: data.token };
          localStorage.setItem("cms_member_session", JSON.stringify(mSession));
          setMemberSession(mSession);
          setPanelWrapper("cabinet");
        }
        setShowLoginModal(false);
        setUsernameInput("");
        setPasswordInput("");
      } else {
        setLoginError(data.message || "Invalid credentials.");
      }
    } catch {
      setLoginError("Gateway communication error.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDirectLogin = async (role: "admin" | "member", user: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const endpoint = role === "admin" ? "/api/admin/login" : "/api/member/login";
      const payload = role === "admin" 
        ? { secret: pass } 
        : { username: user.trim(), password: pass };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (role === "admin") {
          localStorage.setItem("cms_admin_token", data.token);
          setAdminToken(data.token);
          setPanelWrapper("admin");
        } else {
          const mSession = { memberId: data.memberId, fullName: data.fullName, token: data.token };
          localStorage.setItem("cms_member_session", JSON.stringify(mSession));
          setMemberSession(mSession);
          setPanelWrapper("cabinet");
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials." };
      }
    } catch {
      return { success: false, message: "Gateway communication error." };
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("cms_admin_token");
    setAdminToken("");
    if (panelWrapper === "admin") {
      setPanelWrapper("public");
    }
  };

  const handleMemberLogout = () => {
    localStorage.removeItem("cms_member_session");
    setMemberSession(null);
    if (panelWrapper === "cabinet") {
      setPanelWrapper("public");
    }
  };

  // Submit new application to API node
  const handleRecruitmentSubmit = async (appData: any) => {
    try {
      const res = await fetch("/api/apply-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData)
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === "en" 
          ? `Application registered successfully!\nKeep your Form ID safe for verification checks: ${data.id}` 
          : `আবেদন সফলভাবে গৃহীত হয়েছে!\nআপনার ফরম আইডিটি সংগ্রহ করুন: ${data.id}`);
        setPanelWrapper("public");
        await syncRepository();
      } else {
        alert("Filing Error: " + data.message);
      }
    } catch {
      alert("Relational Database error registering membership.");
    }
  };

  // Actions authorized by Super admin
  const triggerApproveApplication = async (appId: string, designation: string) => {
    const res = await fetch("/api/admin/approve-application", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationId: appId, designation })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerRejectApplication = async (appId: string, reason: string) => {
    const res = await fetch("/api/admin/reject-application", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationId: appId, reason })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerBulkApprovals = async (appIds: string[]) => {
    const res = await fetch("/api/admin/bulk-approve", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ applicationIds: appIds })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerDeleteApplication = async (appId: string) => {
    const res = await fetch(`/api/admin/delete-application/${appId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerToggleMemberStatus = async (memberId: string, status: "active" | "suspended") => {
    const res = await fetch("/api/admin/toggle-member", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ memberId, status })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerUpdateBrandingSettings = async (updatedSettings: Partial<OrgSettings>) => {
    const res = await fetch("/api/admin/update-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify(updatedSettings)
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerResetAllData = async () => {
    const res = await fetch("/api/admin/reset-data", {
      method: "POST",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerAddNotice = async (title: string, content: string, category: string) => {
    const res = await fetch("/api/admin/add-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ title, content, category })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerDeleteNotice = async (id: string) => {
    const res = await fetch(`/api/admin/delete-notice/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerAddEvent = async (title: string, description: string, date: string, location: string, volunteerActive: boolean) => {
    const res = await fetch("/api/admin/add-event", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ title, description, date, location, volunteerRegistrationActive: volunteerActive })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerDeleteEvent = async (id: string) => {
    const res = await fetch(`/api/admin/delete-event/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerApproveDonation = async (id: string) => {
    const res = await fetch(`/api/admin/approve-donation/${id}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerAddDonationDirect = async (name: string, amount: number, purpose: string, method: string, mobile: string, trnx: string) => {
    const res = await fetch("/api/add-donation", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ donorName: name, amount, purpose, paymentMethod: method, mobileNumber: mobile, transactionId: trnx, isAdminCreated: true })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerAddCustomPage = async (slug: string, title: string, html: string, css: string, js: string) => {
    const res = await fetch("/api/admin/add-custom-page", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ slug, title, html, css, js })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerChangeAdminPassword = async (oldPasswordText: string, newPasswordText: string) => {
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({ oldPassword: oldPasswordText, newPassword: newPasswordText })
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  // Actions authorized by individual member cabinet session
  const triggerMemberUpdateProfile = async (updatedFields: Partial<Application>) => {
    if (!memberSession) return;
    const res = await fetch("/api/member/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${memberSession.token}` },
      body: JSON.stringify(updatedFields)
    });
    if (!res.ok) throw new Error((await res.json()).message);
  };

  const triggerVolunteerEnrollment = async (eventId: string, mId: string) => {
    const res = await fetch("/api/volunteer/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, memberId: mId })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    await syncRepository();
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f5] space-y-4">
        <span className="text-4xl animate-spin">🕉️</span>
        <p className="text-xs uppercase font-extrabold text-gray-400 tracking-widest">Constructing Vedic Sanctuary Core CMS...</p>
      </div>
    );
  }

  // Active theme setups
  const pageThemePrimary = settings.themePrimary || "#E05A10";
  const approvedMembersCount = members.filter(m => m.status === 'active').length || applications.filter(a => a.status === 'approved').length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-950" : "bg-[#faf8f5]"}`}>
      
      {/* Dynamic top bar header */}
      <header className="bg-white border-b border-gray-100 py-4.5 px-6 md:px-10 flex flex-wrap items-center justify-between gap-4 shadow-sm z-30 select-none">
        
        {/* Dynamic Logo aligned header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPanelWrapper("public")}>
          <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-orange-50 shrink-0">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🕉️</span>
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none">
              {settings.orgName}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{settings.shortName} CMS PORTAL</p>
          </div>
        </div>

        {/* System layout view filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPanelWrapper("public")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              panelWrapper === "public" ? "bg-gray-100 text-gray-900 shadow-inner" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            🕊️ Web Portal
          </button>
          <button
            onClick={() => setPanelWrapper("register")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              panelWrapper === "register" ? "bg-gray-100 text-gray-900 shadow-inner" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            📝 Register
          </button>
          
          {memberSession ? (
            <button
              onClick={() => setPanelWrapper("cabinet")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                panelWrapper === "cabinet" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              🚪 Cabinet Room
            </button>
          ) : (
            <button
              onClick={() => {
                setLoginRole("member");
                setShowLoginModal(true);
              }}
              className="px-3.5 py-1.5 text-gray-400 hover:text-gray-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              🚪 My Cabinet
            </button>
          )}

          {adminToken ? (
            <button
              onClick={() => setPanelWrapper("admin")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                panelWrapper === "admin" ? "bg-gray-100 text-gray-900" : "text-[#E05A10] font-black hover:opacity-80"
              }`}
            >
              🚩 Admin Terminal
            </button>
          ) : (
            <button
              onClick={() => {
                setLoginRole("admin");
                setShowLoginModal(true);
              }}
              className="px-3.5 py-1.5 text-gray-400 hover:text-gray-700 text-xs font-bold uppercase tracking-wider cursor-pointer font-extrabold"
            >
              🚩 Control
            </button>
          )}

          {/* Utility selectors */}
          <div className="flex gap-1.5 border-l pl-3 border-gray-200">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="w-10 h-8 hover:bg-gray-50 text-xs font-bold font-sans rounded-lg border border-gray-150 cursor-pointer"
            >
              {lang === "en" ? "বাংলা" : "ENG"}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 hover:bg-gray-50 text-xs rounded-lg border border-gray-150 cursor-pointer"
            >
              {darkMode ? "☀️" : "🌙"}
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
            approvedCount={approvedMembersCount}
            pendingCount={pendingAppsCount}
            lang={lang}
            onApplyClick={() => setPanelWrapper("register")}
            onLoginClick={() => {
              if (memberSession) {
                setPanelWrapper("cabinet");
              } else {
                setLoginRole("member");
                setShowLoginModal(true);
              }
            }}
            onVolunteerRegister={triggerVolunteerEnrollment}
            memberSession={memberSession}
            onEmbedLogin={handleDirectLogin}
          />
        )}

        {panelWrapper === "register" && (
          <div className="py-12 px-4 md:px-0">
            <RegistrationForm
              lang={lang}
              onSubmit={handleRecruitmentSubmit}
            />
          </div>
        )}

        {panelWrapper === "cabinet" && memberSession && (
          <div className="py-10 px-4 md:px-0">
            {/* Locate actual member application profile files */}
            {applications.length > 0 ? (
              <MemberCabinet
                member={
                  members.find((m) => m.memberId === memberSession.memberId) || {
                    memberId: memberSession.memberId,
                    applicationId: "",
                    username: "",
                    passwordText: "",
                    designation: "Member",
                    joinedDate: "2026-06-01",
                    status: "active",
                  }
                }
                application={
                  applications.find((a) => a.id === members.find((m) => m.memberId === memberSession.memberId)?.applicationId) ||
                  applications[0]
                }
                settings={settings}
                events={events}
                lang={lang}
                onLogout={handleMemberLogout}
                onUpdateProfile={triggerMemberUpdateProfile}
                onVolunteerRegister={triggerVolunteerEnrollment}
              />
            ) : (
              <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl max-w-4xl mx-auto shadow-sm">
                <span className="text-3xl animate-bounce">⏳</span>
                <p className="text-xs uppercase font-extrabold tracking-widest text-[#E05A10] mt-3">Re-verify filing documents...</p>
                <p className="text-xs text-gray-500 mt-1">Please log into your superadmin panel first or refresh so the client re-hydrates protected assets.</p>
                <button onClick={handleMemberLogout} className="px-5 py-2 mt-4 bg-gray-100 rounded-xl text-xs uppercase font-bold tracking-wider">
                  Force Reset Session
                </button>
              </div>
            )}
          </div>
        )}

        {panelWrapper === "admin" && (
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
            onBulkApprove={triggerBulkApprovals}
            onDeleteApplication={triggerDeleteApplication}
            onToggleMemberStatus={triggerToggleMemberStatus}
            onUpdateSettings={triggerUpdateBrandingSettings}
            onResetAllData={triggerResetAllData}
            onAddNotice={triggerAddNotice}
            onDeleteNotice={triggerDeleteNotice}
            onAddEvent={triggerAddEvent}
            onDeleteEvent={triggerDeleteEvent}
            onApproveDonation={triggerApproveDonation}
            onAddDonationDirect={triggerAddDonationDirect}
            onAddCustomPage={triggerAddCustomPage}
            onChangeAdminPassword={triggerChangeAdminPassword}
          />
        )}
      </main>

      {/* MULTI_ROLE LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border shadow-2xl relative animate-fadeIn">
            
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-extrabold text-sm"
            >
              ✕
            </button>

            {/* Login Selection tab header */}
            <div className="text-center mb-6">
              <span className="text-3xl block">🔑</span>
              <h3 className="text-lg font-black uppercase text-gray-800 tracking-wide mt-2">Portal Security Vault</h3>
              
              <div className="flex gap-1 bg-gray-100 p-1.5 rounded-xl mt-4">
                <button
                  onClick={() => {
                    setLoginRole("member");
                    setLoginError("");
                  }}
                  className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    loginRole === "member" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                  }`}
                >
                  Member Login
                </button>
                <button
                  onClick={() => {
                    setLoginRole("admin");
                    setLoginError("");
                  }}
                  className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    loginRole === "admin" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                  }`}
                >
                  Superadmin Access
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-[10px] font-bold text-center text-red-650 bg-red-50 p-2 rounded-xl mb-4 border border-red-200">
                ❌ {loginError}
              </p>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginRole === "member" ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Generated Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sajondey"
                      className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Assigned Account Password</label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 5x2p9r"
                      className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Super Administrative Secret Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter super secret"
                    className="w-full text-xs px-3.5 py-2.5 border rounded-xl outline-none font-mono"
                    value={passwordInput} // mapped internally as secret
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 hover:opacity-90 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md"
                style={{ backgroundColor: pageThemePrimary }}
              >
                {isLoggingIn ? "..." : "Unlock Vault"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER COOPERATIVE PANEL */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-[10px] text-gray-400 uppercase tracking-widest select-none mt-auto">
        <p>{settings.footerText || `© 2026 ${settings.orgName}. All Sacred Rights Reserved.`}</p>
        <p className="mt-1 text-gray-300 font-bold">Consolidated by Sri Sanatana Relational CMS Infrastructure Engine</p>
      </footer>
    </div>
  );
}
