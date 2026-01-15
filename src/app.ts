import 'dotenv/config'

import express, {Request, Response} from 'express'
import path from "path";
// フロントバック分けて開発する場合に、異なるドメインからのアクセスを許可するために使用
import cors from 'cors';
import indexRouter from './routes/index.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import supabase from "./libs/supabase.js";
// import {VerifyOtpParams} from "@supabase/supabase-js";

const app = express()

// ミドルウェア設定
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// views設定
app.use(express.static('views'))
app.set('views', path.join(path.dirname(''), 'views'))
app.set('view engine', 'ejs')

// データベース接続確認用エンドポイント
app.get('/health', async (_req, res) => {
    const { data, error } = await supabase
        .from('auth.users')
        .select('id')
        .limit(1)

    if (error) {
        console.error(error)
        return res.status(500).json({ ok: false, error: error.message })
    }

    res.json({ ok: true })
})


app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve('views/index.html'));
});

// 新規登録画面
app.get('/signup', (req, res) => {
    res.sendFile(path.resolve('views/signup.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})

// ルーティング
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/', indexRouter)

export default app
