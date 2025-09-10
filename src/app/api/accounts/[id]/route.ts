import { NextResponse } from "next/server";
import { z } from "zod";

import dbConnect from "@/lib/mongoose";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { AccountSchema } from "@/lib/validations";
import Account from "../../../../../database/account.model";
import { extractFieldErrors } from "@/helpers/flatten";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");

  try {
    await dbConnect();

    const account = await Account.findById(id);
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");

  try {
    await dbConnect();

    const account = await Account.findByIdAndDelete(id);
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");

  try {
    await dbConnect();

    const body = await request.json();

    const validatedData = AccountSchema.partial().safeParse(body);

    if (!validatedData.success) {
      const tree = z.treeifyError(validatedData.error);
      const fieldErrors = extractFieldErrors(tree);
      throw new ValidationError(fieldErrors);
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      validatedData.data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedAccount) throw new NotFoundError("Account");

    return NextResponse.json(
      { success: true, data: updatedAccount },
      { status: 200 },
    );
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
