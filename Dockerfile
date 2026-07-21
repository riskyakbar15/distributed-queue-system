FROM node:20-alpine

WORKDIR /app

# Instal dependency produksi terlebih dahulu (memanfaatkan cache layer).
COPY package*.json ./
RUN npm ci --omit=dev

# Salin sisa kode aplikasi.
COPY . .

# Port internal container (di-set juga via environment PORT).
EXPOSE 3000

CMD ["node", "server.js"]
