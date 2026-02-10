import {Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";
import {AuthRequest} from "../types/express.js";
export const router = Router();

router.get("/", authCheck, async (req:AuthRequest,res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                is_deleted: false,
                id: req.user?.id
            }
        })
        if (!user) {
            res.status(404).json({
                reason: 'ユーザーが見つかりません'
            })
            return
        }
        res.status(200).json({
            point: user.my_point
        })
    }
    catch (e) {
        res.json({reason: e})
    }
})

router.post("/judge", authCheck, async (req:AuthRequest, res) => {
    const choice = req.body.choice
    try {
        const getQuest = await prisma.quest.findUnique({
            where: {
                id: req.body.quest_id
            }
        })
        if (!getQuest) {
            res.status(404).json({
                reason: '存在しないクエストです。'
            })
            return
        }
        if (choice === getQuest.choice4) {
            try {
                const is_clear = await prisma.clear.findFirst({
                    where: {
                        user_id: req.user?.id,
                        quest_id: req.body.quest_id
                    }
                })
                let cleared_point = null
                if (is_clear) {
                     cleared_point = 10
                }
                try {
                    const user = await prisma.user.update({
                        where: {
                            id: req.user?.id,
                            is_deleted: false
                        },
                        data: {
                            my_point: {
                                increment: cleared_point ?? getQuest.point
                            }
                        }
                    })
                    if (cleared_point) {
                        try {
                            await prisma.clear.create({
                                data: {
                                    user_id: req.user?.id as string,
                                    quest_id: req.body.quest_id
                                }
                            })
                        } catch (e) {
                            res.json({reason: e})
                        }
                    }
                    res.status(200).json({
                        point: user.my_point
                    })
                } catch (e) {
                    res.json({reason: e})
                }
            } catch (e) {
                res.json({reason: e})
            }
        }
        res.status(200).json({
            message: "残念！不正解！"
        })
    } catch (e) {
        res.json({reason: e})
    }
})

router.post("/sameBadge", authCheck, async (req:AuthRequest, res) => {
        try {
            const sameBadgeJudge = await prisma.collect.findFirst({
                where: {
                    user_id: req.user?.id,
                    badge_id: req.body.badge_id
                }
            })
            if (sameBadgeJudge) {
                await prisma.user.update({
                    where: {
                        id: req.user?.id,
                        is_deleted: false
                    },
                    data: {
                        my_point: {
                            decrement: 1
                        }
                    }
                })
                res.status(200).json({
                    message: "被ったバッジはポイントに変換しました"
                })
            }
            res.status(200).json({
                message: "新規バッジの獲得おめでとう！！！"
            })
        }
        catch (e) {
            res.json({reason: e})
        }
})

router.post("/sameBadges", authCheck, async (req:AuthRequest, res) => {
    const badgeIds: string[] = req.body.badge_ids
    let count:number = 0
    let searchSameBadges:string[] = []
    for (const badge of badgeIds) {
        if(searchSameBadges.includes(badge)) {
            count += 1
            continue
        }
        searchSameBadges.push(badge)
    }

    try {
        const sameBadges = await prisma.collect.findMany({
            where: {
                user_id: req.user?.id,
                badge_id: {
                    in: badgeIds
                }
            }
        })
        if (sameBadges) {
            try {
                await prisma.user.update({
                    where: {
                        id: req.user?.id,
                        is_deleted: false
                    },
                    data: {
                        my_point: {
                            decrement: sameBadges.length + count
                        }
                    }
                })
                res.status(200).json({
                    message: "被ったバッジはポイントに変換しました"
                })
            } catch (e) {
                res.json({reason: e})
            }
        }
    } catch (e) {
        res.json({reason: e})
    }
})

router.post('/reduce/:point', async (req, res) => {
    try {
         await prisma.user.update({
            where: {
                id: req.body.user,
                is_deleted: false
            },
            data: {
                my_point: {
                    decrement: Number(req.params.point)
                }
            }
        })
        res.status(200).json({
            message: 'ポイントを減らしました',
        })
    } catch (e) {
        res.json({reason: e})
    }
})

export default router