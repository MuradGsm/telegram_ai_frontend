# Support Console — фронтенд

Простой веб-интерфейс к твоему FastAPI-бэкенду: регистрация/вход, воркспейсы,
подключение Telegram-бота, база знаний (документы) и диалоги с клиентами.

## Запуск

1. Установи зависимости:

   ```bash
   npm install
   ```

2. Убедись, что бэкенд запущен на `http://localhost:8000` (или укажи свой адрес
   в файле `.env`, скопировав `.env.example`):

   ```bash
   cp .env.example .env
   ```

3. **Важно:** на бэкенде должен быть включён CORS для адреса фронтенда
   (по умолчанию `http://localhost:5173`). В FastAPI это делается так:

   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. Запусти дев-сервер:

   ```bash
   npm run dev
   ```

5. Открой http://localhost:5173 в браузере.

## Структура

- `src/api/client.js` — axios-клиент, подставляет токен в заголовки и
  автоматически обновляет его через `/auth/refresh` при 401.
- `src/context/AuthContext.jsx` — состояние авторизации (текущий пользователь).
- `src/pages/` — страницы: Login, Register, Workspaces, WorkspaceOverview
  (подключение бота), Documents (база знаний), Dialogs (список диалогов),
  DialogDetail (переписка + ответ).
- `src/components/Layout.jsx` — сайдбар с переключателем воркспейсов.

## Что дальше

Это рабочий прототип для локальной проверки. Из очевидных доработок:

- Пагинация списка диалогов (бэкенд уже поддерживает `limit`/`offset`).
- Realtime-обновление диалогов (сейчас список сообщений не обновляется
  автоматически, если клиент пишет "вживую" — можно добавить polling или
  WebSocket, когда он появится в API).
- Показ статуса подписки/оплаты, если он появится в бэкенде.
