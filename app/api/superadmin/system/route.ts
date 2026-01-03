import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/db/FirebaseAdmin";

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
    const verification = await verifySuperAdmin(request);
    if (!verification.authorized) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    const db = getAdminFirestore();

    // Get collection stats
    const collections = [
      "cuentas",
      "solicitudes",
      "propuestas",
      "notificaciones",
    ];

    const collectionStats = await Promise.all(
      collections.map(async (collName) => {
        try {
          const snapshot = await db.collection(collName).count().get();
          return {
            name: collName,
            documentCount: snapshot.data().count,
          };
        } catch (error) {
          return {
            name: collName,
            documentCount: 0,
          };
        }
      })
    );

    const totalDocuments = collectionStats.reduce(
      (sum, coll) => sum + coll.documentCount,
      0
    );

    // Server health check (basic)
    const serverHealth = {
      status: "healthy" as const,
      uptime: process.uptime(),
      lastChecked: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
    };

    return NextResponse.json({
      success: true,
      database: {
        collections: collectionStats,
        totalDocuments,
      },
      server: serverHealth,
    });
  } catch (error: any) {
    console.error("Error fetching system info:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch system info" },
      { status: 500 }
    );
  }
}
