import express, {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get('/', async (req, res) => {
    try {
        const has_badges = await prisma.collect.findMany({
            where: {
               user_id: req.body.id
            }
        })
        res.status(200).json(
            await prisma.badge.findMany({
                where: {
                    is_deleted: false,
                    id: {in: has_badges.map(badge => badge.badge_id)}
                }
            })
        )
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/:badge_id', async (req, res) => {
    try {
        const has_badge = await prisma.collect.findFirst({
            where: {
                user_id: req.body.id,
                badge_id: req.params.badge_id
            }
        })
        if (!has_badge) {
            return res.status(404).json({reason: 'バッジを所持していません'})
        }
        res.status(200).json(
            await prisma.badge.findUnique({
                where: {
                    is_deleted: false,
                    id: has_badge.badge_id
                }
            })
        )
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/:badge_id/choice', async (req, res) => {
    try {
        const has_badge = await prisma.collect.findFirst({
            where: {
                user_id: req.body.id,
                badge_id: req.params.badge_id
            }
        })
        if (!has_badge) {
            return res.status(404).json({reason: 'バッジを所持していません'})
        }
        try {
            await prisma.collect.update({
                where: {
                    id: has_badge.id
                },
                data: {
                    is_choice: !has_badge.is_choice
                }
            })
            res.status(200).end()
        } catch (e) {
            res.status(500).json({reason: e})
        }
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/:badge_id/icon', async (req, res) => {
    try {
        const has_badge = await prisma.collect.findFirst({
            where: {
                user_id: req.body.id,
                badge_id: req.params.badge_id
            }
        })
        if (!has_badge) {
            return res.status(404).json({reason: 'バッジを所持していません'})
        }
        try {
            await prisma.collect.update({
                where: {
                    id: has_badge.id
                },
                data: {
                    is_choice: !has_badge.is_icon
                }
            })
            res.status(200).end()
        } catch (e) {
            res.status(500).json({reason: e})
        }
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

export default router