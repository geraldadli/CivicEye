// Run with: node --test tests/camera-capture.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const code = ts.transpileModule(readFileSync(new URL("../src/components/CameraCapture.tsx", import.meta.url), "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;

function mount(getUserMedia, blob = new Blob(["photo"], { type: "image/jpeg" })) {
  const slots = [];
  let index = 0;
  let effect;
  let captured;
  let closed = false;
  const video = { videoWidth: 640, videoHeight: 480 };
  const canvas = {
    getContext: () => ({ drawImage: (source) => assert.equal(source, video) }),
    toBlob: (callback, type) => { assert.equal(type, "image/jpeg"); callback(blob); },
  };
  const hooks = {
    useState(initial) {
      const i = index++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (value) => { slots[i] = value; }];
    },
    useRef(initial) { const i = index++; return slots[i] ??= { current: initial }; },
    useEffect(fn) { effect ??= fn; },
  };
  const sandbox = {
    exports: {}, require: (id) => id === "react" ? hooks : require(id),
    navigator: { mediaDevices: getUserMedia ? { getUserMedia } : undefined },
    document: { createElement: (tag) => { assert.equal(tag, "canvas"); return canvas; } },
    File, Date, Error,
  };
  vm.runInNewContext(code, sandbox);
  function render() {
    index = 0;
    const tree = sandbox.exports.default({ onCapture: (file) => { captured = file; }, onClose: () => { closed = true; } });
    const elements = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      elements.push(node);
      if (node.type === "video") node.props.ref.current = video;
      [node.props.children].flat().forEach(visit);
    }
    visit(tree);
    return elements;
  }
  render();
  const cleanup = effect();
  return { render, cleanup, video, canvas, get captured() { return captured; }, get closed() { return closed; } };
}

test("camera produces a JPEG at video resolution and releases tracks", async () => {
  let stops = 0;
  const stream = { getTracks: () => [{ stop: () => stops++ }] };
  const app = mount(async (options) => {
    assert.equal(options.audio, false);
    assert.equal(options.video.facingMode.ideal, "environment");
    return stream;
  });
  await new Promise(setImmediate);
  assert.equal(app.video.srcObject, stream);
  assert.equal(app.render().find((n) => n.type === "button").props.disabled, true);
  app.render().find((n) => n.type === "video").props.onCanPlay();
  const shutter = app.render().find((n) => n.type === "button");
  assert.equal(shutter.props.disabled, false);
  shutter.props.onClick();
  assert.equal(app.captured.type, "image/jpeg");
  assert.match(app.captured.name, /^laporan-\d+\.jpg$/);
  assert.equal(app.canvas.width, 640);
  assert.equal(app.canvas.height, 480);
  app.render().find((n) => n.props.children === "Batal").props.onClick();
  assert.equal(app.closed, true);
  app.cleanup();
  assert.equal(stops, 1);
});

test("camera errors and failed capture are visible and recoverable", async () => {
  for (const getCamera of [undefined, async () => { throw Object.assign(new Error(), { name: "NotAllowedError" }); }]) {
    const app = mount(getCamera);
    await new Promise(setImmediate);
    assert.ok(app.render().find((n) => n.props.role === "alert"));
    app.cleanup();
  }
  const app = mount(async () => ({ getTracks: () => [] }), null);
  await new Promise(setImmediate);
  app.render().find((n) => n.type === "button").props.onClick();
  assert.ok(app.render().find((n) => n.props.role === "alert"));
  assert.equal(app.captured, undefined);
  app.cleanup();
});

test("leaving before permission resolves stops the late camera stream", async () => {
  let resolve;
  let stops = 0;
  const app = mount(() => new Promise((done) => { resolve = done; }));
  app.cleanup();
  resolve({ getTracks: () => [{ stop: () => stops++ }] });
  await new Promise(setImmediate);
  assert.equal(stops, 1);
  assert.equal(app.video.srcObject, undefined);
});
