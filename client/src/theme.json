import fs from "fs";
import path from "path";

export function themePlugin() {
  return {
    name: "custom-theme-plugin",
    config() {
      const themePath = path.resolve(__dirname, "../../theme.json");
      const theme = JSON.parse(fs.readFileSync(themePath, "utf-8"));
      return {
        define: {
          __THEME__: JSON.stringify(theme),
        },
      };
    },
  };
}
