// 用計畫書裡的例子檢查算式。執行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shutterFromAngle, frameRate, equivalentFocal, FORMATS, cropFactorFromSize,
  capacityGB, recordSeconds, toMbps, fmtDuration, fmtSize, neededMBps, sdVideoClass,
  ndInfo, parseShutter, fmtShutter, aspectOf, cropToRatio, depthOfField, stopsBetween,
} from "../src/lib/calc.js";

test("24fps + 180° → 1/48 秒，最接近 1/50", () => {
  const r = shutterFromAngle(24, 180);
  assert.equal(r.denominator, 48);
  assert.equal(r.nearest, 50);
});

test("25fps + 180° → 1/50；60fps + 180° → 1/120 最接近 1/125", () => {
  assert.equal(shutterFromAngle(25, 180).denominator, 50);
  assert.equal(shutterFromAngle(60, 180).nearest, 125);
});

test("快門角度不合理時回傳 null", () => {
  assert.equal(shutterFromAngle(24, 0), null);
  assert.equal(shutterFromAngle(24, 400), null);
  assert.equal(shutterFromAngle(0, 180), null);
});

test("60fps → 24fps：播放速度 40%、慢動作 2.5×", () => {
  const r = frameRate(60, 24);
  assert.equal(r.speedPercent, 40);
  assert.equal(r.factor, 2.5);
});

test("Sony APS-C 35mm → 52.5mm", () => {
  const f = FORMATS.find((x) => x.id === "apsc-sony").factor;
  assert.equal(equivalentFocal(35, f), 52.5);
});

test("全片幅尺寸的換算倍率是 1", () => {
  assert.equal(cropFactorFromSize(36, 24), 1);
});

test("200 Mbps 拍 3 小時 → 270 GB", () => {
  assert.equal(capacityGB(200, 3 * 3600), 270);
});

test("256 GB、400 Mbps → 約 85 分鐘", () => {
  const s = recordSeconds(256, 400);
  assert.equal(s, 5120);
  assert.equal(fmtDuration(s), "1 小時 25 分鐘");
});

test("MB/s 換成 Mbps", () => {
  assert.equal(toMbps(100, "MBps"), 800);
  assert.equal(toMbps(100, "Mbps"), 100);
});

test("超過 1000 GB 顯示成 TB", () => {
  assert.equal(fmtSize(1500), "1.5 TB");
  assert.equal(fmtSize(270), "270 GB");
});

test("位元率換成需要的 MB/s，並對應 SD 影片速度等級", () => {
  assert.equal(neededMBps(240), 30);
  assert.equal(sdVideoClass(100), "V30");   // 12.5 MB/s → V30
  assert.equal(sdVideoClass(240), "V30");   // 剛好 30 MB/s
  assert.equal(sdVideoClass(250), "V60");   // 31.25 MB/s
  assert.equal(sdVideoClass(600), "V90");   // 75 MB/s
  assert.equal(sdVideoClass(800), null);    // 100 MB/s 超過 V90
  assert.equal(sdVideoClass(0), undefined);
});

test("ND：3 級 = ND8 = 濃度 0.9；快門 1/48 加 3 級變 1/6", () => {
  const r = ndInfo(3);
  assert.equal(r.factor, 8);
  assert.ok(Math.abs(r.density - 0.9) < 1e-9);
  assert.equal(fmtShutter(parseShutter("1/48") * r.factor), "1/6 秒");
  assert.equal(parseShutter("2"), 2);
  assert.equal(parseShutter("abc"), null);
});

test("畫面比例：3840×2160 是 16:9；裁成 2.39:1 高度約 1607", () => {
  assert.equal(aspectOf(3840, 2160).simple, "16:9");
  const c = cropToRatio(3840, 2160, 2.39);
  assert.equal(c.w, 3840);
  assert.equal(Math.round(c.h), 1607);
  assert.equal(cropToRatio(3840, 2160, 1).h, 2160);
});

test("景深：全片幅 50mm f/1.8 對焦 3 公尺，約 2.83～3.19 公尺", () => {
  const r = depthOfField(50, 1.8, 3, 1);
  assert.ok(Math.abs(r.near - 2.83) < 0.02, String(r.near));
  assert.ok(Math.abs(r.far - 3.19) < 0.02, String(r.far));
  assert.equal(depthOfField(50, 8, 100, 1).far, Infinity);
});

test("曝光級數：B 比 A 亮 1 級（f/4→f/2.8、1/100→1/50、ISO 400→800）", () => {
  const near = (v, e) => assert.ok(Math.abs(v - e) < 0.1, String(v));
  near(stopsBetween({ n: 4, t: 1 / 50, iso: 400 }, { n: 2.8, t: 1 / 50, iso: 400 }), 1);
  near(stopsBetween({ n: 2.8, t: 1 / 100, iso: 400 }, { n: 2.8, t: 1 / 50, iso: 400 }), 1);
  near(stopsBetween({ n: 2.8, t: 1 / 50, iso: 400 }, { n: 2.8, t: 1 / 50, iso: 800 }), 1);
});
