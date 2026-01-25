import { API_ENDPOINTS } from "../config/API_ENDPOINTS";

export async function buscarCidadesIBGE() {
  const response = await fetch(API_ENDPOINTS.IBGE_MUNICIPIOS);
  const data = await response.json();
  return data
    .filter((m: any) => m.microrregiao?.mesorregiao?.UF?.sigla)
    .map((m: any) => `${m.nome} - ${m.microrregiao.mesorregiao.UF.sigla}`);
}
