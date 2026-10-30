import type { Page } from "@playwright/test";

const parabola = {
  type: "mathviz.v1",
  widget: "function_plot",
  title: "Khám phá đỉnh parabol",
  expr: "(x-h)^2+1",
  x_domain: [-5, 5],
  params: { h: { min: -3, max: 3, default: 0, step: 0.25 } },
  overlays: [],
};

const graphReply = (title: string) =>
  "Khi thay đổi $h$, em nhận thấy đỉnh parabol di chuyển thế nào?\n\n" +
  "```mathviz\n" + JSON.stringify({ ...parabola, title }) + "\n```";

const geometry = {
  type: "mathviz.v1",
  widget: "geometry_2d",
  title: "Tam giác ABC",
  mode: "triangle",
  points: [{ id: "A", x: 0, y: 0 }, { id: "B", x: 4, y: 0 }, { id: "C", x: 0, y: 3 }],
  layers: [{ kind: "polygon", points: [{ id: "A", x: 0, y: 0 }, { id: "B", x: 4, y: 0 }, { id: "C", x: 0, y: 3 }] }],
};
const solid = {
  type: "mathviz.v1", widget: "geometry_3d", title: "Hộp chữ nhật 3D", solid: "cuboid",
  dims: { a: 3, b: 2.5, c: 4 },
};
const sceneReply = (scene: typeof geometry | typeof solid) =>
  "Em hãy quan sát hình và mô tả các cạnh.\n\n```mathviz\n" + JSON.stringify(scene) + "\n```";

export const firstSceneTitle = parabola.title;
export const secondSceneTitle = "Parabol ở bước tiếp theo";

/** No network request reaches a real tutor/session API from this fixture. */
export async function installTutorApi(page: Page) {
  const messages: string[] = [];
  let releasePending: (() => void) | undefined;
  let pending: Promise<void> | undefined;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    };

    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (url.pathname === "/api/session/new") {
      await route.fulfill({ json: { session_id: "workspace-browser-session" }, headers });
      return;
    }
    if (url.pathname === "/api/chat") {
      const body = request.postDataJSON() as { message?: string };
      const message = body.message || "";
      messages.push(message);
      const waitForRelease = pending;
      pending = undefined;
      if (waitForRelease) await waitForRelease;

      let reply: string;
      if (message.includes("tam giác SVG")) {
        reply = sceneReply(geometry);
      } else if (message.includes("khối 3D")) {
        reply = sceneReply(solid);
      } else if (message.includes("hình thứ hai")) {
        reply = graphReply(secondSceneTitle);
      } else if (message.includes("lịch sử dài")) {
        reply = Array.from({ length: 45 }, (_, index) =>
          `Quan sát ${index + 1}: Em hãy mô tả điều giữ nguyên khi tham số thay đổi, rồi so sánh với dự đoán ban đầu.`,
        ).join("\n\n");
      } else if (message.includes("phản hồi tiếp")) {
        reply = "Phản hồi mới: Em có thể giải thích nhận xét bằng một câu của mình không?";
      } else {
        reply = graphReply(firstSceneTitle);
      }
      await route.fulfill({ json: { reply }, headers });
      return;
    }
    await route.fulfill({ json: {}, headers });
  });

  return {
    messages,
    holdNextReply() {
      pending = new Promise<void>((resolve) => { releasePending = resolve; });
    },
    releaseReply() {
      releasePending?.();
      releasePending = undefined;
    },
  };
}
