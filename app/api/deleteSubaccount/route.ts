// app/api/deleteSubaccount/route.ts
import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { delete_subaccount_doc, verify_subaccount } from '@/db/FirestoreFunc';
import { delete_auth_user } from '@/db/FireAuthFunc';  // Asumiendo que tienes esta función

export async function POST(req: NextRequest) {
    const { subaccountId, email } = await req.json();

    if (!subaccountId || !email) {
        return NextResponse.json(
            { error: "Se requiere ID y email de la subcuenta" },
            { status: 400 }
        );
    }

    try {
        await initAdmin();

        // Verificar existencia
        const verifyResult = await verify_subaccount(subaccountId);
        if (!verifyResult.exists) {
            return NextResponse.json(
                { error: 'La subcuenta no existe' },
                { status: 404 }
            );
        }

        // Eliminar de Auth
        const authResult = await delete_auth_user(email);
        if (authResult.status !== 200) {
            return NextResponse.json(
                { error: authResult.error },
                { status: 500 }
            );
        }

        // Eliminar de Firestore
        const deleteResult = await delete_subaccount_doc(subaccountId);
        if (deleteResult.status !== 200) {
            return NextResponse.json(
                { error: deleteResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Subcuenta eliminada correctamente' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error en deleteSubaccount:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la subcuenta' },
            { status: 500 }
        );
    }
}