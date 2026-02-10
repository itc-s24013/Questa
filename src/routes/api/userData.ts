import {Router, Request} from 'express'
import supabase from "../../libs/supabase.js";
import {authCheck} from '../../middleware/auth.js';
import {AuthRequest} from '../../types/express.js';
import path from "path";

export const router = Router();

// ユーザーデータ取得
router.get('/', authCheck, async (req: AuthRequest, res) => {
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

export default router;