import ShopDashboard from "@/components/ShopDashboard";
import { ShopAuthProvider } from "@/hooks/use-shop-auth";

export default function ShopDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <ShopAuthProvider>
          <ShopDashboard embedded={true} />
        </ShopAuthProvider>
      </div>
    </div>
  );
}
