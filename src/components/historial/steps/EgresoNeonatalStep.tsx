import { Col, DatePicker, Form, Input, InputNumber, Row, Select, Typography, Checkbox } from "antd";
import dayjs from "dayjs";

const ESTADO = ["vivo", "traslado", "fallece"] as const;
const SI_NO = ["si", "no"] as const;
const ALIMENTO = ["lact_exclusiva", "lact_no_exclusiva", "leche_artificial"] as const;

type Props = { form: ReturnType<typeof Form.useForm>[0] };

const EgresoNeonatalStep = ({ form }: Props) => {
  const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }));

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        Egreso neonatal
      </Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select options={toOptions(ESTADO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>

        {/* Fecha/hora con etiqueta dinámica */}
        <Form.Item noStyle shouldUpdate={(prev, next) => prev.estado !== next.estado}>
          {({ getFieldValue }) => {
            const estado = getFieldValue("estado");
            const label =
              estado === "traslado"
                ? "Fecha/hora de traslado"
                : estado === "fallece"
                ? "Fecha/hora de fallecimiento"
                : "Fecha/hora del egreso";
            return (
              <Col xs={24} md={8}>
                <Form.Item
                  name="fecha_hora_evento"
                  label={label}
                  rules={[{ required: true, message: "Indica fecha y hora" }]}
                  // Guarda string "YYYY-MM-DD HH:mm" en el form
                  getValueFromEvent={(_d: any, dateStr: string) => (dateStr ? dateStr : undefined)}
                  getValueProps={(value?: string) => ({
                    value: value ? dayjs(value, "YYYY-MM-DD HH:mm") : undefined,
                  })}
                >
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            );
          }}
        </Form.Item>

        {/* Edad + < 1 día (sincronizado por onChange) */}
        <Col xs={24} md={4}>
          <Form.Item name="edad_egreso_dias" label="Edad egreso (días)" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              onChange={(v) => {
                // si edad = 0 => marcar < 1 día; si != 0 => desmarcar
                form.setFieldValue("menor_un_dia", v === 0);
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6} style={{ display: "flex", alignItems: "center" }}>
          <Form.Item name="menor_un_dia" valuePropName="checked" style={{ marginTop: 28 }}>
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) form.setFieldValue("edad_egreso_dias", 0);
              }}
            >
              &lt; 1 día
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Peso en gramos -> backend recibe peso_egreso (kg) oculto */}
        <Col xs={24} md={6}>
          <Form.Item
            name="peso_egreso_g"
            label="Peso al egreso (g)"
            rules={[{ required: true, message: "Indica el peso en gramos" }]}
          >
            <InputNumber
              min={0}
              step={1}
              style={{ width: "100%" }}
              onChange={(v) => {
                const kg = typeof v === "number" ? Number((v / 1000).toFixed(3)) : undefined;
                form.setFieldValue("peso_egreso", kg);
              }}
            />
          </Form.Item>
          <Form.Item name="peso_egreso" hidden>
            <InputNumber />
          </Form.Item>
        </Col>

        <Col xs={24} md={6}>
          <Form.Item name="alimento_alta" label="Alimento al alta" rules={[{ required: true }]}>
            <Select options={toOptions(ALIMENTO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>

        <Col xs={24} md={6}>
          <Form.Item name="boca_arriba" label="Boca arriba (orientación recibida)" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>

        <Col xs={24} md={6}>
          <Form.Item name="bcg_aplicada" label="BCG aplicada" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="id_rn" label="ID RN" rules={[{ required: true }]}>
            <Input placeholder="N° de expediente" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="nombre_rn" label="Nombre Recién Nacido/a" rules={[{ required: true }]}>
            <Input placeholder="Nombre completo / apellidos" />
          </Form.Item>
        </Col>
        <Col xs={24} md={10}>
          <Form.Item name="responsable" label="Responsable" rules={[{ required: true }]}>
            <Input placeholder="Nombre del responsable del alta" />
          </Form.Item>
        </Col>
      </Row>

      {/* —— TRASLADO —— */}
      <Form.Item noStyle shouldUpdate={(prev, next) => prev.estado !== next.estado}>
        {({ getFieldValue, setFieldsValue }) => {
          const estado = getFieldValue("estado");
          if (estado !== "traslado") {
            // limpiar campos cuando NO es traslado
            setFieldsValue({ codigo_traslado: undefined, fallece_durante_traslado: undefined });
            return null;
          }
          return (
            <Row gutter={16}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="codigo_traslado"
                  label="Lugar (código del establecimiento de destino)"
                  rules={[
                    { required: true, message: "Ingresa el código del establecimiento de destino" },
                    { whitespace: true, message: "El código no puede estar vacío" },
                  ]}
                >
                  <Input placeholder="Ej.: E/S-045, HOSP123..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="fallece_durante_traslado"
                  label="Fallece durante o en lugar de traslado"
                  rules={[{ required: true, message: "Selecciona si/no" }]}
                >
                  <Select options={toOptions(SI_NO)} placeholder="Selecciona" />
                </Form.Item>
              </Col>
            </Row>
          );
        }}
      </Form.Item>

      {/* —— FALLECE —— */}
      <Form.Item noStyle shouldUpdate={(prev, next) => prev.estado !== next.estado || prev.fallece_fuera_lugar_nacimiento !== next.fallece_fuera_lugar_nacimiento}>
        {({ getFieldValue, setFieldValue }) => {
          const estado = getFieldValue("estado");
          if (estado !== "fallece") {
            // limpiar campos cuando NO es fallece
            setFieldValue("fallece_fuera_lugar_nacimiento", undefined);
            setFieldValue("codigo_establecimiento_fallecimiento", undefined);
            return null;
          }
          const fuera = getFieldValue("fallece_fuera_lugar_nacimiento");
          return (
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="fallece_fuera_lugar_nacimiento"
                  label="¿Fallece fuera del lugar de nacimiento?"
                >
                  <Select options={toOptions(SI_NO)} placeholder="Selecciona" />
                </Form.Item>
              </Col>
              {fuera === "si" && (
                <Col xs={24} md={10}>
                  <Form.Item
                    name="codigo_establecimiento_fallecimiento"
                    label="Código del otro establecimiento (fallecimiento)"
                    rules={[
                      { required: true, message: "Ingresa el código del establecimiento" },
                      { whitespace: true, message: "El código no puede estar vacío" },
                    ]}
                  >
                    <Input placeholder="Ej.: E/S-122, HOSP987..." />
                  </Form.Item>
                </Col>
              )}
            </Row>
          );
        }}
      </Form.Item>
    </>
  );
};

export default EgresoNeonatalStep;
