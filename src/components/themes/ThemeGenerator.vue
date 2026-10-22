<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from "vue";
import { CustomizationTabs, DefaultColors, DefaultCSS } from "@/constants/customization.ts";
import { ColorPresets } from "@/constants/color-presets.ts";
import ColorGenerator from "@/components/themes/ColorGenerator.vue";
import GeneralStyler from "@/components/themes/GeneralStyler.vue";
import ButtonsStyler from "@/components/themes/ButtonsStyler.vue";
import LauncherThemed from "@/components/themes/windows/LauncherThemed.vue";
import SettingsThemed from "@/components/themes/windows/SettingsThemed.vue";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { transformToCss } from "@/lib/helpers/transform-to-css.ts";
import { readImportedColors } from "@/lib/helpers/read-imported-colors.ts";
import { ThemeGeneratorKeys } from "@/constants/application.ts";
import { readThemeGeneratorColors } from "@/lib/helpers/read-theme-generator-colors.ts";
import { readThemeGeneratorStyles } from "@/lib/helpers/read-theme-generator-styles.ts";
import { getContrastRatio } from "@/lib/helpers/color-contrast.ts";
import { sanitizeExportName } from "@/lib/helpers/sanitize-export-name.ts";
import {
  isRecord,
  sanitizeColorOverrides,
  sanitizeThemeStyles,
} from "@/lib/helpers/theme-validation.ts";
import Highlighter from "@/components/themes/code/Highlighter.vue";

type SavedTheme = {
  "name"  : string;
  "colors": typeof DefaultColors;
  "styles": typeof DefaultCSS;
};

const MAX_SAVED_THEMES = 30;

function readThemeName(): string {
  try {
    const name = localStorage.getItem(ThemeGeneratorKeys.Name)?.trim();

    return name ? name.slice(0, 64) : "My Custom Theme";
  } catch {
    return "My Custom Theme";
  }
}

function parseSavedTheme(value: unknown): SavedTheme | null {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim()) {
    return null;
  }

  const colorOverrides = sanitizeColorOverrides(value.colors);

  if (!colorOverrides) {
    return null;
  }

  return {
    "name"  : value.name.trim().slice(0, 64),
    "colors": { ...DefaultColors, ...colorOverrides },
    "styles": sanitizeThemeStyles(value.styles),
  };
}

function readSavedThemes(): SavedTheme[] {
  let stored: string | null;

  try {
    stored = localStorage.getItem(ThemeGeneratorKeys.SavedThemes);
  } catch {
    return [];
  }

  if (!stored) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(stored) as unknown;
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const results: SavedTheme[] = [];
  const names = (new Set<string>);

  for (const entry of parsed) {
    const theme = parseSavedTheme(entry);
    const normalizedName = theme?.name.toLocaleLowerCase();

    if (!theme || !normalizedName || names.has(normalizedName)) {
      continue;
    }

    results.push(theme);
    names.add(normalizedName);

    if (results.length >= MAX_SAVED_THEMES) {
      break;
    }
  }

  return results;
}

function persistLocalStorage(key: string, value: unknown) {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    if (serialized !== undefined) {
      localStorage.setItem(key, serialized);
    }
  } catch (error: unknown) {
    console.warn("Theme settings could not be saved in browser storage.", error);
  }
}

const selected = ref<typeof CustomizationTabs[number]["Key"]>("colors");
const codeView = ref<boolean>(false);
const themeName = ref(readThemeName());
const colors = ref<typeof DefaultColors>(readThemeGeneratorColors());
const styles = shallowRef<typeof DefaultCSS>(readThemeGeneratorStyles());
const selectedPreset = ref("");
const savedThemes = ref<SavedTheme[]>(readSavedThemes());
const selectedSavedTheme = ref("");
const selectedSavedThemeExists = computed(() => savedThemes.value.some(theme => theme.name === selectedSavedTheme.value),
);

const contrastChecks = computed(() => [
  {
    "name"      : "Main text",
    "foreground": colors.value.Text,
    "background": colors.value.Window,
    "sample"    : "Readable body text",
    "ratio"     : getContrastRatio(colors.value.Text, colors.value.Window),
  },
  {
    "name"      : "Highlighted text",
    "foreground": colors.value.HighlightedText,
    "background": colors.value.Highlight,
    "sample"    : "Selected text",
    "ratio"     : getContrastRatio(colors.value.HighlightedText, colors.value.Highlight),
  },
]);

const currentCode = computed(() => {
  const computedStyles = transformToCss({ "theme": styles.value, "highlight": colors.value.Highlight });

  return {
    "key" : 0,
    "data": [
      {
        "lang" : "json",
        "title": "theme.json",
        "code" : JSON.stringify({
          "colors": {
            ...colors.value,
            "fadeAmount": 0.5,
            "fadeColor" : "#000000",
          },
          "name"   : themeName.value.trim() || "My Custom Theme",
          "widgets": "Fusion",
        }, null, 2),
      },
      {
        "lang" : "css",
        "title": "themeStyle.css",
        "code" : computedStyles.changed ? computedStyles.result : "/* You didn't change any CSS styles */",
      },
    ],
  };
});

function selectColor({
  key,
  color,
}: {
  "key"  : keyof typeof DefaultColors;
  "color": typeof DefaultColors[keyof typeof DefaultColors];
}) {
  colors.value[key] = color;
  selectedPreset.value = "";
}

function applyColorPreset() {
  const preset = ColorPresets.find(({ name }) => name === selectedPreset.value);

  if (preset) {
    colors.value = { ...preset.colors };
  }
}

function resetColors() {
  if (!confirm("Are you sure about resetting current colors?")) {
    return;
  }

  colors.value = { ...DefaultColors };
  selectedPreset.value = "";
}

function resetStyles() {
  if (!confirm("Are you sure about resetting all CSS styles (not colors)?")) {
    return;
  }

  styles.value = sanitizeThemeStyles(DefaultCSS);
}

function saveCurrentTheme() {
  const name = (themeName.value.trim() || "My Custom Theme").slice(0, 64);
  const normalizedName = name.toLocaleLowerCase();
  const alreadyExists = savedThemes.value.some(theme => theme.name.toLocaleLowerCase() === normalizedName,
  );

  if (alreadyExists && !confirm("Overwrite the saved theme \"" + name + "\"?")) {
    return;
  }

  const snapshot: SavedTheme = {
    name,
    "colors": { ...colors.value },
    "styles": sanitizeThemeStyles(styles.value),
  };

  savedThemes.value = [
    snapshot,
    ...savedThemes.value.filter(theme => theme.name.toLocaleLowerCase() !== normalizedName),
  ].slice(0, MAX_SAVED_THEMES);
  themeName.value = name;
  selectedSavedTheme.value = name;
}

function loadSavedTheme() {
  const theme = savedThemes.value.find(item => item.name === selectedSavedTheme.value);

  if (!theme) {
    return;
  }

  themeName.value = theme.name;
  colors.value = { ...theme.colors };
  styles.value = sanitizeThemeStyles(theme.styles);
  selectedPreset.value = "";
}

function deleteSavedTheme() {
  const theme = savedThemes.value.find(item => item.name === selectedSavedTheme.value);

  if (!theme || !confirm("Delete the saved theme \"" + theme.name + "\"?")) {
    return;
  }

  savedThemes.value = savedThemes.value.filter(item => item.name !== theme.name);
  selectedSavedTheme.value = "";
}

function downloadTheme() {
  const zip = new JSZip();
  const folderName = sanitizeExportName(themeName.value);
  const folder = zip.folder(folderName);

  if (!folder) {
    console.error("Couldn't create a folder for the theme zip");

    return;
  }

  folder.file("theme.json", currentCode.value.data[0].code);
  folder.file("themeStyle.css", currentCode.value.data[1].code);

  void zip.generateAsync({ "type": "blob" })
    .then(content => saveAs(content, folderName + ".zip"))
    .catch((error: unknown) => {
      console.error("Couldn't export the theme ZIP:", error);
      alert("The theme ZIP could not be created. Please try again.");
    });
}

function toggleCodeView() {
  codeView.value = !codeView.value;
}

async function handleImport(event: Event) {
  const importedColors = await readImportedColors({ event });

  if (importedColors === 0) {
    return;
  }

  colors.value = {
    ...colors.value,
    ...importedColors,
  };
  selectedPreset.value = "";
}

function modifyStyles(newStyles: typeof DefaultCSS) {
  styles.value = sanitizeThemeStyles(newStyles);
}

watchEffect(() => {
  persistLocalStorage(ThemeGeneratorKeys.Colors, colors.value);
  persistLocalStorage(ThemeGeneratorKeys.Styles, styles.value);
  persistLocalStorage(ThemeGeneratorKeys.Name, themeName.value);
  persistLocalStorage(ThemeGeneratorKeys.SavedThemes, savedThemes.value);
});
</script>

<template>
  <div class="mx-auto my-12 max-w-240 flex flex-col gap-4 px-4">
    <div
      class="relative w-full flex flex-wrap gap-0 overflow-x-auto rounded-md bg-catppuccin-900 sm:flex-nowrap"
    >
      <div class="flex shrink-0 gap-0 sm:flex-col">
        <button
          @click="selected = tab.Key"
          v-for="tab in CustomizationTabs"
          :key="tab.Key"
          :aria-label="tab.Name"
          :title="tab.Name"
          class="group px-4 py-2 first:pt-4"
        >
          <span
            :class="[
              'grid size-10 place-items-center rounded-md transition-[background-color]',
              'group-hover:bg-catppuccin-800',
              selected === tab.Key
                ? 'bg-catppuccin-800'
                : 'bg-catppuccin-900',
            ]"
          >
            <span :class="['block size-6', tab.Icon]" />
          </span>
        </button>
      </div>
      <div class="w-full flex flex-col gap-4 py-4 pl-4 pr-4 sm:pl-0">
        <div class="flex flex-wrap gap-4">
          <button
            v-for="item in [
              { 'name': 'Download', 'icon': 'i-lucide-download', 'action': downloadTheme },
              { 'name': 'Show JSON & CSS', 'icon': 'i-lucide-braces', 'action': toggleCodeView },
            ]"
            :key="item.name"
            @click="item.action"
            class="w-fit flex flex-nowrap items-center gap-4 rounded-md p-2 transition-[background-color] hover:bg-catppuccin-800"
          >
            <span :class="[item.icon, 'block size-6']" />
            <span class="block text-white font-medium">
              {{ item.name }}
            </span>
          </button>
          <label for="import-colors" class="w-fit flex flex-nowrap cursor-pointer items-center gap-4 rounded-md p-2 transition-[background-color] hover:bg-catppuccin-800">
            <span class="i-lucide-paintbrush block size-6" />
            <span class="block text-white font-medium">
              Import Colors
            </span>
          </label>
          <input
            id="import-colors"
            type="file"
            accept="application/json,.json"
            @change="handleImport"
            class="hidden"
          />
        </div>

        <div class="grid cols-1 gap-3 sm:cols-2">
          <label class="flex flex-col gap-1 text-sm text-gray-400">
            <span>Theme name</span>
            <input
              v-model="themeName"
              maxlength="64"
              aria-label="Theme name"
              class="border border-[#45475a] rounded-md bg-catppuccin-800 px-3 py-2 text-white focus:outline-none"
              placeholder="My Custom Theme"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-gray-400">
            <span>Color preset</span>
            <select
              v-model="selectedPreset"
              @change="applyColorPreset"
              class="border border-[#45475a] rounded-md bg-catppuccin-800 px-3 py-2 text-white focus:outline-none"
            >
              <option value="">Choose a palette…</option>
              <option v-for="preset in ColorPresets" :key="preset.name" :value="preset.name">
                {{ preset.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="flex flex-wrap items-center gap-2 border border-[#45475a] rounded-md p-3">
          <button
            @click="saveCurrentTheme"
            class="rounded-md bg-catppuccin-800 px-3 py-2 text-sm text-white transition-[background-color] hover:bg-catppuccin-700"
          >
            Save current theme
          </button>
          <select
            v-model="selectedSavedTheme"
            aria-label="Saved themes"
            class="min-w-40 border border-[#45475a] rounded-md bg-catppuccin-800 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="">Saved themes ({{ savedThemes.length }})</option>
            <option v-for="theme in savedThemes" :key="theme.name" :value="theme.name">
              {{ theme.name }}
            </option>
          </select>
          <button
            @click="loadSavedTheme"
            :disabled="!selectedSavedThemeExists"
            class="rounded-md bg-catppuccin-800 px-3 py-2 text-sm text-white transition-[background-color] disabled:cursor-not-allowed hover:bg-catppuccin-700 disabled:opacity-50"
          >
            Load
          </button>
          <button
            @click="deleteSavedTheme"
            :disabled="!selectedSavedThemeExists"
            class="rounded-md bg-catppuccin-800 px-3 py-2 text-sm text-white transition-[background-color] disabled:cursor-not-allowed hover:bg-catppuccin-700 disabled:opacity-50"
          >
            Delete
          </button>
          <span class="text-xs text-gray-400">Saved in this browser only · {{ MAX_SAVED_THEMES }} max</span>
        </div>

        <section class="flex flex-col gap-3 border border-[#45475a] rounded-md p-3" aria-labelledby="contrast-check-title">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 id="contrast-check-title" class="text-sm text-white font-semibold">Contrast check</h2>
            <span class="text-xs text-gray-400">WCAG AA normal text target: 4.5:1</span>
          </div>
          <div class="grid cols-1 gap-3 sm:cols-2">
            <div
              v-for="contrast in contrastChecks"
              :key="contrast.name"
              class="flex flex-col gap-2 rounded-md bg-catppuccin-900 p-3"
            >
              <div class="flex items-center justify-between gap-2 text-sm">
                <span class="text-gray-300">{{ contrast.name }}</span>
                <strong class="text-white tabular-nums">
                  {{ contrast.ratio === null ? "N/A" : contrast.ratio.toFixed(2) + ":1" }}
                </strong>
              </div>
              <p
                class="rounded px-2 py-3 text-sm"
                :style="{ color: contrast.foreground, background: contrast.background }"
              >
                {{ contrast.sample }}
              </p>
              <p
                :class="[
                  'text-xs',
                  contrast.ratio !== null && contrast.ratio >= 4.5
                    ? 'text-green-400'
                    : 'text-amber-400',
                ]"
              >
                {{
                  contrast.ratio === null
                    ? "Use valid six-digit hex colors to calculate contrast."
                    : contrast.ratio >= 4.5
                      ? "Passes the WCAG AA normal-text target."
                      : "Below the WCAG AA normal-text target."
                }}
              </p>
            </div>
          </div>
        </section>

        <Highlighter v-if="codeView" :code="currentCode" />
        <ColorGenerator
          v-if="selected === 'colors'"
          :colors="colors"
          :set-color="selectColor"
          :reset-colors="resetColors"
        />
        <GeneralStyler
          v-else-if="selected === 'general'"
          :styles="styles"
          :modify-styles="modifyStyles"
          :reset-styles="resetStyles"
        />
        <ButtonsStyler
          v-else
          :styles="styles"
          :background="colors.Window"
          :modify-styles="modifyStyles"
          :reset-styles="resetStyles"
          :highlight="colors.Highlight"
        />
        <LauncherThemed
          :highlight="colors.Highlight"
          :highlighted-text="colors.HighlightedText"
          :button-text="colors.ButtonText"
          :background="colors.Window"
          :background-text="colors.WindowText"
          :text="colors.Text"
          :base="colors.Base"
          :tooltip-base="colors.ToolTipBase"
          :tooltip-text="colors.ToolTipText"
          :borderless="styles.LayoutBorder"
          :handlers="styles['QObject::handle']"
          :button-borderless="styles['QToolButton'].border"
          :button-padding="styles['QToolButton'].padding"
          :button-background="styles['QToolButton:pressed']['background-color']"
        />
        <SettingsThemed
          :highlight="colors.Highlight"
          :highlight-text="colors.HighlightedText"
          :background="colors.Window"
          :button-color="colors.Button"
          :background-text="colors.WindowText"
          :text="colors.Text"
          :base="colors.Base"
          :tab-widget-pane="styles['QTabWidget::pane'].border"
          :tab-background="styles['QTabBar::tab:selected']['background-color']"
          :tab-borderless="styles['QTabBar::tab'].border"
          :tab-padding="styles['QTabBar::tab'].padding"
          :tab-gap="styles['QTabBar::tab']['margin-right']"
        />
      </div>
    </div>
  </div>
</template>
