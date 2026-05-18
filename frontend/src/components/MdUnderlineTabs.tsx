import React from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { SxProps, Theme } from "@mui/material/styles";

/** 화면설계: MUI 기본 탭 — 활성 탭 연회색 배경·상단 라운드·primary 인디케이터 */
const tabsSx = {
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  /** 스크롤 없이 한 줄에 탭이 모두 보이도록 (기본 minWidth 90px 제거) */
  "& .MuiTabs-flexContainer": {
    flexWrap: "nowrap",
  },
  "& .MuiTabs-indicator": {
    height: 3,
  },
  "& .MuiTab-root": {
    textTransform: "none",
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
    minWidth: 0,
    flex: "1 1 0",
    maxWidth: "none",
    paddingLeft: 8,
    paddingRight: 8,
    color: "rgba(0, 0, 0, 0.87)",
    whiteSpace: "nowrap",
  },
  "& .MuiTab-root.Mui-selected": {
    fontWeight: 700,
    backgroundColor: "#F5F5F5",
    borderRadius: "8px 8px 0 0",
    color: "rgba(0, 0, 0, 0.87)",
  },
} as const;

export type MdUnderlineTabItem<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export type MdUnderlineTabsProps<T extends string> = {
  value: T;
  items: MdUnderlineTabItem<T>[];
  onChange: (value: T) => void;
  /** MUI `sx` 병합 (여백 등) */
  sx?: SxProps<Theme>;
  id?: string;
  "aria-label"?: string;
};

export default function MdUnderlineTabs<T extends string>({
  value,
  items,
  onChange,
  sx,
  id,
  "aria-label": ariaLabel,
}: MdUnderlineTabsProps<T>) {
  const idx = items.findIndex((i) => i.value === value);
  const tabIndex = idx >= 0 ? idx : 0;

  return (
    <Tabs
      id={id}
      aria-label={ariaLabel}
      value={tabIndex}
      onChange={(_, i) => {
        const next = items[i];
        if (next) onChange(next.value);
      }}
      indicatorColor="primary"
      variant="standard"
      sx={{ ...tabsSx, ...sx }}
    >
      {items.map((it) => (
        <Tab key={it.value} label={it.label} />
      ))}
    </Tabs>
  );
}
