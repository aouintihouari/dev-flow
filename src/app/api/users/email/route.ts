import { NextResponse } from "next/server";
import { z } from "zod";

import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { UserSchema } from "@/lib/validations";
import User from "../../../../../database/user.model";
import { extractFieldErrors } from "@/helpers/flatten";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    await dbConnect();

    const validatedData = UserSchema.partial().safeParse({ email });

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("User");

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
