import { Schema, Types, model, models } from "mongoose";

export interface IAccount {
  userId: Types.ObjectId;
  name: string;
  provider: string;
  providerAccountId: string;
  image?: string;
  password?: string;
}

export type IAccountDoc = IAccount & Document;

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
    },
    providerAccountId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Account = models?.Account || model("Account", AccountSchema);

export default Account;
