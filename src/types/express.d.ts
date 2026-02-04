export type AuthRequest = import('express').Request & {
    cookies?: Record<string, string>;
    user?: import('@supabase/supabase-js').User;
    id?: string;
};

// declare namespace Express {
//     interface Request {
//         id?: string; // authCheck ミドルウェアで付与される想定
//     }
// }