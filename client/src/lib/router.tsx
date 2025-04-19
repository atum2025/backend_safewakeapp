import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import AlarmActivePage from "../pages/AlarmActivePage";
import AlarmConfigPage from "../pages/AlarmConfigPage";
import ProfilePage from "../pages/ProfilePage";
import EmergencyContactPage from "../pages/EmergencyContactPage";
import NotFound from "../pages/not-found";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/alarm" element={<AlarmActivePage />} />
      <Route path="/config" element={<AlarmConfigPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/contact" element={<EmergencyContactPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
