import {NextFunction, Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

// 管理者権限チェック
router.get('/', async (req: AuthRequest, res) => {
    if (!req.user?.id) {
        res.status(401).json({reason: "認証に失敗しました。"})
        return
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
                is_deleted: false,
                is_admin: true
            }
        })
        if (!user) {
            res.status(200).json({is_admin: false})
            return
        }
        res.status(200).json({is_admin: true})
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

// 全ユーザー一覧
router.get('/user', async (req, res) => {
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

router.delete('/user/:id', async (req, res) => {
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

router.get('/quest', async (req, res) => {
    try {
        res.status(200).json(
            await prisma.quest.findMany({
                where: {
                    is_deleted: false,
                }
            })
        )
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.put('/quest/:id', async (req, res) => {
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

router.delete('/quest/:id', async (req, res) => {
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

router.post('/quest', async (req, res) => {
    try {
        await prisma.quest.create({
            data: {
                title: req.body.title,
                description: req.body.description,
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

router.get('/badge', async (req, res) => {
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

router.put('/badge/:id', async (req, res) => {
    const {name, badge_image_url, rarity} = req.body
    try {
        await prisma.badge.update({
            where: {
                id: req.params.id
            },
            data: {
                name: name,
                badge_image_url: badge_image_url,
                rarity: rarity,
            }
        })
        res.status(200).json({message: "バッジを更新しました。"})
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.delete('/badge/:id', async (req, res) => {
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

router.post('/badge', async (req, res) => {
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