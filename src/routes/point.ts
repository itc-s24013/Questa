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
    const judge = Boolean(req.body.judge)
    if (judge) {
        try {
            const getPoint = await prisma.quest.findUnique({
                where: {
                    id: req.body.quest_id
                }
            })
            if (!getPoint) {
                res.status(404).json({
                    reason: '存在しないクエストです。'
                })
                return
            }
            const user = await prisma.user.update({
                where: {
                    id: req.body.id,
                    is_deleted: false
                },
                data: {
                    my_point: {
                        increment: getPoint.point
                    }
                }
            })
            res.status(200).json({
                point: user.my_point
            })
        }
        catch (e) {
            res.json({reason: e})
        }
    }
    const user = await prisma.user.findUnique({
        where: {
            id: req.body.id,
            is_deleted: false
        }
    })
    res.status(200).json({
        point: user ? user.my_point : "ログインをしてください"
    })
})

export default router