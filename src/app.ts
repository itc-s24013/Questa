import express from 'express'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import questRouter from './routes/quest.js'
import adminRouter from './routes/admin.js'

const app = express()

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/quest', questRouter)
app.use('/admin', adminRouter)


export default app
