import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

const { maybeSingleMock } = vi.hoisted(() => ({
  maybeSingleMock: vi.fn(() => Promise.resolve({ data: { status: "approved" as const } })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: () => maybeSingleMock(),
    })),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));
const useAuthMock = vi.mocked(useAuth);

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    aud: "authenticated",
    role: "authenticated",
    email: "user@example.com",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    ...overrides,
  } as User;
}

function renderAt(path: string, ui: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/secret" element={ui} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        <Route path="/check-email" element={<div data-testid="check-email-page">Check email</div>} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
        <Route path="/business/verification" element={<div data-testid="biz-ver-page">Verify business</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    maybeSingleMock.mockResolvedValue({ data: { status: "approved" } });
  });

  it("shows a spinner while auth is loading", () => {
    useAuthMock.mockReturnValue({
      user: null,
      session: null,
      role: null,
      loading: true,
      signOut: vi.fn(),
    });
    const { container } = renderAt(
      "/secret",
      <ProtectedRoute>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("redirects to login when there is no user", async () => {
    useAuthMock.mockReturnValue({
      user: null,
      session: null,
      role: null,
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("redirects to check-email when email is not confirmed", async () => {
    useAuthMock.mockReturnValue({
      user: makeUser({ email_confirmed_at: undefined }),
      session: {} as never,
      role: "student",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("check-email-page")).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("renders children when email is confirmed", () => {
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "student",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId("secret")).toBeInTheDocument();
  });

  it("redirects to dashboard when requiredRole does not match", async () => {
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "student",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute requiredRole="business">
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("redirects to business verification when KYC is not approved", async () => {
    maybeSingleMock.mockResolvedValue({ data: { status: "draft" } });
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "business",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute requiredRole="business" requireVerifiedBusiness>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("biz-ver-page")).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("renders children when business KYC is approved", async () => {
    maybeSingleMock.mockResolvedValue({ data: { status: "approved" } });
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "business",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute requiredRole="business" requireVerifiedBusiness>
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("secret")).toBeInTheDocument();
  });

  it("allows admin when requiredRole is admin", async () => {
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "admin",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute requiredRole="admin">
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("secret")).toBeInTheDocument();
  });

  it("redirects to dashboard when admin is required but user is not admin", async () => {
    useAuthMock.mockReturnValue({
      user: makeUser(),
      session: {} as never,
      role: "student",
      loading: false,
      signOut: vi.fn(),
    });
    renderAt(
      "/secret",
      <ProtectedRoute requiredRole="admin">
        <div data-testid="secret">Secret</div>
      </ProtectedRoute>
    );
    expect(await screen.findByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByTestId("secret")).toBeNull();
  });
});
