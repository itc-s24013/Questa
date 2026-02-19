import {Router} from 'express'
import prisma from "../libs/db.js";

export const router = Router();

router.get('/:count', async (req, res) => {
    const count = Number(req.params.count);
    const randoms = Array.from({length: count}, () => Math.floor(Math.random() * 100));

    const probabilities = randoms.map(random => {
        if (random < 40) return 1;
        if (random < 70) return 2;
        if (random < 90) return 3;
        if (random < 97) return 4;
        return 5;
    });

    try {
        const allBadges = await prisma.badge.findMany({
            where: { is_deleted: false }
        });

        if (allBadges.length === 0) {
            return res.status(404).json({ reason: "バッジが1つも登録されていません" });
        }

        const result = probabilities.map(p => {
            let targets = allBadges.filter(b => b.rarity === p);

            if (targets.length === 0) {
                targets = allBadges;
            }

            return targets[Math.floor(Math.random() * targets.length)];
        });
        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ reason: "ガチャ生成失敗" });
    }
});
export default router