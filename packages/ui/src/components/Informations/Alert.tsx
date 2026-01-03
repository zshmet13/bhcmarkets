import React from "react";
import {
  AlertContainer,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertMessage,
  AlertClose,
} from "./Alert.styled";

// Alert component props interface
export interface AlertProps {
  // Severity level determines the color scheme
  variant?: "info" | "success" | "warning" | "error";
  // Optional title for the alert
  title?: string;
  // Main message content
  message: string;
  // Whether to show a close button
  closable?: boolean;
  // Callback when close button is clicked
  onClose?: () => void;
  // Additional CSS class name
  className?: string;
}

/**
 * Alert component for displaying important messages to users
 * Uses theme colors to provide visual feedback for different message types
 * Supports optional title, close button, and custom styling
 */
export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  message,
  closable = false,
  onClose,
  className,
}) => {
  // Icon selection based on variant type
  const getIcon = () => {
    switch (variant) {
      case "info":
        return "ℹ️";
      case "success":
        return "✓";
      case "warning":
        return "⚠️";
      case "error":
        return "✕";
      default:
        return "ℹ️";
    }
  };

  return (
    <AlertContainer $variant={variant} className={className} role="alert">
      <AlertIcon aria-hidden="true">{getIcon()}</AlertIcon>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{message}</AlertMessage>
      </AlertContent>
      {closable && onClose && (
        <AlertClose onClick={onClose} aria-label="Close alert">
          ✕
        </AlertClose>
      )}
    </AlertContainer>
  );
};
