import fs from "fs";
import path from "path";
import { DBStructure, OrgSettings, Application, Member, Notice, Event, Donation, CustomPage } from "./src/types";
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

export let firestoreDb: any = null;
export let firebaseAuth: any = null;

const DB_PATH = path.join(process.cwd(), "data_cms_db.json");

export async function initFirebaseStore() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      
      const adminApp = getApps().length === 0 
        ? initializeApp({ projectId: config.projectId })
        : getApp();

      firestoreDb = getFirestore(adminApp, config.firestoreDatabaseId);
      firebaseAuth = getAuth(adminApp);
      console.log("[FIREBASE] Firebase Admin SDK initialized successfully with projectId:", config.projectId);
      
      // Sync local cache on boot with Firestore
      const docRef = firestoreDb.collection("cms_database").doc("main");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const firestoreData = docSnap.data();
        if (firestoreData) {
          console.log("[FIREBASE] Loading latest state from Firestore into local cache...");
          fs.writeFileSync(DB_PATH, JSON.stringify(firestoreData, null, 2), "utf8");
        }
      } else {
        console.log("[FIREBASE] First boot: creating baseline document in Firestore...");
        const localData = db.get();
        await docRef.set(localData);
      }
    } else {
      console.warn("[FIREBASE] firebase-applet-config.json not found. Firestore replication bypassed.");
    }
  } catch (error) {
    console.error("[FIREBASE] Error initializing Firebase Administration:", error);
  }
}

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
  themePrimary: "#2563EB", // Rich Modern Blue
  themeSecondary: "#1E3A8A", // Deep Dark Navy
  themeGold: "#D4AF37", // Bright Gold
  footerText: "© 2026 গণরাজ একতা সংঘ। সর্বস্বত্ব সংরক্ষিত।",
  bannerUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80", // Energetic team or community center
  logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80", // Modern corporate vector placeholder or team icon
  socialFacebook: "https://facebook.com/ganaraj.ekta",
  socialTwitter: "https://twitter.com/ganaraj_ekta",
  socialYoutube: "https://youtube.com/c/ganaraj_ekta"
};

// Seed baseline mock database
export function getInitialDB(): DBStructure {
  const initialApps: Application[] = [];

  const initialMembers: Member[] = [];

  const initialNotices: Notice[] = [];

  const initialEvents: Event[] = [];

  const initialDonations: Donation[] = [
    {
      id: "DON-501",
      donorName: "স্বেচ্ছাসেবী অনুদান",
      amount: 10000,
      date: "2026-05-25",
      purpose: "বার্ষিক ক্রীড়া প্রতিযোগিতা সফলকরণ",
      paymentMethod: "bKash Transfer",
      status: "approved",
      mobileNumber: "01700000000"
    }
  ];

  const initialPages: CustomPage[] = [];

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
         action: "Database reset and initialized for Ganaraj Ekta Sangha CMS",
         ip: "127.0.0.1"
      }
    ],
    visitorCount: 3412,
    adminPasswordHash: hashPassword("Admin@2026#SecurePanel"), // default
    isAdminPasswordChanged: false,
    certificates: []
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
      
      // Asynchronously replicate state to Firestore
      if (firestoreDb) {
        // 1. Replicate complete main document state
        firestoreDb.collection("cms_database").doc("main").set(data)
          .then(() => {
            console.log("[FIREBASE] State successfully replicated to Firestore main document.");
          })
          .catch((err: any) => {
            console.error("[FIREBASE] Failed to replicate state to Firestore main document:", err);
          });
          
        // 2. Sync individual collections asynchronously
        const syncCollections = async () => {
          // Sync settings
          await firestoreDb.collection("settings").doc("main").set(data.settings);
          
          // Sync visitorCount
          await firestoreDb.collection("analytics").doc("visitors").set({ visitorCount: data.visitorCount });

          // Sync applications
          for (const app of data.applications) {
            await firestoreDb.collection("applications").doc(app.id).set(app);
          }
          
          // Sync members
          for (const m of data.members) {
            await firestoreDb.collection("members").doc(m.memberId).set(m);
          }
          
          // Sync notices
          for (const n of data.notices) {
            await firestoreDb.collection("notices").doc(n.id).set(n);
          }
          
          // Sync events
          for (const e of data.events) {
            await firestoreDb.collection("events").doc(e.id).set(e);
          }
          
          // Sync donations
          for (const d of data.donations) {
            await firestoreDb.collection("donations").doc(d.id).set(d);
          }
          
          // Sync customPages
          for (const cp of data.customPages) {
            await firestoreDb.collection("customPages").doc(cp.slug).set(cp);
          }
        };

        syncCollections().catch((err) => {
          console.error("[FIREBASE] Collection sync warning:", err);
        });
      }
    } catch (e) {
      console.error("Critical error writing to disk file database:", e);
    }
  },

  hash: (pwd: string): string => {
    return hashPassword(pwd);
  }
};
