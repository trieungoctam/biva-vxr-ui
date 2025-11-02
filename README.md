# Biva Chat Combat Deck

Frontend playground phong cách game cho API Biva Chat.

## 🚀 Cài đặt & chạy

```bash
cd frontend
pnpm install       # hoặc npm install / yarn install
pnpm dev           # chạy ở http://localhost:5173
```

> Mặc định proxy tới `http://localhost:8000`. Đổi server bằng cách set `VITE_API_BASE_URL` hoặc cập nhật `vite.config.ts`.

## 🧩 Tính năng chính
- Khởi động cuộc trò chuyện mới qua `/api/conversation/init`
- Gửi tin nhắn và nhận phản hồi streaming SSE từ `/chat/stream`
- Bảng điều khiển cấu hình (conversation, bot, phone, request info, input slots JSON)
- HUD hiển thị trạng thái bot, model, số lượt, conversation id
- Giao diện neon, glassmorphism theo phong cách command center

## ⚙️ Environment Variables
- `VITE_API_BASE_URL` (optional): override base URL nếu backend chạy khác `http://localhost:17498`

## 🚀 Railway Deployment

### 1. GitHub Integration (Khuyên dùng)
```bash
# Push code lên GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

1. Truy cập [railway.app](https://railway.app)
2. Login bằng GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Chọn repository này
5. Railway sẽ tự động detect và deploy

### 2. Cấu hình Backend URL trên Railway
Trong Railway dashboard → Variables, thêm:
```
VITE_API_BASE_URL=http://103.141.140.243:17498
```

**Note:** Railway.toml đã được cấu hình sẵn với URL này. Bạn có thể overwrite trong Railway dashboard nếu cần.

### 3. Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 🧪 Kiểm thử
Chạy backend thật hoặc mock SSE tương thích để trải nghiệm đầy đủ.

## 🧭 Cấu trúc chính
```
frontend/
  ├─ src/
  │   ├─ components/      # HUD, config panel, chat panel
  │   ├─ hooks/           # useChatStream hook
  │   ├─ types.ts         # shared types
  │   └─ styles.css       # chủ đề neon/game
  ├─ index.html
  ├─ package.json
  └─ vite.config.ts
```
