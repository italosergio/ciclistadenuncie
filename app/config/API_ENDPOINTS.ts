export const API_ENDPOINTS = {
  IBGE_MUNICIPIOS: 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios',
  NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
  NOMINATIM_SEARCH: 'https://nominatim.openstreetmap.org/search',
} as const;

export const TILE_LAYERS = {
  STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  LIGHT: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;
