import { test, expect } from "@playwright/test";

test("비회원 모드에서 맛집 카드와 지도 데이터가 마스킹되는지 확인", async ({ page }) => {
  const restaurants = [
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

  await page.addInitScript(() => {

    const markers = [];
    const infoWindows = [];
    const listeners = [];

    window.__ruschlangMapDebug = {
      markers,
      infoWindows,
      listeners,
      lastOpenedContent: "",
    };

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
        infoWindows.push(this);
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

  await page.route("**/api/restaurants*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(restaurants),
    });
  });

  await page.route("**/api/posts*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/roadmaps*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/map/config*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        provider: "naver",
        configured: true,
        scriptUrl: "/api/map/sdk/naver.js",
        displayName: "Naver",
      }),
    });
  });

  await page.route("**/api/map/sdk/naver.js*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "// mocked naver map sdk endpoint\n",
    });
  });

  const apiHost = "http://127.0.0.1:4173";
  await page.route(`${apiHost}/api/admin/ping*`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("http://127.0.0.1:4173/index.html");
  await page.locator('.board-tabs [data-tab="board"]').click();
  await page.waitForSelector("#restaurantList article.item", { timeout: 5000 });

  await expect(page.locator("#adminPanel")).toBeHidden();
  await expect(page.locator("#adminAuthHint")).toBeHidden();
  await expect(page.locator("#authButton")).toBeVisible();
  await expect(page.locator('.board-tabs [data-tab="roadmap"]')).toBeVisible();
  await expect(page.locator('.board-tabs [data-tab="adminWrite"]')).toBeHidden();

  const cards = page.locator("#restaurantList article.item");
  await expect(cards).toHaveCount(2);

  const firstCard = cards.first();
  await expect(firstCard.locator("h3")).toHaveText("루퍼스 맛집");
  await expect(firstCard).toContainText("서울 지도 탐방 후 공개 예정");
  await expect(firstCard).toContainText("관리자 승인 후 상세 내용이 공개됩니다.");
  await expect(firstCard.locator("img.photo").first()).toHaveAttribute(
    "src",
    /^data:image\/svg\+xml;charset=UTF-8,/,
  );

  const firstImageSrc = await firstCard.locator("img.photo").first().getAttribute("src");
  expect(firstImageSrc).toContain("data:image/svg+xml;charset=UTF-8");

  const debug = await page.evaluate(() => window.__ruschlangMapDebug);
  expect(debug.markers.length).toBe(2);
  expect(
    debug.markers.every((marker) =>
      marker.options.icon && marker.options.icon.url.startsWith("data:image/svg+xml;charset=UTF-8"),
    ),
  ).toBeTruthy();

  const popup = await page.evaluate(() => {
    const { listeners } = window.__ruschlangMapDebug;
    const markerListener = listeners.find((entry) => entry.target && entry.target.options);
    markerListener?.handler();
    return window.__ruschlangMapDebug.lastOpenedContent;
  });

  expect(popup).toContain("루퍼스 맛집");
  expect(popup).toContain("루퍼스 뱃지");
  expect(popup).not.toContain("시크릿식당");
  expect(popup).not.toContain("유명한집");
});
