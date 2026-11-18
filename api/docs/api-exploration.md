# API exploration log

**Module:** Course 5, Module 1 — How the Web Talks
**Name:** Jordan Blake (reference)
**Date:** Day 1
**Requests file:** `api/requests/module-01.http`

For each request: method and URL, status, `Content-Type`, two other response
headers, a short body excerpt, and one sentence on what the request taught me.

---

## 1. httpbin — `https://httpbin.org`

An echo service: it sends my own request back to me, and can return any status
code on demand.

| # | Method and URL | Status | Content-Type | Two other headers | Body excerpt | What it taught me |
|---|---|---|---|---|---|---|
| L1 | `GET /get?section=A&seat=12` | 200 OK | `application/json` | `Access-Control-Allow-Origin: *`, `Server: gunicorn/19.9.0` | `"args": {"seat": "12", "section": "A"}` | The query string reaches the server as key–value pairs, always as strings |
| L2 | `POST /post` with a JSON body | 200 OK | `application/json` | `Content-Length`, `Access-Control-Allow-Credentials: true` | `"json": {"award": "Founders' Recognition for Commitment", "year": 2009}` | The body only arrives as JSON because I sent `Content-Type: application/json` and a blank line before it |
| L3 | `GET /status/418` | 418 I'm a teapot | `text/plain` | `x-more-info: http://tools.ietf.org/html/rfc2324`, `Content-Length: 135` | an ASCII teapot | A server can send any status; the code is a promise about what happened |
| L4 (own) | `GET /status/429` | 429 Too Many Requests | `text/html; charset=utf-8` | `Content-Length: 0`, `Server` | (empty) | 429 is the code a rate limit should use; the body can be empty |

**Which of these resources would map to a table?** None: httpbin stores
nothing. It is a mirror, not a database.
**Which query parameter is like a `WHERE`?** None here; `section` and `seat`
are only echoed. In my API, `?category=Industry` will be a `WHERE`.

## 2. JSONPlaceholder — `https://jsonplaceholder.typicode.com`

A fake REST API with users, posts and todos. It accepts writes and pretends to
save them.

| # | Method and URL | Status | Content-Type | Two other headers | Body excerpt | What it taught me |
|---|---|---|---|---|---|---|
| L5 | `GET /users/1` | 200 OK | `application/json; charset=utf-8` | `Cache-Control: max-age=43200`, `X-Powered-By: Express` | `"name": "Leanne Graham", "address": {"city": "Gwenborough", …}` | A resource can contain nested objects, like a join already done |
| L6 | `GET /posts?userId=1` | 200 OK | `application/json; charset=utf-8` | `Cache-Control`, `Vary: Origin, Accept-Encoding` | an array of 10 posts, each `"userId": 1` | A query parameter filters a list exactly like `WHERE user_id = 1` |
| L7 | `PATCH /posts/1` (title only) | 200 OK | `application/json; charset=utf-8` | `Cache-Control`, `X-Content-Type-Options: nosniff` | the whole post with `"title": "Platform renewal (edited)"` | PATCH sends only the changed field, like `UPDATE … SET title = … WHERE id = 1` |
| L8 | `DELETE /posts/1` | 200 OK | `application/json; charset=utf-8` | `Cache-Control`, `X-Powered-By` | `{}` | A delete has nothing to return; many APIs would answer 204 No Content |
| L9 (own) | `GET /todos?userId=2` | 200 OK | `application/json; charset=utf-8` | `Cache-Control`, `Vary` | 20 todos, each `"userId": 2`, `"completed": true/false` | The same filter works on another collection |

Also from Exercise 5: `POST /posts` returned **201** with `"id": 101`, but
`GET /posts/101` afterwards returned 404: nothing was really saved.

**Which of these resources would map to a table?** `users`, `posts` and
`todos` are each a table; `/posts/1` is one row (`WHERE id = 1`).
**Which query parameter is like a `WHERE`?** `userId=1`.

## 3. GitHub REST API — `https://api.github.com` (from the saved fixtures)

Read from `shared/offline-data/github/`, not called live: the lab shares one IP
address and GitHub allows 60 unauthenticated requests per hour per IP.

| # | Method and URL | Status | Content-Type | Two other headers | Body excerpt | What it taught me |
|---|---|---|---|---|---|---|
| G1 | `GET /users/octocat` (fixture) | 200 OK | `application/json; charset=utf-8` | `x-ratelimit-limit: 60`, `x-ratelimit-remaining: 57` | `"login": "octocat", "name": "The Octocat", "public_repos": 8` | The API tells me how many requests I have left in this hour |
| G2 | `GET /users/octocat` after the limit (fixture) | 403 Forbidden | `application/json; charset=utf-8` | `x-ratelimit-remaining: 0`, `x-ratelimit-reset` | `"message": "API rate limit exceeded for …"` | When 70 people share one IP, the limit is the room's, not mine; it is a 4xx because the client asked too often |
| G3 (own) | `GET /users/octocat` (fixture), `Cache-Control` | 200 OK | `application/json; charset=utf-8` | `Cache-Control: public, max-age=60, s-maxage=60`, `ETag` | — | The browser may reuse this response for 60 seconds instead of asking again |

**Which of these resources would map to a table?** `users` (one row per
account); each user's `repos` would be a second table with a user key.
**Which query parameter is like a `WHERE`?** None in these requests; on
`/users/octocat/repos?per_page=5&page=2`, `per_page` and `page` are like
`LIMIT 5 OFFSET 5`.

---

## My API (sketch)

Each Course 4 view becomes an endpoint the page can call. Designed properly in
Module 4, built on Day 3.

| Resume section | Course 4 view | Endpoint (Day 3) | Method | SQL it will run |
|---|---|---|---|---|
| Header | `v_profile_header` | `/api/profile` | GET | `SELECT … FROM v_profile_header` |
| Career at a glance | `v_career_summary` | `/api/summary` | GET | `SELECT … FROM v_career_summary` |
| Experience | `v_experience` | `/api/experience` | GET | `SELECT … FROM v_experience` |
| Selected projects | `v_projects_section` | `/api/projects` | GET | `SELECT … FROM v_projects_section` |
| Skills | `v_skill_evidence` | `/api/skills` | GET | `SELECT … FROM v_skill_evidence` |
| Education | `v_education_section` | `/api/education` | GET | `SELECT … FROM v_education_section` |
| Awards | `v_awards_section` | `/api/awards?category=Industry` | GET | `SELECT … WHERE category = %s` |
| Contact form (new) | `contact_messages` (new table, Module 7) | `/api/messages` | POST | `INSERT INTO contact_messages …` |
| **My own endpoint** | `v_awards_section` | `/api/awards/{id}` | GET | `SELECT … WHERE award_id = %s` |

The API will connect as `portfolio_web` (Course 4 Module 9), which can read the
views and nothing else, so the email address stays private. Values from the
request (`Industry`, `5`) go into SQL as parameters, never glued into the text.
