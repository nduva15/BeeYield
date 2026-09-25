import ShopDashboard from "@/components/ShopDashboard";

export default function ShopDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <ShopDashboard embedded={true} />
      </div>
    </div>
  );
}
