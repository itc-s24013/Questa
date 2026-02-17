import {Router} from "express";
import {Request, Response} from "express";

export const routes = Router();

//gasからのリクエストを処理するエンドポイント
routes.get("/", (req:Request, res:Response) => {
    // リクエスト元のURLを取得 (ブラウザが自動で付与するヘッダー)
    const x_app_source = req.get('X-App-Source');
    console.log('リクエスト元:', x_app_source || '直接アクセスまたは不明');
    res.json({message: "Gas request successfully✨"});
});

export default routes;