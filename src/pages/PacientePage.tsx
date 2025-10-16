import { Alert, Button, Card, Collapse, Empty, Form, Input, Space, Spin, Typography } from "antd";
import { useState } from "react";
import Can from "../components/auth/Can";
import { PERMISSIONS } from "../config/permissions";
import { crearHistorial } from "../services/historial.service";
import { usePaciente } from "../hooks/queries/usePaciente";

const SECTION_LABELS: Record<string, string> = {
  paciente: "Paciente",
  historial: "Historial reciente",
};

const INITIAL_PAYLOAD = `{
  "datos": {
    "paciente_id": ""
  },
  "identificacion": {},
  "antecedentes": {},
  "gestacion_actual": {},
  "parto_aborto": {},
  "patologias": {},
  "recien_nacido": {},
  "puerperio": {},
  "egreso_neonatal": {},
  "egreso_materno": {},
  "anticoncepcion": {}
}`;

const PacientePage = () => {
  const [pacienteId, setPacienteId] = useState("");
  const [payloadPreview, setPayloadPreview] = useState<string>(INITIAL_PAYLOAD);

  const {
    data,
    error,
    isFetching,
    refetch,
  } = usePaciente(pacienteId, {
    enabled: false,
    retry: false,
  });

  const handleBuscar = () => {
    if (!pacienteId.trim()) return;
    void refetch();
  };

  const handleCrearDemo = async () => {
    try {
      const parsed = JSON.parse(payloadPreview);
      const response = await crearHistorial(parsed);
      setPacienteId(response.paciente_id);
      void refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo crear el historial";
      console.error(msg, err);
    }
  };

  const detalle = data
    ? [
        ["paciente", data.paciente],
        ["historial", data.historial],
      ]
    : [];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Historia Clinica Perinatal
      </Typography.Title>

      <Card title="Buscar paciente">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="ID de paciente (ObjectId)"
            value={pacienteId}
            onChange={(event) => setPacienteId(event.target.value)}
          />
          <Button type="primary" onClick={handleBuscar} disabled={!pacienteId.trim()}>
            Buscar
          </Button>
        </Space.Compact>
        {isFetching && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
            <Spin />
          </div>
        )}
        {error && (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            message="No se pudo obtener el paciente"
            description={error.message}
          />
        )}
      </Card>

      <Can permission={PERMISSIONS.PACIENTE_CREATE}>
        <Card title="Crear historial (demo)">
          <Typography.Paragraph>
            Ajusta el JSON según los bloques requeridos por la API y presiona
            "Crear". La respuesta devolverá los identificadores generados.
          </Typography.Paragraph>
          <Form layout="vertical" onFinish={handleCrearDemo}>
            <Form.Item label="Payload JSON" required>
              <Input.TextArea
                rows={10}
                value={payloadPreview}
                onChange={(event) => setPayloadPreview(event.target.value)}
              />
            </Form.Item>
            <Button htmlType="submit" type="primary">
              Crear
            </Button>
          </Form>
        </Card>
      </Can>

      <Card title="Detalle">
        {detalle.length === 0 ? (
          <Empty description="Busca un paciente para ver su información" />
        ) : (
          <Collapse>
            {detalle.map(([key, value]) => (
              <Collapse.Panel header={SECTION_LABELS[key] ?? key} key={key}>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(value ?? {}, null, 2)}
                </pre>
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </Card>
    </Space>
  );
};

export default PacientePage;