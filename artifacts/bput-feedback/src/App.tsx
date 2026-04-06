import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useCallback } from "react";
import NotFound from "@/pages/not-found";
import { RoleProvider } from "./contexts/RoleContext";

import Home from "./pages/Home";
import SubmitFeedback from "./pages/SubmitFeedback";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Departments from "./pages/Departments";
import DepartmentDetails from "./pages/DepartmentDetails";
import FacultyList from "./pages/FacultyList";
import FacultyDetails from "./pages/FacultyDetails";
import Courses from "./pages/Courses";
import FeedbackList from "./pages/FeedbackList";
import Windows from "./pages/Windows";
import FacultyPortal from "./pages/FacultyPortal";
import HodDashboard from "./pages/HodDashboard";
import AdminReports from "./pages/AdminReports";

import { AppLayout } from "./components/layout/AppLayout";
import { HomePageLayout } from "./components/HomePageLayout";
import { InstallPrompt } from "./components/InstallPrompt";
import { SplashScreen } from "./components/SplashScreen";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function DashboardRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/submit-feedback" component={SubmitFeedback} />
        <Route path="/faculty-portal" component={FacultyPortal} />
        <Route path="/hod-dashboard" component={HodDashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/departments" component={Departments} />
        <Route path="/departments/:id" component={DepartmentDetails} />
        <Route path="/faculty" component={FacultyList} />
        <Route path="/faculty/:id" component={FacultyDetails} />
        <Route path="/courses" component={Courses} />
        <Route path="/feedback" component={FeedbackList} />
        <Route path="/windows" component={Windows} />
        <Route path="/reports" component={AdminReports} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <HomePageLayout>
          <Home />
        </HomePageLayout>
      )} />
      <Route component={DashboardRoutes} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RoleProvider>
            {!splashDone && <SplashScreen onDone={handleSplashDone} />}
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </RoleProvider>
          <Toaster />
          <InstallPrompt />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
