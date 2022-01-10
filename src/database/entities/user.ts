import { DataTypes, Model } from "https://deno.land/x/denodb/mod.ts";
import { Token } from "./token.ts";
export class User extends Model {
  static table = "user";

  static fields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, length: 50 },
    password: DataTypes.STRING,
  };

  static tokens() {
    return this.hasMany(Token);
  }
}
