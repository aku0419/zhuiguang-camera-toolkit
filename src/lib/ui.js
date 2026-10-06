// 工具頁共用的小功能（在瀏覽器執行）

// 快速選項按鈕：按了會把數字填進輸入框；輸入框改了，對應按鈕會亮起
export function bindChips(group, input, onChange) {
  const chips = [...group.querySelectorAll("[data-v]")];
  const sync = () => {
    for (const c of chips) c.setAttribute("aria-pressed", String(Number(c.dataset.v) === Number(input.value)));
  };
  for (const c of chips) {
    c.addEventListener("click", () => {
      input.value = c.dataset.v;
      sync();
      onChange();
    });
  }
  input.addEventListener("input", () => { sync(); onChange(); });
  sync();
}

export function num(input) {
  const v = parseFloat(String(input.value).replace(",", "."));
  return isFinite(v) ? v : NaN;
}

// 從網址帶入初始值，例如 ?fps=24&angle=180
export function fromQuery(map) {
  const q = new URLSearchParams(location.search);
  for (const [key, input] of Object.entries(map)) {
    const v = q.get(key);
    if (v != null && v !== "" && isFinite(Number(v))) input.value = v;
  }
}

// 讀取工具頁內嵌的相機資料，並依網址 ?camera= 預先選好
export function cameraPicker(onChange) {
  const sel = document.getElementById("cam");
  const data = JSON.parse(document.getElementById("cam-data")?.textContent || "[]");
  if (!sel) return () => null;
  const get = () => data.find((c) => c.slug === sel.value) || null;
  const slug = new URLSearchParams(location.search).get("camera");
  if (slug && data.some((c) => c.slug === slug)) sel.value = slug;
  sel.addEventListener("change", () => {
    const u = new URL(location.href);
    if (sel.value) u.searchParams.set("camera", sel.value); else u.searchParams.delete("camera");
    history.replaceState(null, "", u);
    onChange(get());
  });
  return get;
}
