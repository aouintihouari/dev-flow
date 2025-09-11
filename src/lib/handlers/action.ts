"use server";

import { Session } from "next-auth";
import { ZodError, z } from "zod";
import { ZodSchema } from "zod/v3";

import { extractFieldErrors } from "@/helpers/flatten";
import dbConnect from "../mongoose";
import { UnauthorizedError, ValidationError } from "../http-errors";
import { auth } from "../../../auth";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (err) {
      if (err instanceof ZodError) {
        const tree = z.treeifyError(err);
        const fieldErrors = extractFieldErrors(tree);
        return new ValidationError(fieldErrors);
      } else return new Error("Schema validation failed");
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();
    if (!session) return new UnauthorizedError();
  }

  await dbConnect();

  return { params, session };
}

export default action;
