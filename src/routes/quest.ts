import {Router} from 'express'
import prisma from "../libs/db.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

// 未クリアのクエスト
router.get("/", async (req:AuthRequest, res) => {
    try {
        const cleared_quests = await prisma.clear.findMany({
            where: {
                user_id: req.user?.id
            }
        })

        try {
            const quests = await prisma.quest.findMany({
                where: {
                    is_deleted: false,
                    id: {notIn: cleared_quests.map(quest => quest.quest_id)}
                }
            })

            const result = quests.map(quest => ({
                id: quest.id,
                title: quest.title,
                point: quest.point
            }))

            return res.status(200).json(result)
        } catch (e) {
            return res.status(200).json({reason: e})
        }
    } catch (e) {
        return res.json({reason: e})
    }
})

router.get("/cleared", async (req:AuthRequest, res) => {
    try {
        const cleared = await prisma.clear.findMany({
            where: {
                user_id: req.user?.id
            }
        })

        try {
            const cleared_quests = await prisma.quest.findMany({
                where: {
                    is_deleted: false,
                    id: {in: cleared.map(quest => quest.quest_id)}
                }
            })

            const result = cleared_quests.map(quest => ({
                id: quest.id,
                title: quest.title,
                point: 10
            }))
            return res.status(200).json(result)
        } catch (e) {
            return res.json({reason: e})
        }
    } catch (e) {
        return res.json({reason: e})
    }
})

router.get("/:id", async (req:AuthRequest, res) => {
    try {
        const quest = await prisma.quest.findUnique({
            where: {
                id: String(req.params.id),
                is_deleted: false
            }
        })
        if (!quest) {
            return res.status(404).json({reason: "存在しないクエストです。"})
        }
        try {
            const cleared_quest = await prisma.clear.findFirst({
                where: {
                    user_id: req.user?.id,
                    quest_id: String(req.params.id)
                }
            })

            if (cleared_quest) {
                return res.status(200).json({
                    id: quest?.id,
                    title: quest?.title,
                    description: quest?.description,
                    choice1: quest?.choice1,
                    choice2: quest?.choice2,
                    choice3: quest?.choice3,
                    choice4: quest?.choice4,
                    point: 10
                })
            }
            return res.status(200).json(quest)
        } catch (e) {
            return res.status(200).json({reason: e})
        }
    } catch (e) {
        return res.json({reason: e})
    }
})

// クエストを明示的にクリアする（frontend が使用する想定）
// router.post('/clear', async (req: AuthRequest, res) => {
//     const questId = req.body.quest_id
//     if (!questId) {
//         return res.status(400).json({ reason: 'quest_id が必要です' })
//     }
//
//     try {
//         // 既にクリア済みか確認
//         const existing = await prisma.clear.findFirst({
//             where: {
//                 user_id: req.user?.id,
//                 quest_id: questId
//             }
//         })
//
//         if (existing) {
//             // 重複は問題にしない（idempotent）
//             return res.status(200).json({ message: '既にクリア済みです' })
//         }
//
//         // Clear レコード作成
//         const created = await prisma.clear.create({
//             data: {
//                 user_id: req.user?.id as string,
//                 quest_id: questId,
//                 cleared_at: new Date()
//             }
//         })
//
//         return res.status(201).json({ message: 'クリアを記録しました', clear: created })
//     } catch (e) {
//         console.error('/quest/clear error:', e)
//         return res.status(500).json({ reason: e })
//     }
// })

export default router