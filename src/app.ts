import express from 'express'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'
import questRouter from './routes/quest.js'
import pointRouter from './routes/point.js'

const app = express()

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/quest', questRouter)
app.use('/point', pointRouter)


export default app
