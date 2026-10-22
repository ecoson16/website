<script setup lang="ts">
import type { DefaultCSS } from "@/constants/customization.ts";
import { computed, type UnwrapRef } from "vue";
import { useDebounceFn } from "@vueuse/core";

const {
  styles,
  background,
  modifyStyles,
  resetStyles,
  highlight,
} = defineProps<{
  "styles"      : typeof DefaultCSS;
  "background"  : string;
  "modifyStyles": (newStyles: typeof DefaultCSS) => void;
  "resetStyles" : () => void;
  "highlight"   : string;
}>();

const styleResetButtons = computed(() => {
  return [
    { "selector": "QToolButton", "value": styles["QToolButton"].border },
    { "selector": "QPushButton", "value": styles["QPushButton"].border },
    { "selector": "QTabBar::tab", "value": styles["QTabBar::tab"].border },
  ] as const;
});
const colorEntries = [
  ["QToolButton", "QToolButton:pressed"],
  ["QPushButton", "QPushButton"],
  ["QTabBar::tab", "QTabBar::tab:selected"],
] as const;
const numberRangeInputs = computed(() => {
  return [
    {
      "selector": "QTabBar::tab",
      "property": "margin-right",
      "value"   : styles["QTabBar::tab"]["margin-right"],
      "check"   : styles["QTabBar::tab"].border,
      "text"    : "gap between",
    },
    {
      "selector": "QTabBar::tab",
      "property": "padding",
      "value"   : styles["QTabBar::tab"]["padding"],
      "check"   : styles["QTabBar::tab"].border,
      "text"    : "padding",
    },
  ] as const;
});

const handleColorInput = useDebounceFn(({ target }: { "target": unknown }) => {
  const data = target as Partial<{ "name": typeof colorEntries[number][1]; "value": string }>;

  if (!data?.name || !data?.value) {
    return;
  }

  // holy fuck, i'm completely confused at this point
  switch (data.name) {
    case "QToolButton:pressed": {
      modifyStyles({
        ...styles,
        "QToolButton:hover": {
          ...styles["QToolButton:hover"],
          "background-color": data.value + "4B",
        },
        "QToolButton:pressed": {
          ...styles["QToolButton:pressed"],
          "background-color": data.value + "32",
        },
        "QToolButton:on": {
          ...styles["QToolButton:on"],
          "background-color": data.value + "32",
        },
      });

      break;
    }
    case "QPushButton": {
      modifyStyles({
        ...styles,
        "QPushButton": {
          ...styles["QPushButton"],
          "background-color": data.value + "19",
        },
        "QPushButton:hover": {
          ...styles["QPushButton:hover"],
          "background-color": data.value + "4B",
        },
        "QPushButton:pressed": {
          ...styles["QPushButton:pressed"],
          "background-color": data.value + "32",
        },
      });

      break;
    }
    case "QTabBar::tab:selected": {
      modifyStyles({
        ...styles,
        "QTabBar::tab:selected": {
          ...styles["QTabBar::tab:selected"],
          "background-color": data.value + "32",
        },
        "QTabBar::tab:hover": {
          ...styles["QTabBar::tab:hover"],
          "background-color": data.value + "4B",
        },
      });

      break;
    }
  }
}, 300);
const handleNumberChange = ({ target }: { "target": unknown }) => {
  const data = target as Partial<{ "name": string; "value": string }>;

  if (!data?.name || !data?.value) {
    return;
  }

  const selector = data.name.split("__")[0] as "QTabBar::tab";
  const property = data.name.split("__")[1];

  modifyStyles({
    ...styles,
    [selector]: {
      ...styles[selector],
      [property]: Number(data.value),
    },
  });
};

function selectAccent() {
  // ???
  modifyStyles({
    ...styles,
    "QToolButton:hover": {
      ...styles["QToolButton:hover"],
      "background-color": highlight + "4B",
    },
    "QToolButton:pressed": {
      ...styles["QToolButton:pressed"],
      "background-color": highlight + "32",
    },
    "QToolButton:on": {
      ...styles["QToolButton:on"],
      "background-color": highlight + "32",
    },
    "QPushButton": {
      ...styles["QPushButton"],
      "background-color": highlight + "19",
    },
    "QPushButton:hover": {
      ...styles["QPushButton:hover"],
      "background-color": highlight + "4B",
    },
    "QPushButton:pressed": {
      ...styles["QPushButton:pressed"],
      "background-color": highlight + "32",
    },
    "QTabBar::tab:selected": {
      ...styles["QTabBar::tab:selected"],
      "background-color": highlight + "32",
    },
    "QTabBar::tab:hover": {
      ...styles["QTabBar::tab:hover"],
      "background-color": highlight + "4B",
    },
  });
}

// Unwraps 'ComputedRef<T>' and gets a constant array
function toggleButton(selector: UnwrapRef<typeof styleResetButtons>[number]["selector"]) {
  modifyStyles({
    ...styles,
    [selector]: {
      ...styles[selector],
      "border" : !styles[selector].border,
      "padding": styles[selector].border ? 0 : 4,
    },
  });
}

function getColorInputValue(value: false | string): string {
  return typeof value === "string" && (/^#[\da-f]{6}(?:[\da-f]{2})?$/i).test(value)
    ? value.slice(0, 7)
    : highlight;
}

function getPushButtonBackground(inputBackground: false | string, borderless: boolean) {
  if (borderless && (inputBackground === false)) {
    return "transparent";
  }

  if (borderless && inputBackground) {
    return inputBackground;
  }

  return "linear-gradient(to bottom, #ffffff22, #ffffff11)";
}
</script>

<template>
  <div class="grid cols-1 w-full gap-2 sm:cols-2">
    <button @click="resetStyles" class="w-fit flex flex-nowrap items-center gap-4 rounded-md py-2 pl-2 pr-3 transition-[background-color] hover:bg-catppuccin-800">
      <span class="i-lucide-rotate-ccw block size-6 text-gray-400" />
      <span class="block text-gray-400 font-medium">
      Reset Styles
    </span>
    </button>
    <button @click="selectAccent" class="w-fit flex flex-nowrap items-center gap-4 rounded-md py-2 pl-2 pr-3 transition-[background-color] hover:bg-catppuccin-800">
      <span class="i-lucide-palette block size-6 text-gray-400" />
      <span class="block text-gray-400 font-medium">
      Use Accent Color
    </span>
    </button>
    <div
      v-for="styleResetButton in styleResetButtons"
      :key="styleResetButton.selector"
      class="flex flex-nowrap items-center p-2"
    >
      <input
        type="checkbox"
        :id="`${styleResetButton.selector}Border`"
        :checked="styleResetButton.value"
        @input="() => toggleButton(styleResetButton.selector)"
        :class="[
        'shrink-0 size-6 appearance-none rounded-md cursor-pointer',
        styleResetButton.value
          ? 'bg-white'
          : 'bg-catppuccin-700',
      ]"
      />
      <label :for="`${styleResetButton.selector}Border`" class="cursor-pointer pl-4 text-gray-400">
        <span>Customize</span>
        <span>{{ " " }}</span>
        <span class="text-white">{{ styleResetButton.selector }}</span>
      </label>
    </div>
    <template
      v-for="[key, name] in colorEntries"
      :key="name"
    >
      <div
        v-if="styles[key].border"
        class="flex flex-nowrap items-center"
      >
        <input
          class="size-10 shrink-0 cursor-pointer rounded-md bg-catppuccin-800 p-2"
          type="color"
          @input="handleColorInput"
          :id="`color-${name}`"
          :name="name"
          :value="getColorInputValue(styles[name]['background-color'])"
        />
        <label :for="`color-${name}`" class="cursor-pointer pl-2 text-gray-400 font-medium">
          <span class="text-white">{{ key }}</span>
          <span>{{ " " }}</span>
          <span>& its states</span>
        </label>
      </div>
    </template>
    <template
      v-for="numberInput in numberRangeInputs"
      :key="numberInput.selector"
    >
      <div v-if="numberInput.check" class="flex flex-nowrap items-center">
        <input
          type="number"
          @input="handleNumberChange"
          min="0"
          max="16"
          :id="`${numberInput.selector}__${numberInput.property}`"
          :name="`${numberInput.selector}__${numberInput.property}`"
          :value="numberInput.value"
          class="w-16 rounded-md bg-catppuccin-700 p-2 text-xs focus:outline-none"
        />
        <label :for="`${numberInput.selector}__${numberInput.property}`" class="cursor-pointer pl-2 text-gray-400 font-medium">
          <span class="text-white">
            {{ numberInput.selector }}
          </span>
          <span>{{ " " }}</span>
          <span>{{ numberInput.text }}</span>
        </label>
      </div>
    </template>
  </div>
  <div
    class="flex flex-wrap gap-2 border border-[#7a7a7a] p-2"
    :style="{ background: background, }"
  >
    <div
      v-for="pushButton in ['I am a QPushButton!', 'Close', 'Help']"
      :key="pushButton"
      class="w-fit flex border text-sm leading-none"
      :style="{
        background  : getPushButtonBackground(
          styles['QPushButton:pressed']['background-color'],
          styles.QPushButton.border,
        ),
        borderColor : styles.QPushButton.border ? 'transparent' : '#ffffff27',
        borderRadius: styles.QPushButton.border ? 0 : '2px',
        padding     : styles.QPushButton.padding === false
          ? '2px 4px'
          : `${styles.QPushButton.padding}px`,
      }"
    >
      {{ pushButton }}
    </div>
  </div>
</template>