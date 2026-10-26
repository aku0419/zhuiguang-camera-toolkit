// 用計畫書裡的例子檢查算式。執行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shutterFromAngle, frameRate, equivalentFocal, FORMATS, cropFactorFromSize,
  capacityGB, recordSeconds, toMbps, fmtDuration, fmtSize, neededMBps, sdVideoClass,
  ndInfo, parseShutter, fmtShutter, aspectOf, cropToRatio, depthOfField, stopsBetween,
  fieldOfView, framingBox, sunnyAperture, ndStopsNeeded, shootStorage,
  frameSizeAt, desqueezedRatio, mired, miredShift, luxToEV, luxToFc, TC_RATES, tcToFrames, framesToTc,
  filmRuntime, filmFeetFor, filmFeetPerMinute, fmtMinSec,
  eiAdjusted, eiStopsBetween, apertureForEI, filmCost, sunPosition, sunTimes, fmtClock, compassName,
} from "../src/lib/calc.js";
import { FILM_FORMATS } from "../src/data/film-formats.js";
import { summarize, pageLabel } from "../src/lib/online-summary.js";

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

test("線上人數：整理成總人數與各頁人數，頁面名稱對應", () => {
  const st = { a: [{ p: "首頁" }], b: [{ p: "鏡頭" }], c: [{ p: "鏡頭" }], d: [] };
  const r = summarize(st);
  assert.equal(r.n, 3);
  assert.deepEqual(r.by[0], ["鏡頭", 2]);
  assert.equal(summarize({}).n, 0);
  assert.equal(pageLabel("/"), "首頁");
  assert.equal(pageLabel("/lenses/sony-fe-24-70mm-f2-8-gm-ii/"), "鏡頭");
  assert.equal(pageLabel("/tools/timecode/"), "工具");
  assert.equal(pageLabel("/xyz/"), "其他");
});

test("底片長度：每一種片幅都要跟 Kodak 公布的運行時間一致", () => {
  const want = {
    "35-4perf": "4 分 26 秒", "35-3perf": "5 分 55 秒", "35-2perf": "8 分 53 秒", "s16": "11 分 06 秒",
    "35-8perf": "2 分 13 秒", "65-5perf": "8 分 53 秒", "65-15perf": "2 分 57 秒",
  };
  for (const f of FILM_FORMATS) {
    if (!f.kodak) continue;
    const t = filmRuntime(f.kodak.feet, f.kodak.fps, f.framesPerFoot);
    if (f.id.startsWith("s8")) continue;
    assert.equal(fmtMinSec(t), want[f.id], f.id);
  }
  const s8 = FILM_FORMATS.find((f) => f.id === "s8-regular");
  assert.equal(fmtMinSec(filmRuntime(50, 18, s8.framesPerFoot)), "3 分 20 秒");
  assert.equal(fmtMinSec(filmRuntime(50, 24, s8.framesPerFoot)), "2 分 30 秒");
});

test("底片長度：反推需要的呎數與每分鐘用量", () => {
  assert.ok(Math.abs(filmFeetFor(60, 24, 16) - 90) < 1e-9);       // 35mm 4 孔 1 分鐘 = 90 呎
  assert.ok(Math.abs(filmFeetPerMinute(24, 40) - 36) < 1e-9);     // 16mm 1 分鐘 = 36 呎
  assert.equal(filmRuntime(0, 24, 16), null);
});

test("底片曝光補償：500T 日光加 85 濾鏡 EI 320 約少 0.64 級；加曝 1 級 EI 減半；f/5.6 改 EI 320 要開到約 f/4.5", () => {
  assert.ok(Math.abs(eiStopsBetween(500, 320) - 0.644) < 0.001);
  assert.equal(eiAdjusted(500, 1), 250);
  assert.equal(eiAdjusted(500, -1), 1000);
  assert.ok(Math.abs(apertureForEI(5.6, 500, 320) - 4.48) < 0.01);
  assert.equal(apertureForEI(5.6, 500, 500), 5.6);
});

test("底片成本粗估：成片 10 分鐘、拍攝比 5:1、35mm 4 孔 24fps → 4,500 呎、12 卷 400 呎", () => {
  const r = filmCost({ finalSeconds: 600, ratio: 5, fps: 24, framesPerFoot: 16, rollFeet: 400, rollPrice: 100, procPerFoot: 1, scanPerFoot: 2, scanPct: 50 });
  assert.equal(r.shotSeconds, 3000);
  assert.equal(r.feet, 4500);
  assert.equal(r.rolls, 12);
  assert.equal(r.stockCost, 1200);
  assert.equal(r.procCost, 4500);
  assert.equal(r.scanCost, 4500);
  assert.equal(r.total, 10200);
  assert.equal(r.perFinalMinute, 1020);
  assert.equal(filmCost({ finalSeconds: 600, ratio: 0.5, fps: 24, framesPerFoot: 16, rollFeet: 400, rollPrice: 100 }), null);
  assert.ok(Math.abs(filmCost({ finalSeconds: 600, ratio: 1, fps: 24, framesPerFoot: 16, rollFeet: 400, rollPrice: 100, wastePct: 10 }).feet - 990) < 1e-6); // 900 呎 + 10% 餘裕
});

test("太陽軌跡：台北 2026-10-26 日出約 05:57、日落約 17:17，日出方位約 103°、日落約 257°", () => {
  const t = sunTimes(2026, 10, 26, 25.0330, 121.5654, 8);
  const mins = (ms) => { const [h, m] = fmtClock(ms, 8).split(":").map(Number); return h * 60 + m; };
  assert.ok(Math.abs(mins(t.sunrise) - (5 * 60 + 57)) <= 2);
  assert.ok(Math.abs(mins(t.sunset) - (17 * 60 + 17)) <= 2);
  assert.ok(Math.abs(sunPosition(t.sunrise, 25.0330, 121.5654).azimuth - 103.2) < 1);
  assert.ok(Math.abs(sunPosition(t.sunset, 25.0330, 121.5654).azimuth - 256.6) < 1);
  assert.ok(t.blueMorningStart < t.goldenMorningStart && t.goldenMorningStart < t.sunrise && t.sunrise < t.goldenMorningEnd);
  assert.ok(t.goldenEveningStart < t.sunset && t.sunset < t.goldenEveningEnd && t.blueEveningEnd > t.blueEveningStart);
});

test("太陽軌跡：赤道春分正午太陽接近天頂；北極圈外夏至永晝", () => {
  const t = sunTimes(2026, 3, 20, 0, 0, 0);
  assert.ok(t.noonAltitude > 88);
  const p = sunTimes(2026, 6, 21, 78, 15, 2);
  assert.equal(p.alwaysUp, true);
  assert.equal(p.sunrise, null);
});

test("方位名稱與時間格式", () => {
  assert.equal(compassName(0), "北");
  assert.equal(compassName(103), "東南東");
  assert.equal(compassName(257), "西南西");
  assert.equal(fmtClock(Date.UTC(2026, 9, 26, 0, 0), 8), "08:00");
  assert.equal(fmtClock(null, 8), "—");
});

test("構圖取景：全片幅 50mm 在 24mm 手機鏡頭的畫面上佔多大", () => {
  const b = framingBox({ focalMm: 50, sensorW: 36, sensorH: 24, aspect: 1.5, phoneEq: 24, viewW: 1920, viewH: 1080 });
  assert.ok(Math.abs(b.w - 921.6) < 0.5);
  assert.ok(Math.abs(b.h - 614.4) < 0.5);
  assert.ok(Math.abs(b.hfov - 39.6) < 0.1);
  // 16:9 錄影只用到感光元件的一部分高度，寬度不變
  const c = framingBox({ focalMm: 50, sensorW: 36, sensorH: 24, aspect: 16 / 9, phoneEq: 24, viewW: 1920, viewH: 1080 });
  assert.ok(Math.abs(c.w - 921.6) < 0.5 && Math.abs(c.h - 518.4) < 0.5);
  // 焦段越長範圍越小；和手機鏡頭一樣的視角剛好填滿長邊
  const d = framingBox({ focalMm: 24, sensorW: 36, sensorH: 24, aspect: 1.5, phoneEq: 24, viewW: 1920, viewH: 1080 });
  assert.ok(Math.abs(d.w - 1920) < 1);
  assert.equal(framingBox({ focalMm: 0, sensorW: 36, sensorH: 24, aspect: 1.5, phoneEq: 24, viewW: 1, viewH: 1 }), null);
});
