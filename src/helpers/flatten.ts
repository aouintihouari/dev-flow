export type ZodErrorTree = {
  _errors?: string[];
  errors?: string[];
  properties?: Record<string, ZodErrorTree>;
  [key: string]: unknown;
};

export const extractFieldErrors = (
  tree: ZodErrorTree,
): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};

  const entries = tree.properties
    ? Object.entries(tree.properties)
    : Object.entries(tree);

  for (const [key, value] of entries) {
    if (key === "_errors" || key === "errors" || key === "properties") continue;

    if (typeof value === "object" && value !== null) {
      const node = value as ZodErrorTree;
      if (node._errors && node._errors.length > 0)
        fieldErrors[key] = node._errors;
      else if (node.errors && node.errors.length > 0)
        fieldErrors[key] = node.errors;
    }
  }

  return fieldErrors;
};
