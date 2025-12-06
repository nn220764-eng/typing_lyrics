// 曲データ（サンプル）
// 実際にはここにタイピング劇場の曲データを追加していきます。
const songs = [
    {
        id: 1,
        title: "さくら（独唱）",
        artist: "森山直太朗",
        lyrics: `さくら さくら 今、咲き誇る
刹那に散りゆく運命と知って
さらば友よ 旅立ちの刻
変わらないその想いを 今`
    },
    {
        id: 2,
        title: "天体観測",
        artist: "BUMP OF CHICKEN",
        lyrics: `午前二時 フミキリに 望遠鏡を担いでった
ベルトに結んだラジオ 雨は降らないらしい
二分後に君が来た 大袈裟に手を振ってく
はじめようか 天体観測 ほうき星を探して`
    },
    {
        id: 3,
        title: "小さな恋のうた",
        artist: "MONGOL800",
        lyrics: `広い宇宙の数ある一つ
青い地球の広い世界で
小さな恋の思いは届く
小さな島のあなたのもとへ`
    }
    // ... 他の曲データを追加
];

// DOM要素の取得
const songNumberInput = document.getElementById('song-number');
const songTitleInput = document.getElementById('song-title');
const searchByNumberBtn = document.getElementById('search-by-number-btn');
const searchByTitleBtn = document.getElementById('search-by-title-btn');
const resultDiv = document.getElementById('result');

// --- イベントリスナーの設定 ---

// 曲番号で検索ボタンがクリックされた時
searchByNumberBtn.addEventListener('click', searchByNumber);

// 曲名で検索ボタンがクリックされた時
searchByTitleBtn.addEventListener('click', searchByTitle);

// Enterキーでも検索できるようにする
songNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByNumber();
    }
});

songTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByTitle();
    }
});


// --- 関数定義 ---

/**
 * 曲番号で曲を検索して表示する関数
 */
function searchByNumber() {
    const number = parseInt(songNumberInput.value, 10);
    if (isNaN(number)) {
        displayResult([]); // 無効な入力の場合は結果をクリア
        return;
    }
    const foundSong = songs.find(song => song.id === number);
    displayResult(foundSong ? [foundSong] : []);
}

/**
 * 曲名で曲を検索して表示する関数
 */
function searchByTitle() {
    const title = songTitleInput.value.trim().toLowerCase();
    if (title === '') {
        displayResult([]); // 無効な入力の場合は結果をクリア
        return;
    }
    const foundSongs = songs.filter(song => 
        song.title.toLowerCase().includes(title)
    );
    displayResult(foundSongs);
}

/**
 * 検索結果を画面に表示する関数
 * @param {Array} resultSongs - 表示する曲の配列
 */
function displayResult(resultSongs) {
    resultDiv.innerHTML = ''; // 結果表示エリアをクリア

    if (resultSongs.length === 0) {
        resultDiv.innerHTML = '<p>該当する曲が見つかりませんでした。</p>';
        return;
    }

    resultSongs.forEach(song => {
        // 改行を<br>タグに変換
        const formattedLyrics = song.lyrics.replace(/\n/g, '<br>');

        const songElement = document.createElement('div');
        songElement.classList.add('song');
        songElement.innerHTML = `
            <h3>${song.id}: ${song.title}</h3>
            <p><strong>アーティスト:</strong> ${song.artist}</p>
            <div class="lyrics">
                ${formattedLyrics}
            </div>
        `;
        resultDiv.appendChild(songElement);
    });
}
