const express = require('express')

const guest = require('./routes/guest')

const user = require('./routes/user')

const admin = require('./routes/admin')

const password = require('./routes/forgets/forgot')

const coordinator = require('./routes/coordinator')

const cors = require('cors')

const middleware = require('./middleware/midleconfig')

const Center = require('./models/Center')
const Submission = require('./models/Submission')
const db = require('./models/db')

const app = express()

const port = 53493

const host = '0.0.0.0'

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/api/guest', guest)

app.use('/api/password', password)

app.use('/api/admin', middleware(['admin', 'admin_alpha']), admin)

app.use('/api/coordinator', middleware(['coordinator']), coordinator)

app.use('/api/user', middleware(['member']), user)



app.listen(port, host, async() => {

  console.log(`Server is running on port ${port}`)

  //await Center.create({ name: "CeDRI", code: "cedri", address: "Bragança", email: "cedri@ipb.pt", country: "Portugal", city: "Bragança", research_area: "Ciencias e Tecnologias" })

})