import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: keyof typeof COLOR_MAP;
}) {
  return <span className={cn("badge", COLOR_MAP[color])}>{children}</span>;
}
