import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CheckEmail from "./pages/CheckEmail";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Applications from "./pages/Applications";
import Portfolio from "./pages/Portfolio";
import StudentBrowse from "./pages/StudentBrowse";
import Profile from "./pages/Profile";
import WorkedStudents from "./pages/WorkedStudents";
import MyInvites from "./pages/MyInvites";
import CompletedWork from "./pages/CompletedWork";
import NotFound from "./pages/NotFound";
import BusinessVerification from "./pages/BusinessVerification";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVerifications from "./pages/AdminVerifications";
import AdminVerificationDetail from "./pages/AdminVerificationDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/verify-otp" element={<Navigate to="/check-email" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route
              path="/business/verification"
              element={
                <ProtectedRoute requiredRole="business">
                  <BusinessVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute requiredRole="business" requireVerifiedBusiness>
                  <NewProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminVerifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminVerificationDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute requiredRole="student"><Applications /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute requiredRole="student"><Portfolio /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><StudentBrowse /></ProtectedRoute>} />
            <Route path="/students/:id" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/worked-students" element={<ProtectedRoute requiredRole="business"><WorkedStudents /></ProtectedRoute>} />
            <Route path="/invites" element={<ProtectedRoute requiredRole="student"><MyInvites /></ProtectedRoute>} />
            <Route path="/completed-work" element={<ProtectedRoute requiredRole="student"><CompletedWork /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
