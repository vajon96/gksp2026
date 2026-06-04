import fs from "fs";
import path from "path";
import { DBStructure, OrgSettings, Application, Member, Notice, Event, Donation, CustomPage } from "./src/types";

const DB_PATH = path.join(process.cwd(), "data_cms_db.json");

// Helper to encrypt simple standard password or generate hashes
function hashPassword(pwd: string): string {
  // Simple custom fast sha256 or secure hash simulator for database credentials
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

const DEFAULT_SETTINGS: OrgSettings = {
  orgName: "Sri Krishna Sanatan Seva Federation",
  shortName: "SKSSF",
  slogan: "Unity, Service, and Vedic Dharma",
  about: "The Sri Krishna Sanatan Seva Federation (SKSSF) is a dedicated non-political youth-led organization established to preserve, promote, and propagate the timeless values of Sanatan Dharma. We conduct community services, organize holy festivals, preserve historical temples, and cultivate youth leadership grounded in service, peace, and spiritual harmony.",
  mission: "To empower Sanatana youth with Vedic wisdom, engage in humanitarian relief, maintain ancient architectural heritage, and build an inclusive, spiritually conscious community.",
  vision: "A vibrant, globally connected Sanatana community where truth (Satya), righteousness (Dharma), and service (Seva) inspire holistic progress and peaceful coexistence.",
  presidentName: "Dr. Sri Amitav Mukhopadhyay",
  secretaryName: "Sri Ripon Devnath Shastri",
  address: "Block-B, Sector 4, Banasree, Rampura, Dhaka-1219, Bangladesh",
  contactPhone: "+8801734567890",
  contactEmail: "contact@skssf-portal.org",
  themePrimary: "#E05A10", // Divine Saffron
  themeSecondary: "#800000", // Deep Maroon
  themeGold: "#D4AF37", // Elegant Royal Gold
  footerText: "© 2026 Sri Krishna Sanatan Seva Federation. All Rights Reseved. Developed by AI Studio Portal.",
  bannerUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80", // Beautiful Indian Temple Lit Up At Dusk
  logoUrl: "https://images.unsplash.com/photo-1594125350985-147814c6e9b4?auto=format&fit=crop&w=200&q=80", // Lotus Vector Art Mockup
  socialFacebook: "https://facebook.com/skssf.official",
  socialTwitter: "https://twitter.com/skssf_updates",
  socialYoutube: "https://youtube.com/c/skssf_dharmatalks"
};

// Seed baseline mock database
export function getInitialDB(): DBStructure {
  const initialApps: Application[] = [
    {
      id: "APP-1001",
      status: "approved",
      createdAt: "2026-05-10T10:00:00Z",
      fullNameBangla: "সজন দে",
      fullNameEnglish: "Sajon Dey",
      fatherName: "Prokash Dey",
      motherName: "Sunity Dey",
      dob: "1997-08-15",
      gender: "Male",
      bloodGroup: "O+",
      religion: "Hinduism",
      maritalStatus: "Single",
      nationality: "Bangladeshi",
      nidNumber: "4532890123",
      birthCertificateNumber: "19971234567891234",
      passportNumber: "EE0983145",
      mobileNumber: "01712345678",
      alternativeMobile: "01812345679",
      email: "sajondey102@gmail.com",
      permanentAddress: "Dey Bari, Kali Mandir Road, Sylhet, Bangladesh",
      presentAddress: "Munsipara, Sylhet Sadar, Sylhet, Bangladesh",
      highestQualification: "B.Sc in Computer Science",
      occupation: "Software Engineer",
      workplace: "TechHive Ltd.",
      profession: "IT Services",
      templeName: "Sylhet ISKCON Mandir",
      gotra: "Kashyap",
      mainDeityWorship: "Sri Krishna, Mahadev",
      participationInActivities: "Weekly Gita Path and Arati classes",
      volunteerExperience: "Organized Durga Puja security and distribution of Prasad.",
      prevOrgMembership: "Sanatan Student Association",
      emergencyName: "Prokash Dey",
      emergencyRelationship: "Father",
      emergencyPhone: "01700000001",
      photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=300&q=80",
      signatureUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=150&h=50&q=80", // Simple line vector mimic signature
      nidScanUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80",
      declaration: true
    },
    {
      id: "APP-1002",
      status: "approved",
      createdAt: "2026-05-12T11:30:00Z",
      fullNameBangla: "অনিন্দিতা শর্মা",
      fullNameEnglish: "Anindita Sharma",
      fatherName: "Suresh Sharma",
      motherName: "Rita Sharma",
      dob: "1999-04-22",
      gender: "Female",
      bloodGroup: "A+",
      religion: "Hinduism",
      maritalStatus: "Single",
      nationality: "Bangladeshi",
      nidNumber: "7843210984",
      birthCertificateNumber: "19997843210984511",
      mobileNumber: "01722223333",
      email: "anindita@sharmaclan.net",
      permanentAddress: "Shastri Para, Chattogram, Bangladesh",
      presentAddress: "Chawkbazar, Chattogram, Bangladesh",
      highestQualification: "M.A in Sanskrit Literature",
      occupation: "Teacher",
      workplace: "Sanatan High School",
      profession: "Education",
      templeName: "Chattेश्वरी Kali Mandir",
      gotra: "Bharadwaj",
      mainDeityWorship: "Maa Durga, Maa Saraswati",
      participationInActivities: "Sanskrit recitation & bhajan performances",
      volunteerExperience: "Volunteer teacher for underprivileged children at temple pathshala.",
      prevOrgMembership: "Sri Sri Radha Krishna Youth Forum",
      emergencyName: "Suresh Sharma",
      emergencyRelationship: "Father",
      emergencyPhone: "01722221111",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80",
      signatureUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=150&h=50&q=80",
      nidScanUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80",
      declaration: true
    },
    {
      id: "APP-1003",
      status: "pending",
      createdAt: "2026-06-03T14:45:00Z",
      fullNameBangla: "রাজীব রঞ্জন চৌধুরী",
      fullNameEnglish: "Rajib Ranjan Chowdhury",
      fatherName: "Dinesh Chowdhury",
      motherName: "Saraswati Chowdhury",
      dob: "1995-11-12",
      gender: "Male",
      bloodGroup: "B+",
      religion: "Hinduism",
      maritalStatus: "Married",
      nationality: "Bangladeshi",
      nidNumber: "1234987654",
      birthCertificateNumber: "19951234987654321",
      mobileNumber: "01999888777",
      email: "rajib.r.chowdhury@gmail.com",
      permanentAddress: "Chowdhury Niloy, Faridpur, Bangladesh",
      presentAddress: "Dhanmondi, Dhaka, Bangladesh",
      highestQualification: "MBA",
      occupation: "Banker",
      workplace: "Eastern Bank Ltd",
      profession: "Finance",
      templeName: "Dhakeshwari National Temple",
      gotra: "Sandilya",
      mainDeityWorship: "Lord Shiva, Sri Gopal",
      participationInActivities: "Arati attendee, monthly donor",
      volunteerExperience: "Managed blood donation camps in local regions",
      emergencyName: "Saraswati Chowdhury",
      emergencyRelationship: "Mother",
      emergencyPhone: "01999888111",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
      signatureUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=150&h=50&q=80",
      nidScanUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80",
      declaration: true
    },
    {
      id: "APP-1004",
      status: "rejected",
      rejectionReason: "Incomplete/blurred scanning copy of NID and mismatched Birth Certificate details.",
      createdAt: "2026-05-15T09:15:00Z",
      fullNameBangla: "সুমন সরকার",
      fullNameEnglish: "Suman Sarkar",
      fatherName: "Nirod Sarkar",
      motherName: "Gouri Sarkar",
      dob: "1998-02-28",
      gender: "Male",
      bloodGroup: "AB-",
      religion: "Hinduism",
      maritalStatus: "Single",
      nationality: "Bangladeshi",
      nidNumber: "9988776655",
      birthCertificateNumber: "19989988776655112",
      mobileNumber: "01555444333",
      email: "sumansarkar98@gmail.com",
      permanentAddress: "Mirzapur, Tangail, Bangladesh",
      presentAddress: "Uttara Sector 10, Dhaka, Bangladesh",
      highestQualification: "Diploma",
      occupation: "Freelancer",
      templeName: "Tangail Seva Ashram",
      gotra: "Kashyap",
      mainDeityWorship: "Maa Durga",
      participationInActivities: "Minor participation",
      volunteerExperience: "None",
      emergencyName: "Nirod Sarkar",
      emergencyRelationship: "Father",
      emergencyPhone: "01555444111",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
      signatureUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=150&h=50&q=80",
      nidScanUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80",
      declaration: true
    }
  ];

  const initialMembers: Member[] = [
    {
      memberId: "SKSSF-2026-0001",
      applicationId: "APP-1001",
      username: "sajon.dey",
      passwordText: "OmNamah101", // Auto-generated strong but customizable password
      status: "active",
      designation: "Executive Coordinator",
      joinedDate: "2026-05-11",
      isSelfPasswordChanged: false,
      memberQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED:SKSSF-2026-0001"
    },
    {
      memberId: "SKSSF-2026-0002",
      applicationId: "APP-1002",
      username: "anindita.sharma",
      passwordText: "Sharanam202",
      status: "active",
      designation: "General Member",
      joinedDate: "2026-05-13",
      isSelfPasswordChanged: false,
      memberQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED:SKSSF-2026-0002"
    }
  ];

  const initialNotices: Notice[] = [
    {
      id: "NTC-301",
      title: "Notice regarding Sri Sri Radhashtami festival preparations and Volunteer formation",
      content: "All registered spiritual members of the federation are cordially requested to join the upcoming coordination meeting on Saturday, 6th June 2026, at 4:30 PM in the Head Office mandir hall. We will establish the core festival subcommittee, recruit local volunteers, select coordinators, and plan prasadam distribution routes. Please bring your official SKSSF PVC Identity Cards for verification.",
      date: "2026-06-03",
      category: "festival"
    },
    {
      id: "NTC-302",
      title: "Mandatory PVC Identity Card Download and Verification Link",
      content: "This is to inform all members that the automated PVC Identification Card system is now live. Please log in using the credentials given to you at the time of your application approval. You can view, download, or directly print your standard 300 DPI high-resolution CRM PVC ID card. The QR code on the front and back of the plastic card is fully verifiable at any event gate.",
      date: "2026-05-20",
      category: "administrative"
    },
    {
      id: "NTC-303",
      title: "Weekly Gita Study & Spiritual Dialogue Session Notice",
      content: "By the grace of Sri Bhagavan, our weekly Bhagavad Gita recitation, sloka pronunciation, and theological discussion panel sessions occur every Friday afternoon from 4:00 PM to 6:00 PM. High-quality booklets will be provided free of charge to all children and youth attendees. Pranam, all are requested to participate with family.",
      date: "2026-05-15",
      category: "general"
    }
  ];

  const initialEvents: Event[] = [
    {
      id: "EVT-401",
      title: "Holy Janmashtami Maha-Utsav and Nagar Kirtan Parade 2026",
      description: "Celebrating the glorious appearance of Sri Lord Krishna with grand dynamic tableaus, Vedic dance presentations, extensive Nagar Kirtan parade, spiritual discussions, cultural quizzes for youths, and distributing divine Mahaprasadam to 10,000+ devotees. All members are urged to select a volunteer shift.",
      date: "2026-08-25",
      location: "Dhakeshwari National Temple Complex & Dhaka Streets",
      status: "upcoming",
      volunteerRegistrationActive: true,
      volunteers: ["SKSSF-2026-0001", "SKSSF-2026-0002"]
    },
    {
      id: "EVT-402",
      title: "Maha Shivaratri Jagaran and Harinam Sankirtan Festival 2026",
      description: "Full night of spiritual vigils, singing divine hymns, Vedic Rudrabhishek recitations, and holy bathing services under senior monks. We hosted thousands of night devotees safely. Extensive sanitary camps were handled entirely by our registered youth volunteers.",
      date: "2026-03-05",
      location: "Chandra Nath Dham Temple Hill, Sitakunda, Chattogram",
      status: "completed",
      volunteerRegistrationActive: false,
      volunteers: ["SKSSF-2026-0001"]
    },
    {
      id: "EVT-403",
      title: "Sanatan Youth Leadership Convention & Spiritual Seminar 2026",
      description: "A convergence of Hindu youths, academics, and spiritual pioneers focusing on mental health, community defense, Vedic educational integration, and building charity foundations. Featuring modern bento presentations, brainstorming segments, and expert talks.",
      date: "2026-10-18",
      location: "Dhaka Central Auditorium, Shahbagh, Dhaka",
      status: "upcoming",
      volunteerRegistrationActive: true,
      volunteers: []
    }
  ];

  const initialDonations: Donation[] = [
    {
      id: "DON-501",
      donorName: "Sri Tarun Kumar Ghosh",
      amount: 15000,
      date: "2026-05-25",
      purpose: "Temple Renovation, Sylhet",
      paymentMethod: "Bank Transfer",
      status: "approved",
      mobileNumber: "01711122233"
    },
    {
      id: "DON-502",
      donorName: "Ananya Roy",
      amount: 5000,
      date: "2026-06-01",
      purpose: "Janmashtami Prasadam Distribution",
      paymentMethod: "bKash Money Transfer",
      status: "approved",
      mobileNumber: "01855566677",
      transactionId: "BK9X3J1K8L"
    },
    {
      id: "DON-503",
      donorName: "Dipak Chakraborty",
      amount: 2500,
      date: "2026-06-03",
      purpose: "Youth Gita Path Books Fund",
      paymentMethod: "Nagad Wallet",
      status: "pending",
      mobileNumber: "01544332211",
      transactionId: "NG78G99D3"
    }
  ];

  const initialPages: CustomPage[] = [
    {
      id: "PAG-601",
      slug: "dharmic-laws",
      title: "The Ten Pillars of Sanatana Dharma",
      html: `<div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg my-6">
  <h2 class="text-2xl font-semibold text-amber-900 mb-2 font-serif">Vedic Code of Life</h2>
  <p class="text-amber-800 leading-relaxed mb-4">
    Sanatana Dharma defines a set of eternal ethical values that guide human actions towards ultimate enlightenment. These are described as the ten pillars of righteousness:
  </p>
  <ol class="list-decimal pl-6 space-y-2 text-amber-900 font-medium">
    <li>Dhriti (Patience and determination)</li>
    <li>Kshama (Forgiveness and tolerance)</li>
    <li>Dama (Self-control and mental discipline)</li>
    <li>Asteya (Non-stealing and truthfulness in transactions)</li>
    <li>Shaucham (Purity of body, mind, and intent)</li>
    <li>Indriyanigraha (Sensory regulation)</li>
    <li>Dhi (Intellect and discriminative wisdom)</li>
    <li>Vidya (True sacred knowledge)</li>
    <li>Satya (Absolute truthfulness in speech and deed)</li>
    <li>Akrodha (Freedom from unnecessary anger)</li>
  </ol>
</div>`,
      css: `.bg-amber-50 { background-color: rgb(254, 243, 199); }`,
      js: `console.log("Dharmic pillars page micro-interaction loaded");`,
      createdAt: "2026-05-18T10:00:00Z"
    }
  ];

  return {
    settings: DEFAULT_SETTINGS,
    applications: initialApps,
    members: initialMembers,
    notices: initialNotices,
    events: initialEvents,
    donations: initialDonations,
    customPages: initialPages,
    adminLogs: [
      {
         id: "LOG-1",
         timestamp: "2026-06-04T12:00:00Z",
         username: "superadmin",
         action: "Database initialized with default Hindu CMS parameters",
         ip: "127.0.0.1"
      }
    ],
    visitorCount: 3412,
    adminPasswordHash: hashPassword("Admin@2026#SecurePanel"), // default
    isAdminPasswordChanged: false
  };
}

// Database helper functions using synchronous IO for bullet-proof atomicity in server API requests
export const db = {
  get: (): DBStructure => {
    if (!fs.existsSync(DB_PATH)) {
      if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      }
      const initial = getInitialDB();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    try {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(raw) as DBStructure;
    } catch (e) {
      console.error("Critical error reading database file, returning default schema structures to prevent crashes:", e);
      return getInitialDB();
    }
  },

  save: (data: DBStructure) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Critical error writing to disk file database:", e);
    }
  },

  hash: (pwd: string): string => {
    return hashPassword(pwd);
  }
};
