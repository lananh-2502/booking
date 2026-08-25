# Deploy từ GitHub lên Cloudflare Workers

Repository phải bắt đầu tại thư mục chứa `package.json`. Không đẩy thư mục cha `work` hoặc `buil` làm project root.

## 1. Tạo repository GitHub

Tạo repository trống, sau đó chạy trong thư mục `site`:

```powershell
git remote rename origin codex-sites
git remote add origin https://github.com/TEN_GITHUB/TEN_REPO.git
git push -u origin main
```

## 2. Tạo D1 database

Đăng nhập Cloudflare từ máy cá nhân:

```powershell
npx wrangler login
npx wrangler d1 create hen-nha-db
```

Lưu lại `database_id` được trả về.

## 3. Tạo Cloudflare API token

Trong Cloudflare Dashboard, tạo API token có quyền deploy Workers và chỉnh sửa D1 trong đúng account. Ghi lại Account ID và token; không commit các giá trị này vào repository.

## 4. Thêm GitHub Actions secrets

Vào repository GitHub → **Settings → Secrets and variables → Actions → New repository secret** rồi thêm:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`

Có thể thêm hai repository variables nếu muốn đổi tên mặc định:

- `CLOUDFLARE_WORKER_NAME` — mặc định `hen-nha`
- `CLOUDFLARE_D1_DATABASE_NAME` — mặc định `hen-nha-db`

## 5. Deploy

Mỗi lần push vào nhánh `main`, workflow sẽ:

1. Cài dependencies bằng `npm ci`.
2. Build ứng dụng.
3. Tạo cấu hình Wrangler từ output của Vinext.
4. Áp dụng các migration trong `drizzle/` lên D1.
5. Deploy Worker và static assets.

Có thể chạy thủ công trong tab **Actions → Deploy to Cloudflare Workers → Run workflow**.

## Chạy thử trước khi push

```powershell
$env:CLOUDFLARE_D1_DATABASE_ID="DATABASE_ID_CUA_BAN"
$env:CLOUDFLARE_D1_DATABASE_NAME="hen-nha-db"
$env:CLOUDFLARE_WORKER_NAME="hen-nha"
npm run build
npm run deploy:prepare
npx wrangler deploy --dry-run --config dist/server/wrangler.deploy.jsonc
```

`dist/server/wrangler.deploy.jsonc` được tạo tự động trong thư mục build và không được commit lên Git.
