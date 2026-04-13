# Настройка Firebase

Для работы приложения необходимо настроить Firebase Authentication и Firestore (для прогресса и статистики).

## Шаги настройки:

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект или выберите существующий
3. В настройках проекта найдите раздел "Ваши приложения"
4. Добавьте веб-приложение (иконка `</>`)
5. Скопируйте конфигурацию Firebase

## Обновление конфигурации:

Откройте файл `src/shared/config/firebase.js` и замените значения в `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "ваш-api-key",
  authDomain: "ваш-auth-domain",
  projectId: "ваш-project-id",
  storageBucket: "ваш-storage-bucket",
  messagingSenderId: "ваш-messaging-sender-id",
  appId: "ваш-app-id"
}
```

## Включение входа по email и паролю:

1. В Firebase Console перейдите в раздел **Authentication**
2. Нажмите **«Начать»**
3. Откройте вкладку **«Методы входа»**
4. Включите **«Электронная почта/пароль»** (и при необходимости «Имя пользователя» не обязательно)
5. Сохраните изменения

После этого ученики смогут **зарегистрироваться** (email + пароль + имя) и **войти** на странице по ссылке из QR.

## Firestore (прогресс и статистика)

1. В Firebase Console откройте **Firestore Database**
2. Нажмите **«Создать базу данных»**
3. Выберите режим (для старта можно test mode, но ниже есть безопасные правила)

### Рекомендуемые правила (минимальная безопасность для прототипа)

В Firestore → Rules вставьте:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isTeacher() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "teacher";
    }

    match /classes/{classId} {
      allow create: if isTeacher();
      allow read: if signedIn();
    }

    match /users/{userId} {
      // ученик читает/пишет только свой профиль
      allow read, write: if signedIn() && request.auth.uid == userId;

      // учитель может читать профили учеников для статистики
      allow read: if isTeacher() && resource.data.teacherUid == request.auth.uid;
      match /levels/{levelId} {
        allow read, write: if signedIn() && request.auth.uid == userId;
      }
    }
  }
}
```

### Как назначить учителя

1. Учитель регистрируется обычным способом (email/пароль) в приложении
2. В Firestore откройте документ `users/{uid_учителя}` (uid — из Firebase Authentication) и добавьте поле: `role = "teacher"`

После этого учитель сможет открыть `/qr` и `/statistics`.

## Привязка учеников к учителю через QR

Теперь QR создаёт ссылку вида `/login?class=<classId>`. Ученики, которые заходят по этой ссылке, будут привязаны к учителю:
- `users/{uid}.teacherUid = <uid учителя>`
- `users/{uid}.classId = <classId>`

В статистике учитель видит **только своих** учеников.

## Firebase Hosting (чтобы заходили из любой сети)

Это можно сделать на бесплатном тарифе.

1. Установите Firebase CLI:

```bash
npm i -g firebase-tools
```

2. Войдите:

```bash
firebase login
```

3. В папке проекта:

```bash
firebase init hosting
```

Выберите:
- Existing project: ваш проект Firebase
- Public directory: `dist`
- Single-page app: **Yes**

4. Соберите и задеплойте:

```bash
npm run build
firebase deploy
```

