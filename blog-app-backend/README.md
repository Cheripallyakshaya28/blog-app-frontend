# Blog App Backend (Java + Spring Boot)

REST API for the Blog App. Same URLs, JSON and cookie-based login as the old Node/Express version,
so the React frontend works unchanged.

### Database tables (auto-created)
`users`, `articles`, `comments` (comments belong to an article).

- Java 17+ , Spring Boot 3.3, Maven
- MySQL (Spring Data JPA / Hibernate; tables are created automatically)
- JWT in an httpOnly cookie, BCrypt password hashing
- Cloudinary for profile images

## Run locally
1. Install **JDK 17 or newer** (check with `java -version`) and **MySQL 8**, and make sure MySQL is running.
   Maven is NOT needed - the project includes the Maven wrapper.
2. Open `.env` in this folder and set `DB_PASSWORD` to your MySQL root password (leave empty if root has none).
3. Start the server:
   - Windows: `mvnw.cmd spring-boot:run`
   - Mac / Linux: `./mvnw spring-boot:run`  (if "permission denied": `chmod +x mvnw`)
4. Open http://localhost:4000 - you should see `{"message":"Blog API is running ..."}`.

The first run downloads dependencies (a few minutes) and creates the database + tables automatically.
An admin login is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (default admin@mail.com / admin123).

## Troubleshooting
| Error shown | Fix |
|---|---|
| `release version 17 not supported` / `invalid target release: 17` | Your Java is older than 17. Install JDK 17+ and set `JAVA_HOME` to it. |
| `Access denied for user 'root'@'localhost'` | `DB_PASSWORD` in `.env` is wrong. |
| `Communications link failure` / `Connection refused` | MySQL isn't running, or `DB_URL` host/port is wrong (default port 3306). |
| `Port 4000 was already in use` | Stop the other app on 4000, or set `PORT=4001` in `.env` (and `VITE_API_URL` in the frontend). |
| `mvnw` is not recognized | Run it from inside the `blog-app-backend` folder (where `mvnw.cmd` is). |
| Login works but you are logged out on refresh | Use `COOKIE_SECURE=false` and `COOKIE_SAME_SITE=Lax` locally (already set in `.env`). |

## Package layout
```
com.blogapp
 ├─ controller   CommonController (/auth), UserController (/user-api),
 │               AuthorController (/author-api), AdminController (/admin-api)
 ├─ model        User, Article, Comment
 ├─ repository   UserRepository, ArticleRepository
 ├─ security     JwtService, AuthInterceptor, @RequireRole
 ├─ service      CloudinaryService, ArticleViewService
 ├─ config       WebConfig (CORS, BCrypt), AdminSeeder
 └─ exception    ApiException, GlobalExceptionHandler
```

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /auth/users | public (multipart form or JSON) |
| POST | /auth/login | public |
| GET | /auth/logout | public |
| GET | /auth/check-auth | any logged-in |
| PUT | /auth/password | any logged-in |
| GET | /user-api/articles | public |
| GET | /user-api/article/{id} | public (deleted ones: owner/admin) |
| PUT | /user-api/articles (add comment) | USER, AUTHOR, ADMIN |
| POST | /author-api/article | AUTHOR |
| GET / PUT / PATCH | /author-api/articles | AUTHOR |
| GET | /admin-api/users, /authors, /articles | ADMIN |
| DELETE | /admin-api/users/{id}, /articles/{id} | ADMIN |
| PUT | /admin-api/user/{id}/status | ADMIN |
