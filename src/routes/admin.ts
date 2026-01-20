import {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.use(async (req, res, next) => {
    // ログイン中かどうかをチェックするミドルウェア
    if (!req.isAuthenticated()) {
        return res.status(400).json({
            reason: 'ログインをしてください'
        })
    }

    if (req.body.is_adimin !== true) {
        return res.status(403).json({
            reason: '管理者権限がありません'
        })
    }
    next() // ログイン中なので次の処理へ
})

router.get('/users', async (req, res) => {
    try {
        res.status(200).json({
            users: await prisma.user.findMany({
                where: {
                    is_deleted: false,
                }
            })
        })
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/user/delete/:id', async (req, res) => {
    try {
        await prisma.user.update({
            where: {
                id: req.params.id
            },
            data: {
                is_deleted: true
            }
        })
        res.status(200)
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/quests', async (req, res) => {
    try {
        res.status(200).json({
            users: await prisma.quest.findMany({
                where: {
                    is_deleted: false,
                }
            })
        })
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/quest/delete/:id', async (req, res) => {
    try {
        await prisma.quest.update({
            where: {
                id: req.params.id
            },
            data: {
                is_deleted: true
            }
        })
        res.status(200)
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/badges', async (req, res) => {
    try {
        res.status(200).json({
            users: await prisma.badge.findMany({
                where: {
                    is_deleted: false,
                }
            })
        })
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/badge/delete/:id', async (req, res) => {
    try {
        await prisma.badge.update({
            where: {
                id: req.params.id
            },
            data: {
                is_deleted: true
            }
        })
        res.status(200)
    } catch (e) {
        res.status(500).json({reason: e})
    }
})


export default router