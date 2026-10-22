<script setup lang="ts">
import ThemeGenerator from "@/components/themes/ThemeGenerator.vue";

document.title = "Freesm Theme Maker";
</script>

<template>
  <main class="min-h-svh bg-catppuccin-950 text-white">
    <header class="mx-auto max-w-240 px-4 pt-8">
      <h1 class="text-3xl font-bold sm:text-4xl">Freesm Theme Maker</h1>
      <p class="mt-2 text-gray-400 sm:text-lg">
        Customize launcher colors and controls, preview your changes, and export a theme.
      </p>
    </header>
    <ThemeGenerator />
    <footer class="mx-auto max-w-240 px-4 pb-8 text-sm text-gray-500">
      Theme maker extracted from the Freesm Launcher website. Licensed under GPL-3.0.
    </footer>
  </main>
</template>
