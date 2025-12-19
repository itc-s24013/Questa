import {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get("/", async (req, res) => {
    try {
        const quests = await prisma.quest.findMany({
            where: {
                is_deleted: false
            }
        })
        const result = quests.map(quest => ({
            id: quest.id,
            title: quest.title,
            point: quest.point
        }))
        res.status(200).json(result)
    }
    catch (e) {
        res.json({reason: e})
    }
})

router.get("/:id", async (req, res) => {
    try {
        return res.status(200).json(
            await prisma.quest.findFirst({
                where: {
                    id: req.params.id,
                    is_deleted: false
                }
            }))
    }
    catch (e) {
        res.json({reason: e})
    }
})

export default router