import { Routes, Route } from "react-router-dom";
import RequireAuth from "./components/auth/RequireAuth";
import { PERMISSIONS } from "./config/permissions";
import AppLayout from "./layouts/AppLayout";
import AppointmentsPage from "./pages/AppointmentsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";
import PacientePage from "./pages/PacientePage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPacientePage from "./pages/RegisterPacientePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import UsuariosPage from "./pages/UsuariosPage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<RequireAuth permissions={[PERMISSIONS.HISTORIA_CLINICA_VIEW]} />}>
            <Route path="paciente" element={<PacientePage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.PACIENTES_REGISTRAR]} />}>
            <Route path="pacientes/registrar" element={<RegisterPacientePage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.CITAS_VIEW]} />}>
            <Route path="citas" element={<AppointmentsPage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.MENSAJES_VIEW]} />}>
            <Route path="mensajes" element={<MessagesPage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.REPORTES_VIEW]} />}>
            <Route path="reportes" element={<ReportsPage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.USUARIOS_MANAGE]} />}>
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>

          <Route element={<RequireAuth permissions={[PERMISSIONS.CONFIG_ACCESS]} />}>
            <Route path="configuracion" element={<SettingsPage />} />
          </Route>

          <Route path="perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
