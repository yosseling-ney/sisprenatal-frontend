import { Col, Form, Input, Radio, Row, Select, Typography } from "antd";

// Enums del backend (service_patologias.py)
const SI_NO_MIN = ["si", "no"] as const;
const RES_SIF_VIH = ["positivo", "negativo", "n_r", "n_c"] as const;
const TARV = ["si", "no", "n_c"] as const;
const HEM_TRIM = ["1_trim", "2_trim", "3_trim", "postparto", "infec_puerperal", "ninguno"] as const;

// Enfermedades (todas si/no en minúsculas)
const ENF_KEYS = [
  ["hta_previa", "HTA previa"],
  ["hta_inducida_embarazo", "HTA inducida por el embarazo"],
  ["preeclampsia", "Preeclampsia"],
  ["eclampsia", "Eclampsia"],
  ["cardiopatia", "Cardiopatía"],
  ["nefropatia", "Nefropatía"],
  ["diabetes", "Diabetes"],
  ["infeccion_ovular", "Infección ovular"],
  ["infeccion_urinaria", "Infección urinaria"],
  ["amenaza_parto_preter", "Amenaza parto pretérmino"],
  ["rciu", "RCIU"],
  ["rotura_premembranas", "Rotura premembranas"],
  ["anemia", "Anemia"],
  ["otra_cond_grave", "Otra condición grave"],
 ] as const;

export interface PatologiasFormValues {
  enfermedades: Record<string, (typeof SI_NO_MIN)[number]>;
  resumen: { ninguna: boolean; uno_o_mas: boolean };
  hemorragia: {
    hemorragia_ocurrio: (typeof SI_NO_MIN)[number];
    trimestre: (typeof HEM_TRIM)[number];
    codigo: string[];
  };
  tdp: {
    prueba_sifilis: (typeof RES_SIF_VIH)[number];
    prueba_vih: (typeof RES_SIF_VIH)[number];
    tarv: (typeof TARV)[number];
  };
}

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const PatologiasStep = ({ form }: Props) => {
  const siNoOptions = Array.from(SI_NO_MIN).map((v) => ({ label: v.toUpperCase(), value: v }));
  const resSifVihOptions = Array.from(RES_SIF_VIH).map((v) => ({ label: v, value: v }));
  const tarvOptions = Array.from(TARV).map((v) => ({ label: v, value: v }));
  const hemTrimOptions = Array.from(HEM_TRIM).map((v) => ({ label: v, value: v }));

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Enfermedades (si/no)</Typography.Title>
      <Row gutter={16}>
        {ENF_KEYS.map(([key, label]) => (
          <Col xs={24} md={8} key={key}>
            <Form.Item
              name={["enfermedades", key]}
              label={label}
              rules={[{ required: true, message: "Selecciona una opción" }]}
            >
              <Select options={siNoOptions} placeholder="Selecciona" />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Typography.Title level={5}>Resumen</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name={["resumen", "ninguna"]} label="Ninguna" valuePropName="checked">
            <Radio.Group>
              <Radio value={true}>Sí</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["resumen", "uno_o_mas"]} label="Una o más" valuePropName="checked">
            <Radio.Group>
              <Radio value={true}>Sí</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5}>Hemorragia</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name={["hemorragia", "hemorragia_ocurrio"]} label="Ocurrió" rules={[{ required: true }]}>
            <Select options={siNoOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["hemorragia", "trimestre"]} label="Trimestre" rules={[{ required: true }]}>
            <Select options={hemTrimOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["hemorragia", "codigo"]} label="Código(s)" rules={[{ required: true }]}>
            <Select mode="tags" tokenSeparators={[","]} placeholder="Hasta 3 códigos" />
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5}>Tamizaje (TDP)</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name={["tdp", "prueba_sifilis"]} label="Prueba sífilis" rules={[{ required: true }]}>
            <Select options={resSifVihOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["tdp", "prueba_vih"]} label="Prueba VIH" rules={[{ required: true }]}>
            <Select options={resSifVihOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["tdp", "tarv"]} label="TARV" rules={[{ required: true }]}>
            <Select options={tarvOptions} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default PatologiasStep;

