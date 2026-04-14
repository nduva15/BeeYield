import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { BrandedProductImage } from "@/components/BrandedProductImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { initialHoneyProducts } from "@/data/Honey-Products";
import {
  add_to_cart,
  getProducts,
  type Product,
} from "@/services/shopService";

type HoneyProductCollectionProps = {
  badgeLabel?: string;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  products?: Product[];
  ctaLabel?: string;
  ctaTo?: string;
};

const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

export const HoneyProductCollection = ({
  badgeLabel = "Pure Kibwezi Gold",
  title = (
    <>
      Our Full <span className="text-beeyield-green">Honey</span> Collection
    </>
  ),
  description = "From medicinal Neem to delicate Acacia, discover our range of ethically harvested, 100% raw honey.",
  className = "py-24 bg-neutral-50 border-t border-neutral-100",
  products,
  ctaLabel = "View Full Shop",
  ctaTo = "/shop",
}: HoneyProductCollectionProps) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    if (products?.length) return;

    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const honeyProducts = await getProducts("honey");
        if (isMounted && honeyProducts.length > 0) {
          setFetchedProducts(honeyProducts);
        }
      } catch (error) {
        console.error("Failed to fetch honey products:", error);
      }
    };

    void fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [products]);

  const honeyProducts = (products?.length ? products : fetchedProducts).filter(
    (product) => product.category === "honey",
  );
  const visibleProducts = honeyProducts.length
    ? honeyProducts
    : initialHoneyProducts.filter((product) => product.category === "honey");

  const handleAddToCart = async (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.variants[0].size;
    const variantIndex = product.variants.findIndex(
      (variant) => variant.size === selectedSize,
    );
    const variant = product.variants[variantIndex] || product.variants[0];
    const image =
      product.images[variantIndex + 1] || product.images[1] || product.images[0];

    addToCart({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      description: product.description,
      size: selectedSize,
      price: variant.price_kes,
      quantity: 1,
      category: product.category as "honey" | "merch" | "education" | "hardware",
      badge: product.badge,
      image,
    });
    openCart();
    toast.success(`${product.name} added to cart!`);

    try {
      await add_to_cart({
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
      });
    } catch {
      // Keep storefront interaction responsive even if sync fails.
    }
  };

  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge className="bg-beeyield-green/10 text-beeyield-green mb-4 hover:bg-beeyield-green/20 transition-colors font-black text-[10px] px-4 py-1.5 rounded-full border border-beeyield-green/20">
            {badgeLabel}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 leading-none tracking-tighter mb-6">
            {title}
          </h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleProducts.map((product) => {
            const selectedSize =
              selectedSizes[product.id] || product.variants[0].size;
            const variantSizeIndex = product.variants.findIndex(
              (variant) => variant.size === selectedSize,
            );
            const variant = product.variants[variantSizeIndex] || product.variants[0];
            const image = product.images[variantSizeIndex + 1] || product.images[0];

            return (
              <Card
                key={product.id}
                className="group bg-[#FFF9F0] border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-50 p-6 flex items-center justify-center group-hover:bg-amber-50/30 transition-colors">
                  <BrandedProductImage
                    src={image}
                    alt={product.name}
                    category="honey"
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-out"
                  />
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-beeyield-gold text-[#1A1A1A] font-black text-[9px] px-3 py-1 rounded-full shadow-lg border-none">
                      {product.badge}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow space-y-3 mb-6">
                    <h3 className="text-lg font-black text-neutral-900 leading-tight group-hover:text-beeyield-green transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-100">
                        <span className="text-beeyield-green font-black text-lg">
                          {formatPrice(variant.price_kes)}
                        </span>
                      </div>
                      <Select
                        value={selectedSize}
                        onValueChange={(value) =>
                          setSelectedSizes((prev) => ({
                            ...prev,
                            [product.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[100px] h-9 text-xs font-bold border-neutral-200 rounded-lg hover:border-beeyield-gold/50 transition-colors">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((variantOption) => (
                            <SelectItem
                              key={variantOption.id}
                              value={variantOption.size}
                              className="text-xs font-bold"
                            >
                              {variantOption.size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-neutral-900 hover:bg-beeyield-green text-[#1A1A1A] rounded-xl h-11 text-[10px] font-black transition-all hover:shadow-lg shadow-neutral-900/10"
                      onClick={() => void handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-2 border-neutral-200 text-neutral-900 font-bold px-10 h-14 hover:border-beeyield-green hover:text-beeyield-green transition-all"
            asChild
          >
            <Link to={ctaTo}>
              {ctaLabel}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HoneyProductCollection;
