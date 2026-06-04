import React, { useState } from "react";
import { Application, Member, OrgSettings, Event } from "../types.ts";
import { PVCIDCard, MembershipCertificate } from "./PVCIDCard.tsx";

interface MemberCabinetProps {
  member: Member;
  application: Application;
  settings: OrgSettings;
  events: Event[];
  lang: "en" | "bn";
  onLogout: () => void;
  onUpdateProfile: (updatedFields: Partial<Application>) => Promise<void>;
  onVolunteerRegister: (eventId: string, memberId: string) => Promise<void>;
}

export const MemberCabinet: React.FC<MemberCabinetProps> = ({
  member,
  application,
  settings,
  events,
  lang,
  onLogout,
  onUpdateProfile,
  onVolunteerRegister,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"card" | "certificate" | "edit-profile" | "seva-volunteer">("card");
  const [certType, setCertType] = useState<"membership" | "participation" | "volunteer">("membership");

  // Edit states
  const [presentAddress, setPresentAddress] = useState(application.presentAddress);
  const [permanentAddress, setPermanentAddress] = useState(application.permanentAddress);
  const [alternativeMobile, setAlternativeMobile] = useState(application.alternativeMobile || "");
  const [emergencyPhone, setEmergencyPhone] = useState(application.emergencyPhone || "");
  const [updateMsg, setUpdateMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Volunteer quick triggers
  const [volunteerStatus, setVolunteerStatus] = useState<Record<string, string>>({});

  const t = {
    en: {
      heading: "Applicant Cabinet Room",
      logout: "Exit Cabinet",
      menuCard: "View PVC Card",
      menuCert: "Membership Certificate",
      menuEdit: "Update Address/Contact",
      menuSeva: "My Volunteer Seva",
      approvedStatus: "Your application is active and authenticated in database.",
      downloadCardTip: "To save your PVC identity card, click 'Print Card' or press Ctrl+P to trigger high-resolution printer configurations.",
      printBtn: "Print / Save PDF",
      editSuccess: "Address details updated successfully inside state repository.",
      addressHeading: "Spelling Corrections & Address update",
      submitUpdate: "Authorize Changes",
    },
    bn: {
      heading: "আমার ভক্ত সদস্যপদ ক্যাবিনেট",
      logout: "ক্যাবিনেট থেকে বিদায়",
      menuCard: "আমার আইডি কার্ড",
      menuCert: "প্রশংসাপত্র / সার্টিফিকেট",
      menuEdit: "যোগাযোগের তথ্য সংশোধন",
      menuSeva: "স্বেচ্ছাসেবী সেবামূলক কাজ",
      approvedStatus: "আপনার আবেদনটি অনুমোদিত হয়েছে এবং ডাটাবেজ সুরক্ষায় সচল রয়েছে।",
      downloadCardTip: "আপনার পিভিসি আইডি কার্ডটি সংরক্ষণ করতে প্রিন্ট বাটনে চাপ দিয়ে ক্রপমার্ক সহ সেভ করুন।",
      printBtn: "প্রিন্ট করুন / পিডিএফ ডাউনলোড",
      editSuccess: "ঠিকানা ও যোগাযোগের তথ্য সফলভাবে আপডেট হয়েছে।",
      addressHeading: "ঠিকানা ও বিকল্প যোগাযোগের তথ্য সংশোধন",
      submitUpdate: "হালনাগাদ করুন",
    },
  }[lang];

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg("");
    try {
      await onUpdateProfile({
        presentAddress,
        permanentAddress,
        alternativeMobile,
        emergencyPhone,
      });
      setUpdateMsg(t.editSuccess);
    } catch {
      setUpdateMsg("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnrollVolunteer = async (eventId: string) => {
    try {
      setVolunteerStatus((prev) => ({ ...prev, [eventId]: "registering" }));
      await onVolunteerRegister(eventId, member.memberId);
      setVolunteerStatus((prev) => ({ ...prev, [eventId]: "success" }));
    } catch (err: any) {
      setVolunteerStatus((prev) => ({ ...prev, [eventId]: err.message || "Failed" }));
    }
  };

  const triggerWindowPrint = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
      <style>
        @media print {
          body { background: white; color: black; padding: 0; margin: 0; }
          .no-print { display: none !important; }
        }
      </style>
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: white;">
        ${printContent.outerHTML}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    // Reload to rehydrate states safely
    window.location.reload();
  };

  const primaryColor = settings.themePrimary || "#E05A10";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row min-h-[500px]">
      {/* Sidebar Cabinet Navigation tabs */}
      <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col justify-between gap-6 shrink-0">
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-200">
            <span className="text-[10px] font-black tracking-widest text-[#E05A10] uppercase select-none">MEMBER SESSION ACTIVE</span>
            <h4 className="text-sm font-black text-gray-800 leading-tight mt-1">{application.fullNameEnglish}</h4>
            <p className="text-xs text-green-700 font-bold mt-1">ID: {member.memberId}</p>
          </div>

          <nav className="space-y-2.5">
            {(["card", "certificate", "edit-profile", "seva-volunteer"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveSubTab(tab);
                  setUpdateMsg("");
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSubTab === tab
                    ? "text-white shadow-md shadow-[#E05A10]/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white"
                }`}
                style={{
                  backgroundColor: activeSubTab === tab ? primaryColor : "transparent",
                }}
              >
                {t[`menu${tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", "")}` as keyof typeof t]}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
        >
          {t.logout} ❌
        </button>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex justify-between items-start border-b border-gray-100 pb-5">
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t.heading}</h3>
              <p className="text-xs text-green-700 font-semibold mt-1">✔ {t.approvedStatus}</p>
            </div>
            <span className="text-xs font-bold text-gray-400 font-mono tracking-wider">SKSSF RELATIONAL DIRECTORY</span>
          </div>

          {/* VIEW DYNAMIC PVC ID CARD PREVIEW */}
          {activeSubTab === "card" && (
            <div className="space-y-6 flex flex-col items-center">
              <p className="text-xs text-gray-500 max-w-xl text-center leading-normal">
                💡 {t.downloadCardTip}
              </p>

              <div id="print-single-card-area" className="flex items-center justify-center p-4 bg-gray-50 border rounded-2xl">
                <PVCIDCard member={member} application={application} settings={settings} />
              </div>

              <button
                onClick={() => triggerWindowPrint("print-single-card-area")}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold tracking-wider rounded-xl uppercase flex items-center gap-1.5 shadow"
              >
                🖨️ {t.printBtn}
              </button>
            </div>
          )}

          {/* VIEW MEMBERSHIP CERTIFICATE SYSTEM */}
          {activeSubTab === "certificate" && (
            <div className="space-y-6 flex flex-col items-center">
              {/* Type picker tabs */}
              <div className="flex gap-2 flex-wrap justify-center border bg-gray-100 p-1.5 rounded-xl">
                {(["membership", "participation", "volunteer"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCertType(type)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      certType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div id="print-certificate-space" className="flex items-center justify-center p-4 bg-white border rounded-2xl overflow-auto scale-[0.8] md:scale-100 origin-center max-w-full">
                <MembershipCertificate member={member} application={application} settings={settings} type={certType} />
              </div>

              <button
                onClick={() => triggerWindowPrint("print-certificate-space")}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold tracking-wider rounded-xl uppercase flex items-center gap-1.5 shadow"
              >
                🖨️ {t.printBtn}
              </button>
            </div>
          )}

          {/* EDIT ADDRESS DETAILS SCREEN */}
          {activeSubTab === "edit-profile" && (
            <div className="max-w-xl mx-auto space-y-6 p-6 border rounded-3xl bg-gray-50">
              <h4 className="text-sm font-bold text-gray-800 border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider">
                {t.addressHeading}
              </h4>

              {updateMsg && (
                <p className="text-xs font-bold text-center text-green-700 bg-green-50 p-2.5 border border-green-200 rounded-xl">
                  ✔ {updateMsg}
                </p>
              )}

              <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Alternative Mobile Phone</label>
                  <input
                    type="tel"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border rounded-xl outline-none"
                    value={alternativeMobile}
                    onChange={(e) => setAlternativeMobile(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border rounded-xl outline-none"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Present Address Details</label>
                  <textarea
                    rows={2}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border rounded-xl outline-none"
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Permanent Address Details</label>
                  <textarea
                    rows={2}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border rounded-xl outline-none"
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2.5 text-white hover:opacity-95 font-bold uppercase rounded-xl text-xs tracking-wider"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isUpdating ? "..." : t.submitUpdate}
                </button>
              </form>
            </div>
          )}

          {/* ACTIVE CELESTIAL VOLUNTEER LIST */}
          {activeSubTab === "seva-volunteer" && (
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-800 border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider">
                Active Events & Enrolled Seva Records
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.filter(e => e.status === "upcoming").map((e) => {
                  const amIVolunteer = e.volunteers?.includes(member.memberId);
                  const stepStatus = volunteerStatus[e.id];

                  return (
                    <div key={e.id} className="p-5 border bg-gray-50 rounded-2xl flex flex-col justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-bold text-gray-400 block tracking-widest uppercase">Celestials Event ID: {e.id}</span>
                        <h5 className="text-xs font-extrabold text-gray-800 mt-1">{e.title}</h5>
                        <p className="text-[10px] text-gray-500 mt-1 lines-2 leading-relaxed">{e.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-[10px] font-mono text-gray-500 font-bold">📅 {e.date}</span>
                        {amIVolunteer || stepStatus === "success" ? (
                          <span className="text-[9px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            ✔ SEVA REGISTERED
                          </span>
                        ) : e.volunteerRegistrationActive ? (
                          <button
                            onClick={() => handleEnrollVolunteer(e.id)}
                            disabled={stepStatus === "registering"}
                            className="px-3 py-1.5 text-white text-[9px] font-bold tracking-wider hover:opacity-90 uppercase rounded-lg cursor-pointer"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {stepStatus === "registering" ? "..." : "Enroll Seva"}
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 bg-gray-200/50 px-2.5 py-1 rounded-full">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
