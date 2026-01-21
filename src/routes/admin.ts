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

router.post('/quest/update/:id', async (req, res) => {
    const {title, choice1, choice2, choice3, choice4, point} = req.body
    try {
        await prisma.quest.update({
            where: {
                id: req.params.id
            },
            data: {
                title: title,
                choice1: choice1,
                choice2: choice2,
                choice3: choice3,
                choice4: choice4,
                point: point,
            }
        })
        res.status(200).json({message: "クエストを更新しました。"})
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

router.post('/quest/add', async (req, res) => {
    try {
        await prisma.quest.create({
            data: {
                title: req.body.title,
                choice1: req.body.choice1,
                choice2: req.body.choice2,
                choice3: req.body.choice3,
                choice4: req.body.choice4,
                point: req.body.point,
            }
        })
        res.status(200).json({
            message: "クエストを追加しました。"
        })
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

router.post('/badge/add', async (req, res) => {
    try {
        await prisma.badge.create({
            data: {
                name: req.body.name,
                rarity: req.body.rarity,
                badge_image_url: req.body.badge_image_url,
            }
        })
        res.status(200).json({
            message: "バッジを追加しました。"
        })
    } catch (e) {
        res.status(500).json({reason: e})
    }
})


export default router