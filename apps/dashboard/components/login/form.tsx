import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Get started for free</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Sign up with your google or github account
        </p>
      </div>
      <div className="grid gap-6">
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>Google Logo</title>
            <path
              d="M21.35 11.1h-9.34v2.92h5.34c-.23 1.2-.92 2.22-1.94 2.88v2.4h3.14c1.84-1.7 2.9-4.2 2.9-7.3 0-.7-.08-1.38-.2-2.02z"
              fill="#4285F4"
            />
            <path
              d="M12.01 22c2.43 0 4.47-.8 5.96-2.16l-3.14-2.4c-.87.58-1.98.92-3.2.92-2.46 0-4.54-1.66-5.28-3.9H3.05v2.46C4.54 19.98 8.01 22 12.01 22z"
              fill="#34A853"
            />
            <path
              d="M6.73 13.46c-.2-.58-.32-1.2-.32-1.86s.12-1.28.32-1.86V7.28H3.05C2.38 8.7 2 10.3 2 12s.38 3.3 1.05 4.72l3.68-3.26z"
              fill="#FBBC05"
            />
            <path
              d="M12.01 4.58c1.32 0 2.5.46 3.42 1.36l2.56-2.56C16.48 1.98 14.44 1 12.01 1 8.01 1 4.54 3.02 3.05 5.74l3.68 3.26c.74-2.24 2.82-3.9 5.28-3.9z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>GitHub Logo</title>
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          GitHub
        </Button>
      </div>
    </form>
  );
}
