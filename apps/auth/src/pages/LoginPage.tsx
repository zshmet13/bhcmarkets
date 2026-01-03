/**
 * Login Page.
 * 
 * User login interface with email and password.
 */

import { useState, FormEvent } from "react";
import { useAuth, useAuthRedirect } from "../features/auth/auth.hooks.js";
import { EmailInput, PasswordInput, Button } from "@repo/ui";

export function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const redirectUrl = useAuthRedirect();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    try {
      await login({ email, password });
      
      // Redirect after successful login
      window.location.href = redirectUrl;
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Login</h1>
      
      {(error || localError) && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          backgroundColor: "#fee", 
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c00"
        }}>
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#0066cc" }}>
            Register
          </a>
        </p>
        <p>
          <a href="/forgot-password" style={{ color: "#0066cc" }}>
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
