const db = require('./db')

const Question = require('./Question')

const Submission = require('./Submission')

const Answer = db.sequelize.define('answers', {

    answer: {
        type: db.Sequelize.TEXT,
        allowNull: false
    },

    questionId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Question,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },

    responseId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Submission,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    }

})

// Relacionamentos
Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers', onDelete: 'CASCADE' })

Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' })

Submission.hasMany(Answer, { foreignKey: 'responseId', as: 'answers', onDelete: 'CASCADE' })

Answer.belongsTo(Submission, { foreignKey: 'responseId', as: 'response' })

//Answer.sync({force: true})

module.exports = Answer