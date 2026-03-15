const db = require('./db')

const Dimension = require('./Dimension')

const Form = require('./Form')

const Question = db.sequelize.define('questions', {

    text: {
        type: db.Sequelize.TEXT('long'),
        allowNull: false,
    },

    description: {
        type: db.Sequelize.TEXT,
        allowNull: true
    },

    type: {
        type: db.Sequelize.ENUM('text', 'textarea', 'radio', 'checkbox', 'dropdown', 'date', 'rating'),
        allowNull: false,
    },

    order_in_dimension: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },

    isRequired: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    helpText: {
        type: db.Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Is required answer'
    },

    options: {
        type: db.Sequelize.JSONB,
        allowNull: true
    },

    dimensionId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Dimension,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },

    formId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Form,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    }

})

Dimension.hasMany(Question, { foreignKey: 'dimensionId', as: 'questions', onDelete: 'CASCADE' })

Question.belongsTo(Dimension, { foreignKey: 'dimensionId', as: 'dimension' })

Form.hasMany(Question, { foreignKey: 'formId', as: 'questions', onDelete: 'CASCADE' })

Question.belongsTo(Form, { foreignKey: 'formId', as: 'form' })

//Question.sync({alter: true})

module.exports = Question