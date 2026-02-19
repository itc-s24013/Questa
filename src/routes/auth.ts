import {Router} from 'express';
import supabase from '../libs/supabase.js'

export const router = Router();

// 新規登録
router.post('/signup', async function (req, res) {
    const {email, password, name} = req.body;

    try {
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {name}
            },
        })
        console.log("Data:", data);
        console.log("Error:", error);

        if (error) {
            let errorMessage = "新規登録に失敗しました。";

            if (error.message.includes(("Anonymous sign-ins are disabled"))) {
                errorMessage = "メールアドレスを入力してください。";
            } else if (error.message.includes("User already registered")) {
                errorMessage = "このメールアドレスは既に登録されています。ログインをお試しください。";
            } else if (error.message.includes("invalid email")) {
                errorMessage = "無効なメールアドレスです。正しい形式で入力してください。";
            } else if (error.message.includes("Signup requires a valid password")) {
                errorMessage = "パスワードを入力してください。";
            } else if (error.message.includes("Password should be at least")) {
                errorMessage = "パスワードは最低6文字以上で設定してください。";
            }
            return res.status(400).json({error: errorMessage + ":" + error.message});
        }

        // signup 後、verify 時にサーバ側でメールアドレスを参照できるように短期の cookie をセット
        try {
            const isProd = process.env.NODE_ENV === 'production';
            const cookieSameSite = isProd ? 'none' : 'lax';
            // 有効期限は短め（例: 10 分）
            res.cookie('pending_email', email, {
                httpOnly: true,
                secure: isProd,
                sameSite: cookieSameSite as any,
                path: '/auth/verify',
                maxAge: 10 * 60 * 1000,
            });
        } catch (e) {
            console.error('pending_email cookie set failed', e);
        }

        res.status(200).json({message: 'ワンタイムパスワードを送信しました。メールをご確認ください。'})
    } catch (err) {
        console.error("新規登録エラー:", err);
        res.status(500).json({error: '新規登録時にエラーが発生しました。'});
    }
})


// ワンタイムパスワード入力フォーム送信
router.post("/verify", async (req, res) => {
    // クライアントから email を送らない設計を優先するため、まずは req.body.email を確認し、無ければサーバが set した pending_email cookie を使う
    let {email, token} = req.body as { email?: string, token?: string };
    if (!email && req.cookies) {
        email = req.cookies.pending_email || '';
    }

    // デバッグ用ログ：メールアドレスの前後の空白を確認
    console.log("検証リクエスト受信:", {
        email: `[${email}]`,
        token: token
    });

    if (!email) {
        return res.status(400).json({ error: 'メールアドレスが特定できません。' });
    }

    // token が未提供の場合は早期にエラーを返し、verifyOtp に undefined を渡さないようにする
    if (!token) {
        return res.status(400).json({ error: 'メールに届いたコードを入力してください。' });
    }

    const {data, error} = await supabase.auth.verifyOtp({
        email,
        token: token!,       // token の存在を上で保証しているので non-null アサーション
        type: 'signup'
    });

    if (error) {
        let errorMessage = "認証に失敗しました。";

        if (error.message.includes("Verify requires either a token or a token hash")) {
            errorMessage = "メールアドレスに送信されたコードを入力してください。";
        } else if (error.message.includes("Token has expired or is invalid")) {
            errorMessage = "コードの有効期限切れもしくは正しくありません。入力内容を確認してください。";
        } else if (error.message.includes("too many requests")) {
            errorMessage = "試行回数が多すぎます。しばらく時間を置いてからお試しください。";
        }
        return res.status(400).json({error: errorMessage});
    }

    try {
        const accessToken = data.session?.access_token;
        if (accessToken) {
            const isProd = process.env.NODE_ENV === 'production';
            const cookieSameSite = isProd ? 'none' : 'lax';

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: cookieSameSite as any,
                path: '/',
                maxAge: 1000 * 60 * 60 * 24, // 1日
            });

            // 登録プロセスが完了したので pending_email cookie は削除
            res.clearCookie('pending_email', { path: '/auth/verify' });
        }
    } catch (e) {
        console.error('cookie set error', e);
    }

    res.status(200).json({message: "認証に成功しました！", session: data.session});
});


// ログイン
router.post('/login', async function (req, res) {
    const {email, password} = req.body;

    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) {
        let errorMessage = "ログインに失敗しました。";

        if (error.message.includes("Invalid login credentials")) {
            errorMessage = "ログインに失敗しました。入力内容を確認するか、アカウントをお持ちでない場合は新規登録を行ってください。";
        }
        return res.status(400).json({error: errorMessage});
    }

    const {session, user} = data; // signInWithPasswordのレスポンス

    // セッションがあるか確認
    if (!session || !session.access_token) {
        return res.status(500).json({error: 'セッションの作成に失敗しました。'});
    }

    const access_token = data.session?.access_token;
    const refresh_token = data.session?.refresh_token;

    // ユーザー詳細データを取得
    const { data: dbUser, error: dbError } = await supabase
        .schema('public')
        .from('User')
        .select('name, my_point')
        .eq('id', user.id)
        .single();

    if (dbError) {
        // ログだけ出力してログイン自体は継続させる
        console.error("User data fetch error:", dbError.message);
    }

    // refresh_tokenのみをHttpOnly Cookieに保存
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true, // SameSite=None の場合は必須
        sameSite: 'none', // クロスドメインなら 'none'
        path: '/auth/refresh', // Refresh用エンドポイント以外に送出しない
        maxAge: 60 * 60 * 24 * 7 * 1000, // 1週間
    });
    // res.status(200).json({ message: "ログインに成功しました！", session: data.session });
    // ログイン成功後、認証を通してマイページへリダイレクト
    return res.status(200).json({
        access_token: access_token,
        user: {
            id: user.id,
            email: user.email,
            name: dbUser?.name || "ユーザー1号",
            my_point: dbUser?.my_point || 0,
        }
    })
})

// トークン再発行エンドポイント
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ error: "リフレッシュトークンがありません" });
    }

    const { data, error } = await supabase.auth.setSession({
        refresh_token: refreshToken,
        access_token: '' // access_tokenは空でもrefresh_tokenがあれば再発行可能
    });

    if (error || !data.session) {
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: "セッションを更新できません" });
    }

    // 新しいペアをセット（Rotation）
    res.cookie('refresh_token', data.session.refresh_token, {
        httpOnly: true, secure: true, sameSite: 'none', path: '/auth/refresh'
    });

    return res.status(200).json({ accessToken: data.session.access_token });
});

// ログアウト
router.post('/logout', async (req, res) => {
    // Cookieを削除（path属性もセット時と同じにする必要があります）
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return res.status(200).json({ message: 'ログアウトしました' });
});

export default router;
