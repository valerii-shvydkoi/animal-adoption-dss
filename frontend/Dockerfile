FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
# Команда npm install буде працювати після ініціалізації React
# RUN npm install
COPY . .
# RUN npm run build

FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]