import type { Icon, IconProps } from "@tabler/icons-react";

// tablerにトップハットが無いため、tablerと同じ描画規約(24x24・アウトライン・
// currentColor・size/stroke対応)に合わせて自作したハットアイコン。
export const IconTopHat: Icon = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
  title,
  ...rest
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 17h18" />
    <path d="M8 17 L7 5 L17 5 L16 17" />
    <path d="M8 13.5h8" />
  </svg>
);
