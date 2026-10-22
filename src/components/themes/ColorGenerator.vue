<script setup lang="ts">
import { DefaultColors } from "@/constants/customization.ts";
import { computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

const { colors, setColor, resetColors } = defineProps<{
  "colors"  : typeof DefaultColors;
  "setColor": ({
    key,
    color,
  }: {
    "key"  : keyof typeof DefaultColors;
    "color": typeof DefaultColors[keyof typeof DefaultColors];
  }) => void;
  "resetColors": () => void;
}>();
const colorEntries = computed(() => Object.entries(colors));

const handleColorInput = useDebounceFn(({ target }: { "target": unknown }) => {
  const data = target as Partial<{ "name": keyof typeof DefaultColors; "value": string }>;

  setColor({
    "key"  : data?.name ?? "AlternateBase",
    "color": data?.value ?? "#000000",
  });
}, 300);
</script>

<template>
  <div class="grid cols-1 w-full gap-2 lg:cols-3 sm:cols-2">
    <button @click="resetColors" class="w-fit flex flex-nowrap items-center gap-4 rounded-md py-2 pl-2 pr-3 transition-[background-color] hover:bg-catppuccin-800">
      <span class="i-lucide-rotate-ccw block size-6 text-gray-400" />
      <span class="block text-gray-400 font-medium">
        Reset Colors
      </span>
    </button>
    <div
      v-for="[name, color] in colorEntries"
      :key="name"
      class="flex flex-nowrap items-center"
    >
      <input
        class="size-10 shrink-0 cursor-pointer rounded-md bg-catppuccin-800 p-2"
        type="color"
        @input="handleColorInput"
        :id="`color-${name}`"
        :name="name"
        :value="color"
      />
      <label :for="`color-${name}`" class="cursor-pointer pl-2 text-gray-400 font-medium">
        {{ name }}
      </label>
    </div>
  </div>
  <div class="grid cols-1 select-text gap-4 sm:cols-2">
    <div
      class="flex flex-col gap-2 border border-[#7a7a7a] p-2"
      :style="{ background: colors.Window, }"
    >
      <p
        class="text-sm leading-none"
        :style="{ color: colors.Link }"
      >
        I'm a link!
      </p>
      <p
        class="text-sm leading-none"
        :style="{ color: colors.Text }"
      >
        I'm a text!
      </p>
    </div>
    <div class="flex flex-col border border-[#7a7a7a]">
      <div
        class="w-full p-2 text-sm leading-none"
        :style="{
          background: colors.Base,
          color     : colors.Text,
        }"
      >
        日本語
      </div>
      <div
        class="w-full p-2 text-sm leading-none"
        :style="{
          background: colors.AlternateBase,
          color     : colors.Text,
        }"
      >
        Cute Engwish
      </div>
      <div
        class="w-full p-2 text-sm leading-none"
        :style="{
          background: colors.Highlight,
          color     : colors.HighlightedText,
        }"
      >
        Theme Preview
      </div>
    </div>
  </div>
</template>
