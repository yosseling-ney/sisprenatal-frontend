import type { Dayjs } from "dayjs";

export type IdentificacionEtnia = "blanca" | "indigena" | "mestiza" | "negra" | "otros";
export type NivelEstudios = "ninguno" | "primaria" | "secundaria" | "universitaria";
export type EstadoCivil =
  | "soltera"
  | "casada"
  | "union_estable"
  | "divorciada"
  | "viuda"
  | "otro";

export interface IdentificacionFormValues {
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha_nacimiento?: Dayjs;
  edad: number;
  etnia: IdentificacionEtnia;
  alfabeta: boolean;
  nivel_estudios: NivelEstudios;
  anio_estudios: number;
  estado_civil: EstadoCivil;
  vive_sola: boolean;
  domicilio: string;
  telefono: string;
  localidad: string;
  establecimiento_salud: string;
  lugar_parto: string;
}

/* ---------------------- TIPOS DE ANTECEDENTES ---------------------- */

export type SiNo = "si" | "no";

export type FracasoMetodo =
  | "no_usaba"
  | "barrera"
  | "diu"
  | "hormonal"
  | "emergencia"
  | "natural";

export type DiabetesTipo = "ninguna" | "tipo I" | "tipo II" | "gestacional";

export interface AntecedentesFamiliares {
  tbc: boolean;
  diabetes: boolean;
  hipertension: boolean;
  preeclampsia: boolean;
  eclampsia: boolean;
  otra_condicion_medica_grave: boolean;
  observaciones?: string;
}

export interface AntecedentesPersonales {
  tbc: boolean;
  diabetes: boolean;
  hipertension: boolean;
  preeclampsia: boolean;
  eclampsia: boolean;
  otra_condicion_medica_grave: boolean;
  violencia: boolean;
  vih: boolean;
  cirugia_genito_urinaria: boolean;
  infertilidad: boolean;
  cardiopatia: boolean;
  nefropatia: boolean;
  antecedente_gemelares?: boolean;
  observaciones?: string;
  diabetes_tipo?: DiabetesTipo;
}

export interface AntecedentesFormValues {
  antecedentes_familiares: AntecedentesFamiliares;
  antecedentes_personales: AntecedentesPersonales;

  gesta_previa: number;
  partos: number;
  cesareas: number;
  vaginales: number;
  abortos: number;
  nacidos_vivos: number;
  nacidos_muertos: number;
  embarazo_ectopico: number;
  hijos_vivos: number;
  muertos_primera_semana: number;
  muertos_despues_semana: number;

  fecha_fin_ultimo_embarazo?: Dayjs;

  embarazo_planeado: SiNo;
  fracaso_metodo_anticonceptivo: FracasoMetodo;

  tiempo_desde_ultimo_embarazo?:
    | "< 1 año"
    | "1 a < 2 años"
    | "2 a < 5 años"
    | ">= 5 años";
}


