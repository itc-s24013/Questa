import {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get('/', async (req, res) => {
    const random = Math.floor(Math.random() * 100);
    const probability = (() => {
        if (random < 40) return 1;
        if (random < 70) return 2;
        if (random < 90) return 3;
        if (random < 97) return 4;
        return 5;
    })()
    try {
        const badges = await prisma.badge.findMany({
            where: {
                is_deleted: false,
                scope: {
                    rarity_list: probability
                }
            }
        })
        res.status(200).json([badges[Math.floor(Math.random() * badges.length)]])
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

export default router