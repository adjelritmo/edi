const db = require('./db')

const User = require('./User')

const Form = db.sequelize.define('forms', {

    title: {
        type: db.Sequelize.TEXT,
        allowNull: false,
    },

    description: {
        type: db.Sequelize.TEXT,
        allowNull: false,
    },

    status: {
        type: db.Sequelize.ENUM('active', 'paused', 'draft'),
        allowNull: false,
        defaultValue: 'active'
    },

    creatorId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    }

})

User.hasMany(Form, { foreignKey: 'creatorId', as: 'forms', onDelete: 'CASCADE' })

Form.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' })

//Form.sync({alter: true})

module.exports = Form