const Sequelize = require('sequelize')

require('dotenv/config')

// Use DATABASE_URL diretamente do .env
const sequelize = new Sequelize(process.env.db_connexion_data_base, {

  dialect: 'postgres',

  dialectOptions: {

    ssl: {

      require: true,

      rejectUnauthorized: false

    }

  }

})

module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize
}