import {Router, Request} from 'express'
import supabase from "../libs/supabase.js";
import {authCheck} from '../middleware/auth.js';
import {AuthRequest} from '../types/express.js';
import path from "path";

export const router = Router();

router.get('/dashboard', authCheck, async (req: AuthRequest, res) => {
    const file = path.resolve(process.cwd(), 'views', 'dashboard.html');
    res.sendFile(file, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("ファイルが見つかりません");
        }
    });
})

router.get('/quest_list', authCheck, async (req: AuthRequest, res) => {
    const file = path.resolve(process.cwd(), 'views', 'quest_list.html');
    res.sendFile(file, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("ファイルが見つかりません");
        }
    });
})

export default router;