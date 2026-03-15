const db = require('./db')

const Form = require('./Form')

const User = require('./User')

const Center = require('./Center')




const Submission = db.sequelize.define('submissions', {

    
    submittedAt: {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    },

    timeSpent: {
        type: db.Sequelize.STRING,
        allowNull: true
    },

    status: {
        type: db.Sequelize.ENUM('uncompleted', 'completed'),
        allowNull: true,
        defaultValue: 'completed'
    },

    point: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    leadership: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },


    innovation: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    collaboration: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    engagement: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    skills: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    motivation: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    others: {
        type: db.Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },

    dimensionsValues: {
        type: db.Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
    },

    formId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Form,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },

    userId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },

    centerId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Center,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    }

})

// Relacionamentos
Form.hasMany(Submission, { foreignKey: 'formId', as: 'submissions', onDelete: 'CASCADE' })

Submission.belongsTo(Form, { foreignKey: 'formId', as: 'form' })

User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions', onDelete: 'CASCADE' })

Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Center.hasMany(Submission, { foreignKey: 'centerId', as: 'submissions', onDelete: 'CASCADE' })

Submission.belongsTo(Center, { foreignKey: 'centerId', as: 'center' })

//Submission.sync({alter: true})

module.exports = Submission