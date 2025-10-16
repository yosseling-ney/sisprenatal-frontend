import React, { useState, useCallback, useMemo } from 'react';
import type { FormInstance } from 'antd'; // 👈 añadimos el tipo de antd
import { ClipboardCheck, History, HeartHandshake, Syringe, Calendar, Wrench, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';


/* ===================== Tipos ===================== */

interface FieldProps {
  label: string;
  name: keyof AntecedentesData;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  min?: number;
  disabled?: boolean;
  className?: string;
}

type DiabetesTipo = 'ninguna' | 'tipo I' | 'tipo II' | 'gestacional';
type UltimoPrevioPeso = '< 2500g' | 'normal/n/c' | '> 4000g' | 'no_aplica';
type UltimoPrevioFechaTiempo = '< 1 año' | '1 a < 2 años' | '2 a < 5 años' | '>= 5 años';

type AntecedentesFamiliares = {
  tbc: boolean;
  diabetes: boolean;
  hipertension: boolean;
  preeclampsia: boolean;
  eclampsia: boolean;
  otra_condicion_medica_grave: boolean;
  observaciones: string;
};

type AntecedentesPersonales = {
  tbc: boolean;
  diabetes: boolean;
  diabetes_tipo: DiabetesTipo;
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
  antecedente_gemelares: boolean;
  observaciones: string;
};

type AntecedentesData = {
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

  ultimo_previo_peso: UltimoPrevioPeso;

  fecha_fin_ultimo_embarazo: string;
  ultimo_previo_fecha_tiempo: UltimoPrevioFechaTiempo;
  embarazo_planeado: 'si' | 'no';
  fracaso_metodo_anticonceptivo: 'no_usaba' | 'barrera' | 'diu' | 'hormonal' | 'emergencia' | 'natural';
};

// Export para compatibilidad con HistorialWizard
export interface AntecedentesFormValues {
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
  fecha_fin_ultimo_embarazo?: any;
  embarazo_planeado?: 'si' | 'no';
  fracaso_metodo_anticonceptivo?: 'no_usaba' | 'barrera' | 'diu' | 'hormonal' | 'emergencia' | 'natural';
  tiempo_desde_ultimo_embarazo?: string;
  antecedentes_familiares?: Record<string, unknown>;
  antecedentes_personales?: Record<string, unknown>;
}

/* === SOLO claves numéricas obstétricas (para resetear a 0) === */
type ObstetricKey =
  | 'partos' | 'cesareas' | 'vaginales' | 'abortos'
  | 'nacidos_vivos' | 'nacidos_muertos' | 'embarazo_ectopico'
  | 'hijos_vivos' | 'muertos_primera_semana' | 'muertos_despues_semana';

const OBSTETRIC_FIELDS: ObstetricKey[] = [
  'partos', 'cesareas', 'vaginales', 'abortos',
  'nacidos_vivos', 'nacidos_muertos', 'embarazo_ectopico',
  'hijos_vivos', 'muertos_primera_semana', 'muertos_despues_semana'
];

/* ===================== Estado inicial ===================== */

const initialFormData: AntecedentesData = {
  antecedentes_familiares: {
    tbc: false, diabetes: false, hipertension: false, preeclampsia: false, eclampsia: false,
    otra_condicion_medica_grave: false, observaciones: "",
  },
  antecedentes_personales: {
    tbc: false, diabetes: false, diabetes_tipo: 'ninguna', hipertension: false, preeclampsia: false, eclampsia: false,
    otra_condicion_medica_grave: false, violencia: false, vih: false, cirugia_genito_urinaria: false,
    infertilidad: false, cardiopatia: false, nefropatia: false, antecedente_gemelares: false, observaciones: "",
  },
  gesta_previa: 0,
  partos: 0,
  cesareas: 0,
  vaginales: 0,
  abortos: 0,
  nacidos_vivos: 0,
  nacidos_muertos: 0,
  embarazo_ectopico: 0,
  hijos_vivos: 0,
  muertos_primera_semana: 0,
  muertos_despues_semana: 0,
  ultimo_previo_peso: 'no_aplica',
  fecha_fin_ultimo_embarazo: new Date().toISOString().split('T')[0],
  ultimo_previo_fecha_tiempo: '>= 5 años',
  embarazo_planeado: 'si',
  fracaso_metodo_anticonceptivo: 'no_usaba',
};

/* ===================== UI helpers ===================== */

const inputClass = "w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out";
const disabledClass = "bg-gray-100 cursor-not-allowed opacity-75";

interface FieldsetProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Fieldset: React.FC<FieldsetProps> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500 mb-8 transition-all hover:shadow-xl">
    <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center border-b pb-3">
      {icon}
      <span className="ml-3">{title}</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {children}
    </div>
  </div>
);

interface CheckboxGroupProps {
  title: string;
  data: Record<string, boolean | string>;
  onCheckChange: (key: string, value: boolean) => void;
  onTextChange: (key: string, value: string) => void;
  nestedKey: 'antecedentes_familiares' | 'antecedentes_personales';
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, data, onCheckChange, onTextChange, nestedKey }) => {
  const booleanKeys = Object.keys(data).filter(k => typeof data[k] === 'boolean');
  const textKey = Object.keys(data).find(k => k === 'observaciones');
  const diabetesTypeKey = Object.keys(data).find(k => k === 'diabetes_tipo');
  const hasDiabetes = (data as any).diabetes === true;

  const fieldLabels: Record<string, string> = {
    tbc: 'Tuberculosis (TBC)',
    diabetes: 'Diabetes Mellitus',
    hipertension: 'Hipertensión Arterial',
    preeclampsia: 'Preeclampsia',
    eclampsia: 'Eclampsia',
    otra_condicion_medica_grave: 'Otra Condición Médica Grave',
    violencia: 'Violencia (Pareja o Sexual)',
    vih: 'VIH',
    cirugia_genito_urinaria: 'Cirugía Genito-Urinaria Previa',
    infertilidad: 'Infertilidad',
    cardiopatia: 'Cardiopatía',
    nefropatia: 'Nefropatía',
    antecedente_gemelares: 'Antecedente de Gestación Gemelar',
  };

  const toLabel = (key: string) =>
    fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="col-span-1 md:col-span-1 space-y-4 p-4 border rounded-xl bg-gray-50 shadow-inner">
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2">{title}</h3>
      <div className="grid grid-cols-1 gap-2">
        {booleanKeys.map(key => (
          <div key={key} className="flex items-center justify-between p-2 rounded-md hover:bg-white transition duration-150">
            <label htmlFor={`${nestedKey}-${key}`} className="text-sm font-medium text-gray-700 cursor-pointer">
              {toLabel(key)}
            </label>
            <input
              id={`${nestedKey}-${key}`}
              type="checkbox"
              checked={!!data[key]}
              onChange={(e) => onCheckChange(key, e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer shadow-sm"
            />
          </div>
        ))}
      </div>

      {diabetesTypeKey && (
        <div className={`mt-4 p-3 rounded-lg border transition-all ${hasDiabetes ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
          <label htmlFor={`${nestedKey}-diabetes_tipo`} className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Diabetes (si aplica):
          </label>
          <select
            id={`${nestedKey}-diabetes_tipo`}
            name="diabetes_tipo"
            value={(data[diabetesTypeKey] as string) ?? 'ninguna'}
            onChange={(e) => onTextChange('diabetes_tipo', e.target.value)}
            disabled={!hasDiabetes}
            className={`${inputClass} text-sm ${!hasDiabetes ? disabledClass : 'bg-white'}`}
          >
            {['ninguna', 'tipo I', 'tipo II', 'gestacional'].map(tipo => (
              <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
            ))}
          </select>
          {!hasDiabetes && <p className='text-xs text-gray-500 mt-1'>Se requiere marcar "Diabetes Mellitus" arriba para habilitar.</p>}
        </div>
      )}

      {textKey && (
        <div className="mt-4">
          <label htmlFor={`${nestedKey}-observaciones`} className="block text-sm font-medium text-gray-700">
            Observaciones:
          </label>
          <textarea
            id={`${nestedKey}-observaciones`}
            rows={2}
            value={(data[textKey] as string) ?? ""}
            onChange={(e) => onTextChange(textKey, e.target.value)}
            className={`mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
            placeholder={`Notas adicionales sobre ${title.toLowerCase()}...`}
          />
        </div>
      )}
    </div>
  );
};

const LabeledInput: React.FC<FieldProps> = ({ label, name, value, onChange, type = 'text', min = 0, disabled = false, className = '' }) => (
  <div>
    <label htmlFor={String(name)} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={String(name)}
      type={type}
      name={String(name)}
      min={min}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className={`${inputClass} ${disabled ? disabledClass : ''} ${className}`}
      placeholder={type === 'number' ? '0' : ''}
    />
  </div>
);

/* ===================== Componente ===================== */

type Props = {
  form: FormInstance<any>; // 👈 declaramos la prop que te da el <Form form={antForm} />
};

const AntecedentesStep: React.FC<Props> = ({ form: _form }) => { // 👈 recibimos la prop (sin usarla)
  const [formData, setFormData] = useState<AntecedentesData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isObstetricDisabled = useMemo(() => formData.gesta_previa === 0, [formData.gesta_previa]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | UltimoPrevioPeso | UltimoPrevioFechaTiempo = value;

    if (type === 'number') {
      newValue = Math.max(0, parseInt(value, 10) || 0);
    }

    setFormData(prev => {
      if (name === 'gesta_previa') {
        const gp = parseInt(String(value), 10) || 0;
        if (gp === 0) {
          const resetFields = OBSTETRIC_FIELDS.reduce((acc, field) => {
            acc[field] = 0;
            return acc;
          }, {} as Record<ObstetricKey, number>);
          return {
            ...prev,
            ...resetFields,
            gesta_previa: 0,
            ultimo_previo_peso: 'no_aplica',
          } as AntecedentesData;
        }
        return { ...prev, gesta_previa: gp };
      }

      return { ...prev, [name]: newValue } as AntecedentesData;
    });
  }, []);

  const handleNestedCheckChange = useCallback((
    parentKey: 'antecedentes_familiares' | 'antecedentes_personales',
    childKey: string,
    value: boolean
  ) => {
    setFormData(prev => {
      if (parentKey === 'antecedentes_personales') {
        const ap: AntecedentesPersonales = { ...(prev.antecedentes_personales), [childKey]: value } as AntecedentesPersonales;
        if (childKey === 'diabetes' && value === false) {
          ap.diabetes_tipo = 'ninguna';
        }
        return { ...prev, antecedentes_personales: ap };
      } else {
        const af: AntecedentesFamiliares = { ...(prev.antecedentes_familiares), [childKey]: value } as AntecedentesFamiliares;
        return { ...prev, antecedentes_familiares: af };
      }
    });
  }, []);

  const handleNestedTextChange = useCallback((
    parentKey: 'antecedentes_familiares' | 'antecedentes_personales',
    childKey: string,
    value: string
  ) => {
    setFormData(prev => {
      if (parentKey === 'antecedentes_personales') {
        const ap: AntecedentesPersonales = { ...prev.antecedentes_personales, [childKey]: value } as AntecedentesPersonales;
        return { ...prev, antecedentes_personales: ap };
      } else {
        const af: AntecedentesFamiliares = { ...prev.antecedentes_familiares, [childKey]: value } as AntecedentesFamiliares;
        return { ...prev, antecedentes_familiares: af };
      }
    });
  }, []);

  const validateCoherence = useCallback((): boolean => {
    const { partos, cesareas, vaginales } = formData;
    const partosCV = cesareas + vaginales;

    if (!isObstetricDisabled && partos !== partosCV) {
      setMessage({
        type: 'error',
        text: `Inconsistencia Obstétrica: Partos (${partos}) debe ser igual a Cesáreas (${cesareas}) + Vaginales (${vaginales}).`
      });
      return false;
    }

    if (formData.gesta_previa > 0 && formData.ultimo_previo_peso === 'no_aplica') {
      setMessage({
        type: 'error',
        text: 'Si Gesta Previa > 0, debe especificar el peso del Último Previo (no puede ser "No Aplica").'
      });
      return false;
    }

    return true;
  }, [formData, isObstetricDisabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateCoherence()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Antecedentes (payload):', JSON.stringify(formData, null, 2));
      setMessage({ type: 'success', text: 'Antecedentes clínicos guardados correctamente.' });
      setFormData(initialFormData);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-indigo-900 flex items-center justify-center">
            <History className="w-8 h-8 mr-3 text-indigo-600" /> Registro de Antecedentes Clínicos
          </h1>
          <p className="text-gray-500 mt-2">Módulo de Historia Clínica Perinatal Básica</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">

          {message && (
            <div className={`p-4 rounded-xl text-center font-medium shadow-md transition-all flex items-center justify-center ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-400'
                : 'bg-red-50 text-red-700 border border-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <XCircle className="w-5 h-5 mr-3" />}
              {message.text}
            </div>
          )}

          <Fieldset title="Antecedentes Médicos" icon={<HeartHandshake className="w-6 h-6" />}>
            <CheckboxGroup
              title="Antecedentes Familiares"
              nestedKey="antecedentes_familiares"
              data={formData.antecedentes_familiares as Record<string, boolean | string>}
              onCheckChange={(k, v) => handleNestedCheckChange('antecedentes_familiares', k, v)}
              onTextChange={(k, v) => handleNestedTextChange('antecedentes_familiares', k, v)}
            />
            <CheckboxGroup
              title="Antecedentes Personales y Patológicos"
              nestedKey="antecedentes_personales"
              data={formData.antecedentes_personales as Record<string, boolean | string>}
              onCheckChange={(k, v) => handleNestedCheckChange('antecedentes_personales', k, v)}
              onTextChange={(k, v) => handleNestedTextChange('antecedentes_personales', k, v)}
            />
          </Fieldset>

          <Fieldset title="Historial Obstétrico (Paridad)" icon={<Syringe className="w-6 h-6" />}>
            <div className="md:col-span-2 p-5 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-inner">
              <label htmlFor="gesta_previa" className="block text-sm font-bold text-indigo-700 mb-2">
                Gesta Previa (G) *
              </label>
              <input
                id="gesta_previa"
                type="number"
                name="gesta_previa"
                min={0}
                value={formData.gesta_previa}
                onChange={handleChange}
                required
                className={`${inputClass} text-xl font-mono tracking-wider text-center border-indigo-500`}
                placeholder="0"
              />
              <div className={`mt-2 p-2 rounded-lg text-sm flex items-start ${isObstetricDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                <AlertTriangle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                <p className="font-semibold">
                  {isObstetricDisabled
                    ? 'Atención: Gesta Previa = 0. Los campos de Paridad han sido auto-llenados a 0 y están bloqueados.'
                    : 'Gesta Previa > 0. Complete los campos del historial obstétrico.'}
                </p>
              </div>
            </div>

            <h3 className="md:col-span-2 text-lg font-bold text-gray-700 mt-2 mb-1 border-b border-gray-200 pb-1">Resultados de Partos Previos:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-1 md:col-span-2">
              <div>
                <label htmlFor="ultimo_previo_peso" className="block text-sm font-semibold text-gray-700 mb-1">
                  Peso de Último Embarazo Previo *
                </label>
                <select
                  id="ultimo_previo_peso"
                  name="ultimo_previo_peso"
                  value={formData.ultimo_previo_peso}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="no_aplica">No Aplica / Sin Dato (G=0)</option>
                  <option value="< 2500g">Bajo Peso (&lt; 2500g)</option>
                  <option value="normal/n/c">Normal (2500g a 4000g)</option>
                  <option value="> 4000g">Macrosomía (&gt; 4000g)</option>
                </select>
                {formData.gesta_previa > 0 && formData.ultimo_previo_peso === 'no_aplica' && (
                  <p className='text-xs text-red-600 font-medium mt-1'>Debe seleccionar un peso si Gesta Previa es {'>'} 0.</p>
                )}
              </div>

              <div>
                <label htmlFor="antecedente_gemelares_obstetrico" className="block text-sm font-semibold text-gray-700 mb-1">
                  Antecedente de Gemelares (en historial)
                </label>
                <select
                  id="antecedente_gemelares_obstetrico"
                  name="antecedente_gemelares"
                  value={formData.antecedentes_personales.antecedente_gemelares ? 'si' : 'no'}
                  onChange={(e) => handleNestedCheckChange('antecedentes_personales', 'antecedente_gemelares', e.target.value === 'si')}
                  className={inputClass}
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-2 gap-4">
              {([
                { name: 'partos', label: 'Partos (P)' },
                { name: 'abortos', label: 'Abortos (A)' },
                { name: 'embarazo_ectopico', label: 'Embarazo Ectópico' },
                { name: 'cesareas', label: 'Cesáreas (C)' },
                { name: 'vaginales', label: 'Vaginales (V)' },
              ] as const).map(({ name, label }) => (
                <LabeledInput
                  key={name}
                  label={label}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  type="number"
                  disabled={isObstetricDisabled}
                />
              ))}
              <div className="sm:col-span-3 h-0"></div>
            </div>

            <h3 className="md:col-span-2 text-lg font-bold text-gray-700 mt-2 mb-1 border-b border-gray-200 pb-1">Hijos y Mortalidad:</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-2 gap-4">
              {([
                { name: 'hijos_vivos', label: 'Hijos Vivos Actuales' },
                { name: 'nacidos_vivos', label: 'Nacidos Vivos' },
                { name: 'nacidos_muertos', label: 'Nacidos Muertos' },
                { name: 'muertos_primera_semana', label: 'Mortalidad < 1ra Semana' },
                { name: 'muertos_despues_semana', label: 'Mortalidad > 1ra Semana' },
              ] as const).map(({ name, label }) => (
                <LabeledInput
                  key={name}
                  label={label}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  type="number"
                  disabled={isObstetricDisabled}
                />
              ))}
            </div>
          </Fieldset>

          <Fieldset title="Detalles Adicionales de la Gestación" icon={<Calendar className="w-6 h-6" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
              <LabeledInput
                label="Fecha de Fin de Último Embarazo (FFUE)"
                name="fecha_fin_ultimo_embarazo"
                value={formData.fecha_fin_ultimo_embarazo}
                onChange={handleChange}
                type="date"
              />
              <div>
                <label htmlFor="ultimo_previo_fecha_tiempo" className="block text-sm font-semibold text-gray-700 mb-1">
                  Tiempo Transcurrido desde FFUE *
                </label>
                <select
                  id="ultimo_previo_fecha_tiempo"
                  name="ultimo_previo_fecha_tiempo"
                  value={formData.ultimo_previo_fecha_tiempo}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="< 1 año">Menos de 1 año</option>
                  <option value="1 a < 2 años">1 a menos de 2 años</option>
                  <option value="2 a < 5 años">2 a menos de 5 años</option>
                  <option value=">= 5 años">5 años o más</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="embarazo_planeado" className="block text-sm font-semibold text-gray-700 mb-1">
                Embarazo Actual Planeado *
              </label>
              <select
                id="embarazo_planeado"
                name="embarazo_planeado"
                value={formData.embarazo_planeado}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label htmlFor="fracaso_metodo_anticonceptivo" className="block text-sm font-semibold text-gray-700 mb-1">
                Fracaso de Método Anticonceptivo *
              </label>
              <select
                id="fracaso_metodo_anticonceptivo"
                name="fracaso_metodo_anticonceptivo"
                value={formData.fracaso_metodo_anticonceptivo}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="no_usaba">No Usaba</option>
                <option value="barrera">Barrera (Condón)</option>
                <option value="diu">DIU</option>
                <option value="hormonal">Hormonal</option>
                <option value="emergencia">Emergencia</option>
                <option value="natural">Natural</option>
              </select>
            </div>
          </Fieldset>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[250px] justify-center"
            >
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AntecedentesStep;
