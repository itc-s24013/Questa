import 'dotenv/config'

import express, {Request, Response} from 'express'
// CSP設定　セキュリティ強化ミドルウェア
import helmet from 'helmet';
import crypto from 'crypto';

import path from "path";
import cookieParser from 'cookie-parser';
// フロントバック分けて開発する場合に、異なるドメインからのアクセスを許可するために使用
import cors from 'cors';

import { authCheck } from './middleware/auth.js'
import indexRouter from './routes/index.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import questRouter from './routes/quest.js'
import adminRouter from './routes/admin.js'
import pointRouter from './routes/point.js'
import supabase from "./libs/supabase.js";
// import {VerifyOtpParams} from "@supabase/supabase-js";

const app = express()

// ミドルウェア設定
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// -- CSP(コンテンツセキュリティポリシー)を設定 --
app.use(helmet({ contentSecurityPolicy: false })); // デフォルト無効化

const SUPABASE_URL = process.env.SUPABASE_URL || '';
let supabaseOrigin = '';
let supabaseRealtime = '';
try {
    supabaseOrigin = new URL(SUPABASE_URL).origin;
    supabaseRealtime = supabaseOrigin.replace(/^http/, 'ws')
} catch (e) {
    // 無効URLは空文字のまま
}

// CSP nonceを生成(各リクエストでnonceを生成してヘッダ設定)
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;

    const connectSources = ["'self'"]
    if (supabaseOrigin) connectSources.push(supabaseOrigin,);
    if (supabaseRealtime) connectSources.push(supabaseRealtime);
    // 開発用にローカル追加
    connectSources.push("http://localhost:3000");

    const directives: string[] = [
        `default-src 'self'`,
        `connect-src ${connectSources.join(' ')}`,
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data:`,
        `object-src 'none'`,
        `base-uri 'self'`
    ]
    res.setHeader('Content-Security-Policy', directives.join('; '));
    next();
})

// 静的ファイル
// app.use(express.static(path.join(path.dirname(''), 'public')));

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
app.use('/quest', questRouter)
app.use('/admin', adminRouter)
app.use('/point', pointRouter)
app.use('/', indexRouter)


export default app
