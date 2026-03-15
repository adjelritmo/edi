const Center = require('./Center')

const db = require('./db')

const User = db.sequelize.define('users', {

    firstName: {
        type: db.Sequelize.STRING(30),
        allowNull: false,
    },

    surname: {
        type: db.Sequelize.STRING(30),
        allowNull: false,
    },

    email: {
        type: db.Sequelize.STRING(100),
        allowNull: false,
    },

    country: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },

    professional_country: {
        type: db.Sequelize.STRING(50),
        allowNull: true
    },

    centerId: {
        type: db.Sequelize.INTEGER,
        references: {
            model: Center,
            key: 'id'
        },
        allowNull: true,
        onDelete: 'CASCADE'
    },

    gender: {
        type: db.Sequelize.ENUM("female", "male", "non-binary", "not answer"),
        allowNull: false
    },

    researchPosition: {
        type: db.Sequelize.ENUM("adm", "early stage researcher", "managerial staff", "professor", "senior researcher", "technical staff"),
        allowNull: false
    },

    bornDate: {
        type: db.Sequelize.DATE,
        allowNull: false,
    },

    role: {

        type: db.Sequelize.ENUM("admin_alpha", "admin", "coordinator", "member", "guest"),

        allowNull: false,

        defaultValue: 'member'

    },

    code: {

        type: db.Sequelize.STRING,

        allowNull: true

    },

    tokenChek: {

        type: db.Sequelize.TEXT,

        allowNull: true

    },

    password: {

        type: db.Sequelize.STRING,

        allowNull: false,

    }

})

Center.hasMany(User, { foreignKey: 'centerId', as: 'users', onDelete: 'CASCADE' })

User.belongsTo(Center, { foreignKey: 'centerId', as: 'center' })


//User.sync({ alter: true })

module.exports = User