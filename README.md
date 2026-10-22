# Freesm Theme Maker

A standalone theme editor extracted from the Freesm Launcher website. Customize launcher colors and supported Qt stylesheet controls, preview the result, and export a ZIP containing `theme.json` and `themeStyle.css`.

Features include starter palettes (Catppuccin Mocha, Nord, Gruvbox Dark, and AMOLED), named themes saved in your browser, live previews, color import, CSS/JSON inspection, and a WCAG AA contrast check for the main text color pairs.

Your current theme and saved themes are stored locally in your browser. Saved themes do not sync across browsers or devices.

## Development

Requires [Bun](https://bun.sh/).

```sh
bun install
bun dev
```

## Checks

```sh
bun run build
bun run test
bun run lint
```

## License and attribution

This project retains the Freesm Launcher theme maker and is derived from [FreesmTeam/website](https://github.com/FreesmTeam/website). It is distributed under the GNU General Public License version 3.0; see [LICENSE](./LICENSE).
