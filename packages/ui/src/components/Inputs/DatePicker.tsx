import React from "react";
import {
  DatePickerContainer,
  DatePickerLabel,
  DatePickerInput,
  DatePickerError,
  DatePickerHelper,
} from "./DatePicker.style";

export interface DatePickerProps {
  // Label text for the input
  label?: string;
  // Input name attribute
  name?: string;
  // Current value (ISO date string or empty)
  value?: string;
  // Callback when date changes
  onChange?: (value: string) => void;
  // Error message to display
  error?: string;
  // Helper text to display below input
  helperText?: string;
  // Whether the input is required
  required?: boolean;
  // Whether the input is disabled
  disabled?: boolean;
  // Minimum allowed date (ISO string)
  min?: string;
  // Maximum allowed date (ISO string)
  max?: string;
  // Placeholder text
  placeholder?: string;
  // Additional CSS class
  className?: string;
}

/**
 * DatePicker component for selecting dates
 * Uses native HTML5 date input for accessibility and mobile support
 * Follows the UI library's styling patterns with theme tokens
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  min,
  max,
  placeholder,
  className,
}) => {
  // Handle input change and normalize to ISO date string
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <DatePickerContainer className={className}>
      {label && (
        <DatePickerLabel>
          {label}
          {required && <span aria-label="required"> *</span>}
        </DatePickerLabel>
      )}
      <DatePickerInput
        type="date"
        name={name}
        value={value || ""}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        $hasError={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
      />
      {error && (
        <DatePickerError id={`${name}-error`} role="alert">
          {error}
        </DatePickerError>
      )}
      {!error && helperText && (
        <DatePickerHelper id={`${name}-helper`}>
          {helperText}
        </DatePickerHelper>
      )}
    </DatePickerContainer>
  );
};
