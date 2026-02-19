import {Router} from 'express'
import prisma from "../libs/db.js";
import {AuthRequest} from "../types/express.js";
export const router = Router();

router.get("/", async (req:AuthRequest,res) => {
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

router.post("/judge", async (req:AuthRequest, res) => {
    const user_id = req.user?.id
    const quest_id = req.body.quest_id
    const choice = req.body.choice

    if (!quest_id) {
        return res.status(400).json({ reason: "quest_id が必要です" });
    }

    try {
        const getQuest = await prisma.quest.findUnique({
            where: {
                id: quest_id
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
                // すでにクリアしてたら　
                const is_clear = await prisma.clear.findFirst({
                    where: {
                        user_id,
                        quest_id
                    }
                })
                let cleared_point = null

                if (is_clear && is_clear.id) {
                    cleared_point = 10
                }
                try {
                    await prisma.user.update({
                        where: {
                            id: user_id,
                            is_deleted: false
                        },
                        data: {
                            my_point: {
                                increment: cleared_point ?? getQuest.point
                            }
                        }
                    })
                    if (!cleared_point) {
                        try {
                            await prisma.clear.create({
                                data: {
                                    user_id: user_id || '',
                                    quest_id
                                }
                            })
                        } catch (e) {
                            res.json({reason: e})
                        }
                    }
                    res.status(200).json({
                        message: "正解！ポイントを獲得しました！",
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

router.post("/sameBadge", async (req:AuthRequest, res) => {
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

router.post("/sameBadges", async (req: AuthRequest, res) => {
    const badgeIds: string[] = req.body.badge_ids;
    const userId = req.user?.id;

    try {
        // 1. DBから現在の所持状況を取得
        const existingCollects = await prisma.collect.findMany({
            where: { user_id: userId, badge_id: { in: badgeIds } }
        });
        const ownedIds = new Set(existingCollects.map(c => c.badge_id));

        // 2. 「重複分」を厳密に計算
        let totalRefund = 0;
        const seenThisTime = new Set<string>();

        for (const id of badgeIds) {
            // 「既にDBにある」 or 「この10連の中で既に1枚目が出た」
            if (ownedIds.has(id) || seenThisTime.has(id)) {
                totalRefund += 1; // 1pt還元
            } else {
                seenThisTime.add(id); // 1枚目なのでキープ（ポイントにしない）
            }
        }

        if (totalRefund > 0) {
            await prisma.user.update({
                where: { id: userId, is_deleted: false },
                data: { my_point: { increment: totalRefund } }
            });
        }

        return res.status(200).json({ refund: totalRefund });
    } catch (e) {
        return res.status(500).json({ reason: e });
    }
});

router.post('/reduce/:point', async (req:AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user?.id,
                is_deleted: false
            }
        })
        if(!user) {
            return res.status(404).json({reason: 'ユーザーが見つかりません'})
        }
        if (user.my_point < Number(req.params.point)) {
            return res.status(200).json({reason: 'ポイントが不足しています'})
        }
        try {
            await prisma.user.update({
                where: {
                    id: req.user?.id,
                    is_deleted: false
                },
                data: {
                    my_point: {
                        decrement: Number(req.params.point)
                    }
                }
            })
            return res.status(200).json({message: 'ポイントを減らしました',})
        } catch (e) {
            return res.json({reason: e})
        }
    } catch (e) {
        return res.json({reason: e})
    }
})

export default router