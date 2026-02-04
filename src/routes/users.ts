import {Router, Request} from 'express'
// import prisma from "../libs/db.js";
import supabase from "../libs/supabase.js";
import {authCheck} from '../middleware/auth.js';
import {AuthRequest} from '../types/express.js';
import path from "path";

export const router = Router();

router.get("/", authCheck, (req, res) => {
    // const file = path.resolve(process.cwd(), 'views', 'quest_list.html');
    // res.sendFile(file, (err) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send("ファイルが見つかりません");
    //     }
    // });
    res.json({message: "認証成功しました。ルートページです"});

});

router.get('/dashboard', authCheck, async (req: AuthRequest, res) => {
    const file = path.resolve(process.cwd(), 'views', 'dashboard.html');
    res.sendFile(file, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("ファイルが見つかりません");
        }
    });
})

// ユーザーデータ取得
    router.get('/api/userData', authCheck, async (req: AuthRequest, res) => {
        try {
            const id = req.user?.id;
            if (!id) {
                console.warn('[/api/userData] missing req.id (認証情報なし)');
                return res.status(401).json({reason: '認証情報がありません'});
            }
            const {data, error} = await supabase
                .schema('public') // スキーマを明示的に指定
                .from('User')
                .select('name, my_point')
                .eq('id', id)
                .single();
            if (error) {
                console.error('[/api/userData] supabase error:', error);
                return res.status(500).json({reason: error.message || 'ユーザーデータの取得に失敗しました'});
            }

            if (!data) {
                console.error('[/api/userData] no data for id:', id);
                return res.status(404).json({reason: 'ユーザーデータが見つかりません'});
            }
            return res.status(200).json(data);
        } catch (e) {
            return res.status(500).json({reason: e})
        }
    })

// router.post('/login',
//     passport.authenticate('local'),
//     async (req, res) => {
//         res.json({message: 'ok'})
//     }
// )
//
// router.post('/register',
//     async (req, res) => {
//         if (!('email' in req.body) && !('password' in req.body) && !('name' in req.body)) {
//             res.status(400)
//             return res.json({
//                 reason: '項目に情報が入力されていません'
//             })
//         }
//         if (!('email' in req.body)) {
//             res.status(400)
//             return res.json({
//                 reason: 'メールアドレスを入力してください',
//             })
//         }
//         if (!('email' in req.body)) {
//             res.status(400)
//             return res.json({
//                 reason: '正しいメールアドレスを入力してください',
//             })
//         }
//         if (!('password' in req.body)) {
//             res.status(400)
//             return res.json({
//                 reason: 'パスワードを入力してください',
//             })
//         }
//         if (!('name' in req.body)) {
//             res.status(400)
//             return res.json({
//                 reason: '名前を入力してください',
//             })
//         }
//         const hashedPassword = await argon2.hash(req.body.password, {
//             timeCost: 2,
//             memoryCost: 19456,
//             parallelism: 1
//         })
//
//         try {
//             await prisma.user.create({
//                 data: {
//                     email: req.body.email,
//                     name: req.body.name,
//                     password: hashedPassword,
//                 }
//             })
//             return (
//                 res.status(200).end()
//             )
//         } catch (e) {
//             res.status(400)
//             return res.json({
//                 reason: '登録に失敗しました。すでに登録されている可能性があります。',
//             })
//         }
//     })

    export default router;