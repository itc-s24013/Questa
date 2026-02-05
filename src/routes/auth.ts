import {Router} from 'express';
import path from 'path';
import supabase from '../libs/supabase.js'
import {EmailOtpType} from "@supabase/supabase-js";

export const router = Router();

// 新規登録
router.post('/signup', async function (req, res) {
    const {email, password, name} = req.body;

    try{
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {　
                // emailRedirectTo: 'https://example.com/welcome',
                data: { name }
            },
        })
        console.log("Data:", data);
        console.log("Error:", error);

        if (error) {
            let errorMessage = "新規登録に失敗しました。";

            if (error.message.includes(("Anonymous sign-ins are disabled"))){
                errorMessage = "メールアドレスを入力してください。";
            }else if (error.message.includes("User already registered")) {
                errorMessage = "このメールアドレスは既に登録されています。ログインをお試しください。";
            } else if (error.message.includes("invalid email")) {
                errorMessage = "無効なメールアドレスです。正しい形式で入力してください。";
            } else if (error.message.includes("Signup requires a valid password")) {
                errorMessage = "パスワードを入力してください。";
            } else if (error.message.includes("Password should be at least")) {
                errorMessage = "パスワードは最低6文字以上で設定してください。";
            }
            return res.status(400).json({ error: errorMessage + ":" + error.message });
        }
        res.status(200).json({message: 'ワンタイムパスワードを送信しました。メールをご確認ください。'})
    }catch (err){
        console.error("新規登録エラー:", err);
        res.status(500).json({ error: '新規登録時にエラーが発生しました。' });
    }
})


// ワンタイムパスワード入力フォーム　表示エンドポイント
router.get("/verify", async function (req, res) {
    const file = path.resolve(process.cwd(), 'views', 'verify.html'); //process.cwd() 通常プロジェクトルートを指す
    res.sendFile(file);
})

// ワンタイムパスワード入力フォーム送信
router.post("/verify", async (req, res) => {
    const { email, token } = req.body; // フロントのフォームから届く

    // デバッグ用ログ：メールアドレスの前後の空白を確認
    console.log("検証リクエスト受信:", {
        email: `[${email}]`,
        token: token
    });

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,       // ユーザーが入力した8桁
        type: 'signup'
    });

    if (error) {
        let errorMessage = "認証に失敗しました。";

        if (error.message.includes("Verify requires either a token or a token hash")){
            errorMessage = "メールアドレスに送信されたコードを入力してください。";
        }else if (error.message.includes("Token has expired or is invalid")) {
            errorMessage = "コードの有効期限切れもしくは正しくありません。入力内容を確認してください。";
        } else if (error.message.includes("too many requests")) {
            errorMessage = "試行回数が多すぎます。しばらく時間を置いてからお試しください。";
        }
        return res.status(400).json({ error: errorMessage });
    }

    // 検証成功
    res.status(200).json({ message: "認証に成功しました！", session: data.session });
});


// ログイン
router.post('/login', async function (req, res) {
    const {email, password} = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            let errorMessage = "ログインに失敗しました。";

            if (error.message.includes("Invalid login credentials")) {
                errorMessage = "ログインに失敗しました。入力内容を確認するか、アカウントをお持ちでない場合は新規登録を行ってください。";
            }
            return res.status(400).json({ error: errorMessage });
        }

        const accessToken = data.session?.access_token;
        if (!accessToken) {
            return res.status(500).json({ error: 'トークン取得に失敗しました。' });
        }

        // HttpOnly Cookieにトークン保存
        res.cookie('access_token', accessToken, {
            httpOnly: true, // JavaScriptからアクセス不可
            secure: process.env.NODE_ENV === 'production', // 本番環境ではSecure属性を有効にする
            sameSite: 'lax', // クロスサイト送信の制御
            maxAge: 1000 * 60 * 60 * 24, // 1日
        })
        //res.status(200).json({ message: "ログインに成功しました！", session: data.session });
        // ログイン成功後、認証を通してマイページへリダイレクト
        return res.redirect('/api/userData');

})


export default router;