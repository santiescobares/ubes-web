const errorDictionary: Record<string, string> = {
  // Auth
  INVALID_TOKEN:            'El token de Google no es válido o expiró. Intentá de nuevo.',
  INACTIVE_USER:            'Tu cuenta está suspendida y no puede acceder al panel.',
  UNAUTHORIZED_OPERATION:   'No tenés permiso para realizar esta operación.',

  // General
  INVALID_OPERATION:        'Operación inválida. Intentá de nuevo.',
  INVALID_ARGUMENT:         'Los datos enviados son inválidos.',
  THIRD_PARTY_EXCEPTION:    'Error al comunicarse con un servicio externo. Intentá de nuevo.',

  // Resources
  RESOURCE_NOT_FOUND:       'El recurso solicitado no existe.',
  RESOURCE_ALREADY_EXISTS:  'El recurso que intentás crear ya existe.',
}

const FALLBACK = 'Ocurrió un error inesperado. Intentá de nuevo.'

export function getErrorMessage(errorCode?: string): string {
  if (!errorCode) return FALLBACK
  return errorDictionary[errorCode] ?? FALLBACK
}
