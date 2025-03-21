"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Label } from "./ui/label";
import Image from "next/image";

const items = [
  {
    title: "Dashboard",
    path: "/",
  },
  {
    title: "Form",
    path: "/upload",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white border-r">
        <div className="flex items-center p-2 py-4 h-12 lg:h-2 my-3 w-12 sm:h-3">
          <Image src="/home-icon.jpeg" width={300} height={300} alt="Logo" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title} className="w-auto">
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="flex justify-start w-auto p-0"
                    >
                      <Link href={item.path} className="flex items-center">
                        <div
                          className={cn(
                            "min-w-3 min-h-3 w-3 h-3 rounded-full transition-colors",
                            isActive ? "bg-[#4F31E4]" : "bg-gray-300"
                          )}
                          aria-hidden="true"
                        />
                        <Label
                          className={cn(
                            "transition-opacity duration-200",
                            isCollapsed
                              ? "opacity-0 w-0 overflow-hidden"
                              : "opacity-100"
                          )}
                        >
                          {item.title}
                        </Label>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
