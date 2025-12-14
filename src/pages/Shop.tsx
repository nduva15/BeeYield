import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import productImage from "@/assets/product-honey.jpg";

const Shop = () => {
  const products = [
    {
      id: 1,
      name: "Wildflower Honey",
      description: "A delicate blend from diverse wildflower meadows",
      price: "$18.99",
      size: "500g",
      badge: "Bestseller",
      image: productImage,
    },
    {
      id: 2,
      name: "Acacia Honey",
      description: "Light, clear honey with a mild, sweet flavor",
      price: "$22.99",
      size: "500g",
      badge: "Premium",
      image: productImage,
    },
    {
      id: 3,
      name: "Lavender Honey",
      description: "Aromatic honey with subtle floral notes",
      price: "$24.99",
      size: "500g",
      badge: "Limited Edition",
      image: productImage,
    },
    {
      id: 4,
      name: "Forest Honey",
      description: "Rich, dark honey from mountain forests",
      price: "$21.99",
      size: "500g",
      badge: null,
      image: productImage,
    },
    {
      id: 5,
      name: "Orange Blossom Honey",
      description: "Citrus-scented honey with bright flavor",
      price: "$20.99",
      size: "500g",
      badge: "New",
      image: productImage,
    },
    {
      id: 6,
      name: "Honeycomb Gift Set",
      description: "Raw honeycomb pieces in natural wax",
      price: "$34.99",
      size: "400g",
      badge: "Gift Set",
      image: productImage,
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Our Honey Collection</h1>
          <p className="text-xl text-muted-foreground">
            Premium artisan honey, sustainably sourced and fully traceable
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-all hover:shadow-glow">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
                {product.badge && (
                  <Badge className="absolute right-4 top-4 bg-secondary text-secondary-foreground">
                    {product.badge}
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{product.description}</p>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                  <span className="text-sm text-muted-foreground">{product.size}</span>
                </div>
                <Button className="w-full">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-lg bg-muted/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Not sure which honey to choose?</h2>
          <p className="mb-6 text-muted-foreground">
            Each variety has its own unique flavor profile and characteristics. Contact us for personalized recommendations!
          </p>
          <Button variant="outline" size="lg">
            Get Help Choosing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Shop;
