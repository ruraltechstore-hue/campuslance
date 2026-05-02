import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import StudentDashboard from "./StudentDashboard";
import BusinessDashboard from "./BusinessDashboard";

const Dashboard = () => {
  const { role, loading } = useAuth();
  if (loading) return null;
  if (role === "student") return <StudentDashboard />;
  if (role === "business") return <BusinessDashboard />;
  return (
    <Layout>
      <div className="container-page py-16">Setting up your account…</div>
    </Layout>
  );
};

export default Dashboard;
