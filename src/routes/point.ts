import {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get("/", async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                is_deleted: false
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

router.post("/judge", async (req, res) => {
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
                const user = await prisma.user.update({
                    where: {
                        id: req.body.id,
                        is_deleted: false
                    },
                    data: {
                        my_point: {
                            increment: getQuest.point
                        }
                    }
                })
                res.status(200).json({
                    point: user.my_point
                })
            } catch (e) {
                res.json({reason: e})
            }
        }
    } catch (e) {
        res.json({reason: e})
    }
})

router.post("/sameBadge", async (req, res) => {
        try {
            const sameBadgeJudge = await prisma.collect.findFirst({
                where: {
                    user_id: req.body.user,
                    badge_id: req.body.badge_id
                }
            })
            if (sameBadgeJudge) {
                await prisma.user.update({
                    where: {
                        id: req.body.user,
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
        }
        catch (e) {
            res.json({reason: e})
        }
})

router.post("/sameBadges", async (req, res) => {
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
                user_id: req.body.user,
                badge_id: {
                    in: badgeIds
                }
            }
        })
        if (sameBadges) {
            try {
                await prisma.user.update({
                    where: {
                        id: req.body.user,
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

export default router