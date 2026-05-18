import { School } from '@ubes/types'

export const SCHOOL_OPTIONS: { value: School; label: string }[] = [
  { value: School.HUERTO,     label: 'Instituto Niño Jesús (Huerto)' },
  { value: School.SAN_JOSE,   label: 'Instituto San José' },
  { value: School.NORMAL,     label: 'Escuela Normal Superior' },
  { value: School.ENET,       label: 'Escuela Técnica (ENET)' },
  { value: School.ENA,        label: 'ENA' },
  { value: School.POLIVALENTE,label: 'Polivalente' },
  { value: School.COMERCIAL,  label: 'Escuela de Comercio' },
  { value: School.ROBERTINA,  label: 'Casa Robertina' },
  { value: School.PROA,       label: 'Escuela PROA' },
  { value: School.NACIONAL,   label: 'Colegio Nacional' },
  { value: School.CENMA,      label: 'CENMA' },
  { value: School.MONTESSORI, label: 'Colegio Montessori' },
]
