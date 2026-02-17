import  {Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

router.get('/',authCheck, async (req:AuthRequest, res) => {
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

router.get('/:badge_id',authCheck, async (req:AuthRequest, res) => {
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

router.post('/:badge_id/choice',authCheck, async (req:AuthRequest, res) => {
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

router.post('/:badge_id/icon',authCheck, async (req:AuthRequest, res) => {
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

router.get('/collect',authCheck, async (req:AuthRequest, res) => {
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

router.get('/icon',authCheck, async (req:AuthRequest, res) => {
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

router.get('/choice',authCheck, async (req:AuthRequest, res) => {
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

router.post('/add',authCheck, async (req:AuthRequest, res) => {
    const badges = req.body.badge_ids
    try {
        const dataList = badges.map((id:string) => ({
            user_id: req.user?.id,
            badge_id: id,
        }));

        await prisma.collect.createMany({
            data: dataList,
            skipDuplicates: true,
        });
        res.status(200).json({
            message: '新しいバッジを獲得しました！'
        })
    } catch (e) {
        return res.status(500).json({reason: e})
    }
})

export default router