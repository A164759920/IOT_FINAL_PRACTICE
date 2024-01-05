const { DataTypes } = require("sequelize");
const seq = require("../mySQL.js");

const MODEL_Student = seq.define(
  "student",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "student",
    timestamps: false,
  }
);

module.exports = MODEL_Student;
