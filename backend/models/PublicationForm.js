const db = require('./db')

const Form = require('./Form')

const Center = require('./Center')

const User = require('./User')

const PublicationForm = db.sequelize.define('publication_forms', {

    startDate: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },

    endDate: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
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

    centerId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Center,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    },

    coordinatorId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
    }

})

// Relacionamentos
Form.hasMany(PublicationForm, { foreignKey: 'formId', as: 'publications', onDelete: 'CASCADE' })

PublicationForm.belongsTo(Form, { foreignKey: 'formId', as: 'form' })

Center.hasMany(PublicationForm, { foreignKey: 'centerId', as: 'publications', onDelete: 'CASCADE' })

PublicationForm.belongsTo(Center, { foreignKey: 'centerId', as: 'center' })

//PublicationForm.sync({alter: true})

module.exports = PublicationForm