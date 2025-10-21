import "server-only";
import { NextRequest } from 'next/server';
import { migrateUserRoles } from '@/db/AuthManager';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y que sea admin
    const user = await verifyAuthentication(request);
    
    if (!user) {
      return ApiResponses.unauthorized();
    }
    
    if (user.userType !== 'b_admin') {
      return ApiResponses.forbidden('Solo administradores pueden ejecutar migraciones');
    }
    
    console.log(`🔄 User role migration initiated by admin: ${user.uid}`);
    
    // Ejecutar migración
    const result = await migrateUserRoles();
    
    if (result.success) {
      return createSuccessResponse(
        {
          migratedCount: result.migratedCount,
          errorCount: result.errorCount
        },
        result.message
      );
    } else {
      return createErrorResponse(result.error || 'Error en la migración', 500);
    }
    
  } catch (error) {
    console.error('Error in migration endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return createErrorResponse(`Error interno: ${errorMessage}`);
  }
}