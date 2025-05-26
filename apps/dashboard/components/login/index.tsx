import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "./form";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <p className="font-sans font-bold">hyperbola.network</p>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block ">
        <p className="text-center py-10 pb-20 text-5xl font-bold">
          LESS TALKING <br /> MORE BUILDING
        </p>
        <br />
        <br />
        <br />
        <img
          src="https://test-redis.pantheonsite.io/wp-content/uploads/2024/07/tryfree.webp?&auto=webp&quality=85,75&width=500"
          alt="Decorative background"
          className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
