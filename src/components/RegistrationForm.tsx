import React, { useState } from "react";
import { Application } from "../types.ts";

interface RegistrationFormProps {
  onSubmit: (appData: Omit<Application, "id" | "status" | "createdAt">) => void;
  lang: "en" | "bn";
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, lang }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullNameBangla: "",
    fullNameEnglish: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "O+",
    religion: "Hinduism",
    maritalStatus: "Single",
    nationality: "Bangladeshi",
    nidNumber: "",
    birthCertificateNumber: "",
    passportNumber: "",
    mobileNumber: "",
    alternativeMobile: "",
    email: "",
    permanentAddress: "",
    presentAddress: "",
    highestQualification: "",
    occupation: "",
    workplace: "",
    profession: "",
    templeName: "",
    gotra: "",
    mainDeityWorship: "",
    participationInActivities: "",
    volunteerExperience: "",
    prevOrgMembership: "",
    emergencyName: "",
    emergencyRelationship: "Father",
    emergencyPhone: "",
    photoUrl: "",
    signatureUrl: "",
    nidScanUrl: "",
    additionalDocsUrl: "",
    declaration: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper dictionary
  const dict = {
    en: {
      personalInfo: "Personal Information",
      identityInfo: "Identity Documents",
      contactInfo: "Contact Details",
      eduProf: "Education & Profession",
      religiousInfo: "Religious Profile",
      emergencyUploads: "Emergency & Uploads",
      fullNameBangla: "Full Name (Bangla)",
      fullNameEnglish: "Full Name (English)",
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      dob: "Date of Birth",
      gender: "Gender",
      bloodGroup: "Blood Group",
      religion: "Religion",
      maritalStatus: "Marital Status",
      nationality: "Nationality",
      nidNumber: "National ID (NID) Number",
      birthCertificate: "Birth Certificate Number",
      passportOptional: "Passport Number (Optional)",
      mobileNumber: "Mobile Number",
      altMobile: "Alternative Mobile",
      email: "Email Address",
      permAddress: "Permanent Address",
      presAddress: "Present Address",
      highestQualification: "Highest Academic Qualification",
      occupation: "Current Occupation",
      workplace: "Workplace / Institution Name",
      profession: "Profession Sector",
      templeName: "Local Temple Name associated with",
      gotra: "Ancestral Gotra (Optional)",
      mainDeity: "Main Deity Worshipped",
      participation: "Religious Activity Detail",
      volunteer: "Volunteer Experience Details",
      prevOrg: "Previous Organization (Optional)",
      emergencyName: "Emergency Contact Person",
      emergencyRel: "Relationship with Contact",
      emergencyPhone: "Emergency Phone Number",
      photoUpload: "Passport Size Photograph (Max 2MB)",
      signatureUpload: "Your Digital Signature (Max 1MB)",
      nidScan: "NID / Birth Certificate Scan Page",
      additionalDocs: "Additional Credentials / Testimonials (Optional)",
      declaration: "I hereby solemnly declare that all statements made in this registration form are true, complete, and authentic to the best of my spiritual knowledge.",
      prev: "Back Room",
      next: "Continue",
      submit: "Submit Verified Application",
      reqField: "This credential field is required to process membership eligibility.",
      mustDec: "You must declare and affirm the authenticity check.",
    },
    bn: {
      personalInfo: "ব্যক্তিগত তথ্য",
      identityInfo: "পরিচয় নথি বিবরণ",
      contactInfo: "যোগাযোগের ঠিকানা",
      eduProf: "শিক্ষা ও পেশা",
      religiousInfo: "ধার্মিক প্রোফাইল",
      emergencyUploads: "জরুরী যোগাযোগ ও আপলোড",
      fullNameBangla: "পূর্ণ নাম (বাংলায়)",
      fullNameEnglish: "পূর্ণ নাম (ইংরেজিতে)",
      fatherName: "পিতার নাম",
      motherName: "মাতার নাম",
      dob: "জন্ম তারিখ",
      gender: "লিঙ্গ",
      bloodGroup: "রক্তের গ্রুপ",
      religion: "ধর্ম",
      maritalStatus: "বৈবাহিক অবস্থা",
      nationality: "জাতীয়তা",
      nidNumber: "জাতীয় পরিচয়পত্র (NID) নম্বর",
      birthCertificate: "জন্ম নিবন্ধন নম্বর",
      passportOptional: "পাসপোর্ট নম্বর (ঐচ্ছিক)",
      mobileNumber: "মোবাইল নম্বর",
      altMobile: "বিকল্প মোবাইল নম্বর",
      email: "ইমেইল ঠিকানা",
      permAddress: "স্থায়ী ঠিকানা",
      presAddress: "বর্তমান ঠিকানা",
      highestQualification: "সর্বোচ্চ শিক্ষাগত যোগ্যতা",
      occupation: "বর্তমান পেশা/অবস্থান",
      workplace: "কর্মস্থল / প্রতিষ্ঠানের নাম",
      profession: "পেশার খাত",
      templeName: "সংশ্লিষ্ট স্থানীয় মন্দিরের নাম",
      gotra: "গোত্র (ঐচ্ছিক)",
      mainDeity: "প্রধান উপাস্য দেব-দেবী",
      participation: "ধার্মিক কাজে অংশগ্রহণের তথ্য",
      volunteer: "স্বেচ্ছাসেবী কাজের অভিজ্ঞতা",
      prevOrg: "পূর্ববর্তী সংগঠন (ঐচ্ছিক)",
      emergencyName: "জরুরী যোগাযোগ ব্যক্তির নাম",
      emergencyRel: "জরুরী যোগাযোগের সম্পর্ক",
      emergencyPhone: "জরুরী ফোন নম্বর",
      photoUpload: "পাসপোর্ট সাইজের ছবি (সর্বোচ্চ ২ মেগাবাইট)",
      signatureUpload: "ডিজিটাল স্বাক্ষর স্ক্যান (সর্বোচ্চ ১ মেগাবাইট)",
      nidScan: "এনআইডি / জন্ম নিবন্ধন স্ক্যান কপি",
      additionalDocs: "অন্যান্য প্রশংসাপত্র / ডকুমেন্ট সমূহ (ঐচ্ছিক)",
      declaration: "আমি এতদ্বারা ঘোষণা করছি যে এই সদস্যপদ আবেদনপত্রে প্রদত্ত সকল তথ্য আমার জ্ঞান ও বিশ্বাস মতে সম্পূর্ণ সত্য, নির্ভুল এবং আইনানুগ।",
      prev: "পূর্ববর্তী",
      next: "পরবর্তী ধাপ",
      submit: "আবেদনপত্র জমা দিন",
      reqField: "সদস্যপদ প্রক্রিয়া করার জন্য এই তথ্য প্রদান করা বাধ্যতামূলক।",
      mustDec: "আপনাকে অবশ্যই সত্যতা ঘোষণাটি স্বীকার করতে হবে।",
    },
  }[lang];

  // Secure File to Base64 reader for offline/sandbox durability
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullNameBangla.trim()) newErrors.fullNameBangla = dict.reqField;
      if (!formData.fullNameEnglish.trim()) newErrors.fullNameEnglish = dict.reqField;
      if (!formData.fatherName.trim()) newErrors.fatherName = dict.reqField;
      if (!formData.motherName.trim()) newErrors.motherName = dict.reqField;
      if (!formData.dob) newErrors.dob = dict.reqField;
    }
    if (step === 2) {
      if (!formData.nidNumber.trim() && !formData.birthCertificateNumber.trim()) {
        newErrors.identity = lang === "en" 
          ? "You must provide either an NID Number or a Birth Certificate Number for authentication." 
          : "নিবন্ধনের জন্য একটি এনআইডি অথবা জন্ম নিবন্ধন নম্বর প্রদান করা আবশ্যক।";
      }
    }
    if (step === 3) {
      if (!formData.mobileNumber.trim()) newErrors.mobileNumber = dict.reqField;
      if (!formData.email.trim()) newErrors.email = dict.reqField;
      if (!formData.permanentAddress.trim()) newErrors.permanentAddress = dict.reqField;
      if (!formData.presentAddress.trim()) newErrors.presentAddress = dict.reqField;
    }
    if (step === 4) {
      if (!formData.highestQualification.trim()) newErrors.highestQualification = dict.reqField;
      if (!formData.occupation.slice(0, 4).trim()) newErrors.occupation = dict.reqField;
    }
    if (step === 5) {
      if (!formData.templeName.trim()) newErrors.templeName = dict.reqField;
      if (!formData.mainDeityWorship.trim()) newErrors.mainDeityWorship = dict.reqField;
    }
    if (step === 6) {
      if (!formData.emergencyName.trim()) newErrors.emergencyName = dict.reqField;
      if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = dict.reqField;
      if (!formData.photoUrl) newErrors.photoUrl = lang === "en" ? "Profile photo upload is mandated." : "প্রোফাইল ছবি আপলোড করা আবশ্যক।";
      if (!formData.signatureUrl) newErrors.signatureUrl = lang === "en" ? "Signature scan upload is mandated." : "স্বাক্ষর স্ক্যান আপলোড করা আবশ্যক।";
      if (!formData.declaration) newErrors.declaration = dict.mustDec;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((p) => p + 1);
    }
  };

  const handleBack = () => {
    setStep((p) => p - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      onSubmit(formData);
    }
  };

  const textClass = `text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-600 block`;
  const inputClass = `w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 focus:border-[#E05A10] focus:ring-1 focus:ring-[#E05A10]/30 transition-all outline-none`;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 md:p-10 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-gray-100 pb-6 mb-8 text-center">
        <h3 className="text-2xl font-black text-gray-900 leading-tight">
          {lang === "en" ? "Sanatan Devotee Membership Form" : "সনাতন ভক্ত সদস্যপদ আবেদন ফরম"}
        </h3>
        <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide">
          {lang === "en" 
            ? "Provide verified information aligned with state identity documents." 
            : "রাষ্ট্রীয় পরিচয় পত্র অনুযায়ী সতর্কতার সাথে নিশ্চিত তথ্য প্রদান করুন।"}
        </p>

        {/* Step Progression Indicators */}
        <div className="flex justify-between items-center max-w-lg mx-auto mt-6 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 select-none transition-all duration-300 ${
                step === idx
                  ? "bg-[#E05A10] text-white border-[#E05A10] scale-110 shadow-md shadow-[#E05A10]/20"
                  : step > idx
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-400 border-gray-100"
              }`}
            >
              {idx}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-lg mx-auto text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-2.5">
          <span>{lang === "en" ? "Personal" : "ব্যক্তিগত"}</span>
          <span>{lang === "en" ? "Identity" : "নথিপত্র"}</span>
          <span>{lang === "en" ? "Contact" : "যোগাযোগ"}</span>
          <span>{lang === "en" ? "Career" : "পেশা"}</span>
          <span>{lang === "en" ? "Dharmic" : "ধর্মীয়"}</span>
          <span>{lang === "en" ? "Uploads" : "সংযুক্তি"}</span>
        </div>
      </div>

      {/* STEP 1: Personal Details */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.personalInfo}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={textClass}>{dict.fullNameEnglish} *</label>
              <input
                type="text"
                placeholder="e.g. Sajon Dey"
                className={inputClass}
                value={formData.fullNameEnglish}
                onChange={(e) => setFormData({ ...formData, fullNameEnglish: e.target.value })}
              />
              {errors.fullNameEnglish && <p className="text-[11px] text-red-500 mt-1">{errors.fullNameEnglish}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.fullNameBangla} *</label>
              <input
                type="text"
                placeholder="উদা: সজন দে"
                className={inputClass}
                value={formData.fullNameBangla}
                onChange={(e) => setFormData({ ...formData, fullNameBangla: e.target.value })}
              />
              {errors.fullNameBangla && <p className="text-[11px] text-red-500 mt-1">{errors.fullNameBangla}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.fatherName} *</label>
              <input
                type="text"
                className={inputClass}
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              />
              {errors.fatherName && <p className="text-[11px] text-red-500 mt-1">{errors.fatherName}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.motherName} *</label>
              <input
                type="text"
                className={inputClass}
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              />
              {errors.motherName && <p className="text-[11px] text-red-500 mt-1">{errors.motherName}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.dob} *</label>
              <input
                type="date"
                className={inputClass}
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
              {errors.dob && <p className="text-[11px] text-red-500 mt-1">{errors.dob}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={textClass}>{dict.gender}</label>
                <select
                  className={inputClass}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">{lang === "en" ? "Male" : "পুরুষ"}</option>
                  <option value="Female">{lang === "en" ? "Female" : "মহিলা"}</option>
                  <option value="Other">{lang === "en" ? "Other" : "অন্যান্য"}</option>
                </select>
              </div>
              <div>
                <label className={textClass}>{dict.bloodGroup}</label>
                <select
                  className={inputClass}
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={textClass}>{dict.maritalStatus}</label>
              <select
                className={inputClass}
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              >
                <option value="Single">{lang === "en" ? "Single" : "অবিবাহিত"}</option>
                <option value="Married">{lang === "en" ? "Married" : "বিবাহিত"}</option>
                <option value="Widowed">{lang === "en" ? "Widowed" : "বিপত্নীক/বিধবা"}</option>
              </select>
            </div>
            <div>
              <label className={textClass}>{dict.nationality}</label>
              <input
                type="text"
                className={inputClass}
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Identity Documents */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.identityInfo}
          </h4>
          <p className="text-xs text-gray-500 bg-orange-50 border-l-2 border-orange-500 p-3 rounded">
            {lang === "en" 
              ? "Please supply either your National ID or Birth Registration Certificate. High fidelity check is done prior to pvc card stamp authorization."
              : "দয়া করে আপনার জাতীয় পরিচয়পত্র নম্বর অথবা ডিজিটাল জন্ম নিবন্ধন নম্বর দিন। অনুমোদন প্রদানের পূর্বে সত্যতা যাচাই করা হবে।"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={textClass}>{dict.nidNumber}</label>
              <input
                type="text"
                placeholder="e.g. 4532890123"
                className={inputClass}
                value={formData.nidNumber}
                onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
              />
            </div>
            <div>
              <label className={textClass}>{dict.birthCertificate}</label>
              <input
                type="text"
                placeholder="e.g. 19971234567891234"
                className={inputClass}
                value={formData.birthCertificateNumber}
                onChange={(e) => setFormData({ ...formData, birthCertificateNumber: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.passportOptional}</label>
              <input
                type="text"
                placeholder="e.g. EE0983145"
                className={inputClass}
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              />
            </div>
          </div>
          {errors.identity && <p className="text-xs font-bold text-red-500 bg-red-50 p-2.5 rounded border border-red-200 mt-2">{errors.identity}</p>}
        </div>
      )}

      {/* STEP 3: Contact Details */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.contactInfo}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={textClass}>{dict.mobileNumber} *</label>
              <input
                type="tel"
                placeholder="e.g. 01712345678"
                className={inputClass}
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
              {errors.mobileNumber && <p className="text-[11px] text-red-500 mt-1">{errors.mobileNumber}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.altMobile}</label>
              <input
                type="tel"
                className={inputClass}
                value={formData.alternativeMobile}
                onChange={(e) => setFormData({ ...formData, alternativeMobile: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.email} *</label>
              <input
                type="email"
                placeholder="e.g. sajondey102@gmail.com"
                className={inputClass}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.presAddress} *</label>
              <textarea
                rows={3}
                placeholder="Present Address"
                className={inputClass}
                value={formData.presentAddress}
                onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
              />
              {errors.presentAddress && <p className="text-[11px] text-red-500 mt-1">{errors.presentAddress}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.permAddress} *</label>
              <textarea
                rows={3}
                placeholder="Permanent Address"
                className={inputClass}
                value={formData.permanentAddress}
                onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
              />
              {errors.permanentAddress && <p className="text-[11px] text-red-500 mt-1">{errors.permanentAddress}</p>}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Education & Profession */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.eduProf}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={textClass}>{dict.highestQualification} *</label>
              <input
                type="text"
                placeholder="e.g. B.Sc in Computer Science"
                className={inputClass}
                value={formData.highestQualification}
                onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
              />
              {errors.highestQualification && <p className="text-[11px] text-red-500 mt-1">{errors.highestQualification}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.occupation} *</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer / Student"
                className={inputClass}
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
              {errors.occupation && <p className="text-[11px] text-red-500 mt-1">{errors.occupation}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.workplace}</label>
              <input
                type="text"
                placeholder="e.g. TechHive Ltd."
                className={inputClass}
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
              />
            </div>
            <div>
              <label className={textClass}>{dict.profession}</label>
              <input
                type="text"
                placeholder="e.g. IT Services / Education"
                className={inputClass}
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Religious Information */}
      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.religiousInfo}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={textClass}>{dict.templeName} *</label>
              <input
                type="text"
                placeholder="e.g. Sylhet ISKCON Mandir"
                className={inputClass}
                value={formData.templeName}
                onChange={(e) => setFormData({ ...formData, templeName: e.target.value })}
              />
              {errors.templeName && <p className="text-[11px] text-red-500 mt-1">{errors.templeName}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.gotra}</label>
              <input
                type="text"
                placeholder="e.g. Kashyap"
                className={inputClass}
                value={formData.gotra}
                onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.mainDeity} *</label>
              <input
                type="text"
                placeholder="e.g. Sri Radha Krishna"
                className={inputClass}
                value={formData.mainDeityWorship}
                onChange={(e) => setFormData({ ...formData, mainDeityWorship: e.target.value })}
              />
              {errors.mainDeityWorship && <p className="text-[11px] text-red-500 mt-1">{errors.mainDeityWorship}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.participation}</label>
              <textarea
                rows={2}
                placeholder="Weekly Arati, Geeta Paath study, etc."
                className={inputClass}
                value={formData.participationInActivities}
                onChange={(e) => setFormData({ ...formData, participationInActivities: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.volunteer}</label>
              <textarea
                rows={2}
                placeholder="Durga Puja management, distributing Prasad"
                className={inputClass}
                value={formData.volunteerExperience}
                onChange={(e) => setFormData({ ...formData, volunteerExperience: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={textClass}>{dict.prevOrg}</label>
              <input
                type="text"
                className={inputClass}
                value={formData.prevOrgMembership}
                onChange={(e) => setFormData({ ...formData, prevOrgMembership: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Emergency details Declaration & File Uploads */}
      {step === 6 && (
        <div className="space-y-6 animate-fadeIn">
          <h4 className="text-sm font-bold text-[#800000] border-l-3 border-[#E05A10] pl-2.5 uppercase tracking-wider mb-4">
            {dict.emergencyUploads}
          </h4>

          {/* Emergency Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-100 p-5 rounded-2xl mb-4">
            <div className="md:col-span-3 pb-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Emergency Contact Info</span>
            </div>
            <div>
              <label className={textClass}>{dict.emergencyName} *</label>
              <input
                type="text"
                className={inputClass}
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
              {errors.emergencyName && <p className="text-[11px] text-red-500 mt-1">{errors.emergencyName}</p>}
            </div>
            <div>
              <label className={textClass}>{dict.emergencyRel}</label>
              <select
                className={inputClass}
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              >
                <option value="Father">{lang === "en" ? "Father" : "পিতা"}</option>
                <option value="Mother">{lang === "en" ? "Mother" : "মাতা"}</option>
                <option value="Spouse">{lang === "en" ? "Spouse" : "স্বামী / স্ত্রী"}</option>
                <option value="Brother">{lang === "en" ? "Brother" : "ভাই"}</option>
                <option value="Sister">{lang === "en" ? "Sister" : "বোন"}</option>
                <option value="Uncle">{lang === "en" ? "Uncle" : "চাচা/মামা"}</option>
              </select>
            </div>
            <div>
              <label className={textClass}>{dict.emergencyPhone} *</label>
              <input
                type="tel"
                className={inputClass}
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
              {errors.emergencyPhone && <p className="text-[11px] text-red-500 mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>

          {/* Uploads Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo loader */}
            <div>
              {formData.photoUrl ? (
                <div id="photo-loaded-container" className="border border-solid border-green-200 bg-green-50/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px]">
                  <span className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide flex items-center gap-1">✔ {lang === "en" ? "Photo Selected" : "ছবি যুক্ত হয়েছে"}</span>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-green-300 shadow-sm mb-3 bg-white">
                    <img src={formData.photoUrl} alt="Photo Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Remove / Clear" : "ছবিটি মুছুন 🗑"}
                  </button>
                </div>
              ) : (
                <div id="photo-picker-container" className="border border-dashed border-gray-200 hover:border-[#E05A10]/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-orange-50/10 transition-all min-h-[160px] relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="photo-file-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, "photoUrl")}
                  />
                  <span className="text-3xl mb-2">👤</span>
                  <span className="text-xs font-bold text-gray-700 block mb-1">{dict.photoUpload} *</span>
                  <span className="text-[10px] font-medium text-gray-400 tracking-wide">ক্লিক করে ছবি সিলেক্ট করুন <br />(Click to select/snap photograph)</span>
                </div>
              )}
              {errors.photoUrl && <p className="text-[11px] font-bold text-red-500 mt-2 text-center">{errors.photoUrl}</p>}
            </div>

            {/* Signature loader */}
            <div>
              {formData.signatureUrl ? (
                <div id="signature-loaded-container" className="border border-solid border-green-200 bg-green-50/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px]">
                  <span className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide flex items-center gap-1">✔ {lang === "en" ? "Signature Selected" : "স্বাক্ষর যুক্ত হয়েছে"}</span>
                  <div className="relative w-36 h-12 rounded overflow-hidden border border-green-300 shadow-sm mb-3 bg-white flex items-center justify-center p-1">
                    <img src={formData.signatureUrl} alt="Signature Preview" className="h-full max-w-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, signatureUrl: "" }))}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Remove / Clear" : "স্বাক্ষর মুছুন 🗑"}
                  </button>
                </div>
              ) : (
                <div id="signature-picker-container" className="border border-dashed border-gray-200 hover:border-[#E05A10]/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-orange-50/10 transition-all min-h-[160px] relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="signature-file-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, "signatureUrl")}
                  />
                  <span className="text-3xl mb-2">🖊️</span>
                  <span className="text-xs font-bold text-gray-700 block mb-1">{dict.signatureUpload} *</span>
                  <span className="text-[10px] font-medium text-gray-400 tracking-wide">ডিজিটাল স্বাক্ষর সিলেক্ট করুন <br />(Click to upload signature scan)</span>
                </div>
              )}
              {errors.signatureUrl && <p className="text-[11px] font-bold text-red-500 mt-2 text-center">{errors.signatureUrl}</p>}
            </div>

            {/* NID File loader */}
            <div className="md:col-span-2">
              {formData.nidScanUrl ? (
                <div id="nidscan-loaded-container" className="border border-solid border-green-200 bg-green-50/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px]">
                  <span className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide flex items-center gap-1">✔ {lang === "en" ? "Document Selected" : "দলিলপত্র যুক্ত হয়েছে"}</span>
                  <div className="relative max-w-md w-full h-32 rounded overflow-hidden border border-green-300 shadow-sm mb-3 bg-white flex items-center justify-center p-1 mx-auto">
                    <img src={formData.nidScanUrl} alt="NID Scan Preview" className="h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, nidScanUrl: "" }))}
                    className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-extrabold uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {lang === "en" ? "Remove / Clear Document" : "ডকুমেন্ট মুছে ফেলুন 🗑"}
                  </button>
                </div>
              ) : (
                <div id="nidscan-picker-container" className="border border-dashed border-gray-200 hover:border-[#E05A10]/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-orange-50/10 transition-all min-h-[160px] relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="nidscan-file-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, "nidScanUrl")}
                  />
                  <span className="text-3xl mb-2">📠</span>
                  <span className="text-xs font-bold text-gray-700 block mb-1">{dict.nidScan} *</span>
                  <span className="text-[10px] font-medium text-gray-400 tracking-wide">এনআইডি বা জন্ম নিবন্ধন কাগজের ছবি দিন <br />(Click to select NID/Birth Certificate scan file)</span>
                </div>
              )}
            </div>
          </div>

          {/* Declaration Checkbox */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#E05A10] rounded border-gray-300 mt-0.5 shrink-0"
                checked={formData.declaration}
                onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
              />
              <span className="text-xs text-gray-600 leading-normal font-semibold">
                {dict.declaration}
              </span>
            </label>
            {errors.declaration && <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 p-2 rounded inline-block">{errors.declaration}</p>}
          </div>
        </div>
      )}

      {/* Back and Forth navigation controls */}
      <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
        {step > 1 && (
          <button
            type="button"
            className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-sm transition-all hover:bg-gray-50 uppercase tracking-wider"
            onClick={handleBack}
          >
            ← {dict.prev}
          </button>
        )}
        {step < 6 ? (
          <button
            type="button"
            className="px-8 py-3 bg-[#E05A10] hover:bg-[#bd4504] text-white font-extrabold rounded-xl text-sm leading-none flex items-center gap-2 shadow-lg shadow-[#E05A10]/20 ml-auto uppercase tracking-wide cursor-pointer"
            onClick={handleNext}
          >
            {dict.next} →
          </button>
        ) : (
          <button
            type="submit"
            className="px-10 py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-sm leading-none flex items-center gap-2 shadow-lg shadow-green-600/20 ml-auto uppercase tracking-wide cursor-pointer"
          >
            {dict.submit} ✔
          </button>
        )}
      </div>
    </form>
  );
};
