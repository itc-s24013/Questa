import {Request, Response, NextFunction} from 'express'
import supabase from "../libs/supabase.js";
import { AuthRequest } from '../types/express.js'; //カスタム型


// 認証チェックミドルウェア
export const authCheck = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const token = tokenFromHeader || (req as any).cookies?.access_token;

    // トークンがない場合
    if (!token) return res.status(401).redirect('/login');

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
        res.clearCookie('access_token'); // 無効なトークンの場合、クッキーをクリア
        return res.status(401).redirect('/login');
    }

    req.user = data.user
    next();
}