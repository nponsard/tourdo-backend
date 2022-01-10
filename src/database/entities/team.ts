import {
  DataTypes,
  Model,
  Relationships,
} from "https://deno.land/x/denodb@v1.0.40/mod.ts";

import { User } from "./user.ts";

export class Team extends Model {
  static table = "team";

  static fields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    match_count: DataTypes.INTEGER,
    win_count: DataTypes.INTEGER,
  };

  static players() {
    return this.hasMany(User);
  }
}

Relationships.manyToMany(Team, User);
