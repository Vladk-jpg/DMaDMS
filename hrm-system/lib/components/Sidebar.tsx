"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBriefcase,
  FiUser,
  FiUsers,
  FiClock,
  FiCalendar,
  FiFolder,
  FiLayers,
} from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/organisation", label: "Organization", icon: FiBriefcase },
    { href: "/employees", label: "Personal", icon: FiUser },
    { href: "/departments", label: "Departments", icon: FiLayers },
    { href: "/timesheet", label: "Timesheets", icon: FiClock },
    { href: "/leaves", label: "Leaves", icon: FiCalendar },
    { href: "/team", label: "Team", icon: FiUsers },
    { href: "/projects", label: "Prjects", icon: FiFolder },
  ];

  return (
    <div className="bg-white rounded-xl py-8 px-4 mt-4 mx-1 overflow-visible shadow-md flex-1 flex flex-col min-h-0">
      <ul className="flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href} className="py-1">
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-2 border-l-2 transition-colors ${
                  isActive
                    ? "border-primary"
                    : "border-transparent hover:border-gray"
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
