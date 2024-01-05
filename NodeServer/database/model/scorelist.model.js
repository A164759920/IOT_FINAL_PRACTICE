const { DataTypes } = require("sequelize");
const seq = require("../mySQL.js");
// 定义ipinfo表中的元组(模型)

const MODEL_Scorelist = seq.define(
  "scorelist",
  {
    stuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    no1: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    no2: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    no3: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    no4: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    no5: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    no6: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
    sum: {
      type: DataTypes.FLOAT(20, 2),
      defaultValue: null,
    },
  },
  {
    tableName: "scorelist",
    timestamps: false,
  }
);

module.exports = MODEL_Scorelist;
