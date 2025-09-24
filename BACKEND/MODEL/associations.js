const User = require("./User");
const Feedback = require("./Feedback");
const Time = require("./Time");

// Relacionamento: 1 usuário pode ter vários feedbacks
User.hasMany(Feedback, { foreignKey: "funcionarioId" });
Feedback.belongsTo(User, { foreignKey: "funcionarioId" });

// Relacionamento: 1 time pode ter vários usuários
Time.hasMany(User, { foreignKey: "timeId" });
User.belongsTo(Time, { foreignKey: "timeId" });

module.exports = { User, Feedback, Time };
