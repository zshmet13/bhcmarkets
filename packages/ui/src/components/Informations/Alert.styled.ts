import styled from "styled-components";

// Alert component for displaying important messages (info, success, warning, error)
// Supports different severity levels with appropriate colors and icons
export const AlertContainer = styled.div<{ $variant: "info" | "success" | "warning" | "error" }>`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid;
  gap: ${({ theme }) => theme.spacing.sm};
  
  // Set background, border, and text colors based on alert variant
  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "info":
        return theme.colors.info.light;
      case "success":
        return theme.colors.success.light;
      case "warning":
        return theme.colors.warning.light;
      case "error":
        return theme.colors.error.light;
      default:
        return theme.colors.neutral[100];
    }
  }};
  
  border-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "info":
        return theme.colors.info.main;
      case "success":
        return theme.colors.success.main;
      case "warning":
        return theme.colors.warning.main;
      case "error":
        return theme.colors.error.main;
      default:
        return theme.colors.neutral[300];
    }
  }};
  
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "info":
        return theme.colors.info.dark;
      case "success":
        return theme.colors.success.dark;
      case "warning":
        return theme.colors.warning.dark;
      case "error":
        return theme.colors.error.dark;
      default:
        return theme.colors.neutral[900];
    }
  }};
`;

export const AlertIcon = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

export const AlertContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const AlertTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

export const AlertMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

export const AlertClose = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;
