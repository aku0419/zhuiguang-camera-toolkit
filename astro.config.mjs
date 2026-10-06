import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://zhuiguang.riseatsun.com",
  trailingSlash: "always",
  integrations: [sitemap()],
});
