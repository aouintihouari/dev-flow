import { NextResponse } from "next/server";
import { z } from "zod";

import User from "../../../../database/user.model";
import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validations";
import { ValidationError } from "@/lib/http-errors";
import { extractFieldErrors } from "@/helpers/flatten";

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find();

    return NextResponse.json(
      {
        success: true,
        data: users,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const { email, username } = validatedData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists.");

    const existingUsername = await User.findOne({ username });
    if (existingUsername) throw new Error("Username already exists.");

    const newUser = await User.create(validatedData.data);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
