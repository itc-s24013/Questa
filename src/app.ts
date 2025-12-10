import express from 'express'
import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

const app = express()

app.use('/', indexRouter)
app.use('/users', usersRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

export default app
