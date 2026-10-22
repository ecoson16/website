import { DefaultColors, DefaultCSS } from "@/constants/customization.ts";

export type ThemeColors = typeof DefaultColors;

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isHexColor(value: unknown, allowAlpha = false): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return allowAlpha
    ? /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value)
    : /^#[\da-f]{6}$/i.test(value);
}

/** Accept only supported color keys and valid six-digit colors from untrusted input. */
export function sanitizeColorOverrides(value: unknown): Partial<ThemeColors> | null {
  if (!isRecord(value)) {
    return null;
  }

  const result: Partial<ThemeColors> = {};

  for (const key of Object.keys(DefaultColors) as Array<keyof ThemeColors>) {
    const candidate = value[key];

    if (isHexColor(candidate)) {
      result[key] = candidate;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function mergeThemeColors(value: unknown): ThemeColors {
  return {
    ...DefaultColors,
    ...(sanitizeColorOverrides(value) ?? {}),
  };
}

function getNestedRecord(parent: UnknownRecord, key: string): UnknownRecord {
  const value = parent[key];

  return isRecord(value) ? value : {};
}

function getBoolean(parent: UnknownRecord, key: string, fallback: boolean): boolean {
  const value = parent[key];

  return typeof value === "boolean" ? value : fallback;
}

function getColorOrFalse(parent: UnknownRecord, key: string): false | string {
  const value = parent[key];

  return value === false || isHexColor(value, true) ? value as (false | string) : false;
}

function getNumberOrFalse(parent: UnknownRecord, key: string): false | number {
  const value = parent[key];

  return value === false ||
    (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 16)
    ? value as (false | number)
    : false;
}

/**
 * Rebuilds style settings from known fields rather than trusting persisted JSON.
 * Unknown keys, malformed values, and unreasonable numeric values are discarded.
 */
export function sanitizeThemeStyles(value: unknown): typeof DefaultCSS {
  const input = isRecord(value) ? value : {};
  const toolButton = getNestedRecord(input, "QToolButton");
  const toolButtonOn = getNestedRecord(input, "QToolButton:on");
  const toolButtonHover = getNestedRecord(input, "QToolButton:hover");
  const toolButtonPressed = getNestedRecord(input, "QToolButton:pressed");
  const pushButton = getNestedRecord(input, "QPushButton");
  const pushButtonOn = getNestedRecord(input, "QPushButton:on");
  const pushButtonHover = getNestedRecord(input, "QPushButton:hover");
  const pushButtonPressed = getNestedRecord(input, "QPushButton:pressed");
  const tabWidgetPane = getNestedRecord(input, "QTabWidget::pane");
  const tabWidgetTabBar = getNestedRecord(input, "QTabWidget::tab-bar");
  const tabBarTab = getNestedRecord(input, "QTabBar::tab");
  const tabBarTabHover = getNestedRecord(input, "QTabBar::tab:hover");
  const tabBarTabSelected = getNestedRecord(input, "QTabBar::tab:selected");

  return {
    "LayoutBorder": getBoolean(input, "LayoutBorder", false),
    "QObject::handle": getBoolean(input, "QObject::handle", false),
    "QToolButton": {
      "border": getBoolean(toolButton, "border", false),
      "background-color": getColorOrFalse(toolButton, "background-color"),
      "padding": getNumberOrFalse(toolButton, "padding"),
    },
    "QToolButton:on": {
      "background-color": getColorOrFalse(toolButtonOn, "background-color"),
    },
    "QToolButton:hover": {
      "background-color": getColorOrFalse(toolButtonHover, "background-color"),
    },
    "QToolButton:pressed": {
      "background-color": getColorOrFalse(toolButtonPressed, "background-color"),
    },
    "QPushButton": {
      "border": getBoolean(pushButton, "border", false),
      "background-color": getColorOrFalse(pushButton, "background-color"),
      "padding": getNumberOrFalse(pushButton, "padding"),
    },
    "QPushButton:on": {
      "background-color": getColorOrFalse(pushButtonOn, "background-color"),
    },
    "QPushButton:hover": {
      "background-color": getColorOrFalse(pushButtonHover, "background-color"),
    },
    "QPushButton:pressed": {
      "background-color": getColorOrFalse(pushButtonPressed, "background-color"),
    },
    "QTabWidget::pane": {
      "border": getBoolean(tabWidgetPane, "border", false),
    },
    "QTabWidget::tab-bar": {
      "left": getNumberOrFalse(tabWidgetTabBar, "left"),
    },
    "QTabBar::tab": {
      "padding": getNumberOrFalse(tabBarTab, "padding"),
      "margin-right": getNumberOrFalse(tabBarTab, "margin-right"),
      "border": getBoolean(tabBarTab, "border", false),
    },
    "QTabBar::tab:hover": {
      "background-color": getColorOrFalse(tabBarTabHover, "background-color"),
    },
    "QTabBar::tab:selected": {
      "background-color": getColorOrFalse(tabBarTabSelected, "background-color"),
    },
  };
}
