import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/db/FirebaseAdmin";
import type { AccountInfo, SystemStats } from "@/types/superadmin";

// Helper to verify super admin access
async function verifySuperAdmin(request: NextRequest): Promise<{ authorized: boolean; error?: string }> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "No authorization token provided" };
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is super_admin
    const db = getAdminFirestore();
    const userDoc = await db.collection("cuentas").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return { authorized: false, error: "User not found" };
    }

    const userData = userDoc.data();
    if (userData?.type !== "super_admin") {
      return { authorized: false, error: "Insufficient permissions. Super admin access required." };
    }

    return { authorized: true };
  } catch (error: any) {
    console.error("Super admin verification error:", error);
    return { authorized: false, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify super admin access
    const verification = await verifySuperAdmin(request);
    if (!verification.authorized) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();
    const auth = getAdminAuth();

    // Fetch all accounts from Firestore
    const accountsSnapshot = await db.collection("cuentas").get();
    const accounts: AccountInfo[] = [];

    // Get Firebase Auth users to check disabled status
    const listUsersResult = await auth.listUsers(1000);
    const authUsersMap = new Map(
      listUsersResult.users.map(user => [user.uid, user])
    );

    for (const doc of accountsSnapshot.docs) {
      const data = doc.data();
      const authUser = authUsersMap.get(doc.id);

      accounts.push({
        uid: doc.id,
        email: data.email || authUser?.email || null,
        name: data.Nombre || data.name || "Sin nombre",
        type: data.type || "user",
        Empresa: data.Empresa,
        Empresa_id: data.Empresa_id,
        createdAt: authUser?.metadata?.creationTime || data.createdAt,
        lastLoginAt: authUser?.metadata?.lastSignInTime || data.lastLoginAt,
        isActive: !authUser?.disabled,
        disabled: authUser?.disabled || false,
        phone: data.phone,
        address: data.address,
      });
    }

    // Calculate stats
    const solicitudesSnapshot = await db.collection("solicitudes").get();
    const propuestasSnapshot = await db.collection("propuestas").get();

    const solicitudes = solicitudesSnapshot.docs.map(doc => doc.data());
    const pendingSolicitudes = solicitudes.filter(s => s.status === "pending" || !s.status).length;
    const approvedSolicitudes = solicitudes.filter(s => s.status === "approved" || s.status === "accepted").length;
    const rejectedSolicitudes = solicitudes.filter(s => s.status === "rejected").length;

    // Calculate recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = accounts.filter(acc => {
      if (!acc.createdAt) return false;
      const createdDate = new Date(acc.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Calculate recent logins (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const recentLogins = accounts.filter(acc => {
      if (!acc.lastLoginAt) return false;
      const loginDate = new Date(acc.lastLoginAt);
      return loginDate >= oneDayAgo;
    }).length;

    const stats: SystemStats = {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(acc => !acc.disabled).length,
      disabledAccounts: accounts.filter(acc => acc.disabled).length,
      accountsByType: {
        super_admin: accounts.filter(acc => acc.type === "super_admin").length,
        b_admin: accounts.filter(acc => acc.type === "b_admin").length,
        b_sale: accounts.filter(acc => acc.type === "b_sale").length,
        user: accounts.filter(acc => acc.type === "user").length,
      },
      totalSolicitudes: solicitudesSnapshot.size,
      totalPropuestas: propuestasSnapshot.size,
      pendingSolicitudes,
      approvedSolicitudes,
      rejectedSolicitudes,
      recentSignups,
      recentLogins,
    };

    return NextResponse.json({
      success: true,
      accounts,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching super admin data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
