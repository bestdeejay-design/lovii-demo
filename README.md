# LOVII Витрина

**🔗 Демо: [https://bestdeejay-design.github.io/lovii_demo/](https://bestdeejay-design.github.io/lovii_demo/)**

Клиентская витрина LOVII: торговые точки района выкладывают товары и услуги,
клиент находит точку и товар и видит, **где он есть в наличии** и сколько минут
идти пешком. Работает полностью на статике — сервер не нужен.

## Что внутри

```
index.html          — каркас приложения (шапка, экраны, навигация, шит района)
css/lovii.css       — дизайн-система LOVII (pink #f64a8a · tiffany #0abab5 · gold #d4a854)
js/data.js          — демо-данные: районы, 14 точек, 39 товаров/услуг, наличие, акции
js/geo.js           — расстояние (гаверсинус) и «минуты пешком» (~80 м/мин)
js/icons.js         — SVG-иконки и логотип «кружок с сердечком»
js/screens.js       — экраны: главная, точка, товар («где есть рядом»), поиск, корзина, заказы
js/app.js           — состояние, hash-роутер, события, корзина/заказы в localStorage
lovii-heart.svg     — фавиконка
.nojekyll           — отключает Jekyll на GitHub Pages (обязательно оставить)
```

## Деплой за 3 минуты (через сайт GitHub)

1. Создайте репозиторий на github.com (например, `lovii`).
2. **Add file → Upload files** и перетащите **всё содержимое** этой папки
   (index.html, папки `css/` и `js/`, lovii-heart.svg, README, .nojekyll). Commit.
   - Если браузер не даёт загрузить `.nojekyll` (файл с точкой): **Add file →
     Create new file**, в имени введите `.nojekyll`, оставьте пустым и закоммитьте.
3. Откройте **Settings → Pages**, в блоке «Build and deployment»:
   - Source: **Deploy from a branch**
   - Branch: **main**, папка: **/ (root)** → Save.
4. Через 1–2 минуты витрина будет доступна по адресу
   `https://<ваш-логин>.github.io/<имя-репозитория>/`

## Деплой через git (если удобнее в терминале)

```bash
git init
git add .
git commit -m "LOVII витрина"
git branch -M main
git remote add origin https://github.com/<ваш-логин>/<имя-репозитория>.git
git push -u origin main
```

Затем то же самое: Settings → Pages → Deploy from a branch → main / (root).

## Почему всё работает без настроек

- **Hash-роутинг** (`#/product/cr-almond`) — обновление страницы и прямые ссылки
  не дают 404.
- **Относительные пути** — сайт работает и в корне (`user.github.io`), и в
  подкаталоге (`user.github.io/lovii/`).
- **Нет сборки** — чистые HTML/CSS/JS, ничего не нужно компилировать.
- Корзина и заказы хранятся в `localStorage` браузера.

## Как менять данные (js/data.js)

- **Районы** — `districts`: имя, метро, координаты позиции клиента.
- **Точки** — `stores`: координаты `lat/lng` (по ним автоматически считаются
  минуты пешком), часы работы, описание, теги.
- **Товары** — `products`: базовая цена и наличие `avail: [точка, остаток, ±цена]`.
- **Акции** — `promos`.
