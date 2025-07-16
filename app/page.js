import { ReceiptText } from 'lucide-react';
import Image from "next/image"
import loginCover from "@/assets/login-cover.png"
import { AuthFormWrapper } from "@/components/login-component"

export default function AuthenticationPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div
              className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <ReceiptText className="size-5" />
            </div>
            Finvest
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
            <AuthFormWrapper />
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src={loginCover}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          
      </div>
    </div>
  );
}
