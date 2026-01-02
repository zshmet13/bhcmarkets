import { forwardRef, type AnchorHTMLAttributes, type ElementType, type ReactNode } from "react";
import styled, { css } from "styled-components";
import type { DefaultTheme } from "styled-components";

type MenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  as?: ElementType;
  to?: string;
  end?: boolean;
};

const getActiveStyles = (theme: DefaultTheme): ReturnType<typeof css> => css`
  color: ${theme.colors.text.primary};
  background: ${theme.gradients.primarySoft};
  box-shadow: inset 0 0 0 1px ${theme.colors.border.accent};
`;

const StyledMenuLink = styled.a<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weightMedium};
  letter-spacing: 0.01em;
  transition: ${({ theme }) => theme.transitions.base};
  position: relative;
  isolation: isolate;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }

  ${({ $active, theme }) => $active && getActiveStyles(theme)};

  &[data-active="true"],
  &[aria-current="page"] {
    ${({ theme }) => getActiveStyles(theme)};
  }

  &::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: ${({ theme }) => theme.radii.pill};
    background: ${({ theme }) => theme.colors.primary};
    opacity: 0;
    transition: ${({ theme }) => theme.transitions.base};
  }

  ${({ $active }) =>
    $active &&
    css`
      &::before {
        opacity: 1;
      }
    `}

  &[data-active="true"]::before,
  &[aria-current="page"]::before {
    opacity: 1;
  }
`;

export const MenuLink = forwardRef<HTMLAnchorElement, MenuLinkProps>(
  ({ icon, label, active = false, ...props }, ref) => (
    <StyledMenuLink
      ref={ref}
      $active={active}
      data-active={active ? "true" : undefined}
      {...props}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span>{label}</span>
    </StyledMenuLink>
  )
);

MenuLink.displayName = "MenuLink";

export default MenuLink;
