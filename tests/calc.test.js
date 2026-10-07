// 用計畫書裡的例子檢查算式。執行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shutterFromAngle, frameRate, equivalentFocal, FORMATS, cropFactorFromSize,
  capacityGB, recordSeconds, toMbps, fmtDuration, fmtSize, neededMBps, sdVideoClass,
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
