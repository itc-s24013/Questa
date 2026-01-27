import  {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get("/", async (req, res) => {
    try {
        const quests = await prisma.quest.findMany({
            where: {
                is_deleted: false
            }
        })
        try {
            const cleared_quests = await prisma.clear.findMany({
                where: {
                    user_id: req.body.user_id
                }
            })

            const result = quests.map(quest => {
                const is_cleared = cleared_quests.some(clear => clear.quest_id === quest.id);
                return {
                    id: quest.id,
                    title: quest.title,
                    point: is_cleared ? 10 : quest.point
                }
            })
            res.status(200).json(result)
        } catch (e) {
            res.status(200).json({reason: e})
        }
    } catch (e) {
        res.status(200).json({reason: e})
    }
})

router.get("/:id", async (req, res) => {
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
                    user_id: req.body.user_id,
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

export default router