"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Supported input types for the FormField component. */
type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select"

export interface SelectOption {
  value: string
  label: string
}

export interface FormFieldProps {
  /** German label text displayed above the input. */
  label: string
  /** HTML name attribute — also used as the input id. */
  name: string
  /** Input type — determines which element to render. */
  type: FormFieldType
  /** German placeholder text. */
  placeholder?: string
  /** When true, marks the field as required with a subtle asterisk. */
  required?: boolean
  /** German error message. Displayed in red below the input when set. */
  error?: string
  /** Options for select type inputs. */
  options?: SelectOption[]
  className?: string
  /** Minimum value for number inputs (e.g., team size). */
  min?: number | string
  /** Maximum value for number inputs. */
  max?: number | string
  /** Controlled value. */
  value?: string | number
  /** Change handler. */
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
  /** Additional props forwarded to the input element. */
  [key: string]: unknown
}

/** Shared input base classes for consistent styling across all input types. */
const inputBaseClasses =
  "w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"

const inputErrorClasses = "border-error focus:border-error focus:ring-error/20"

/**
 * Form input wrapper for LP lead capture forms.
 *
 * Renders the appropriate input element for each type with:
 * - German label with required asterisk
 * - Consistent LP visual style (slightly rounder than shadcn inputs)
 * - Accessible label↔input association via htmlFor/id
 * - ARIA invalid + describedby for error state
 * - German placeholder examples and error messages
 *
 * "use client" — error state display and input event handlers.
 *
 * @example
 * <FormField
 *   label="Name"
 *   name="name"
 *   type="text"
 *   placeholder="Max Mustermann"
 *   required
 *   error={errors.name}
 * />
 *
 * <FormField
 *   label="Teamgröße"
 *   name="teamSize"
 *   type="number"
 *   placeholder="z.B. 10"
 *   min={1}
 *   max={500}
 * />
 *
 * <FormField
 *   label="Standort"
 *   name="city"
 *   type="select"
 *   options={[
 *     { value: "berlin", label: "Berlin" },
 *     { value: "hamburg", label: "Hamburg" },
 *   ]}
 * />
 */
export function FormField({
  label,
  name,
  type,
  placeholder,
  required = false,
  error,
  options,
  className,
  min,
  max,
  value,
  onChange,
  ...rest
}: FormFieldProps) {
  const inputId = name
  const errorId = error ? `${name}-error` : undefined
  const hasError = Boolean(error)

  const sharedInputProps = {
    id: inputId,
    name,
    required,
    "aria-invalid": hasError || undefined,
    "aria-describedby": errorId,
    className: cn(inputBaseClasses, hasError && inputErrorClasses),
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-foreground leading-none"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-error" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input element */}
      {type === "textarea" ? (
        <textarea
          {...sharedInputProps}
          placeholder={placeholder}
          value={value as string | undefined}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          rows={4}
          className={cn(sharedInputProps.className, "resize-y min-h-[100px]")}
        />
      ) : type === "select" ? (
        <select
          {...sharedInputProps}
          value={value as string | undefined}
          onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
          className={cn(
            sharedInputProps.className,
            // Ensure native select arrow is visible
            "appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.75rem_center] pr-10"
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...sharedInputProps}
          type={type}
          placeholder={placeholder}
          value={value as string | number | undefined}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          // Mobile keyboard hints
          inputMode={
            type === "tel"
              ? "tel"
              : type === "email"
                ? "email"
                : type === "number"
                  ? "numeric"
                  : undefined
          }
          min={type === "number" ? min : undefined}
          max={type === "number" ? max : undefined}
        />
      )}

      {/* German error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-error leading-none mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  )
}
