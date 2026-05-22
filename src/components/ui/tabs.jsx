import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({ className, defaultValue, orientation = "horizontal", activationMode = "automatic", ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn("flex flex-col", className)}
    defaultValue={defaultValue}
    orientation={orientation}
    activationMode={activationMode}
    {...props}
  />
));
Tabs.displayName = "Tabs";

const TabList = React.forwardRef(({ className, ...props }, ref) => {
  const isGrid = className?.includes("grid");
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "w-full h-11 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500",
        isGrid ? "grid" : "inline-flex",
        className
      )}
      {...props}
    />
  );
});
TabList.displayName = "TabList";

const Tab = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
));
Tab.displayName = "Tab";

const TabPanel = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 rounded-xl focus-visible:outline-none", className)}
    {...props}
  />
));
TabPanel.displayName = "TabPanel";

export { Tabs, TabList, Tab, TabPanel };
