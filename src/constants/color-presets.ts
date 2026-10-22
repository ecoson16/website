import { DefaultColors } from "@/constants/customization.ts";

export type ColorPreset = {
  name: string;
  colors: typeof DefaultColors;
};

export const ColorPresets: ColorPreset[] = [
  {
    name: "Catppuccin Mocha",
    colors: {
      ...DefaultColors,
      "AlternateBase": "#313244",
      "Base": "#1e1e2e",
      "BrightText": "#f9e2af",
      "Button": "#45475a",
      "ButtonText": "#cdd6f4",
      "Highlight": "#cba6f7",
      "HighlightedText": "#1e1e2e",
      "Link": "#89b4fa",
      "Text": "#cdd6f4",
      "ToolTipBase": "#181825",
      "ToolTipText": "#cdd6f4",
      "Window": "#1e1e2e",
      "WindowText": "#cdd6f4",
    },
  },
  {
    name: "Nord",
    colors: {
      ...DefaultColors,
      "AlternateBase": "#3b4252",
      "Base": "#2e3440",
      "BrightText": "#ebcb8b",
      "Button": "#434c5e",
      "ButtonText": "#eceff4",
      "Highlight": "#88c0d0",
      "HighlightedText": "#2e3440",
      "Link": "#81a1c1",
      "Text": "#eceff4",
      "ToolTipBase": "#242933",
      "ToolTipText": "#eceff4",
      "Window": "#2e3440",
      "WindowText": "#eceff4",
    },
  },
  {
    name: "Gruvbox Dark",
    colors: {
      ...DefaultColors,
      "AlternateBase": "#3c3836",
      "Base": "#282828",
      "BrightText": "#fabd2f",
      "Button": "#504945",
      "ButtonText": "#ebdbb2",
      "Highlight": "#b8bb26",
      "HighlightedText": "#282828",
      "Link": "#83a598",
      "Text": "#ebdbb2",
      "ToolTipBase": "#1d2021",
      "ToolTipText": "#ebdbb2",
      "Window": "#282828",
      "WindowText": "#ebdbb2",
    },
  },
  {
    name: "AMOLED",
    colors: {
      ...DefaultColors,
      "AlternateBase": "#111111",
      "Base": "#000000",
      "BrightText": "#ffe082",
      "Button": "#1a1a1a",
      "ButtonText": "#f5f5f5",
      "Highlight": "#1bd96a",
      "HighlightedText": "#000000",
      "Link": "#80cbc4",
      "Text": "#eeeeee",
      "ToolTipBase": "#121212",
      "ToolTipText": "#f5f5f5",
      "Window": "#000000",
      "WindowText": "#f5f5f5",
    },
  },
];
