const jwt = require('jsonwebtoken')

require('dotenv/config')

module.exports = {

  generateToken: (dados) => {

    return jwt.sign(dados, process.env.jwt_secret, { expiresIn: '3h' })

  },

  generateTokenCode: (dados) => {

    return jwt.sign(dados, process.env.jwt_secret, { expiresIn: '1m' })

  },

  generateTokenPassPort: (dados) => {

    return jwt.sign(dados, process.env.jwt_secret, { expiresIn: '5m' })

  },

  checkToken: (token) => {

    try {

      return jwt.verify(token, process.env.jwt_secret)

    } catch (err) {

      return null

    }

  }

}
