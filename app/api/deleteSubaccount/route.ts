import { type NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/db/FirebaseAdmin";
import { delete_subaccount_doc } from "@/db/FirestoreFunc";
import { delete_subaccount } from "@/db/FireAuthFunc";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere el ID del usuario" },
        { status: 400 }
      );
    }

    // Initialize admin
    await initAdmin();

    // First delete the user from Authentication
    const authResult = await delete_subaccount(userId);
    if (authResult.status !== 200) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Then delete the document from Firestore
    const firestoreResult = await delete_subaccount_doc(userId);
    if (firestoreResult.status !== 200) {
      return NextResponse.json(
        { error: firestoreResult.error },
        { status: firestoreResult.status }
      );
    }

    // If both operations were successful
    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}