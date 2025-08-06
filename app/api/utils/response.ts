import "server-only";
import { NextResponse } from 'next/server';

/**
 * Respuestas estandarizadas para la API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  } as ApiResponse<T>);
}

export function createErrorResponse(error: string, status: number = 500) {
  return NextResponse.json({
    success: false,
    error,
    timestamp: new Date().toISOString()
  } as ApiResponse, { status });
}

export function createNotFoundResponse(resource: string = 'Resource') {
  return createErrorResponse(`${resource} not found`, 404);
}

export function createValidationErrorResponse(message: string) {
  return createErrorResponse(`Validation error: ${message}`, 400);
}

export function createConflictResponse(message: string) {
  return createErrorResponse(`Conflict: ${message}`, 409);
}

// Respuestas específicas del negocio
export const ApiResponses = {
  unauthorized: () => createErrorResponse('No autorizado', 401),
  forbidden: (message: string = 'Acceso denegado') => createErrorResponse(message, 403),
  missingFields: (fields: string[]) => createValidationErrorResponse(`Campos requeridos: ${fields.join(', ')}`),
  invalidCredentials: () => createErrorResponse('Credenciales inválidas', 401),
  userNotFound: () => createNotFoundResponse('Usuario'),
  loanNotFound: () => createNotFoundResponse('Préstamo'),
  proposalNotFound: () => createNotFoundResponse('Propuesta'),
  notificationNotFound: () => createNotFoundResponse('Notificación'),
  loanNotAvailable: () => createConflictResponse('La solicitud ya no está disponible'),
  onlyUsersAllowed: () => createErrorResponse('Solo los usuarios pueden acceder a este recurso', 403),
  onlyLendersAllowed: () => createErrorResponse('Solo los lenders pueden acceder a este recurso', 403),
  onlyAdminsAllowed: () => createErrorResponse('Solo los administradores pueden acceder a este recurso', 403),
};
