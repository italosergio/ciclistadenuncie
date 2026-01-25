import { API_ENDPOINTS } from "../config/API_ENDPOINTS";

interface Coordenadas {
  lat: number;
  lng: number;
}

export async function buscarEnderecoPorCoordenadas(coords: Coordenadas): Promise<string> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.NOMINATIM_REVERSE}?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`
    );
    const data = await response.json();
    const addr = data.address;
    
    const rua = addr.road || addr.pedestrian || addr.footway || '';
    const numero = addr.house_number || '';
    const bairro = addr.suburb || addr.neighbourhood || '';
    const cidade = addr.city || addr.town || addr.municipality || '';
    const estado = addr.state || '';
    
    const partes = [];
    if (rua) partes.push(numero ? `${rua}, ${numero}` : rua);
    if (bairro) partes.push(bairro);
    if (cidade) partes.push(cidade);
    if (estado) partes.push(estado);
    
    return partes.join(' - ') || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  } catch {
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  }
}

export async function buscarCidadePorNome(nomeCidade: string) {
  const response = await fetch(
    `${API_ENDPOINTS.NOMINATIM_SEARCH}?city=${encodeURIComponent(nomeCidade)}&country=Brazil&format=json&limit=1`
  );
  return await response.json();
}
