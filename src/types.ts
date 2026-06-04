/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OrgSettings {
  orgName: string;
  shortName: string;
  slogan: string;
  about: string;
  mission: string;
  vision: string;
  presidentName: string;
  secretaryName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  themePrimary: string;
  themeSecondary: string;
  themeGold: string;
  footerText: string;
  bannerUrl: string;
  logoUrl: string;
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;
}

export interface Application {
  id: string; // e.g. APP-1001
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;

  // Personal Info
  fullNameBangla: string;
  fullNameEnglish: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  religion: string;
  maritalStatus: string;
  nationality: string;

  // Identity
  nidNumber: string;
  birthCertificateNumber: string;
  passportNumber?: string;

  // Contact
  mobileNumber: string;
  alternativeMobile?: string;
  email: string;
  permanentAddress: string;
  presentAddress: string;

  // Educational & Professional
  highestQualification: string;
  occupation: string;
  workplace?: string;
  profession?: string;

  // Religious Info
  templeName: string;
  gotra?: string;
  mainDeityWorship: string;
  participationInActivities: string;
  volunteerExperience: string;
  prevOrgMembership?: string;

  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Uploads
  photoUrl: string; // Base64 or local URL
  signatureUrl: string; // Base64 or local URL
  nidScanUrl: string; // Base64 or local URL
  additionalDocsUrl?: string; // Base64 or local URL

  declaration: boolean;
}

export interface Member {
  memberId: string; // BSYF-2026-0001
  applicationId: string; // Link to registration form
  username: string;
  passwordText: string; // Auto-generated credentials shown to applicant
  status: 'active' | 'suspended';
  designation: string; // General Member, Executive Committee Member, etc.
  joinedDate: string;
  isSelfPasswordChanged: boolean;
  memberQrCode: string; // QR code data URL
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string; // general, festival, administrative
  attachmentUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'upcoming' | 'completed';
  volunteerRegistrationActive: boolean;
  volunteers: string[]; // member IDs registered
}

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  purpose: string;
  paymentMethod: string; // bKash, Nagad, Card, etc.
  status: 'pending' | 'approved';
  mobileNumber: string;
  transactionId?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  ip: string;
}

export interface DBStructure {
  settings: OrgSettings;
  applications: Application[];
  members: Member[];
  notices: Notice[];
  events: Event[];
  donations: Donation[];
  customPages: CustomPage[];
  adminLogs: AdminLog[];
  visitorCount: number;
  adminPasswordHash: string; // SHA-256 or bcrypt salt
  isAdminPasswordChanged: boolean;
}
