import { NextResponse } from "next/server";
import { z } from "zod";

import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { AccountSchema } from "@/lib/validations";
import Account from "../../../../../database/account.model";
import { extractFieldErrors } from "@/helpers/flatten";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();

  try {
    await dbConnect();

    const validatedData = AccountSchema.partial().safeParse({
      providerAccountId,
    });

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const account = await Account.findOne({ providerAccountId });
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
