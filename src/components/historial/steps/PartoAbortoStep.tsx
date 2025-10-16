import { Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

// Enums según backend
const TIPO_EVENTO = ["Parto", "Aborto"] as const;
const SI_NO = ["Si", "No"] as const;
const LUGAR_PARTO = ["Institucional", "Domiciliar", "Otro"] as const;
const CORTICOIDES_ESTADO = ["Completo", "Incompleto", "Ninguna", "N/C"] as const;
const INICIO_PARTO = ["Espontáneo", "Inducido", "Cesárea Electiva"] as const;
const EDAD_GEST_METODO = ["FUM", "USG", "Ambos"] as const;
const PRESENTACION = ["Cefálica", "Pélvica", "Transversa"] as const;
const ACOMPANANTE = [
  "Pareja",
  "Familiar",
  "Partera",
  "Brigadista",
  "Amigo/a",
  "Personal Salud",
  "Otro",
  "Ninguno",
] as const;
const NACIMIENTO = ["Vivo", "Muerte Anteparto", "Muerte Intraparto", "Muerto Ignora momento"] as const;
const TERMINACION = ["Espontánea", "Cesárea", "Fórceps", "Vacuum", "Otra"] as const;
const POSICION = ["Sentada", "Acostada", "Cuclillas"] as const;
const EPI = ["Si", "No"] as const;
const LIGADURA = ["Precoz", "Tardía"] as const;

export interface RupturaMembranaValues {
  hubo: (typeof SI_NO)[number];
  fecha_inicio?: { dia?: number; mes?: number; anio?: number };
  hora_inicio?: { hora?: number; minuto?: number };
  antes_37_semanas?: boolean;
  duracion_ruptura_18h_omas?: boolean;
  temperatura_mayor_38?: boolean;
}

export interface HospitalizacionEmbarazoValues { hubo: (typeof SI_NO)[number]; dias: number }
export interface CorticoidesValues { estado: (typeof CORTICOIDES_ESTADO)[number]; semana_inicio: number }
export interface EdadGestPartoValues {
  semanas: number;
  dias: number;
  metodo: (typeof EDAD_GEST_METODO)[number];
}

export interface MedicacionRecibidaValues {
  oxitocicos?: (typeof SI_NO)[number];
  antibiotico?: (typeof SI_NO)[number];
  analgesia?: (typeof SI_NO)[number];
  anestesia_local?: (typeof SI_NO)[number];
  anestesia_general?: (typeof SI_NO)[number];
  anestesia_regional?: (typeof SI_NO)[number];
  transfusion?: (typeof SI_NO)[number];
  otros?: string;
}

export interface PartoAbortoFormValues {
  tipo_evento: (typeof TIPO_EVENTO)[number];
  fecha_ingreso?: Dayjs;
  carne_perinatal: (typeof SI_NO)[number];
  consultas_prenatales: number;
  lugar_parto: (typeof LUGAR_PARTO)[number];
  hospitalizacion_embarazo: HospitalizacionEmbarazoValues;
  corticoides_antenatales: CorticoidesValues;
  inicio_parto: (typeof INICIO_PARTO)[number];
  ruptura_membrana: RupturaMembranaValues;
  edad_gestacional_parto: EdadGestPartoValues;
  presentacion: (typeof PRESENTACION)[number];
  tamano_fetal_acorde: (typeof SI_NO)[number];
  acompanante: (typeof ACOMPANANTE)[number];
  acompanamiento_solicitado_usuaria: (typeof SI_NO)[number];
  nacimiento: (typeof NACIMIENTO)[number];
  fecha_hora_nacimiento?: Dayjs;
  nacimiento_multiple: (typeof SI_NO)[number];
  orden_nacimiento: number;
  terminacion_parto: (typeof TERMINACION)[number];
  posicion_parto: (typeof POSICION)[number];
  episiotomia: (typeof EPI)[number];
  desgarros: { hubo: (typeof SI_NO)[number]; grado?: number };
  oxitocicos_pre: (typeof SI_NO)[number];
  oxitocicos_post: (typeof SI_NO)[number];
  placenta_expulsada: (typeof SI_NO)[number];
  ligadura_cordon: (typeof LIGADURA)[number];
  medicacion_recibida?: MedicacionRecibidaValues;
  indicacion_principal_induccion_operacion?: string;
  induccion?: string[];
  operacion?: string[];
  partograma_usado: boolean;
}

type Props = { form: ReturnType<typeof Form.useForm>[0] };

const radioSiNo = (
  <Radio.Group>
    <Radio value>Si</Radio>
    <Radio value={false}>No</Radio>
  </Radio.Group>
);

const PartoAbortoStep = ({ form }: Props) => {
  const parseYesNo = (list: readonly string[]) => list.map((v) => ({ label: v, value: v }));

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Evento</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="tipo_evento" label="Tipo de evento" rules={[{ required: true }]}> 
            <Select options={Array.from(TIPO_EVENTO).map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fecha_ingreso" label="Fecha ingreso" rules={[{ required: true }]}> 
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="carne_perinatal" label="Carné perinatal" rules={[{ required: true }]}> 
            <Select options={parseYesNo(SI_NO)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="consultas_prenatales" label="Consultas prenatales" rules={[{ required: true }]}> 
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="lugar_parto" label="Lugar del parto" rules={[{ required: true }]}> 
            <Select options={Array.from(LUGAR_PARTO).map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Hospitalización embarazo" required>
            <Input.Group compact>
              <Form.Item name={["hospitalizacion_embarazo", "hubo"]} noStyle rules={[{ required: true }]}> 
                <Select style={{ width: "50%" }} options={parseYesNo(SI_NO)} />
              </Form.Item>
              <Form.Item name={["hospitalizacion_embarazo", "dias"]} noStyle rules={[{ required: true }]}> 
                <InputNumber min={0} style={{ width: "50%" }} placeholder="días" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Corticoides antenatales" required>
            <Input.Group compact>
              <Form.Item name={["corticoides_antenatales", "estado"]} noStyle rules={[{ required: true }]}> 
                <Select style={{ width: "60%" }} options={Array.from(CORTICOIDES_ESTADO).map((v) => ({ label: v, value: v }))} />
              </Form.Item>
              <Form.Item name={["corticoides_antenatales", "semana_inicio"]} noStyle rules={[{ required: true }]}> 
                <InputNumber min={0} style={{ width: "40%" }} placeholder="sem" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="inicio_parto" label="Inicio del parto" rules={[{ required: true }]}> 
            <Select options={Array.from(INICIO_PARTO).map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item label="Ruptura de membrana" required>
            <Row gutter={8}>
              <Col xs={24} md={6}>
                <Form.Item name={["ruptura_membrana", "hubo"]} label="Hubo" rules={[{ required: true }]}> 
                  <Select options={parseYesNo(SI_NO)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={9}>
                <Form.Item label="Fecha inicio">
                  <Input.Group compact>
                    <Form.Item name={["ruptura_membrana", "fecha_inicio", "dia"]} noStyle> <InputNumber placeholder="dd" min={1} max={31} style={{ width: 70 }} /> </Form.Item>
                    <Form.Item name={["ruptura_membrana", "fecha_inicio", "mes"]} noStyle> <InputNumber placeholder="mm" min={1} max={12} style={{ width: 70 }} /> </Form.Item>
                    <Form.Item name={["ruptura_membrana", "fecha_inicio", "anio"]} noStyle> <InputNumber placeholder="aaaa" min={1900} style={{ width: 90 }} /> </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={9}>
                <Form.Item label="Hora inicio">
                  <Input.Group compact>
                    <Form.Item name={["ruptura_membrana", "hora_inicio", "hora"]} noStyle> <InputNumber placeholder="hh" min={0} max={23} style={{ width: 70 }} /> </Form.Item>
                    <Form.Item name={["ruptura_membrana", "hora_inicio", "minuto"]} noStyle> <InputNumber placeholder="mm" min={0} max={59} style={{ width: 90 }} /> </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col xs={24} md={8}><Form.Item name={["ruptura_membrana", "antes_37_semanas"]} label="< 37 semanas">{radioSiNo}</Form.Item></Col>
              <Col xs={24} md={8}><Form.Item name={["ruptura_membrana", "duracion_ruptura_18h_omas"]} label=">= 18h">{radioSiNo}</Form.Item></Col>
              <Col xs={24} md={8}><Form.Item name={["ruptura_membrana", "temperatura_mayor_38"]} label="> 38°C">{radioSiNo}</Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Edad gestacional al parto" required>
            <Input.Group compact>
              <Form.Item name={["edad_gestacional_parto", "semanas"]} noStyle rules={[{ required: true }]}> <InputNumber placeholder="sem" min={0} style={{ width: 100 }} /> </Form.Item>
              <Form.Item name={["edad_gestacional_parto", "dias"]} noStyle rules={[{ required: true }]}> <InputNumber placeholder="días" min={0} max={6} style={{ width: 100 }} /> </Form.Item>
              <Form.Item name={["edad_gestacional_parto", "metodo"]} noStyle rules={[{ required: true }]}> <Select style={{ width: 140 }} options={Array.from(EDAD_GEST_METODO).map((v) => ({ label: v, value: v }))} /> </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Row gutter={8}>
            <Col xs={24} md={8}><Form.Item name="presentacion" label="Presentación" rules={[{ required: true }]}><Select options={Array.from(PRESENTACION).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="tamano_fetal_acorde" label="Tamaño fetal acorde" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="acompanante" label="Acompañante" rules={[{ required: true }]}><Select options={Array.from(ACOMPANANTE).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Row gutter={8}>
            <Col xs={24} md={12}><Form.Item name="acompanamiento_solicitado_usuaria" label="Acompañamiento solicitado" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="nacimiento" label="Nacimiento" rules={[{ required: true }]}><Select options={Array.from(NACIMIENTO).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
          </Row>
        </Col>
        <Col xs={24} md={12}>
          <Row gutter={8}>
            <Col xs={24} md={12}><Form.Item name="fecha_hora_nacimiento" label="Fecha/hora nacimiento" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="nacimiento_multiple" label="Múltiple" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}><Form.Item name="orden_nacimiento" label="Orden nacimiento" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="terminacion_parto" label="Terminación" rules={[{ required: true }]}><Select options={Array.from(TERMINACION).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="posicion_parto" label="Posición" rules={[{ required: true }]}><Select options={Array.from(POSICION).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="episiotomia" label="Episiotomía" rules={[{ required: true }]}><Select options={Array.from(EPI).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}><Form.Item name={["desgarros", "hubo"]} label="Desgarros" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
        <Col xs={24} md={8}><Form.Item name={["desgarros", "grado"]} label="Grado"><InputNumber min={1} max={4} style={{ width: "100%" }} /></Form.Item></Col>
        <Col xs={24} md={8}><Form.Item name="placenta_expulsada" label="Placenta expulsada" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}><Form.Item name="oxitocicos_pre" label="Oxitócicos (pre)" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="oxitocicos_post" label="Oxitócicos (post)" rules={[{ required: true }]}><Select options={parseYesNo(SI_NO)} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="ligadura_cordon" label="Ligadura cordón" rules={[{ required: true }]}><Select options={Array.from(LIGADURA).map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
      </Row>

      <Typography.Title level={5}>Medicación recibida</Typography.Title>
      <Row gutter={16}>
        {[
          ["oxitocicos", "Oxitócicos"],
          ["antibiotico", "Antibiótico"],
          ["analgesia", "Analgesia"],
          ["anestesia_local", "Anestesia local"],
          ["anestesia_general", "Anestesia general"],
          ["anestesia_regional", "Anestesia regional"],
          ["transfusion", "Transfusión"],
        ].map(([k, label]) => (
          <Col xs={24} md={8} key={k as string}>
            <Form.Item name={["medicacion_recibida", k as string]} label={label}>
              <Select options={parseYesNo(SI_NO)} />
            </Form.Item>
          </Col>
        ))}
        <Col xs={24}>
          <Form.Item name={["medicacion_recibida", "otros"]} label="Otros">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5}>Observaciones</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={12}><Form.Item name="indicacion_principal_induccion_operacion" label="Indicación principal"><Input.TextArea rows={2} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="induccion" label="Inducción"><Select mode="tags" tokenSeparators={[","]} placeholder="Agregar" /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item name="operacion" label="Operación"><Select mode="tags" tokenSeparators={[","]} placeholder="Agregar" /></Form.Item></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}><Form.Item name="partograma_usado" label="Partograma usado" rules={[{ required: true }]}>{radioSiNo}</Form.Item></Col>
      </Row>
    </>
  );
};

export default PartoAbortoStep;

