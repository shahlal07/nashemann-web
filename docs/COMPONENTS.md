# Micro-interaction components

## Confetti

```tsx
import { useConfetti } from "@/components/ui/Confetti";

function ExampleWithHook() {
  const { celebrate, confettiElement } = useConfetti();
  return (
    <>
      <button onClick={celebrate}>Submit application</button>
      {confettiElement}
    </>
  );
}
```

Or drive it directly with a boolean prop:

```tsx
import { Confetti } from "@/components/ui/Confetti";

<Confetti trigger={justSubmitted} />;
```

Respects `prefers-reduced-motion` (no burst is drawn when it's set).

## EmptyState

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  variant="no-results"
  title="No orders match your filters"
  description="Try adjusting the date range or status filter."
  action={{ label: "Clear filters", onClick: clearFilters }}
/>;
```

`variant` is one of `"no-data" | "no-results" | "error"` and picks a default icon; pass `icon` to override it.

## Skeleton

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

<SkeletonCard />
<SkeletonText lines={3} />
<SkeletonTable rows={6} columns={5} />
```

`Skeleton` is the shimmer primitive the presets are built from — use it directly for custom shapes (`<Skeleton className="h-8 w-8 rounded-full" />`).

## CelebrationBanner

```tsx
import { CelebrationBanner } from "@/components/ui/CelebrationBanner";
import { Rocket } from "lucide-react";

<CelebrationBanner
  title="Your store is live!"
  message="Buyers can now find and order from your storefront."
  icon={Rocket}
  onDismiss={() => markSeen("store-live")}
/>;
```

Animates in/out with framer-motion and dismisses itself on click; `onDismiss` is for persisting that the user has seen it.
