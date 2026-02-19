import  {Router} from 'express'
import prisma from "../libs/db.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

// 所有してるbadge_idだけ返す
router.get('/', async (req:AuthRequest, res) => {
    try {
        const has_badges = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id
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

router.get('/choice', async (req:AuthRequest, res) => {
    try {
        const result = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                is_choice: true,
                badge: {
                    is_deleted: false
                }
            },
            include: {
                badge: true
            }
        })
        res.status(200).json({
            id: result.map(r => r.badge_id),
            name: result.map(r => r.badge.name),
            badge_image_url: result.map(r => r.badge.badge_image_url),
            rarity: result.map(r => r.badge.rarity),
        })
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/icon', async (req:AuthRequest, res) => {
    try {
        res.status(200).json(await prisma.collect.findFirst({
            where: {
                user_id: req.user?.id,
                is_icon: true,
                badge: {
                    is_deleted: false
                }
            },
            include: {
                badge: true
            }
        }))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

// 所有しているバッジの全情報を返す
router.get('/collect', async (req:AuthRequest, res) => {
    try {
        res.status(200).json(await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                badge: {
                    is_deleted: false
                }
            },
            include: {
                badge: true
            }
        }))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/icon', async (req:AuthRequest, res) => {
    try {
        res.status(200).json(await prisma.collect.findFirst({
            where: {
                user_id: req.user?.id,
                is_icon: true,
                badge: {
                    is_deleted: false
                }
            },
            include: {
                badge: true
            }
        }))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.get('/choice', async (req:AuthRequest, res) => {
    try {
        res.status(200).json(await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                is_choice: true,
                badge: {
                    is_deleted: false
                }
            },
            include: {
                badge: true
            }
        }))
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/add', async (req:AuthRequest, res) => {
    const badges = req.body.badge_ids as string[]
    const uniqueBadges = [...new Set(badges)];
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "認証が必要です" });
    }
    try {
        const dataList =  uniqueBadges.map((id:string) => ({
            user_id: userId,
            badge_id: id,
        }));

        const collects = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                badge_id: { in: uniqueBadges }
            }
        })

        await prisma.collect.createMany({
            data: dataList.filter((data: { user_id: string, badge_id: string }) =>
                !collects.some(collect => collect.badge_id === data.badge_id)
            )
        });

        res.status(200).json({
            message: '新しいバッジを獲得しました！'
        })
    } catch (e) {
        return res.status(500).json({reason: e})
    }
})

router.get('/:badge_id', async (req:AuthRequest, res) => {
    try {
        const has_badge = await prisma.collect.findFirst({
            where: {
                user_id: req.user?.id,
                badge_id: String(req.params.badge_id)
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

router.post('/:badge_id/choice', async (req:AuthRequest, res) => {
    try {
        const choice_badge = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                is_choice: true
            }
        })
        try {
            const has_badge = await prisma.collect.findFirst({
                where: {
                    user_id: req.user?.id,
                    badge_id: String(req.params.badge_id)
                }
            })
            if (!has_badge) {
                return res.status(404).json({reason: 'バッジを所持していません'})
            }
            if (!has_badge.is_choice && choice_badge.length >= 5) {
                return res.status(200).json({reason: '選択できるバッジは5個までです'})
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
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

router.post('/:badge_id/icon', async (req:AuthRequest, res) => {
    try {
        const icon_badge = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                is_icon: true
            }
        })
        try {
            const has_badge = await prisma.collect.findFirst({
                where: {
                    user_id: req.user?.id,
                    badge_id: String(req.params.badge_id)
                }
            })
            if (!has_badge) {
                return res.status(404).json({reason: 'バッジを所持していません'})
            }
            if (!has_badge.is_icon && !icon_badge) {
                return res.status(200).json({reason: 'アイコンに設定できるバッジは1個までです'})
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
    } catch (e) {
        res.status(500).json({reason: e})
    }
})

export default router