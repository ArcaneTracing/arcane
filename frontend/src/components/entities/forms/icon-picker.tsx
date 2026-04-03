"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { InfoButton } from "@/components/shared/info-button";
import { entityTooltips } from "@/constants/entity-tooltips";


const ICON_COLOR_MAP: Record<string, string> = {

  "cloud": "text-blue-600 dark:text-blue-400",
  "server": "text-blue-600 dark:text-blue-400",
  "database": "text-blue-600 dark:text-blue-400",
  "network": "text-blue-600 dark:text-blue-400",
  "globe": "text-blue-600 dark:text-blue-400",


  "cpu": "text-orange-600 dark:text-orange-400",
  "hard-drive": "text-orange-600 dark:text-orange-400",
  "desktop": "text-orange-600 dark:text-orange-400",
  "laptop": "text-orange-600 dark:text-orange-400",
  "monitor": "text-orange-600 dark:text-orange-400",
  "smartphone": "text-orange-600 dark:text-orange-400",
  "tablet": "text-orange-600 dark:text-orange-400",
  "mouse": "text-orange-600 dark:text-orange-400",
  "keyboard": "text-orange-600 dark:text-orange-400",


  "shield": "text-purple-600 dark:text-purple-400",
  "shield-check": "text-purple-600 dark:text-purple-400",
  "shield-alert": "text-purple-600 dark:text-purple-400",
  "shield-off": "text-purple-600 dark:text-purple-400",
  "shield-x": "text-purple-600 dark:text-purple-400",
  "key": "text-purple-600 dark:text-purple-400",
  "key-round": "text-purple-600 dark:text-purple-400",
  "key-square": "text-purple-600 dark:text-purple-400",
  "lock": "text-purple-600 dark:text-purple-400",
  "unlock": "text-purple-600 dark:text-purple-400",
  "fingerprint": "text-purple-600 dark:text-purple-400",


  "zap": "text-yellow-600 dark:text-yellow-400",
  "flame": "text-amber-600 dark:text-amber-400",
  "sparkles": "text-yellow-600 dark:text-yellow-400",
  "power": "text-yellow-600 dark:text-yellow-400",
  "power-off": "text-yellow-600 dark:text-yellow-400",
  "plug": "text-yellow-600 dark:text-yellow-400",
  "battery": "text-yellow-600 dark:text-yellow-400",
  "battery-charging": "text-yellow-600 dark:text-yellow-400",


  "star": "text-green-600 dark:text-green-400",
  "rocket": "text-green-600 dark:text-green-400",
  "trending-up": "text-green-600 dark:text-green-400",
  "arrow-trending-up": "text-green-600 dark:text-green-400",
  "activity": "text-green-600 dark:text-green-400",
  "pulse": "text-green-600 dark:text-green-400",
  "heart": "text-green-600 dark:text-green-400",
  "heart-pulse": "text-green-600 dark:text-green-400",


  "bug": "text-red-600 dark:text-red-400",
  "bug-off": "text-red-600 dark:text-red-400",
  "trending-down": "text-red-600 dark:text-red-400",
  "arrow-trending-down": "text-red-600 dark:text-red-400",
  "alert-circle": "text-red-600 dark:text-red-400",


  "mic": "text-teal-600 dark:text-teal-400",
  "video": "text-teal-600 dark:text-teal-400",
  "camera": "text-teal-600 dark:text-teal-400",
  "image": "text-teal-600 dark:text-teal-400",
  "film": "text-teal-600 dark:text-teal-400",
  "music": "text-teal-600 dark:text-teal-400",
  "play": "text-teal-600 dark:text-teal-400",
  "pause": "text-teal-600 dark:text-teal-400",
  "stop": "text-teal-600 dark:text-teal-400",
  "skip-forward": "text-teal-600 dark:text-teal-400",
  "skip-back": "text-teal-600 dark:text-teal-400",
  "repeat": "text-teal-600 dark:text-teal-400",
  "shuffle": "text-teal-600 dark:text-teal-400",
  "volume-2": "text-teal-600 dark:text-teal-400",
  "radio": "text-teal-600 dark:text-teal-400",
  "tv": "text-teal-600 dark:text-teal-400",
  "headphones": "text-teal-600 dark:text-teal-400",
  "megaphone": "text-teal-600 dark:text-teal-400",


  "code": "text-indigo-600 dark:text-indigo-400",
  "terminal": "text-indigo-600 dark:text-indigo-400",
  "command": "text-indigo-600 dark:text-indigo-400",
  "file-code": "text-indigo-600 dark:text-indigo-400",
  "git-branch": "text-indigo-600 dark:text-indigo-400",
  "git-commit": "text-indigo-600 dark:text-indigo-400",
  "git-merge": "text-indigo-600 dark:text-indigo-400",


  "package": "text-violet-600 dark:text-violet-400",
  "box": "text-violet-600 dark:text-violet-400",
  "layers": "text-violet-600 dark:text-violet-400",
  "grid": "text-violet-600 dark:text-violet-400",
  "layout": "text-violet-600 dark:text-violet-400",
  "folder": "text-violet-600 dark:text-violet-400",
  "folder-open": "text-violet-600 dark:text-violet-400",
  "archive": "text-violet-600 dark:text-violet-400",


  "settings": "text-pink-600 dark:text-pink-400",
  "cog": "text-pink-600 dark:text-pink-400",
  "wrench": "text-pink-600 dark:text-pink-400",
  "tool": "text-pink-600 dark:text-pink-400",
  "hammer": "text-pink-600 dark:text-pink-400",
  "sliders": "text-pink-600 dark:text-pink-400",
  "sliders-horizontal": "text-pink-600 dark:text-pink-400",


  "link": "text-cyan-600 dark:text-cyan-400",
  "chain": "text-cyan-600 dark:text-cyan-400",
  "puzzle": "text-cyan-600 dark:text-cyan-400",
  "puzzle-piece": "text-cyan-600 dark:text-cyan-400",
  "wifi": "text-cyan-600 dark:text-cyan-400",
  "wifi-off": "text-cyan-600 dark:text-cyan-400",
  "bluetooth": "text-cyan-600 dark:text-cyan-400",
  "bluetooth-connected": "text-cyan-600 dark:text-cyan-400",
  "bluetooth-searching": "text-cyan-600 dark:text-cyan-400",
  "signal": "text-cyan-600 dark:text-cyan-400",
  "signal-high": "text-cyan-600 dark:text-cyan-400",
  "signal-medium": "text-cyan-600 dark:text-cyan-400",
  "signal-low": "text-cyan-600 dark:text-cyan-400",
  "signal-zero": "text-cyan-600 dark:text-cyan-400",
  "rss": "text-cyan-600 dark:text-cyan-400",


  "compass": "text-sky-600 dark:text-sky-400",
  "map": "text-sky-600 dark:text-sky-400",
  "map-pin": "text-sky-600 dark:text-sky-400",
  "navigation": "text-sky-600 dark:text-sky-400",
  "route": "text-sky-600 dark:text-sky-400",
  "arrow-right": "text-sky-600 dark:text-sky-400",
  "arrow-left": "text-sky-600 dark:text-sky-400",
  "arrow-up": "text-sky-600 dark:text-sky-400",
  "arrow-down": "text-sky-600 dark:text-sky-400",
  "chevron-right": "text-sky-600 dark:text-sky-400",
  "chevron-left": "text-sky-600 dark:text-sky-400",
  "chevron-up": "text-sky-600 dark:text-sky-400",
  "chevron-down": "text-sky-600 dark:text-sky-400",
  "move": "text-sky-600 dark:text-sky-400",
  "move-up": "text-sky-600 dark:text-sky-400",
  "move-down": "text-sky-600 dark:text-sky-400",
  "move-left": "text-sky-600 dark:text-sky-400",
  "move-right": "text-sky-600 dark:text-sky-400",


  "bar-chart": "text-emerald-600 dark:text-emerald-400",
  "bar-chart-2": "text-emerald-600 dark:text-emerald-400",
  "bar-chart-3": "text-emerald-600 dark:text-emerald-400",
  "line-chart": "text-emerald-600 dark:text-emerald-400",
  "pie-chart": "text-emerald-600 dark:text-emerald-400",
  "gauge": "text-emerald-600 dark:text-emerald-400",
  "gauge-circle": "text-emerald-600 dark:text-emerald-400",


  "timer": "text-rose-600 dark:text-rose-400",
  "clock": "text-rose-600 dark:text-rose-400",
  "calendar": "text-rose-600 dark:text-rose-400",


  "bell": "text-lime-600 dark:text-lime-400",
  "bell-ring": "text-lime-600 dark:text-lime-400",


  "search": "text-amber-600 dark:text-amber-400",
  "filter": "text-amber-600 dark:text-amber-400",
  "funnel": "text-amber-600 dark:text-amber-400",


  "refresh": "text-indigo-600 dark:text-indigo-400",
  "rotate-cw": "text-indigo-600 dark:text-indigo-400",
  "rotate-ccw": "text-indigo-600 dark:text-indigo-400",
  "maximize": "text-indigo-600 dark:text-indigo-400",
  "minimize": "text-indigo-600 dark:text-indigo-400",
  "expand": "text-indigo-600 dark:text-indigo-400",
  "shrink": "text-indigo-600 dark:text-indigo-400",
  "zoom-in": "text-indigo-600 dark:text-indigo-400",
  "zoom-out": "text-indigo-600 dark:text-indigo-400",
  "toggle-left": "text-indigo-600 dark:text-indigo-400",
  "toggle-right": "text-indigo-600 dark:text-indigo-400",
  "switch": "text-indigo-600 dark:text-indigo-400",


  "book": "text-violet-600 dark:text-violet-400",
  "book-open": "text-violet-600 dark:text-violet-400",
  "library": "text-violet-600 dark:text-violet-400",


  "tag": "text-pink-600 dark:text-pink-400",
  "tags": "text-pink-600 dark:text-pink-400",
  "label": "text-pink-600 dark:text-pink-400",


  "target": "text-red-600 dark:text-red-400",
  "crosshair": "text-red-600 dark:text-red-400",
  "flag": "text-red-600 dark:text-red-400",
  "flag-triangle-right": "text-red-600 dark:text-red-400",


  "atom": "text-purple-600 dark:text-purple-400",
  "flask": "text-purple-600 dark:text-purple-400",
  "flask-conical": "text-purple-600 dark:text-purple-400",
  "beaker": "text-purple-600 dark:text-purple-400",
  "test-tube": "text-purple-600 dark:text-purple-400",
  "microscope": "text-purple-600 dark:text-purple-400",
  "telescope": "text-purple-600 dark:text-purple-400",
  "binoculars": "text-purple-600 dark:text-purple-400",


  "eye": "text-cyan-600 dark:text-cyan-400",
  "eye-off": "text-cyan-600 dark:text-cyan-400",
  "scan": "text-cyan-600 dark:text-cyan-400",
  "scan-line": "text-cyan-600 dark:text-cyan-400",
  "qrcode": "text-cyan-600 dark:text-cyan-400",
  "barcode": "text-cyan-600 dark:text-cyan-400",


  "id-card": "text-indigo-600 dark:text-indigo-400",
  "credit-card": "text-indigo-600 dark:text-indigo-400",


  "wallet": "text-green-600 dark:text-green-400",
  "coins": "text-green-600 dark:text-green-400",
  "banknote": "text-green-600 dark:text-green-400",
  "dollar-sign": "text-green-600 dark:text-green-400",
  "euro": "text-green-600 dark:text-green-400",
  "pound-sterling": "text-green-600 dark:text-green-400",
  "yen": "text-green-600 dark:text-green-400",
  "bitcoin": "text-green-600 dark:text-green-400",


  "lungs": "text-rose-600 dark:text-rose-400",
  "brain": "text-rose-600 dark:text-rose-400",
  "skull": "text-rose-600 dark:text-rose-400",
  "bone": "text-rose-600 dark:text-rose-400",
  "dna": "text-rose-600 dark:text-rose-400",
  "virus": "text-rose-600 dark:text-rose-400"
};


export const getIconColor = (iconName: string): string => {
  return ICON_COLOR_MAP[iconName] || "text-blue-600 dark:text-blue-400";
};

interface IconPickerProps {
  selectedIconId?: string;
  onIconChange: (iconId: string) => void;
  disabled?: boolean;
}


const AVAILABLE_ICONS = [
"cloud",
"server",
"database",
"cpu",
"hard-drive",
"network",
"globe",
"shield",
"key",
"lock",
"unlock",
"zap",
"flame",
"sparkles",
"star",
"rocket",
"package",
"box",
"layers",
"grid",
"layout",
"settings",
"cog",
"wrench",
"tool",
"hammer",
"puzzle",
"puzzle-piece",
"link",
"chain",
"git-branch",
"git-commit",
"git-merge",
"code",
"terminal",
"command",
"file-code",
"folder",
"folder-open",
"archive",
"book",
"book-open",
"library",
"tag",
"tags",
"label",
"flag",
"flag-triangle-right",
"target",
"crosshair",
"compass",
"map",
"map-pin",
"navigation",
"route",
"activity",
"pulse",
"heart",
"trending-up",
"trending-down",
"bar-chart",
"line-chart",
"pie-chart",
"gauge",
"gauge-circle",
"timer",
"clock",
"calendar",
"bell",
"bell-ring",
"megaphone",
"volume-2",
"radio",
"tv",
"monitor",
"smartphone",
"tablet",
"laptop",
"desktop",
"mouse",
"keyboard",
"headphones",
"mic",
"video",
"camera",
"image",
"film",
"music",
"play",
"pause",
"stop",
"skip-forward",
"skip-back",
"repeat",
"shuffle",
"refresh",
"rotate-cw",
"rotate-ccw",
"arrow-right",
"arrow-left",
"arrow-up",
"arrow-down",
"chevron-right",
"chevron-left",
"chevron-up",
"chevron-down",
"move",
"move-up",
"move-down",
"move-left",
"move-right",
"maximize",
"minimize",
"expand",
"shrink",
"zoom-in",
"zoom-out",
"search",
"filter",
"funnel",
"sliders",
"sliders-horizontal",
"toggle-left",
"toggle-right",
"switch",
"power",
"power-off",
"plug",
"battery",
"battery-charging",
"wifi",
"wifi-off",
"signal",
"signal-high",
"signal-medium",
"signal-low",
"signal-zero",
"bluetooth",
"bluetooth-connected",
"bluetooth-searching",
"rss",
"atom",
"flask",
"flask-conical",
"beaker",
"test-tube",
"microscope",
"telescope",
"binoculars",
"eye",
"eye-off",
"scan",
"scan-line",
"qrcode",
"barcode",
"fingerprint",
"id-card",
"credit-card",
"wallet",
"coins",
"banknote",
"dollar-sign",
"euro",
"pound-sterling",
"yen",
"bitcoin",
"trending-up",
"trending-down",
"arrow-trending-up",
"arrow-trending-down",
"line-chart",
"bar-chart-2",
"bar-chart-3",
"pie-chart",
"gauge",
"activity",
"pulse",
"heart",
"heart-pulse",
"lungs",
"brain",
"skull",
"bone",
"dna",
"virus",
"bug",
"bug-off",
"shield",
"shield-check",
"shield-alert",
"shield-off",
"shield-x",
"lock",
"unlock",
"key",
"key-round",
"key-square",
"fingerprint",
"scan",
"scan-line",
"qrcode",
"barcode",
"id-card",
"credit-card",
"wallet",
"coins",
"banknote",
"dollar-sign",
"euro",
"pound-sterling",
"yen",
"bitcoin",
"trending-up",
"trending-down",
"arrow-trending-up",
"arrow-trending-down",
"line-chart",
"bar-chart-2",
"bar-chart-3",
"pie-chart",
"gauge",
"activity",
"pulse",
"heart",
"heart-pulse",
"lungs",
"brain",
"skull",
"bone",
"dna",
"virus",
"bug",
"bug-off",
"shield",
"shield-check",
"shield-alert",
"shield-off",
"shield-x",
"lock",
"unlock",
"key",
"key-round",
"key-square",
"fingerprint",
"scan",
"scan-line",
"qrcode",
"barcode",
"id-card",
"credit-card",
"wallet",
"coins",
"banknote",
"dollar-sign",
"euro",
"pound-sterling",
"yen",
"bitcoin"] as
const;


const UNIQUE_ICONS = Array.from(new Set(AVAILABLE_ICONS)).sort((a, b) => a.localeCompare(b));

export function IconPicker({ selectedIconId, onIconChange, disabled }: Readonly<IconPickerProps>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = UNIQUE_ICONS.filter((iconName) =>
  iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {

    const pascalCaseName = iconName.
    split('-').
    map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).
    join('');

    const IconComponent = (LucideIcons as any)[pascalCaseName];
    if (!IconComponent) {

      return LucideIcons.Circle;
    }
    return IconComponent;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium dark:text-gray-200">
          Icon
        </Label>
        <InfoButton content={entityTooltips.customEntity.iconPicker} />
      </div>
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm" />

        <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 max-h-[300px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              const isSelected = selectedIconId === iconName;
              const iconColor = getIconColor(iconName);
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => !disabled && onIconChange(iconName)}
                  disabled={disabled}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg border-2 transition-colors",
                    isSelected ?
                    "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" :
                    "border-gray-200 dark:border-[#2A2A2A] hover:border-gray-300 dark:hover:border-[#3A3A3A] bg-white dark:bg-[#0D0D0D]",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  title={iconName}>

                  <IconComponent
                    className={cn("h-5 w-5", iconColor)} />

                </button>);

            })}
          </div>
          {filteredIcons.length === 0 &&
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              No icons found matching "{searchQuery}"
            </div>
          }
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Select an icon to represent this custom entity.
      </p>
    </div>);

}