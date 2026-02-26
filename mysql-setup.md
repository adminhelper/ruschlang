# 루슐랭 MySQL 연동 가이드

## 1) 왜 MySQL로 가는가
- 운영 멤버들과 공유하려면 브라우저 저장소(localStorage)는 부적합
- 중앙 DB 필요: 멀티 사용자 리뷰/사진 메타데이터 동기화
- 권한 분리 및 감사(로그) 확장에 유리

## 2) 스키마 생성
```bash
# mysql 컨테이너 또는 외부 MySQL에 아래 SQL 적용
mysql -h 127.0.0.1 -P 3307 -u ruschlang -pruschlang ruschlang < db/mysql/schema.sql
```

`db/mysql/schema.sql`에는 다음 테이블이 포함됩니다.
- `restaurants` (맛집)
- `reviews` (리뷰, FK로 restaurants 연결)
- `admin_sessions` (토큰 저장용 예비 테이블)

운영 반영을 위해 추가로 `roadmaps` 테이블이 필요합니다.

`reviews.photo_url` 컬럼을 통해 후기에 먹은 사진(data URL)을 저장합니다.

기존 DB를 사용 중이라면 아래 DDL을 한 번 실행하세요.

```bash
ALTER TABLE reviews ADD COLUMN photo_url LONGTEXT NULL;
```

## 3) Docker로 MySQL 띄우기
```bash
cp server/.env.example server/.env
# 값 수정

docker compose up -d
```

- 기본 DB 포트: `3307`
- 초기화 SQL: `db/mysql/schema.sql`
- 로드맵 추가 SQL: `docs/db/sql/roadmaps.sql`

## 4) 백엔드 실행
```bash
cd server
bun install
cp .env.example .env
# .env ADMIN_TOKEN 값 꼭 변경
bun run dev
```

서버 기본 주소: `http://localhost:3001`

## 5) API 엔드포인트 (현재 적용)
- `GET /api/health`
- `GET /api/restaurants?sort=latest|rating|name`
- `GET /api/admin/ping` (관리자 토큰 검증)
- `POST /api/restaurants` (관리자만: Header `x-admin-token`)
- `DELETE /api/restaurants/:id` (관리자만: Header `x-admin-token`)
- `POST /api/restaurants/:id/reviews` (누구나)
- `GET /api/roadmaps` (로드맵 목록)
- `POST /api/roadmaps` (회원/관리자: `x-user-role` 헤더)
- `DELETE /api/road맵s/:id` (관리자만: Header `x-admin-token`)

## 6) 베스트 프랙티스(현재 구조)
- `restaurants`, `reviews`는 MySQL 정규화 테이블로 운영 데이터 관리
- 리뷰/가게 쓰기는 관리자 API 토큰(`x-admin-token`)으로 제한
- 지도 키, 관리자 세션은 브라우저 로컬에 저장(단기 TTL) + 서버 ping으로 세션 유효성 검증
- 사진은 현재 `photo_url` 필드에 Base64 문자열 저장 (초기 단계용). 운영에서는 S3/CloudFront나 R2로 분리 추천

## 7) 운영 시작 체크
```bash
cp server/.env.example server/.env
# MYSQL_PASSWORD, ADMIN_TOKEN, MYSQL_ROOT_PASSWORD 값 수정
docker compose up -d

cd server
bun install
bun run dev
```

이후 브라우저에서 `index.html`을 정적 서버 없이 바로 열어도 동작하는 API 경로를 사용하려면,
`app.js`의 `API_BASE_URL`를 배포 주소로 바꿔야 할 수 있습니다.
