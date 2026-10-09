import { Suspense } from "react";
import { SearchContent } from "./SearchContent";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
