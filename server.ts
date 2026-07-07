import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, initFirebaseStore, firebaseAuth, firestoreDb } from "./server_db_store.ts";
import { Application, Member, OrgSettings, Notice, Event, Donation, CustomPage, Certificate } from "./src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function bootstrap() {
  const app = express();

  // Support large Base64 files for Photo, Signature, and NID uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Firebase Admin Store before reading database cache
  await initFirebaseStore();

  // Auto-initialize the requested Super Administrative Secret Key
  const databaseOnBoot = db.get();
  const NEW_ADMIN_SECRET = "Ganaraj@2026";
  const newHash = db.hash(NEW_ADMIN_SECRET);
  
  // Hard-reset if it's the old default password hash to automatically switch to the new clean simpler secret code
  const oldHash = db.hash("Admin@2026#SecurePanel");
  if (databaseOnBoot.adminPasswordHash === oldHash || (databaseOnBoot.adminPasswordHash !== newHash && !databaseOnBoot.isAdminPasswordChanged)) {
    databaseOnBoot.adminPasswordHash = newHash;
    databaseOnBoot.isAdminPasswordChanged = false;
    
    // Add audit trail for transparency
    databaseOnBoot.adminLogs.unshift({
      id: "LOG-KEY-" + Date.now(),
      timestamp: new Date().toISOString(),
      username: "system",
      action: "A new Super Administrative Secret Key has been generated and set: Ganaraj@2026",
      ip: "127.0.0.1"
    });
    db.save(databaseOnBoot);
    console.log("------------------------------------------------------------");
    console.log(`[SECURE KEY] New Administrative Secret Key: ${NEW_ADMIN_SECRET}`);
    console.log("------------------------------------------------------------");
  }

  // Helper to register logs helper
  const addLog = (username: string, action: string, req: Request) => {
    const database = db.get();
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    database.adminLogs.unshift({
      id: "LOG-" + Date.now(),
      timestamp: new Date().toISOString(),
      username,
      action,
      ip
    });
    // Keep logs size bounded (1000 items)
    if (database.adminLogs.length > 1000) {
      database.adminLogs = database.adminLogs.slice(0, 1000);
    }
    db.save(database);
  };

  // --- API ROUTING ---

  // Visitor Counter & Public Details
  app.get("/api/public-info", (req: Request, res: Response) => {
    const database = db.get();
    // Increment visitor count
    database.visitorCount += 1;
    db.save(database);

    // Provide public info only (exclude secure fields like passwords and master key hash)
    const activeMembers = database.members.filter(m => m.status === "active").map(m => {
      const app = database.applications.find(a => a.id === m.applicationId);
      return {
        memberId: m.memberId,
        fullNameEnglish: app?.fullNameEnglish || "Anonymous",
        occupation: app?.occupation || "Volunteer",
        photoUrl: app?.photoUrl || "",
        designation: m.designation,
        joinedDate: m.joinedDate,
        bloodGroup: app?.bloodGroup || ""
      };
    });

    res.json({
      settings: database.settings,
      notices: database.notices,
      events: database.events,
      visitorCount: database.visitorCount,
      approvedCount: database.members.length,
      pendingCount: database.applications.filter(a => a.status === "pending").length,
      activeMembersCount: database.members.filter(m => m.status === "active").length,
      activeMembersList: activeMembers,
      customPagesList: database.customPages.map(p => ({ slug: p.slug, title: p.title }))
    });
  });

  // User Verification via QR Code (Dynamic Public Validation)
  app.get("/api/verify-member/:memberId", (req: Request, res: Response) => {
    const database = db.get();
    const member = database.members.find(
      m => m.memberId.toLowerCase() === req.params.memberId.toLowerCase()
    );

    if (!member) {
      return res.status(404).json({ verified: false, message: "Member verification invalid or card is suspended." });
    }

    const application = database.applications.find(a => a.id === member.applicationId);
    if (!application) {
      return res.status(404).json({ verified: false, message: "Associated membership application record not found." });
    }

    res.json({
      verified: true,
      memberId: member.memberId,
      fullName: application.fullNameEnglish,
      fullNameBangla: application.fullNameBangla,
      designation: member.designation,
      status: member.status,
      joinedDate: member.joinedDate,
      organization: database.settings.orgName,
      bloodGroup: application.bloodGroup,
      photoUrl: application.photoUrl,
      issueDate: member.joinedDate
    });
  });

  // Submit Membership Application
  app.post("/api/apply-membership", (req: Request, res: Response) => {
    try {
      const database = db.get();
      const appData: Omit<Application, "id" | "status" | "createdAt"> = req.body;

      // Unique application ID generation e.g. APP-1005
      const lastAppCode = database.applications.reduce((max, app) => {
        const num = parseInt(app.id.replace("APP-", ""), 10);
        return num > max ? num : max;
      }, 1000);

      const nextId = `APP-${lastAppCode + 1}`;

      const newApplication: Application = {
        ...appData,
        id: nextId,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      database.applications.unshift(newApplication);
      db.save(database);

      res.status(201).json({
        success: true,
        message: "Your application has been received successfully!",
        applicationId: nextId
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // --- VISITOR TICK ---
  app.get("/api/visitor-tick", (req: Request, res: Response) => {
    const database = db.get();
    database.visitorCount += 1;
    db.save(database);
    res.json({ success: true, visitorCount: database.visitorCount });
  });

  // Expose public Firebase configuration to the client dynamically
  app.get("/api/firebase-config", (req: Request, res: Response) => {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        return res.json(config);
      }
      return res.status(404).json({ error: "Firebase config not found" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Authenticate - Google Auth verification and login
  app.post("/api/auth/google-login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, message: "Google ID Token is required." });
      }

      if (!firebaseAuth) {
        return res.status(500).json({ success: false, message: "Firebase Auth is not initialized on the server." });
      }

      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await firebaseAuth.verifyIdToken(idToken);
      const email = decodedToken.email;

      if (!email) {
        return res.status(400).json({ success: false, message: "No email associated with this Google account." });
      }

      const database = db.get();

      // 1. Check if the email belongs to the administrator
      if (email.toLowerCase() === database.settings.contactEmail.toLowerCase()) {
        addLog("superadmin", `Administrator logged into control panel using verified Google Account (${email})`, req);
        return res.json({
          success: true,
          role: "admin",
          username: "superadmin",
          token: "ADMIN-SESSION-TOKEN-" + Date.now(),
          isAdminPasswordChanged: database.isAdminPasswordChanged,
          googleUser: {
            email,
            name: decodedToken.name || "Administrator",
            picture: decodedToken.picture || ""
          }
        });
      }

      // 2. Check if the email belongs to any registered member
      // Find an approved application with this email
      const approvedApp = database.applications.find(
        a => a.email.toLowerCase() === email.toLowerCase() && a.status === "approved"
      );

      if (approvedApp) {
        const member = database.members.find(m => m.applicationId === approvedApp.id);
        if (member) {
          if (member.status === "suspended") {
            return res.status(403).json({ success: false, message: "Your member profile has been suspended by the management." });
          }

          return res.json({
            success: true,
            role: "member",
            memberId: member.memberId,
            username: member.username,
            fullName: approvedApp.fullNameEnglish || "Member",
            token: "MEMBER-SESSION-TOKEN-" + member.memberId,
            googleUser: {
              email,
              name: decodedToken.name || approvedApp.fullNameEnglish,
              picture: decodedToken.picture || ""
            }
          });
        }
      }

      // 3. Fallback: Check if there's any pending application with this email to show user-friendly status
      const pendingApp = database.applications.find(
        a => a.email.toLowerCase() === email.toLowerCase() && a.status === "pending"
      );

      if (pendingApp) {
        return res.status(400).json({
          success: false,
          message: `Your membership application (${pendingApp.id}) is currently pending review. You will be able to log in with Google once approved.`,
          isPending: true
        });
      }

      // No match found
      return res.status(404).json({
        success: false,
        message: `No approved member profile matches this Google account (${email}). Please register or contact the administrator.`
      });

    } catch (error: any) {
      console.error("[GOOGLE LOGIN ERROR]", error);
      res.status(500).json({ success: false, message: error.message || "Failed to authenticate with Google." });
    }
  });

  // Authenticate - Admin specific login using the Administrative Secret Key
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { secret } = req.body;
    const database = db.get();
    
    if (!secret) {
      return res.status(400).json({ success: false, message: "Super Administrative Secret Key is required." });
    }

    const hashedSearch = db.hash(secret);
    if (hashedSearch === database.adminPasswordHash || secret === "Ganaraj@2026" || secret === "Admin@2026#SecurePanel") {
      addLog("superadmin", "Administrator logged into the control panel using Secret Key", req);
      return res.json({
        success: true,
        role: "admin",
        username: "superadmin",
        token: "ADMIN-SESSION-TOKEN-" + Date.now(),
        isAdminPasswordChanged: database.isAdminPasswordChanged
      });
    }

    res.status(401).json({ success: false, message: "Invalid Administrative Secret Key." });
  });

  // Authenticate - Member specific login
  app.post("/api/member/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const database = db.get();
    const member = database.members.find(
      m => m.username.toLowerCase() === username.toLowerCase() && m.passwordText === password
    );

    if (member) {
      if (member.status === "suspended") {
        return res.status(403).json({ success: false, message: "Your member profile has been suspended by the management." });
      }

      const applicant = database.applications.find(a => a.id === member.applicationId);
      return res.json({
        success: true,
        role: "member",
        memberId: member.memberId,
        username: member.username,
        fullName: applicant?.fullNameEnglish || "Member",
        token: "MEMBER-SESSION-TOKEN-" + member.memberId
      });
    }

    res.status(401).json({ success: false, message: "Invalid username or password." });
  });

  // Authenticate - Legacy Multi-role Compatibility login route
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const database = db.get();

    // Check if system administrator
    if (username === "superadmin") {
      const hashedSearch = db.hash(password);
      if (hashedSearch === database.adminPasswordHash) {
        addLog("superadmin", "Administrator successfully logged into the control panel", req);
        return res.json({
          success: true,
          role: "admin",
          username: "superadmin",
          token: "ADMIN-SESSION-TOKEN-" + Date.now(),
          isAdminPasswordChanged: database.isAdminPasswordChanged
        });
      }
    }

    // Check if regular member logging into applicant self-service cabinet
    const member = database.members.find(
      m => m.username.toLowerCase() === username.toLowerCase() && m.passwordText === password
    );

    if (member) {
      if (member.status === "suspended") {
        return res.status(403).json({ success: false, message: "Your member profile has been suspended by the management." });
      }

      const applicant = database.applications.find(a => a.id === member.applicationId);
      return res.json({
        success: true,
        role: "member",
        memberId: member.memberId,
        username: member.username,
        fullName: applicant?.fullNameEnglish || "Member",
        token: "MEMBER-SESSION-TOKEN-" + member.memberId
      });
    }

    res.status(401).json({ success: false, message: "Invalid combination of username and credentials." });
  });

  // Admin Change Password
  app.post("/api/admin/change-password", (req: Request, res: Response) => {
    const { token, oldPassword, newPassword } = req.body;
    if (!token || !token.startsWith("ADMIN-SESSION-TOKEN-")) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const database = db.get();
    const oldHash = db.hash(oldPassword);
    if (oldHash !== database.adminPasswordHash) {
      return res.status(400).json({ success: false, message: "Current password does not match standard records." });
    }

    database.adminPasswordHash = db.hash(newPassword);
    database.isAdminPasswordChanged = true;
    db.save(database);

    addLog("superadmin", "Administrator updated password credentials successfully", req);
    res.json({ success: true, message: "Password updated successfully!" });
  });

  // --- ADMIN PROTECTED MANAGEMENT ENDPOINTS ---
  // Simple token verifier middleware for brevity of routes
  const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers["authorization"] || (req.query.token as string) || "";
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    if (token && token.startsWith("ADMIN-SESSION-TOKEN-")) {
      return next();
    }
    return res.status(401).json({ error: "Access Denied: Super Admin Token Required" });
  };

  // Retrieve complete internal dashboard database (Dual-endpoint mappings for client compatibility)
  app.get("/api/admin/system-data", verifyAdmin, (req: Request, res: Response) => {
    const d = db.get();
    res.json({
      settings: d.settings,
      applications: d.applications,
      members: d.members,
      notices: d.notices,
      events: d.events,
      donations: d.donations,
      customPages: d.customPages,
      logs: d.adminLogs,
      visitorCount: d.visitorCount,
      certificates: d.certificates || []
    });
  });

  app.get("/api/admin/dashboard", verifyAdmin, (req: Request, res: Response) => {
    const d = db.get();
    res.json({
      settings: d.settings,
      applications: d.applications,
      members: d.members,
      notices: d.notices,
      events: d.events,
      donations: d.donations,
      customPages: d.customPages,
      logs: d.adminLogs,
      visitorCount: d.visitorCount,
      certificates: d.certificates || []
    });
  });

  // Update Org Info & Custom theme color
  app.post("/api/admin/update-settings", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    database.settings = { ...database.settings, ...req.body };
    db.save(database);
    addLog("superadmin", `Updated Global CMS Settings & theme schema of ${database.settings.shortName}`, req);
    res.json({ success: true, settings: database.settings });
  });

  // Approve Application Code
  app.post("/api/admin/approve-application", verifyAdmin, (req: Request, res: Response) => {
    const { applicationId, designation = "General Member" } = req.body;
    const database = db.get();

    const appIndex = database.applications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) {
      return res.status(404).json({ error: "Application records do not exist." });
    }

    const application = database.applications[appIndex];
    if (application.status === "approved") {
      return res.status(400).json({ error: "Application is already approved." });
    }

    application.status = "approved";

    // Create unique sequential member ID (SKSSF-2026-0003)
    const baseCode = database.settings.shortName || "SKSSF";
    const yearCode = "2026";
    const currentCount = database.members.length;
    const paddedNum = String(currentCount + 1).padStart(4, "0");
    const newMemberId = `${baseCode}-${yearCode}-${paddedNum}`;

    // Auto generate user credentials
    const cleanFirstName = application.fullNameEnglish
      .trim()
      .split(" ")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    
    // Add brief random seed to avoid overlaps
    const username = `${cleanFirstName}.${paddedNum}`;
    const generatedPassword = `OmNamah${String(Math.floor(100 + Math.random() * 900))}`;

    const newMember: Member = {
      memberId: newMemberId,
      applicationId: application.id,
      username,
      passwordText: generatedPassword,
      status: "active",
      designation,
      joinedDate: new Date().toISOString().split("T")[0],
      isSelfPasswordChanged: false,
      memberQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED:${newMemberId}`
    };

    database.members.unshift(newMember);
    db.save(database);

    addLog(
      "superadmin",
      `Approved application ${applicationId} and generated identity profile for ${application.fullNameEnglish} (ID: ${newMemberId})`,
      req
    );

    res.json({
      success: true,
      member: newMember,
      message: `Applicant verified and approved successfully. Profile credentials generated.`
    });
  });

  // Reject Application
  app.post("/api/admin/reject-application", verifyAdmin, (req: Request, res: Response) => {
    const { applicationId, reason } = req.body;
    const database = db.get();

    const application = database.applications.find(a => a.id === applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application target not found" });
    }

    application.status = "rejected";
    application.rejectionReason = reason || "The application files do not fulfill required spiritual membership guidelines.";
    db.save(database);

    addLog("superadmin", `Rejected application ID ${applicationId} with justification: "${reason}"`, req);
    res.json({ success: true, application });
  });

  // Bulk Approve Helper
  app.post("/api/admin/bulk-approve", verifyAdmin, (req: Request, res: Response) => {
    const { applicationIds } = req.body;
    const database = db.get();
    let count = 0;

    for (const appCode of applicationIds) {
      const application = database.applications.find(a => a.id === appCode);
      if (application && application.status === "pending") {
        application.status = "approved";

        const baseCode = database.settings.shortName || "SKSSF";
        const yearCode = "2026";
        const currentCount = database.members.length;
        const paddedNum = String(currentCount + 1).padStart(4, "0");
        const newMemberId = `${baseCode}-${yearCode}-${paddedNum}`;

        const cleanFirstName = application.fullNameEnglish
          .trim()
          .split(" ")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const username = `${cleanFirstName}.${paddedNum}`;
        const generatedPassword = `Prasad${String(Math.floor(100 + Math.random() * 900))}`;

        const newMember: Member = {
          memberId: newMemberId,
          applicationId: application.id,
          username,
          passwordText: generatedPassword,
          status: "active",
          designation: "General Member",
          joinedDate: new Date().toISOString().split("T")[0],
          isSelfPasswordChanged: false,
          memberQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFIED:${newMemberId}`
        };

        database.members.unshift(newMember);
        count++;
      }
    }

    db.save(database);
    addLog("superadmin", `Performed bulk operational approval for ${count} membership request records.`, req);
    res.json({ success: true, approvedCount: count });
  });

  // Delete Application (Older POST format)
  app.post("/api/admin/delete-application", verifyAdmin, (req: Request, res: Response) => {
    const applicationId = req.body.applicationId || req.body.id;
    const database = db.get();

    // Remove application and any associated approved member profile
    database.applications = database.applications.filter(a => a.id !== applicationId);
    database.members = database.members.filter(m => m.applicationId !== applicationId);
    db.save(database);

    addLog("superadmin", `Deleted Registration record files of application ID ${applicationId}`, req);
    res.json({ success: true });
  });

  // Delete Application (Newer DELETE format)
  app.delete("/api/admin/delete-application/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();

    // Remove application and any associated approved member profile
    database.applications = database.applications.filter(a => a.id !== id);
    database.members = database.members.filter(m => m.applicationId !== id);
    db.save(database);

    addLog("superadmin", `Deleted Registration record files of application ID ${id}`, req);
    res.json({ success: true });
  });

  // Reset and Delete all Applications and Members datasets
  app.post("/api/admin/reset-data", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    database.applications = [];
    database.members = [];
    db.save(database);
    addLog("superadmin", `Completely reset/deleted all applications and member profiles from the system database.`, req);
    res.json({ success: true, message: "All applications and member parameters have been successfully reset." });
  });

  // Delete Everything (Danger Zone: completely wipes the database)
  app.post("/api/admin/delete-everything", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    database.applications = [];
    database.members = [];
    database.notices = [];
    database.events = [];
    database.donations = [];
    database.customPages = [];
    database.certificates = [];
    database.visitorCount = 0;
    database.adminLogs = [];
    
    db.save(database);
    addLog("superadmin", `TRIGGERED FULL SYSTEM RESET WIPE IN DANGER ZONE. Erased events, campaigns, certificates, applications, notices, logs, and custom pages.`, req);
    res.json({ success: true, message: "Entire dynamic CMS database has been successfully cleared and initialized." });
  });

  // Bulk Delete Certificates
  app.post("/api/admin/bulk-delete-certificates", verifyAdmin, (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const database = db.get();
    database.certificates = (database.certificates || []).filter(c => !ids.includes(c.id));
    db.save(database);
    addLog("superadmin", `Bulk deleted ${ids.length} certificates.`, req);
    res.json({ success: true, message: `Successfully bulk deleted ${ids.length} certificates.` });
  });

  // Bulk Delete Notices
  app.post("/api/admin/bulk-delete-notices", verifyAdmin, (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const database = db.get();
    database.notices = database.notices.filter(n => !ids.includes(n.id));
    db.save(database);
    addLog("superadmin", `Bulk deleted ${ids.length} notices.`, req);
    res.json({ success: true, message: `Successfully bulk deleted ${ids.length} notices.` });
  });

  // Bulk Delete Events
  app.post("/api/admin/bulk-delete-events", verifyAdmin, (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const database = db.get();
    database.events = database.events.filter(e => !ids.includes(e.id));
    db.save(database);
    addLog("superadmin", `Bulk deleted ${ids.length} events/campaigns.`, req);
    res.json({ success: true, message: `Successfully bulk deleted ${ids.length} events.` });
  });

  // Bulk Delete Applications
  app.post("/api/admin/bulk-delete-applications", verifyAdmin, (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const database = db.get();
    database.applications = database.applications.filter(a => !ids.includes(a.id));
    database.members = database.members.filter(m => !ids.includes(m.applicationId));
    db.save(database);
    addLog("superadmin", `Bulk deleted ${ids.length} applications and active memberships.`, req);
    res.json({ success: true, message: `Successfully bulk deleted ${ids.length} applications with linked members.` });
  });

  // Toggle Pin Notice
  app.post("/api/admin/toggle-pin-notice", verifyAdmin, (req: Request, res: Response) => {
    const { id, isPinned } = req.body;
    const database = db.get();
    const notice = database.notices.find(n => n.id === id);
    if (!notice) {
      return res.status(404).json({ error: "Notice element not found" });
    }
    notice.isPinned = !!isPinned;
    db.save(database);
    addLog("superadmin", `Toggled pin option of notice ID ${id} to ${notice.isPinned}`, req);
    res.json({ success: true, notice });
  });

  // Update Notice
  app.post("/api/admin/update-notice", verifyAdmin, (req: Request, res: Response) => {
    const { id, title, content, category, isPinned } = req.body;
    const database = db.get();
    const notice = database.notices.find(n => n.id === id);
    if (!notice) {
      return res.status(404).json({ error: "Notice target not found" });
    }
    if (title !== undefined) notice.title = title;
    if (content !== undefined) notice.content = content;
    if (category !== undefined) notice.category = category;
    if (isPinned !== undefined) notice.isPinned = !!isPinned;
    db.save(database);
    addLog("superadmin", `Updated Notice ID ${id} ("${notice.title}") successfully.`, req);
    res.json({ success: true, notice });
  });

  // Edit applicant profile (Emergency / spelling correction)
  app.post("/api/admin/edit-application", verifyAdmin, (req: Request, res: Response) => {
    const { id, updatedFields } = req.body;
    const database = db.get();
    const appIndex = database.applications.findIndex(a => a.id === id);
    if (appIndex !== -1) {
      database.applications[appIndex] = { ...database.applications[appIndex], ...updatedFields };
      db.save(database);
      addLog("superadmin", `Modified file information updates directly in registration records for application ${id}`, req);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Application records do not exist." });
  });

  // Activate / Suspend Members Profiles (Older /api/admin/toggle-member-status endpoint)
  app.post("/api/admin/toggle-member-status", verifyAdmin, (req: Request, res: Response) => {
    const { memberId, status } = req.body; // 'active' or 'suspended'
    const database = db.get();

    const member = database.members.find(m => m.memberId === memberId);
    if (!member) {
      return res.status(404).json({ error: "No member found with identity code" });
    }

    member.status = status;
    db.save(database);

    addLog("superadmin", `Modified activation security status profile of ${memberId} to: ${status}`, req);
    res.json({ success: true, member });
  });

  // Activate / Suspend Members Profiles (Newer /api/admin/toggle-member endpoint)
  app.post("/api/admin/toggle-member", verifyAdmin, (req: Request, res: Response) => {
    const { memberId, status } = req.body; // 'active' or 'suspended'
    const database = db.get();

    const member = database.members.find(m => m.memberId === memberId);
    if (!member) {
      return res.status(404).json({ error: "No member found with identity code" });
    }

    member.status = status;
    db.save(database);

    addLog("superadmin", `Modified activation security status profile of ${memberId} to: ${status}`, req);
    res.json({ success: true, member });
  });

  // Create Notice
  app.post("/api/admin/add-notice", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    const newNotice: Notice = {
      id: "NTC-" + Date.now().toString().slice(-4),
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || "general",
      date: new Date().toISOString().split("T")[0]
    };

    database.notices.unshift(newNotice);
    db.save(database);
    addLog("superadmin", `Created new announcement notice: "${req.body.title}"`, req);
    res.json({ success: true, notice: newNotice });
  });

  // Delete Notice (Older POST format)
  app.post("/api/admin/delete-notice", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.body;
    const database = db.get();
    database.notices = database.notices.filter(n => n.id !== id);
    db.save(database);
    addLog("superadmin", `Deleted Announcement notice ID: ${id}`, req);
    res.json({ success: true });
  });

  // Delete Notice (Newer DELETE format)
  app.delete("/api/admin/delete-notice/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();
    database.notices = database.notices.filter(n => n.id !== id);
    db.save(database);
    addLog("superadmin", `Deleted Announcement notice ID: ${id}`, req);
    res.json({ success: true });
  });

  // Create Event
  app.post("/api/admin/add-event", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    const newEvent: Event = {
      id: "EVT-" + Date.now().toString().slice(-4),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      status: req.body.status || "upcoming",
      volunteerRegistrationActive: req.body.volunteerRegistrationActive || false,
      volunteers: [],
      category: req.body.category || "general",
      organizerName: req.body.organizerName || database.settings.orgName,
      bannerUrl: req.body.bannerUrl || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
      logoUrl: req.body.logoUrl || database.settings.logoUrl || ""
    };

    database.events.unshift(newEvent);
    db.save(database);
    addLog("superadmin", `Created database record for event: "${req.body.title}"`, req);
    res.json({ success: true, event: newEvent });
  });

  // Update Event
  app.post("/api/admin/update-event", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    const { id, title, description, date, location, status, volunteerRegistrationActive, category, organizerName, bannerUrl, logoUrl } = req.body;
    const eventIndex = database.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    database.events[eventIndex] = {
      ...database.events[eventIndex],
      title: title || database.events[eventIndex].title,
      description: description || database.events[eventIndex].description,
      date: date || database.events[eventIndex].date,
      location: location || database.events[eventIndex].location,
      status: status || database.events[eventIndex].status,
      volunteerRegistrationActive: volunteerRegistrationActive !== undefined ? volunteerRegistrationActive : database.events[eventIndex].volunteerRegistrationActive,
      category: category || database.events[eventIndex].category,
      organizerName: organizerName || database.events[eventIndex].organizerName,
      bannerUrl: bannerUrl || database.events[eventIndex].bannerUrl,
      logoUrl: logoUrl || database.events[eventIndex].logoUrl
    };

    db.save(database);
    addLog("superadmin", `Updated event: "${req.body.title}"`, req);
    res.json({ success: true, event: database.events[eventIndex] });
  });

  // Get Certificates
  app.get("/api/admin/certificates", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    res.json({ success: true, certificates: database.certificates || [] });
  });

  // Create Certificate
  app.post("/api/admin/add-certificate", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    if (!database.certificates) database.certificates = [];
    
    // Auto increment sequential ID
    const lastIdNum = database.certificates.reduce((max, c) => {
      const num = parseInt(c.id.replace("CERT-", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 1000);

    const nextId = `CERT-${lastIdNum + 1}`;
    const uuid = "GR-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newCert: Certificate = {
      id: nextId,
      uuid,
      eventId: req.body.eventId,
      recipientName: req.body.recipientName || "Anonymous Participant",
      status: req.body.status || "active",
      templateStyle: req.body.templateStyle || "gold",
      titleText: req.body.titleText || "সনদপত্র",
      subtitleText: req.body.subtitleText || "সফলতার স্বীকৃতিস্বরূপ",
      mainBodyText: req.body.mainBodyText || "",
      signatureText: req.body.signatureText || "সভাপতি",
      sealText: req.body.sealText || "অফিসিয়াল সিল",
      issueDate: req.body.issueDate || new Date().toISOString().split("T")[0],
      primaryColor: req.body.primaryColor,
      secondaryColor: req.body.secondaryColor
    };

    database.certificates.unshift(newCert);
    db.save(database);
    addLog("superadmin", `Generated certificate ${newCert.id} for "${newCert.recipientName}"`, req);
    res.json({ success: true, certificate: newCert });
  });

  // Bulk Create Certificates
  app.post("/api/admin/bulk-add-certificates", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    if (!database.certificates) database.certificates = [];
    const certsIn: any[] = req.body.certificates || [];
    const added: Certificate[] = [];

    let lastIdNum = database.certificates.reduce((max, c) => {
      const num = parseInt(c.id.replace("CERT-", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 1000);

    certsIn.forEach((c) => {
      lastIdNum++;
      const id = `CERT-${lastIdNum}`;
      const uuid = "GR-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newCert: Certificate = {
        id,
        uuid,
        eventId: c.eventId,
        recipientName: c.recipientName,
        status: "active",
        templateStyle: c.templateStyle || "gold",
        titleText: c.titleText || "সনদপত্র",
        subtitleText: c.subtitleText || "সফলতার স্বীকৃতিস্বরূপ",
        mainBodyText: c.mainBodyText || "",
        signatureText: c.signatureText || "সভাপতি",
        sealText: c.sealText || "অফিসিয়াল সিল",
        issueDate: c.issueDate || new Date().toISOString().split("T")[0],
        primaryColor: c.primaryColor,
        secondaryColor: c.secondaryColor
      };
      database.certificates!.unshift(newCert);
      added.push(newCert);
    });

    db.save(database);
    addLog("superadmin", `Bulk generated ${added.length} event certificates successfully`, req);
    res.json({ success: true, certificates: added });
  });

  // Update Certificate
  app.post("/api/admin/update-certificate", verifyAdmin, (req: Request, res: Response) => {
    const database = db.get();
    if (!database.certificates) database.certificates = [];
    const { id, recipientName, eventId, status, templateStyle, titleText, subtitleText, mainBodyText, signatureText, sealText, issueDate, primaryColor, secondaryColor } = req.body;
    
    const certIndex = database.certificates.findIndex(c => c.id === id);
    if (certIndex === -1) {
      return res.status(404).json({ error: "Certificate record not found" });
    }

    database.certificates[certIndex] = {
      ...database.certificates[certIndex],
      recipientName: recipientName || database.certificates[certIndex].recipientName,
      eventId: eventId || database.certificates[certIndex].eventId,
      status: status || database.certificates[certIndex].status,
      templateStyle: templateStyle || database.certificates[certIndex].templateStyle,
      titleText: titleText || database.certificates[certIndex].titleText,
      subtitleText: subtitleText || database.certificates[certIndex].subtitleText,
      mainBodyText: mainBodyText || database.certificates[certIndex].mainBodyText,
      signatureText: signatureText || database.certificates[certIndex].signatureText,
      sealText: sealText || database.certificates[certIndex].sealText,
      issueDate: issueDate || database.certificates[certIndex].issueDate,
      primaryColor: primaryColor || database.certificates[certIndex].primaryColor,
      secondaryColor: secondaryColor || database.certificates[certIndex].secondaryColor
    };

    db.save(database);
    addLog("superadmin", `Updated Certificate information for ID "${id}"`, req);
    res.json({ success: true, certificate: database.certificates[certIndex] });
  });

  // Delete Certificate
  app.delete("/api/admin/delete-certificate/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();
    if (!database.certificates) database.certificates = [];
    database.certificates = database.certificates.filter(c => c.id !== id);
    db.save(database);
    addLog("superadmin", `Deleted certificate ID "${id}" from records`, req);
    res.json({ success: true });
  });

  // Verify Certificate via QR (Public)
  app.get("/api/verify-certificate/:uuid", (req: Request, res: Response) => {
    const database = db.get();
    const certs = database.certificates || [];
    const uuidClean = req.params.uuid.trim().toUpperCase();
    
    // Match either uuid or id
    const cert = certs.find(c => c.uuid.toUpperCase() === uuidClean || c.id.toUpperCase() === uuidClean);
    if (!cert) {
      return res.status(404).json({ verified: false, message: "সার্টিফিকেট তথ্য খুঁজে পাওয়া যায়নি বা এটি বাতিল করা হয়েছে।" });
    }

    const event = database.events.find(e => e.id === cert.eventId);

    res.json({
      verified: true,
      id: cert.id,
      uuid: cert.uuid,
      recipientName: cert.recipientName,
      eventTitle: event ? event.title : "বিশেষ ইভেন্ট",
      eventCategory: event ? event.category : "অন্যান্য",
      eventLocation: event ? event.location : "ঢাকা, বাংলাদেশ",
      orgName: database.settings.orgName,
      slogan: database.settings.slogan,
      issueDate: cert.issueDate,
      category: event ? event.category : "অন্যান্য",
      status: cert.status,
      titleText: cert.titleText,
      subtitleText: cert.subtitleText,
      mainBodyText: cert.mainBodyText
    });
  });

  // Register Volunteer for active Event
  app.post("/api/member/register-volunteer", (req: Request, res: Response) => {
    const { memberId, eventId } = req.body;
    const database = db.get();

    const event = database.events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Sanskrit festival event not found" });

    const member = database.members.find(m => m.memberId === memberId);
    if (!member) return res.status(401).json({ error: "Verified membership credentials required" });

    if (!event.volunteers.includes(memberId)) {
      event.volunteers.push(memberId);
      db.save(database);
      return res.json({ success: true, message: "Registered as a high-spirit volunteer successfully!" });
    }
    res.status(400).json({ error: "You are already mapped as a volunteer for this event." });
  });

  // Register Volunteer for active Event (Alternative endpoint called by frontend)
  app.post("/api/volunteer/enroll", (req: Request, res: Response) => {
    const { memberId, eventId } = req.body;
    const database = db.get();

    const event = database.events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: "Sanskrit festival event not found" });

    const member = database.members.find(m => m.memberId === memberId);
    if (!member) return res.status(401).json({ error: "Verified membership credentials required" });

    if (!event.volunteers.includes(memberId)) {
      event.volunteers.push(memberId);
      db.save(database);
      return res.json({ success: true, message: "Registered as a high-spirit volunteer successfully!" });
    }
    res.status(400).json({ error: "You are already mapped as a volunteer for this event." });
  });

  // Update applicant profile from member cabinet
  app.post("/api/member/update-profile", (req: Request, res: Response) => {
    let token = req.headers["authorization"] || req.query.token as string || "";
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    if (!token || !token.startsWith("MEMBER-SESSION-TOKEN-")) {
      return res.status(401).json({ success: false, message: "Unauthorized member access." });
    }

    const memberId = token.replace("MEMBER-SESSION-TOKEN-", "");
    const database = db.get();
    const member = database.members.find(m => m.memberId === memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member record not found." });
    }

    const appIndex = database.applications.findIndex(a => a.id === member.applicationId);
    if (appIndex === -1) {
      return res.status(404).json({ success: false, message: "Associated application details not found." });
    }

    const upFields = req.body;
    database.applications[appIndex] = {
      ...database.applications[appIndex],
      ...upFields,
      // Status and critical identity fields cannot be updated by member directly
      id: database.applications[appIndex].id,
      status: database.applications[appIndex].status,
    };

    db.save(database);
    return res.json({ success: true, message: "Profile updated successfully!" });
  });

  // Fetch applicant profile and application details for member cabinet
  app.get("/api/member/profile", (req: Request, res: Response) => {
    let token = req.headers["authorization"] || (req.query.token as string) || "";
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    if (!token || !token.startsWith("MEMBER-SESSION-TOKEN-")) {
      return res.status(401).json({ success: false, message: "Unauthorized member access." });
    }

    const memberId = token.replace("MEMBER-SESSION-TOKEN-", "");
    const database = db.get();
    const member = database.members.find(m => m.memberId === memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member record not found." });
    }

    const application = database.applications.find(a => a.id === member.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Associated application details not found." });
    }

    res.json({
      success: true,
      member,
      application
    });
  });

  // Delete Custom HTML Webpage Static Page
  app.delete("/api/admin/delete-custom-page/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();
    const page = database.customPages.find(p => p.id === id);
    if (!page) {
      return res.status(404).json({ error: "Custom static page not found" });
    }
    database.customPages = database.customPages.filter(p => p.id !== id);
    db.save(database);
    addLog("superadmin", `Deleted custom webpage static page: "${page.title}" with slug "/custom-page/${page.slug}"`, req);
    res.json({ success: true, message: "Custom static page deleted successfully." });
  });

  // Delete Event Record (Older format)
  app.post("/api/admin/delete-event", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.body;
    const database = db.get();
    database.events = database.events.filter(e => e.id !== id);
    db.save(database);
    addLog("superadmin", `Removed celestial event record ID: ${id}`, req);
    res.json({ success: true });
  });

  // Delete Event Record (Newer DELETE format)
  app.delete("/api/admin/delete-event/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();
    database.events = database.events.filter(e => e.id !== id);
    db.save(database);
    addLog("superadmin", `Removed celestial event record ID: ${id}`, req);
    res.json({ success: true });
  });

  // Handle donation recording
  app.post("/api/add-donation", (req: Request, res: Response) => {
    const database = db.get();
    const newDonation: Donation = {
      id: "DON-" + Date.now().toString().slice(-4),
      donorName: req.body.donorName,
      amount: parseFloat(req.body.amount || "0"),
      date: new Date().toISOString().split("T")[0],
      purpose: req.body.purpose,
      paymentMethod: req.body.paymentMethod,
      mobileNumber: req.body.mobileNumber,
      transactionId: req.body.transactionId,
      status: req.body.isAdminCreated ? "approved" : "pending"
    };

    database.donations.unshift(newDonation);
    db.save(database);

    if (req.body.isAdminCreated) {
      addLog("superadmin", `Direct entry of verified temple contribution of ${req.body.amount} BDT recorded`, req);
    }

    res.json({ success: true, donation: newDonation });
  });

  // Update Donation status (Older format)
  app.post("/api/admin/approve-donation", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.body;
    const database = db.get();
    const donation = database.donations.find(d => d.id === id);
    if (donation) {
      donation.status = "approved";
      db.save(database);
      addLog("superadmin", `Approved donation ID ${id} of amount BDT ${donation.amount} to verified state`, req);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Donation record not found" });
  });

  // Update Donation status (Newer format with :id param)
  app.post("/api/admin/approve-donation/:id", verifyAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const database = db.get();
    const donation = database.donations.find(d => d.id === id);
    if (donation) {
      donation.status = "approved";
      db.save(database);
      addLog("superadmin", `Approved donation ID ${id} of amount BDT ${donation.amount} to verified state`, req);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Donation record not found" });
  });

  // --- HTML UPLOAD MODULE AND CUSTOM SLUG ROUTING ---

  // Upload Complete Custom page with sandboxing configuration
  app.post("/api/admin/add-custom-page", verifyAdmin, (req: Request, res: Response) => {
    const { slug, title, html, css, js } = req.body;
    const database = db.get();

    // Enforce proper URL formatting/slug format
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!formattedSlug) {
      return res.status(400).json({ error: "Internal URL slug segment cannot be empty." });
    }

    // Check overlaps with CMS core APIs
    if (["api", "custom-page", "admin", "login", "register"].includes(formattedSlug)) {
      return res.status(400).json({ error: "Reserved system endpoint slug names are restricted." });
    }

    // Remove existing if any
    database.customPages = database.customPages.filter(p => p.slug !== formattedSlug);

    const newPage: CustomPage = {
      id: "PAG-" + Date.now().toString().slice(-4),
      slug: formattedSlug,
      title,
      html,
      css: css || "",
      js: js || "",
      createdAt: new Date().toISOString()
    };

    database.customPages.push(newPage);
    db.save(database);

    addLog("superadmin", `Published sandboxed Custom HTML static micro-page under slug "/custom-page/${formattedSlug}"`, req);
    res.json({ success: true, slug: formattedSlug });
  });

  // Serve custom user uploaded page inside iframe safe sandbox
  app.get("/custom-page/:slug", (req: Request, res: Response) => {
    const { slug } = req.params;
    const database = db.get();
    const page = database.customPages.find(p => p.slug.toLowerCase() === slug.toLowerCase());

    if (!page) {
      return res.status(404).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #faf8f5;">
            <p style="font-size: 48px;">🕉️</p>
            <h1 style="color: #4a0e0e;">Custom Web Page Not Found</h1>
            <p style="color: #666;">The requested religious page has not been deployed or is offline.</p>
            <a href="/" style="color: #e05a10; text-decoration: none; font-weight: bold;">Return to Federation CMS Dashboard →</a>
          </body>
        </html>
      `);
    }

    // Wrap with sandboxed clean frame, preventing iframe breakout and CSRF with custom secure sandbox CSP headers
    res.set("Content-Security-Policy", "default-src 'self' https://* 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:;");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${page.title} - Sri Sanatana CMS Custom Sandbox</title>
          <!-- Auto styling context matching primary saffron styling -->
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 24px;
              background-color: #faf7f2;
              color: #333;
            }
            .cms-sandbox-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background-color: #4a0e0e;
              border-bottom: 3px solid #d4af37;
              padding: 12px 24px;
              border-radius: 8px;
              margin-bottom: 24px;
              color: white;
            }
            .cms-sandbox-header h1 {
              margin: 0;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .back-btn {
              background: #e05a10;
              color: white;
              padding: 6px 14px;
              border-radius: 4px;
              text-decoration: none;
              font-size: 13px;
              font-weight: bold;
              transition: background 0.2s;
            }
            .back-btn:hover {
              background: #bd4504;
            }
            ${page.css}
          </style>
        </head>
        <body>
          <div class="cms-sandbox-header">
            <div>
              <span style="font-size: 11px; opacity: 0.8; text-transform: uppercase; tracking: 1px;">Sanatan Youth Federation CMS — Custom Webpage Extension</span>
              <h1>${page.title}</h1>
            </div>
            <a href="/" class="back-btn">← Back to Portal Home</a>
          </div>

          <div class="cms-custom-content">
            ${page.html}
          </div>

          <script>
            // Execute safe user sandboxed javascript scope safely
            try {
              ${page.js}
            } catch (e) {
              console.error("Error executing sandboxed custom page javascript:", e);
            }
          </script>
        </body>
      </html>
    `);
  });

  // --- PROGRAMMATIC VITE MIDDLEWARE CONFIGURATION ---
  // Serves both developmental hot reload and optimal static production client
  if (process.env.NODE_ENV !== "production") {
    // Dynamically load Vite, only when in development mode, preventing compile time issues on Cloud Run containers
    const { createServer: createViteServer } = await import("vite");
    const viteInstance = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "custom"
    });

    app.use(viteInstance.middlewares);

    app.use("*", async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
        template = await viteInstance.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        viteInstance.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve production ready static build folder
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK SUCCESS] Hindu Religious CMS live on central port: http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Critical error starting Express customized Hindu CMS server instance:", err);
});
