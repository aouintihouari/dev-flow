import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import slugify from "slugify";

import dbConnect from "@/lib/mongoose";
import handleError from "@/lib/handlers/error";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { ValidationError } from "@/lib/http-errors";
import { extractFieldErrors } from "@/helpers/flatten";

import User from "../../../../../database/user.model";
import Account from "../../../../../database/account.model";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const { name, username, email, image } = user;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [
          {
            name,
            username: slugifiedUsername,
            email,
            image,
          },
        ],
        { session },
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};
      if (existingUser.name !== name) updatedData.name = name;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          {
            _id: existingUser._id,
          },
          {
            $set: updatedData,
          },
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount)
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session },
      );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
    });
  } catch (err: unknown) {
    await session.abortTransaction();

    return handleError(err, "api") as APIErrorResponse;
  } finally {
    session.endSession();
  }
}
