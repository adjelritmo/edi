const db = require('./db')

const Center = db.sequelize.define('centers', {

    name: {
        type: db.Sequelize.STRING(50),
        allowNull: false,
    },

    code: {
        type: db.Sequelize.STRING(20),
        allowNull: false,
    },

    email: {
        type: db.Sequelize.STRING(70),
        allowNull: false,
    },

    country: {
        type: db.Sequelize.STRING(70),
        allowNull: false,
    },

    city: {
        type: db.Sequelize.STRING(50),
        allowNull: false,
    },

    address: {
        type: db.Sequelize.STRING(50),
        allowNull: true,
    },

    research_area: {
        type: db.Sequelize.TEXT,
        allowNull: false,
    }

})

//Center.sync({alter: true})

module.exports = Center