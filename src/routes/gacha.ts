import {Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

router.get('/:count', authCheck, async (req: AuthRequest, res) => {
    // まずユーザーがいなければ早期に返す（ここで return しないと以下で req.user が未定義の可能性が残る）
    if (!req.user) {
        return res.status(401).json({reason: 'ログインしてください'});
    }

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

        const userId = req.user.id;
        const data = badges.flatMap((badge => badge.map(b =>
            ({
                user_id: userId,
                badge_id: b.id
            }))))

        const uniqueData = Array.from(
            new Map(data.map(item => [item.badge_id, item])).values()
        );

        try {
            const check = await prisma.collect.findMany({
                where: {
                    user_id: userId,
                    badge_id: {in: uniqueData.map(d => d.badge_id)}
                }
            })

            const new_collects = uniqueData.filter(d => !check.some(c => c.badge_id === d.badge_id));

            try {
                await prisma.collect.createMany({
                    data: new_collects,
                })

                try {
                    await prisma.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            my_point: {
                                increment: (Number(req.params.count) - new_collects.length)
                            }
                        }
                    })
                } catch (e) {
                    return res.status(401).json({reason: e})
                }
            } catch (e) {
                return res.status(401).json({reason: e})
            }
        } catch (e) {
            return res.status(401).json({reason: e})
        }
        return res.status(200).json(badges.map(badge => badge[Math.floor(Math.random() * badge.length)]))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

export default router