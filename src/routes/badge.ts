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

export default router