import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";


export function NotFoundFallback() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (document.referrer && globalThis.history.length > 1) {
      globalThis.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl font-bold text-muted-foreground/50 mb-4">
            404
          </div>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>);

}