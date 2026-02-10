// 表示を更新する
const updateUI = (data) => {
    const nameTag = document.querySelector('.name');
    if (nameTag) nameTag.textContent = data.name || 'ゲストユーザー';

    const pointsEl = document.querySelector('.points');
    if (pointsEl) pointsEl.textContent = `P   ${data.my_point ?? 0}`;
};

document.addEventListener('DOMContentLoaded', () => {
    (async () => {
        const msgDiv = document.getElementById('message');

        try {
            // データ取得
            const res = await fetch('/api/userData', {
                method: 'GET',
                credentials: 'same-origin', // クッキーを送信
            });

            if (res.ok) {
                const result = await res.json();
                updateUI(result);
            }

        } catch (err) {
            console.error('fetch error:', err);
            if (msgDiv) msgDiv.innerText = result.error || "ユーザーデータの取得に失敗しました";
        }
    })();
});