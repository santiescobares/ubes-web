import { FileType } from '@ubes/types'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function fileTypeLabel(fileType: FileType): string {
  const map: Record<FileType, string> = {
    PDF:    'PDF',
    WORD:   'DOC',
    WORDX:  'DOCX',
    EXCEL:  'XLS',
    EXCELX: 'XLSX',
    PNG:    'PNG',
    JPG:    'JPG',
    JPEG:   'JPEG',
  }
  return map[fileType]
}

export const DOCUMENT_ACCEPT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg']
export const DOCUMENT_MAX_SIZE_MB = 25
