import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { pool, ping } from "./db.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const PORT = Number(process.env.PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";
const NAVER_MAP_CLIENT_ID = (process.env.NAVER_MAP_CLIENT_ID || "").trim();
const NAVER_SEARCH_CLIENT_ID = (process.env.NAVER_SEARCH_CLIENT_ID || "").trim();
const NAVER_SEARCH_CLIENT_SECRET = (process.env.NAVER_SEARCH_CLIENT_SECRET || "").trim();
const REVIEW_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const POST_STATUS_PENDING = "pending";
const POST_STATUS_APPROVED = "approved";
const POST_STATUS_REJECTED = "rejected";
const POST_STATUSES = new Set([POST_STATUS_PENDING, POST_STATUS_APPROVED, POST_STATUS_REJECTED]);
const POST_ROLE_GUEST = "guest";
const POST_ROLE_MEMBER = "member";
const POST_ROLE_ADMIN = "admin";

const app = express();
app.use(express.json({ limit: "8mb" }));
app.use(
  cors({
    origin: CORS_ORIGIN.includes(",")
      ? CORS_ORIGIN.split(",").map((value) => value.trim())
      : CORS_ORIGIN,
    credentials: true,
  }),
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
app.use(express.static(projectRoot));

function clampRating(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(Math.min(5, Math.max(0.1, value)) * 10) / 10;
  return rounded;
}

function parseHalfStepRating(raw, options = {}) {
  const allowEmpty = Boolean(options.allowEmpty);
  if (raw === null || raw === undefined || raw === "") {
    return allowEmpty ? null : Number.NaN;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) return Number.NaN;
  if (value < 0.5 || value > 5) return Number.NaN;
  if (Math.round(value * 2) !== value * 2) return Number.NaN;
  return Math.round(value * 10) / 10;
}

function parseRoleHeader(req) {
  const value = String(req.header("x-user-role") || "").trim().toLowerCase();
  if (value === POST_ROLE_ADMIN || value === POST_ROLE_MEMBER) {
    return value;
  }
  return POST_ROLE_GUEST;
}

function sanitizePostText(value, maxLength = 0) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return maxLength > 0 ? trimmed.slice(0, maxLength) : trimmed;
}

function isValidCoordinate(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function toNumber(raw, fallback = 0) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function parseOptionalCoordinate(raw, min, max) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  const value = Number(raw);
  if (!isValidCoordinate(value, min, max)) {
    return Number.NaN;
  }

  return value;
}

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "ADMIN_TOKEN required" });
  }

  next();
}

function normalizeRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    description: row.description,
    photoUrl: row.photo_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviews: [],
  };
}

function normalizeReview(row) {
  return {
    id: row.id,
    name: row.reviewer_name,
    rating: Number(row.rating),
    note: row.note,
    createdAt: row.created_at,
    photoUrl: row.photo_url || "",
  };
}

function normalizeRoadmap(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    stops: row.stops || "",
    rating: Number(row.rating || 0),
    ratingCount: Number(row.rating_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePost(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    authorRole: row.author_role,
    content: row.content,
    lat: row.lat === null || row.lat === undefined ? null : Number(row.lat),
    lng: row.lng === null || row.lng === undefined ? null : Number(row.lng),
    address: row.address || "",
    placeName: row.place_name || "",
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comments: [],
  };
}

function normalizePostComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    parentCommentId: row.parent_comment_id || "",
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
  };
}

function estimateDataUrlBytes(dataUrl) {
  const idx = dataUrl.indexOf(",");
  if (idx < 0) return Number.MAX_SAFE_INTEGER;

  const metadata = dataUrl.slice(0, idx).toLowerCase();
  if (!metadata.startsWith("data:image/")) return Number.MAX_SAFE_INTEGER;

  const b64 = dataUrl.slice(idx + 1);
  const clean = b64.replace(/\s/g, "");
  return Math.ceil(clean.length * 3 / 4);
}

function normalizeReviewPhoto(raw, options = {}) {
  const maxBytes = Number.isFinite(options.maxBytes) ? options.maxBytes : REVIEW_PHOTO_MAX_BYTES;
  if (!raw || typeof raw !== "string") return "";

  const value = raw.trim();
  if (!value) return "";
  if (!value.startsWith("data:image/")) return "";
  if (estimateDataUrlBytes(value) > maxBytes) return "";

  return value;
}

function parsePostStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return POST_STATUSES.has(status) ? status : "";
}

function buildPostStatusFilter(role) {
  if (role === POST_ROLE_ADMIN) {
    return null;
  }

  if (role === POST_ROLE_MEMBER) {
    return [POST_STATUS_APPROVED, POST_STATUS_PENDING];
  }

  return [POST_STATUS_APPROVED];
}

function toPlaceholders(count) {
  return Array.from({ length: count }, () => "?").join(", ");
}

function mapPostCommentsByPostId(commentRows) {
  const map = new Map();

  commentRows.forEach((row) => {
    const current = normalizePostComment(row);
    if (!map.has(current.postId)) {
      map.set(current.postId, []);
    }

    map.get(current.postId).push(current);
  });

  return map;
}

app.get("/api/health", async (_req, res) => {
  try {
    await ping();
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
});

app.get("/api/admin/ping", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

function createNaverMapScriptUrl() {
  if (!NAVER_MAP_CLIENT_ID) return "";
  return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(NAVER_MAP_CLIENT_ID)}`;
}

app.get("/api/map/config", (_req, res) => {
  const hasMapClientId = Boolean(NAVER_MAP_CLIENT_ID);

  if (!hasMapClientId) {
    res.status(503).json({
      ok: false,
      provider: "naver",
      configured: false,
      scriptUrl: null,
      message: "NAVER_MAP_CLIENT_ID is not configured",
    });
    return;
  }

  res.json({
    ok: true,
    provider: "naver",
    configured: true,
    scriptUrl: "/api/map/sdk/naver.js",
    displayName: "Naver",
  });
});

app.get("/api/map/sdk/naver.js", (_req, res) => {
  const scriptUrl = createNaverMapScriptUrl();

  if (!scriptUrl) {
    res.status(503).json({
      ok: false,
      message: "NAVER_MAP_CLIENT_ID is not configured",
    });
    return;
  }

  res.redirect(302, scriptUrl);
});

app.get("/api/roadmaps", async (req, res) => {
  try {
    const [roadmapRows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        description,
        stops,
        rating,
        rating_count,
        created_at,
        updated_at
      FROM roadmaps
      ORDER BY updated_at DESC
      `,
    );

    res.json(roadmapRows.map(normalizeRoadmap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "로드맵 목록 조회 실패" });
  }
});

app.post("/api/roadmaps", async (req, res) => {
  try {
    const roleHeader = String(req.header("x-user-role") || "").trim().toLowerCase();
    const headerAdminToken = req.header("x-admin-token");
    const isAuthorized = roleHeader === "admin" || roleHeader === "member" || Boolean(headerAdminToken && headerAdminToken === ADMIN_TOKEN);

    if (!isAuthorized) {
      res.status(401).json({ message: "로그인 후 로드맵을 등록할 수 있습니다." });
      return;
    }

    const title = String(req.body?.title || "").trim().slice(0, 140);
    const author = String(req.body?.author || "").trim().slice(0, 60) || "익명";
    const description = String(req.body?.description || "").trim().slice(0, 2000);
    const stops = String(req.body?.stops || "").trim().slice(0, 1200);

    if (!title || !author || !description) {
      res.status(400).json({ message: "필수 항목이 누락되었습니다." });
      return;
    }

    const id = randomUUID ? randomUUID() : `roadmap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO roadmaps (id, title, author, description, stops, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [id, title, author, description, stops],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        description,
        stops,
        rating,
        rating_count,
        created_at,
        updated_at
      FROM roadmaps
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.status(201).json(normalizeRoadmap(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "로드맵 등록 실패" });
  }
});

app.delete("/api/roadmaps/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const [result] = await pool.query("DELETE FROM roadmaps WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404).json({ message: "삭제할 로드맵이 없습니다." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "로드맵 삭제 실패" });
  }
});

app.post("/api/roadmaps/:id/rate", async (req, res) => {
  try {
    const role = parseRoleHeader(req);
    if (role !== POST_ROLE_MEMBER && role !== POST_ROLE_ADMIN) {
      res.status(401).json({ message: "회원 또는 관리자 로그인 후 평점을 등록할 수 있습니다." });
      return;
    }

    const id = String(req.params.id || "").trim();
    if (!id) {
      res.status(400).json({ message: "로드맵 ID가 없습니다." });
      return;
    }

    const rating = parseHalfStepRating(req.body?.rating);
    if (!Number.isFinite(rating)) {
      res.status(400).json({ message: "평점은 0.5~5.0 사이의 0.5 단위여야 합니다." });
      return;
    }

    const [result] = await pool.query(
      `UPDATE roadmaps
       SET rating = ROUND(((rating * rating_count) + ?) / (rating_count + 1), 1),
           rating_count = rating_count + 1,
           updated_at = CURRENT_TIMESTAMP(3)
       WHERE id = ?`,
      [rating, id],
    );

    if (!result.affectedRows) {
      res.status(404).json({ message: "해당 로드맵을 찾을 수 없습니다." });
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        description,
        stops,
        rating,
        rating_count,
        created_at,
        updated_at
      FROM roadmaps
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.json(normalizeRoadmap(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "로드맵 평점 등록 실패" });
  }
});

app.put("/api/roadmaps/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const title = String(req.body?.title || "").trim().slice(0, 140);
    const author = String(req.body?.author || "").trim().slice(0, 60) || "관리자";
    const description = String(req.body?.description || "").trim().slice(0, 2000);
    const stops = String(req.body?.stops || "").trim().slice(0, 1200);

    if (!id) {
      res.status(400).json({ message: "로드맵 ID가 없습니다." });
      return;
    }

    if (!title || !author || !description) {
      res.status(400).json({ message: "제목, 작성자, 설명은 필수입니다." });
      return;
    }

    const [result] = await pool.query(
      `UPDATE roadmaps
       SET title = ?, author = ?, description = ?, stops = ?, updated_at = CURRENT_TIMESTAMP(3)
       WHERE id = ?`,
      [title, author, description, stops, id],
    );

    if (!result.affectedRows) {
      res.status(404).json({ message: "수정할 로드맵이 없습니다." });
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        description,
        stops,
        rating,
        rating_count,
        created_at,
        updated_at
      FROM roadmaps
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.json(normalizeRoadmap(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "로드맵 수정 실패" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const role = parseRoleHeader(req);
    const queryStatus = parsePostStatus(req.query.status);
    const statusFilter = queryStatus
      ? [queryStatus]
      : buildPostStatusFilter(role);

    const hasStatusFilter = Array.isArray(statusFilter);
    const statusPlaceholders = hasStatusFilter ? toPlaceholders(statusFilter.length) : "";
    const statusCondition = hasStatusFilter
      ? `WHERE status IN (${statusPlaceholders})`
      : "";

    const [postRows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        author_role,
        content,
        lat,
        lng,
        address,
        place_name,
        rating,
        status,
        created_at,
        updated_at
      FROM posts
      ${statusCondition}
      ORDER BY created_at DESC
      `,
      hasStatusFilter ? statusFilter : [],
    );

    if (!postRows.length) {
      res.json([]);
      return;
    }

    const ids = postRows.map((row) => row.id);
    const [commentRows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        parent_comment_id,
        author,
        content,
        created_at
      FROM post_comments
      WHERE post_id IN (?)
      ORDER BY created_at ASC
      `,
      [ids],
    );

    const commentMap = mapPostCommentsByPostId(commentRows);
    const normalized = postRows.map((row) => {
      const post = normalizePost(row);
      post.comments = commentMap.get(post.id) || [];
      return post;
    });

    res.json(normalized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "탐방 게시글 조회 실패" });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const role = parseRoleHeader(req);
    if (role !== POST_ROLE_MEMBER && role !== POST_ROLE_ADMIN) {
      res.status(401).json({ message: "로그인 후 게시글을 등록할 수 있습니다." });
      return;
    }

    const title = sanitizePostText(req.body?.title, 140);
    const author = sanitizePostText(req.body?.author, 80) || (role === POST_ROLE_ADMIN ? "관리자" : "익명");
    const content = sanitizePostText(req.body?.content, 2000);
    const lat = parseOptionalCoordinate(req.body?.lat, -90, 90);
    const lng = parseOptionalCoordinate(req.body?.lng, -180, 180);
    const address = sanitizePostText(req.body?.address, 255);
    const placeName = sanitizePostText(req.body?.place_name ?? req.body?.placeName, 255);
    const rating = parseHalfStepRating(req.body?.rating, { allowEmpty: true });

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400).json({ message: "위치 좌표 형식이 올바르지 않습니다." });
      return;
    }

    if ((lat === null) !== (lng === null)) {
      res.status(400).json({ message: "위도와 경도는 함께 입력해야 합니다." });
      return;
    }

    if (Number.isNaN(rating)) {
      res.status(400).json({ message: "게시글 평점은 0.5~5.0 사이의 0.5 단위여야 합니다." });
      return;
    }

    if (!title || !content) {
      res.status(400).json({ message: "제목과 내용을 입력해 주세요." });
      return;
    }

    const id = randomUUID ? randomUUID() : `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const status = role === POST_ROLE_ADMIN ? POST_STATUS_APPROVED : POST_STATUS_PENDING;

    await pool.query(
      `INSERT INTO posts (id, title, author, author_role, content, lat, lng, address, place_name, rating, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [id, title, author, role, content, lat, lng, address || null, placeName || null, rating, status],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        author_role,
        content,
        lat,
        lng,
        address,
        place_name,
        rating,
        status,
        created_at,
        updated_at
      FROM posts
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.status(201).json(normalizePost(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 등록 실패" });
  }
});

app.put("/api/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) {
      res.status(400).json({ message: "게시글 ID가 없습니다." });
      return;
    }

    const title = sanitizePostText(req.body?.title, 140);
    const content = sanitizePostText(req.body?.content, 2000);

    if (!title || !content) {
      res.status(400).json({ message: "제목과 내용을 입력해 주세요." });
      return;
    }

    const [result] = await pool.query(
      "UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
      [title, content, id],
    );

    if (!result.affectedRows) {
      res.status(404).json({ message: "수정할 게시글이 없습니다." });
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        author_role,
        content,
        lat,
        lng,
        address,
        place_name,
        rating,
        status,
        created_at,
        updated_at
      FROM posts
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    const normalized = normalizePost(rows[0]);
    const [commentRows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        parent_comment_id,
        author,
        content,
        created_at
      FROM post_comments
      WHERE post_id = ?
      ORDER BY created_at ASC
      `,
      [id],
    );

    normalized.comments = mapPostCommentsByPostId(commentRows).get(id) || [];
    res.json(normalized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 수정 실패" });
  }
});

app.patch("/api/posts/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const status = parsePostStatus(req.body?.status);

    if (!id) {
      res.status(400).json({ message: "게시글 ID가 없습니다." });
      return;
    }

    if (!status) {
      res.status(400).json({ message: "승인 상태는 pending/approved/rejected 여야 합니다." });
      return;
    }

    const [result] = await pool.query(
      "UPDATE posts SET status = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
      [status, id],
    );

    if (!result.affectedRows) {
      res.status(404).json({ message: "대상 게시글이 없습니다." });
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        author,
        author_role,
        content,
        lat,
        lng,
        address,
        place_name,
        rating,
        status,
        created_at,
        updated_at
      FROM posts
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.json(normalizePost(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 상태 변경 실패" });
  }
});

app.delete("/api/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const [result] = await pool.query("DELETE FROM posts WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404).json({ message: "삭제할 게시글이 없습니다." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게시글 삭제 실패" });
  }
});

app.get("/api/posts/:id/comments", async (req, res) => {
  try {
    const postId = String(req.params.id || "").trim();
    if (!postId) {
      res.status(400).json({ message: "게시글 ID가 없습니다." });
      return;
    }

    const [postRows] = await pool.query("SELECT id FROM posts WHERE id = ? LIMIT 1", [postId]);
    if (!postRows.length) {
      res.status(404).json({ message: "해당 게시글이 없습니다." });
      return;
    }

    const [commentRows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        parent_comment_id,
        author,
        content,
        created_at
      FROM post_comments
      WHERE post_id = ?
      ORDER BY created_at ASC
      `,
      [postId],
    );

    res.json(commentRows.map(normalizePostComment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 조회 실패" });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const postId = String(req.params.id || "").trim();
    const role = parseRoleHeader(req);

    if (role !== POST_ROLE_MEMBER && role !== POST_ROLE_ADMIN) {
      res.status(401).json({ message: "회원 로그인 후 댓글을 작성할 수 있습니다." });
      return;
    }

    if (!postId) {
      res.status(400).json({ message: "게시글 ID가 없습니다." });
      return;
    }

    const content = sanitizePostText(req.body?.content, 700);
    if (!content) {
      res.status(400).json({ message: "댓글 내용을 입력해 주세요." });
      return;
    }

    const author = sanitizePostText(req.body?.author, 80) || (role === POST_ROLE_ADMIN ? "관리자" : "익명");

    const [postRows] = await pool.query(
      "SELECT id, status FROM posts WHERE id = ? LIMIT 1",
      [postId],
    );

    if (!postRows.length) {
      res.status(404).json({ message: "해당 게시글이 없습니다." });
      return;
    }

    if (role !== POST_ROLE_ADMIN && postRows[0].status !== POST_STATUS_APPROVED) {
      res.status(403).json({ message: "승인된 게시글에만 댓글을 달 수 있습니다." });
      return;
    }

    const parentRaw = String(req.body?.parentCommentId || "").trim();
    const parentCommentId = parentRaw || null;

    if (parentCommentId) {
      const [parentRows] = await pool.query(
        "SELECT id, post_id, parent_comment_id FROM post_comments WHERE id = ? LIMIT 1",
        [parentCommentId],
      );

      if (!parentRows.length) {
        res.status(400).json({ message: "존재하지 않는 대댓글 대상입니다." });
        return;
      }

      if (parentRows[0].post_id !== postId) {
        res.status(400).json({ message: "다른 게시글의 댓글에는 답글을 달 수 없습니다." });
        return;
      }

      let current = parentCommentId;
      const seen = new Set([current]);

      while (current) {
        const [parentLoopRows] = await pool.query(
          "SELECT parent_comment_id FROM post_comments WHERE id = ? LIMIT 1",
          [current],
        );

        if (!parentLoopRows.length) {
          current = null;
          break;
        }

        const next = parentLoopRows[0].parent_comment_id;
        if (!next) {
          current = null;
          break;
        }

        if (seen.has(next)) {
          res.status(409).json({ message: "대댓글 루프가 감지되어 요청할 수 없습니다." });
          return;
        }

        seen.add(next);
        current = next;
      }
    }

    const id = randomUUID ? randomUUID() : `post-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO post_comments (id, post_id, parent_comment_id, author, content)
       VALUES (?, ?, ?, ?, ?)`,
      [id, postId, parentCommentId, author, content],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        parent_comment_id,
        author,
        content,
        created_at
      FROM post_comments
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    res.status(201).json(normalizePostComment(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "댓글 등록 실패" });
  }
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const sortBy = String(req.query.sort || "latest");
    let orderSql = "r.updated_at DESC";

    if (sortBy === "name") {
      orderSql = "r.name ASC";
    }

    const [restaurantRows] = await pool.query(
      `
      SELECT
        id,
        name,
        address,
        lat,
        lng,
        description,
        photo_url,
        created_at,
        updated_at
      FROM restaurants r
      ORDER BY ${orderSql}
      `,
    );

    const restaurants = restaurantRows.map(normalizeRestaurant);

    if (!restaurants.length) {
      res.json([]);
      return;
    }

    const ids = restaurants.map((item) => item.id);

    const [reviewRows] = await pool.query(
      `
      SELECT
        id,
        restaurant_id,
        reviewer_name,
        rating,
        note,
        created_at,
        photo_url
      FROM reviews
      WHERE restaurant_id IN (?)
      ORDER BY created_at DESC
      `,
      [ids],
    );

    const bucket = {};
    restaurants.forEach((item) => {
      bucket[item.id] = [];
    });

    reviewRows.forEach((review) => {
      if (bucket[review.restaurant_id]) {
        bucket[review.restaurant_id].push(normalizeReview(review));
      }
    });

    const byReviewAverage = (item) => {
      if (!bucket[item.id].length) return 0;
      const total = bucket[item.id].reduce((sum, review) => sum + review.rating, 0);
      return total / bucket[item.id].length;
    };

    const mapped = restaurants.map((item) => {
      const copy = { ...item, reviews: bucket[item.id] || [] };
      return copy;
    });

    if (sortBy === "rating") {
      mapped.sort((left, right) => byReviewAverage(right) - byReviewAverage(left));
    }

    if (req.query.badge) {
      // optional server-side filter is omitted for simplicity;
      // client can filter by badge to stay aligned with current UI logic.
    }

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "레스토랑 목록 조회 실패" });
  }
});

app.post("/api/restaurants", requireAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const address = String(req.body?.address || "").trim();
    const description = String(req.body?.description || "").trim();
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);
    const photoUrl = String(req.body?.photoUrl || req.body?.photoDataUrl || "").trim();

    if (!name || !address || !description) {
      res.status(400).json({ message: "필수 항목이 누락되었습니다." });
      return;
    }

    if (!isValidCoordinate(lat, -90, 90) || !isValidCoordinate(lng, -180, 180)) {
      res.status(400).json({ message: "좌표가 올바르지 않습니다." });
      return;
    }

    const id = randomUUID ? randomUUID() : `restaurant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const [dupRows] = await pool.query(
      "SELECT id FROM restaurants WHERE name = ? AND lat = ? AND lng = ? LIMIT 1",
      [name, lat, lng],
    );

    if (dupRows.length) {
      res.status(409).json({ message: "이미 등록된 맛집입니다." });
      return;
    }

    await pool.query(
      `INSERT INTO restaurants (id, name, address, lat, lng, description, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, address, lat, lng, description, photoUrl || null],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        address,
        lat,
        lng,
        description,
        photo_url,
        created_at,
        updated_at
      FROM restaurants
      WHERE id = ?
      `,
      [id],
    );

    res.status(201).json({
      ...normalizeRestaurant(rows[0]),
      reviews: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "맛집 등록 실패" });
  }
});

app.delete("/api/restaurants/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    const [result] = await pool.query("DELETE FROM restaurants WHERE id = ?", [id]);

    if (!result.affectedRows) {
      res.status(404).json({ message: "삭제할 데이터가 없습니다." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "삭제 실패" });
  }
});

app.post("/api/restaurants/:id/reviews", async (req, res) => {
  try {
    const restaurantId = String(req.params.id || "").trim();
    const name = String(req.body?.name || "익명").trim().slice(0, 20);
    const note = String(req.body?.note || "").trim().slice(0, 300);
    const rating = clampRating(req.body?.rating);
    const photoUrl = normalizeReviewPhoto(req.body?.photoUrl, { maxBytes: REVIEW_PHOTO_MAX_BYTES });

    if (!restaurantId || !note) {
      res.status(400).json({ message: "리뷰 내용은 필수입니다." });
      return;
    }

    if (rating === null) {
      res.status(400).json({ message: "평점이 올바르지 않습니다." });
      return;
    }

    const [existsRows] = await pool.query("SELECT id FROM restaurants WHERE id = ? LIMIT 1", [restaurantId]);
    if (!existsRows.length) {
      res.status(404).json({ message: "해당 맛집이 없습니다." });
      return;
    }

    const id = randomUUID ? randomUUID() : `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await pool.query(
      `INSERT INTO reviews (id, restaurant_id, reviewer_name, rating, note, photo_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, restaurantId, name || "익명", rating, note, photoUrl || null],
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        reviewer_name,
        rating,
        note,
        created_at,
        photo_url
      FROM reviews
      WHERE id = ?
      `,
      [id],
    );

    await pool.query(
      "UPDATE restaurants SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
      [restaurantId],
    );

    res.status(201).json(normalizeReview(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "리뷰 등록 실패" });
  }
});

app.get("/api/search/places", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      res.json({ items: [] });
      return;
    }
    if (!NAVER_SEARCH_CLIENT_ID || !NAVER_SEARCH_CLIENT_SECRET) {
      res.status(500).json({ message: "네이버 검색 API 키가 설정되지 않았습니다." });
      return;
    }
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5`;
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": NAVER_SEARCH_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_SEARCH_CLIENT_SECRET,
      },
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("Naver Search API error:", response.status, body);
      res.status(502).json({ message: "네이버 검색 API 호출 실패" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "장소 검색 실패" });
  }
});

app.get("/api/routes/directions", async (req, res) => {
  try {
    const mode = req.query.mode === "car" ? "car" : "foot";
    const coords = String(req.query.coords || "").trim();
    if (!coords) {
      res.status(400).json({ message: "좌표가 필요합니다." });
      return;
    }
    const url = `https://router.project-osrm.org/route/v1/${mode}/${coords}?overview=full&geometries=geojson&steps=false`;
    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      console.error("OSRM API error:", response.status, body);
      res.status(502).json({ message: "경로 조회 실패" });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "경로 조회 실패" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.listen(PORT, () => {
  console.log(`ruschlang server running http://localhost:${PORT}`);
});
