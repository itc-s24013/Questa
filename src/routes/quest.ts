import {Router} from 'express'
import prisma from "../libs/db.js";
import {authCheck} from "../middleware/auth.js";
import {AuthRequest} from "../types/express.js";

export const router = Router();

router.get("/",authCheck, async (req:AuthRequest, res) => {
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

            res.status(200).json(result)
        } catch (e) {
            res.status(200).json({reason: e})
        }
    } catch (e) {
        res.json({reason: e})
    }
})

router.get("/:id",authCheck, async (req:AuthRequest, res) => {
    try {
        const quest = await prisma.quest.findUnique({
            where: {
                id: req.params.id,
                is_deleted: false
            }
        })
        if (!quest) {
            res.status(404).json({reason: "存在しないクエストです。"})
        }
        try {
            const cleared_quest = await prisma.clear.findFirst({
                where: {
                    user_id: req.user?.id,
                    quest_id: req.params.id
                }
            })

            if (cleared_quest) {
                res.status(200).json({
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
            res.status(200).json(quest)
        } catch (e) {
            res.status(200).json({reason: e})
        }
    } catch (e) {
        res.json({reason: e})
    }
})

router.get("/cleared",authCheck, async (req:AuthRequest, res) => {
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
            res.status(200).json(result)
        } catch (e) {
            res.json({reason: e})
        }
    } catch (e) {
        res.json({reason: e})
    }
})

export default router