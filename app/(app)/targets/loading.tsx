import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-app p-4 sm:p-8">
      <LoadingSkeleton variant="card" />
    </div>
  );
}
