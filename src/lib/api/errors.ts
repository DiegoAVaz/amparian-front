import { ApiError, type ApiErrorFieldDetail } from "./client";

export type ApiFieldErrors<TField extends string = string> = Partial<
  Record<TField, string>
>;

export type ApiErrorFieldMap<TField extends string = string> = Record<
  string,
  TField | null
>;

export type ApiFormErrorResult<TField extends string = string> = {
  fieldErrors: ApiFieldErrors<TField>;
  formError: string;
};

type ApiFieldErrorOptions<TField extends string = string> = {
  fieldMap?: ApiErrorFieldMap<TField>;
};

export function normalizeApiFieldPath(path: string): string {
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  const withoutSource = ["body", "query", "params"].includes(segments[0] ?? "")
    ? segments.slice(1)
    : segments;

  return withoutSource.filter((segment) => !isNumericSegment(segment)).join(".");
}

export function getApiFieldErrors<TField extends string = string>(
  error: unknown,
  options: ApiFieldErrorOptions<TField> = {},
): ApiFieldErrors<TField> {
  if (!(error instanceof ApiError)) {
    return {};
  }

  return apiFieldsToFieldErrors(error.getFieldErrors(), options);
}

export function getApiFormError<TField extends string = string>(
  error: unknown,
  fallbackMessage: string,
  options: ApiFieldErrorOptions<TField> = {},
): ApiFormErrorResult<TField> {
  if (!(error instanceof ApiError)) {
    return {
      fieldErrors: {},
      formError: fallbackMessage,
    };
  }

  const fieldErrors = getApiFieldErrors(error, options);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    formError: hasFieldErrors ? "" : error.message,
  };
}

function apiFieldsToFieldErrors<TField extends string>(
  fields: ApiErrorFieldDetail[],
  options: ApiFieldErrorOptions<TField>,
): ApiFieldErrors<TField> {
  const fieldErrors: ApiFieldErrors<TField> = {};

  for (const field of fields) {
    const normalizedPath = normalizeApiFieldPath(field.path);
    const mappedField = resolveMappedField(field.path, normalizedPath, options.fieldMap);

    if (!mappedField || fieldErrors[mappedField]) {
      continue;
    }

    fieldErrors[mappedField] = field.message;
  }

  return fieldErrors;
}

function resolveMappedField<TField extends string>(
  rawPath: string,
  normalizedPath: string,
  fieldMap?: ApiErrorFieldMap<TField>,
): TField | null {
  if (fieldMap) {
    const exactMapped = fieldMap[rawPath];
    if (exactMapped !== undefined) return exactMapped;

    const normalizedMapped = fieldMap[normalizedPath];
    if (normalizedMapped !== undefined) return normalizedMapped;
  }

  return normalizedPath ? (normalizedPath as TField) : null;
}

function isNumericSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}
