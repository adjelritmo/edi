const jwt = require('../configs/auth')

const middleware = (rolesPermitidos = []) => async (req, res, next) => {

    try {

        if (!req.headers.authorization) {

            return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido!' })

        }

        const parts = req.headers.authorization.split(" ")

        if (parts.length !== 2 || parts[0] !== 'Bearer') {

            return res.status(401).json({ mensagem: 'Formato de token inválido. Use: Bearer [token]' })

        }

        let token = parts[1]

        if (token.startsWith('"') && token.endsWith('"')) {

            token = token.slice(1, -1)

        }

        const decoded = jwt.checkToken(token)

        if (!decoded) {

            return res.status(401).json({ mensagem: 'Token inválido ou expirado!' })

        }

        if (!decoded.user) {

            return res.status(401).json({ mensagem: 'Estrutura do token inválida!' })

        }

        req.user = decoded.user

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(req.user.role)) {

            return res.status(403).json({ mensagem: `Acesso negado. Apenas ${rolesPermitidos.join(', ')} podem acessar!` })

        }

        next()

    } catch (error) {

        return res.status(500).json({ mensagem: 'Erro interno no servidor!', error: error.message })
    
    }

}

module.exports = middleware