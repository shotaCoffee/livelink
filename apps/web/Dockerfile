FROM node:18-alpine

# pnpmインストール
RUN npm install -g pnpm

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# 依存関係インストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

EXPOSE 3000

# 開発サーバー起動
CMD ["pnpm", "--filter", "@band-setlist/web", "dev", "--host", "0.0.0.0"]