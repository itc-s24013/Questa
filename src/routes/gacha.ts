import {Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";

export const router = Router();

router.get('/:count',authCheck, async (req, res) => {
    const randoms = Array.from({length: Number(req.params.count)}, () => Math.floor(Math.random() * 100));
    const probabilities = randoms.map(random => {
        if (random < 40) return 1;
        if (random < 70) return 2;
        if (random < 90) return 3;
        if (random < 97) return 4;
        return 5;
    })
    try {
        const badges = await Promise.all(probabilities.map(probability => {
            return prisma.badge.findMany({
                where: {
                    is_deleted: false,
                    scope: {
                        rarity_list: probability
                    }
                }
            })
        }))
        res.status(200).json(badges.map(badge => {
            if (badge.length == 0) return null;
            return badge[Math.floor(Math.random() * badge.length)]
        }))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

export default router