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
