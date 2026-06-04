import React from "react";
import { Application, Member, OrgSettings } from "../types.ts";

interface PVCIDCardProps {
  member: Member;
  application: Application;
  settings: OrgSettings;
  customPrimary?: string;
  customSecondary?: string;
  customGold?: string;
}

export const PVCIDCard: React.FC<PVCIDCardProps> = ({
  member,
  application,
  settings,
  customPrimary,
  customSecondary,
  customGold,
}) => {
  const pColor = customPrimary || settings.themePrimary || "#E05A10";
  const sColor = customSecondary || settings.themeSecondary || "#800000";
  const gColor = customGold || settings.themeGold || "#D4AF37";

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4 bg-transparent max-w-full overflow-x-auto md:overflow-x-visible">
      {/* Front Side */}
      <div
        id={`pvc-front-${member.memberId}`}
        className="relative w-[400px] h-[250px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 select-none font-sans shrink-0"
        style={{ boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
      >
        {/* Saffron and Gold top header border */}
        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: pColor }}></div>
        <div className="absolute top-2 left-0 right-0 h-[3px]" style={{ backgroundColor: gColor }}></div>

        {/* Dynamic Abstract Map Background Texture Mock */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <div className="text-[170px] font-serif leading-none">ॐ</div>
        </div>
        <div className="absolute top-12 left-24 right-4 h-full opacity-[0.04] pointer-events-none bg-no-repeat bg-contain" 
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80')` }}>
        </div>

        {/* Outer Elegant Gold thin border */}
        <div className="absolute inset-3 border border-dashed rounded-lg pointer-events-none opacity-40" style={{ borderColor: gColor }}></div>

        <div className="relative h-full w-full p-5 flex flex-col justify-between">
          {/* Header Layout */}
          <div className="flex justify-between items-start mt-1">
            <div className="flex gap-2.5 items-center">
              {/* Dynamic Organization Avatar Icon */}
              <div
                className="w-9 h-9 rounded-full bg-[#fdf2e9] border flex items-center justify-center text-white font-serif font-bold text-lg overflow-hidden shrink-0 shadow-sm"
                style={{ backgroundColor: pColor, borderColor: gColor }}
              >
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  "ॐ"
                )}
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold tracking-tight uppercase leading-none" style={{ color: sColor }}>
                  {settings.orgName}
                </h4>
                <p className="text-[8px] font-bold tracking-[0.12em] uppercase mt-0.5" style={{ color: pColor }}>
                  {settings.slogan || "Unity & Spiritual Service"}
                </p>
              </div>
            </div>
            {/* National Accent Emblem */}
            <span className="text-xs shrink-0 filter opacity-80 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ border: `1px solid ${gColor}`, color: sColor }}>
              {settings.shortName}
            </span>
          </div>

          {/* Member Card Details layout */}
          <div className="flex gap-4 items-end my-1 flex-1">
            {/* Photograph Block */}
            <div className="flex flex-col items-center">
              <div 
                className="w-[74px] h-[92px] bg-gray-100 rounded-md border-2 overflow-hidden shadow-md flex items-center justify-center shrink-0"
                style={{ borderColor: gColor }}
              >
                {application.photoUrl ? (
                  <img src={application.photoUrl} alt="Member" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-400">👤</span>
                )}
              </div>
              <div className="mt-1 text-center">
                <span className="text-[7px] text-gray-400 tracking-wider font-bold uppercase block">MEMBER ID</span>
                <span className="text-[10px] font-mono font-black tracking-tighter" style={{ color: sColor }}>
                  {member.memberId}
                </span>
              </div>
            </div>

            {/* Profile Fields block */}
            <div className="flex-1 flex flex-col justify-between h-[100px] pb-1">
              <div>
                <span className="text-[7px] text-gray-400 font-bold tracking-widest uppercase block mb-0.5">FULL NAME</span>
                <h3 className="text-sm font-extrabold uppercase leading-tight tracking-tight text-gray-800">
                  {application.fullNameEnglish}
                </h3>
                <span className="text-[9px] font-semibold block" style={{ color: pColor }}>
                  {application.fullNameBangla}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase text-white mt-1" style={{ backgroundColor: sColor }}>
                  {member.designation}
                </span>
              </div>

              {/* Row: Blood group, Gotra */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-gray-100 text-[8px]">
                <div>
                  <span className="text-gray-400 block font-bold uppercase">BLOOD GP</span>
                  <span className="text-red-600 font-extrabold">{application.bloodGroup || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">GOTRA</span>
                  <span className="text-gray-700 font-bold truncate block">{application.gotra || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase">JOIN DATE</span>
                  <span className="text-gray-700 font-bold">{member.joinedDate}</span>
                </div>
              </div>
            </div>

            {/* QR Code Anchor */}
            <div className="flex flex-col items-center justify-end h-[100px] pb-1">
              <div className="w-[58px] h-[58px] bg-white border border-gray-200 p-0.5 rounded shadow-sm">
                <img src={member.memberQrCode} alt="Verification QR" className="w-full h-full" />
              </div>
              <span className="text-[6px] text-green-700 font-bold tracking-tighter mt-1 bg-green-50 px-1 rounded animate-pulse border border-green-200">
                ● ACTIVE VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Side */}
      <div
        id={`pvc-back-${member.memberId}`}
        className="relative w-[400px] h-[250px] rounded-2xl shadow-xl overflow-hidden border select-none font-sans text-white shrink-0"
        style={{
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
          backgroundColor: sColor,
          borderColor: pColor,
        }}
      >
        {/* Top Gold and Accent strips */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: pColor }}></div>
        <div className="absolute top-1.5 left-0 right-0 h-[2px]" style={{ backgroundColor: gColor }}></div>

        {/* Thin Gold accent inside margin border */}
        <div className="absolute inset-3 border border-dashed rounded-lg pointer-events-none opacity-20" style={{ borderColor: gColor }}></div>

        {/* Decorative Lotus silhouette watermark */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
          <span className="text-[140px]">🪷</span>
        </div>

        <div className="relative h-full w-full p-6 flex flex-col justify-between">
          {/* Top Section */}
          <div className="flex justify-between items-start border-b border-white/10 pb-2">
            <div>
              <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-none">MEMBERSHIP CARD</p>
              <p className="text-[12px] font-bold mt-0.5" style={{ color: gColor }}>OFFICIAL SPECIFICATIONS</p>
            </div>
            <div className="text-right">
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/30 font-semibold border border-white/10">
                CR-80 PVC 300 DPI
              </span>
            </div>
          </div>

          {/* Core instructions and emergency contact details */}
          <div className="my-2.5 space-y-2 text-[9px] opacity-90">
            <div className="grid grid-cols-1 gap-1">
              <p className="text-gray-300 leading-normal">
                1. This identification card remains the sole property of <span className="font-extrabold text-white">{settings.orgName}</span> and must be surrendered immediately upon executive council request.
              </p>
              <p className="text-gray-300 leading-normal">
                2. If found, please return to: <span className="font-bold text-white">{settings.address}</span> or notify via <span className="font-mono text-white text-[8px]">{settings.contactEmail}</span>.
              </p>
            </div>

            {/* Emergency Info block */}
            <div className="bg-black/30 rounded p-2 border border-white/5 flex justify-between items-center mt-1">
              <div>
                <span className="text-[7.5px] uppercase font-bold text-gray-400 block tracking-wider">EMERGENCY CONTACT</span>
                <span className="font-extrabold text-white text-[9.5px]">{application.emergencyName}</span>
                <span className="text-[8px] text-gray-300 ml-1.5">({application.emergencyRelationship})</span>
              </div>
              <div className="text-right">
                <span className="text-[7.5px] uppercase font-bold text-gray-400 block">PHONE NUMBER</span>
                <span className="font-mono font-bold text-white tracking-widest">{application.emergencyPhone}</span>
              </div>
            </div>
          </div>

          {/* Bottom approvals bar */}
          <div className="flex justify-between items-end mt-1 pt-1.5 border-t border-white/10">
            <div className="text-left">
              <span className="text-[7.5px] text-gray-400 uppercase font-semibold block mb-1">AUTHORIZED SIGNATURE</span>
              <div className="h-6 w-24 border-b border-white/20 relative flex items-center justify-center">
                {/* Handled dynamic or preseeded Admin Signature scan */}
                {application.signatureUrl ? (
                  <img src={application.signatureUrl} alt="Signature" className="h-5 object-contain opacity-80 filter brightness-125" />
                ) : (
                  <span className="font-serif italic text-xs text-amber-200">Amitav Mukhopadhyay</span>
                )}
              </div>
            </div>

            {/* Official seal round label */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center text-[7px] text-center uppercase tracking-tighter leading-none"
                style={{ color: gColor, borderColor: gColor }}
              >
                OFFICIAL<br />SEAL
              </div>
            </div>

            <div className="text-right">
              <span className="text-[7px] text-gray-400 block uppercase">SUPPORT DIRECTORY</span>
              <a href={settings.socialFacebook || "#"} target="_blank" rel="noreferrer" className="text-[9px] font-bold hover:underline" style={{ color: gColor }}>
                {settings.contactPhone || "skssf-portal.org"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MembershipCertificate: React.FC<{
  member: Member;
  application: Application;
  settings: OrgSettings;
  title?: string;
  subText?: string;
  type?: "membership" | "participation" | "volunteer";
}> = ({ member, application, settings, title, subText, type = "membership" }) => {
  const pColor = settings.themePrimary || "#E05A10";
  const sColor = settings.themeSecondary || "#800000";
  const gColor = settings.themeGold || "#D4AF37";

  let certificateTitle = "Membership Certificate";
  let certificateDescription = `This is to officially certify that ${application.fullNameEnglish} (Bangla: ${application.fullNameBangla}) has been approved as an active and verified ${member.designation} of the Sri Krishna Sanatan Seva Federation, holding Identity Code ${member.memberId}. By taking refuge under the sacred principles of truth, righteousness, and spiritual service, they are authorized to participate, vote, and coordinate in all organizational segments.`;
  
  if (type === "volunteer") {
    certificateTitle = "Certificate of Spiritual Volunteerism";
    certificateDescription = `We convey our profound blessings and gratitude to ${application.fullNameEnglish} for their self-sacrificing volunteer service (Seva) and contributions towards historical temple preservations, divine food distribution (Prasadam Seva), and social leadership camps managed under the federation. Wishing them absolute success in spiritual devotion.`;
  } else if (type === "participation") {
    certificateTitle = "Certificate of Festival Participation";
    certificateDescription = `This testimonial is presented with immense joy to ${application.fullNameEnglish} in sincere recognition of active participation, theological debate coordination, and devotional bhajan presentations organized during the holy celebrations of the Janmashtami Maha-Utsav and Nagar Kirtan Parade.`;
  }

  return (
    <div
      id={`certificate-${member.memberId}-${type}`}
      className="relative w-[800px] h-[560px] bg-[#fdfdfb] p-10 border-[16px] rounded-lg border-double shadow-2xl overflow-hidden text-gray-800 font-serif"
      style={{ borderColor: sColor }}
    >
      {/* Decorative Gold Inner Border */}
      <div className="absolute inset-4 border-[2px] pointer-events-none" style={{ borderColor: gColor }}></div>
      <div className="absolute inset-5 border border-dashed pointer-events-none" style={{ borderColor: pColor }}></div>

      {/* Elegant corners */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: gColor }}></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: gColor }}></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: gColor }}></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: gColor }}></div>

      {/* Large watermark symbol centered */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
        <span className="text-[340px]">ॐ</span>
      </div>

      <div className="relative h-full flex flex-col justify-between items-center text-center">
        {/* Header Segment */}
        <div className="space-y-1">
          <div className="flex gap-2 items-center justify-center">
            <span className="text-3xl" style={{ color: pColor }}>ॐ</span>
            <span className="text-xl tracking-widest font-bold uppercase text-gray-500 font-sans">SANATANA TAXILLA</span>
            <span className="text-3xl" style={{ color: pColor }}>ॐ</span>
          </div>
          <h1 className="text-3xl font-black uppercase text-gray-900 tracking-tight leading-tight">
            {settings.orgName}
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] font-sans font-extrabold" style={{ color: pColor }}>
            {settings.slogan || "SERVING DHARMA, ELEVATING SANATANA"}
          </p>
          <p className="text-[10px] text-gray-500 font-sans tracking-wide">
            Registered Head Office: {settings.address}
          </p>
        </div>

        {/* Certificate Callout */}
        <div className="my-3">
          <h2 className="text-4xl font-extrabold italic tracking-tight font-sans text-amber-800" style={{ fontFamily: "Georgia" }}>
            {title || certificateTitle}
          </h2>
          <div className="w-24 h-[2px] mx-auto mt-2 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        </div>

        {/* Dynamic Descriptive Content */}
        <div className="max-w-2xl px-6">
          <p className="text-gray-700 leading-relaxed text-md text-justify font-sans" style={{ textIndent: "1.5rem" }}>
            {subText || certificateDescription}
          </p>
        </div>

        {/* Footers, Seals and Signatures */}
        <div className="w-full flex justify-between items-end px-10 mt-4">
          <div className="text-left font-sans space-y-1 text-xs">
            <p className="text-gray-400 font-bold uppercase text-[9px]">President Designation</p>
            <p className="font-extrabold text-gray-800 border-b border-gray-200 pb-1 w-36">
              {settings.presidentName || "Dr. S. Mukhopadhyay"}
            </p>
            <p className="text-[9px] text-gray-500">Sri President Office Cabinet</p>
          </div>

          {/* Central Gold Medallion Stamp Visual */}
          <div className="relative flex items-center justify-center">
            <div className="w-18 h-18 rounded-full border-4 border-double flex items-center justify-center shadow-lg bg-yellow-50" style={{ borderColor: gColor }}>
              <div className="w-14 h-14 rounded-full border border-dashed flex flex-col items-center justify-center font-sans font-black text-[7px]" style={{ color: sColor, borderColor: gColor }}>
                <span>OFFICIAL</span>
                <span className="text-xs">🪷</span>
                <span>SEAL STAMP</span>
              </div>
            </div>
            <div className="absolute -top-1 font-mono text-[8px] font-bold text-gray-400">CERTIFIED</div>
          </div>

          <div className="text-right font-sans space-y-1 text-xs">
            <p className="text-gray-400 font-bold uppercase text-[9px]">Secretary Signature</p>
            <div className="h-4 relative flex items-center justify-end">
              {application.signatureUrl ? (
                <img src={application.signatureUrl} alt="Signature" className="h-6 object-contain opacity-70 filter brightness-75" />
              ) : (
                <span className="font-serif italic text-xs text-amber-800">Ripon Devnath Shastri</span>
              )}
            </div>
            <p className="font-extrabold text-gray-800 border-t border-gray-200 pt-1 w-36">
              {settings.secretaryName || "S. Ripon Shastri"}
            </p>
            <p className="text-[9px] text-gray-500">General Coordinator</p>
          </div>
        </div>

        {/* Verified Security tag */}
        <div className="text-[8px] font-sans tracking-[0.3em] uppercase text-gray-400 mt-2">
          MEMBER DIRECTORY ID: {member.memberId} • ISSUE STAMP UTC 2026
        </div>
      </div>
    </div>
  );
};
