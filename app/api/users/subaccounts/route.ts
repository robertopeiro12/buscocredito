import "server-only";
import { NextRequest } from 'next/server';
import { create_subaccount_doc } from '@/db/FirestoreFunc';
import { create_subaccount } from '@/db/FireAuthFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(req);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Solo administradores pueden crear subcuentas
    if (user.userType !== 'b_admin') {
      return ApiResponses.onlyAdminsAllowed();
    }

    const { name, email, password, userId, Empresa } = await req.json();
    
    // Verificar que el userId coincida con el usuario autenticado
    if (userId !== user.uid) {
      return ApiResponses.forbidden('Solo puedes crear subcuentas para tu empresa');
    }

    // Validar campos requeridos
    const validation = validateRequiredFields(
      { name, email, password, userId, Empresa },
      ['name', 'email', 'password', 'userId', 'Empresa']
    );
    
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const newUser = await create_subaccount(name, email, password);
    
    if (newUser.status !== 200) {
      return createErrorResponse(newUser.error || 'Error al crear subcuenta');
    }
    
    if (newUser.userId) {
      const account = await create_subaccount_doc(name, email, userId, newUser.userId, Empresa);
      if (account.status !== 200) {
        return createErrorResponse(account.error || 'Error al crear documento de subcuenta');
      }
    }
    
    console.log(`Admin ${user.uid} created subcuenta for ${email}`);
    return createSuccessResponse(
      { userId: newUser.userId }, 
      'Subcuenta creada exitosamente'
    );
  } catch (error) {
    console.error('Error in createSubaccount:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
