import Link from "next/link";

export default function SidebarItem({
  item,
  isActive,
}: {
  item: {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    notificationCount?: number;
  };
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {item.icon}
      <span className="ml-3 flex-1">{item.label}</span>
      {item.notificationCount && item.notificationCount > 0 ? (
        <span className="ml-auto inline-block py-0.5 px-2.5 text-xs font-semibold text-white bg-red-500 rounded-full">
          {item.notificationCount}
        </span>
      ) : null}
    </Link>
  );
}
