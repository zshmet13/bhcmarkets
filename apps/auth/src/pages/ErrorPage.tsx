/**
 * Error page component
 * Displays error messages and provides navigation options
 * Used for route not found and general error handling
 */

import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { Button, Alert } from "@repo/ui";
import styled from "styled-components";

// Styled components for layout
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ErrorCard = styled.div`
  background: white;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.elevations.md};
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.error.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral[900]};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.neutral[600]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

/**
 * ErrorPage component
 * Displays user-friendly error messages
 * Provides navigation options to recover from errors
 */
export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as any;
  
  // Determine error details
  const errorCode = error?.status || 500;
  const errorTitle = error?.statusText || "Something went wrong";
  const errorMessage = error?.message || "An unexpected error occurred. Please try again.";

  // Handler to go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handler to go to login
  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <PageContainer>
      <ErrorCard>
        <ErrorCode>{errorCode}</ErrorCode>
        <ErrorTitle>{errorTitle}</ErrorTitle>
        <ErrorMessage>{errorMessage}</ErrorMessage>
        
        <ButtonGroup>
          <Button onClick={handleGoBack} variant="outlined">
            Go Back
          </Button>
          <Button onClick={handleGoToLogin}>
            Go to Login
          </Button>
        </ButtonGroup>
      </ErrorCard>
    </PageContainer>
  );
};
