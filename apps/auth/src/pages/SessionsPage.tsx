/**
 * Sessions management page
 * Displays and manages active user sessions
 * Allows users to view session details and revoke individual or all sessions
 */

import React, { useState, useEffect } from "react";
import { Button, Card, Alert, Loader } from "@repo/ui";
import styled from "styled-components";
import { getSessions, logout, logoutAll, getErrorMessage, type Session } from "../lib/authApi";
import { redirectToLogin } from "../lib/redirectUtils";

// Styled components for layout
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral[900]};
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SessionCard = styled(Card)<{ $isCurrent?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  ${({ $isCurrent, theme }) =>
    $isCurrent &&
    `
    border: 2px solid ${theme.colors.primary.main};
    background-color: ${theme.colors.primary.light};
  `}
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SessionInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral[900]};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SessionDetail = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

/**
 * SessionsPage component
 * Lists all active sessions and provides controls to manage them
 * Identifies the current session and allows revoking individual or all sessions
 */
export const SessionsPage: React.FC = () => {
  // Component state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Fetch sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load sessions from API (requires userId - in real app, get from auth context)
  const loadSessions = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // TODO: Get userId from auth context or token
      // For now, we'll need to pass it somehow
      // This is a placeholder - in real implementation, extract from token
      const userId = localStorage.getItem("userId") || "";
      
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }
      
      const sessionsList = await getSessions(userId);
      setSessions(sessionsList);
      
      // Identify current session (can be done by comparing session ID in token)
      // For now, just mark the most recent as current
      if (sessionsList.length > 0) {
        setCurrentSessionId(sessionsList[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke a specific session
  const handleRevokeSession = async (sessionId: string, userId: string) => {
    try {
      await logout({ sessionId, userId, reason: "manual" });
      
      // If revoking current session, redirect to login
      if (sessionId === currentSessionId) {
        redirectToLogin();
        return;
      }
      
      // Reload sessions list
      await loadSessions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Revoke all sessions except current
  const handleRevokeAllOthers = async () => {
    if (!currentSessionId) return;
    
    try {
      // TODO: Get userId from auth context
      const userId = localStorage.getItem("userId") || "";
      
      await logoutAll({
        userId,
        excludeSessionId: currentSessionId,
        reason: "logout_all",
      });
      
      // Reload sessions list
      await loadSessions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Container>
          <LoaderContainer>
            <Loader size="large" />
          </LoaderContainer>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Active Sessions</Title>
          {sessions.length > 1 && (
            <Button onClick={handleRevokeAllOthers} variant="outlined">
              Revoke All Other Sessions
            </Button>
          )}
        </Header>

        {error && (
          <Alert
            variant="error"
            message={error}
            closable
            onClose={() => setError("")}
          />
        )}

        {sessions.length === 0 ? (
          <EmptyState>
            <p>No active sessions found.</p>
          </EmptyState>
        ) : (
          <SessionsList>
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              
              return (
                <SessionCard key={session.id} $isCurrent={isCurrent}>
                  <SessionHeader>
                    <SessionInfo>
                      <SessionTitle>
                        {session.userAgent || "Unknown Device"}
                        {isCurrent && <Badge>Current Session</Badge>}
                      </SessionTitle>
                      <SessionDetail>
                        <strong>IP Address:</strong> {session.ipAddress || "Unknown"}
                      </SessionDetail>
                      <SessionDetail>
                        <strong>Created:</strong> {formatDate(session.createdAt)}
                      </SessionDetail>
                      <SessionDetail>
                        <strong>Last Active:</strong> {formatDate(session.lastSeenAt)}
                      </SessionDetail>
                      <SessionDetail>
                        <strong>Expires:</strong> {formatDate(session.expiresAt)}
                      </SessionDetail>
                    </SessionInfo>
                  </SessionHeader>
                  
                  <ButtonGroup>
                    <Button
                      onClick={() => handleRevokeSession(session.id, session.userId)}
                      variant="outlined"
                      size="small"
                    >
                      {isCurrent ? "Sign Out" : "Revoke Session"}
                    </Button>
                  </ButtonGroup>
                </SessionCard>
              );
            })}
          </SessionsList>
        )}
      </Container>
    </PageContainer>
  );
};
