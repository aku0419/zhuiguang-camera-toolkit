// 用計畫書裡的例子檢查算式。執行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shutterFromAngle, frameRate, equivalentFocal, FORMATS, cropFactorFromSize,
  capacityGB, recordSeconds, toMbps, fmtDuration, fmtSize, neededMBps, sdVideoClass,
  ndInfo, parseShutter, fmtShutter, aspectOf, cropToRatio, depthOfField, stopsBetween,
  fieldOfView, sunnyAperture, ndStopsNeeded, shootStorage,
  frameSizeAt, desqueezedRatio, mired, miredShift, luxToEV, luxToFc, TC_RATES, tcToFrames, framesToTc,
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

test("視角：全片幅 50mm 水平約 39.6°、對角約 46.8°", () => {
  const r = fieldOfView(50, 36, 24);
  assert.ok(Math.abs(r.h - 39.6) < 0.1);
  assert.ok(Math.abs(r.d - 46.8) < 0.1);
});

test("Sunny 16：ISO 100、1/100 晴天 f/16；ISO 800、1/48 約 f/65，f/2.8 需要約 9 級 ND", () => {
  assert.equal(sunnyAperture(16, 100, 1 / 100), 16);
  assert.ok(Math.abs(sunnyAperture(16, 800, 1 / 48) - 65.3) < 0.2);
  assert.ok(Math.abs(ndStopsNeeded(16, 800, 1 / 48, 2.8) - 9.1) < 0.1);
});

test("拍攝日素材量：200Mbps 每天 2 小時 = 180GB；3 天 3 份 = 1620GB；256GB 卡每天 1 張", () => {
  const r = shootStorage({ mbps: 200, hoursPerDay: 2, days: 3, copies: 3, cardGB: 256 });
  assert.equal(r.dayGB, 180);
  assert.equal(r.allCopiesGB, 1620);
  assert.equal(r.cardsPerDay, 1);
  assert.equal(shootStorage({ mbps: 200, hoursPerDay: 2, days: 3, copies: 3, cardGB: 128 }).cardsPerDay, 2);
});

test("拍攝範圍：全片幅 50mm 在 5 公尺處水平拍到 3.6 公尺", () => {
  const h = fieldOfView(50, 36, 24).h;
  assert.ok(Math.abs(frameSizeAt(h, 5) - 3.6) < 0.001);
});

test("變形鏡頭：4:3 加 2 倍 = 2.67:1；16:9 加 1.33 倍 ≈ 2.36:1", () => {
  assert.ok(Math.abs(desqueezedRatio(4, 3, 2) - 2.667) < 0.001);
  assert.ok(Math.abs(desqueezedRatio(16, 9, 1.33) - 2.364) < 0.001);
});

test("色溫：5600K = 178.6 mired；5600K 換 3200K 位移 +133.9", () => {
  assert.ok(Math.abs(mired(5600) - 178.57) < 0.01);
  assert.ok(Math.abs(miredShift(5600, 3200) - 133.93) < 0.01);
});

test("照度：2.5 lux = EV 0；10.764 lux = 1 呎燭光", () => {
  assert.equal(luxToEV(2.5), 0);
  assert.ok(Math.abs(luxToFc(10.7639) - 1) < 1e-9);
});

test("時間碼：24fps 1 小時 = 86400 格；29.97 DF 1 小時 = 107892 格、NDF = 108000 格", () => {
  const r = (id) => TC_RATES.find((x) => x.id === id);
  assert.equal(tcToFrames("01:00:00:00", r("24")), 86400);
  assert.equal(tcToFrames("01:00:00;00", r("29.97df")), 107892);
  assert.equal(tcToFrames("01:00:00:00", r("29.97")), 108000);
  assert.equal(framesToTc(107892, r("29.97df")), "01:00:00;00");
  assert.equal(framesToTc(tcToFrames("00:00:59;29", r("29.97df")) + 1, r("29.97df")), "00:01:00;02");
  assert.equal(tcToFrames("00:01:00;00", r("29.97df")), null); // 遺漏格式沒有這個時間碼
  assert.equal(tcToFrames("00:00:00:24", r("24")), null);
});
