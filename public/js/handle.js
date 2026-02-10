// CSPの設定で使っているnonceは<script>要素の実行を許可するためのもので、
// HTML属性（onclickなど）には適用されないため、外部JavaScriptファイルでイベントリスナーを設定する

const handlers = {
    signup: async (el, event, dataset) => {
        event.preventDefault();

        const email = dataset.email || document.getElementById('email').value;
        const password = dataset.password || document.getElementById('password').value;
        const name = dataset.name || document.getElementById('name').value;
        const msgDiv = document.getElementById('message');

        if (!email || !password || !name) {
            msgDiv.innerText = "全ての項目を入力してください";
            return;
        }

        const res = await fetch('/auth/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, name})
        });

        const result = await res.json();
        if (res.ok) {
            alert("メールを確認して、届いた8桁の数字を入力してください");
            // 成功したらOTP入力画面へ遷移（または表示切替）
            window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
        } else {
            msgDiv.innerText = result.error || "signup.htmlでエラーが発生しました";
        }
    },


    verify: async (el, event, dataset) => {
        event.preventDefault();

        // URLパラメータからemailを取得してセット
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');

        const otpInput = document.getElementById('otp');
        const token = otpInput ? otpInput.value : '';
        const msgDiv = document.getElementById('verify-msg');

        // if (!email) {
        //     msgDiv.innerText = "メールアドレスが必要です";
        //     return;
        // }
        if (!token) {
            msgDiv.innerText = "メールに届いた認証コードを入力してください";
            return;
        }

        try {
            const res = await fetch('/auth/verify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, token})
            });

            const result = await res.json();
            if (res.ok) {
                alert("認証成功！ログインしました");
                window.location.href = `/users/dashboard`;
            } else {
                msgDiv.innerText = result.error;
            }
        }catch (err) {
            console.error('fetch error:', err);
            msgDiv.innerText = 'ネットワークエラーが発生しました';
        }
    },


    login: async (el, event, dataset) => {
        event.preventDefault();

        const email = dataset.email || document.getElementById('email').value;
        const password = dataset.password || document.getElementById('password').value;
        const msgDiv = document.getElementById('message');

        if (!email || !password) {
            msgDiv.innerText = "メールアドレスとパスワードを入力してください";
            return;
        }

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            const result = await res.json();
            console.log(result);

            if (res.ok) {
                // 成功したらダッシュボードへ遷移
                window.location.href = `/users/dashboard`;
            } else {
                msgDiv.innerText = result.error || "login.htmlでエラーが発生しました";
            }
        } catch (err) {
            console.error('fetch error:', err);
            msgDiv.innerText = 'ネットワークエラーが発生しました';
        }
    },


    goBack: (el, event, dataset) => {
        event.preventDefault();
        const href = dataset.href || '/';
        location.href = href;
    },
};

// 汎用イベントリスナー　クリック用
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const actionEl = target.closest('[data-action]');
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        if (!action) return;

        const handler = handlers[action];
        if (typeof handler === 'function') {
            try {
                handler(actionEl, e, actionEl.dataset);
            } catch (err) {
                console.error('handler error', action, err);
            }
        } else {
            console.warn('未定義のaction:', action);
        }
    });
});