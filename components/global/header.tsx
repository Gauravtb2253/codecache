"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Inbox, Loader2, User2 } from "lucide-react";
import { Navigation } from "./navigation";
import { HeaderLogo } from "./header-logo";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "@/SearchContext";

export const Header = () => {
  const [hasUnread, setHasUnread] = useState(false);
  const { setSearchQuery, snippets } = useContext(SearchContext);
  const [inputValue, setInputValue] = useState("");
  const [filteredSnippets, setFilteredSnippets] = useState(snippets);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const notifications = await response.json();
          const unreadExists = notifications.some(
            (notification: { status: string }) =>
              notification.status === "unread",
          );
          setHasUnread(unreadExists);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const { setTheme } = useTheme();

  useEffect(() => {
    const results = snippets.filter((snippet) =>
      snippet.title.toLowerCase().includes(inputValue.toLowerCase()),
    );
    setFilteredSnippets(results);
  }, [inputValue, snippets]);

  return (
    <header className="sticky top-0 left-0 right-0 bg-transparent bg-opacity-20 backdrop-blur-md px-4 py-4 lg:px-14 z-50">
      <div className="mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <Input
                type="text"
                placeholder="Search snippets..."
                className="pl-6 pr-4 py-2 w-full"
                value={inputValue}
                onChange={handleInputChange}
              />
              {inputValue && filteredSnippets.length > 0 && (
                <div className="absolute z-10 w-full bg-black shadow-lg rounded-md max-h-60 overflow-y-auto border border-gray-300 text-white">
                  {filteredSnippets.map((snippet) => (
                    <Link
                      key={snippet._id}
                      href={`/snippets/${snippet._id}`}
                      className="block px-4 py-2  transition-colors"
                      onClick={() => setInputValue(snippet.title)}
                    >
                      {snippet.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row-reverse gap-4 items-center">
            <Link href="/notifications">
              <Button variant="outline" size="icon">
                {hasUnread ? (
                  <Inbox className="h-[1.2rem] w-[1.2rem] text-blue-500" />
                ) : (
                  <Inbox className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="pr-2 flex items-center">
              <ClerkLoaded>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="View Profile"
                      labelIcon={<User2 className="w-9 h-4 pr-5" />}
                      href="/profile"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </ClerkLoaded>
              <ClerkLoading>
                <Loader2 className="size-8 animate-spin text-slate-400" />
              </ClerkLoading>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
