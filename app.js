(() => {
  "use strict";

  const API_BASE_URL = "";
  const NAVER_CLIENT_ID = "y5qx5vsnsj";
  const ADMIN_SESSION_KEY = "ruschlang:admin:session";
  const MEMBER_SESSION_KEY = "ruschlang:member:session";
  const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
  const MEMBER_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
  const ROLE_GUEST = "guest";
  const ROLE_MEMBER = "member";
  const ROLE_ADMIN = "admin";
  const POST_STATUS_PENDING = "pending";
  const POST_STATUS_APPROVED = "approved";
  const POST_STATUS_REJECTED = "rejected";
  const RUSCHLANG_GUEST_LOGO_DATA = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='%23ffcb5c'/><stop offset='50%' stop-color='%23ff7a29'/><stop offset='100%' stop-color='%23ff4d6d'/></linearGradient></defs><rect width='240' height='240' rx='42' fill='url(%23g)'/><circle cx='120' cy='96' r='44' fill='rgba(255,255,255,0.24)'/><path d='M120 64c-30 0-54 20-54 32 0 13.3 12 20.6 12 20.6V142h84V116.6S174 108.9 174 96c0-12-24-32-54-32Zm-18 94h36v20H102Zm8-66h20v54h-20Zm16 0h20v54h-20Z' fill='white'/><path d='M120 156c22.1 0 40-10.3 40-23H80c0 12.7 17.9 23 40 23Z' fill='white'/><rect x='14' y='168' width='212' height='28' rx='14' fill='rgba(255,255,255,0.24)'/><text x='120' y='187' text-anchor='middle' font-size='24' font-family='Jua,Arial,sans-serif' fill='white' font-weight='700'>루퍼스</text></svg>";
  const RUSCHLANG_GUEST_LOGO_URI = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(RUSCHLANG_GUEST_LOGO_DATA)}`;

  const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
  const PHOTO_MAX_WIDTH = 1280;
  const PHOTO_MAX_HEIGHT = 1280;

  const mapNoticeEl = document.getElementById("mapNotice");
  const mapProviderState = document.getElementById("mapProviderState");
  const mapEl = document.getElementById("map");
  const tabButtons = document.querySelectorAll(".board-tabs .tab-btn");
  const contentPanels = document.querySelectorAll(".content-panel");


  const authButton = document.getElementById("memberAuthButton") || document.getElementById("authButton");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const adminHint = document.getElementById("adminHint");
  const adminPanelHint = document.getElementById("adminPanelHint");
  const authStateHint = document.getElementById("adminAuthHint");
  const adminWriteGate = document.getElementById("adminWriteGate");
  const adminPanel = document.getElementById("adminPanel");
  const adminOnlyPanel = document.getElementById("adminOnlyPanel");

  const roadmapForm = document.getElementById("roadmapForm");
  const roadmapListEl = document.getElementById("roadmapList");
  const mapRoadmapListEl = document.getElementById("mapRoadmapList");
  const roadmapTitleInput = document.getElementById("roadmapTitle");
  const roadmapAuthorInput = document.getElementById("roadmapAuthor");
  const roadmapDescriptionInput = document.getElementById("roadmapDescription");
  const roadmapWriteGate = document.getElementById("roadmapWriteGate");
  const selectedStopsListEl = document.getElementById("selectedStopsList");
  const addStopBtn = document.getElementById("addStopBtn");
  const stopSearchModal = document.getElementById("stopSearchModal");
  const stopSearchInput = document.getElementById("stopSearchInput");
  const stopSearchResults = document.getElementById("stopSearchResults");
  const stopSearchClose = document.getElementById("stopSearchClose");
  const stopSearchPreview = document.getElementById("stopSearchPreview");
  const stopPreviewMap = document.getElementById("stopPreviewMap");
  const stopPreviewInfo = document.getElementById("stopPreviewInfo");
  const stopPreviewAdd = document.getElementById("stopPreviewAdd");

  const routePanel = document.getElementById("routePanel");
  const routePanelClose = document.getElementById("routePanelClose");
  const routeSegments = document.getElementById("routeSegments");
  const routeSummary = document.getElementById("routeSummary");
  const routeNaverLink = document.getElementById("routeNaverLink");

  const postForm = document.getElementById("postForm");
  const postListEl = document.getElementById("postList");
  const postTitleInput = document.getElementById("postTitle");
  const postAuthorInput = document.getElementById("postAuthor");
  const postContentInput = document.getElementById("postContent");
  const postLocationBtn = document.getElementById("postLocationBtn");
  const postLocationPreview = document.getElementById("postLocationPreview");
  const postRatingInput = document.getElementById("postRating");
  const postRatingOutput = document.getElementById("postRatingOutput");
  const postWriteGate = document.getElementById("postWriteGate");
  const loginModal = document.getElementById("loginModal");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const memberLoginForm = document.getElementById("memberLoginForm");
  const adminTokenInput = document.getElementById("adminTokenInput");
  const memberNicknameInput = document.getElementById("memberNicknameInput");
  const loginModalCloseBtn = document.getElementById("loginModalClose");

  const mapSearchInput = document.getElementById("mapSearchInput");
  const mapSearchBtn = document.getElementById("mapSearchBtn");
  const mapRegionFilter = document.getElementById("mapRegionFilter");
  const mapFoodFilter = document.getElementById("mapFoodFilter");
  const mapRatingFilter = document.getElementById("mapRatingFilter");
  const mapFilterResetBtn = document.getElementById("mapFilterResetBtn");
  const mapPanelTabButtons = document.querySelectorAll(".map-panel-tab-btn");
  const mapSidebarRoadmaps = document.getElementById("mapSidebarRoadmaps");
  const mapRoadmapPanel = document.getElementById("mapRoadmapPanel");
  const mapRankingPanel = document.getElementById("mapRankingPanel");
  const mapRankingListEl = document.getElementById("mapRankingList");
  const exploreViewPanel = document.getElementById("exploreView");
  const form = document.getElementById("restaurantForm");
  const listEl = document.getElementById("restaurantList");
  const badgeFilter = document.getElementById("badgeFilter");
  const sortBy = document.getElementById("sortBy");

  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const nameInput = document.getElementById("name");
  const addressInput = document.getElementById("address");
  const descriptionInput = document.getElementById("description");
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photoPreview");

  const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
  const DEFAULT_MAP_ZOOM = 12;
  const SCRIPT_CACHE_KEY = "__ruschlang_script_cache__";
  const URL_QUERY_MAP_VIEW = "c";

  const mapState = {
    map: null,
    markers: [],
    roadmapMarkers: [],
    routePolylines: [],
    tempMarker: null,
    clickListener: null,
  };

  let restaurants = [];
  let roadmaps = [];
  let posts = [];
  let isAdmin = false;
  let userRole = ROLE_GUEST;
  let activeTabId = "explore";
  let mapServiceConfig = null;
  let badgeCache = {};
  let selectedStops = [];  // [{name, address, lat, lng}]
  let postLocation = null;
  let postRatingTouched = false;
  let stopSearchTarget = "roadmap";
  let stopSearchType = "place";
  let stopSearchTimer = null;
  let previewStop = null;
  let previewMapInstance = null;
  let previewMarker = null;
  let activeRouteRoadmap = null;
  let routeCache = {};
  let mapPanelMode = "roadmap";
  let mapFilterState = {
    region: "all",
    food: "all",
    rating: "all",
  };
  const scriptCache =
    window[SCRIPT_CACHE_KEY] &&
    typeof window[SCRIPT_CACHE_KEY] === "object" &&
    window[SCRIPT_CACHE_KEY] !== null
      ? window[SCRIPT_CACHE_KEY]
      : (window[SCRIPT_CACHE_KEY] = {});

  function storageRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_e) {
      return fallback;
    }
  }

  function storageWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("storageWrite failed", error);
      return false;
    }
  }

  function normalizeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  }

  function normalizeText(value, fallback = "") {
    return String(value || fallback).trim();
  }

  function clampRating(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0.1;
    const clipped = Math.min(5, Math.max(0.1, num));
    return Math.round(clipped * 10) / 10;
  }

  function normalizeReview(raw) {
    if (!raw || typeof raw !== "object") return null;

    const rating = clampRating(raw.rating);
    if (!Number.isFinite(rating)) return null;

    return {
      id: normalizeText(raw.id, crypto.randomUUID ? crypto.randomUUID() : `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeText(raw.name, "익명").slice(0, 20),
      rating,
      note: normalizeText(raw.note).slice(0, 200),
      photoUrl: normalizeText(raw.photoUrl),
      createdAt: normalizeDate(raw.createdAt),
    };
  }

  function normalizeRestaurant(raw) {
    if (!raw || typeof raw !== "object") return null;

    const reviews = Array.isArray(raw.reviews)
      ? raw.reviews.map(normalizeReview).filter(Boolean)
      : [];

    return {
      id: normalizeText(raw.id, crypto.randomUUID ? crypto.randomUUID() : `restaurant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      name: normalizeText(raw.name),
      address: normalizeText(raw.address),
      lat: Number.isFinite(Number(raw.lat)) ? Number(raw.lat) : SEOUL_CENTER.lat,
      lng: Number.isFinite(Number(raw.lng)) ? Number(raw.lng) : SEOUL_CENTER.lng,
      description: normalizeText(raw.description),
      photoUrl: normalizeText(raw.photoUrl || raw.photoDataUrl),
      reviews,
      createdAt: normalizeDate(raw.createdAt),
      updatedAt: normalizeDate(raw.updatedAt),
    };
  }

  function normalizeRoadmap(raw) {
    if (!raw || typeof raw !== "object") return null;

    return {
      id: normalizeText(raw.id, crypto.randomUUID ? crypto.randomUUID() : `roadmap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      title: normalizeText(raw.title).slice(0, 120),
      author: normalizeText(raw.author, "익명").slice(0, 30),
      description: normalizeText(raw.description).slice(0, 1000),
      stops: normalizeText(raw.stops),
      rating: Number.isFinite(Number(raw.rating)) ? Number(raw.rating) : 0,
      ratingCount: Number.isFinite(Number(raw.ratingCount)) ? Number(raw.ratingCount) : 0,
      createdAt: normalizeDate(raw.createdAt),
      updatedAt: normalizeDate(raw.updatedAt),
    };
  }

  function normalizePost(raw) {
    if (!raw || typeof raw !== "object") return null;

    return {
      id: normalizeText(raw.id),
      title: normalizeText(raw.title),
      author: normalizeText(raw.author, "익명").slice(0, 80),
      content: normalizeText(raw.content),
      lat: Number.isFinite(Number(raw.lat)) ? Number(raw.lat) : null,
      lng: Number.isFinite(Number(raw.lng)) ? Number(raw.lng) : null,
      address: normalizeText(raw.address),
      placeName: normalizeText(raw.placeName),
      rating: Number.isFinite(Number(raw.rating)) ? Number(raw.rating) : null,
      status: normalizeText(raw.status, "approved").toLowerCase(),
      authorRole: normalizeText(raw.authorRole, "member").toLowerCase(),
      createdAt: normalizeDate(raw.createdAt),
      updatedAt: normalizeDate(raw.updatedAt),
      comments: Array.isArray(raw.comments)
        ? raw.comments.map(normalizePostComment).filter(Boolean)
        : [],
    };
  }

  function normalizePostComment(raw) {
    if (!raw || typeof raw !== "object") return null;

    return {
      id: normalizeText(raw.id),
      postId: normalizeText(raw.postId),
      parentCommentId: normalizeText(raw.parentCommentId),
      author: normalizeText(raw.author, "익명").slice(0, 80),
      content: normalizeText(raw.content).slice(0, 300),
      createdAt: normalizeDate(raw.createdAt),
    };
  }

  function setAdminPanelVisible() {
    if (adminPanel) {
      const hideAdminPanel = isGuestView();
      adminPanel.hidden = hideAdminPanel;
      adminPanel.style.display = hideAdminPanel ? "none" : "grid";
    }

    if (adminPanelHint) {
      if (isGuestView()) {
        adminPanelHint.hidden = true;
      } else {
        adminPanelHint.hidden = false;
        if (isAdmin) {
          adminPanelHint.textContent = "관리자: 지도/게시판 열람 + 맛집 등록 및 승인 관리 가능합니다.";
        } else {
          adminPanelHint.textContent = "회원: 지도/게시판 열람 + 게시글/댓글 작성이 가능합니다.";
        }
      }
    }

    if (adminHint) {
      if (isGuestView()) {
        adminHint.hidden = true;
      } else {
        adminHint.hidden = false;
        if (isAdmin) {
          adminHint.textContent = "현재 상태: 관리자 계정";
        } else {
          adminHint.textContent = "현재 상태: 회원 계정";
        }
      }
    }

    if (authStateHint) {
      if (isGuestView()) {
        authStateHint.hidden = true;
      } else if (isAdmin) {
        authStateHint.hidden = false;
        authStateHint.textContent = "새 맛집 등록 탭이 열려 있습니다.";
      } else if (isMemberView()) {
        authStateHint.hidden = false;
        authStateHint.textContent = "게시글/댓글 작성이 가능합니다.";
      }
    }

    if (authButton) {
      authButton.hidden = !isGuestView();
    }

    if (adminLogoutBtn) {
      adminLogoutBtn.hidden = isGuestView();
    }

    if (adminOnlyPanel) {
      adminOnlyPanel.hidden = !isAdmin;
    }
  }

  function installNaverAuthFailureGuard() {
    if (!window.navermap_authFailure) {
      window.navermap_authFailure = () => {
        setMapNotice("루슐랭 지도 인증 실패: 지도 키 또는 도메인 설정을 확인해 주세요.");
        mapProviderState.textContent = "인증 실패";
      };
    }
  }

  function isGuestView() {
    return userRole === ROLE_GUEST;
  }

  function isMemberView() {
    return userRole === ROLE_MEMBER;
  }

  function isAdminView() {
    return userRole === ROLE_ADMIN;
  }

  function canCreateRestaurant() {
    return isAdminView();
  }

  function canCreatePost() {
    return !isGuestView();
  }

  function canModeratePosts() {
    return isAdminView();
  }

  function currentMemberNickname() {
    const session = getMemberSession();
    return normalizeText(session?.nickname, isAdminView() ? "관리자" : "익명");
  }

  function canCreateRoadmap() {
    return !isGuestView();
  }

  function setUserRole(nextRole) {
    const role =
      nextRole === ROLE_ADMIN
        ? ROLE_ADMIN
        : nextRole === ROLE_MEMBER
          ? ROLE_MEMBER
          : ROLE_GUEST;

    userRole = role;
    isAdmin = role === ROLE_ADMIN;
  }

  function getMemberSession() {
    const session = storageRead(MEMBER_SESSION_KEY, null);
    if (!session || typeof session !== "object") return null;

    if (!session.nickname || typeof session.nickname !== "string" || !session.nickname.trim()) {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      return null;
    }

    if (!session.expiresAt || Number.isNaN(Number(session.expiresAt)) || session.expiresAt < Date.now()) {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      return null;
    }

    return session;
  }

  function saveAdminSession(token) {
    if (!token || typeof token !== "string") return;

    storageWrite(ADMIN_SESSION_KEY, {
      token: token.trim(),
      expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
    });
    setUserRole(ROLE_ADMIN);
  }

  function saveMemberSession(nickname) {
    if (!nickname || typeof nickname !== "string") return;

    storageWrite(MEMBER_SESSION_KEY, {
      nickname: nickname.trim(),
      expiresAt: Date.now() + MEMBER_SESSION_TTL_MS,
    });
    setUserRole(ROLE_MEMBER);
  }

  function clearMemberSession() {
    localStorage.removeItem(MEMBER_SESSION_KEY);
  }

  function clearUserSession() {
    clearAdminSession();
    clearMemberSession();
    setUserRole(ROLE_GUEST);
  }

  function getAdminSession() {
    const session = storageRead(ADMIN_SESSION_KEY, null);
    if (!session || typeof session !== "object") return null;

    if (!session.token || typeof session.token !== "string" || !session.token.trim()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    if (!session.expiresAt || Number.isNaN(Number(session.expiresAt)) || session.expiresAt < Date.now()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return session;
  }

  function clearAdminSession() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setUserRole(ROLE_GUEST);
  }

  function getAdminToken() {
    const session = getAdminSession();
    return session ? session.token : "";
  }

  function authHeaders() {
    const token = getAdminToken();
    return token ? { "x-admin-token": token } : {};
  }

  function requestRole() {
    if (isAdminView()) return "admin";
    if (isMemberView()) return "member";
    return "guest";
  }

  function safeHeaderValue(value) {
    const normalized = normalizeText(value, "");
    if (!normalized) {
      return "";
    }

    const sanitized = normalized.replace(/[\r\n]/g, " ");
    const isAscii = Array.from(sanitized).every((char) => char.codePointAt(0) <= 0x7f);

    if (isAscii) {
      return sanitized;
    }

    try {
      return `utf8:${encodeURIComponent(sanitized)}`;
    } catch (_e) {
      return "";
    }
  }

  function promptOrNull(message, fallback = "") {
    const value = window.prompt(message, fallback);
    if (value === null) return null;
    return normalizeText(value);
  }

  function requestIdentityHeaders() {
    const headers = {
      "x-user-role": requestRole(),
    };

    const safeNickname = safeHeaderValue(currentMemberNickname());
    if (safeNickname) {
      headers["x-user-nickname"] = safeNickname;
    }

    return headers;
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...requestIdentityHeaders(),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload =
      contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;

    if (!response.ok) {
      const error = new Error(payload?.message || `요청 실패 (${response.status})`);
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  async function loadMapServiceConfig() {
    try {
      mapServiceConfig = await requestJson("/api/map/config");
      return mapServiceConfig;
    } catch (error) {
      console.info("map config load failed", error.message);
      mapServiceConfig = null;
      return null;
    }
  }

  async function verifyAdminToken(token) {
    await requestJson("/api/admin/ping", {
      method: "GET",
      headers: {
        "x-admin-token": token,
      },
    });
  }

  async function ensureAdminReady(secret) {
    const input = normalizeText(secret, "");
    if (!input) {
      alert("관리자 계정 토큰을 입력해 주세요.");
      return false;
    }

    try {
      await verifyAdminToken(input);
      saveAdminSession(input);
      setUserRole(ROLE_ADMIN);
      updateAdminUI();
      return true;
    } catch (error) {
      clearAdminSession();
      updateAdminUI();
      if (error.status === 401 || error.status === 403) {
        alert("관리자 토큰이 유효하지 않습니다.");
        return false;
      }

      alert(`관리자 인증 확인에 실패했습니다. (${error.message})`);
      return false;
    }
  }

  async function ensureAdminSessionState() {
    const session = getAdminSession();
    if (!session) {
      return false;
    }

    try {
      await verifyAdminToken(session.token);
      setUserRole(ROLE_ADMIN);
      return true;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearAdminSession();
        return false;
      }

      // 서버 연결이 일시적으로 불안정해도 기존 세션은 유지하고
      // 실제 권한 체크는 요청 시점에 다시 수행
      setUserRole(ROLE_ADMIN);
      return true;
    }
  }

  function ensureMemberSessionState() {
    const session = getMemberSession();
    if (!session) {
      return false;
    }

    setUserRole(ROLE_MEMBER);
    return true;
  }

  async function loadRestaurantsFromStorage() {
    const sort = sortBy?.value || "latest";
    const params = new URLSearchParams({ sort });
    try {
      const rows = await requestJson(`/api/restaurants?${params.toString()}`);
      if (!Array.isArray(rows)) return [];
      return rows.map(normalizeRestaurant).filter(Boolean);
    } catch (error) {
      console.error("loadRestaurantsFromStorage", error);
      return [];
    }
  }

  async function loadRoadmapsFromStorage() {
    try {
      const rows = await requestJson("/api/roadmaps");
      if (!Array.isArray(rows)) return [];
      return rows.map(normalizeRoadmap).filter(Boolean);
    } catch (error) {
      console.error("loadRoadmapsFromStorage", error);
      return [];
    }
  }

  async function loadPostsFromStorage() {
    try {
      const query = isGuestView() ? "?status=approved" : "";
      const rows = await requestJson(`/api/posts${query}`);
      if (!Array.isArray(rows)) return [];
      return rows.map(normalizePost).filter(Boolean);
    } catch (error) {
      console.error("loadPostsFromStorage", error);
      return [];
    }
  }

  function updateAdminUI() {
    const submitBtn = form.querySelector('button[type="submit"]');
    const editableFields = [
      nameInput,
      addressInput,
      latInput,
      lngInput,
      descriptionInput,
      photoInput,
      submitBtn,
    ];

    if (canCreateRestaurant()) {
      adminWriteGate.hidden = true;
      editableFields.forEach((el) => {
        if (el) el.disabled = false;
      });
      form.classList.remove("disabled");
    } else {
      adminWriteGate.hidden = false;
      editableFields.forEach((el) => {
        if (el) el.disabled = true;
      });
      form.classList.add("disabled");
    }

    setAdminPanelVisible();
    updatePostWriteState();
  }

  function updatePostWriteState() {
    if (!postWriteGate || !postForm) {
      return;
    }

    const canWrite = canCreatePost();
    const editableFields = [
      postTitleInput,
      postAuthorInput,
      postContentInput,
      postLocationBtn,
      postRatingInput,
      postForm.querySelector('button[type="submit"]'),
    ];

    if (canWrite) {
      postWriteGate.textContent = "";
      postWriteGate.hidden = true;
      editableFields.forEach((el) => {
        if (el) el.disabled = false;
      });
      postForm.classList.remove("disabled");
      postForm.style.display = "";
      return;
    }

    postWriteGate.textContent = "회원/관리자 로그인 후 게시글을 작성할 수 있습니다.";
    postWriteGate.hidden = false;
    editableFields.forEach((el) => {
      if (el) el.disabled = true;
    });
    postForm.classList.add("disabled");
    postForm.style.display = "none";
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function safeText(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function setMapNotice(message) {
    mapNoticeEl.textContent = message;
  }

  function calculateAverage(reviews) {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }

  function starSvg(type) {
    const cls = `star-icon ${type}`;
    if (type === "half") {
      return `<svg class="${cls}" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <defs><clipPath id="halfStar"><rect x="0" y="0" width="12" height="24"/></clipPath></defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="#2a3a4a"/>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ffd700" clip-path="url(#halfStar)"/>
    </svg>`;
    }
    const fill = type === "filled" ? "#ffd700" : "#2a3a4a";
    return `<svg class="${cls}" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="${fill}"/>
  </svg>`;
  }

  function toStars(rating, reviewCount) {
    if (!reviewCount) {
      return starSvg("empty").repeat(5);
    }
    const safe = Math.min(5, Math.max(0, Number(rating) || 0));
    const fullCount = Math.floor(safe);
    const hasHalf = (safe - fullCount) >= 0.25;
    let html = "";
    for (let i = 0; i < fullCount; i++) html += starSvg("filled");
    if (hasHalf) html += starSvg("half");
    const remaining = 5 - fullCount - (hasHalf ? 1 : 0);
    for (let i = 0; i < remaining; i++) html += starSvg("empty");
    return html;
  }

  function toRoadmapRating(rating, count) {
    return toStars(rating, count);
  }

  function badgeByScore(score, reviewCount) {
    if (!reviewCount) return "new";
    if (score >= 4.5) return "gold";
    if (score >= 3.5) return "silver";
    if (score >= 2.5) return "bronze";
    return "new";
  }

  function badgeLabel(type) {
    if (type === "gold") return "5스타";
    if (type === "silver") return "4스타";
    if (type === "bronze") return "3스타";
    return "뉴비";
  }

  function resolveBadgeForRestaurant(item) {
    const score = calculateAverage(item.reviews);
    const badge = badgeByScore(score, item.reviews.length);
    return { score, badge };
  }

  function postStatusLabel(status) {
    if (status === POST_STATUS_APPROVED) return "승인";
    if (status === POST_STATUS_PENDING) return "승인 대기";
    if (status === POST_STATUS_REJECTED) return "반려";
    return "알 수 없음";
  }

  function postStatusClass(status) {
    if (status === POST_STATUS_APPROVED) return "approved";
    if (status === POST_STATUS_PENDING) return "pending";
    if (status === POST_STATUS_REJECTED) return "rejected";
    return "unknown";
  }

  function createPostStatusText(post) {
    return `${postStatusLabel(post.status)} • ${formatDate(post.createdAt)}`;
  }

  function createScriptPromise(url, id) {
    if (scriptCache[url]) return scriptCache[url];

    scriptCache[url] = new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (window.naver && window.naver.maps) {
          resolve();
        } else {
          let timeout;
          const interval = window.setInterval(() => {
            if (window.naver && window.naver.maps) {
              window.clearInterval(interval);
              if (timeout) window.clearTimeout(timeout);
              resolve();
            }
          }, 80);

          timeout = window.setTimeout(() => {
            window.clearInterval(interval);
            delete scriptCache[url];
            reject(new Error("지도 SDK 준비 지연"));
          }, 6000);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.id = id;
      script.onload = () => {
        // SDK 비동기 초기화 대기: onload 후에도 naver.maps가 바로 없을 수 있음
        if (window.naver && window.naver.maps) {
          resolve();
          return;
        }
        let pollTimeout;
        const pollInterval = window.setInterval(() => {
          if (window.naver && window.naver.maps) {
            window.clearInterval(pollInterval);
            if (pollTimeout) window.clearTimeout(pollTimeout);
            resolve();
          }
        }, 80);
        pollTimeout = window.setTimeout(() => {
          window.clearInterval(pollInterval);
          delete scriptCache[url];
          reject(new Error("지도 SDK 준비 지연 (onload 후 타임아웃)"));
        }, 6000);
      };
      script.onerror = () => {
        delete scriptCache[url];
        reject(new Error("지도 스크립트 로드 실패"));
      };
      document.head.appendChild(script);
    });

    return scriptCache[url];
  }

  function toNaverLatLng(coord) {
    if (!coord) return null;

    if (typeof coord.lat === "function" && typeof coord.lng === "function") {
      return { lat: coord.lat(), lng: coord.lng() };
    }

    if (typeof coord.y === "number" && typeof coord.x === "number") {
      return { lat: coord.y, lng: coord.x };
    }

    if (typeof coord.lat === "number" && typeof coord.lng === "number") {
      return { lat: coord.lat, lng: coord.lng };
    }

    return null;
  }

    function parseMapQueryParam() {
    try {
      const value = new URLSearchParams(window.location.search).get(URL_QUERY_MAP_VIEW);
      if (!value) {
        return null;
      }

      const values = value.split(",").map((item) => Number(item)).filter((item) => Number.isFinite(item));
      if (!values.length) {
        return null;
      }

      const [zoom, latitude, longitude] = values;

      if (zoom < 4 || zoom > 20) {
        return null;
      }

      const hasLatitude = latitude >= 23.0 && latitude <= 39.0;
      const hasLongitude = longitude >= 124.0 && longitude <= 132.0;
      const centerLat = hasLatitude ? latitude : SEOUL_CENTER.lat;
      const centerLng = hasLongitude ? longitude : SEOUL_CENTER.lng;

      return {
        lat: centerLat,
        lng: centerLng,
        zoom: Math.round(zoom),
      };
    } catch (_e) {
      return null;
    }
  }

  function getMapInitialView() {
    const queryView = parseMapQueryParam();

    if (queryView) {
      return queryView;
    }

    return {
      lat: SEOUL_CENTER.lat,
      lng: SEOUL_CENTER.lng,
      zoom: DEFAULT_MAP_ZOOM,
    };
  }

  function clearMap() {
    try {
      if (mapState.tempMarker?.setMap) {
        mapState.tempMarker.setMap(null);
      }
    } catch (_e) { /* SDK auth failure guard */ }
    mapState.tempMarker = null;
    try {
      if (mapState.clickListener && naver?.maps?.Event?.removeListener) {
        naver.maps.Event.removeListener(mapState.clickListener);
      }
    } catch (_e) { /* SDK auth failure guard */ }
    mapState.clickListener = null;
    mapState.markers.forEach((entry) => {
      try {
        if (entry.clickListener && naver?.maps?.Event?.removeListener) {
          naver.maps.Event.removeListener(entry.clickListener);
        }
        if (entry.marker?.setMap) {
          entry.marker.setMap(null);
        }
        if (entry.info?.close) {
          entry.info.close();
        }
      } catch (_e) { /* SDK auth failure guard */ }
    });

    mapState.markers = [];

    try {
      if (mapState.map) {
        mapState.map.destroy?.();
        mapEl.innerHTML = "";
      }
    } catch (_e) { /* SDK auth failure guard */ }
    mapState.map = null;
  }

  function applyReviewAnimation(el) {
    if (!el) return;
    el.classList.remove("badge-pop");
    void el.offsetWidth;
    el.classList.add("badge-pop");
    setTimeout(() => {
      el.classList.remove("badge-pop");
    }, 600);
  }

  function createPhotoNode(dataUrl) {
    const img = document.createElement("img");
    img.className = "photo";
    img.src = dataUrl;
    img.loading = "lazy";
    img.alt = "탐방 사진";
    return img;
  }

  function createRuschlangLogoNode(sizeClass = "item") {
    const logo = document.createElement("img");
    logo.className = `photo ruschlang-logo ruschlang-logo--${sizeClass}`;
    logo.src = RUSCHLANG_GUEST_LOGO_URI;
    logo.alt = "루퍼스 로고";
    logo.loading = "lazy";
    logo.referrerPolicy = "no-referrer";
    logo.setAttribute("aria-hidden", "true");
    return logo;
  }

  function createRestaurantImageNode(item) {
    if (!isGuestView() && item.photoUrl) {
      return createPhotoNode(item.photoUrl);
    }

    return createRuschlangLogoNode("item");
  }

  function getMapMarkerIcon() {
    return {
      url: RUSCHLANG_GUEST_LOGO_URI,
      size: new naver.maps.Size(44, 44),
      scaledSize: new naver.maps.Size(44, 44),
      origin: new naver.maps.Point(0, 0),
      anchor: new naver.maps.Point(22, 44),
    };
  }

  function getRestaurantPopupContent(restaurant) {
    const { badge, score } = resolveBadgeForRestaurant(restaurant);

    if (isGuestView()) {
      return `
        <div class="map-popup map-popup--guest">
          <strong>루퍼스 맛집</strong><br />
          <span class="map-popup-text">위치 기반 익명 맛집입니다.</span><br />
          <span class="map-popup-text">${safeText(badgeLabel(badge))} · ${score > 0 ? score.toFixed(1) : "-"}</span><br />
          <span class="map-popup-logo">루퍼스 뱃지</span>
        </div>
      `;
    }

    return `
        <div class="map-popup">
          <strong>${safeText(restaurant.name)}</strong><br />
          ${safeText(restaurant.address)}<br />
          ${safeText(badgeLabel(badge))} · ${score > 0 ? score.toFixed(1) : "-"}<br />
        </div>
      `;
  }

  function renderMap() {
    if (!mapState.map || !window.naver?.maps) return;

    mapState.markers.forEach((entry) => {
      if (entry.marker?.setMap) entry.marker.setMap(null);
      if (entry.info?.close) entry.info.close();
      if (entry.clickListener && window.naver?.maps?.Event?.removeListener) {
        naver.maps.Event.removeListener(entry.clickListener);
      }
    });
    mapState.markers = [];

    getMapFilteredRestaurants().forEach((restaurant) => {
      if (!Number.isFinite(restaurant.lat) || !Number.isFinite(restaurant.lng)) {
        return;
      }

      const markerOptions = {
        map: mapState.map,
        position: new naver.maps.LatLng(restaurant.lat, restaurant.lng),
      };

      if (isGuestView()) {
        markerOptions.icon = getMapMarkerIcon();
      }

      const marker = new naver.maps.Marker({
        ...markerOptions,
      });

      const content = getRestaurantPopupContent(restaurant);

      const infoWindow = new naver.maps.InfoWindow({
        content,
        borderColor: "#0d2434",
        backgroundColor: "#fff",
        borderWidth: 1,
      });

      const clickListener = naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(mapState.map, marker);
        const target = document.getElementById(`item-${restaurant.id}`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      mapState.markers.push({
        id: restaurant.id,
        marker,
        info: infoWindow,
        clickListener,
      });
    });
  }

  function normalizeFilterText(value) {
    return String(value || "").toLowerCase().replaceAll(" ", "");
  }

  function syncMapFilterStateFromUI() {
    mapFilterState.region = mapRegionFilter?.value || "all";
    mapFilterState.food = mapFoodFilter?.value || "all";
    mapFilterState.rating = mapRatingFilter?.value || "all";
  }

  function regionKeywords(region) {
    if (region === "서울") return ["서울", "서울특별시"];
    if (region === "경기") return ["경기", "경기도"];
    if (region === "부산") return ["부산", "부산광역시"];
    if (region === "대구") return ["대구", "대구광역시"];
    if (region === "인천") return ["인천", "인천광역시"];
    if (region === "광주") return ["광주", "광주광역시"];
    if (region === "대전") return ["대전", "대전광역시"];
    if (region === "울산") return ["울산", "울산광역시"];
    if (region === "세종") return ["세종", "세종특별자치시"];
    if (region === "강원") return ["강원", "강원도", "강원특별자치도"];
    if (region === "충북") return ["충북", "충청북도"];
    if (region === "충남") return ["충남", "충청남도"];
    if (region === "전북") return ["전북", "전라북도", "전북특별자치도"];
    if (region === "전남") return ["전남", "전라남도"];
    if (region === "경북") return ["경북", "경상북도"];
    if (region === "경남") return ["경남", "경상남도"];
    if (region === "제주") return ["제주", "제주도", "제주특별자치도"];
    return [];
  }

  function matchesRegionFilter(item, region) {
    if (region === "all") return true;
    const normalizedAddress = normalizeFilterText(item?.address);
    if (!normalizedAddress) return false;
    const keywords = regionKeywords(region);
    return keywords.some((keyword) => normalizedAddress.includes(normalizeFilterText(keyword)));
  }

  function inferFoodCategory(item) {
    const source = normalizeFilterText(`${item?.name || ""} ${item?.description || ""}`);
    const categories = [
      { name: "한식", keywords: ["한식", "국밥", "김치", "찌개", "불고기", "갈비", "비빔밥", "냉면", "족발", "보쌈"] },
      { name: "중식", keywords: ["중식", "중국", "짜장", "짬뽕", "탕수육", "마라", "딤섬", "양꼬치"] },
      { name: "일식", keywords: ["일식", "일본", "스시", "초밥", "사시미", "우동", "라멘", "돈카츠", "돈까스"] },
      { name: "양식", keywords: ["양식", "파스타", "스테이크", "리조또", "오믈렛", "브런치", "burger", "햄버거"] },
      { name: "카페/디저트", keywords: ["카페", "디저트", "베이커리", "커피", "케이크", "와플", "빙수", "도넛", "티라미수"] },
      { name: "분식", keywords: ["분식", "떡볶이", "순대", "김밥", "튀김", "라볶이", "주먹밥"] },
      { name: "치킨", keywords: ["치킨", "닭강정", "치킨집", "friedchicken"] },
      { name: "피자", keywords: ["피자", "pizza"] },
    ];

    const hit = categories.find((category) => {
      return category.keywords.some((keyword) => source.includes(normalizeFilterText(keyword)));
    });

    return hit ? hit.name : "기타";
  }

  function matchesFoodFilter(item, food) {
    if (food === "all") return true;
    return inferFoodCategory(item) === food;
  }

  function matchesRatingFilter(item, rating) {
    if (rating === "all") return true;
    const { badge } = resolveBadgeForRestaurant(item);
    return badge === rating;
  }

  function matchesMapFilters(item) {
    return (
      matchesRegionFilter(item, mapFilterState.region) &&
      matchesFoodFilter(item, mapFilterState.food) &&
      matchesRatingFilter(item, mapFilterState.rating)
    );
  }

  function getMapFilteredRestaurants() {
    return restaurants.filter((item) => matchesMapFilters(item));
  }

  function getRankingRestaurants() {
    return getMapFilteredRestaurants()
      .slice()
      .sort((a, b) => {
        const aAvg = calculateAverage(a.reviews);
        const bAvg = calculateAverage(b.reviews);
        if (aAvg !== bAvg) return bAvg - aAvg;
        if (a.reviews.length !== b.reviews.length) return b.reviews.length - a.reviews.length;
        return a.name.localeCompare(b.name, "ko");
      });
  }

  function renderMapRanking() {
    if (!mapRankingListEl) return;
    mapRankingListEl.innerHTML = "";

    const ranked = getRankingRestaurants();
    if (!ranked.length) {
      const empty = document.createElement("p");
      empty.className = "meta";
      empty.textContent = "조건에 맞는 맛집이 없습니다.";
      mapRankingListEl.appendChild(empty);
      return;
    }

    ranked.forEach((item, index) => {
      const rank = index + 1;
      const { score, badge } = resolveBadgeForRestaurant(item);
      const card = document.createElement("article");
      card.className = "ranking-card";
      if (rank <= 3) {
        card.classList.add(`is-top-${rank}`);
      }

      const rankBadge = document.createElement("span");
      rankBadge.className = "ranking-rank";
      rankBadge.textContent = `${rank}위`;

      const title = document.createElement("h4");
      title.textContent = isGuestView() ? "루퍼스 맛집" : item.name;

      const address = document.createElement("p");
      address.className = "meta ranking-address";
      address.textContent = isGuestView() ? "서울 지도 탐방 후 공개 예정" : item.address;

      const scoreLine = document.createElement("p");
      scoreLine.className = "meta";
      scoreLine.textContent = `평균 평점 ${item.reviews.length ? score.toFixed(1) : "-"}`;

      const badgeEl = document.createElement("span");
      badgeEl.className = `badge ${badge}`;
      badgeEl.textContent = badgeLabel(badge);

      const stars = document.createElement("div");
      stars.className = "stars";
      stars.innerHTML = toStars(score, item.reviews.length);

      const count = document.createElement("p");
      count.className = "meta";
      count.textContent = `리뷰 ${item.reviews.length}개`;

      card.append(rankBadge, title, address, scoreLine, badgeEl, stars, count);
      mapRankingListEl.appendChild(card);
    });
  }

  function setMapPanelMode(nextPanel) {
    const allowed = nextPanel === "map" || nextPanel === "roadmap" || nextPanel === "ranking";
    mapPanelMode = allowed ? nextPanel : "roadmap";

    mapPanelTabButtons.forEach((button) => {
      const selected = button.dataset.mapPanel === mapPanelMode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", selected ? "true" : "false");
    });

    if (mapSidebarRoadmaps) {
      mapSidebarRoadmaps.dataset.mapPanel = mapPanelMode;
    }
    if (exploreViewPanel) {
      exploreViewPanel.classList.toggle("map-panel-map-only", mapPanelMode === "map");
    }
    if (mapRoadmapPanel) {
      mapRoadmapPanel.classList.toggle("is-active", mapPanelMode === "roadmap");
    }
    if (mapRankingPanel) {
      mapRankingPanel.classList.toggle("is-active", mapPanelMode === "ranking");
    }

    if (mapPanelMode !== "roadmap") {
      hideRoutePanel();
    }
    if (mapPanelMode === "ranking") {
      renderMapRanking();
    }
    if (mapState.map) {
      setTimeout(() => mapState.map.refresh?.(), 80);
    }
  }

  function applyMapFilters() {
    syncMapFilterStateFromUI();
    renderRestaurantList();
    renderMap();
    renderMapRanking();
  }

  function resetMapFilters() {
    if (mapRegionFilter) mapRegionFilter.value = "all";
    if (mapFoodFilter) mapFoodFilter.value = "all";
    if (mapRatingFilter) mapRatingFilter.value = "all";
    applyMapFilters();
  }

  function runMapSearchFocus() {
    const keyword = normalizeFilterText(mapSearchInput?.value || "");
    if (!keyword) {
      renderMap();
      return;
    }

    const matched = getMapFilteredRestaurants().find((item) => {
      const target = normalizeFilterText(`${item.name} ${item.address}`);
      return target.includes(keyword);
    });

    if (!matched) {
      setMapNotice("검색 결과가 없습니다.");
      mapNoticeEl.hidden = false;
      return;
    }

    if (!mapState.map || !window.naver?.maps) {
      return;
    }

    mapState.map.setCenter(new naver.maps.LatLng(matched.lat, matched.lng));
    mapState.map.setZoom(16);

    const entry = mapState.markers.find((markerState) => markerState.id === matched.id);
    if (entry) {
      entry.info.open(mapState.map, entry.marker);
    }
  }

  function clearRoutePolylines() {
    mapState.routePolylines.forEach((p) => p.setMap(null));
    mapState.routePolylines = [];
  }

  function clearRoadmapMarkers() {
    mapState.roadmapMarkers.forEach((entry) => {
      if (entry.marker?.setMap) entry.marker.setMap(null);
      if (entry.info?.close) entry.info.close();
      if (entry.clickListener && window.naver?.maps?.Event?.removeListener) {
        naver.maps.Event.removeListener(entry.clickListener);
      }
    });
    mapState.roadmapMarkers = [];
    clearRoutePolylines();
    hideRoutePanel();
  }

  function formatRouteDuration(seconds) {
    const min = Math.round(seconds / 60);
    if (min < 60) return `${min}분`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
  }

  function formatRouteDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }


  function getRouteColor(mode) {
    if (mode === "foot") return "#4CAF50";
    if (mode === "car") return "#2196F3";
    return "#FF9800";
  }

  function buildNaverDirectionsUrl(stops, mode) {
    if (!stops.length) return "#";
    const start = stops[0];
    const end = stops[stops.length - 1];
    const modeMap = { foot: "walk", car: "car", transit: "transit" };
    const modeStr = modeMap[mode] || "walk";
    return `https://map.naver.com/v5/directions/${start.lng},${start.lat},${encodeURIComponent(start.name)}/${end.lng},${end.lat},${encodeURIComponent(end.name)}/-/${modeStr}`;
  }

  async function fetchDirections(stops, mode) {
    if (routeCache[mode]) return routeCache[mode];

    // Always fetch car route from OSRM for geometry (foot profile unreliable for Korea)
    let baseData = routeCache._osrm;
    if (!baseData) {
      const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
      try {
        baseData = await requestJson(`/api/routes/directions?mode=car&coords=${encodeURIComponent(coords)}`);
        routeCache._osrm = baseData;
      } catch (err) {
        console.error("Route fetch error:", err);
        return null;
      }
    }
    if (!baseData || baseData.code !== "Ok") return null;

    if (mode === "car") {
      routeCache[mode] = baseData;
      return baseData;
    }

    // Calculate walking/transit from distance since OSRM foot profile is unreliable
    const route = baseData.routes[0];
    const WALK_SPEED = 1.25; // m/s (~4.5 km/h)
    const TRANSIT_SPEED = 5.0; // m/s (~18 km/h effective with stops)
    const TRANSIT_WAIT = 300; // 5 min average wait

    const speedMs = mode === "foot" ? WALK_SPEED : TRANSIT_SPEED;
    const result = {
      code: "Ok",
      routes: [{
        duration: 0,
        distance: route.distance,
        geometry: route.geometry,
        legs: route.legs.map((leg) => {
          const isWalkRecommended = mode === "transit" && leg.distance < 500;
          const dur = isWalkRecommended
            ? leg.distance / WALK_SPEED
            : leg.distance / speedMs + (mode === "transit" ? TRANSIT_WAIT : 0);
          return { duration: dur, distance: leg.distance, isWalkRecommended };
        }),
      }],
    };
    result.routes[0].duration = result.routes[0].legs.reduce((sum, l) => sum + l.duration, 0);
    routeCache[mode] = result;
    return result;
  }

  function drawRouteOnMap(routeData, color) {
    clearRoutePolylines();
    if (!routeData?.routes?.[0]?.geometry?.coordinates) return;
    const coords = routeData.routes[0].geometry.coordinates;
    const path = coords.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
    const polyline = new naver.maps.Polyline({
      map: mapState.map,
      path,
      strokeColor: color,
      strokeWeight: 4,
      strokeOpacity: 0.8,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });
    mapState.routePolylines.push(polyline);
  }

  async function updateRouteDisplay(mode) {
    if (!activeRouteRoadmap) return;
    const stops = parseStops(activeRouteRoadmap.stops);
    if (stops.length < 2) return;

    if (routePanel) {
      routePanel.querySelectorAll(".route-mode-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
      });
    }

    if (routeSegments) {
      routeSegments.innerHTML = '<p class="meta" style="text-align:center;padding:1rem;">경로 조회 중...</p>';
    }
    if (routeSummary) routeSummary.innerHTML = "";

    const data = await fetchDirections(stops, mode);
    if (!data || data.code !== "Ok" || !data.routes?.length) {
      if (routeSegments) {
        routeSegments.innerHTML = '<p class="meta" style="text-align:center;padding:1rem;">경로를 찾을 수 없습니다.</p>';
      }
      return;
    }

    const route = data.routes[0];
    drawRouteOnMap(data, getRouteColor(mode));

    let segmentsHtml = "";
    const legs = route.legs || [];
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const from = stops[i];
      const to = stops[i + 1];
      if (!from || !to) continue;
      const dur = formatRouteDuration(leg.duration);
      const dist = formatRouteDistance(leg.distance);
      const walkNote = leg.isWalkRecommended ? ' <span class="route-walk-note">(도보 권장)</span>' : "";
      segmentsHtml += `<div class="route-segment-item">
        <span class="route-segment-num">${i + 1}</span>
        <div class="route-segment-detail">
          <span class="route-segment-names">${escapeHTML(from.name)} → ${escapeHTML(to.name)}</span>
          <span class="route-segment-time">${dur} (${dist})${walkNote}</span>
        </div>
      </div>`;
    }
    if (routeSegments) routeSegments.innerHTML = segmentsHtml;

    const totalDur = formatRouteDuration(route.duration);
    const totalDist = formatRouteDistance(route.distance);
    if (routeSummary) routeSummary.innerHTML = `<strong>총 소요:</strong> ${totalDur} (${totalDist})`;

    if (routeNaverLink) routeNaverLink.href = buildNaverDirectionsUrl(stops, mode);
  }

  function showRoutePanel(roadmap) {
    const stops = parseStops(roadmap.stops);
    if (!routePanel || stops.length < 2) {
      if (routePanel) routePanel.hidden = true;
      return;
    }
    activeRouteRoadmap = roadmap;
    routeCache = {};
    routePanel.hidden = false;
    updateRouteDisplay("foot");
  }

  function hideRoutePanel() {
    if (routePanel) routePanel.hidden = true;
    clearRoutePolylines();
    activeRouteRoadmap = null;
    routeCache = {};
  }

  function showRoadmapPins(roadmap) {
    if (!mapState.map || !window.naver?.maps) return;
    clearRoadmapMarkers();

    const stops = parseStops(roadmap.stops);
    if (!stops.length) return;

    const bounds = new naver.maps.LatLngBounds();
    let hasValidPin = false;

    stops.forEach((stop, idx) => {
      if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lng) || (stop.lat === 0 && stop.lng === 0)) return;

      hasValidPin = true;
      const pos = new naver.maps.LatLng(stop.lat, stop.lng);
      bounds.extend(pos);

      const marker = new naver.maps.Marker({
        map: mapState.map,
        position: pos,
        icon: {
          content: `<div style="background:linear-gradient(120deg,#ff4d6d,#ffcb5c);color:#240f16;font-weight:700;font-size:12px;padding:4px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:Jua,sans-serif;">${idx + 1}. ${escapeHTML(stop.name)}</div>`,
          anchor: new naver.maps.Point(12, 12),
        },
      });

      const infoContent = `<div class="map-popup"><strong>${escapeHTML(stop.name)}</strong>${stop.address ? `<br><span class="map-popup-text">${escapeHTML(stop.address)}</span>` : ""}<br><span class="map-popup-logo">루슐랭 로드맵</span></div>`;
      const infoWindow = new naver.maps.InfoWindow({
        content: infoContent,
        borderColor: "#0d2434",
        backgroundColor: "#fff",
        borderWidth: 1,
      });

      const clickListener = naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(mapState.map, marker);
      });

      mapState.roadmapMarkers.push({ marker, info: infoWindow, clickListener });
    });

    if (hasValidPin) {
      mapState.map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
    }
    showRoutePanel(roadmap);
  }

  async function initNaverMap() {
    installNaverAuthFailureGuard();
    // 클라이언트 ID가 하드코딩이므로 항상 직접 SDK URL 사용 (서버 302 리다이렉트 우회)
    const scriptId = `naver-map-sdk-${NAVER_CLIENT_ID}`;
    const scriptUrl = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(NAVER_CLIENT_ID)}&submodules=geocoder`;

    setMapNotice("지도 로딩 중...");
    mapProviderState.textContent = "지도 로딩";

    if (mapState.map) {
      clearMap();
    }

    try {
      await createScriptPromise(scriptUrl, scriptId);

      if (!window.naver || !window.naver.maps) {
        throw new Error("지도 SDK가 준비되지 않았습니다.");
      }

      const mapView = getMapInitialView();
      const map = new naver.maps.Map(mapEl, {
        center: new naver.maps.LatLng(mapView.lat, mapView.lng),
        zoom: mapView.zoom,
      });

      mapState.map = map;
      setMapNotice("");
      mapNoticeEl.hidden = true;
      mapProviderState.textContent = "지도 연결 완료";
      setTimeout(() => {
        if (mapProviderState.textContent === "지도 연결 완료") {
          mapProviderState.hidden = true;
        }
      }, 2000);

      mapState.clickListener = naver.maps.Event.addListener(map, "click", (event) => {
        const point = toNaverLatLng(event.coord || event.position || event.point);
        if (!point) return;

        latInput.value = point.lat.toFixed(6);
        lngInput.value = point.lng.toFixed(6);

        if (mapState.tempMarker?.setMap) {
          mapState.tempMarker.setMap(null);
        }

        mapState.tempMarker = new naver.maps.Marker({
          map,
          position: new naver.maps.LatLng(point.lat, point.lng),
        });

        setTimeout(() => {
          if (mapState.tempMarker?.setMap) {
            mapState.tempMarker.setMap(null);
            mapState.tempMarker = null;
          }
        }, 1200);
      });

      renderMap();
    } catch (error) {
      console.error(error);
      clearMap();
      setMapNotice("지도 로드 실패. 키를 다시 확인해 주세요.");
      mapProviderState.textContent = "연결 실패";
    }
  }

  function getVisibleRestaurants() {
    const selectedBadge = badgeFilter.value;
    const sortMode = sortBy.value;
    let next = getMapFilteredRestaurants();

    if (selectedBadge !== "all") {
      next = next.filter((item) => {
        const { badge } = resolveBadgeForRestaurant(item);
        return badge === selectedBadge;
      });
    }

    if (sortMode === "rating") {
      next.sort((a, b) => {
        const aAvg = calculateAverage(a.reviews);
        const bAvg = calculateAverage(b.reviews);
        if (aAvg !== bAvg) return bAvg - aAvg;
        return b.reviews.length - a.reviews.length;
      });
    } else if (sortMode === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return next;
  }

  function labelWrap(labelText, child) {
    const wrapper = document.createElement("label");
    const title = document.createElement("span");
    title.textContent = labelText;
    wrapper.append(title, child);
    return wrapper;
  }

  function focusLocationOnMap(lat, lng, title = "선택한 위치") {
    if (!mapState.map || !window.naver?.maps) {
      setMapNotice("지도 로드 후에 이동할 수 있습니다.");
      return;
    }

    const point = new naver.maps.LatLng(lat, lng);
    mapState.map.setCenter(point);
    mapState.map.setZoom(16);

    if (mapState.tempMarker?.setMap) {
      mapState.tempMarker.setMap(null);
    }

    mapState.tempMarker = new naver.maps.Marker({
      map: mapState.map,
      position: point,
      title,
    });
  }

  function renderPostLocationSelection() {
    if (!postLocationPreview) return;

    if (!postLocation) {
      postLocationPreview.textContent = "장소를 선택하지 않았습니다.";
      return;
    }

    const name = postLocation.name || "선택한 장소";
    const address = postLocation.address ? ` · ${postLocation.address}` : "";
    postLocationPreview.textContent = `📍 ${name}${address}`;
  }

  function openPostLocationSearch() {
    openStopSearchModal("post");
  }

  function renderRestaurantList() {
    listEl.innerHTML = "";
    const visible = getVisibleRestaurants();

    if (!visible.length) {
      const message = document.createElement("p");
      message.className = "meta";
      message.textContent =
        restaurants.length
          ? "조건에 맞는 항목이 없습니다."
          : "등록된 맛집이 없습니다. 관리자가 먼저 맛집을 추가해 주세요.";
      listEl.appendChild(message);
      return;
    }

    visible.forEach((item) => {
      const { score, badge } = resolveBadgeForRestaurant(item);
      const displayName = isGuestView() ? "루퍼스 맛집" : item.name;
      const displayAddress = isGuestView()
        ? "서울 지도 탐방 후 공개 예정"
        : `${item.address} · 위도 ${item.lat.toFixed(5)}, 경도 ${item.lng.toFixed(5)}`;
      const displayDescription = isGuestView()
        ? "관리자 승인 후 상세 내용이 공개됩니다."
        : item.description;

      const card = document.createElement("article");
      card.className = "item";
      card.id = `item-${item.id}`;

      const titleLine = document.createElement("div");
      titleLine.className = "item-top";

      const titleInner = document.createElement("div");
      titleInner.className = "item-title";

      const title = document.createElement("h3");
      title.textContent = displayName;

      const scoreBadge = document.createElement("span");
      scoreBadge.className = `badge ${badge}`;
      scoreBadge.textContent = badgeLabel(badge);

      const badgeText = document.createElement("p");
      badgeText.className = "meta";
      badgeText.textContent = `총평점 ${
        item.reviews.length ? score.toFixed(1) : "-"
      } (${item.reviews.length}개 리뷰)`;

      const summary = document.createElement("p");
      summary.className = "meta";
      summary.textContent = displayAddress;

      const stars = document.createElement("p");
      stars.className = "stars";
      stars.innerHTML = toStars(score, item.reviews.length);

      const description = document.createElement("p");
      description.className = "review";
      description.textContent = displayDescription;

      titleInner.append(title, scoreBadge);
      titleLine.append(titleInner, summary);

      const actions = document.createElement("div");
      actions.className = "actions";

      const mapButton = document.createElement("button");
      mapButton.type = "button";
      mapButton.className = "ghost";
      mapButton.textContent = "지도에서 보기";
      mapButton.addEventListener("click", () => {
        if (!mapState.map || !window.naver?.maps) {
          setMapNotice("지도 로드 후에 이동할 수 있습니다.");
          return;
        }

        const entry = mapState.markers.find((markerState) => markerState.id === item.id);
        if (!entry) {
          return;
        }

        mapState.map.setCenter(new naver.maps.LatLng(item.lat, item.lng));
        mapState.map.setZoom(16);
        entry.info.open(mapState.map, entry.marker);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "ghost";
      deleteButton.textContent = "삭제";
      deleteButton.disabled = !isAdmin;
      deleteButton.addEventListener("click", async () => {
        if (!isAdmin) return;
        if (!confirm("이 맛집을 삭제할까요?")) return;
        try {
          await requestJson(`/api/restaurants/${encodeURIComponent(item.id)}`, {
            method: "DELETE",
          });
          await renderAll();
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            clearAdminSession();
            updateAdminUI();
            renderAdminOnlyState();
          }

          alert(error.message || "삭제 요청에 실패했습니다.");
        }
      });

      actions.append(mapButton, deleteButton);

      const reviewHeader = document.createElement("p");
      reviewHeader.className = "meta";
      reviewHeader.textContent = "리뷰 남기기";

      const reviewList = document.createElement("div");
      reviewList.className = "review-list";

      if (!item.reviews.length) {
        const empty = document.createElement("p");
        empty.className = "meta";
        empty.textContent = "아직 리뷰가 없습니다.";
        reviewList.appendChild(empty);
      } else {
        item.reviews
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .forEach((review) => {
            const reviewItem = document.createElement("div");
            reviewItem.className = "review-item";

            const reviewer = document.createElement("strong");
            reviewer.textContent = review.name;

            const ratingText = document.createElement("span");
            ratingText.className = "meta";
            ratingText.textContent = ` (${review.rating.toFixed(1)})`;

            const reviewNote = document.createElement("p");
            reviewNote.className = "meta";
            reviewNote.textContent = review.note;

            const reviewDate = document.createElement("p");
            reviewDate.className = "meta";
            reviewDate.textContent = formatDate(review.createdAt);

            reviewItem.append(reviewer, ratingText, reviewNote);

            if (review.photoUrl) {
              const reviewPhoto = createPhotoNode(review.photoUrl);
              reviewPhoto.className = "photo";
              reviewItem.append(reviewPhoto);
            }

            reviewItem.append(reviewDate);

            reviewList.appendChild(reviewItem);
          });
      }

      const reviewForm = document.createElement("form");
      reviewForm.className = "review-form";

      const reviewerInput = document.createElement("input");
      reviewerInput.type = "text";
      reviewerInput.placeholder = "닉네임(선택)";
      reviewerInput.maxLength = 20;

      const ratingInputEl = document.createElement("input");
      ratingInputEl.type = "range";
      ratingInputEl.min = "0.5";
      ratingInputEl.max = "5";
      ratingInputEl.step = "0.5";
      ratingInputEl.value = "4.0";

      const scoreOutput = document.createElement("output");
      scoreOutput.textContent = "4.0";
      ratingInputEl.addEventListener("input", () => {
        scoreOutput.textContent = Number(ratingInputEl.value).toFixed(1);
      });

      const noteInput = document.createElement("textarea");
      noteInput.rows = 2;
      noteInput.required = true;
      noteInput.maxLength = 160;
      noteInput.placeholder = "맛, 분위기, 가성비 한 줄";

      const reviewPhotoInput = document.createElement("input");
      reviewPhotoInput.type = "file";
      reviewPhotoInput.accept = "image/*";

      const reviewPhotoPreview = document.createElement("div");
      reviewPhotoPreview.className = "photo-preview";
      reviewPhotoPreview.hidden = true;
      let reviewPhotoUrl = "";

      reviewPhotoInput.addEventListener("change", async () => {
        reviewPhotoPreview.innerHTML = "";
        reviewPhotoPreview.hidden = true;
        reviewPhotoUrl = "";

        const file = reviewPhotoInput.files?.[0];
        if (!file) return;

        const safeDataUrl = await sanitizePhotoForStore(file);
        if (!safeDataUrl) {
          reviewPhotoInput.value = "";
          return;
        }

        reviewPhotoUrl = safeDataUrl;
        const img = createPhotoNode(reviewPhotoUrl);
        img.className = "photo";
        reviewPhotoPreview.appendChild(img);
        reviewPhotoPreview.hidden = false;
      });

      const reviewSubmit = document.createElement("button");
      reviewSubmit.type = "submit";
      reviewSubmit.className = "ghost";
      reviewSubmit.textContent = "리뷰 등록";

      const ratingRow = document.createElement("div");
      ratingRow.className = "range";
      ratingRow.append(ratingInputEl, scoreOutput);

      reviewForm.append(
        labelWrap("작성자", reviewerInput),
        labelWrap("점수", ratingRow),
        labelWrap("한줄 리뷰", noteInput),
        labelWrap("먹은사진", reviewPhotoInput),
        reviewPhotoPreview,
        reviewSubmit,
      );

      reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const rating = clampRating(ratingInputEl.value);
        const name = normalizeText(reviewerInput.value, "익명").slice(0, 20);
        const note = normalizeText(noteInput.value);

        if (!note) {
          alert("리뷰를 입력해 주세요.");
          return;
        }

        if (reviewPhotoInput.files?.[0] && !reviewPhotoUrl) {
          reviewPhotoUrl = await sanitizePhotoForStore(reviewPhotoInput.files[0]);
        }

        if (reviewPhotoInput.files?.[0] && !reviewPhotoUrl) {
          reviewPhotoInput.value = "";
          return;
        }

        try {
          const body = {
            name,
            rating,
            note,
          };

          if (reviewPhotoUrl) {
            body.photoUrl = reviewPhotoUrl;
          }

          await requestJson(`/api/restaurants/${encodeURIComponent(item.id)}/reviews`, {
            method: "POST",
            body: JSON.stringify(body),
          });

          reviewerInput.value = "";
          noteInput.value = "";
          ratingInputEl.value = "4.0";
          scoreOutput.textContent = "4.0";
          reviewPhotoInput.value = "";
          reviewPhotoUrl = "";
          reviewPhotoPreview.innerHTML = "";
          reviewPhotoPreview.hidden = true;
          await renderAll();
        } catch (error) {
          alert(error.message || "리뷰 등록에 실패했습니다.");
        }
      });

        card.append(titleLine, badgeText, stars, description);
        card.appendChild(createRestaurantImageNode(item));

      const oldBadge = badgeCache[item.id];
      if (oldBadge && oldBadge !== badge) {
        applyReviewAnimation(scoreBadge);
      }
      badgeCache[item.id] = badge;

      card.append(actions, reviewHeader, reviewList, reviewForm);
      listEl.appendChild(card);
    });
  }

  function buildCommentTree(commentRows) {
    const map = new Map();
    const roots = [];

    commentRows.forEach((comment) => {
      map.set(comment.id, {
        ...comment,
        replies: [],
      });
    });

    commentRows.forEach((comment) => {
      const node = map.get(comment.id);
      if (!node) return;

      if (comment.parentCommentId && map.has(comment.parentCommentId)) {
        map.get(comment.parentCommentId)?.replies.push(node);
        return;
      }

      roots.push(node);
    });

    return roots;
  }

  function canPostReply() {
    return canCreateComment();
  }

  function canCreateComment() {
    return !isGuestView();
  }

  function createPostCommentForm(postId, onCreate) {
    const form = document.createElement("form");
    form.className = "review-form comment-form";

    const writerInput = document.createElement("input");
    writerInput.type = "text";
    writerInput.placeholder = "작성자(선택)";
    writerInput.maxLength = 20;

    const commentInput = document.createElement("textarea");
    commentInput.rows = 2;
    commentInput.required = true;
    commentInput.maxLength = 300;
    commentInput.placeholder = "댓글을 남겨 주세요.";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "ghost";
    submit.textContent = "댓글 등록";

    const authorContainer = labelWrap("작성자", writerInput);
    const commentContainer = labelWrap("댓글", commentInput);

    form.appendChild(authorContainer);
    form.appendChild(commentContainer);
    form.appendChild(submit);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const author = normalizeText(writerInput.value, currentMemberNickname());
      const content = normalizeText(commentInput.value);

      if (!canCreateComment()) {
        alert("회원 로그인 후 댓글을 작성할 수 있습니다.");
        return;
      }

      if (!content) {
        alert("댓글 내용을 입력해 주세요.");
        return;
      }

      await onCreate(postId, { author, content, parentCommentId: null });
      commentInput.value = "";
      writerInput.value = "";
    });

    return form;
  }

  function createNestedReplyForm(postId, parentId, onCreate) {
    const form = document.createElement("form");
    form.className = "comment-reply-form";

    const replyInput = document.createElement("textarea");
    replyInput.rows = 2;
    replyInput.required = true;
    replyInput.maxLength = 300;
    replyInput.placeholder = "대댓글을 남겨 주세요.";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "ghost";
    submit.textContent = "답글 등록";

    form.appendChild(labelWrap("답글", replyInput));
    form.appendChild(submit);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!canCreateComment()) {
        alert("회원 로그인 후 대댓글을 작성할 수 있습니다.");
        return;
      }

      const content = normalizeText(replyInput.value);
      if (!content) {
        alert("대댓글 내용을 입력해 주세요.");
        return;
      }

      await onCreate(postId, {
        author: currentMemberNickname(),
        content,
        parentCommentId: parentId,
      });
      replyInput.value = "";
    });

    return form;
  }

  async function postComment(postId, payload) {
    if (!canCreateComment()) {
      alert("회원 로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }

    const body = {
      author: normalizeText(payload.author, currentMemberNickname()),
      content: normalizeText(payload.content),
    };

    if (payload.parentCommentId) {
      body.parentCommentId = payload.parentCommentId;
    }

    await requestJson(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    await renderAll();
  }

  function renderPostComment(comment, depth = 0) {
    const item = document.createElement("div");
    item.className = "comment-item";

    const head = document.createElement("div");
    head.className = "comment-head";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${comment.author} · ${formatDate(comment.createdAt)}`;

    const toggleReplyBtn = document.createElement("button");
    toggleReplyBtn.type = "button";
    toggleReplyBtn.className = "ghost ghost-small";
    toggleReplyBtn.textContent = "답글 달기";

    const text = document.createElement("p");
    text.textContent = comment.content;

    head.append(meta, toggleReplyBtn);
    item.style.marginLeft = `${Math.min(depth, 5) * 12}px`;
    item.append(head, text);

    const replyWrapper = document.createElement("div");
    replyWrapper.className = "comment-replies";

    const replyContainer = document.createElement("div");
    replyContainer.className = "comment-reply-container";
    replyContainer.hidden = true;

    let nestedForm = null;

    toggleReplyBtn.addEventListener("click", () => {
      if (!canPostReply()) {
        alert("회원 로그인 후 대댓글을 작성할 수 있습니다.");
        return;
      }

      if (!nestedForm) {
        nestedForm = createNestedReplyForm(comment.postId, comment.id, postComment);
      }

      replyContainer.hidden = !replyContainer.hidden;
      if (replyContainer.hidden) {
        nestedForm.reset?.();
      } else if (!replyContainer.firstChild) {
        replyContainer.appendChild(nestedForm);
      }
    });

    comment.replies?.forEach((child) => {
      const childNode = renderPostComment(child, depth + 1);
      replyWrapper.appendChild(childNode);
    });

    item.append(replyWrapper, replyContainer);
    return item;
  }

  async function createPost(post) {
    await requestJson("/api/posts", {
      method: "POST",
      body: JSON.stringify(post),
    });

    await renderAll();
  }

  async function updatePost(postId, payload) {
    const body = {
      title: normalizeText(payload.title),
      content: normalizeText(payload.content),
    };

    await requestJson(`/api/posts/${encodeURIComponent(postId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    await renderAll();
  }

  async function moderatePost(postId, status) {
    await requestJson(`/api/posts/${encodeURIComponent(postId)}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    await renderAll();
  }

  async function updateRoadmap(roadmapId, payload) {
    await requestJson(`/api/roadmaps/${encodeURIComponent(roadmapId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    await renderAll();
  }

  async function rateRoadmap(roadmapId, rating) {
    await requestJson(`/api/roadmaps/${encodeURIComponent(roadmapId)}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    });

    await renderAll();
  }

  async function deleteRoadmap(roadmapId) {
    await requestJson(`/api/roadmaps/${encodeURIComponent(roadmapId)}`, {
      method: "DELETE",
    });

    await renderAll();
  }

  async function deletePost(postId) {
    await requestJson(`/api/posts/${encodeURIComponent(postId)}`, {
      method: "DELETE",
    });
    await renderAll();
  }

  async function renderAll() {
    const [restaurantRows, roadmapRows, postRows] = await Promise.all([
      loadRestaurantsFromStorage(),
      loadRoadmapsFromStorage(),
      loadPostsFromStorage(),
    ]);

    restaurants = restaurantRows;
    roadmaps = roadmapRows;
    posts = postRows;

    renderRestaurantList();
    renderPostList();
    renderRoadmapList();
    renderMapSidebarRoadmaps();
    renderMapRanking();
    updateRoadmapWriteState();
    renderMap();
  }

  function resizePhoto(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const sourceData = String(reader.result);

        const image = new Image();
        image.onload = () => {
          if (image.width <= PHOTO_MAX_WIDTH && image.height <= PHOTO_MAX_HEIGHT) {
            resolve(sourceData);
            return;
          }

          const ratio = Math.min(
            PHOTO_MAX_WIDTH / image.width,
            PHOTO_MAX_HEIGHT / image.height,
            1,
          );
          const width = Math.max(1, Math.round(image.width * ratio));
          const height = Math.max(1, Math.round(image.height * ratio));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(sourceData);
            return;
          }

          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };

        image.onerror = () => resolve("");
        image.src = sourceData;
      };

      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  function sanitizePhotoForStore(file) {
    return new Promise((resolve) => {
      if (!file) {
        resolve("");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        resolve("");
        return;
      }

      if (file.size > PHOTO_MAX_BYTES) {
        alert("이미지 용량은 2MB 이하로 등록해 주세요.");
        resolve("");
        return;
      }

      resizePhoto(file)
        .then(resolve)
        .catch(() => resolve(""));
    });
  }

  function isValidCoordinate(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  async function onSubmitRestaurant(event) {
    event.preventDefault();

    if (!canCreateRestaurant()) {
      alert("관리자 인증이 필요합니다.");
      return;
    }

    const name = normalizeText(nameInput.value);
    const address = normalizeText(addressInput.value);
    const description = normalizeText(descriptionInput.value);
    const lat = Number(latInput.value);
    const lng = Number(lngInput.value);

    if (!name || !address || !description || !isValidCoordinate(lat, lng)) {
      alert("필수 항목을 확인해 주세요.");
      return;
    }

    const photoDataUrl = await sanitizePhotoForStore(photoInput.files?.[0]);
    try {
      await requestJson("/api/restaurants", {
        method: "POST",
        body: JSON.stringify({
          name,
          address,
          lat,
          lng,
          description,
          photoUrl: photoDataUrl,
        }),
      });

      form.reset();
      latInput.value = String(SEOUL_CENTER.lat);
      lngInput.value = String(SEOUL_CENTER.lng);
      photoPreview.hidden = true;
      photoPreview.innerHTML = "";
      await renderAll();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearUserSession();
        updateAdminUI();
        renderAdminOnlyState();
      }

      alert(error.message || "맛집 등록에 실패했습니다.");
    }
  }

  async function onSubmitPost(event) {
    event.preventDefault();

    if (!canCreatePost()) {
      alert("회원 또는 관리자 로그인 후 게시글을 작성할 수 있습니다.");
      return;
    }

    const title = normalizeText(postTitleInput.value);
    const author = normalizeText(postAuthorInput.value, currentMemberNickname());
    const content = normalizeText(postContentInput.value);
    const rating = postRatingTouched && postRatingInput
      ? Number(postRatingInput.value)
      : null;

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    try {
      await createPost({
        title,
        author,
        content,
        lat: postLocation?.lat ?? null,
        lng: postLocation?.lng ?? null,
        address: postLocation?.address || "",
        place_name: postLocation?.name || "",
        rating,
      });
      postForm.reset();
      postTitleInput.value = "";
      postContentInput.value = "";
      postAuthorInput.value = currentMemberNickname();
      postLocation = null;
      postRatingTouched = false;
      if (postRatingInput) {
        postRatingInput.value = "4.0";
      }
      if (postRatingOutput) {
        postRatingOutput.textContent = "선택 안 함";
      }
      renderPostLocationSelection();
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        clearUserSession();
        updateAdminUI();
        renderAdminOnlyState();
        applyTabVisibility();
      }

      alert(error.message || "게시글 등록에 실패했습니다.");
    }
  }

  function onPhotoChange() {
    const file = photoInput.files?.[0];
    photoPreview.innerHTML = "";
    photoPreview.hidden = true;

    if (!file) return;

    if (file.size > PHOTO_MAX_BYTES || !file.type.startsWith("image/")) {
      alert("이미지 형식/용량이 올바르지 않습니다.");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.src = String(reader.result);
      photoPreview.appendChild(img);
      photoPreview.hidden = false;
    };
    reader.onerror = () => {
      photoPreview.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  function openLoginModal() {
    if (!loginModal) return;
    loginModal.hidden = false;
    requestAnimationFrame(() => loginModal.classList.add("is-open"));
    adminTokenInput?.focus();
  }

  function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove("is-open");
    setTimeout(() => { loginModal.hidden = true; }, 200);
    if (adminTokenInput) adminTokenInput.value = "";
    if (memberNicknameInput) memberNicknameInput.value = "";
  }
  async function onLoginClick() {
    openLoginModal();
  }

  function bindEvents() {
    if (authButton) {
      authButton.addEventListener("click", () => {
        onLoginClick();
      });
    }

    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener("click", () => {
        clearUserSession();
        updateAdminUI();
        updateRoadmapWriteState();
        applyTabVisibility();
        renderAdminOnlyState();
        setActiveTab("explore");
        if (adminHint) {
          adminHint.textContent = "로그아웃 되었습니다.";
        }
      });
    }

    form.addEventListener("submit", onSubmitRestaurant);
    postForm?.addEventListener("submit", onSubmitPost);
    roadmapForm?.addEventListener("submit", onSubmitRoadmap);
    photoInput.addEventListener("change", onPhotoChange);
    badgeFilter.addEventListener("change", renderRestaurantList);
    sortBy.addEventListener("change", renderRestaurantList);
    if (mapSearchBtn) {
      mapSearchBtn.addEventListener("click", runMapSearchFocus);
    }
    if (mapSearchInput) {
      mapSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          runMapSearchFocus();
        }
      });
    }
    if (mapRegionFilter) {
      mapRegionFilter.addEventListener("change", applyMapFilters);
    }
    if (mapFoodFilter) {
      mapFoodFilter.addEventListener("change", applyMapFilters);
    }
    if (mapRatingFilter) {
      mapRatingFilter.addEventListener("change", applyMapFilters);
    }
    if (mapFilterResetBtn) {
      mapFilterResetBtn.addEventListener("click", resetMapFilters);
    }
    mapPanelTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setMapPanelMode(button.dataset.mapPanel);
      });
    });
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveTab(button.dataset.tab);
      });
    });

    // Stops search popup listeners
    if (addStopBtn) {
      addStopBtn.addEventListener("click", () => openStopSearchModal("roadmap"));
    }
    if (postLocationBtn) {
      postLocationBtn.addEventListener("click", openPostLocationSearch);
    }
    if (postRatingInput) {
      postRatingInput.addEventListener("input", () => {
        postRatingTouched = true;
        if (postRatingOutput) {
          postRatingOutput.textContent = Number(postRatingInput.value).toFixed(1);
        }
      });
    }
    if (stopSearchClose) {
      stopSearchClose.addEventListener("click", closeStopSearchModal);
    }
    if (stopSearchModal) {
      stopSearchModal.addEventListener("click", (e) => {
        if (e.target === stopSearchModal) closeStopSearchModal();
      });
    }
    if (stopSearchInput) {
      stopSearchInput.addEventListener("input", () => {
        clearTimeout(stopSearchTimer);
        clearStopPreview();
        stopSearchTimer = setTimeout(() => {
          performStopSearch(stopSearchInput.value);
        }, 400);
      });
    }
    const stopSearchTypeBtns = stopSearchModal?.querySelectorAll(".stop-search-type-btn");
    if (stopSearchTypeBtns) {
      stopSearchTypeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          stopSearchType = btn.dataset.searchType || "place";
          updateStopSearchType();
          clearStopPreview();
          if (stopSearchInput) {
            stopSearchInput.value = "";
            stopSearchInput.focus();
          }
          if (stopSearchResults) stopSearchResults.innerHTML = "";
        });
      });
    }
    if (stopPreviewAdd) {
      stopPreviewAdd.addEventListener("click", confirmStopPreview);
    }

    // Route panel listeners
    if (routePanelClose) {
      routePanelClose.addEventListener("click", hideRoutePanel);
    }
    if (routePanel) {
      routePanel.querySelectorAll(".route-mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          updateRouteDisplay(btn.dataset.mode);
        });
      });
    }

    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = adminTokenInput?.value?.trim();
        if (!token) return;
        const ok = await ensureAdminReady(token);
        if (ok) {
          closeLoginModal();
          updateAdminUI();
          applyTabVisibility();
          renderAdminOnlyState();
          updateRoadmapWriteState();
          setActiveTab(isAdminView() ? "adminWrite" : activeTabId);
          await renderAll();
        }
      });
    }

    if (memberLoginForm) {
      memberLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nickname = memberNicknameInput?.value?.trim();
        if (!nickname) { alert("닉네임을 입력해 주세요."); return; }
        saveMemberSession(nickname);
        closeLoginModal();
        updateAdminUI();
        applyTabVisibility();
        renderAdminOnlyState();
        updateRoadmapWriteState();
        await renderAll();
      });
    }

    if (loginModalCloseBtn) {
      loginModalCloseBtn.addEventListener("click", closeLoginModal);
    }

    if (loginModal) {
      loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }
  }

  function applyTabVisibility() {
    const adminWriteTab = Array.from(tabButtons).find((button) => button.dataset.tab === "adminWrite");
    const roadmapTab = Array.from(tabButtons).find((button) => button.dataset.tab === "roadmap");

    if (adminWriteTab) {
      const isVisible = isAdminView();
      adminWriteTab.hidden = !isVisible;

      adminWriteTab.setAttribute("aria-hidden", String(!isVisible));
      adminWriteTab.tabIndex = isVisible ? 0 : -1;

      if (!isVisible) {
        adminWriteTab.classList.remove("is-active");
      }
    }

    if (roadmapTab) {
      roadmapTab.hidden = false;
      roadmapTab.setAttribute("aria-hidden", "false");
      roadmapTab.tabIndex = 0;
    }


    if (!isAdminView() && activeTabId === "adminWrite") {
      setActiveTab("explore");
    }

  }

  async function init() {
    restaurants = [];
    syncMapFilterStateFromUI();
    await loadMapServiceConfig();
    const isAdminSessionValid = await ensureAdminSessionState();
    if (!isAdminSessionValid) {
      ensureMemberSessionState();
    }
    applyTabVisibility();
    updateAdminUI();
    bindEvents();
    if (postRatingOutput) {
      postRatingOutput.textContent = "선택 안 함";
    }
    renderPostLocationSelection();
    renderAdminOnlyState();
    updateRoadmapWriteState();
    setMapPanelMode("roadmap");
    setActiveTab("explore");
    await renderAll();
    await initNaverMap().catch(() => {
      // no-op: message handled in initNaverMap
    });
  }

  function renderAdminOnlyState() {
    const saveHint = isAdmin
      ? ""
      : "관리자 승인 시에만 새 맛집 등록이 가능합니다.";
    adminWriteGate.textContent = saveHint;
    adminWriteGate.hidden = isAdmin;
  }

  function renderRoadmapList() {
    if (!roadmapListEl) {
      return;
    }

    roadmapListEl.innerHTML = "";

    if (!roadmaps.length) {
      const message = document.createElement("p");
      message.className = "meta";
      message.textContent = "아직 등록된 로드맵이 없습니다.";
      roadmapListEl.appendChild(message);
      return;
    }

    roadmaps.forEach((roadmap) => {
      const item = document.createElement("article");
      item.className = "item";

      const header = document.createElement("div");
      header.className = "item-title";

      const title = document.createElement("h3");
      title.textContent = roadmap.title;

      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = `${roadmap.author} · ${formatDate(roadmap.createdAt)}`;

      header.append(title, meta);

      const desc = document.createElement("p");
      desc.className = "review";
      desc.textContent = roadmap.description;

      const stopsArr = parseStops(roadmap.stops);
      const stopsLabel = document.createElement("p");
      stopsLabel.className = "meta";
      if (stopsArr.length) {
        stopsLabel.textContent = `추천 코스: ${stopsArr.map((s) => s.name).join(" \u2192 ")}`;
      } else {
        stopsLabel.textContent = "추천 코스 정보가 없습니다.";
      }

      const viewMapBtn = document.createElement("button");
      viewMapBtn.type = "button";
      viewMapBtn.className = "ghost";
      viewMapBtn.textContent = "지도에서 보기";
      viewMapBtn.style.fontSize = "12px";
      viewMapBtn.style.padding = "5px 10px";
      viewMapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setActiveTab("explore");
        setTimeout(() => showRoadmapPins(roadmap), 100);
      });

      const ratingLine = document.createElement("div");
      ratingLine.className = "roadmap-rating";
      ratingLine.innerHTML = toRoadmapRating(roadmap.rating, roadmap.ratingCount);

      const ratingMeta = document.createElement("p");
      ratingMeta.className = "meta";
      ratingMeta.textContent = `평균 ${(Number(roadmap.ratingCount) > 0 ? Number(roadmap.rating) : 0).toFixed(1)} (${Number(roadmap.ratingCount || 0)}명)`;

      const roadmapRateForm = document.createElement("form");
      roadmapRateForm.className = "roadmap-rate-form";

      const roadmapRateRange = document.createElement("input");
      roadmapRateRange.type = "range";
      roadmapRateRange.min = "0.5";
      roadmapRateRange.max = "5";
      roadmapRateRange.step = "0.5";
      roadmapRateRange.value = "4.0";

      const roadmapRateOutput = document.createElement("output");
      roadmapRateOutput.textContent = "4.0";

      roadmapRateRange.addEventListener("input", () => {
        roadmapRateOutput.textContent = Number(roadmapRateRange.value).toFixed(1);
      });

      const roadmapRateBtn = document.createElement("button");
      roadmapRateBtn.type = "submit";
      roadmapRateBtn.className = "ghost";
      roadmapRateBtn.textContent = "⭐ 평점 주기";

      roadmapRateForm.append(roadmapRateRange, roadmapRateOutput, roadmapRateBtn);
      roadmapRateForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!canCreateRoadmap()) {
          alert("회원 또는 관리자 로그인 후 평점을 등록할 수 있습니다.");
          return;
        }

        try {
          roadmapRateBtn.disabled = true;
          await rateRoadmap(roadmap.id, Number(roadmapRateRange.value));
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            clearUserSession();
            updateAdminUI();
            renderAdminOnlyState();
            applyTabVisibility();
            setActiveTab("explore");
          }
          alert(error.message || "로드맵 평점 등록에 실패했습니다.");
        } finally {
          roadmapRateBtn.disabled = false;
        }
      });

      const actions = document.createElement("div");
      actions.className = "actions";

        if (canModeratePosts()) {
          const editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "ghost";
          editBtn.textContent = "수정";

          editBtn.addEventListener("click", async () => {
          const nextTitle = promptOrNull("로드맵 제목을 수정해 주세요.", roadmap.title);
          if (nextTitle === null) return;

          const nextDescription = promptOrNull("로드맵 설명을 수정해 주세요.", roadmap.description);
          if (nextDescription === null) return;

          const nextStops = promptOrNull("추천 맛집/탐방 순서를 수정해 주세요.", roadmap.stops || "");
          if (nextStops === null) return;

          if (!nextTitle || !nextDescription) {
            alert("제목과 설명은 필수입니다.");
            return;
          }

          try {
            await updateRoadmap(roadmap.id, {
              title: nextTitle,
              author: roadmap.author,
              description: nextDescription,
              stops: nextStops,
            });
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "로드맵 수정에 실패했습니다.");
          }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "ghost";
        deleteBtn.textContent = "삭제";

        deleteBtn.addEventListener("click", async () => {
          if (!window.confirm("이 로드맵을 삭제할까요?")) return;

          try {
            await deleteRoadmap(roadmap.id);
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "로드맵 삭제에 실패했습니다.");
          }
        });

        actions.append(editBtn, deleteBtn);
      }

      item.append(header, desc, stopsLabel, ratingLine, ratingMeta, viewMapBtn);
      if (canCreateRoadmap()) {
        item.append(roadmapRateForm);
      }
      if (actions.children.length) {
        item.append(actions);
      }
      roadmapListEl.appendChild(item);
    });
  }


  function renderMapSidebarRoadmaps() {
    if (!mapRoadmapListEl) return;
    mapRoadmapListEl.innerHTML = "";

    if (!roadmaps.length) {
      const empty = document.createElement("p");
      empty.className = "meta";
      empty.textContent = "아직 등록된 로드맵이 없습니다.";
      mapRoadmapListEl.appendChild(empty);
      return;
    }

    roadmaps.forEach((roadmap) => {
      const card = document.createElement("div");
      card.className = "sidebar-roadmap-card";

      const title = document.createElement("h4");
      title.textContent = roadmap.title;

      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = `${roadmap.author} \u00b7 ${formatDate(roadmap.createdAt)}`;

      const desc = document.createElement("p");
      desc.className = "sidebar-desc";
      desc.textContent = roadmap.description;

      const ratingMeta = document.createElement("p");
      ratingMeta.className = "meta roadmap-sidebar-rating";
      ratingMeta.innerHTML = `${toRoadmapRating(roadmap.rating, roadmap.ratingCount)} <span>${(Number(roadmap.ratingCount) > 0 ? Number(roadmap.rating) : 0).toFixed(1)} (${Number(roadmap.ratingCount || 0)}명)</span>`;

      const stopsArr = parseStops(roadmap.stops);
      if (stopsArr.length) {
        const stopsEl = document.createElement("p");
        stopsEl.className = "meta";
        stopsEl.textContent = `\ud83d\udccd ${stopsArr.map((s) => s.name).join(" \u2192 ")}`;
        card.append(title, meta, desc, ratingMeta, stopsEl);
      } else {
        card.append(title, meta, desc, ratingMeta);
      }

      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        showRoadmapPins(roadmap);
      });

      mapRoadmapListEl.appendChild(card);
    });
  }

  function renderPostList() {
    if (!postListEl) {
      return;
    }

    postListEl.innerHTML = "";

    if (!posts.length) {
      const message = document.createElement("p");
      message.className = "meta";
      message.textContent = isGuestView()
        ? "현재 승인된 게시글이 없습니다."
        : "등록된 게시글이 아직 없습니다.";
      postListEl.appendChild(message);
      return;
    }

    posts.forEach((post) => {
      const row = document.createElement("article");
      row.className = "item post-item";

      const head = document.createElement("div");
      head.className = "post-head";

      const titleRow = document.createElement("div");
      titleRow.className = "post-title-row";

      const title = document.createElement("h3");
      title.textContent = post.title;

      const status = document.createElement("span");
      status.className = `post-status ${postStatusClass(post.status)}`;
      status.textContent = postStatusLabel(post.status);

      const meta = document.createElement("p");
      meta.className = "meta";
      meta.textContent = `${post.author} · ${createPostStatusText(post)} (${post.authorRole === ROLE_ADMIN ? "관리자" : "회원"})`;

      const content = document.createElement("p");
      content.className = "review";
      content.textContent = post.content;

      const hasPostLocation = isValidCoordinate(Number(post.lat), Number(post.lng));
      const placeLabel = post.placeName || post.address;
      const locationInfo = placeLabel
        ? document.createElement("p")
        : null;
      if (locationInfo) {
        locationInfo.className = "post-location";
        locationInfo.textContent = `📍 ${placeLabel}`;
      }

      const badgeEl = document.createElement("span");
      if (Number.isFinite(Number(post.rating)) && Number(post.rating) > 0) {
        const badge = badgeByScore(Number(post.rating), 1);
        badgeEl.className = `badge post-badge ${badge}`;
        badgeEl.textContent = `${badgeLabel(badge)} · ${Number(post.rating).toFixed(1)}`;
      }

      titleRow.append(title, status);
      head.append(titleRow, meta, content);
      if (locationInfo) head.appendChild(locationInfo);
      if (badgeEl.textContent) head.appendChild(badgeEl);

      const actions = document.createElement("div");
      actions.className = "actions post-actions";

      if (hasPostLocation) {
        const mapBtn = document.createElement("button");
        mapBtn.type = "button";
        mapBtn.className = "ghost";
        mapBtn.textContent = "지도에서 보기";
        mapBtn.addEventListener("click", () => {
          setActiveTab("explore");
          setTimeout(() => {
            focusLocationOnMap(Number(post.lat), Number(post.lng), post.placeName || post.title);
          }, 120);
        });
        actions.appendChild(mapBtn);
      }

      if (canModeratePosts()) {
        const approveBtn = document.createElement("button");
        approveBtn.type = "button";
        approveBtn.className = "ghost";
        approveBtn.textContent = post.status === POST_STATUS_APPROVED ? "승인 취소" : "승인 처리";
        approveBtn.addEventListener("click", async () => {
          try {
            const status = post.status === POST_STATUS_APPROVED
              ? POST_STATUS_PENDING
              : POST_STATUS_APPROVED;
            await moderatePost(post.id, status);
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "게시글 승인 상태 변경에 실패했습니다.");
          }
        });

        const rejectBtn = document.createElement("button");
        rejectBtn.type = "button";
        rejectBtn.className = "ghost";
        rejectBtn.textContent = "반려";
        rejectBtn.disabled = post.status === POST_STATUS_REJECTED;
        rejectBtn.addEventListener("click", async () => {
          if (post.status === POST_STATUS_REJECTED) return;
          try {
            await moderatePost(post.id, POST_STATUS_REJECTED);
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "게시글 반려에 실패했습니다.");
          }
        });

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "ghost";
        editBtn.textContent = "수정";
        editBtn.addEventListener("click", async () => {
          const nextTitle = promptOrNull("게시글 제목을 수정해 주세요.", post.title);
          if (nextTitle === null) return;

          const nextContent = promptOrNull("게시글 내용을 수정해 주세요.", post.content);
          if (nextContent === null) return;

          const title = normalizeText(nextTitle);
          const content = normalizeText(nextContent);

          if (!title || !content) {
            alert("제목과 내용을 모두 입력해 주세요.");
            return;
          }

          try {
            await updatePost(post.id, { title, content });
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "게시글 수정에 실패했습니다.");
          }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "ghost";
        deleteBtn.textContent = "삭제";
        deleteBtn.addEventListener("click", async () => {
          if (!window.confirm("이 게시글을 삭제할까요?")) return;
          try {
            await deletePost(post.id);
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              clearUserSession();
              updateAdminUI();
              renderAdminOnlyState();
              applyTabVisibility();
              setActiveTab("explore");
            }
            alert(error.message || "게시글 삭제에 실패했습니다.");
          }
        });

        actions.append(approveBtn, rejectBtn, editBtn, deleteBtn);
      }

      const commentSection = document.createElement("div");
      commentSection.className = "comment-section";

      const commentHeader = document.createElement("p");
      commentHeader.className = "meta";
      commentHeader.textContent = "댓글";

      const commentList = document.createElement("div");
      commentList.className = "comment-list";

      const tree = buildCommentTree(Array.isArray(post.comments) ? post.comments : []);
      if (!tree.length) {
        const emptyComment = document.createElement("p");
        emptyComment.className = "meta";
        emptyComment.textContent = "아직 댓글이 없습니다.";
        commentList.appendChild(emptyComment);
      } else {
        tree.forEach((item) => {
          commentList.appendChild(renderPostComment(item, 0));
        });
      }

      const formContainer = document.createElement("div");
      formContainer.className = "comment-form-wrap";

      if (canCreateComment()) {
        formContainer.appendChild(createPostCommentForm(post.id, postComment));
      } else {
        const loginHint = document.createElement("p");
        loginHint.className = "admin-write-gate";
        loginHint.textContent = "회원 로그인 후 댓글을 작성할 수 있습니다.";
        formContainer.appendChild(loginHint);
      }

      commentSection.append(commentHeader, commentList, formContainer);

      row.append(head);
      if (actions.children.length) {
        row.appendChild(actions);
      }
      row.append(commentSection);
      postListEl.appendChild(row);
    });
  }

  function updateRoadmapWriteState() {
    if (!roadmapWriteGate) {
      return;
    }

    const canWrite = canCreateRoadmap();
    roadmapWriteGate.textContent = canWrite
      ? "새 로드맵을 작성할 수 있습니다."
      : "로그인(회원/관리자) 후 로드맵 작성을 할 수 있습니다.";
    roadmapWriteGate.hidden = canWrite;

    if (roadmapForm) {
      roadmapForm.querySelectorAll("input:not(#roadmapAuthor), textarea, button[type='submit']").forEach((el) => {
        el.disabled = !canWrite;
      });
      roadmapForm.classList.toggle("disabled", !canWrite);
      roadmapForm.style.display = canWrite ? "" : "none";
    }

    if (roadmapAuthorInput) {
      if (canWrite) {
        roadmapAuthorInput.value = currentMemberNickname();
        roadmapAuthorInput.readOnly = true;
        roadmapAuthorInput.disabled = false;
      } else {
        roadmapAuthorInput.value = "";
        roadmapAuthorInput.readOnly = false;
        roadmapAuthorInput.disabled = true;
      }
    }
  }

  // --- Stops (추천맛집) 검색 팝업 ---

  function parseStops(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) { /* plain text fallback */ }
    return raw.split(",").map((s) => s.trim()).filter(Boolean).map((s) => ({ name: s, address: "", lat: 0, lng: 0 }));
  }

  function serializeStops(stops) {
    if (!stops.length) return "";
    return JSON.stringify(stops);
  }

  function renderSelectedStops() {
    if (!selectedStopsListEl) return;
    selectedStopsListEl.innerHTML = "";

    selectedStops.forEach((stop, idx) => {
      const item = document.createElement("div");
      item.className = "selected-stop-item";

      const info = document.createElement("div");
      info.className = "stop-info";

      const name = document.createElement("span");
      name.className = "stop-name";
      name.textContent = stop.name;

      const addr = document.createElement("span");
      addr.className = "stop-addr";
      addr.textContent = stop.address ? ` · ${stop.address}` : "";

      info.append(name, addr);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "stop-remove";
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", () => {
        selectedStops.splice(idx, 1);
        renderSelectedStops();
      });

      item.append(info, removeBtn);
      selectedStopsListEl.appendChild(item);
    });
  }

  function stripHtml(html) {
    return (html || "").replace(/<[^>]*>/g, "");
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function openStopSearchModal(target = "roadmap") {
    if (!stopSearchModal) return;
    stopSearchTarget = target;
    stopSearchModal.hidden = false;
    requestAnimationFrame(() => stopSearchModal.classList.add("is-open"));
    if (stopSearchInput) {
      stopSearchInput.value = "";
      stopSearchInput.focus();
    }
    stopSearchType = "place";
    updateStopSearchType();
    clearStopPreview();
    if (stopSearchResults) stopSearchResults.innerHTML = "";
  }

  function closeStopSearchModal() {
    if (!stopSearchModal) return;
    stopSearchModal.classList.remove("is-open");
    setTimeout(() => { stopSearchModal.hidden = true; }, 200);
    clearStopPreview();
    clearTimeout(stopSearchTimer);
  }

  function updateStopSearchType() {
    const btns = stopSearchModal?.querySelectorAll(".stop-search-type-btn");
    if (btns) {
      btns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.searchType === stopSearchType);
      });
    }
    if (stopSearchInput) {
      stopSearchInput.placeholder = stopSearchType === "place"
        ? "가게명 검색 (예: 갈비집, 스타벅스)"
        : "주소 검색 (예: 불정로 6, 강남대로 396)";
    }
  }

  async function performStopSearch(query) {
    const q = (query || "").trim();
    if (!q) {
      renderStopSearchApiResults([], "");
      return;
    }
    if (stopSearchType === "place") {
      await searchStopsByPlace(q);
    } else {
      await searchStopsByAddress(q);
    }
  }

  async function searchStopsByPlace(query) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/search/places?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("검색 실패");
      const data = await res.json();
      const items = (data.items || []).map((item) => {
        let lat = 0;
        let lng = 0;
        if (item.mapx && item.mapy) {
          lng = Number(item.mapx) / 1e7;
          lat = Number(item.mapy) / 1e7;
        }
        return {
          name: stripHtml(item.title),
          address: item.roadAddress || item.address || "",
          category: item.category || "",
          lat,
          lng,
        };
      });
      renderStopSearchApiResults(items, query);
    } catch (error) {
      console.error("장소 검색 오류:", error);
      renderStopSearchApiResults([], query);
    }
  }

  function searchStopsByAddress(query) {
    return new Promise((resolve) => {
      if (!window.naver?.maps?.Service) {
        renderStopSearchApiResults([], query);
        resolve();
        return;
      }
      naver.maps.Service.geocode({ query }, (status, response) => {
        if (status !== naver.maps.Service.Status.OK) {
          renderStopSearchApiResults([], query);
          resolve();
          return;
        }
        const items = (response.v2?.addresses || []).map((addr) => ({
          name: addr.roadAddress || addr.jibunAddress || query,
          address: addr.roadAddress || addr.jibunAddress || "",
          category: "",
          lat: Number(addr.y) || 0,
          lng: Number(addr.x) || 0,
        }));
        renderStopSearchApiResults(items, query);
        resolve();
      });
    });
  }

  function renderStopSearchApiResults(items, query) {
    if (!stopSearchResults) return;
    stopSearchResults.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "stop-result-empty";
      empty.textContent = query ? `"${query}" 검색 결과가 없습니다.` : "";
      stopSearchResults.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const already = selectedStops.some((s) => s.name === item.name && s.lat === item.lat && s.lng === item.lng);
      const row = document.createElement("div");
      row.className = "stop-result-item";
      if (already) row.style.opacity = "0.45";

      const info = document.createElement("div");
      info.className = "stop-result-info";

      const name = document.createElement("div");
      name.className = "stop-result-name";
      name.textContent = item.name;

      const addr = document.createElement("div");
      addr.className = "stop-result-addr";
      addr.textContent = item.address || "주소 없음";

      info.append(name, addr);

      if (item.category) {
        const cat = document.createElement("div");
        cat.className = "stop-result-category";
        cat.textContent = item.category;
        info.appendChild(cat);
      }

      const addIcon = document.createElement("span");
      addIcon.className = "stop-result-add";
      addIcon.textContent = already ? "✓" : "+";

      row.append(info, addIcon);

      if (!already) {
        row.addEventListener("click", () => {
          showStopPreview(item);
        });
      }

      stopSearchResults.appendChild(row);
    });
  }

  function showStopPreview(stop) {
    previewStop = stop;
    if (!stopSearchPreview) return;
    stopSearchPreview.hidden = false;

    if (stopPreviewInfo) {
      stopPreviewInfo.innerHTML = "";
      const name = document.createElement("div");
      name.className = "stop-preview-name";
      name.textContent = stop.name;
      const addr = document.createElement("div");
      addr.className = "stop-preview-addr";
      addr.textContent = stop.address || "주소 없음";
      stopPreviewInfo.append(name, addr);
    }

    if (stopPreviewMap && stop.lat && stop.lng && window.naver?.maps) {
      const position = new naver.maps.LatLng(stop.lat, stop.lng);
      if (!previewMapInstance) {
        previewMapInstance = new naver.maps.Map(stopPreviewMap, {
          center: position,
          zoom: 16,
          draggable: true,
          scrollWheel: false,
          disableDoubleClickZoom: true,
        });
        previewMarker = new naver.maps.Marker({
          map: previewMapInstance,
          position,
        });
      } else {
        previewMapInstance.setCenter(position);
        previewMarker.setPosition(position);
      }
      setTimeout(() => {
        if (previewMapInstance) {
          naver.maps.Event.trigger(previewMapInstance, "resize");
          previewMapInstance.setCenter(position);
        }
        stopSearchPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  }

  function clearStopPreview() {
    previewStop = null;
    if (stopSearchPreview) stopSearchPreview.hidden = true;
    if (previewMarker?.setMap) {
      previewMarker.setMap(null);
      previewMarker = null;
    }
    if (previewMapInstance) {
      previewMapInstance.destroy();
      previewMapInstance = null;
    }
  }

  function confirmStopPreview() {
    if (!previewStop) return;
    if (stopSearchTarget === "post") {
      postLocation = {
        name: previewStop.name,
        address: previewStop.address || "",
        lat: previewStop.lat || 0,
        lng: previewStop.lng || 0,
      };
      renderPostLocationSelection();
      closeStopSearchModal();
      return;
    }

    const already = selectedStops.some((s) => s.name === previewStop.name && s.lat === previewStop.lat && s.lng === previewStop.lng);
    if (!already) {
      selectedStops.push({
        name: previewStop.name,
        address: previewStop.address || "",
        lat: previewStop.lat || 0,
        lng: previewStop.lng || 0,
      });
      renderSelectedStops();
    }
    clearStopPreview();
    performStopSearch(stopSearchInput?.value || "");
  }


  async function onSubmitRoadmap(event) {
    event.preventDefault();

    if (!canCreateRoadmap()) {
      alert("로그인 후 로드맵을 등록할 수 있습니다.");
      return;
    }

    const title = normalizeText(roadmapTitleInput.value);
    const author = normalizeText(roadmapAuthorInput.value, normalizeText(getMemberSession()?.nickname, "익명"));
    const description = normalizeText(roadmapDescriptionInput.value);
    const stops = serializeStops(selectedStops);

    if (!title || !author || !description) {
      alert("제목, 작성자, 설명은 필수입니다.");
      return;
    }

    try {
      await requestJson("/api/roadmaps", {
        method: "POST",
        headers: {
          "x-user-role": isAdmin ? "admin" : "member",
        },
        body: JSON.stringify({
          title,
          author,
          description,
          stops,
        }),
      });

      roadmapForm.reset();
      selectedStops = [];
      renderSelectedStops();
      await renderAll();
    } catch (error) {
      alert(error.message || "로드맵 등록에 실패했습니다.");
    }
  }

  function setActiveTab(nextTabId) {
    let targetTabId = nextTabId;

    if (targetTabId === "adminWrite" && !isAdminView()) {
      targetTabId = "explore";
    }


    activeTabId = targetTabId;

    if (targetTabId === "explore" && mapState.map) {
      setTimeout(() => mapState.map.refresh?.(), 50);
    }

    tabButtons.forEach((button) => {
      const isSelected = button.dataset.tab === targetTabId;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    contentPanels.forEach((panel) => {
      const isSelected = panel.id === `${targetTabId}View`;
      panel.classList.toggle("is-active", isSelected);
    });
  }

  init();
})();
