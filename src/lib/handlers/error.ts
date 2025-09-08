import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { RequestError, ValidationError } from "../http-errors";

export type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError)
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );

  if (error instanceof ZodError) {
    const treeifiedError = z.treeifyError(error);

    const flattenedErrors: Record<string, string[]> = {};

    const extractErrors = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object") {
          if (Array.isArray(value)) {
            flattenedErrors[fullKey] = value;
          } else if ("_errors" in value && Array.isArray(value._errors)) {
            flattenedErrors[fullKey] = value._errors;
          } else {
            extractErrors(value, fullKey);
          }
        }
      });
    };

    extractErrors(treeifiedError);

    const validationError = new ValidationError(flattenedErrors);

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }

  if (error instanceof Error)
    return formatResponse(responseType, 500, error.message);

  return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
