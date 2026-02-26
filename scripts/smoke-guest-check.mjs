import http from "node:http";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MOCK_RESTAURANTS = [
  {
    id: "r1",
    name: "시크릿식당",
    address: "강남구 언더그라운드로 1",
    lat: 37.5665,
    lng: 126.978,
    description: "매우 특별한 메뉴가 있어요.",
    photoUrl: "https://example.com/secret-photo.jpg",
    reviews: [
      {
        id: "rev1",
        name: "익명",
        rating: 4.8,
        note: "굉장히 맛있었어요.",
        photoUrl: "https://example.com/review.jpg",
        createdAt: "2026-02-01T12:00:00.000Z",
      },
    ],
    createdAt: "2026-02-01T11:00:00.000Z",
    updatedAt: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "r2",
    name: "유명한집",
    address: "홍대입구로 2",
    lat: 37.5585,
    lng: 126.926,
    description: "분위기 좋은 레스토랑",
    photoUrl: "",
    reviews: [],
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-02T09:00:00.000Z",
  },
];
const MOCK_POSTS = [];
const MOCK_ROADMAPS = [];

function json(response, payload) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function createMockServer() {
  return http
    .createServer(async (request, response) => {
      const url = new URL(request.url, BASE_URL);

      if (url.pathname === "/api/restaurants") {
        return json(response, MOCK_RESTAURANTS);
      }

      if (url.pathname === "/api/posts" || url.pathname.startsWith("/api/posts/")) {
        return json(response, MOCK_POSTS);
      }

      if (url.pathname === "/api/roadmaps") {
        return json(response, MOCK_ROADMAPS);
      }

        if (url.pathname === "/api/admin/ping") {
          return json(response, { ok: true });
        }

        if (url.pathname === "/api/map/config") {
          return json(response, {
            ok: true,
            provider: "naver",
            configured: true,
            scriptUrl: "/api/map/sdk/naver.js",
            displayName: "Naver",
          });
        }

        if (url.pathname === "/api/map/sdk/naver.js") {
          response.writeHead(200, { "Content-Type": "application/javascript" });
          response.end("// mocked naver map sdk endpoint\n");
          return;
        }

      try {
        const filename = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
        const file = await readFile(filename);
        response.writeHead(200);
        response.end(file);
      } catch (error) {
        response.writeHead(404);
        response.end("not found");
      }
    })
    .listen(PORT, "127.0.0.1");
}

async function runSmoke() {
  const server = createMockServer();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      pageErrors.push(`console:${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(`pageerror:${error.stack || error.message}`);
  });

  const failures = [];

    await page.addInitScript(() => {

    const markers = [];
    const listeners = [];

    class LatLng {
      #lat;
      #lng;
      constructor(lat, lng) {
        this.#lat = Number(lat);
        this.#lng = Number(lng);
      }
      lat() {
        return this.#lat;
      }
      lng() {
        return this.#lng;
      }
    }

    class Map {
      constructor() {
        this.center = null;
        this.zoom = null;
      }
      setCenter(position) {
        this.center = position;
      }
      setZoom(level) {
        this.zoom = level;
      }
      destroy() {}
    }

    class Marker {
      constructor(options = {}) {
        this.options = options;
        markers.push(this);
      }
      setMap() {}
    }

    class InfoWindow {
      constructor(options = {}) {
        this.content = options.content || "";
      }
      open() {
        window.__ruschlangMapDebug.lastOpenedContent = this.content;
      }
      close() {}
    }

    const Event = {
      addListener(target, _eventName, handler) {
        const entry = { target, handler };
        listeners.push(entry);
        return entry;
      },
      removeListener() {},
    };

    window.__ruschlangMapDebug = {
      markers,
      listeners,
      lastOpenedContent: "",
    };

    window.naver = {
      maps: {
        Size: class {
          constructor(width, height) {
            this.width = width;
            this.height = height;
          }
        },
        Point: class {
          constructor(x, y) {
            this.x = x;
            this.y = y;
          }
        },
        LatLng,
        Map,
        Marker,
        Event,
        InfoWindow,
      },
    };
  });

  await page.goto(`${BASE_URL}/index.html`, { waitUntil: "networkidle" });
  await page.locator('.board-tabs [data-tab="board"]').click();
  await page.waitForSelector("#restaurantList article.item", {
    timeout: 8000,
    state: "attached",
  });

  await page.waitForFunction(
    () => document.querySelectorAll("#restaurantList article.item").length > 0,
    undefined,
    { timeout: 8000 },
  );

  let debug = {
    hasDebug: false,
    markerCount: 0,
    listenerCount: 0,
    mapNotice: "",
  };
  for (let attempt = 0; attempt < 40; attempt += 1) {
    debug = await page.evaluate(() => ({
      hasDebug: Boolean(window.__ruschlangMapDebug),
      markerCount: window.__ruschlangMapDebug?.markers?.length || 0,
      listenerCount: window.__ruschlangMapDebug?.listeners?.length || 0,
      mapNotice: document.getElementById("mapNotice")?.textContent || "",
    }));

    if (debug.hasDebug && debug.markerCount >= 2) break;
    await page.waitForTimeout(250);
  }

  if (pageErrors.length) {
    failures.push(...pageErrors);
  }

  const firstCardTitle = await page.locator("#restaurantList article.item h3").first().textContent();
  if (firstCardTitle !== "루퍼스 맛집") {
    failures.push("list mask: title should be '루퍼스 맛집'");
  }

  const firstCardSummary = await page
    .locator("#restaurantList article.item p")
    .first()
    .textContent();
  if (!firstCardSummary?.includes("서울 지도 탐방 후 공개 예정")) {
    failures.push("list mask: summary is not masked");
  }

  const firstImageSrc = await page
    .locator("#restaurantList article.item img.photo")
    .first()
    .getAttribute("src");
  if (!firstImageSrc?.startsWith("data:image/svg+xml;charset=UTF-8")) {
    failures.push("list image mask not applied");
  }

  const mapNotice = debug.mapNotice;
  if (!debug.hasDebug || debug.markerCount !== 2) {
    failures.push("map mask: marker count mismatch");
  }

  if (!mapNotice || mapNotice.includes("키를 입력")) {
    failures.push(`map status should be initialized: ${mapNotice || "(empty)"}`);
  }

  const invalidIcon = await page.evaluate(() => {
    return (window.__ruschlangMapDebug?.markers || []).some(
      (marker) =>
        !marker.options.icon ||
        !marker.options.icon.url?.startsWith("data:image/svg+xml;charset=UTF-8"),
    );
  });
  if (invalidIcon) {
    failures.push("map marker icon is not guest logo");
  }

  const popup = await page.evaluate(() => {
    const markerListener = window.__ruschlangMapDebug?.listeners?.find(
      (entry) => entry.target && entry.target.options && entry.target.options.icon,
    );
    markerListener?.handler();
    return window.__ruschlangMapDebug?.lastOpenedContent || "";
  });

  if (!popup?.includes("루퍼스 맛집")) {
    failures.push("popup mask: title missing");
  }
  if (!popup?.includes("루퍼스 뱃지")) {
    failures.push("popup mask: badge badge missing");
  }
  if (popup?.includes("시크릿식당") || popup?.includes("유명한집")) {
    failures.push("popup mask: real restaurant name exposed");
  }

  if (failures.length) {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    console.error("SMOKE FAIL:", failures.join(" | "));
    process.exit(1);
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log("SMOKE PASS: guest masking verified (cards / markers / popup)");
}

runSmoke().catch((error) => {
  console.error("SMOKE ERROR:", error);
  process.exit(1);
});
