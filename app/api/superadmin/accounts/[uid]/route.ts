import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/db/FirebaseAdmin";

// Helper to verify super admin access
async function verifySuperAdmin(request: NextRequest): Promise<{ authorized: boolean; uid?: string; error?: string }> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "No authorization token provided" };
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    const db = getAdminFirestore();
    const userDoc = await db.collection("cuentas").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return { authorized: false, error: "User not found" };
    }

    const userData = userDoc.data();
    if (userData?.type !== "super_admin") {
      return { authorized: false, error: "Insufficient permissions. Super admin access required." };
    }

    return { authorized: true, uid: decodedToken.uid };
  } catch (error: any) {
    console.error("Super admin verification error:", error);
    return { authorized: false, error: error.message };
  }
}

// Deactivate (disable) an account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const verification = await verifySuperAdmin(request);
    if (!verification.authorized) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const { uid } = await params;
    const body = await request.json();
    const { action } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    if (uid === verification.uid) {
      return NextResponse.json(
        { error: "Cannot modify your own account" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // Check if user exists
    const userDoc = await db.collection("cuentas").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (action === "deactivate") {
      // Disable user in Firebase Auth
      await auth.updateUser(uid, { disabled: true });
      
      // Update status in Firestore
      await db.collection("cuentas").doc(uid).update({
        isActive: false,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: verification.uid,
      });

      return NextResponse.json({
        success: true,
        message: "Account deactivated successfully",
      });
    } else if (action === "activate") {
      // Enable user in Firebase Auth
      await auth.updateUser(uid, { disabled: false });
      
      // Update status in Firestore
      await db.collection("cuentas").doc(uid).update({
        isActive: true,
        reactivatedAt: new Date().toISOString(),
        reactivatedBy: verification.uid,
      });

      return NextResponse.json({
        success: true,
        message: "Account activated successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'activate' or 'deactivate'" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error modifying account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to modify account" },
      { status: 500 }
    );
  }
}

// Delete an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const verification = await verifySuperAdmin(request);
    if (!verification.authorized) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const { uid } = await params;

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (uid === verification.uid) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // Check if user exists and get their data for logging
    const userDoc = await db.collection("cuentas").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Prevent deletion of super_admin accounts (extra safety)
    if (userData?.type === "super_admin") {
      return NextResponse.json(
        { error: "Cannot delete super admin accounts" },
        { status: 403 }
      );
    }

    // Store deletion log before deleting
    await db.collection("deletion_logs").add({
      deletedUserId: uid,
      deletedUserEmail: userData?.email,
      deletedUserType: userData?.type,
      deletedBy: verification.uid,
      deletedAt: new Date().toISOString(),
      userData: userData, // Store full user data for recovery if needed
    });

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(uid);
    } catch (authError: any) {
      // User might not exist in Auth but exists in Firestore
      console.warn("User not found in Firebase Auth:", authError.message);
    }

    // Delete from Firestore cuentas collection
    await db.collection("cuentas").doc(uid).delete();

    // Delete related solicitudes
    const solicitudesSnapshot = await db.collection("solicitudes").where("userId", "==", uid).get();
    const solicitudIds: string[] = [];
    
    if (!solicitudesSnapshot.empty) {
      const solicitudesBatch = db.batch();
      solicitudesSnapshot.docs.forEach(doc => {
        solicitudIds.push(doc.id);
        solicitudesBatch.delete(doc.ref);
      });
      await solicitudesBatch.commit();
      console.log(`Deleted ${solicitudesSnapshot.size} solicitudes for user ${uid}`);
    }

    // Delete propuestas related to user's solicitudes (by loanId)
    if (solicitudIds.length > 0) {
      // Firestore 'in' query is limited to 30 items, so we need to batch
      for (let i = 0; i < solicitudIds.length; i += 30) {
        const batch = solicitudIds.slice(i, i + 30);
        const propuestasSnapshot = await db.collection("propuestas").where("loanId", "in", batch).get();
        
        if (!propuestasSnapshot.empty) {
          const propuestasBatch = db.batch();
          propuestasSnapshot.docs.forEach(doc => propuestasBatch.delete(doc.ref));
          await propuestasBatch.commit();
          console.log(`Deleted ${propuestasSnapshot.size} propuestas for user ${uid}'s solicitudes`);
        }
      }
    }

    // Also delete propuestas created by this user (if they're a lender)
    const lenderPropuestasSnapshot = await db.collection("propuestas").where("lenderId", "==", uid).get();
    if (!lenderPropuestasSnapshot.empty) {
      const lenderBatch = db.batch();
      lenderPropuestasSnapshot.docs.forEach(doc => lenderBatch.delete(doc.ref));
      await lenderBatch.commit();
      console.log(`Deleted ${lenderPropuestasSnapshot.size} propuestas created by lender ${uid}`);
    }

    // Delete notifications for this user
    const notificationsSnapshot = await db.collection("notifications").where("recipientId", "==", uid).get();
    if (!notificationsSnapshot.empty) {
      const notificationsBatch = db.batch();
      notificationsSnapshot.docs.forEach(doc => notificationsBatch.delete(doc.ref));
      await notificationsBatch.commit();
      console.log(`Deleted ${notificationsSnapshot.size} notifications for user ${uid}`);
    }

    return NextResponse.json({
      success: true,
      message: "Account and all related data deleted successfully",
      deletedData: {
        solicitudes: solicitudesSnapshot.size,
        propuestas: solicitudIds.length > 0 ? "deleted" : 0,
        notifications: notificationsSnapshot.size,
      }
    });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}

// Get single account details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const verification = await verifySuperAdmin(request);
    if (!verification.authorized) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const { uid } = await params;
    const db = getAdminFirestore();
    const auth = getAdminAuth();

    const userDoc = await db.collection("cuentas").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Get Auth info
    let authUser;
    try {
      authUser = await auth.getUser(uid);
    } catch (e) {
      console.warn("User not found in Firebase Auth");
    }

    // Get related data counts
    const solicitudesSnapshot = await db.collection("solicitudes")
      .where("user_id", "==", uid)
      .get();
    
    const propuestasSnapshot = await db.collection("propuestas")
      .where("lender_id", "==", uid)
      .get();

    return NextResponse.json({
      success: true,
      account: {
        uid,
        email: userData?.email || authUser?.email,
        name: userData?.Nombre || userData?.name,
        type: userData?.type,
        Empresa: userData?.Empresa,
        Empresa_id: userData?.Empresa_id,
        phone: userData?.phone,
        address: userData?.address,
        createdAt: authUser?.metadata?.creationTime,
        lastLoginAt: authUser?.metadata?.lastSignInTime,
        disabled: authUser?.disabled || false,
        isActive: !authUser?.disabled,
        solicitudesCount: solicitudesSnapshot.size,
        propuestasCount: propuestasSnapshot.size,
      },
    });
  } catch (error: any) {
    console.error("Error fetching account details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch account details" },
      { status: 500 }
    );
  }
}
