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
    const token = tokenFromHeader || req.cookies?.access_token;

    // トークンがない場合
    if (!token) return res.status(401).json({ reason: "認証トークンがありません" });

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
        return res.status(401).json({ reason: "無効な認証トークンです" });
    }

    req.user = data.user
    next();
}