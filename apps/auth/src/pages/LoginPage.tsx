/**
 * Login page component
 * Handles user authentication with email and password
 * Uses @repo/ui components for consistent styling
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailInput, PasswordInput, Button, Alert } from "@repo/ui";
import styled from "styled-components";
import { login, getErrorMessage } from "../lib/authApi";
import { redirectAfterLogin } from "../lib/redirectUtils";

// Styled components for layout
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.md};
`;

const LoginCard = styled.div`
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

/**
 * LoginPage component
 * Provides email/password authentication form
 * Redirects to dashboard on successful login
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call login API
      await login({ email, password });
      
      // Redirect to post-login page
      redirectAfterLogin();
    } catch (err) {
      // Display user-friendly error message
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <Title>Sign In</Title>
        
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
          <PasswordInput
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your password"
          />
          
          <ButtonContainer>
            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              fullWidth
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </ButtonContainer>
        </Form>
        
        {/* Link to registration page */}
        <LinkText>
          Don't have an account?{" "}
          <Link href="/register">Sign up</Link>
        </LinkText>
      </LoginCard>
    </PageContainer>
  );
};
