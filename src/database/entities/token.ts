import {
  DataTypes,
  Model,
  Relationships,
} from "https://deno.land/x/denodb/mod.ts";

import { User } from "./user.ts";
export class Token extends Model {
  static table = "token";

  static fields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userID: { type: DataTypes.INTEGER, allowNull: false },
    accessHash: DataTypes.STRING,
  };

  static user() {
    return this.hasOne(User);
  }
}

Relationships.belongsTo(Token, User);
