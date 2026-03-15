const Sequelize = require('sequelize')

require('dotenv/config')


const sequelize = new Sequelize(process.env.database_name, process.env.user, process.env.password, {

  host: process.env.host_user,
  
  dialect: 'postgres',
  
  dialectOptions: {
  
    ssl: {
  
      require: false,
  
      rejectUnauthorized: false
  
    },

    ssl: false
  
  }

})

module.exports = {

  Sequelize: Sequelize,

  sequelize: sequelize

}