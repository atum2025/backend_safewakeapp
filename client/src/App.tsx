import { AuthProvider } from "@/contexts/AuthContext";
import { AlarmProvider } from "@/contexts/AlarmContext";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";

// Import pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AlarmConfigPage from "@/pages/AlarmConfigPage";
import ProfilePage from "@/pages/ProfilePage";
import EmergencyContactPage from "@/pages/EmergencyContactPage";
import AlarmActivePage from "@/pages/AlarmActivePage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/alarm-config" component={AlarmConfigPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/emergency-contact" component={EmergencyContactPage} />
      <Route path="/alarm-active" component={AlarmActivePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <AlarmProvider>
        <Router />
        <Toaster />
      </AlarmProvider>
    </AuthProvider>
  );
}

export default App;
