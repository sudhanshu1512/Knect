import { cn } from "@/lib/utils";
import { Button } from "./button";

export const InstagramButton = ({ className, ...props }) => (
  <Button
    className={cn(
      "rounded-lg font-semibold hover:opacity-90 transition-opacity",
      "bg-[#0095F6] hover:bg-[#0095F6] text-white",
      className
    )}
    {...props}
  />
);

export const InstagramIconButton = ({ className, ...props }) => (
  <Button
    variant="ghost"
    size="icon"
    className={cn(
      "hover:bg-transparent text-gray-900",
      className
    )}
    {...props}
  />
);

export const InstagramInput = ({ className, ...props }) => (
  <input
    className={cn(
      "w-full px-4 py-2 text-sm bg-gray-100 border-none rounded-xl",
      "placeholder:text-gray-500 focus:outline-none focus:ring-0",
      className
    )}
    {...props}
  />
);

export const InstagramSearchInput = ({ className, ...props }) => (
  <input
    className={cn(
      "w-full px-4 py-2 text-sm bg-gray-100 border-none rounded-xl",
      "placeholder:text-gray-500 focus:outline-none focus:ring-0",
      className
    )}
    {...props}
  />
);

export const InstagramMessageInput = ({ className, ...props }) => (
  <input
    className={cn(
      "flex-1 px-4 py-2 text-sm bg-transparent border-none",
      "placeholder:text-gray-500 focus:outline-none focus:ring-0",
      className
    )}
    {...props}
  />
);
