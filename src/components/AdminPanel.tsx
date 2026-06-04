import React, { useState } from "react";
import { Application, Member, OrgSettings, Notice, Event, Donation, CustomPage, AdminLog } from "../types.ts";
import { PVCIDCard } from "./PVCIDCard.tsx";

interface AdminPanelProps {
  settings: OrgSettings;
  applications: Application[];
  members: Member[];
  notices: Notice[];
  events: Event[];
  donations: Donation[];
  customPages: CustomPage[];
  logs: AdminLog[];
  visitorCount: number;
  lang: "en" | "bn";
  token: string;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  onApproveApplication: (appId: string, designation: string) => Promise<void>;
  onRejectApplication: (appId: string, reason: string) => Promise<void>;
  onBulkApprove: (appIds: string[]) => Promise<void>;
  onDeleteApplication: (appId: string) => Promise<void>;
  onToggleMemberStatus: (memberId: string, status: "active" | "suspended") => Promise<void>;
  onUpdateSettings: (settings: Partial<OrgSettings>) => Promise<void>;
  onAddNotice: (title: string, content: string, category: string) => Promise<void>;
  onDeleteNotice: (id: string) => Promise<void>;
  onAddEvent: (title: string, description: string, date: string, location: string, volunteerActive: boolean) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onApproveDonation: (id: string) => Promise<void>;
  onAddDonationDirect: (name: string, amount: number, purpose: string, method: string, mobile: string, trnx: string) => Promise<void>;
  onAddCustomPage: (slug: string, title: string, html: string, css: string, js: string) => Promise<void>;
  onChangeAdminPassword: (oldP: string, newP: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  applications,
  members,
  notices,
  events,
  donations,
  customPages,
  logs,
  visitorCount,
  lang,
  token,
  onLogout,
  onRefresh,
  onApproveApplication,
  onRejectApplication,
  onBulkApprove,
  onDeleteApplication,
  onToggleMemberStatus,
  onUpdateSettings,
  onAddNotice,
  onDeleteNotice,
  onAddEvent,
  onDeleteEvent,
  onApproveDonation,
  onAddDonationDirect,
  onAddCustomPage,
  onChangeAdminPassword,
}) => {
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "applications" | "members" | "cards" | "notices" | "donations" | "custom-pages" | "settings" | "logs">("dashboard");

  // Filter States
  const [appSearch, setAppSearch] = useState("");
  const [appFilterStatus, setAppFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [memberSearch, setMemberSearch] = useState("");

  // Inspect Modal/Panel
  const [inspectApp, setInspectApp] = useState<Application | null>(null);
  const [approveDesignation, setApproveDesignation] = useState("General Member");
  const [rejectionReason, setRejectionReason] = useState("");

  // Checkbox/Bulk Approve States
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Card Template Customize parameters
  const [cardThemePrimary, setCardThemePrimary] = useState(settings.themePrimary);
  const [cardThemeSecondary, setCardThemeSecondary] = useState(settings.themeSecondary);
  const [cardThemeGold, setCardThemeGold] = useState(settings.themeGold);
  const [bulkPrintLimit, setBulkPrintLimit] = useState<number>(10);
  const [showBulkPrintPreview, setShowBulkPrintPreview] = useState(false);

  // New Notice States
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("general");

  // New Event States
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc] = useState("");
  const [eventVolActive, setEventVolActive] = useState(true);

  // New Donation Direct Entry States
  const [directDonorName, setDirectDonorName] = useState("");
  const [directAmount, setDirectAmount] = useState("");
  const [directPurpose, setDirectPurpose] = useState("Temple Renovation");
  const [directMethod, setDirectMethod] = useState("Direct cash");
  const [directMobile, setDirectMobile] = useState("");
  const [directTrnx, setDirectTrnx] = useState("");

  // New Custom HTML states
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");
  const [customPageSuccess, setCustomPageSuccess] = useState("");

  // Settings modification states
  const [orgFormSettings, setOrgFormSettings] = useState({ ...settings });

  // Admin Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Bulk Multi Select checkbox toggler
  const handleSelectApp = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAllPending = () => {
    const pendings = applications.filter((a) => a.status === "pending").map((a) => a.id);
    if (selectedAppIds.length === pendings.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(pendings);
    }
  };

  const triggerBulkApproval = async () => {
    if (selectedAppIds.length === 0) return;
    try {
      await onBulkApprove(selectedAppIds);
      setSelectedAppIds([]);
      await onRefresh();
      alert("Selected applications approved in bulk ledger!");
    } catch (e: any) {
      alert("Error approving bulk selections: " + e.message);
    }
  };

  const triggerBulkCSVExport = () => {
    const listToExport = applications;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["ID", "Status", "Full Name (English)", "Mobile Number", "Email", "Gotra", "Highest Academy", "Occupation"].join(","),
        ...listToExport.map((a) =>
          [
            a.id,
            a.status,
            `"${a.fullNameEnglish}"`,
            a.mobileNumber,
            a.email,
            a.gotra || "",
            `"${a.highestQualification}"`,
            `"${a.occupation}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SKSSF_Applicants_Database_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    try {
      await onAddNotice(noticeTitle, noticeContent, noticeCategory);
      setNoticeTitle("");
      setNoticeContent("");
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    try {
      await onAddEvent(eventTitle, eventDesc, eventDate, eventLoc, eventVolActive);
      setEventTitle("");
      setEventDesc("");
      setEventDate("");
      setEventLoc("");
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerAddDonationDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directDonorName.trim() || !directAmount) return;
    try {
      await onAddDonationDirect(
        directDonorName,
        parseFloat(directAmount),
        directPurpose,
        directMethod,
        directMobile,
        directTrnx || "ADMIN-DIRECT-ENTRY"
      );
      setDirectDonorName("");
      setDirectAmount("");
      setDirectMobile("");
      setDirectTrnx("");
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerPublishCustomPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSlug.trim() || !customTitle.trim() || !customHtml.trim()) {
      alert("URL Slug, Title and HTML body are strictly mandated elements.");
      return;
    }
    try {
      await onAddCustomPage(customSlug, customTitle, customHtml, customCss, customJs);
      setCustomPageSuccess(customSlug);
      setCustomSlug("");
      setCustomTitle("");
      setCustomHtml("");
      setCustomCss("");
      setCustomJs("");
      await onRefresh();
      setTimeout(() => setCustomPageSuccess(""), 12000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(orgFormSettings);
      await onRefresh();
      alert("Organization branding settings updated successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    try {
      await onChangeAdminPassword(oldPassword, newPassword);
      setPasswordMsg("Success! Administrator credentials updated.");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordMsg("Error: " + err.message);
    }
  };

  const triggerApproveAppSingle = async (appId: string) => {
    try {
      await onApproveApplication(appId, approveDesignation);
      setInspectApp(null);
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerRejectAppSingle = async (appId: string) => {
    try {
      await onRejectApplication(appId, rejectionReason);
      setInspectApp(null);
      setRejectionReason("");
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const tFormClass = `w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-[#E05A10] bg-white`;
  const tLabelClass = `text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1`;

  // Calculated variables
  const filteredApps = applications.filter((app) => {
    const matchSearch =
      app.fullNameEnglish.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.mobileNumber.includes(appSearch) ||
      app.id.toLowerCase().includes(appSearch.toLowerCase());
    const matchStatus = appFilterStatus === "all" ? true : app.status === appFilterStatus;
    return matchSearch && matchStatus;
  });

  const filteredMembers = members.filter((m) => {
    const app = applications.find((a) => a.id === m.applicationId);
    const searchVal = memberSearch.toLowerCase();
    return (
      m.memberId.toLowerCase().includes(searchVal) ||
      m.username.toLowerCase().includes(searchVal) ||
      app?.fullNameEnglish.toLowerCase().includes(searchVal) ||
      app?.mobileNumber.includes(searchVal)
    );
  });

  const totalDonationsAmount = donations
    .filter((d) => d.status === "approved")
    .reduce((sum, current) => sum + current.amount, 0);

  const activeThemePrimary = settings.themePrimary || "#E05A10";

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#fcf9f5] font-sans text-gray-800 overflow-hidden select-none">
      {/* Sidebar navigation aligned to the Professional Polish header theme */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#E05A10] uppercase">ADMIN PANEL</span>
            <p className="text-xs font-black text-gray-800">Super Administrator</p>
          </div>
          <button onClick={onLogout} className="text-xs font-bold text-red-600 uppercase tracking-wider hover:underline">
            Exit 🚪
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto space-y-1.5 px-3">
          {(
            [
              { id: "dashboard", label: "📊 Overview", count: 0 },
              { id: "applications", label: "📝 Applications", count: applications.filter((a) => a.status === "pending").length },
              { id: "members", label: "👥 Member List", count: 0 },
              { id: "cards", label: "🪪 ID Cards Studio", count: 0 },
              { id: "notices", label: "📢 Announcements", count: 0 },
              { id: "donations", label: "💰 Donations Ledger", count: 0 },
              { id: "custom-pages", label: "🌐 Sandboxed Pages", count: 0 },
              { id: "settings", label: "⚙️ Setup & Theme", count: 0 },
              { id: "logs", label: "📜 Activity Logs", count: 0 },
            ]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setShowBulkPrintPreview(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeMenu === item.id
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: activeMenu === item.id ? activeThemePrimary : "transparent",
              }}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-extrabold shadow animate-pulse">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
          Vers: 3.1.0-Release • UTC 2026
        </div>
      </aside>

      {/* Primary Dashboard Area */}
      <main className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="flex-1 overflow-y-auto space-y-8 pr-1">
            {/* Top Stat Meters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Total Members</p>
                  <h3 className="text-2xl font-black text-gray-800 mt-1">{members.length}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">👥</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Pending Registries</p>
                  <h3 className="text-2xl font-black text-[#E05A10] mt-1">
                    {applications.filter((a) => a.status === "pending").length}
                  </h3>
                </div>
                <div className="w-10 h-10 bg-orange-50 text-[#E05A10] rounded-xl flex items-center justify-center text-lg">⏳</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Approved Funding BDT</p>
                  <h3 className="text-2xl font-black text-green-600 mt-1">{totalDonationsAmount}</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-lg">৳</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Counter Views</p>
                  <h3 className="text-2xl font-black text-purple-600 mt-1">{visitorCount}</h3>
                </div>
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-lg">👁️</div>
              </div>
            </div>

            {/* Simulated Bento Graphical stats and Audit overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphical Growth Indicator Simulation */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between h-80 shadow-sm">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Quarterly Authorized Membership Progression Metric</h4>
                  <div className="flex gap-4 items-end justify-between h-48 mt-6">
                    {/* Columns representing arbitrary visual charts using the dynamic primary color */}
                    {[
                      { m: "Jan", v: "25%" },
                      { m: "Feb", v: "38%" },
                      { m: "Mar", v: "47%" },
                      { m: "Apr", v: "68%" },
                      { m: "May", v: "85%" },
                      { m: "Jun", v: "100%" },
                    ].map((idx) => (
                      <div key={idx.m} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full rounded-t-lg transition-all hover:opacity-90 relative group origin-bottom" style={{ height: idx.v, backgroundColor: activeThemePrimary }}>
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded px-1.5 py-0.5 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx.v}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{idx.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Console log summary view */}
              <div className="bg-gray-900 rounded-3xl p-5 text-white flex flex-col justify-between h-80 shadow-inner">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Real-Time Admin Access Logs
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-48 text-[10px] font-mono leading-relaxed text-gray-400">
                    {logs.slice(0, 4).map((l) => (
                      <div key={l.id} className="border-b border-white/5 pb-2">
                        <span className="text-white">[{l.timestamp.slice(11, 19)}]</span> {l.action} <span className="text-green-400">({l.ip})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenu("logs")}
                  className="w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-colors"
                >
                  View Full Terminal Audits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS MANAGEMENT */}
        {activeMenu === "applications" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header controls */}
            <div className="bg-white p-4.5 rounded-2xl border border-gray-100 flex flex-wrap justify-between items-center gap-4 mb-4">
              <div className="flex gap-2.5 items-center flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Query applicant name, mobile phone or form code..."
                  className="w-full text-xs px-3.5 py-2 hover:border-[#E05A10]/50 border rounded-xl outline-none"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                      appFilterStatus === st
                        ? "bg-[#E05A10] text-white"
                        : "bg-gray-150 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
                
                {selectedAppIds.length > 0 && (
                  <button
                    onClick={triggerBulkApproval}
                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer animate-pulse"
                  >
                    Bulk Approve ({selectedAppIds.length}) ✔
                  </button>
                )}

                <button
                  onClick={triggerBulkCSVExport}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  CSV Database Dump 📥
                </button>
              </div>
            </div>

            {/* Applications List Grid */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs">
                  No registrar applicant rows match criteria.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 uppercase text-[10px] text-gray-400 font-extrabold sticky top-0 border-b">
                    <tr>
                      <th className="px-5 py-3.5 w-10">
                        <input
                          type="checkbox"
                          className="accent-[#E05A10]"
                          checked={
                            selectedAppIds.length === applications.filter((a) => a.status === "pending").length &&
                            selectedAppIds.length > 0
                          }
                          onChange={handleSelectAllPending}
                        />
                      </th>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5">Applicant Details</th>
                      <th className="px-4 py-3.5">Contact No</th>
                      <th className="px-4 py-3.5">Date Submitted</th>
                      <th className="px-4 py-3.5 text-center">Eligibility State</th>
                      <th className="px-4 py-3.5 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5">
                          {app.status === "pending" && (
                            <input
                              type="checkbox"
                              className="accent-[#E05A10]"
                              checked={selectedAppIds.includes(app.id)}
                              onChange={() => handleSelectApp(app.id)}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-[#800000]">{app.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-2.5 items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center text-xs">
                              {app.photoUrl ? (
                                <img src={app.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                              ) : (
                                "👤"
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 leading-tight uppercase">{app.fullNameEnglish}</p>
                              <p className="text-[10px] text-[var(--theme-primary)] pl-0.5">{app.fullNameBangla}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono">{app.mobileNumber}</td>
                        <td className="px-4 py-3.5 font-mono text-gray-400">{app.createdAt.split("T")[0]}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              app.status === "approved"
                                ? "bg-green-150 text-green-700"
                                : app.status === "rejected"
                                ? "bg-red-100 text-red-650"
                                : "bg-orange-100 text-orange-650 animate-pulse"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setInspectApp(app);
                              setRejectionReason(app.rejectionReason || "");
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-lg uppercase cursor-pointer"
                          >
                            Inspect 👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Inspect Modal Dialog Backdrop */}
            {inspectApp && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">REGISTRATION ENROL FILING</span>
                      <h4 className="text-md font-black text-gray-900 leading-none mt-1">
                        INSPECTING application {inspectApp.id}
                      </h4>
                    </div>
                    <button onClick={() => setInspectApp(null)} className="text-gray-400 hover:text-black font-extrabold text-sm">
                      [Close ✖]
                    </button>
                  </div>

                  {/* Complete data sheets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Personal Details</span>
                      <p><b>Father Name:</b> {inspectApp.fatherName}</p>
                      <p><b>Mother Name:</b> {inspectApp.motherName}</p>
                      <p><b>Date of Birth:</b> {inspectApp.dob}</p>
                      <p><b>Blood Register:</b> {inspectApp.bloodGroup}</p>
                      <p><b>Gotra / Heritage:</b> {inspectApp.gotra || "N/A"}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Career & Academic details</span>
                      <p><b>Academic Degree:</b> {inspectApp.highestQualification}</p>
                      <p><b>Spiritual Temple:</b> {inspectApp.templeName}</p>
                      <p><b>Occupation Workplace:</b> {inspectApp.occupation} ({inspectApp.workplace || "Private"})</p>
                      <p><b>Main Deity Worship Detail:</b> {inspectApp.mainDeityWorship}</p>
                    </div>

                    <div className="md:col-span-2 border-t pt-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Addresses Directory</span>
                      <p><b>Residential Active Present:</b> {inspectApp.presentAddress}</p>
                      <p><b>National Permanent Records:</b> {inspectApp.permanentAddress}</p>
                    </div>

                    {/* Scanned files inspector grid */}
                    <div className="md:col-span-2 border-t pt-4 space-y-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Uploaded Documents Verification Room</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 mb-1">Passport Photograph</p>
                          <div className="h-32 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                            {inspectApp.photoUrl ? (
                              <img src={inspectApp.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                            ) : (
                              "No Image"
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 mb-1">Scanned Signature</p>
                          <div className="h-32 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                            {inspectApp.signatureUrl ? (
                              <img src={inspectApp.signatureUrl} alt="Signature" className="h-[40px] object-contain" />
                            ) : (
                              "No Signature"
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[9px] font-bold text-gray-500 mb-1">NID / Birth Certificate Scans</p>
                          <div className="h-32 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                            {inspectApp.nidScanUrl ? (
                              <img src={inspectApp.nidScanUrl} alt="NID Document" className="h-full w-full object-cover" />
                            ) : (
                              "No Scans"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Cabinet Drawer */}
                  <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
                    {inspectApp.status === "pending" ? (
                      <>
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Authorization Option</span>
                          <div>
                            <label className="text-[9px] font-bold block mb-1 text-gray-450">Select Active Member Designation</label>
                            <select
                              className="w-full border rounded px-3 py-1.5 text-xs outline-none bg-white"
                              value={approveDesignation}
                              onChange={(e) => setApproveDesignation(e.target.value)}
                            >
                              <option value="General Member">General Devotee Seva</option>
                              <option value="Executive Committee Coordinator">Executive Cell Coordinator</option>
                              <option value="Spiritual Youth Advisor">Theology Council Mentor</option>
                            </select>
                          </div>
                          <button
                            onClick={() => triggerApproveAppSingle(inspectApp.id)}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer font-sans"
                          >
                            Approve Registration & Generate ID
                          </button>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Rejection Option</span>
                          <div>
                            <label className="text-[9px] font-bold block mb-1 text-gray-450">Input detailed reason for files rejection</label>
                            <input
                              type="text"
                              placeholder="e.g. Blurred NID scan files copy."
                              className="w-full border rounded px-3 py-1.5 text-xs outline-none bg-white"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                          </div>
                          <button
                            onClick={() => triggerRejectAppSingle(inspectApp.id)}
                            disabled={!rejectionReason.trim()}
                            className="w-full py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 cursor-pointer"
                          >
                            Reject & Fire Rejection Alert
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Registration Action has been finalized as: <b className="uppercase">{inspectApp.status}</b></span>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to permanently delete this application and member account?")) {
                              await onDeleteApplication(inspectApp.id);
                              setInspectApp(null);
                              await onRefresh();
                            }
                          }}
                          className="px-4 py-2 bg-red-100 text-red-650 hover:bg-red-200 text-xs font-bold uppercase rounded-xl"
                        >
                          Delete Ledger Row 🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMBER LIST */}
        {activeMenu === "members" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-100 mb-4">
              <input
                type="text"
                placeholder="Lookup verified member username, UID or phone parameters..."
                className="w-full max-w-md px-3.5 py-2 hover:border-[#E05A10]/50 border rounded-xl text-xs outline-none"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs">
                  No verified members registered.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 uppercase text-[10px] text-gray-400 font-extrabold sticky top-0 border-b">
                    <tr>
                      <th className="px-5 py-3.5">Member Code</th>
                      <th className="px-5 py-3.5">Verified Profile Details</th>
                      <th className="px-5 py-3.5">Assigned Seva Role</th>
                      <th className="px-5 py-3.5">Portal Username</th>
                      <th className="px-5 py-3.5">Active Password</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5 text-right">Security Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.map((m) => {
                      const app = applications.find((a) => a.id === m.applicationId);
                      return (
                        <tr key={m.memberId} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 font-mono font-bold text-gray-800">{m.memberId}</td>
                          <td className="px-5 py-3.5">
                            <div className="font-extrabold uppercase text-gray-900">{app?.fullNameEnglish || "Anonymous"}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{app?.mobileNumber}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-50 text-[9px] font-bold text-[#f27d26] border border-orange-200">
                              {m.designation}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono tracking-tight text-gray-700">{m.username}</td>
                          <td className="px-5 py-3.5 font-mono text-gray-500 bg-gray-50/50 select-all">{m.passwordText}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              m.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-650"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            {m.status === "active" ? (
                              <button
                                onClick={async () => {
                                  await onToggleMemberStatus(m.memberId, "suspended");
                                  await onRefresh();
                                }}
                                className="px-2.5 py-1 text-[9px] font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg uppercase cursor-pointer"
                              >
                                Suspend Account 🔒
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await onToggleMemberStatus(m.memberId, "active");
                                  await onRefresh();
                                }}
                                className="px-2.5 py-1 text-[9px] font-bold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 rounded-lg uppercase cursor-pointer"
                              >
                                Re-Activate ✔
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ID CARDS STUDIO & PRINTING FRAME */}
        {activeMenu === "cards" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {showBulkPrintPreview ? (
              <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="mb-4 bg-white border p-5 rounded-2xl flex justify-between items-center h-20 shrink-0 shadow-sm">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#800000]">Central PVC Card Printing Layout (A4 Format)</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Ready with auto margins, alignment markings, crop lines, and high DPI vectors.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowBulkPrintPreview(false)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4.5 py-2 text-white font-extrabold rounded-xl text-xs uppercase cursor-pointer shadow-lg"
                      style={{ backgroundColor: activeThemePrimary }}
                    >
                      🖨️ Open System Printer Frame
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 border p-8 rounded-3xl overflow-auto flex justify-center">
                  <div id="pvc-print-ready-grid" className="print:m-0 print:p-0 print:border-none border p-[8mm] bg-white w-[210mm] min-h-[297mm] grid grid-cols-2 gap-y-[6mm] gap-x-[4mm] justify-items-center shadow-lg relative rounded">
                    {members.slice(0, bulkPrintLimit).map((m) => {
                      const app = applications.find((a) => a.id === m.applicationId);
                      if (!app) return null;
                      return (
                        <div key={m.memberId} className="border border-dashed p-2.5 border-gray-300 relative group">
                          {/* Simulated Auto Crop Marks corner visuals */}
                          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-black/40"></span>
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-black/40"></span>
                          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-black/40"></span>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-black/40"></span>
                          
                          <PVCIDCard
                            member={m}
                            application={app}
                            settings={settings}
                            customPrimary={cardThemePrimary}
                            customSecondary={cardThemeSecondary}
                            customGold={cardThemeGold}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-8 pr-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card Designer Setup Form */}
                  <div className="bg-white border p-6 rounded-3xl space-y-5 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2">PVC Card Color Designer</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={tLabelClass}>Hex Primary Color (Saffron)</label>
                        <input
                          type="color"
                          className="w-full h-8"
                          value={cardThemePrimary}
                          onChange={(e) => setCardThemePrimary(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={tLabelClass}>Hex Secondary (Maroon)</label>
                        <input
                          type="color"
                          className="w-full h-8"
                          value={cardThemeSecondary}
                          onChange={(e) => setCardThemeSecondary(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={tLabelClass}>Hex Gold Accent</label>
                        <input
                          type="color"
                          className="w-full h-8"
                          value={cardThemeGold}
                          onChange={(e) => setCardThemeGold(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bulk Printing Dispatch setup */}
                  <div className="bg-white border p-6 rounded-3xl space-y-5 shadow-sm md:col-span-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2">Bulk PVC Cards Printing dispatch</h4>
                    <p className="text-xs text-gray-500 leading-normal">
                      Select cumulative export parameters to create alignment frames for multiple membership PVC cards over high-resolution layout sheet print previews.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={tLabelClass}>Set Print Counts Limit</label>
                        <select
                          className={tFormClass}
                          value={bulkPrintLimit}
                          onChange={(e) => setBulkPrintLimit(parseInt(e.target.value, 10))}
                        >
                          <option value={10}>Print First 10 Cards</option>
                          <option value={20}>Print First 20 Cards</option>
                          <option value={50}>Print First 50 Cards</option>
                          <option value={100}>Print First 100 Cards</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => setShowBulkPrintPreview(true)}
                          className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold uppercase rounded-xl transition-all h-[34px] tracking-wide cursor-pointer"
                        >
                          Launch Printable A4 Preview ✨
                        </button>
                      </div>
                    </div>

                    <div className="border border-green-150 p-4 rounded-xl text-green-800 bg-green-50 text-[11px] leading-normal flex gap-1.5">
                      <span>💡</span>
                      <p>
                        <b>Tip on Printing:</b> For realistic plastic identity presentation cards, make sure your printer margin variables are configured to "None" inside browser print boxes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Sandbox PVC ID Mockup demo */}
                <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col items-center">
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-wider select-none">Live PVC Mockup Designer Render</h4>
                  {members.length > 0 && applications.length > 0 ? (
                    <PVCIDCard
                      member={members[0]}
                      application={applications.find((a) => a.id === members[0].applicationId) || applications[0]}
                      settings={settings}
                      customPrimary={cardThemePrimary}
                      customSecondary={cardThemeSecondary}
                      customGold={cardThemeGold}
                    />
                  ) : (
                    <p className="text-xs text-gray-400 py-10">Generate member profiles first inside applications panel.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS & GENERAL EVENTS */}
        {activeMenu === "notices" && (
          <div className="flex-1 overflow-y-auto space-y-8 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notice deployment form */}
              <form onSubmit={triggerAddNotice} className="bg-white border p-6 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2 mb-2">Publish dynamic announcements</h4>
                <div>
                  <label className={tLabelClass}>Bulletin Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Durga Puja Volunteer Committee meeting notice"
                    className={tFormClass}
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className={tLabelClass}>Notice Category</label>
                  <select
                    className={tFormClass}
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                  >
                    <option value="general">General Circular</option>
                    <option value="festival">Sacred Festivals Notice</option>
                    <option value="administrative">Administrative Update</option>
                  </select>
                </div>
                <div>
                  <label className={tLabelClass}>Notice description text Body</label>
                  <textarea
                    rows={4}
                    required
                    className={tFormClass}
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 hover:opacity-90 text-white text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeThemePrimary }}
                >
                  Publish Announcement 📢
                </button>
              </form>

              {/* Event deployment form */}
              <form onSubmit={triggerAddEvent} className="bg-white border p-6 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2 mb-2">Register Upcoming Celestial Events</h4>
                <div>
                  <label className={tLabelClass}>Festivals / Event name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sree Radhashtami Maha-Utsav 2026"
                    className={tFormClass}
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={tLabelClass}>Scheduled Date</label>
                    <input
                      type="date"
                      required
                      className={tFormClass}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Event Location Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Faridpur Ashram Ground"
                      className={tFormClass}
                      value={eventLoc}
                      onChange={(e) => setEventLoc(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={tLabelClass}>Brief festival overview</label>
                  <textarea
                    rows={2}
                    className={tFormClass}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="evtVol"
                    checked={eventVolActive}
                    onChange={(e) => setEventVolActive(e.target.checked)}
                  />
                  <label htmlFor="evtVol" className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer select-none">
                    Open Volunteer enrollment portal triggers for this event
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 hover:opacity-90 text-white text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeThemePrimary }}
                >
                  Deploy Event records 📅
                </button>
              </form>
            </div>

            {/* List and delete notices/events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="bg-white border p-6 rounded-3xl shadow-sm space-y-3">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Delete announcements</h5>
                <div className="space-y-2 overflow-y-auto max-h-48 text-xs">
                  {notices.map((n) => (
                    <div key={n.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                      <span className="truncate max-w-[200px] font-bold">{n.title}</span>
                      <button
                        onClick={async () => {
                          await onDeleteNotice(n.id);
                          await onRefresh();
                        }}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border p-6 rounded-3xl shadow-sm space-y-3">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Delete events</h5>
                <div className="space-y-2 overflow-y-auto max-h-48 text-xs">
                  {events.map((e) => (
                    <div key={e.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                      <span className="truncate max-w-[180px] font-bold">{e.title}</span>
                      <button
                        onClick={async () => {
                          await onDeleteEvent(e.id);
                          await onRefresh();
                        }}
                        className="text-red-500 font-bold hover:underline"
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DONATIONS LEDGER */}
        {activeMenu === "donations" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4 shrink-0">
              
              {/* Direct donation entry */}
              <form onSubmit={triggerAddDonationDirect} className="lg:col-span-2 bg-white border p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 shadow-sm">
                <div className="md:col-span-3">
                  <span className="text-xs font-black uppercase text-[#800000]">Record Verified contribution direct ledger</span>
                </div>
                <div>
                  <label className={tLabelClass}>Donor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sri Ashok Roy"
                    className={tFormClass}
                    value={directDonorName}
                    onChange={(e) => setDirectDonorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={tLabelClass}>Devotional Amount BDT</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    className={tFormClass}
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className={tLabelClass}>Seva purpose allocation</label>
                  <select
                    className={tFormClass}
                    value={directPurpose}
                    onChange={(e) => setDirectPurpose(e.target.value)}
                  >
                    <option value="Temple Renovation">Temple Development</option>
                    <option value="Janmashtami Prasad">Janmashtami Feast</option>
                    <option value="Gita Path Srimad Fund">Vedic Book Fund</option>
                  </select>
                </div>
                <div>
                  <label className={tLabelClass}>Payment method context</label>
                  <input
                    type="text"
                    required
                    className={tFormClass}
                    value={directMethod}
                    onChange={(e) => setDirectMethod(e.target.value)}
                  />
                </div>
                <div>
                  <label className={tLabelClass}>Donor Phone number</label>
                  <input
                    type="tel"
                    required
                    placeholder="01799881122"
                    className={tFormClass}
                    value={directMobile}
                    onChange={(e) => setDirectMobile(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 hover:opacity-90 text-white text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer h-[32px] flex items-center justify-center"
                    style={{ backgroundColor: activeThemePrimary }}
                  >
                    Authorize Entry 💸
                  </button>
                </div>
              </form>

              {/* Donation ledger stats */}
              <div className="bg-white border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">APPROVED RECORDED LEDGERS</span>
                  <h4 className="text-xl font-black text-gray-800">৳ {totalDonationsAmount} BDT</h4>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Consolidated financial ledger tracker matches client self-reported Transaction IDs (TrxID) with verified banking nodes before authorization.
                </p>
              </div>
            </div>

            {/* Donation log lists */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-y-auto">
              {donations.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs">
                  No donation records compiled.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 uppercase text-[10px] text-gray-400 font-extrabold sticky top-0 border-b">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Donor Name</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Allocation Purpose</th>
                      <th className="px-5 py-3.5">Wallet / Mobile</th>
                      <th className="px-5 py-3.5">Transaction TrxID</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 font-mono text-gray-400">{d.id}</td>
                        <td className="px-5 py-3.5 font-extrabold text-gray-800">{d.donorName}</td>
                        <td className="px-5 py-3.5 font-black text-green-700">৳ {d.amount}</td>
                        <td className="px-5 py-3.5 font-semibold text-gray-600">{d.purpose}</td>
                        <td className="px-5 py-3.5 font-mono text-gray-400">
                          {d.paymentMethod} <span className="block text-[10px] text-gray-500">({d.mobileNumber})</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold tracking-widest text-[#800000]">{d.transactionId || "N/A"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            d.status === "approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-650 animate-pulse"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {d.status === "pending" && (
                            <button
                              onClick={async () => {
                                await onApproveDonation(d.id);
                                await onRefresh();
                              }}
                              className="px-2.5 py-1 text-[9px] font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg uppercase cursor-pointer shadow-sm"
                            >
                              Ledger Approve ✔
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SANDBOXED STATIC PAGES DEPLOYER */}
        {activeMenu === "custom-pages" && (
          <div className="flex-1 overflow-y-auto space-y-8 pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Deployment builder form */}
              <form onSubmit={triggerPublishCustomPage} className="lg:col-span-2 bg-white border p-6 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2 mb-2">Deploy Sandboxed CSS/HTML Custom page</h4>
                
                {customPageSuccess && (
                  <div className="bg-green-50 text-green-800 border-green-200 border p-4 rounded-xl text-xs space-y-2">
                    <p className="font-extrabold text-green-950">✔ Custom Page Hosted Successfully!</p>
                    <p>
                      Your files are live under the protected URL:{" "}
                      <a href={`/custom-page/${customPageSuccess}`} target="_blank" rel="noreferrer" className="underline font-bold text-green-950 hover:text-amber-700">
                        /custom-page/{customPageSuccess} →
                      </a>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={tLabelClass}>Custom URL Slug (Alphabetic, e.g. "heritage")</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. gita-tenets"
                      className={tFormClass}
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Webpage Document Title</label>
                    <input
                      type="text"
                      required
                      placeholder="The Srimad Bhagavad Gita Teachings"
                      className={tFormClass}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={tLabelClass}>Protected Raw HTML structure Body *</label>
                    <textarea
                      rows={8}
                      required
                      placeholder="<div class='vedic-card'>...</div>"
                      className={`${tFormClass} font-mono text-[11px] leading-relaxed`}
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={tLabelClass}>Custom CSS rules</label>
                      <textarea
                        rows={3}
                        placeholder=".vedic-card { padding: 12px; }"
                        className={`${tFormClass} font-mono text-[11px]`}
                        value={customCss}
                        onChange={(e) => setCustomCss(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={tLabelClass}>Microscope JS Script Scope</label>
                      <textarea
                        rows={3}
                        placeholder="console.log('Custom scope loaded');"
                        className={`${tFormClass} font-mono text-[11px]`}
                        value={customJs}
                        onChange={(e) => setCustomJs(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 hover:opacity-90 text-white text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeThemePrimary }}
                >
                  Publish Custom IFrame Sandbox page 🚀
                </button>
              </form>

              {/* Active list custom sections */}
              <div className="bg-white border p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-wider">Live extension links</h4>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {customPages.map((p) => (
                      <div key={p.id} className="p-3 border rounded-2xl bg-gray-50 flex flex-col gap-2 shadow-sm">
                        <div>
                          <span className="text-[10px] font-black text-gray-700 truncate block uppercase">{p.title}</span>
                          <span className="font-mono text-[9px] text-gray-400 block mt-0.5">Slug: /custom-page/{p.slug}</span>
                        </div>
                        <a
                          href={`/custom-page/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="pt-1 text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          Launch Protected IFrame URL →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SETUP & THEME BRANDING */}
        {activeMenu === "settings" && (
          <div className="flex-1 overflow-y-auto space-y-8 pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Organization CMS Form */}
              <form onSubmit={triggerUpdateSettings} className="lg:col-span-2 bg-white border p-8 rounded-3xl space-y-4 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2 mb-2">Primary Organization Configuration Parameters</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className={tLabelClass}>Organization Full Name</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.orgName}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, orgName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Short acronym name (ID prefix)</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.shortName}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, shortName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={tLabelClass}>Core Logo Avatar URL Link</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.logoUrl}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, logoUrl: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={tLabelClass}>Home Slider Temple Banner URL Link</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.bannerUrl}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, bannerUrl: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={tLabelClass}>Theological Slogan / Moto Statement</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.slogan}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, slogan: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Central President Coordinator</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.presidentName}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, presidentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Central General Secretary</label>
                    <input
                      type="text"
                      className={tFormClass}
                      value={orgFormSettings.secretaryName}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, secretaryName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Offices Phone</label>
                    <input
                      type="tel"
                      className={tFormClass}
                      value={orgFormSettings.contactPhone}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, contactPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={tLabelClass}>Offices Email</label>
                    <input
                      type="email"
                      className={tFormClass}
                      value={orgFormSettings.contactEmail}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={tLabelClass}>Registered Headquarters Address</label>
                    <textarea
                      rows={2}
                      className={tFormClass}
                      value={orgFormSettings.address}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={tLabelClass}>Comprehensive About paragraph</label>
                    <textarea
                      rows={3}
                      className={tFormClass}
                      value={orgFormSettings.about}
                      onChange={(e) => setOrgFormSettings({ ...orgFormSettings, about: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 hover:opacity-90 text-white text-xs font-bold uppercase rounded-xl tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeThemePrimary }}
                >
                  Save Global Org Parameters ✔
                </button>
              </form>

              {/* Setup changes of passwords */}
              <form onSubmit={triggerChangeAdminPassword} className="bg-white border p-6 rounded-3xl h-fit shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] border-l-3 border-[#E05A10] pl-2 mb-2">Change password</h4>
                
                {passwordMsg && (
                  <p className="text-xs font-bold text-center text-green-700 bg-green-50 p-2.5 border border-green-200 rounded-xl">
                    {passwordMsg}
                  </p>
                )}

                <div>
                  <label className={tLabelClass}>Old Super Password</label>
                  <input
                    type="password"
                    required
                    className={tFormClass}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className={tLabelClass}>New Secure Password</label>
                  <input
                    type="password"
                    required
                    className={tFormClass}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Change Admin Secret Key 🔒
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: DATABASE LOG AUDITS */}
        {activeMenu === "logs" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-900 rounded-3xl p-6 text-white font-mono text-[11px] leading-relaxed flex-1 flex flex-col justify-between shadow-2xl relative">
              
              {/* Terminal Title */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 shrink-0">
                <span className="text-[12px] font-black tracking-widest text-[#E05A10] uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  Sri Sanatana Core Kernel Audit Console
                </span>
                <span className="text-[10px] text-gray-500">SESSION: {token.slice(0, 16)}...</span>
              </div>

              {/* Logs Content scroll grid */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[70vh] text-gray-400 select-text">
                {logs.map((log) => (
                  <p key={log.id} className="border-b border-white/5 pb-1.5">
                    <span className="text-amber-500 font-bold">[{log.timestamp}]</span>{" "}
                    <span className="text-white hover:underline cursor-pointer">ADMIN_ACCESS</span> :: user{" "}
                    <span className="text-blue-400 font-extrabold">@{log.username}</span> from node endpoint{" "}
                    <span className="text-green-400">{log.ip}</span> executed command ::{" "}
                    <span className="text-white font-extrabold">"{log.action}"</span>
                  </p>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 text-[9px] text-gray-500 flex justify-between shrink-0">
                <span>DATABASE MODULE STYLES: MySQL SIMULATED FILE SYSTEM</span>
                <span>UTC RECORDED CLOCK INTERFACE STATUS: OK</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
