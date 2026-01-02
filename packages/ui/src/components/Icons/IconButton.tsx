import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styled, { css } from "styled-components";
import type { DefaultTheme } from "styled-components";

type IconButtonVariant = "ghost" | "primary" | "outline";
type IconButtonSize = "xs" | "sm" | "md";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children?: ReactNode;
}

const sizeMap: Record<IconButtonSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
};

const variantStyles = (theme: DefaultTheme) => ({
  ghost: css`
    background: rgba(255, 255, 255, 0.04);
    color: ${theme.colors.text.secondary};
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: ${theme.colors.text.primary};
    }
  `,
  primary: css`
    background: ${theme.gradients.primary};
    color: ${theme.colors.text.onAccent};
    &:hover {
      filter: brightness(1.08);
    }
  `,
  outline: css`
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.35);
    color: ${theme.colors.text.secondary};
    &:hover {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primaryHover};
    }
  `,
});

const StyledIconButton = styled.button<{ $size: number; $variant: IconButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.base};
  backdrop-filter: blur(6px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  ${({ $size }) => css`
    width: ${$size}px;
    height: ${$size}px;
  `}
  ${({ theme, $variant }) => {
    const styles = variantStyles(theme);
    return styles[$variant] ?? styles.ghost;
  }}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus},
      inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }
`;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "sm", children, ...props }, ref) => (
    <StyledIconButton ref={ref} $variant={variant} $size={sizeMap[size]} {...props}>
      {children}
    </StyledIconButton>
  )
);

IconButton.displayName = "IconButton";

export default IconButton;
