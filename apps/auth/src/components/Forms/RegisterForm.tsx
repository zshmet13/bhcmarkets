import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { Button, TextField } from "@repo/ui";
import { createAuthClient, type RegisterRequest, ApiError } from "../../lib/api-client";
import { useAuth } from "../AuthContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 90, 95, 0.08);
  border: 1px solid rgba(255, 90, 95, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.status.danger};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: ${({ theme }) => theme.typography.lineHeights.normal};
  display: flex;
  align-items: start;
  gap: ${({ theme }) => theme.spacing.sm};

  &::before {
    content: "⚠";
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const SuccessMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(50, 215, 75, 0.08);
  border: 1px solid rgba(50, 215, 75, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.status.success};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: ${({ theme }) => theme.typography.lineHeights.normal};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &::before {
    content: "✓";
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const PasswordStrength = styled.div<{ $strength: number }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

const StrengthBar = styled.div<{ $active: boolean; $strength: number }>`
  flex: 1;
  height: 4px;
  border-radius: ${({ theme }) => theme.radii.xs};
  background: ${({ $active, $strength, theme }) => {
    if (!$active) return theme.colors.border.subtle;
    if ($strength <= 1) return theme.colors.status.danger;
    if ($strength === 2) return theme.colors.warning;
    return theme.colors.status.success;
  }};
  transition: all 0.3s ease;
`;

const PasswordHint = styled.div<{ $strength: number }>`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ $strength, theme }) => {
    if ($strength === 0) return theme.colors.text.muted;
    if ($strength <= 1) return theme.colors.status.danger;
    if ($strength === 2) return theme.colors.warning;
    return theme.colors.status.success;
  }};
  margin-top: -${({ theme }) => theme.spacing.xs};
  line-height: ${({ theme }) => theme.typography.lineHeights.snug};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border.subtle};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TermsText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.weightMedium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

export interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const calculatePasswordStrength = (password: string): number => {
  if (password.length === 0) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(3, Math.floor(strength / 2));
};

const getPasswordHintText = (strength: number): string => {
  if (strength === 0) return "Password must be at least 8 characters";
  if (strength === 1) return "Weak password - add uppercase, numbers, or symbols";
  if (strength === 2) return "Good password - consider adding more complexity";
  return "Strong password";
};

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const authClient = createAuthClient();

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (passwordStrength < 1) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: email.trim(),
        password,
        issueSession: true,
      };

      const result = await authClient.register(registerData);

      if ("tokens" in result) {
        login(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      }

      setSuccess(true);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "EMAIL_ALREADY_REGISTERED":
            setError("This email is already registered. Please sign in instead.");
            break;
          case "NETWORK_ERROR":
            setError("Network error. Please check your connection and try again.");
            break;
          default:
            setError("Registration failed. Please try again.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>Registration successful! Redirecting...</SuccessMessage>}

      <InputGroup>
        <TextField
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
          autoFocus
        />

        <div>
          <TextField
            id="password"
            type="password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          {password && (
            <>
              <PasswordStrength $strength={passwordStrength}>
                {[0, 1, 2, 3].map((i) => (
                  <StrengthBar
                    key={i}
                    $active={i < passwordStrength}
                    $strength={passwordStrength}
                  />
                ))}
              </PasswordStrength>
              <PasswordHint $strength={passwordStrength}>
                {getPasswordHintText(passwordStrength)}
              </PasswordHint>
            </>
          )}
        </div>

        <TextField
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
          error={
            confirmPassword && password !== confirmPassword
              ? "Passwords do not match"
              : undefined
          }
        />
      </InputGroup>

      <TermsText>
        By creating an account, you agree to our{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
      </TermsText>

      <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg">
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      {onSwitchToLogin && (
        <>
          <Divider>or</Divider>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToLogin}
            disabled={loading}
            fullWidth
            size="lg"
          >
            Sign In to Existing Account
          </Button>
        </>
      )}
    </Form>
  );
};

export default RegisterForm;
