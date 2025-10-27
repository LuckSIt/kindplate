import { createFileRoute } from "@tanstack/react-router";
import { VendorPage } from "@/components/pages/vendor-page";

export const Route = createFileRoute("/v/$vendorId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { vendorId } = Route.useParams();
  return <VendorPage vendorId={vendorId} />;
}