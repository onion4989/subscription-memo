import {Poppins} from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface HeaderProps {
  title: string;
  label: string;
}

export function Header({ title, label }: HeaderProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className={cn("text-3xl font-bold", font.className)}>{title}</h1>
      <p className=" text-muted-foreground tex-sm">{label}</p>
    </div>
  );
}