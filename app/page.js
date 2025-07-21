import { ReceiptText } from "lucide-react";
import Image from "next/image";
import loginCover from "@/assets/login-cover.png";
import { LoginComponent } from "@/components/login-component";
import PublicRoute from "@/components/PublicRoute";

export default function AuthenticationPage() {
  return (
    <PublicRoute>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <ReceiptText className="size-5" />
              </div>
              Finvest
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <LoginComponent />
          </div>
        </div>
        <div className="relative hidden lg:block">
          <Image
            src={loginCover}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </PublicRoute>
  );
}
