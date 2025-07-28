import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  try {
    console.log("Testing notification creation...");
    
    // Create a test notification
    await createNotification({
      recipientId: "test-worker-id", // Replace with actual worker ID for testing
      type: "test",
      title: "Notificación de Prueba",
      message: "Esta es una notificación de prueba para verificar que el sistema funciona correctamente.",
      data: {
        testData: "test value"
      }
    });
    
    console.log("Test notification created successfully");
    
    return NextResponse.json({ 
      success: true,
      message: "Test notification created successfully" 
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
