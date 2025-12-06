let songs = []; // 曲データを格納する配列
let currentFontSize = 0.8; // 歌詞の初期フォントサイズ (em)
let currentColumnCount = 1; // 歌詞の初期分割数

// DOM要素の取得
const searchInput = document.getElementById('search-input');
const lyricsControls = document.getElementById('lyrics-controls');
const fontIncreaseBtn = document.getElementById('font-increase-btn');
const fontDecreaseBtn = document.getElementById('font-decrease-btn');
const columnIncreaseBtn = document.getElementById('column-increase-btn');
const columnDecreaseBtn = document.getElementById('column-decrease-btn');
const resultDiv = document.getElementById('result');

// --- 初期化処理 ---

// ページの読み込みが完了したら曲データを読み込み、イベントリスナーを設定する
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    await loadSongs();
    setupEventListeners();
});

/**
 * songs.jsonから曲データを非同期で読み込む
 */
async function loadSongs() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        songs = await response.json();
    } catch (error) {
        console.error("曲データの読み込みに失敗しました:", error);
        resultDiv.innerHTML = '<p>エラー: 曲リストの読み込みに失敗しました。</p>';
    }
}

/**
 * localStorageから設定を読み込む
 */
function loadSettings() {
    const savedFontSize = localStorage.getItem('typingTheaterFontSize');
    if (savedFontSize) {
        // parseFloatで文字列を数値に変換
        currentFontSize = parseFloat(savedFontSize);
    }
    const savedColumnCount = localStorage.getItem('typingTheaterColumnCount');
    if (savedColumnCount) {
        // parseIntで文字列を数値に変換
        currentColumnCount = parseInt(savedColumnCount, 10);
    }
}

/**
 * イベントリスナーを設定する
 */
function setupEventListeners() {
    // 3桁の曲番号が入力されたら自動で検索する
    searchInput.addEventListener('input', handleSearch);

    // 文字サイズを大きくするボタン
    fontIncreaseBtn.addEventListener('click', () => changeFontSize(0.1));

    // 文字サイズを小さくするボタン
    fontDecreaseBtn.addEventListener('click', () => changeFontSize(-0.1));

    // 分割を増やすボタン
    columnIncreaseBtn.addEventListener('click', () => changeColumnCount(1));

    // 分割を減らすボタン
    columnDecreaseBtn.addEventListener('click', () => changeColumnCount(-1));
}

// --- 関数定義 ---

/**
 * 検索入力を処理し、適切な検索関数を呼び出す
 */
function handleSearch() {
    const query = searchInput.value;

    // 入力が3桁でない場合は何もしない
    if (query.length !== 3) {
        return;
    }

    const foundSong = songs.find(song => song.id === query);
    displayResult(foundSong ? [foundSong] : []);
    searchInput.select(); // 次の入力のためにテキストを選択状態にする
}

/**
 * 検索結果を画面に表示する関数
 * @param {Array} resultSongs - 表示する曲の配列
 */
function displayResult(resultSongs) {
    resultDiv.innerHTML = ''; // 結果表示エリアをクリア

    const header = document.querySelector('header');
    const searchContainer = document.querySelector('.search-container');
    const resultTitle = document.querySelector('#result-container h2');

    if (resultSongs.length === 0) {
        resultDiv.innerHTML = '<p>該当する曲が見つかりませんでした。</p>';
        header.classList.remove('hidden');
        searchContainer.classList.remove('hidden');
        resultTitle.classList.remove('hidden');
        lyricsControls.classList.add('hidden');
        return;
    }

    // 検索結果が見つかったら、コントロールを表示し、デフォルトのテキストを隠す
    header.classList.add('hidden');
    resultTitle.classList.add('hidden'); // 「検索結果」のh2を隠す
    lyricsControls.classList.remove('hidden');


    resultSongs.forEach(song => {
        // 空行で区切られたブロックごとにdivで囲み、ブロックの途中で分割されないようにする
        const lyricsBlocks = escapeHTML(song.lyrics)
            .split(/\n\s*\n/) // 1つ以上の空行で分割
            .map(block => {
                return `<div class="lyric-block">${block.replace(/\n/g, '<br>')}</div>`;
            })
            .join('');

        const songElement = document.createElement('div');
        songElement.classList.add('song');
        songElement.innerHTML = `
            <h3>${escapeHTML(song.id)}: ${escapeHTML(song.title)}</h3>
            <div class="lyrics">
                ${lyricsBlocks}
            </div>
        `;
        resultDiv.appendChild(songElement);

        // 保存されているスタイルを適用する
        const lyricsElement = document.querySelector('#result .lyrics');
        lyricsElement.style.fontSize = `${currentFontSize}em`;
        lyricsElement.style.columnCount = currentColumnCount;
    });
}

/**
 * 歌詞のフォントサイズを変更する
 * @param {number} amount - 変更量 (em)
 */
function changeFontSize(amount) {
    const newSize = currentFontSize + amount;
    // フォントサイズに下限と上限を設定
    if (newSize >= 0.5 && newSize <= 5.0) {
        currentFontSize = newSize;
        const lyricsElement = document.querySelector('#result .lyrics');
        if (lyricsElement) {
            lyricsElement.style.fontSize = `${currentFontSize}em`;
        }
        // 設定をlocalStorageに保存
        localStorage.setItem('typingTheaterFontSize', currentFontSize);
    }
}

/**
 * 歌詞の分割数を変更する
 * @param {number} amount - 変更量
 */
function changeColumnCount(amount) {
    const newCount = currentColumnCount + amount;
    // 分割数に下限と上限を設定 (1〜10)
    if (newCount >= 1 && newCount <= 10) {
        currentColumnCount = newCount;
        const lyricsElement = document.querySelector('#result .lyrics');
        if (lyricsElement) {
            lyricsElement.style.columnCount = currentColumnCount;
        }
        // 設定をlocalStorageに保存
        localStorage.setItem('typingTheaterColumnCount', currentColumnCount);
    }
}
/**
 * XSS対策のためのHTMLエスケープ関数
 * @param {string} str - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}
