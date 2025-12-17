import express from 'express'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const app = express()

app.use('/', indexRouter)
app.use('/users', usersRouter)


export default app
