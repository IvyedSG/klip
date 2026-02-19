export type SegmentType = 'competency' | 'trash';

export interface Segment {
  id: string;
  label: string;
  start: number;
  end: number;
  type: SegmentType;
  color: string;
}

export const DEFAULT_COMPETENCY_COLORS: Record<string, string> = {
  'Liderazgo': '#38bdf8',
  'Comunicación': '#a855f7', 
  'Trabajo en Equipo': '#4ade80',
  'Pensamiento Crítico': '#f97316',
  'Adaptabilidad': '#f472b6',
  'Relleno': '#64748b',
};
