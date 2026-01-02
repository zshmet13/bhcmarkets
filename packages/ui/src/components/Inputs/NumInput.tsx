import { forwardRef, useState, type InputHTMLAttributes } from "react";
import styled from "styled-components";

export interface NumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
\tlabel?: string;
\terror?: string;
\thelpText?: string;
\tprefix?: string;
\tsuffix?: string;
\tformatting?: "currency" | "percent" | "decimal" | "integer";
\tdecimals?: number;
}

const InputWrapper = styled.div\`
\tdisplay: flex;
\tflex-direction: column;
\tgap: \${({ theme }) => theme.spacing.xs};
\twidth: 100%;
\`;

const Label = styled.label\`
\tfont-family: \${({ theme }) => theme.typography.fontFamily};
\tfont-size: \${({ theme }) => theme.typography.sizes.sm};
\tfont-weight: \${({ theme }) => theme.typography.weightMedium};
\tcolor: \${({ theme }) => theme.colors.text.secondary};
\ttext-transform: uppercase;
\tletter-spacing: 0.05em;
\`;

const InputContainer = styled.div\`
\tposition: relative;
\tdisplay: flex;
\talign-items: center;
\`;

const Affix = styled.span<{ \$position: "prefix" | "suffix" }>\`
\tposition: absolute;
\t\${({ \$position, theme }) =>
\t\t\$position === "prefix"
\t\t\t? \`left: \${theme.spacing.md};\`
\t\t\t: \`right: \${theme.spacing.md};\`}
\tcolor: \${({ theme }) => theme.colors.text.tertiary};
\tfont-family: "SF Mono", "Monaco", monospace;
\tfont-size: \${({ theme }) => theme.typography.sizes.base};
\tfont-weight: \${({ theme }) => theme.typography.weightMedium};
\tpointer-events: none;
\`;

const StyledInput = styled.input<{ \$hasPrefix: boolean; \$hasSuffix: boolean; \$hasError: boolean }>\`
\twidth: 100%;
\theight: 44px;
\tpadding-left: \${({ theme, \$hasPrefix }) =>
\t\t\$hasPrefix ? theme.spacing.xxxl : theme.spacing.md};
\tpadding-right: \${({ theme, \$hasSuffix }) =>
\t\t\$hasSuffix ? theme.spacing.xxxl : theme.spacing.md};
\tfont-family: "SF Mono", "Monaco", "Consolas", monospace;
\tfont-size: \${({ theme }) => theme.typography.sizes.base};
\tfont-weight: \${({ theme }) => theme.typography.weightMedium};
\tcolor: \${({ theme }) => theme.colors.text.primary};
\tbackground: \${({ theme }) => theme.colors.backgrounds.surface};
\tborder: 2px solid \${({ theme, \$hasError }) =>
\t\t\$hasError ? theme.colors.status.danger : theme.colors.border.default};
\tborder-radius: \${({ theme }) => theme.radii.md};
\ttransition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
\toutline: none;
\tletter-spacing: 0.02em;

\t&::placeholder {
\t\tcolor: \${({ theme }) => theme.colors.text.muted};
\t\topacity: 0.6;
\t}

\t&:hover:not(:disabled) {
\t\tborder-color: \${({ theme }) => theme.colors.border.accent};
\t}

\t&:focus {
\t\tborder-color: \${({ theme, \$hasError }) =>
\t\t\t\$hasError ? theme.colors.status.danger : theme.colors.primary};
\t\tbox-shadow: 0 0 0 4px \${({ theme, \$hasError }) =>
\t\t\t\$hasError ? "rgba(255, 90, 95, 0.2)" : theme.colors.focus};
\t}

\t&:disabled {
\t\topacity: 0.5;
\t\tcursor: not-allowed;
\t\tbackground: \${({ theme }) => theme.colors.backgrounds.soft};
\t}
\`;

const HelpText = styled.span<{ \$isError: boolean }>\`
\tfont-size: \${({ theme }) => theme.typography.sizes.xs};
\tcolor: \${({ theme, \$isError }) =>
\t\t\$isError ? theme.colors.status.danger : theme.colors.text.tertiary};
\tline-height: \${({ theme }) => theme.typography.lineHeights.snug};
\`;

const formatNumber = (value: string, formatting: string, decimals: number): string => {
\tconst num = parseFloat(value.replace(/[^0-9.-]/g, ""));
\tif (isNaN(num)) return "";

\tswitch (formatting) {
\t\tcase "currency":
\t\t\treturn num.toLocaleString("en-US", {
\t\t\t\tminimumFractionDigits: decimals,
\t\t\t\tmaximumFractionDigits: decimals,
\t\t\t});
\t\tcase "percent":
\t\t\treturn num.toFixed(decimals);
\t\tcase "integer":
\t\t\treturn Math.round(num).toString();
\t\tdefault:
\t\t\treturn num.toFixed(decimals);
\t}
};

export const NumInput = forwardRef<HTMLInputElement, NumInputProps>(
\t(
\t\t{
\t\t\tlabel,
\t\t\terror,
\t\t\thelpText,
\t\t\tprefix,
\t\t\tsuffix,
\t\t\tformatting = "decimal",
\t\t\tdecimals = 2,
\t\t\tvalue,
\t\t\tonChange,
\t\t\tonBlur,
\t\t\t...props
\t\t},
\t\tref
\t) => {
\t\tconst [localValue, setLocalValue] = useState("");
\t\tconst [isFocused, setIsFocused] = useState(false);
\t\tconst currentValue = value !== undefined ? String(value) : localValue;

\t\tconst handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
\t\t\tconst newValue = e.target.value;
\t\t\tsetLocalValue(newValue);
\t\t\tonChange?.(e);
\t\t};

\t\tconst handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
\t\t\tsetIsFocused(false);
\t\t\tconst formatted = formatNumber(currentValue, formatting, decimals);
\t\t\tsetLocalValue(formatted);
\t\t\tonBlur?.(e);
\t\t};

\t\tconst displayPrefix = prefix || (formatting === "currency" ? "$" : "");
\t\tconst displaySuffix = suffix || (formatting === "percent" ? "%" : "");

\t\treturn (
\t\t\t<InputWrapper>
\t\t\t\t{label && <Label>{label}</Label>}
\t\t\t\t<InputContainer>
\t\t\t\t\t{displayPrefix && <Affix \$position="prefix">{displayPrefix}</Affix>}
\t\t\t\t\t<StyledInput
\t\t\t\t\t\tref={ref}
\t\t\t\t\t\ttype="text"
\t\t\t\t\t\tinputMode="decimal"
\t\t\t\t\t\tvalue={isFocused ? currentValue : formatNumber(currentValue, formatting, decimals)}
\t\t\t\t\t\tonChange={handleChange}
\t\t\t\t\t\tonFocus={() => setIsFocused(true)}
\t\t\t\t\t\tonBlur={handleBlur}
\t\t\t\t\t\t\$hasPrefix={Boolean(displayPrefix)}
\t\t\t\t\t\t\$hasSuffix={Boolean(displaySuffix)}
\t\t\t\t\t\t\$hasError={Boolean(error)}
\t\t\t\t\t\t{...props}
\t\t\t\t\t/>
\t\t\t\t\t{displaySuffix && <Affix \$position="suffix">{displaySuffix}</Affix>}
\t\t\t\t</InputContainer>
\t\t\t\t{(error || helpText) && (
\t\t\t\t\t<HelpText \$isError={Boolean(error)}>{error || helpText}</HelpText>
\t\t\t\t)}
\t\t\t</InputWrapper>
\t\t);
\t}
);

NumInput.displayName = "NumInput";

export default NumInput;
