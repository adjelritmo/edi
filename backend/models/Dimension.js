const db = require('./db')

const Form = require('./Form')

const Dimension = db.sequelize.define('dimensions', {

    title: {
        type: db.Sequelize.TEXT('long'),
        allowNull: false,
    },

    description: {
        type: db.Sequelize.STRING,
        allowNull: true,
    },

    order_in_form: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },

    emotion: {
        type: db.Sequelize.STRING,
        allowNull: false,
        defaultValue: 'others'
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

})

Form.hasMany(Dimension, { foreignKey: 'formId', as: 'dimensions', onDelete: 'CASCADE' })

Dimension.belongsTo(Form, { foreignKey: 'formId', as: 'form' })

//Dimension.sync({ alter: true })

module.exports = Dimension