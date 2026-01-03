/**
 * Registration page component
 * Handles new user account creation
 * Uses @repo/ui components for consistent styling
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailInput, PasswordInput, Button, Alert } from "@repo/ui";
import styled from "styled-components";
import { register, getErrorMessage } from "../lib/authApi";
import { redirectAfterLogin } from "../lib/redirectUtils";

// Styled components for layout (reusing similar structure to LoginPage)
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.md};
`;

const RegisterCard = styled.div`
  background: white;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.elevations.md};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral[900]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const LinkText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const PasswordHelperText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral[600]};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

/**
 * RegisterPage component
 * Provides user registration form with email and password
 * Validates password requirements before submission
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate password requirements (basic validation here, more strict on backend)
  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password before API call
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Call register API (issueSession defaults to true)
      const result = await register({ email, password, issueSession: true });
      
      // If session was issued, redirect to dashboard
      if ("tokens" in result) {
        redirectAfterLogin();
      } else {
        // If no session issued, redirect to login
        navigate("/login");
      }
    } catch (err) {
      // Display user-friendly error message
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <RegisterCard>
        <Title>Create Account</Title>
        
        {/* Display error alert if present */}
        {error && (
          <Alert
            variant="error"
            message={error}
            closable
            onClose={() => setError("")}
          />
        )}
        
        <Form onSubmit={handleSubmit}>
          {/* Email input field */}
          <EmailInput
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="you@example.com"
          />
          
          {/* Password input field */}
          <div>
            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Choose a strong password"
            />
            <PasswordHelperText>
              Must be at least 8 characters long
            </PasswordHelperText>
          </div>
          
          {/* Confirm password input field */}
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Confirm your password"
          />
          
          <ButtonContainer>
            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password || !confirmPassword}
              fullWidth
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </ButtonContainer>
        </Form>
        
        {/* Link to login page */}
        <LinkText>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </LinkText>
      </RegisterCard>
    </PageContainer>
  );
};
