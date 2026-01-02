import styled, { css } from "styled-components";
// TODO: tighten once styled-components typings are wired up in the workspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThemeLike = any;

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

type BadgeProps = {
  variant?: BadgeVariant;
};

const variants = (theme: ThemeLike): Record<BadgeVariant, ReturnType<typeof css>> => ({
  default: css`
    background: rgba(148, 163, 184, 0.16);
    color: ${theme.colors.text.primary};
  `,
  success: css`
    background: rgba(59, 207, 124, 0.16);
    color: ${theme.colors.status.success};
  `,
  warning: css`
    background: rgba(255, 179, 71, 0.14);
    color: ${theme.colors.status.warning};
  `,
  danger: css`
    background: rgba(255, 90, 95, 0.14);
    color: ${theme.colors.status.danger};
  `,
  accent: css`
    background: rgba(0, 209, 178, 0.14);
    color: ${theme.colors.accent};
  `,
});

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }: { theme: ThemeLike }) => theme.spacing.xs};
  padding: 4px ${({ theme }: { theme: ThemeLike }) => theme.spacing.sm};
  border-radius: ${({ theme }: { theme: ThemeLike }) => theme.radii.pill};
  font-family: ${({ theme }: { theme: ThemeLike }) => theme.typography.fontFamily};
  font-weight: ${({ theme }: { theme: ThemeLike }) => theme.typography.weightSemiBold};
  font-size: ${({ theme }: { theme: ThemeLike }) => theme.typography.sizes.xs};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  ${({ theme, variant = "default" }: { theme: ThemeLike; variant?: BadgeVariant }) => {
    const styles = variants(theme);
    return styles[(variant ?? "default") as BadgeVariant];
  }}
`;

export default Badge;
