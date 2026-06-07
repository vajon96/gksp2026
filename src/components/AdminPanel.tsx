import React, { useState, useEffect } from "react";
import { Notice, Event, OrgSettings, Donation, AdminLog, Certificate, Application, Member, CustomPage } from "../types.ts";
import { Plus, Award, Calendar, Megaphone, Heart, Settings, List, RefreshCw, LogOut, Copy, Trash2, Edit2, ShieldCheck, Download, Code, Sparkles, AlertCircle, FileText, Upload, QrCode } from "lucide-react";

interface AdminPanelProps {
  settings: OrgSettings;
  notices: Notice[];
  events: Event[];
  donations: Donation[];
  logs: AdminLog[];
  visitorCount: number;
  lang: "en" | "bn";
  token: string;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  onUpdateSettings: (settings: Partial<OrgSettings>) => Promise<void>;
  onResetAllData?: () => Promise<void>;
  onAddNotice: (title: string, content: string, category: string) => Promise<void>;
  onUpdateNotice: (id: string, title: string, content: string, category: string, isPinned: boolean) => Promise<void>;
  onTogglePinNotice: (id: string, isPinned: boolean) => Promise<void>;
  onDeleteNotice: (id: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onApproveDonation: (id: string) => Promise<void>;
  onAddDonationDirect: (name: string, amount: number, purpose: string, method: string, mobile: string, trnx: string) => Promise<void>;
  onChangeAdminPassword: (oldP: string, newP: string) => Promise<void>;

  // Certificate additions
  certificates: Certificate[];
  onAddCertificate: (cert: Partial<Certificate>) => Promise<void>;
  onBulkAddCertificates: (list: Partial<Certificate>[]) => Promise<void>;
  onUpdateCertificate: (cert: Partial<Certificate>) => Promise<void>;
  onDeleteCertificate: (id: string) => Promise<void>;
  onUpdateEventComplex?: (event: any) => Promise<void>;
  onAddEventComplex?: (event: any) => Promise<void>;

  // Backoffice dashboard integrations
  applications: Application[];
  members: Member[];
  customPages: CustomPage[];
  onApproveApplication: (applicationId: string, designation: string) => Promise<void>;
  onRejectApplication: (applicationId: string, reason: string) => Promise<void>;
  onBulkApprove: (applicationIds: string[]) => Promise<void>;
  onDeleteApplication: (applicationId: string) => Promise<void>;
  onToggleMemberStatus: (memberId: string, status: string) => Promise<void>;
  onAddCustomPage: (slug: string, title: string, html: string, css: string, js: string) => Promise<void>;
  onDeleteCustomPage: (id: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  notices,
  events,
  donations,
  logs,
  visitorCount,
  lang,
  onLogout,
  onRefresh,
  onUpdateSettings,
  onResetAllData,
  onAddNotice,
  onUpdateNotice,
  onTogglePinNotice,
  onDeleteNotice,
  onDeleteEvent,
  onApproveDonation,
  onAddDonationDirect,
  onChangeAdminPassword,

  certificates,
  onAddCertificate,
  onBulkAddCertificates,
  onUpdateCertificate,
  onDeleteCertificate,
  onUpdateEventComplex,
  onAddEventComplex,

  applications,
  members,
  customPages,
  onApproveApplication,
  onRejectApplication,
  onBulkApprove,
  onDeleteApplication,
  onToggleMemberStatus,
  onAddCustomPage,
  onDeleteCustomPage,
}) => {
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "certificates" | "events" | "notices" | "donations" | "settings" | "applications" | "members" | "custom_pages">("dashboard");
  const token = localStorage.getItem("cms_admin_token") || "";

  // Filter States
  const [certSearch, setCertSearch] = useState("");
  const [certEventFilter, setCertEventFilter] = useState("all");

  // Dynamic Editor States
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  
  // Single Certificate Form parameters
  const [recipientName, setRecipientName] = useState("");
  const [certEventId, setCertEventId] = useState(events[0]?.id || "");
  const [certStatus, setCertStatus] = useState<"verified" | "revoked">("verified");
  const [titleText, setTitleText] = useState("প্রশংসাপত্র");
  const [subtitleText, setSubtitleText] = useState("সাফল্য ও সক্রিয় অবদানের স্বীকৃতিস্বরূপ");
  const [mainBodyText, setMainBodyText] = useState("যিনি গণরাজ একতা সংঘ কর্তৃক আয়োজিত সামাজিক কল্যাণ ও ক্রীড়া উৎসবে অত্যন্ত নিষ্ঠার সাথে যোগদানপূর্বক দায়িত্ব পালন করেছেন। সংঘ উনার সর্বাঙ্গীন মঙ্গল কামনা করে এই প্রশংসাপত্রটি প্রদান করছে।");
  const [signatureText, setSignatureText] = useState("সভাপতি ও সাধারণ সম্পাদক");
  const [sealText, setSealText] = useState("গণরাজ একতা সংঘ, কেন্দ্রীয় পরিষদ");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [primaryColor, setPrimaryColor] = useState("#C2410C"); // deep orange
  const [secondaryColor, setSecondaryColor] = useState("#451A03"); // warm brown

  // Bulk generator state
  const [bulkEventId, setBulkEventId] = useState(events[0]?.id || "");
  const [bulkRecipientRows, setBulkRecipientRows] = useState(""); // Comma/newline separated
  const [bulkTitle, setBulkTitle] = useState("প্রশংসাপত্র");
  const [bulkSubtitle, setBulkSubtitle] = useState("মহিমান্বিত অবদানের স্বীকৃতিস্বরূপ");
  const [bulkBody, setBulkBody] = useState("যিনি গণরাজ একতা সংঘ কর্তৃক আয়োজিত সমাজসেবা ও উৎসব কার্যক্রমে পরম আন্তরিকতার সাথে কাজ সম্পন্ন করেছেন।");
  const [bulkMessage, setBulkMessage] = useState("");

  // Direct Event Form parameters
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLoc, setNewEventLoc] = useState("");
  const [newEventCat, setNewEventCat] = useState("সমাজসেবা");
  const [newEventOrg, setNewEventOrg] = useState("গণরাজ একতা সংঘ");
  const [newEventBanner, setNewEventBanner] = useState("");
  const [newEventLogo, setNewEventLogo] = useState("");
  const [newEventVolActive, setNewEventVolActive] = useState(true);

  // Notice parameters
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeCat, setNewNoticeCat] = useState("সাধারণ বিজ্ঞপ্তি");

  // Direct cash entry donation states
  const [directName, setDirectName] = useState("");
  const [directAmount, setDirectAmount] = useState("");
  const [directPurpose, setDirectPurpose] = useState("অফিস উন্নয়ন");
  const [directMethod, setDirectMethod] = useState("বিকাশ বা নগদ");
  const [directMobile, setDirectMobile] = useState("");
  const [directTrnx, setDirectTrnx] = useState("");

  // Superadmin credentials tweak
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");

  // Backoffice Sub-Panel States
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [approvalDesignation, setApprovalDesignation] = useState("General Member");
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [rejectionInputReason, setRejectionInputReason] = useState("");

  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedMemberCard, setSelectedMemberCard] = useState<Member | null>(null);

  const [customPageSlug, setCustomPageSlug] = useState("");
  const [customPageTitle, setCustomPageTitle] = useState("");
  const [customPageHtml, setCustomPageHtml] = useState("");
  const [customPageCss, setCustomPageCss] = useState("");
  const [customPageJs, setCustomPageJs] = useState("");
  const [customPageMsg, setCustomPageMsg] = useState("");

  // Settings states
  const [formOrgName, setFormOrgName] = useState(settings.orgName);
  const [formSlogan, setFormSlogan] = useState(settings.slogan);
  const [formAbout, setFormAbout] = useState(settings.about);
  const [formMission, setFormMission] = useState(settings.mission);
  const [formVision, setFormVision] = useState(settings.vision);
  const [formPresident, setFormPresident] = useState(settings.presidentName);
  const [formPresidentPhoto, setFormPresidentPhoto] = useState(settings.presidentPhotoUrl || "");
  const [formVicePresident, setFormVicePresident] = useState(settings.vicePresidentName || "");
  const [formVicePresidentPhoto, setFormVicePresidentPhoto] = useState(settings.vicePresidentPhotoUrl || "");
  const [formSecretary, setFormSecretary] = useState(settings.secretaryName);
  const [formAddress, setFormAddress] = useState(settings.address);
  const [formPhone, setFormPhone] = useState(settings.contactPhone);
  const [formEmail, setFormEmail] = useState(settings.contactEmail);
  const [formPrimary, setFormPrimary] = useState(settings.themePrimary);
  const [formLogoUrl, setFormLogoUrl] = useState(settings.logoUrl);
  const [formBannerUrl, setFormBannerUrl] = useState(settings.bannerUrl);
  const [formBgUrl, setFormBgUrl] = useState(settings.bgImageUrl);
  const [formCommittee, setFormCommittee] = useState(settings.committeeInfo || "");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Excel bulk generator states
  const [bulkCertTab, setBulkCertTab] = useState<"single" | "excel">("single");
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [parsingStatus, setParsingStatus] = useState("");
  const [excelFileSelectedName, setExcelFileSelectedName] = useState("");
  const [bulkGenerationProgress, setBulkGenerationProgress] = useState(0);

  // Checkbox multi-select list states
  const [selectedNoticeIds, setSelectedNoticeIds] = useState<string[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);

  // Notice edit Modal/Inline parameters
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editNoticeTitle, setEditNoticeTitle] = useState("");
  const [editNoticeContent, setEditNoticeContent] = useState("");
  const [editNoticeCat, setEditNoticeCat] = useState("general");
  const [editNoticePinned, setEditNoticePinned] = useState(false);

  // Undo engine state variables
  const [activeUndoAction, setActiveUndoAction] = useState<{
    label: string;
    type: "delete_everything" | "bulk_cert" | "bulk_notices" | "bulk_events" | "bulk_apps" | "bulk_notices_checked";
    backup: any;
  } | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(0);

  useEffect(() => {
    if (events.length > 0) {
      if (!certEventId) setCertEventId(events[0].id);
      if (!bulkEventId) setBulkEventId(events[0].id);
    }
  }, [events]);

  // Undo interval tracker
  useEffect(() => {
    let interval: any;
    if (undoCountdown > 0) {
      interval = setInterval(() => {
        setUndoCountdown(prev => {
          if (prev <= 1) {
            setActiveUndoAction(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [undoCountdown]);

  // Bulk template download CSV 
  const downloadExcelTemplate = () => {
    const headers = [
      "Participant Name",
      "Father Name (Optional)",
      "Event Name",
      "Certificate Type",
      "Position (First / Second / Third / Participation)",
      "Award Category",
      "Date",
      "Organization Name",
      "Custom Message",
      "Signature Name",
      "Seal Code"
    ];
    const sampleRow = [
      "সজন কুমার দে",
      "হরিপদ দেব",
      events[0]?.title || "শীতবস্ত্র বিতরণ উৎসব ২০২৬",
      "ক্রীড়া অংশগ্রহণ বা সমাজসেবা সনদ",
      "First",
      "Social Service",
      new Date().toISOString().split("T")[0],
      settings.orgName,
      "পরম অবদানের জন্য এই প্রশংসাপত্র প্রদান করা হইল।",
      settings.presidentName || "সভাপতি",
      "BSYF SEAL-998"
    ];
    
    // Add UTF-8 BOM so Excel opens Bangla fonts correctly!
    const csvContent = "\uFEFF" + [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Certificate_Bulk_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel spreadsheet uploader & dynamic validation parser
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileSelectedName(file.name);
    setParsingStatus("Processing excel spreadsheet... / এক্সেল ডাটা প্রসেস হচ্ছে...");
    setExcelErrors([]);
    setExcelRows([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const XLSX = await import("xlsx");
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (!rawData || rawData.length === 0) {
          setExcelErrors(["The selected Excel sheet has no records."]);
          setParsingStatus("error");
          return;
        }

        const headers = rawData[0].map(h => String(h || "").trim());
        const rows: any[] = [];
        const errorsList: string[] = [];

        // Match columns flexibly
        const getColIdx = (colName: string) => {
          return headers.findIndex(h => h.toLowerCase().includes(colName.toLowerCase()));
        };

        const idxParticipant = getColIdx("Participant Name");
        const idxFather = getColIdx("Father Name");
        const idxEvent = getColIdx("Event Name");
        const idxCertType = getColIdx("Certificate Type");
        const idxPosition = getColIdx("Position");
        const idxCategory = getColIdx("Award Category");
        const idxDate = getColIdx("Date");
        const idxOrg = getColIdx("Organization Name");
        const idxMessage = getColIdx("Custom Message");
        const idxSignature = getColIdx("Signature Name");
        const idxSeal = getColIdx("Seal Code");

        if (idxParticipant === -1) {
          errorsList.push("Mandatory 'Participant Name' header was not detected.");
        }

        for (let i = 1; i < rawData.length; i++) {
          const r = rawData[i];
          if (!r || r.length === 0 || r.every(cell => cell === null || cell === "")) continue;

          const pName = idxParticipant !== -1 ? String(r[idxParticipant] || "").trim() : "";
          const fName = idxFather !== -1 ? String(r[idxFather] || "").trim() : "";
          const eName = idxEvent !== -1 ? String(r[idxEvent] || "").trim() : "";
          const cType = idxCertType !== -1 ? String(r[idxCertType] || "").trim() : "";
          const pos = idxPosition !== -1 ? String(r[idxPosition] || "").trim() : "Participation";
          const awCat = idxCategory !== -1 ? String(r[idxCategory] || "").trim() : "Social Service";
          const rDate = idxDate !== -1 ? String(r[idxDate] || "").trim() : new Date().toISOString().split("T")[0];
          const oName = idxOrg !== -1 ? String(r[idxOrg] || "").trim() : settings.orgName;
          const cMsg = idxMessage !== -1 ? String(r[idxMessage] || "").trim() : "For active contribution and support.";
          const sName = idxSignature !== -1 ? String(r[idxSignature] || "").trim() : settings.presidentName;
          const sCode = idxSeal !== -1 ? String(r[idxSeal] || "").trim() : "SEAL-BSYF";

          const parsedRow = {
            index: i,
            participantName: pName,
            fatherName: fName,
            eventName: eName,
            certificateType: cType,
            position: pos,
            awardCategory: awCat,
            date: rDate,
            organizationName: oName,
            customMessage: cMsg,
            signatureName: sName,
            sealCode: sCode,
            isValid: true,
            error: ""
          };

          if (!pName) {
            parsedRow.isValid = false;
            parsedRow.error = "Participant Name missing.";
            errorsList.push(`Row ${i + 1}: Participant Name is missing.`);
          }

          rows.push(parsedRow);
        }

        setExcelRows(rows);
        setExcelErrors(errorsList);
        setParsingStatus("parsed");
      } catch (err: any) {
        setExcelErrors([`Excel parsing failed: ${err.message}`]);
        setParsingStatus("error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Perform bulk processing and selection based on category/position
  const processExcelBulkGeneration = async () => {
    const validRows = excelRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert("No valid rows were loaded. Please check validation warnings.");
      return;
    }

    setLoading(true);
    setBulkGenerationProgress(20);
    const generatedList: Partial<Certificate>[] = [];

    validRows.forEach((r, idx) => {
      // Auto selecting design color / layouts based on award Position
      let priCol = settings.themePrimary || "#C2410C";
      let secCol = settings.themeSecondary || "#451A03";
      const pos = r.position.toLowerCase();

      if (pos.includes("first") || pos.includes("1st")) {
        priCol = "#D4AF37"; // Golden Medal Theme
        secCol = "#4F3E00";
      } else if (pos.includes("second") || pos.includes("2nd")) {
        priCol = "#9E9E9E"; // Silver Medal Theme
        secCol = "#333333";
      } else if (pos.includes("third") || pos.includes("3rd")) {
        priCol = "#CD7F32"; // Bronze Medal Theme
        secCol = "#3A1B02";
      }

      generatedList.push({
        eventId: bulkEventId || events[0]?.id || "GEN",
        recipientName: r.participantName,
        status: "verified",
        templateStyle: pos.includes("first") ? "premium-first" : pos.includes("second") ? "premium-second" : pos.includes("third") ? "premium-third" : "premium-a4-landscape",
        titleText: r.certificateType || "প্রশংসাপত্র",
        subtitleText: r.awardCategory || "সাফল্য ও সক্রিয় অবদানের স্বীকৃতিস্বরূপ",
        mainBodyText: `${r.customMessage || "মহিমান্বিত অবদানের স্বীকৃতিস্বরূপ এই প্রশংসাপত্র প্রদান করা হইল।"}\nপিতার নাম: ${r.fatherName || "অনুপস্থিত"} | ইস্যুকারী কার্যালয়: ${r.organizationName}`,
        signatureText: r.signatureName || settings.presidentName,
        sealText: r.sealCode || "গণরাজ একতা সংঘ কেন্দ্রীয় সংসদ",
        issueDate: r.date || new Date().toISOString().split("T")[0],
        primaryColor: priCol,
        secondaryColor: secCol
      });
    });

    try {
      setBulkGenerationProgress(60);
      await onBulkAddCertificates(generatedList);
      setBulkGenerationProgress(100);
      alert(`${validRows.length} টি প্রশংসা সনদপত্র বাল্ক জেনারেট সম্পন্ন হয়েছে!`);
      setExcelRows([]);
      setExcelFileSelectedName("");
      setParsingStatus("");
    } catch (err: any) {
      alert("Bulk generation error: " + err.message);
    } finally {
      setLoading(false);
      setBulkGenerationProgress(0);
    }
  };

  const handleBulkPrintPDF = () => {
    if (filteredCertificates.length === 0) {
      alert("ডাউনলোড করার জন্য কোনো প্রশংসাপত্র পাওয়া যায়নি। আগে সার্চ বা ফিল্টার করুন।");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("পপ-আপ উইন্ডো অবরুদ্ধ (Pop-up blocked)! দয়া করে আপনার ব্রাউজারের পপ-আপ সেটিংস সক্রিয় করুন।");
      return;
    }

    const certificatesHtml = filteredCertificates.map(cert => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "?verify=" + cert.id)}`;
      const pColor = cert.primaryColor || "#C2410C";
      const sColor = cert.secondaryColor || "#451A03";
      
      return `
        <div class="certificate-container" style="border-color: ${pColor}1a;">
          <!-- Fitment Corner Accents -->
          <div class="cert-corner-tl" style="color: ${pColor};">🔱</div>
          <div class="cert-corner-tr" style="color: ${pColor};">🔱</div>
          <div class="cert-corner-bl" style="color: ${pColor};">🔱</div>
          <div class="cert-corner-br" style="color: ${pColor};">🔱</div>

          <!-- Double line boundary border -->
          <div class="cert-border" style="border-color: ${pColor};"></div>

          <!-- Watermark Award symbol in background -->
          <div class="watermark" style="color: ${pColor};">🎖️</div>

          <!-- Header -->
          <div class="header">
            <h4 class="org-name" style="color: ${pColor};">${settings.orgName}</h4>
            <p class="slogan">"${settings.slogan}"</p>
            <div class="divider" style="background-color: ${pColor};"></div>
          </div>

          <!-- Title -->
          <div class="title-area">
            <span class="cert-title" style="color: ${sColor}; border-color: ${pColor}30;">${cert.titleText || "প্রশংসাপত্র"}</span>
            <p class="subtitle" style="color: ${pColor};">${cert.subtitleText || ""}</p>
          </div>

          <!-- Awardee / Narrative Body -->
          <div class="body-section">
            <p class="award-intro">উক্ত প্রশংসা সনদ সগৌরবে প্রদান করা যাচ্ছে যে,</p>
            <h2 class="recipient" style="border-bottom-color: ${pColor};">${cert.recipientName}</h2>
            <p class="narrative">${cert.mainBodyText || "প্রশংসনীয় অবদানের জন্য আন্তরিক ধন্যবাদ।"}</p>
          </div>

          <!-- Bottom Columns: Date / QR / Signatures -->
          <div class="footer">
            <div class="footer-col left">
              <span class="date-label">তারিখ (Issue Date)</span>
              <span class="date-val">${cert.issueDate}</span>
            </div>
            
            <div class="footer-col qr-container">
              <div class="qr-box">
                <img src="${qrUrl}" alt="QR" class="qr-img" />
              </div>
              <span class="qr-text">${cert.id}</span>
            </div>

            <div class="footer-col right flex-col-end" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
              <span class="signature-line" style="border-top-color: ${pColor}50;">
                ${cert.signatureText || "সভাপতি ও সাধারণ সম্পাদক"}
              </span>
              <span class="seal-label">${cert.sealText || ""}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulk Certificates PDF - ${settings.orgName}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;700&display=swap');
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Hind Siliguri', 'Inter', sans-serif;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .certificate-container {
            width: 297mm;
            height: 210mm;
            box-sizing: border-box;
            padding: 24mm 24mm 20mm 24mm;
            position: relative;
            background-color: #fdfdfc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border: 20px solid #f9f9f6;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
          }

          /* Outer border and design */
          .cert-border {
            position: absolute;
            inset: 6mm;
            border: 3px double #ea580c;
            pointer-events: none;
          }

          .cert-corner-tl { position: absolute; top: 10mm; left: 10mm; font-size: 22px; opacity: 0.25; }
          .cert-corner-tr { position: absolute; top: 10mm; right: 10mm; font-size: 22px; opacity: 0.25; }
          .cert-corner-bl { position: absolute; bottom: 10mm; left: 10mm; font-size: 22px; opacity: 0.25; }
          .cert-corner-br { position: absolute; bottom: 10mm; right: 10mm; font-size: 22px; opacity: 0.25; }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 150px;
            opacity: 0.02;
            pointer-events: none;
          }

          /* Content Styling */
          .header {
            text-align: center;
            margin-top: 2mm;
          }
          .org-name {
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .slogan {
            font-size: 10px;
            color: #6b7280;
            font-style: italic;
            margin: 3px 0 0 0;
            font-family: 'Inter', sans-serif;
          }
          .divider {
            width: 80px;
            height: 2px;
            margin: 10px auto 0 auto;
            opacity: 0.3;
          }

          .title-area {
            text-align: center;
            margin: 10px 0;
          }
          .cert-title {
            font-size: 17px;
            font-weight: 700;
            text-transform: uppercase;
            background-color: #f5f5f4;
            padding: 5px 16px;
            border: 1px dashed rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            display: inline-block;
            letter-spacing: 1.5px;
            font-family: 'Hind Siliguri', sans-serif;
          }
          .subtitle {
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 6px 0 0 0;
            font-weight: 600;
          }

          .body-section {
            text-align: center;
            max-width: 200mm;
            margin: 0 auto;
          }
          .award-intro {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .recipient {
            font-size: 24px;
            font-weight: 850;
            color: #030712;
            border-bottom: 2px solid #ea580c;
            display: inline-block;
            padding-bottom: 2px;
            margin: 4px 0 10px 0;
          }
          .narrative {
            font-size: 12.5px;
            color: #374151;
            line-height: 1.6;
            margin: 8px auto;
            max-width: 170mm;
            font-weight: 500;
          }

          /* Footer structure */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #f3f4f6;
            padding-top: 10px;
            margin-top: auto;
          }
          .footer-col {
            width: 33%;
          }
          .footer-col.left {
            text-align: left;
            padding-left: 5mm;
          }
          .footer-col.right {
            text-align: right;
            padding-right: 5mm;
          }
          .date-label {
            color: #9cb2c4;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .date-val {
            font-weight: 700;
            color: #1f2937;
            margin-top: 2px;
            display: block;
            font-size: 11px;
            font-family: 'Inter', sans-serif;
          }
          .signature-line {
            display: inline-block;
            border-top: 1px dashed #d1d5db;
            padding-top: 4px;
            margin-top: 10px;
            width: 85%;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            font-size: 11px;
          }
          .seal-label {
            font-size: 9px;
            color: #9ca3af;
            margin-top: 2px;
            display: block;
            text-align: center;
            width: 85%;
          }
          .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .qr-box {
            border: 1px solid #e5e7eb;
            padding: 3px;
            background: white;
            border-radius: 4px;
            width: 46px;
            height: 46px;
          }
          .qr-img {
            width: 100%;
            height: 100%;
          }
          .qr-text {
            font-size: 7.5px;
            color: #9ca3af;
            margin-top: 2px;
            font-family: monospace;
          }

          /* Print specific modifiers to prevent cutoffs */
          @media print {
            body {
              background-color: white;
            }
            .certificate-container {
              page-break-after: always;
              break-after: page;
              border: none; /* Do not print container outline block border edge */
            }
            .certificate-container:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${certificatesHtml}
        <script>
          // Wait for images (QR codes) to finish loading, then trigger prints auto
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Checkbox bulk deletion routines
  const executeBulkDeleteNotices = async () => {
    if (selectedNoticeIds.length === 0) return;
    if (confirm(`আপনি কি সত্যিই নির্বাচিত ${selectedNoticeIds.length} টি নোটিশ ডিলিট করতে চান?`)) {
      const backupList = notices.filter(n => selectedNoticeIds.includes(n.id));
      setActiveUndoAction({
        label: `${selectedNoticeIds.length} notices deleted`,
        type: "bulk_notices_checked",
        backup: backupList
      });
      setUndoCountdown(10);

      try {
        const res = await fetch("/api/admin/bulk-delete-notices", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ ids: selectedNoticeIds })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        setSelectedNoticeIds([]);
        await onRefresh();
      } catch (err: any) {
        alert("মোছে ফেলা ব্যর্থ হয়েছে: " + err.message);
      }
    }
  };

  const executeBulkDeleteEvents = async () => {
    if (selectedEventIds.length === 0) return;
    if (confirm(`আপনি কি সত্যিই নির্বাচিত ${selectedEventIds.length} টি ইভেন্ট ডিলিট করতে চান?`)) {
      try {
        const res = await fetch("/api/admin/bulk-delete-events", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ ids: selectedEventIds })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        setSelectedEventIds([]);
        await onRefresh();
        alert("নির্বাচিত ইভেন্টসমূহ সফলভাবে মুছে ফেলা হয়েছে।");
      } catch (err: any) {
        alert("মোছে ফেলা ব্যর্থ হয়েছে: " + err.message);
      }
    }
  };

  const executeBulkDeleteCertificates = async () => {
    if (selectedCertIds.length === 0) return;
    if (confirm(`আপনি কি সত্যিই নির্বাচিত ${selectedCertIds.length} টি প্রশংসাপত্র ডিলিট করতে চান?`)) {
      try {
        const res = await fetch("/api/admin/bulk-delete-certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ ids: selectedCertIds })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        setSelectedCertIds([]);
        await onRefresh();
        alert("নির্বাচিত সার্টিফিকেটসমূহ সফলভাবে মুছে ফেলা হয়েছে।");
      } catch (err: any) {
        alert("মোছে ফেলা ব্যর্থ হয়েছে: " + err.message);
      }
    }
  };

  const handleUndoRestore = async () => {
    if (!activeUndoAction) return;
    setLoading(true);
    try {
      if (activeUndoAction.type === "bulk_notices_checked") {
        const noticesToRestore = activeUndoAction.backup as Notice[];
        for (const n of noticesToRestore) {
          await onAddNotice(n.title, n.content, n.category);
        }
      }
      alert("তথ্য পুনরুদ্ধার সফল হয়েছে / Restore Undo Action Success!");
      setActiveUndoAction(null);
      setUndoCountdown(0);
      await onRefresh();
    } catch (err: any) {
      alert("Restore failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeDangerResetEverything = async () => {
    if (confirm("বিপদ সংকেত! আপনি কি সত্যিই সম্পূর্ণ CMS ডেটাবেজ মুছে ফেলে সিস্টেমটিকে ফ্যাক্টরি রিসেট করতে চান? এই প্রক্রিয়াটি আর ফিরিয়ে আনা যাবে না!")) {
      const pText = prompt("প্রক্রিয়াটি নিশ্চিত করতে দয়া করে 'DELETE' কথাটি টাইপ করুন:");
      if (pText?.trim().toUpperCase() === "DELETE") {
        setLoading(true);
        try {
          const res = await fetch("/api/admin/delete-everything", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!res.ok) throw new Error((await res.json()).message);
          await onRefresh();
          alert("সফল ট্র্যান্সফার! সম্পূর্ণ ডেটাবেজ সফলভাবে মুছে ফেলা হয়েছে।");
        } catch (err: any) {
          alert("ব্যর্থ হয়েছে: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) return;
    setLoading(true);
    setSuccessMsg("");
    try {
      const payload: Partial<Certificate> = {
        eventId: certEventId,
        recipientName: recipientName.trim(),
        status: certStatus,
        templateStyle: "premium-a4-landscape",
        titleText,
        subtitleText,
        mainBodyText,
        signatureText,
        sealText,
        issueDate,
        primaryColor,
        secondaryColor
      };

      if (editingCert) {
        await onUpdateCertificate({
          ...payload,
          id: editingCert.id,
          uuid: editingCert.uuid
        });
        setSuccessMsg("সার্টিফিকেট সফলভাবে আপডেট করা হয়েছে!");
        setEditingCert(null);
      } else {
        await onAddCertificate(payload);
        setSuccessMsg("নতুন সার্টিফিকেট সফলভাবে তৈরি করা হয়েছে!");
      }
      setRecipientName("");
    } catch (err: any) {
      alert("সার্টিফিকেট অপারেশন ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditCertificate = (cert: Certificate) => {
    setEditingCert(cert);
    setRecipientName(cert.recipientName);
    setCertEventId(cert.eventId);
    setCertStatus(cert.status);
    setTitleText(cert.titleText || "প্রশংসাপত্র");
    setSubtitleText(cert.subtitleText || "সাফল্য ও অবদানের স্বীকৃতিস্বরূপ");
    setMainBodyText(cert.mainBodyText || "");
    setSignatureText(cert.signatureText || "সভাপতি");
    setSealText(cert.sealText || "কর্তৃপক্ষ সিল");
    setIssueDate(cert.issueDate || new Date().toISOString().split('T')[0]);
    setPrimaryColor(cert.primaryColor || "#C2410C");
    setSecondaryColor(cert.secondaryColor || "#451A03");
    setActiveMenu("certificates");
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRecipientRows.trim()) {
      alert("অন্তত একজন প্রাপকের নাম তালিকা দিন।");
      return;
    }
    setLoading(true);
    setBulkMessage("");
    try {
      // Split names by newline or commas
      const nameList = bulkRecipientRows
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (nameList.length === 0) {
        alert("কোনো সঠিক নাম খুঁজে পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      const certsToGenerate: Partial<Certificate>[] = nameList.map(name => ({
        eventId: bulkEventId,
        recipientName: name,
        status: "verified",
        templateStyle: "premium-a4-landscape",
        titleText: bulkTitle,
        subtitleText: bulkSubtitle,
        mainBodyText: bulkBody,
        signatureText,
        sealText,
        issueDate,
        primaryColor,
        secondaryColor
      }));

      await onBulkAddCertificates(certsToGenerate);
      setBulkMessage(`অভিনন্দন! মোট ${nameList.length} টি প্রশংসাপত্র বাল্ক আকারে জেনারেট হয়ে ডাটাবেজে যুক্ত হয়েছে।`);
      setBulkRecipientRows("");
    } catch (err: any) {
      alert("বাল্ক জেনারেটর ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;
    setLoading(true);
    try {
      const eventObj = {
        title: newEventTitle,
        description: newEventDesc,
        date: newEventDate,
        location: newEventLoc,
        category: newEventCat,
        organizerName: newEventOrg,
        bannerUrl: newEventBanner,
        logoUrl: newEventLogo,
        volunteerRegistrationActive: newEventVolActive,
      };

      if (editingEvent && onUpdateEventComplex) {
        await onUpdateEventComplex({ ...eventObj, id: editingEvent.id });
        alert("ইভেন্ট সফলভাবে মডিফাই করা হয়েছে।");
        setEditingEvent(null);
      } else if (onAddEventComplex) {
        await onAddEventComplex(eventObj);
        alert("নতুন ইভেন্ট যুক্ত হয়েছে।");
      }
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventDate("");
      setNewEventLoc("");
      setNewEventBanner("");
      setNewEventLogo("");
    } catch (err: any) {
      alert("ইভেন্ট সেভ করা যায়নি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEventClick = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ইভেন্টটি ডিলিট করতে চান? এই ইভেন্টের সাথে লিঙ্ক করা অন্যান্য মেটাডাটা প্রভাবিত হতে পারে।")) return;
    try {
      await onDeleteEvent(id);
      alert("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err: any) {
      alert("ডিলিট ব্যর্থ হয়েছে: " + err.message);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    setLoading(true);
    try {
      await onAddNotice(newNoticeTitle, newNoticeContent, newNoticeCat);
      alert("অফিসিয়াল নোটিশ সফলভাবে পোস্ট করা হয়েছে।");
      setNewNoticeTitle("");
      setNewNoticeContent("");
    } catch {
      alert("নোটিশ পোস্ট করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim() || !directAmount) return;
    setLoading(true);
    try {
      await onAddDonationDirect(directName, parseFloat(directAmount), directPurpose, directMethod, directMobile, directTrnx);
      alert("ক্যাশ লেজার এন্ট্রি যুক্ত হয়েছে!");
      setDirectName("");
      setDirectAmount("");
      setDirectMobile("");
      setDirectTrnx("");
    } catch {
      alert("লেজার এন্ট্রি ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateSettings({
        orgName: formOrgName,
        slogan: formFormSlogan(formSlogan),
        about: formAbout,
        mission: formMission,
        vision: formVision,
        presidentName: formPresident,
        presidentPhotoUrl: formPresidentPhoto,
        vicePresidentName: formVicePresident,
        vicePresidentPhotoUrl: formVicePresidentPhoto,
        secretaryName: formSecretary,
        address: formAddress,
        contactPhone: formPhone,
        contactEmail: formEmail,
        themePrimary: formPrimary,
        logoUrl: formLogoUrl,
        bannerUrl: formBannerUrl,
        bgImageUrl: formBgUrl,
        committeeInfo: formCommittee,
      });
      alert("সংঘের ব্র্যান্ডিং সেটিংস সফলভাবে আপডেট করা হয়েছে!");
    } catch {
      alert("সেটিংস আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const formFormSlogan = (text: string) => {
    if (text.trim() === "") return "২৬শে আমাদের প্রথম প্রয়াস";
    return text.trim();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) return;
    try {
      await onChangeAdminPassword(oldPass, newPass);
      setPassMsg("অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। পরবর্তী লগইনে এটি কার্যকর হবে।");
      setOldPass("");
      setNewPass("");
    } catch {
      setPassMsg("ত্রুটি: পূর্ববর্তী পাসওয়ার্ড ভুল দিয়েছেন।");
    }
  };

  // Safe Excel file mock reading
  const handleDummyCSVImport = () => {
    setBulkRecipientRows(
      "রাহাতুল মারুফ\nআরিফুল ইসলাম\nশারমিন সুলতানা নিপা\nতন্ময় কুমার চৌধুরী\nসাব্বির আহমেদ সাজন"
    );
  };

  const copyVerificationLink = (id: string) => {
    const link = `${window.location.origin}?verify=${id}`;
    navigator.clipboard.writeText(link);
    alert("যাচাইকরণ লিংক ক্লিপবোর্ডে কপি হয়েছে:\n" + link);
  };

  const downloadQRCode = async (certId: string, recipientName: string) => {
    try {
      const linkUrl = `${window.location.origin}?verify=${certId}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkUrl)}`;
      
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `QR_${recipientName.replace(/\s+/g, "_")}_${certId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading QR Code:", error);
      const linkUrl = `${window.location.origin}?verify=${certId}`;
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkUrl)}`;
      window.open(fallbackUrl, "_blank");
    }
  };

  // filter certificates table
  const filteredCertificates = certificates.filter(c => {
    const matchesSearch = c.recipientName.toLowerCase().includes(certSearch.toLowerCase()) || 
                          c.id.toLowerCase().includes(certSearch.toLowerCase()) ||
                          c.uuid.toLowerCase().includes(certSearch.toLowerCase());
    const matchesEvent = certEventFilter === "all" || c.eventId === certEventFilter;
    return matchesSearch && matchesEvent;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 border-t border-gray-100 font-sans">
      
      {/* Sidebar Control Panel */}
      <aside className="w-full lg:w-72 bg-[#1c1917] text-gray-300 flex flex-col justify-between p-6 shrink-0 border-r border-[#2e2a24]">
        <div className="space-y-6">
          <div className="border-b border-orange-950/40 pb-4 space-y-1.5">
            <span className="text-[10px] font-black tracking-widest text-[#E05A10] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> CONTROL CONSOLE
            </span>
            <h3 className="text-md font-black text-white uppercase tracking-tight">{settings.orgName}</h3>
            <p className="text-[10.5px] font-mono text-gray-500 italic">" {settings.slogan} "</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveMenu("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "dashboard" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              📊 ড্যাশবোর্ড ওভারভিউ
            </button>
            <button
              onClick={() => setActiveMenu("certificates")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "certificates" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              🎖️ সনদপত্র জেনারেটর
            </button>
            <button
              onClick={() => setActiveMenu("events")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "events" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              🗓️ ইভেন্ট ও ক্যাম্পেইন
            </button>
            <button
              onClick={() => setActiveMenu("notices")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "notices" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              📢 অফিসিয়াল নোটিশ
            </button>
            <button
              onClick={() => setActiveMenu("donations")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "donations" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              🤝 অনুদান ও লেজার
            </button>
            <button
              onClick={() => setActiveMenu("applications")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "applications" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              📝 সদস্যপদ আবেদনপত্র
            </button>
            <button
              onClick={() => setActiveMenu("members")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "members" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              👥 নিবন্ধিত সদস্যবৃন্দ
            </button>
            <button
              onClick={() => setActiveMenu("custom_pages")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "custom_pages" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              💻 কাস্টম পেজ আপলোড
            </button>
            <button
              onClick={() => setActiveMenu("settings")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all text-[11px] cursor-pointer ${
                activeMenu === "settings" ? "bg-orange-700 text-white font-extrabold shadow-sm" : "hover:text-white hover:bg-white/5"
              }`}
            >
              ⚙️ সংঘ সেটিংস ও পিন
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-orange-950/20 space-y-3">
          <div className="text-[10px] text-gray-500 font-bold bg-[#141210] p-3 rounded-lg overflow-hidden border border-[#23201a]">
            👤 ROLE: SUPERADMIN<br />
            🖥️ VISITOR TRAFFIC: {visitorCount}<br />
            📄 TOTAL CERTS: {certificates.length}
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white border border-red-900/30 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Header bar alerts or notifications */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase">
              {activeMenu === "dashboard" && "অ্যাডমিন কেন্দ্রীয় ড্যাশবোর্ড Control"}
              {activeMenu === "certificates" && "অ্যাডভান্সড সার্টিফিকেট নির্মাতা ও প্রিন্টার"}
              {activeMenu === "events" && "সংঘের উৎসব ও সমাজসেবা কার্যক্রমসমূহ"}
              {activeMenu === "notices" && "অফিসিয়াল বিজ্ঞপ্তি নোটিশ বোর্ড প্রকাশ"}
              {activeMenu === "donations" && "ডিজিটাল অনুদান রসিদ ও ট্র্যাকিং"}
              {activeMenu === "settings" && "সংঘের পিন নম্বর ও লোগো ব্র্যান্ডিং সেটিংস"}
              {activeMenu === "applications" && "সদস্যপদ আবেদনকারী পর্যালোচনা ও মঞ্জুরীকরণ (Applications Review)"}
              {activeMenu === "members" && "সংঘের অনুমোদিত আজীবন সদস্য তালিকা ও অ্যাকাউন্ট নিয়ন্ত্রণ (Members Hub)"}
              {activeMenu === "custom_pages" && "কাস্টম এইচটিএমএল ওয়েবপেজ আপলোডার ও সিএমএস নির্মাতা (Static HTML Upload)"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">সব ডাটা রিয়েলটাইমে সেন্ট্রাল ডাটাবেজের সাথে সিঙ্কড।</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="px-4 py-2 border rounded-xl hover:bg-gray-100 bg-white text-gray-700 text-xs font-bold uppercase tracking-wider cursor-pointer font-sans inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> ডাটা রিফ্রেশ করুন
            </button>
          </div>
        </div>

        {/* SECTION 1: DASHBOARD */}
        {activeMenu === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI grid counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">জেনারেটেড প্রশংসাপত্র</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{certificates.length}</h3>
                </div>
                <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl shrink-0 font-sans">
                  🎖️
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">মোট সংঘ ইভেন্ট সংখ্যা</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1">{events.length}</h3>
                </div>
                <div className="w-11 h-11 bg-teal-50 text-teal-650 rounded-xl flex items-center justify-center text-xl shrink-0 font-sans">
                  🗓️
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">তদন্তাধীন অনুদান</p>
                  <h3 className="text-2.5xl font-black mt-1 text-amber-600 font-sans">{donations.filter(d=>!d.approved).length}</h3>
                </div>
                <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl shrink-0 font-sans">
                  💰
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">অ্যাডমিন লগ এন্ট্রি</p>
                  <h3 className="text-2.5xl font-black text-gray-850 mt-1 font-sans">{logs.length}</h3>
                </div>
                <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl shrink-0 font-sans">
                  📋
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Reset databases tools */}
              <div className="bg-red-50/50 border border-red-200/50 p-6 rounded-3xl space-y-4">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase text-red-950 tracking-wider">সেন্সিটিভ সিস্টেম টুলস ও ডাটাবেজ রিসেট</h4>
                    <p className="text-[11px] text-red-800 leading-relaxed mt-1">সব টেস্ট ইভেন্ট এবং জেনারেটেড প্রশংসাপত্র সম্পূর্ণ মুছে ফেলতে নিচে ক্লিক করুন। এই অ্যাকশন ফিরিয়ে নেয়া সম্ভব নয়।</p>
                  </div>
                </div>
                
                {onResetAllData && (
                  <button
                    onClick={async () => {
                      if (confirm("🚨 অত্যন্ত সাবধান! আপনি কি নিশ্চিতভাবে ডাটাবেজ সম্পূর্ণ রিসেট করে টেস্ট ডাটা ডিলিট করতে চান? সব অ্যাপ্লিকেশন ডিলিট হয়ে যাবে।")) {
                        try {
                          await onResetAllData();
                          alert("ডাটাবেজ সম্পূর্ণ খালি করা হয়েছে এবং ইনিশিয়াল নোটিশ ও ইভেন্ট দিয়ে সাকসেসফুল রিসেট করা হয়েছে।");
                        } catch (err: any) {
                          alert("রিসেট ত্রুটি: " + err.message);
                        }
                      }
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1 shadow-sm"
                  >
                    🔥 ডাটাবেজ সম্পূর্ণ রিসেট
                  </button>
                )}
              </div>

              {/* Central notice bullet */}
              <div className="bg-orange-50/40 border border-orange-150 p-6 rounded-3xl space-y-3 lg:col-span-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-orange-950 tracking-wider inline-flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" /> গণরাজ একতা সংঘ পরিচালন গাইড
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    এই প্যানেল থেকে যেকোনো ডিভাইস দিয়ে সরাসরি অফিসিয়াল সার্টিফিকেট ইস্যু, পরিমার্জন এবং প্রিন্ট নেয়া যাবে। প্রতিটি সার্টিফিকেটের সাথে একটি ইউনিক ভ্যালিডেশন কিউআর কোড উৎপন্ন হয়। যা কোনো সদস্য বা ব্যবহারকারী তাদের মোবাইল ফোন দিয়ে স্ক্যান করামাত্র গণরাজ একতা সংঘের কেন্দ্রীয় পোর্টালে সত্যতা নিশ্চিত করবে।
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-2 font-sans">
                  <button onClick={() => setActiveMenu("certificates")} className="px-4 py-2 bg-orange-700 text-white rounded-lg text-[10.5px] font-bold uppercase tracking-wider cursor-pointer">
                    সনদপত্র জেনারেট করুন
                  </button>
                  <button onClick={() => { setActiveMenu("settings"); }} className="px-4 py-2 bg-white border rounded-lg text-[10.5px] font-bold uppercase tracking-wider hover:bg-gray-50 cursor-pointer">
                    সংঘের লোগো মডিফাই
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs History */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider border-b border-gray-50 pb-3">
                📋 অ্যাডমিন ট্রাস্ট-লগ ও অ্যাক্টিভিটি হিস্ট্রি (Audit Log)
              </h3>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <p className="text-center font-mono text-gray-400 py-8 text-xs select-all">[No logged events found in secure ledger]</p>
                ) : (
                  [...logs].reverse().map((l) => (
                    <div key={l.id} className="py-3 flex justify-between items-start gap-4 text-xs font-sans">
                      <div className="space-y-1">
                        <span className="text-orange-600 font-bold">✔ ADMINISTRATOR ACTION</span>
                        <p className="text-gray-700 select-all font-mono">{l.action}</p>
                      </div>
                      <div className="text-right text-[10px] text-gray-400 shrink-0 select-all font-mono">
                        {l.timestamp}<br />
                        <span className="text-gray-300 font-bold uppercase tracking-widest text-[9px] block mt-0.5">AUTH_TOKEN_APPROVED</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: CERTIFICATES SPEC DESIGNER */}
        {activeMenu === "certificates" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Dual panels layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* LEFT Panel forms and edits */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Form choice tabs */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                  <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-gray-850 tracking-wider flex items-center gap-1.5 font-sans">
                      <Plus className="w-4 h-4 text-orange-600" />
                      {editingCert ? "প্রশংসাপত্র পরিমার্জন (Modify)" : "ফিল্ডভিত্তিক প্রশংসাপত্র তৈরি"}
                    </h3>
                    {editingCert && (
                      <button
                        onClick={() => {
                          setEditingCert(null);
                          setRecipientName("");
                        }}
                        className="px-2 py-1 bg-red-50 text-red-600 rounded text-[9.5px] font-bold"
                      >
                        বাতিল করুন
                      </button>
                    )}
                  </div>

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs font-bold leading-normal font-sans">
                      ✔ {successMsg}
                    </div>
                  )}

                  {/* Selection subtabs */}
                  <div className="flex border-b border-gray-200 pb-2.5 gap-4 font-sans">
                    <button
                      type="button"
                      onClick={() => setBulkCertTab("single")}
                      className={`pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                        bulkCertTab === "single" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      একক প্রশংসাপত্র (Single Form)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkCertTab("excel")}
                      className={`pb-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                        bulkCertTab === "excel" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      এক্সেল বাল্ক ইমপোর্টার (Excel Importer)
                    </button>
                  </div>

                  {bulkCertTab === "single" ? (
                    <form onSubmit={handleCreateCertificate} className="space-y-3 text-xs text-gray-600 font-sans font-medium">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">প্রাপকের পূর্ণ নাম (Recipient Name) *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none font-bold bg-white text-gray-800"
                          placeholder="উদা: সজন কুমার দে"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">সংশ্লিষ্ট সংঘ ইভেন্ট লিঙ্ক *</label>
                          <select
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none"
                            value={certEventId}
                            onChange={(e) => setCertEventId(e.target.value)}
                          >
                            {events.map(ev => (
                              <option key={ev.id} value={ev.id}>{ev.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইস্যুর তারিখ (Issue Date) *</label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-mono"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">সনদপত্র মূল শিরোনাম (Title)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-serif"
                            value={titleText}
                            onChange={(e) => setTitleText(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">সনদপত্র উপ-শিরোনাম (Subtitle)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-serif"
                            value={subtitleText}
                            onChange={(e) => setSubtitleText(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">প্রশংসা বর্ণনাপত্র (Narrative Body Text)</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white leading-relaxed font-sans"
                          value={mainBodyText}
                          onChange={(e) => setMainBodyText(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">স্বাক্ষর ব্লক (Sign Label)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">অফিসিয়াল সিল (Seal Text)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                            value={sealText}
                            onChange={(e) => setSealText(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">প্রাইমারি কালার (Primary Hex)</label>
                          <div className="flex gap-1.5 items-center">
                            <input type="color" className="w-8 h-8 rounded shrink-0 border outline-none cursor-pointer" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} />
                            <input type="text" className="w-full px-2 py-1.5 border rounded-lg font-mono text-[11px]" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">সেকেন্ডারি কালার (Secondary Hex)</label>
                          <div className="flex gap-1.5 items-center">
                            <input type="color" className="w-8 h-8 rounded shrink-0 border outline-none cursor-pointer" value={secondaryColor} onChange={(e)=>setSecondaryColor(e.target.value)} />
                            <input type="text" className="w-full px-2 py-1.5 border rounded-lg font-mono text-[11px]" value={secondaryColor} onChange={(e)=>setSecondaryColor(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all text-[11px]"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Award className="w-4 h-4" />
                          {editingCert ? "আপডেট সংরক্ষণ করুন" : "প্রশংসাপত্র জেনারেট করুন 🎖️"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 font-sans text-xs text-gray-750">
                      {/* Step 1: Download button */}
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl space-y-2">
                        <span className="font-bold text-[11px] block text-orange-950">ধাপ ১: স্যাম্পল এক্সেল বা সিএসভি শিট ডাউনলোড করুন</span>
                        <p className="text-[10px] text-gray-500 leading-normal font-sans">
                          নিচের বাটনে ক্লিক করে প্রশংসাপত্র তথ্য এন্ট্রি করার ডেমো সিএসভি টেমপ্লেটটি ডাউনলোড করুন ও কলামগুলোর নাম একই রেখে এন্ট্রি সম্পন্ন করুন।
                        </p>
                        <button
                          type="button"
                          onClick={downloadExcelTemplate}
                          className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10.5px] font-bold cursor-pointer inline-flex items-center gap-1 transition-all shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> ডাউনলোড টেমপ্লেট শিট
                        </button>
                      </div>

                      {/* Step 2: Upload button */}
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                        <span className="font-bold text-[11px] block text-stone-850">ধাপ ২: ডাটা এন্ট্রিকৃত এক্সেল ফাইলটি আপলোড করুন 📁</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleExcelUpload}
                          className="w-full text-[11px] text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10.5px] file:font-black file:bg-orange-50 file:text-[#E05A10] hover:file:bg-orange-100 cursor-pointer animate-pulse"
                        />
                        {excelFileSelectedName && (
                          <div className="text-[10px] font-mono text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block">
                            Selected File: {excelFileSelectedName}
                          </div>
                        )}
                        {parsingStatus && (
                          <div className="text-[10px] italic text-orange-600 font-medium my-1">
                            Processing status: {parsingStatus}
                          </div>
                        )}
                      </div>

                      {/* Step 3: Preview results table */}
                      {(excelRows.length > 0 || excelErrors.length > 0) && (
                        <div className="p-4 border border-gray-100 bg-stone-50/50 rounded-2xl space-y-3">
                          <span className="font-bold text-[10.5px] uppercase tracking-wider block text-orange-700">ধাপ ৩: এক্সেল ডাটার লাইভ প্রিভিউ ও ফিল্টারিং</span>

                          {excelErrors.length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-155 text-red-700 rounded-xl text-[10.5px] space-y-1 font-mono max-h-24 overflow-y-auto w-full">
                              <span className="font-bold block">⚠️ নিম্নলিখিত ত্রুটিসমূহ পাওয়া গেছে:</span>
                              {excelErrors.map((err, idx) => (
                                <div key={idx}>- {err}</div>
                              ))}
                            </div>
                          )}

                          <div className="max-h-56 overflow-y-auto border border-stone-200 rounded-xl">
                            <table className="w-full text-[10.5px] divide-y divide-gray-150 bg-white">
                              <thead className="bg-stone-100 text-[9px] font-black uppercase text-gray-500 tracking-wider">
                                <tr>
                                  <th className="p-2 text-left">রো</th>
                                  <th className="p-2 text-left">নাম</th>
                                  <th className="p-2 text-center">স্থান / Position</th>
                                  <th className="p-2 text-right">স্ট্যাটাস</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 font-sans">
                                {excelRows.map((r, idx) => (
                                  <tr key={idx} className={!r.isValid ? "bg-red-50/30 font-medium" : "hover:bg-stone-50/50 font-medium"}>
                                    <td className="p-2 font-mono text-gray-400">{idx + 1}</td>
                                    <td className="p-2 font-bold text-gray-950">{r.participantName || "[Missing Name]"}</td>
                                    <td className="p-2 text-center">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                        r.position.toLowerCase().includes("first") ? "bg-amber-100 text-[#C2410C] border border-[#C2410C]/20" :
                                        r.position.toLowerCase().includes("second") ? "bg-slate-100 text-slate-800 border-slate-200" :
                                        r.position.toLowerCase().includes("third") ? "bg-orange-50 text-orange-900 border-orange-200" : "bg-stone-100 text-stone-600"
                                      }`}>
                                        {r.position}
                                      </span>
                                    </td>
                                    <td className="p-2 text-right font-sans">
                                      {r.isValid ? (
                                        <span className="text-emerald-600 font-bold">✔ ঠিক আছে</span>
                                      ) : (
                                        <span className="text-red-500 font-bold" title={r.error}>❌ ত্রুটি</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[10.5px] font-sans">
                            <div>
                              <span>সরল ডাটা: <strong className="text-emerald-600 font-sans">{excelRows.filter(r=>r.isValid).length}</strong></span>
                              <span className="ml-3">ত্রুটিযুক্ত: <strong className="text-red-500 font-sans">{excelRows.filter(r=>!r.isValid).length}</strong></span>
                            </div>

                            <button
                              type="button"
                              onClick={processExcelBulkGeneration}
                              disabled={loading || excelRows.filter(r=>r.isValid).length === 0}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded-lg shadow-sm cursor-pointer disabled:opacity-40 text-[10px]"
                            >
                              বাল্ক জেনারেট সম্পন্ন করুন 🎖️
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT Panel LIVE interactive template preview */}
              <div className="xl:col-span-7 space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                  <div className="flex border-b border-gray-100 pb-3 justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" /> A4 LANDSCAPE PREMIUM LIVE DESIGN DESIGNER
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">WYSIWYG</span>
                  </div>

                  {/* Certificate layout frame rendering live */}
                  <div 
                    className="border-[6px] border-amber-950/20 bg-[#fdfdfc] p-6 md:p-10 rounded-2xl relative overflow-hidden flex flex-col justify-between aspect-[1.414/1] shadow-lg select-none font-serif min-h-[360px]"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    
                    {/* Filigree corner accents */}
                    <div className="absolute top-2 left-2 text-md" style={{ color: primaryColor, opacity: 0.2 }}>🔱</div>
                    <div className="absolute top-2 right-2 text-md" style={{ color: primaryColor, opacity: 0.2 }}>🔱</div>
                    <div className="absolute bottom-2 left-2 text-md" style={{ color: primaryColor, opacity: 0.2 }}>🔱</div>
                    <div className="absolute bottom-2 right-2 text-md" style={{ color: primaryColor, opacity: 0.2 }}>🔱</div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                      <Award className="w-48 h-48" style={{ color: primaryColor }} />
                    </div>

                    <div className="text-center space-y-1 relative">
                      <h4 className="text-lg md:text-xl font-black tracking-tight uppercase font-sans text-gray-900" style={{ color: primaryColor }}>
                        {settings.orgName}
                      </h4>
                      <p className="text-[9px] text-gray-500 italic leading-none font-sans">
                        " {settings.slogan} "
                      </p>
                      <div className="w-20 h-[1.5px] mx-auto mt-2 opacity-30" style={{ backgroundColor: primaryColor }}></div>
                    </div>

                    <div className="text-center space-y-2 py-2 relative">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-stone-50 rounded border inline-block" style={{ color: secondaryColor, borderColor: `${primaryColor}25` }}>
                        {titleText}
                      </span>
                      <p className="text-[9px] text-gray-400 tracking-wider uppercase block leading-none font-sans">
                        {subtitleText}
                      </p>
                    </div>

                    <div className="text-center py-2 relative leading-relaxed max-w-lg mx-auto">
                      <p className="text-[9.5px] text-gray-400 capitalize italic mb-1 font-sans">উক্ত প্রশংসা সনদ সগৌরবে প্রদান করা যাচ্ছে যে,</p>
                      <h3 className="text-lg md:text-xl font-black text-gray-950 underline decoration-amber-600 underline-offset-4 decoration-2">
                        {recipientName || "[প্রাপকের পূর্ণ নাম এখানে দেখানো হবে]"}
                      </h3>
                      <p className="text-[10.5px] text-gray-600 font-sans leading-relaxed mt-2.5 max-w-md mx-auto line-clamp-3">
                        {mainBodyText || "প্রশংসাপত্র বর্ণনা সম্বলিত বক্তব্যসমূহ রিয়েলটাইমে টাইপ করার সাথে সাথে এখানে পরিবর্তিত হয়ে যাবে।"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 relative text-[9px]">
                      <div className="text-center flex flex-col justify-end">
                        <span className="text-gray-400 block font-mono">তারিখ:</span>
                        <span className="font-sans font-bold text-gray-800">{issueDate}</span>
                      </div>
                      
                      <div className="flex justify-center flex-col items-center">
                        <div className="w-10 h-10 border p-0.5 rounded bg-white">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "?verify=PREVIEW")}`}
                            alt="Mock QR"
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                        <span className="text-[6.5px] font-mono text-gray-400 mt-0.5">DYNAMIC QR</span>
                      </div>

                      <div className="text-center flex flex-col justify-end items-center">
                        <span className="font-sans font-bold text-gray-800 border-t border-dashed border-gray-300 px-3 pt-0.5">
                          {signatureText}
                        </span>
                        <span className="text-[7.5px] text-gray-400 font-mono scale-95">{sealText}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table search lists of certificates generated */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4 font-sans">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-4">
                    <h3 className="text-xs font-black uppercase text-gray-850 tracking-wider">
                      🎖️ সনদপত্র ডাটাবেজ রেজিস্ট্রি ({filteredCertificates.length})
                    </h3>
                    
                    <div className="flex gap-2 flex-wrap items-center w-full md:w-auto">
                      {filteredCertificates.length > 0 && (
                        <button
                          type="button"
                          onClick={handleBulkPrintPDF}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold leading-none cursor-pointer flex items-center gap-1.5 transition-all text-nowrap shadow-sm"
                          title="সার্চ ও ফিল্টার করা সব প্রশংসাপত্র একসাথে পিডিএফ ডাউনলোড করুন"
                        >
                          <Download className="w-3.5 h-3.5" />
                          পিডিএফ ডাউনলোড ({filteredCertificates.length})
                        </button>
                      )}
                      <input
                        type="text"
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-sans outline-none w-full md:w-48 placeholder:text-gray-400"
                        placeholder="নাম, আইডি বা ইউইউআইডি খুঁজুন"
                        value={certSearch}
                        onChange={(e)=>setCertSearch(e.target.value)}
                      />
                      <select
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 outline-none shrink-0"
                        value={certEventFilter}
                        onChange={(e)=>setCertEventFilter(e.target.value)}
                      >
                        <option value="all">সকল ইভেন্ট ফিল্টার</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-600 divide-y divide-gray-100">
                      <thead>
                        <tr className="bg-gray-50 font-bold uppercase tracking-wider text-[10px] text-gray-500">
                          <th className="p-3">ইউনিক আইডি /Recipient Name</th>
                          <th className="p-3">সংশ্লিষ্ট ইভেন্ট ও তারিখ</th>
                          <th className="p-3 text-center">ভেরিফিকেশন কিউআর লিংকর</th>
                          <th className="p-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-105">
                        {filteredCertificates.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-450 font-sans leading-relaxed">
                              কোন প্রশংসাপত্র নথিতে পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          filteredCertificates.map(cert => {
                            const linkUrl = `${window.location.origin}?verify=${cert.id}`;
                            const ev = events.find(e => e.id === cert.eventId);
                            return (
                              <tr key={cert.id} className="hover:bg-gray-50 transition-all font-sans">
                                <td className="p-3">
                                  <div className="font-bold text-gray-900 select-all">{cert.recipientName}</div>
                                  <div className="text-[9px] text-gray-400 font-mono mt-0.5 select-all">SERIAL: {cert.id} | UUID: {cert.uuid}</div>
                                </td>
                                <td className="p-3">
                                  <div className="max-w-[170px] truncate font-sans text-gray-800">{ev ? ev.title : "জেনারেল ইভেন্ট"}</div>
                                  <div className="text-[9.5px] font-mono text-gray-450">{cert.issueDate}</div>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex flex-col sm:flex-row gap-1.5 justify-center items-center">
                                    <button
                                      onClick={() => copyVerificationLink(cert.id)}
                                      className="px-2 py-1 border border-orange-200 text-[#E05A10] rounded text-[10px] font-bold font-sans inline-flex items-center gap-1 cursor-pointer hover:bg-orange-50 bg-white"
                                    >
                                      <Copy className="w-3 h-3" /> লিংক কপি করুন
                                    </button>
                                    <button
                                      onClick={() => downloadQRCode(cert.id, cert.recipientName)}
                                      className="px-2 py-1 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold font-sans inline-flex items-center gap-1 cursor-pointer hover:bg-emerald-50 bg-white"
                                      title="ডাউনলোড কিউআর কোড"
                                    >
                                      <QrCode className="w-3 h-3" /> কিউআর ডাউনলোড
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      onClick={() => startEditCertificate(cert)}
                                      className="p-1.5 border hover:bg-orange-50 text-orange-600 rounded-lg transition-all cursor-pointer bg-white"
                                      title="সম্পাদনা করুন"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`আপনি কি সত্যিই '${cert.recipientName}' এর প্রশংসা সনদটি ডিলিট করতে চান?`)) {
                                          try {
                                            await onDeleteCertificate(cert.id);
                                            alert("সনদপত্র ডাটাবেজ থেকে মুছে ফেলা হয়েছে।");
                                          } catch (e: any) {
                                            alert("মুছে ফেলা ব্যর্থ হয়েছে: " + e.message);
                                          }
                                        }
                                      }}
                                      className="p-1.5 border hover:bg-red-50 text-red-600 rounded-lg transition-all cursor-pointer bg-white"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: EVENTS MANAGER */}
        {activeMenu === "events" && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Event Editor Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-orange-600" />
                  {editingEvent ? "ইভেন্ট তথ্য সংশোধন করুন" : "নতুন কল্যাণমূলক ইভেন্ট তৈরি"}
                </h3>

                <form onSubmit={handleEventFormSubmit} className="space-y-3.5 text-xs text-gray-600">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইভেন্ট ও উৎসবের পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: শীতবস্ত্র বিতরণ উৎসব ২০২৬"
                      className="w-full px-3 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                      value={newEventTitle}
                      onChange={(e)=>setNewEventTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইভেন্ট সংক্ষিপ্ত বিবরণ</label>
                    <textarea
                      rows={3}
                      placeholder="ইভেন্টের উদ্দেশ্য এবং সংক্ষিপ্ত বিবরণ লিখুন..."
                      className="w-full px-3 py-2 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                      value={newEventDesc}
                      onChange={(e)=>setNewEventDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইভেন্ট তারিখ *</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                        value={newEventDate}
                        onChange={(e)=>setNewEventDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইভেন্ট স্থান / রুট *</label>
                      <input
                        type="text"
                        required
                        placeholder="উদা: সংঘ কেন্দ্রীয় কার্যালয় প্রাঙ্গণ"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                        value={newEventLoc}
                        onChange={(e)=>setNewEventLoc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ক্যাটাগরি বা বিভাগ</label>
                      <input
                        type="text"
                        placeholder="যেমন: ক্রীড়া, শীতবস্ত্র ত্রাণ"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                        value={newEventCat}
                        onChange={(e)=>setNewEventCat(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">মূল আয়োজক সংস্থা</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                        value={newEventOrg}
                        onChange={(e)=>setNewEventOrg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ইভেন্ট ব্যানার ইমেজ লিঙ্ক (Image URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-X"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                      value={newEventBanner}
                      onChange={(e)=>setNewEventBanner(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold uppercase rounded-xl shadow-xs cursor-pointer text-[11px]"
                    >
                      {editingEvent ? "ইভেন্ট আপডেট করুন" : "নতুন ইভেন্ট প্রকাশ করুন"}
                    </button>
                    {editingEvent && (
                      <button
                        onClick={() => {
                          setEditingEvent(null);
                          setNewEventTitle("");
                          setNewEventDesc("");
                        }}
                        className="px-4 py-2.5 bg-gray-150 rounded-xl text-gray-700 hover:bg-gray-200 font-bold"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Events Lists */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3">
                  🗓️ প্রকাশিত ইভেন্ট গ্যালারি তালিকা ({events.length})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {events.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 leading-normal text-xs">
                      কোনো ইভেন্ট প্রকাশিত হয়নি।
                    </div>
                  ) : (
                    events.map((ev) => (
                      <div key={ev.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-gray-50/50 transition-all">
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-orange-100 text-orange-950">
                              {ev.category || "সাধারণ"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">📅 {ev.date}</span>
                          </div>
                          <h4 className="text-[13px] font-black text-gray-900 select-all leading-tight">{ev.title}</h4>
                          <p className="text-[11px] text-gray-500 line-clamp-2 select-all leading-relaxed">{ev.description}</p>
                          <p className="text-[10px] text-gray-400">📍 {ev.location}</p>
                        </div>

                        <div className="flex gap-2 shrink-0 md:border-l md:pl-4 border-gray-100 self-stretch justify-center items-center">
                          <button
                            onClick={() => {
                              setEditingEvent(ev);
                              setNewEventTitle(ev.title);
                              setNewEventDesc(ev.description || "");
                              setNewEventDate(ev.date || "");
                              setNewEventLoc(ev.location || "");
                              setNewEventCat(ev.category || "সাধারণ");
                              setNewEventOrg(ev.organizerName || settings.orgName);
                              setNewEventBanner(ev.bannerUrl || "");
                            }}
                            className="p-1.5 border hover:bg-orange-50 text-orange-600 rounded-lg cursor-pointer bg-white"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEventClick(ev.id)}
                            className="p-1.5 border hover:bg-red-50 text-red-655 rounded-lg cursor-pointer bg-white"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: NOTICES MANAGER */}
        {activeMenu === "notices" && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Notice Posting form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 flex items-center gap-1.5">
                  <Megaphone className="w-4.5 h-4.5 text-orange-500" />
                  নতুন নোটিশ প্রকাশ বুক
                </h3>

                <form onSubmit={handleNoticeSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">নোটিশ শিরোনাম (Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="অফিসিয়াল নোটিশের গুরুত্বপূর্ণ শিরোনাম"
                      className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                      value={newNoticeTitle}
                      onChange={(e)=>setNewNoticeTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">নোটিশ বিভাগ (ট্যাগ)</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                      value={newNoticeCat}
                      onChange={(e)=>setNewNoticeCat(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">নোটিশের বিষয়বস্তু (Content Body) *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="সর্বসাধারণের জন্য বিজ্ঞপ্তি বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none leading-relaxed"
                      value={newNoticeContent}
                      onChange={(e)=>setNewNoticeContent(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold uppercase rounded-xl cursor-pointer text-[11px]"
                  >
                    অবিলম্বে প্রকাশ করুন
                  </button>
                </form>
              </div>

              {/* Published Notices list */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3">
                  📢 প্রকাশিত নোটিশ বোর্ড লিস্ট ({notices.length})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {notices.length === 0 ? (
                    <div className="text-center py-16 text-gray-405 text-xs leading-normal">
                      কোনো নোটিশ পাওয়া যায়নি।
                    </div>
                  ) : (
                    notices.map((n) => (
                      <div key={n.id} className="p-4 border rounded-2xl space-y-2 relative hover:bg-gray-50/50 transition-all">
                        <div className="flex justify-between items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-950 font-black tracking-wider text-[8px] uppercase">
                            {n.category || "GENERAL"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{n.date}</span>
                        </div>
                        <h4 className="text-xs font-black text-gray-900 leading-tight select-all">{n.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed text-justify line-clamp-3 select-all">{n.content}</p>
                        
                        <div className="pt-2 flex justify-end border-t border-gray-55/40">
                          <button
                            onClick={async () => {
                              if (confirm("আপনি কি নিশ্চিতভাবে এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?")) {
                                try {
                                  await onDeleteNotice(n.id);
                                  alert("নোটিশ ডিলিট করা হয়েছে।");
                                } catch {
                                  alert("ত্রুটি হয়েছে।");
                                }
                              }
                            }}
                            className="text-[10px] text-red-600 hover:bg-red-50 px-2 py-1 rounded-md border font-bold cursor-pointer"
                          >
                            🗑️ মুছে ফেলুন
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: DONATIONS LEDGER */}
        {activeMenu === "donations" && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Direct Log Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 flex items-center gap-1.5">
                  <Heart className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                  ক্যাশ লেজার এন্ট্রি (Direct Cash Entry)
                </h3>

                <form onSubmit={handleDonationSubmit} className="space-y-3.5 text-xs text-gray-650">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">দানকারী/সহায়তাকারী পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: সুজন মাহমুদ"
                      className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                      value={directName}
                      onChange={(e)=>setDirectName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">অনুদানের পরিমাণ (BDT) *</label>
                      <input
                        type="number"
                        required
                        placeholder="উদা: ৫০০০"
                        className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                        value={directAmount}
                        onChange={(e)=>setDirectAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">অনুদানের খাত</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                        value={directPurpose}
                        onChange={(e)=>setDirectPurpose(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">পেমেন্ট মাধ্যম</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                        value={directMethod}
                        onChange={(e)=>setDirectMethod(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">মোবাইল ওয়ালেট নম্বর</label>
                      <input
                        type="tel"
                        className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none"
                        value={directMobile}
                        onChange={(e)=>setDirectMobile(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">লেনদেন ট্রানজেকশন আইডি (TrxID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BK9X3J1K8L"
                      className="w-full px-3.5 py-2.5 border border-gray-200 focus:border-orange-500 rounded-xl outline-none font-mono tracking-wider"
                      value={directTrnx}
                      onChange={(e)=>setDirectTrnx(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold uppercase rounded-xl cursor-pointer text-[11px]"
                  >
                    লেজার মেমো এন্ট্রি দিন
                  </button>
                </form>
              </div>

              {/* Transactions Ledger audit list */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3">
                  💰 সংগৃহীত অনুদান অডিট খতিয়ান ({donations.length})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {donations.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-xs">
                      খতিয়ানে কোনো অনুদান ট্রানজেকশন পেন্ডিং বা ভেরিফাইড নেই।
                    </div>
                  ) : (
                    donations.map((d) => (
                      <div key={d.id} className="p-4 border rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-gray-50/50 transition-all text-xs font-sans">
                        <div className="space-y-1">
                          <div className="flex gap-1.5 items-center">
                            <span className="font-extrabold text-orange-750 select-all font-mono">BDT {d.amount}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white ${d.approved ? "bg-green-600" : "bg-amber-600 animate-pulse"}`}>
                              {d.approved ? "AUDITED / ভেরিফাইড" : "PENDING AUDIT"}
                            </span>
                          </div>
                          <div className="font-bold text-gray-800 select-all">{d.donorName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            খাত: {d.purpose} | TrxID: <span className="text-orange-600 font-bold select-all">{d.transactionId}</span>
                          </div>
                          {d.mobileNumber && <p className="text-[9.5px] text-gray-400 font-mono">নম্বর: {d.mobileNumber} ({d.paymentMethod})</p>}
                        </div>

                        {!d.approved && (
                          <div className="shrink-0 flex items-center h-full pt-2 md:pt-0">
                            <button
                              onClick={async () => {
                                if (confirm(`${d.donorName} এর এই পেমেন্ট ট্রানজেকশনটি যাচাইকরণ সম্পন্ন করতে চান?`)) {
                                  try {
                                    await onApproveDonation(d.id);
                                    alert("অনুমোদিত এবং রেজিস্টারে লিভড করা হয়েছে!");
                                  } catch {
                                    alert("অ্যাপ্রুভাল ব্যর্থ হয়েছে।");
                                  }
                                }
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold uppercase text-[10px] cursor-pointer"
                            >
                              🤝 নিশ্চিত করুন
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: APPLICANT APPLICATIONS REVIEW PANEL */}
        {activeMenu === "applications" && (
          <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto font-sans text-xs">
            
            {/* Filter controls and summary strip */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="আবেদনকারী খুঁজুন (নাম বা ফোন)..."
                    className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl outline-none w-64"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                  />
                  <span className="absolute left-3 top-2 text-gray-400">🔍</span>
                </div>

                <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border">
                  {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAppStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        appStatusFilter === st ? "bg-white text-orange-750 shadow-xs" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {st === "all" && "সবগুলো"}
                      {st === "pending" && "পেন্ডিং অডিট"}
                      {st === "approved" && "অনুমোদিত"}
                      {st === "rejected" && "অননুমোদিত / বাতিল"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CSV bulk downloader report */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const headers = "ID,Name (BN),Name (EN),Mobile,Gender,Blood,Religion,Status,Date\n";
                    const rows = applications.map(a => 
                      `"${a.id}","${a.fullNameBangla}","${a.fullNameEnglish}","${a.mobileNumber}","${a.gender}","${a.bloodGroup}","${a.religion}","${a.status}","${a.createdAt}"`
                    ).join("\n");
                    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute("download", `GR_Applications_Report_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 border rounded-xl hover:bg-gray-100 bg-white text-gray-750 font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all text-[10px]"
                >
                  📥 CSV রিপোর্ট ডাউনলোড (Download Report)
                </button>

                {selectedAppIds.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm(`আপনি কি নির্বাচিত ${selectedAppIds.length} টি আবেদন একসাথে অনুমোদন করতে চান?`)) {
                        try {
                          setLoading(true);
                          await onBulkApprove(selectedAppIds);
                          setSelectedAppIds([]);
                          alert("নির্বাচিত আবেদনসমূহ সফলভাবে অনুমোদন করা হয়েছে!");
                        } catch (err: any) {
                          alert("ত্রুটি: " + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all text-[10px]"
                  >
                    🚀 বাল্ক অনুমোদন ({selectedAppIds.length} টি)
                  </button>
                )}
              </div>
            </div>

            {/* List and Grid display applications */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 select-none">
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedAppIds.length === applications.filter(a=>a.status==="pending").length && applications.filter(a=>a.status==="pending").length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAppIds(applications.filter(a=>a.status === "pending").map(a=>a.id));
                            } else {
                              setSelectedAppIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">আবেদন আইডি / তারিখ</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">ছবি</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">আবেদনকারী নাম</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">যোগাযোগ তথ্য</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">ধর্ম ও গোত্র</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">বর্তমান স্ট্যাটাস</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px] text-center">অ্যাকশন সমূহ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.filter(a => {
                      const matS = a.fullNameEnglish.toLowerCase().includes(appSearch.toLowerCase()) || 
                                   a.fullNameBangla.toLowerCase().includes(appSearch.toLowerCase()) ||
                                   a.id.toLowerCase().includes(appSearch.toLowerCase()) ||
                                   a.mobileNumber.toLowerCase().includes(appSearch.toLowerCase());
                      const matF = appStatusFilter === "all" || a.status === appStatusFilter;
                      return matS && matF;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-16 text-center text-gray-400 font-medium">
                          কোনো সদস্যপদ আবেদন ডাটাবেজে পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      applications.filter(a => {
                        const matS = a.fullNameEnglish.toLowerCase().includes(appSearch.toLowerCase()) || 
                                     a.fullNameBangla.toLowerCase().includes(appSearch.toLowerCase()) ||
                                     a.id.toLowerCase().includes(appSearch.toLowerCase()) ||
                                     a.mobileNumber.toLowerCase().includes(appSearch.toLowerCase());
                        const matF = appStatusFilter === "all" || a.status === appStatusFilter;
                        return matS && matF;
                      }).map((app) => (
                        <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-all font-sans">
                          <td className="p-4 text-center">
                            {app.status === "pending" && (
                              <input
                                type="checkbox"
                                checked={selectedAppIds.includes(app.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAppIds(prev => [...prev, app.id]);
                                  } else {
                                    setSelectedAppIds(prev => prev.filter(id => id !== app.id));
                                  }
                                }}
                              />
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono font-black text-gray-900 block select-all">{app.id}</span>
                            <span className="text-[9.5px] text-gray-400 font-mono block select-none">{app.createdAt.split("T")[0]}</span>
                          </td>
                          <td className="p-4">
                            <div className="w-10 h-11.5 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 select-none">
                              {app.photoUrl ? (
                                <img src={app.photoUrl} alt="Photo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-xs">👤</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-extrabold text-gray-800 select-all">{app.fullNameEnglish}</div>
                            <div className="text-[10px] text-gray-400 select-all">{app.fullNameBangla}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono font-bold text-gray-700 select-all">{app.mobileNumber}</div>
                            <div className="text-[9.5px] text-gray-400 select-all">{app.email || "No Email"}</div>
                          </td>
                          <td className="p-4 select-none">
                            <div className="text-gray-700">{app.religion}</div>
                            <div className="text-[9.5px] text-gray-400 italic">গোত্র: {app.gotra || "উল্লেখ নেই"}</div>
                          </td>
                          <td className="p-4 select-none">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider text-white ${
                              app.status === "pending" ? "bg-amber-600" :
                              app.status === "approved" ? "bg-green-600" : "bg-red-650"
                            }`}>
                              {app.status === "pending" && "পেন্ডিং অডিট (PENDING)"}
                              {app.status === "approved" && "অনুমোদিত আজীবন সদস্য"}
                              {app.status === "rejected" && "বাতিলকৃত / অননুমোদিত"}
                            </span>
                          </td>
                          <td className="p-4 text-center space-x-1 select-none">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                if (app.appliedRank) {
                                  setApprovalDesignation(app.appliedRank);
                                } else {
                                  setApprovalDesignation("General Member");
                                }
                              }}
                              className="px-2.5 py-1.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-750 font-bold rounded-lg cursor-pointer"
                            >
                              🔍 বিস্তারিত পর্যালোচন
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm("আপনি কি নিশ্চিতভাবে এই সদস্যপদ আবেদনটি স্থায়ীভাবে ডিলিট করতে চান?")) {
                                  try {
                                    setLoading(true);
                                    await onDeleteApplication(app.id);
                                    alert("আবেদনটি চিরতরে ডিলিট করা হয়েছে।");
                                  } catch (err: any) {
                                    alert("ত্রুটি: " + err.message);
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                              className="hover:bg-red-50 text-red-650 p-1.5 border border-red-200/50 rounded-lg cursor-pointer inline-flex items-center"
                              title="ডিলিট আবেদন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application review detailed drawer model */}
            {selectedApp && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end p-0">
                <div className="bg-white h-full w-full max-w-r2xl shadow-2xl overflow-y-auto flex flex-col justify-between font-sans relative shrink-0 border-l border-gray-150 animate-slideLeft">
                  
                  {/* Drawer Header */}
                  <div className="bg-stone-900 text-white p-6.5 select-none flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#E05A10] uppercase block">SYSTEM AUDIT CONTROL</span>
                      <h3 className="text-base font-black uppercase mt-0.5 select-text">{selectedApp.fullNameEnglish}</h3>
                      <p className="text-[10px] text-gray-400 font-mono select-text">ID: {selectedApp.id} | Applied: {selectedApp.createdAt}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        setApprovalDesignation("General Member");
                        setRejectionInputReason("");
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-black cursor-pointer transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Drawer Body details list */}
                  <div className="p-7 space-y-8 flex-1 overflow-y-auto font-sans leading-relaxed">
                    
                    {/* Status warning strip */}
                    <div className="bg-amber-50 border border-amber-200/50 p-4.5 rounded-2xl flex items-start gap-3 select-none">
                      <span className="text-xl">🛡️</span>
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">সদস্যপদ ভ্যালিডেশন অ্যান্ড অডিট ট্রেইল</h4>
                        <p className="text-[10.5px] text-amber-800 leading-normal mt-1">সব আপলোডেড প্রমাণপত্র সমূহ ও ভোটার জাতীয় পরিচয় বিবরণ নিচে যাচাইপূর্বক মেম্বারশীপ এন্ট্রি লিভড করুন।</p>
                      </div>
                    </div>

                    {/* Dual columns profile datasets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                      
                      {/* Column 1: Photos & Core details */}
                      <div className="space-y-5">
                        <div className="flex gap-4 items-start select-none">
                          <div className="w-24 h-28 border border-gray-200 rounded-xl bg-gray-55/40 overflow-hidden relative shadow-xs">
                            {selectedApp.photoUrl ? (
                              <img src={selectedApp.photoUrl} alt="Photo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-xs">NO PHOTO</span>
                            )}
                          </div>
                          <div className="w-24 h-28 border border-gray-200 rounded-xl bg-gray-55/40 overflow-hidden relative shadow-xs">
                            {selectedApp.signatureUrl ? (
                              <img src={selectedApp.signatureUrl} alt="Signature" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-xs">NO SIGN</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-yellow-600 font-extrabold block uppercase select-none">আবেদনকৃত পদবী / পদ (Applied Rank)</span>
                          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-950 border border-amber-200 rounded-lg text-xs font-black select-text">
                            {selectedApp.appliedRank || "উল্লেখ নেই (সাধারণ সদস্য)"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">পূর্ণ নাম (বাংলা)</span>
                          <span className="font-extrabold text-[#111111] select-all">{selectedApp.fullNameBangla}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">পিতার নাম</span>
                          <span className="font-extrabold text-[#111111] select-all">{selectedApp.fatherName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">মাতার নাম</span>
                          <span className="font-extrabold text-[#111111] select-all">{selectedApp.motherName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">জন্ম তারিখ / লিঙ্গ</span>
                          <span className="font-extrabold text-[#111111] select-all">{selectedApp.dob} ({selectedApp.gender})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">রক্তের গ্রুপ / ধর্ম</span>
                          <span className="font-extrabold text-[#111111] select-all">{selectedApp.bloodGroup} / {selectedApp.religion}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন</span>
                          <span className="font-bold text-[#111111] block select-all">NID: {selectedApp.nidNumber || "নেই"}</span>
                          <span className="font-bold text-[#111111] block select-all">BCN: {selectedApp.birthCertificateNumber || "নেই"}</span>
                          <span className="font-bold text-[#111111] block select-all">Passport: {selectedApp.passportNumber || "নেই"}</span>
                        </div>
                      </div>

                      {/* Column 2: Contact, Address, Religion details */}
                      <div className="space-y-5">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">মোবাইল নাম্বার</span>
                          <span className="font-black text-orange-950 block text-xs select-all font-mono">{selectedApp.mobileNumber}</span>
                          {selectedApp.alternativeMobile && <span className="font-bold text-gray-650 block select-all font-mono">Alt: {selectedApp.alternativeMobile}</span>}
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">ইমেইল ঠিকানা</span>
                          <span className="font-bold text-[#111111] select-all block font-mono">{selectedApp.email || "No Email Address"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">বর্তমান ঠিকানা</span>
                          <span className="font-bold text-gray-750 block select-all">{selectedApp.presentAddress}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block uppercase select-none">স্থায়ী ঠিকানা</span>
                          <span className="font-bold text-gray-750 block select-all">{selectedApp.permanentAddress}</span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-1.5 select-none">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase">শিক্ষা ও পেশাগত তথ্য</span>
                          <p className="font-semibold text-gray-700">সর্বোচ্চ যোগ্যতা: <span className="font-black text-gray-950 select-text">{selectedApp.highestQualification}</span></p>
                          <p className="font-semibold text-gray-700">পেশা: <span className="font-black text-gray-950 select-text">{selectedApp.occupation} ({selectedApp.profession || "অন্যান্য"})</span></p>
                          <p className="font-semibold text-gray-700">কর্মস্থল: <span className="font-black text-gray-950 select-text">{selectedApp.workplace || "উল্লেখ নেই"}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Cultural Profile details */}
                    <div className="space-y-4 pb-6 border-b border-gray-100">
                      <h4 className="text-[10.5px] font-black uppercase text-stone-850 tracking-wider select-none">সাংস্কৃতিক ও ধর্মীয় পরিচিতি</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold select-none">সংশ্লিষ্ট স্থানীয় মন্দির</span>
                          <span className="font-extrabold text-gray-800 select-all">{selectedApp.templeName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold select-none">প্রধান উপাস্য দেব-দেবী</span>
                          <span className="font-extrabold text-gray-800 select-all">{selectedApp.mainDeityWorship}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold select-none">সদস্য গোত্র (Gotra)</span>
                          <span className="font-extrabold text-gray-800 select-all">{selectedApp.gotra || "উল্লেখ নেই"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold select-none">পূর্ববর্তী অন্য সংগঠনের অভিজ্ঞতা</span>
                          <span className="font-extrabold text-gray-800 select-all">{selectedApp.prevOrgMembership || "নেই"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold select-none">ধর্মীয় বা স্বেচ্ছাসেবী কাজে অংশগ্রহণের বিবরণ</span>
                        <p className="font-bold text-gray-750 select-all text-justify">{selectedApp.participationInActivities}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold select-none">স্বেচ্ছাসেবী সেবার অভিজ্ঞতা সমূহ</span>
                        <p className="font-bold text-gray-750 select-all text-justify">{selectedApp.volunteerExperience}</p>
                      </div>
                    </div>

                    {/* Emergency and Document links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 select-none">
                      <div className="space-y-1.5 p-4 bg-gray-50 border rounded-2xl">
                        <span className="text-[10px] text-gray-400 block font-bold">জরুরী যোগাযোগ বিবরণ (Emergency)</span>
                        <p className="font-black text-gray-850 select-text">{selectedApp.emergencyName}</p>
                        <p className="font-bold text-[#E05A10] font-mono select-text">{selectedApp.emergencyPhone}</p>
                        <p className="text-[10px] text-gray-400">সম্পর্ক: {selectedApp.emergencyRelationship}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-400 block font-bold">আপলোডেড প্রমাণপত্রাদি বিবরণ (Credentials)</span>
                        {selectedApp.nidScanUrl && (
                          <a
                            href={selectedApp.nidScanUrl}
                            download={`GR_NID_Scan_${selectedApp.id}.png`}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-950 text-white font-extrabold uppercase rounded-lg tracking-wider text-[9.5px] inline-flex items-center gap-1 cursor-pointer w-full justify-between"
                          >
                            <span>📥 Nid / Birth Certificate Scan Page</span>
                            <span className="text-[7.5px] opacity-70">DOWNLOAD</span>
                          </a>
                        )}
                        {selectedApp.additionalDocsUrl && (
                          <a
                            href={selectedApp.additionalDocsUrl}
                            download={`GR_AddDocs_${selectedApp.id}.png`}
                            className="px-3 py-1.5 bg-stone-150 hover:bg-stone-200 text-stone-850 font-bold uppercase rounded-lg tracking-wider text-[9.5px] inline-flex items-center gap-1 cursor-pointer w-full justify-between border"
                          >
                            <span>📎 Additional Testimonials / Files</span>
                            <span className="text-[7.5px] opacity-70">OPEN / VIEW</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer controls */}
                  <div className="bg-gray-50 border-t border-gray-150 p-6 space-y-4 select-none">
                    {selectedApp.status === "pending" ? (
                      <div className="space-y-3 font-sans">
                        <div className="flex flex-col md:flex-row gap-3 items-end bg-white p-4 rounded-2xl border">
                          <div className="flex-1 w-full space-y-1">
                            <label className="text-[9.5px] font-black uppercase text-gray-400 tracking-wider block">দপ্তর বা সাংগঠনিক পদবী নির্ধারণ (Designation Name)</label>
                            <input
                              type="text"
                              className="w-full px-3.5 py-2 border rounded-xl outline-none text-xs font-bold font-sans text-gray-800"
                              value={approvalDesignation}
                              onChange={(e) => setApprovalDesignation(e.target.value)}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              if (confirm(`আপনি কি নিশ্চিতভাবে এই আবেদনটি "${approvalDesignation}" হিসেবে অনুমোদন করতে চান? এটি করতে একটি স্বয়ংক্রিয় সদস্য আজীবন আইডি কোড ও ইউজারনেম তৈরি হবে!`)) {
                                try {
                                  setLoading(true);
                                  await onApproveApplication(selectedApp.id, approvalDesignation);
                                  alert("অভিনন্দন! আবেদনটি মঞ্জুর হয়েছে ও আজীবন আজীবনের সদস্য তালিকা এন্ট্রি করা হয়েছে।");
                                  setSelectedApp(null);
                                  setApprovalDesignation("General Member");
                                } catch (err: any) {
                                  alert("অনুমোদন ত্রুটি: " + err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="py-2.2 px-5 bg-green-600 hover:bg-green-700 text-white font-black text-[11px] uppercase tracking-wide rounded-xl cursor-pointer w-full md:w-auto"
                          >
                            🚀 অনুমোদন (Approve Application)
                          </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-end bg-white p-4 rounded-2xl border">
                          <div className="flex-1 w-full space-y-1">
                            <label className="text-[9.5px] font-black uppercase text-gray-400 tracking-wider block">বাতিল বা অননুমোদনের যৌক্তিক কারণ (Rejection Reason)</label>
                            <input
                              type="text"
                              placeholder="e.g. ছবি স্পষ্ট নয় অথবা তথ্যে গড়মিল।"
                              className="w-full px-3.5 py-2 border rounded-xl outline-none text-xs font-bold text-gray-800"
                              value={rejectionInputReason}
                              onChange={(e) => setRejectionInputReason(e.target.value)}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              if (!rejectionInputReason.trim()) {
                                alert("বাতিল করার কারণ উল্লেখ করুন।");
                                return;
                              }
                              if (confirm("আপনি কি নিশ্চিতভাবে এই সদস্যপদ আবেদনটি প্রত্যাখ্যান বা রিজেক্ট করতে চান?")) {
                                try {
                                  setLoading(true);
                                  await onRejectApplication(selectedApp.id, rejectionInputReason);
                                  alert("আবেদনটি বাতিল করা হয়েছে।");
                                  setSelectedApp(null);
                                  setRejectionInputReason("");
                                } catch (err: any) {
                                  alert("বাতিল ত্রুটি: " + err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="py-2.2 px-5 bg-red-650 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-wide rounded-xl cursor-pointer w-full md:w-auto"
                          >
                            ✕ অননুমোদন (Reject)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white border rounded-xl text-center text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5">
                        <span>🏷️ আবেদন স্ট্যাটাস:</span>
                        <span className={selectedApp.status === "approved" ? "text-green-700" : "text-red-700"}>
                          {selectedApp.status === "approved" ? "অনুমোদিত আজীবন সচল মেম্বার" : `বাতিলকৃত আবেদন (কারণ: ${selectedApp.rejectionReason || "উল্লেখ নেই"})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 8: REGISTERED CRM MEMBERS DIRECTORY */}
        {activeMenu === "members" && (
          <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto font-sans text-xs">
            
            {/* Filter bar registered members */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="সদস্য খুঁজুন (ID বা ইউজারনেম)..."
                    className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 rounded-xl outline-none w-64"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  <span className="absolute left-3 top-2 text-gray-400">🔍</span>
                </div>

                <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border">
                  {(["all", "active", "suspended"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setMemberStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        memberStatusFilter === st ? "bg-white text-orange-750 shadow-xs" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {st === "all" && "সকল মেম্বার"}
                      {st === "active" && "সচল মেম্বার"}
                      {st === "suspended" && "সাময়িক বরখাস্ত (Suspended)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRM CSV exporter */}
              <button
                onClick={() => {
                  const headers = "Member ID,App Link ID,Username,Designation,Joined Date,Status\n";
                  const rows = members.map(m => 
                    `"${m.memberId}","${m.applicationId}","${m.username}","${m.designation}","${m.joinedDate}","${m.status}"`
                  ).join("\n");
                  const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.setAttribute("download", `GR_Active_Members_${Date.now()}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3.5 py-2 border rounded-xl hover:bg-gray-100 bg-white text-gray-750 font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all text-[10px]"
              >
                📥 মেম্বার আজীবন রেজিস্টার এক্সপোর্ট (CSV Report)
              </button>
            </div>

            {/* List and Grid display members CRM */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 select-none">
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">আজ্য আজীবন মেম্বার আইডি</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">পূর্ণ নাম</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">লগইন আইডি ও পাসওয়ার্ড</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">সাংগঠনিক পদবী</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">অধিভুক্তির তারিখ</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">অ্যাকাউন্ট বিবরণ</th>
                      <th className="p-4 font-black uppercase tracking-wider text-gray-400 text-[10px] text-center">ক্যাবিনেট আইডি অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.filter(m => {
                      const matS = m.memberId.toLowerCase().includes(memberSearch.toLowerCase()) || 
                                   m.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                   m.designation.toLowerCase().includes(memberSearch.toLowerCase());
                      const matF = memberStatusFilter === "all" || m.status === memberStatusFilter;
                      return matS && matF;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center text-gray-400 font-medium">
                          কোনো নিবন্ধিত আজীবন সচল সদস্য খুঁজে পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      members.filter(m => {
                        const matS = m.memberId.toLowerCase().includes(memberSearch.toLowerCase()) || 
                                     m.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                     m.designation.toLowerCase().includes(memberSearch.toLowerCase());
                        const matF = memberStatusFilter === "all" || m.status === memberStatusFilter;
                        return matS && matF;
                      }).map((mb) => {
                        const correspondingApp = applications.find(a=>a.id === mb.applicationId);
                        return (
                          <tr key={mb.memberId} className="border-b border-gray-50 hover:bg-gray-50/40 transition-all font-sans">
                            <td className="p-4 select-all">
                              <span className="font-mono font-black text-green-700 block text-xs">{mb.memberId}</span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 inline-block mt-1 uppercase select-none">BSYF SPEC</span>
                            </td>
                            <td className="p-4 select-all">
                              <div className="font-extrabold text-gray-800">{correspondingApp?.fullNameEnglish || "সদস্য নাম"}</div>
                              <div className="text-[10px] text-gray-400">{correspondingApp?.fullNameBangla || "আবেদনকারী নাম"}</div>
                            </td>
                            <td className="p-4 select-all font-mono">
                              <div className="text-gray-800 font-bold block">User: <span className="text-orange-950 font-black">{mb.username}</span></div>
                              <div className="text-[10px] text-gray-400 block">Pass: <span className="font-semibold text-gray-650">{mb.passwordText}</span></div>
                            </td>
                            <td className="p-4 select-all">
                              <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-950 font-extrabold text-[10px] uppercase">
                                🎖️ {mb.designation || "General Member"}
                              </span>
                            </td>
                            <td className="p-4 select-all font-mono text-gray-500">
                              {mb.joinedDate || "2026-06-01"}
                            </td>
                            <td className="p-4 select-none">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white tracking-wider ${
                                mb.status === "active" ? "bg-green-600" : "bg-red-650"
                              }`}>
                                {mb.status === "active" ? "অ্যাকাউন্ট সচল" : "সম্পূর্ণ স্থগিত"}
                              </span>
                            </td>
                            <td className="p-4 text-center space-x-1 select-none">
                              <button
                                onClick={() => setSelectedMemberCard(mb)}
                                className="px-2.5 py-1.5 border border-[#E05A10] bg-orange-50 text-[#E05A10] hover:bg-[#E05A10] hover:text-white transition-all font-black rounded-lg cursor-pointer text-[10px]"
                              >
                                📇 আইডি প্রিন্টার
                              </button>
                              
                              <button
                                onClick={async () => {
                                  const promptText = mb.status === "active" ? "স্থগিত" : "সচল";
                                  const targetState = mb.status === "active" ? "suspended" : "active";
                                  if (confirm(`আপনি কি নিশ্চিতভাবে সদস্য ${mb.memberId} এর আইডি সেশন ${promptText} করতে চান?`)) {
                                    try {
                                      setLoading(true);
                                      await onToggleMemberStatus(mb.memberId, targetState);
                                      alert("আইডি স্ট্যাটাস সফলভাবে ট্রিগার হয়েছে!");
                                    } catch (err: any) {
                                      alert("ভ্যালিডেশন ভুল: " + err.message);
                                    } finally {
                                      setLoading(false);
                                    }
                                  }
                                }}
                                className={`px-2 py-1.5 rounded-lg border font-bold uppercase text-[9.5px] cursor-pointer ${
                                  mb.status === "active" 
                                    ? "bg-red-50 text-red-650 hover:bg-red-600 hover:text-white border-red-200" 
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-green-200"
                                }`}
                              >
                                {mb.status === "active" ? "🚫 ব্লক সেশন" : "✅ আনব্লক করুন"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Render Member Profile Printable Card Drawer overlay */}
            {selectedMemberCard && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl border shadow-2xl max-w-sm w-full select-none relative animate-fadeIn font-sans">
                  <button
                    onClick={() => setSelectedMemberCard(null)}
                    className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-150 text-gray-500 rounded-full flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>

                  <div className="text-center space-y-1 mb-5">
                    <span className="text-2.5xl">📇</span>
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-tight">PVC আইডি জেনারেটর</h3>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase">Member ID A4 / PDF Cropmarks Preview</p>
                  </div>

                  {/* Highlighted rendering of applicant's card inside layout */}
                  <div className="border border-dashed border-gray-200 p-4 rounded-2xl bg-gray-50/50 flex flex-col items-center">
                    <p className="text-[10px] text-gray-400 text-center mb-3">মেম্বার সেশন অডিট কার্ড প্রিভিউ</p>
                    
                    <div id="print-preview-member-pvc" className="scale-95 origin-center">
                      <div className="w-80 h-[200px] bg-white rounded-2xl border shadow-md relative overflow-hidden flex flex-col justify-between font-sans text-[11px] font-sans">
                        {/* Header card strip */}
                        <div className="p-3 bg-stone-900 text-white flex gap-2 items-center">
                          <div className="w-6.5 h-6.5 rounded-full bg-white flex items-center justify-center text-[10px] scale-90 grow-0 shrink-0">
                            🎖️
                          </div>
                          <div>
                            <h5 className="font-black text-[9px] text-orange-500 uppercase leading-none tracking-tight">গণরাজ একতা সংঘ</h5>
                            <p className="text-[7.5px] text-gray-400 leading-none mt-0.5">২৬শে আমাদের প্রথম প্রয়াস</p>
                          </div>
                        </div>

                        {/* Mid Section body card */}
                        <div className="px-4.5 py-3 flex gap-4 items-center">
                          <div className="w-16 h-19.5 border rounded-md bg-stone-55 flex-none overflow-hidden border-orange-100 shadow-inner">
                            {applications.find(a=>a.id === selectedMemberCard.applicationId)?.photoUrl ? (
                              <img src={applications.find(a=>a.id === selectedMemberCard.applicationId)?.photoUrl} referrerPolicy="referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="w-full h-full text-[8px] flex items-center justify-center text-gray-400">👤 Photo</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-[11.5px] text-gray-900 leading-tight">
                              {applications.find(a=>a.id === selectedMemberCard.applicationId)?.fullNameEnglish || "Member Name"}
                            </h4>
                            <p className="font-bold text-gray-400 text-[9px] leading-none uppercase">ID: <span className="font-black text-green-700">{selectedMemberCard.memberId}</span></p>
                            <p className="text-[9px] text-[#E05A10] leading-none font-bold">পদবী: {selectedMemberCard.designation || "আজীবন সদস্য"}</p>
                            <p className="text-[8.5px] text-gray-400 leading-none">রক্তের গ্রুপ: {applications.find(a=>a.id === selectedMemberCard.applicationId)?.bloodGroup || "O+"}</p>
                          </div>
                        </div>

                        {/* Footer card strip */}
                        <div className="bg-stone-50 border-t p-2 px-3 text-[7.5px] text-gray-400 uppercase tracking-wider flex justify-between font-mono font-bold items-center select-none">
                          <span>BSYF REGISTERED HUB</span>
                          <span>JOINED: {selectedMemberCard.joinedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 w-full">
                      <button
                        onClick={() => {
                          const element = document.getElementById("print-preview-member-pvc");
                          if (!element) return;
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>A4 PVC Print ID: ${selectedMemberCard.memberId}</title>
                                  <style>
                                    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin:0; }
                                    .printable { border: 1px solid #111; padding: 20px; border-radius: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <div class="printable">${element.innerHTML}</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }}
                        className="flex-1 py-2 bg-stone-900 border text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
                      >
                        🖨️ প্রিন্ট করুন (Print A4)
                      </button>
                      <button
                        onClick={() => setSelectedMemberCard(null)}
                        className="px-3.5 py-2 border rounded-lg hover:bg-gray-150 text-gray-500 text-[10px] font-bold cursor-pointer"
                      >
                        ডাউন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 9: CUSTOM STATIC RAW HTML PORTAL BUILDER */}
        {activeMenu === "custom_pages" && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto font-sans text-xs">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form to upload new RAW webpage */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 block">
                  💻 কাস্টম র কোডিং আপলোডার (Raw Upload Static CMS)
                </h3>

                {customPageMsg && (
                  <p className="p-3 bg-orange-50 text-orange-950 font-bold rounded-xl text-[10px] border leading-normal border-orange-100">
                    {customPageMsg}
                  </p>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!customPageSlug || !customPageTitle) {
                      setCustomPageMsg("দয়া করে স্ল্যাগ ও টাইটেল দিন।");
                      return;
                    }
                    try {
                      setLoading(true);
                      await onAddCustomPage(customPageSlug.toLowerCase().trim(), customPageTitle, customPageHtml, customPageCss, customPageJs);
                      setCustomPageMsg("অভিনন্দন! ডেকোরেটিভ কাস্টম পেজ সফলভাবে ডাটাবেজে আপলোড হয়েছে।");
                      setCustomPageSlug("");
                      setCustomPageTitle("");
                      setCustomPageHtml("");
                      setCustomPageCss("");
                      setCustomPageJs("");
                      await onRefresh();
                    } catch (err: any) {
                      setCustomPageMsg("ত্রুটি: " + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-4 text-xs text-gray-650 font-sans"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">পেজ URL স্ল্যাগ (URI Slug) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. puja-festival"
                        className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
                        value={customPageSlug}
                        onChange={(e)=>setCustomPageSlug(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">পেজ মেটা টাইটেল (Page Title) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. পূজা ও উৎসব ২০২৬"
                        className="w-full px-3 py-2 border rounded-xl outline-none"
                        value={customPageTitle}
                        onChange={(e)=>setCustomPageTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">র কাস্টম এইচটিএমএল কোড (HTML Body Code)</label>
                    <textarea
                      rows={5}
                      placeholder="<div><h1>Welcome to Event</h1><p>Our festival details...</p></div>"
                      className="w-full px-3 py-2.5 border rounded-xl outline-none font-mono text-[10.5px] leading-relaxed bg-stone-900 text-stone-200 font-sans"
                      value={customPageHtml}
                      onChange={(e)=>setCustomPageHtml(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">কাস্টম সিএসএস (CSS Code)</label>
                      <textarea
                        rows={3}
                        placeholder="h1 { color: #fe5a00; } p { font-size: 14px; }"
                        className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[10.5px] bg-stone-900 text-stone-200"
                        value={customPageCss}
                        onChange={(e)=>setCustomPageCss(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">কাস্টম জাভাস্ক্রিপ্ট (JS Script / No Tag)</label>
                      <textarea
                        rows={3}
                        placeholder="console.log('Static Page Activated');"
                        className="w-full px-3 py-2 border rounded-xl outline-none font-mono text-[10.5px] bg-stone-900 text-stone-200"
                        value={customPageJs}
                        onChange={(e)=>setCustomPageJs(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#E05A10] text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer text-[10.5px] shadow-sm flex items-center justify-center gap-1"
                  >
                    🚀 পাবলিশ কাস্টম পেইজ (Deploy Custom Static URL)
                  </button>
                </form>
              </div>

              {/* Pages active directory checklist */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 block">
                  🖥️ পাবলিশড কাস্টম পেইজ সমূহ ({customPages.length || 0})
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {customPages.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-xs">
                      আপলোডেড স্যান্ডবক্সড কাস্টম এইচটিএমএল পেইজ খতিয়ানে নেই।
                    </div>
                  ) : (
                    customPages.map((pg) => (
                      <div key={pg.id} className="p-4 border rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-gray-50/50 transition-all text-xs font-sans">
                        <div className="space-y-1 pr-2">
                          <h4 className="font-extrabold text-gray-800 text-[11.5px] select-all">{pg.title}</h4>
                          <span className="text-[10px] font-mono text-gray-400 block break-all">
                            Path: <a href={`/custom-page/${pg.slug}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-extrabold underline">/custom-page/{pg.slug}</a>
                          </span>
                          <span className="text-[8.5px] text-gray-400 font-mono block">Deploy Date: {pg.createdAt.split("T")[0]}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 pb-1 select-none">
                          <a
                            href={`/custom-page/${pg.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg font-black text-[9.5px] uppercase cursor-pointer block"
                          >
                            👁️ লাইভ প্রিভিউ
                          </a>
                          <button
                            onClick={async () => {
                              if (confirm("আপনি কি নিশ্চিতভাবে এই কাস্টম পেইজটি স্যান্ডবক্স থিম থেকে ডিলিট করতে চান?")) {
                                try {
                                  setLoading(true);
                                  await onDeleteCustomPage(pg.id);
                                  alert("কাস্টম পেজ সফলভাবে মুছে ফেলা হয়েছে।");
                                  await onRefresh();
                                } catch (err: any) {
                                  alert("ডিলিট ত্রুটি: " + err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="p-1 px-2.5 text-red-650 hover:bg-red-50 border border-red-200/40 font-bold rounded-lg cursor-pointer text-[10px] bg-white h-full"
                          >
                            🗑️ মুছুন
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: SETTINGS & BRAND BRANDING */}
        {activeMenu === "settings" && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Branded variables controller */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 flex items-center gap-1.5">
                  <Settings className="w-4.5 h-4.5 text-orange-600" />
                  অর্গানাইজেশন তথ্য ও থিম সেটিংস
                </h3>

                <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs text-gray-650">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">অর্গানাইজেশনের পূর্ণ নাম *</label>
                      <input type="text" required className="w-full px-3.5 py-2.5 border rounded-xl outline-none" value={formOrgName} onChange={(e)=>setFormOrgName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">অফিসিয়াল স্লোগান *</label>
                      <input type="text" required className="w-full px-3.5 py-2.5 border rounded-xl outline-none" value={formSlogan} onChange={(e)=>setFormSlogan(e.target.value)} />
                    </div>
                  </div>

                  <div className="border border-orange-100 bg-orange-50/15 p-4 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-orange-900 tracking-wider flex items-center gap-1.5 border-b border-orange-50 pb-2">
                      👤 মাননীয় সভাপতি ও সহ-সভাপতি পরিচিতি সেটিংস
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* President Info */}
                      <div className="space-y-3">
                        <div className="bg-white p-3 border border-gray-100 rounded-xl space-y-1.5">
                          <label className="text-[9px] font-black text-orange-700 uppercase tracking-wider block">মাননীয় সভাপতি নাম *</label>
                          <input type="text" required className="w-full px-3 py-1.5 border rounded-lg outline-none text-xs" value={formPresident} onChange={(e)=>setFormPresident(e.target.value)} />
                        </div>
                        <div className="bg-white p-3 border border-gray-100 rounded-xl space-y-1.5">
                          <label className="text-[9px] font-black text-orange-700 uppercase tracking-wider block">মাননীয় সভাপতি ছবি লিঙ্ক (Photo URL) *</label>
                          <input type="url" required className="w-full px-3 py-1.5 border rounded-lg outline-none text-xs font-mono" placeholder="https://unsplash.com/..." value={formPresidentPhoto} onChange={(e)=>setFormPresidentPhoto(e.target.value)} />
                          {formPresidentPhoto && (
                            <div className="flex items-center gap-2 pt-1.5 border-t border-gray-50">
                              <img src={formPresidentPhoto} className="w-8 h-8 rounded-full object-cover border" alt="President Preview" referrerPolicy="no-referrer" />
                              <span className="text-[9px] text-gray-400">সভাপতির ছবির লাইভ প্রিভিউ</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vice President Info */}
                      <div className="space-y-3">
                        <div className="bg-white p-3 border border-gray-100 rounded-xl space-y-1.5">
                          <label className="text-[9px] font-black text-teal-700 uppercase tracking-wider block">মাননীয় সহ-সভাপতি নাম *</label>
                          <input type="text" required className="w-full px-3 py-1.5 border rounded-lg outline-none text-xs" value={formVicePresident} onChange={(e)=>setFormVicePresident(e.target.value)} />
                        </div>
                        <div className="bg-white p-3 border border-gray-100 rounded-xl space-y-1.5">
                          <label className="text-[9px] font-black text-teal-700 uppercase tracking-wider block">মাননীয় সহ-সভাপতি ছবি লিঙ্ক (Photo URL) *</label>
                          <input type="url" required className="w-full px-3 py-1.5 border rounded-lg outline-none text-xs font-mono" placeholder="https://unsplash.com/..." value={formVicePresidentPhoto} onChange={(e)=>setFormVicePresidentPhoto(e.target.value)} />
                          {formVicePresidentPhoto && (
                            <div className="flex items-center gap-2 pt-1.5 border-t border-gray-50">
                              <img src={formVicePresidentPhoto} className="w-8 h-8 rounded-full object-cover border" alt="Vice President Preview" referrerPolicy="no-referrer" />
                              <span className="text-[9px] text-gray-400">সহ-সভাপতির ছবির লাইভ প্রিভিউ</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">সংঘ পরিচিতি / মূল ল্যান্ডিং বর্ণনা (About Organization)</label>
                    <textarea rows={3} className="w-full px-3.5 py-2.5 border rounded-xl outline-none leading-relaxed" value={formAbout} onChange={(e)=>setFormAbout(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">লক্ষ্য (Mission Statement)</label>
                      <textarea rows={2} className="w-full px-3 py-2 border rounded-xl outline-none" value={formMission} onChange={(e)=>setFormMission(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">দূরদৃষ্টি রূপরেখা (Vision Statement)</label>
                      <textarea rows={2} className="w-full px-3 py-2 border rounded-xl outline-none" value={formVision} onChange={(e)=>setFormVision(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">যোগাযোগ মোবাইল নাম্বার</label>
                      <input type="tel" className="w-full px-3 py-2 border rounded-xl outline-none font-mono" value={formPhone} onChange={(e)=>setFormPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">যোগাযোগ ইমেইল</label>
                      <input type="email" className="w-full px-3 py-2 border rounded-xl outline-none font-mono" value={formEmail} onChange={(e)=>setFormEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">থিম প্রাইমারি কালার</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" className="w-8 h-8 rounded shrink-0 border cursor-pointer" value={formPrimary} onChange={(e)=>setFormPrimary(e.target.value)} />
                        <span className="font-mono text-[10px] text-gray-400">{formPrimary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">লোগো ছবি লিঙ্ক (Logo URL)</label>
                      <input type="url" className="w-full px-3 py-2 border rounded-xl outline-none" value={formLogoUrl} onChange={(e)=>setFormLogoUrl(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">হেডার ব্যানার ছবি লিঙ্ক (Banner URL)</label>
                      <input type="url" className="w-full px-3 py-2 border rounded-xl outline-none" value={formBannerUrl} onChange={(e)=>setFormBannerUrl(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">রেজিস্টার্ড কার্যালয়ের ঠিকানা</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-xl outline-none" value={formAddress} onChange={(e)=>setFormAddress(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">পরিচালনা পরিষদ ও কমিটি বিস্তারিত তথ্য ব্রডশিট</label>
                    <textarea rows={3} placeholder="কমিটির মেম্বারদের বিবরণ এখানে পেস্ট করুন..." className="w-full px-3.5 py-2.5 border rounded-xl outline-none font-sans text-xs leading-normal bg-white" value={formCommittee} onChange={(e)=>setFormCommittee(e.target.value)} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-stone-900 border border-stone-850 hover:bg-stone-950 text-white font-extrabold uppercase rounded-xl tracking-widest cursor-pointer shadow-md text-[11px]"
                  >
                    সেটিংস সংরক্ষণ করুন (Save Settings)
                  </button>
                </form>
              </div>

              {/* Password credentials modifier */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 self-start">
                <h3 className="text-xs font-black uppercase text-gray-850 border-b border-gray-50 pb-3 block">
                  🔐 অ্যাডমিন সিক্রেট পিন পাসওয়ার্ড পরিবর্তন
                </h3>

                {passMsg && (
                  <p className="p-3 bg-amber-50 text-amber-900 rounded-xl text-[10.5px] border leading-normal">
                    {passMsg}
                  </p>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase mb-1">পূর্ববর্তী সিক্রেট কী (Old Password)</label>
                    <input
                      type="password"
                      required
                      placeholder="পুরাতন পিন নম্বর"
                      className="w-full px-3 py-2 border rounded-xl outline-none font-mono tracking-widest text-center"
                      value={oldPass}
                      onChange={(e)=>setOldPass(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block uppercase mb-1">নতুন সিক্রেট কী (New Password)</label>
                    <input
                      type="password"
                      required
                      placeholder="নতুন পিন নম্বর লিখুন"
                      className="w-full px-3 py-2 border rounded-xl outline-none font-mono tracking-widest text-center"
                      value={newPass}
                      onChange={(e)=>setNewPass(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase rounded-xl cursor-pointer text-[10.5px]">
                    পাসওয়ার্ড আপডেট করুন
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
