# 구조도 (요약)

## 디렉터리 구성

- `index.html`: 탭(탐방 지도/탐방 게시판/로드맵/관리자 등록)과 마크업의 진입점
- `styles.css`: 레이아웃·카드·맵/폼 상태 클래스 스타일
- `app.js`: 클라이언트 상태 관리, 권한 분기, 지도 로딩, 렌더링, API 호출
- `server/src/index.js`: Express API
  - 지도 설정(`api/map/*`)
  - 맛집 CRUD / 리뷰 CRUD
  - 로드맵 CRUD (`/api/roadmaps`)
- `db/mysql/schema.sql`: 핵심 테이블 생성 DDL
- `docs/db/sql/roadmaps.sql`: 로드맵 테이블(별도 마이그레이션)
- `docs/실행방법.md`: 실행/검증 절차

## 권한 상태 기계

- `ROLE_GUEST` (비회원): 지도/탐방게시판 조회만
- `ROLE_MEMBER` (회원): 지도/탐방게시판/로드맵 조회, 리뷰 및 로드맵 등록
- `ROLE_ADMIN` (관리자): 위 권한 + 맛집 등록

`app.js`는 `ROLE_*` 상태를 기반으로:

1. 탭 노출 제어
2. 폼 접근 제어
3. 서버 요청 시 헤더(`x-user-role`) 조합

을 수행합니다.

## 베스트 프랙티스 기준 정리

- 백엔드 API와 클라이언트 역할 분리: DB/권한 검증은 API에서 수행, UI는 가시성/UX 제어
- 스키마 확장성: 로드맵을 `roadmaps` 테이블로 분리해 향후 `tags`, `pins`, `comments`를 쉽게 추가
- 점진적 마이그레이션: 기존 `schema.sql`은 초기 설치, 추가 기능은 `docs/db/sql/*.sql`
