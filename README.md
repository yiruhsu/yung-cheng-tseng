# 藝術作品網站

這是一個純 HTML/CSS/JavaScript 的靜態網站，展示藝術作品，包含書法、繪畫、影像和篆刻等作品分類。

## ✨ 特色

- 🏠 首頁展示
- 👤 藝術家介紹（BIO）
- ✍️ 書法作品（cahlligraphy)
- 🎨 繪畫作品
- 📷 影像作品
- 🔖 篆刻作品
- 📱 響應式設計
- 🚀 **無需安裝任何軟體，直接在瀏覽器開啟即可使用**

## 🚀 使用方法

### 方法 1：直接開啟（最簡單）

1. 找到專案資料夾中的 `index.html` 檔案
2. 雙擊 `index.html` 檔案
3. 網站會在您的預設瀏覽器中開啟

### 方法 2：在 Safari 中開啟

1. 開啟 Safari 瀏覽器
2. 按 `Cmd + O`（或從選單選擇「檔案」→「開啟檔案」）
3. 選擇專案資料夾中的 `index.html` 檔案
4. 網站就會在 Safari 中開啟

### 方法 3：拖放開啟

1. 開啟 Safari 瀏覽器
2. 將 `index.html` 檔案直接拖放到 Safari 視窗中
3. 網站就會開啟

## 📁 檔案結構

```
cursor/
├── index.html      # 主 HTML 檔案（包含所有頁面內容）
├── styles.css      # 樣式檔案
├── script.js       # JavaScript 功能（頁面切換）
└── README.md       # 說明檔案
```

## 🎨 自訂內容

### 替換作品圖片

在各個作品頁面中，找到以下結構：
```html
<div class="artwork-image-placeholder">
    <p>書法作品 1</p>
</div>
```

將它替換為：
```html
<img src="images/calligraphy-1.jpg" alt="書法作品 1" class="artwork-image">
```

並在 CSS 中為 `.artwork-image` 添加樣式：
```css
.artwork-image {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
}
```

### 修改藝術家介紹

開啟 `index.html`，找到 `id="bio"` 的區塊，修改其中的文字內容即可。

### 修改顏色主題

開啟 `styles.css`，搜尋顏色代碼（如 `#667eea`、`#764ba2`）並替換為您喜歡的顏色。

## 💡 提示

- 所有頁面都在同一個 HTML 檔案中，使用 JavaScript 進行切換
- 網站完全離線可用，不需要網路連線
- 可以在任何現代瀏覽器中開啟（Safari、Chrome、Firefox、Edge 等）
- 響應式設計，在手機、平板和電腦上都能正常顯示

## 🔧 進階使用

如果您想要在本地伺服器上運行（可選，非必要），可以使用 Python：

```bash
# Python 3
python3 -m http.server 8000

# 然後在瀏覽器開啟 http://localhost:8000
```

但這不是必須的，直接開啟 `index.html` 即可！
