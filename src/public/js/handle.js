// // CSPの設定で使っているnonceは<script>要素の実行を許可するためのもので、
// // HTML属性（onclick や onchange）には適用されないため、外部JavaScriptファイルでイベントリスナーを設定する
//
// // document.addEventListener('DOMContentLoaded', () => {
// //     const btn = document.getElementById('myBtn');
// //     if (btn) {
// //         btn.addEventListener('click', (e) => {
// //             console.log('myBtn clicked', e);
// //         });
// //     }
// // });
// const handlers = {
//     login: async (el, event, dataset) => {
//         event.preventDefault();
//
//         const email = dataset.email || document.getElementById('email').value;
//         const password = dataset.password || document.getElementById('password').value;
//         const msgDiv = document.getElementById('message');
//
//         if (!email || !password) {
//             msgDiv.innerText = "メールアドレスとパスワードを入力してください";
//             return;
//         }
//
//         try {
//             const res = await fetch('/auth/login', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify({email, password})
//             });
//             const result = await res.json();
//             console.log(result);
//
//             if (res.ok) {
//                 // 成功したらダッシュボードへ遷移
//                 window.location.href = `/dashboard?email=${encodeURIComponent(email)}`;
//             } else {
//                 msgDiv.innerText = result.error || "login.htmlでエラーが発生しました";
//             }
//         } catch (err) {
//             console.error('fetch error:', err);
//             msgDiv.innerText = 'ネットワークエラーが発生しました';
//         }
//     },
//
//     goBack: (el, event, dataset) => {
//         event.preventDefault();
//         const href = dataset.href || '/';
//         location.href = href;
//     },
// };
//
// // 汎用イベントリスナー　クリック用
// document.addEventListener('DOMContentLoaded', () => {
//     document.body.addEventListener('click', (e) => {
//         const target = e.target;
//         if (!(target instanceof Element)) return;
//
//         const actionEl = target.closest('[data-action]');
//         if (!actionEl) return;
//
//         const action = actionEl.dataset.action;
//         if (!action) return;
//
//         const handler = handlers[action];
//         if (typeof handler === 'function') {
//             try {
//                 handler(actionEl, e, actionEl.dataset);
//             } catch (err) {
//                 console.error('handler error', action, err);
//             }
//         } else {
//             console.warn('未定義の action:', action);
//         }
//     });
// });