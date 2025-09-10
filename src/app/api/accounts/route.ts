import { NextResponse } from "next/server";
import z from "zod";

import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import Account from "../../../../database/account.model";
import { AccountSchema } from "@/lib/validations";
import { extractFieldErrors } from "@/helpers/flatten";
import { ForbiddenError, ValidationError } from "@/lib/http-errors";

export async function GET() {
  try {
    await dbConnect();

    const accounts = await Account.find();

    return NextResponse.json(
      {
        success: true,
        data: accounts,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const validatedData = AccountSchema.safeParse(body);

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const existingAccount = await Account.findOne({
      provider: validatedData.provider,
      providerAccountId: validatedData.providerAccountId,
    });
    if (existingAccount)
      throw new ForbiddenError(
        "An account with the same provider and providerAccountId already exists.",
      );

    const newAccount = await Account.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: newAccount,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
