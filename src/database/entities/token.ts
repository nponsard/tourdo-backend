import { DataTypes, Model } from "https://deno.land/x/denodb/mod.ts";

export class Token extends Model {
  static table = "token";

  static fields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userID: { type: DataTypes.INTEGER, allowNull: false },
    accessHash: DataTypes.STRING,
    
  };
}
