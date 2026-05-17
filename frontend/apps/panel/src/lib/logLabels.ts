import type { Action, ResourceType } from '@ubes/types'

export const SYSTEM_UUID = '00000000-0000-0000-0000-000000000000'

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  USER: 'Usuario',
  EVENT: 'Evento',
  COMPETITION: 'Competencia',
  COMPETITION_PARTICIPANT: 'Participante',
  COMPETITION_RESULT: 'Resultado',
  POST: 'Anuncio',
  DOCUMENT: 'Documento',
  SUGGESTION: 'Sugerencia',
  SUGGESTION_VOTE: 'Voto de Sugerencia',
  PUNISHMENT: 'Sanción',
  LOG: 'Registro',
}

export const ACTION_LABELS: Record<Action, string> = {
  CREATE: 'Crear',
  UPDATE: 'Actualizar',
  DELETE: 'Borrar',
  ROLL_BACK: 'Reestablecer',
  LOG_IN: 'Inicio',
  LOG_OUT: 'Desconexión',
  ADD: 'Agregar',
  REMOVE: 'Remover',
}
