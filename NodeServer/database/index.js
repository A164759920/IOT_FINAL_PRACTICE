//导入分数模型
const MODEL_Scorelist = require("./model/scorelist.model.js");
const MODEL_Student = require("./model/student.model.js");
//导入当前连接数据库
const seq = require("./mySQL.js");
//导入操作符

MODEL_Student.hasOne(MODEL_Scorelist, { foreignKey: "stuid", as: "score" });
MODEL_Scorelist.belongsTo(MODEL_Student, {
  foreignKey: "stuid",
  as: "student",
});

/**
 * @description 查询所有学生信息
 */
function getAllStudents() {
  return new Promise((resolve, reject) => {
    MODEL_Student.findAll()
      .then((raw_students) => {
        students = raw_students.map((student) => student.dataValues);
        resolve(students);
      })
      .catch((error) => {
        // console.error("查询失败");
        reject(error);
      });
  });
}

/**
 * @param {Number} stuid 学号
 * @param {Array} scores 分数
 * @param {Number} scoreSum 总分
 * @description 添加一条分数记录
 */
function addScore(stuid, scores, scoreSum) {
  const [no1 = 0, no2 = 0, no3 = 0, no4 = 0, no5 = 0, no6 = 0] =
    scores.map(Number);
  const scoreRecord = {
    stuid: parseInt(stuid, 10),
    no1,
    no2,
    no3,
    no4,
    no5,
    no6,
    sum: scoreSum,
  };
  return MODEL_Scorelist.create(scoreRecord)
    .then((result) => {
      console.log(result.toJSON());
      return result.toJSON();
    })
    .catch((error) => {
      // console.error("写入数据失败:", error);
      throw error;
    });
}

/**
 * @param {Number} stuid 学号
 * @description 根据学号删除一条记录
 */
function deleteScoreByID(stuid) {
  const parsedStuId = parseInt(stuid, 10);
  return MODEL_Scorelist.destroy({ where: { stuid: parsedStuId } })
    .then((result) => {
      console.log(`已删除学生ID为 ${stuid} 的成绩记录`);
      return result;
    })
    .catch((error) => {
      console.error("删除数据失败:");
      throw error;
    });
}

module.exports = {
  getAllStudents,
  addScore,
  deleteScoreByID,
};
