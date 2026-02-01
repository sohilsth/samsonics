import { useState, useEffect } from "react";
import ProductDialog from "./ProductDilaog";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { productApi, Product, PaginatedProductResponse, ProductFilter } from "@/services/productAPI.ts";
import { categoryApi, Category } from "@/services/categoryAPI.ts";

export default function Index() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Fetch product details by ID and open dialog
  const handleProductClick = async (productId: string) => {
    setDialogLoading(true);
    setDialogError(null);
    setDialogOpen(true);
    try {
      const product = await productApi.getProduct(productId);
      console.log("LOG :", JSON.stringify(product,null, 2));
      setSelectedProduct(product);
    } catch (err: any) {
      setDialogError(err.message || "Failed to fetch product details");
      setSelectedProduct(null);
    } finally {
      setDialogLoading(false);
    }
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12); // or any number you want
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories for mapping categoryId to categoryName
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryApi.getAllCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  
   // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const filter: ProductFilter = {
          pageNumber,
          pageSize,
        };
        const response: PaginatedProductResponse = await productApi.getAllProducts(filter);
        setProducts(response.items);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [pageNumber, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items pb-10">
        {/* Background Effects */}
        <div className="absolute pt-20 inset-0 bg-gradient-to-b from-gray-900 via-[#1a2236] to-black">
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}></div>
          {/* Frosted glass effect for content */}
          <div className="absolute inset-0 backdrop-blur-[1px]"></div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content (now info cards) */}
            <div className="relative z-10 space-y-8 flex flex-col items-start justify-start">
              {/* Main Text Content */}
              <div className="space-y-6">
                <div className="inline-flex items-start gap-2 bg-primary/10 backdrop-blur-sm rounded-full pl-1 pr-4 py-1">
                  <Badge variant="secondary" className="bg-primary text-white">New</Badge>
                  <span className="text-primary text-sm text-white font-medium">Exclusive 2025 Collection</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold">
                  <span
                    className="relative inline-block bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer text-left"
                    style={{
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundImage: 'linear-gradient(90deg, #c998fdff 10%, #a5b4fc 35%, #38bdf8 60%, #f9a8d4 85%, #a5b4fc 100%)',
                    }}
                  >
                    Premium Electronics
                  </span>
                  <span className="block mt-2 text-4xl lg:text-6xl text-[#F7F764] text-left">at Best Prices</span>
                </h1>
                <p className="text-l text-white max-w-lg leading-relaxed">
                        Discover the latest in premium electronics—innovative gadgets, unbeatable quality, and seamless shopping, all in one place. Elevate your tech experience today!
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-row gap-4 justify-start items-start">
                <div className="flex flex-row gap-4">
                  <Link to="/products">
                    <Button size="lg" className="group w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-300 hover:-translate-y-0.5">
                      Explore Products
                      <ArrowRight className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button variant="outline" size="lg" className="w-full text-white sm:w-auto border-2 border-primary/20 bg-transparent hover:bg-[#fff] hover:text-gray-850 transition-colors">
                      Contact Us
                    </Button>
                  </Link>
                </div>
                </div>
                {/* Info Cards below buttons */}
                <div className="flex flex-row gap-4 mt-4">
                  {/* Info Card - Guaranteed */}
                  <div className="bg-white rounded-xl shadow ring-1 ring-primary/10 hover:ring-primary/30 transition-all duration-200 p-2 backdrop-blur-sm bg-white/80 w-40 hover:scale-105">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1 rounded-xl">
                        <Shield className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-gray-900">Premium</p>
                        <p className="text-[10px] text-gray-600">Guaranteed</p>
                      </div>
                    </div>
                  </div>
                  {/* Info Card - Special */}
                  <div className="bg-white rounded-xl shadow ring-1 ring-yellow-400/20 hover:ring-yellow-400/40 transition-all duration-200 p-2 backdrop-blur-sm bg-white/80 w-40 hover:scale-105">
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-100 p-1 rounded-xl">
                        <Star className="size-4 text-yellow-500" fill="currentColor" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-gray-900">Special</p>
                        <p className="text-[10px] text-gray-600">Exclusive</p>
                      </div>
                    </div>
                  </div>
                  {/* Offer Card - Consistent Style */}
                  <div className="bg-white rounded-xl shadow ring-1 ring-pink-400/20 hover:ring-pink-400/40 transition-all duration-200 p-2 backdrop-blur-sm bg-white/80 w-40 hover:scale-105">
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-100 p-1 rounded-xl">
                        <span className="text-pink-600 text-xs">30%</span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-gray-900">Offer</p>
                        <p className="text-[10px] text-gray-600">Limited deal</p>
                      </div>
                    </div>
                  </div>
                </div>
             
            </div>

            {/* Right Content - Product Showcase */}
            <div className="relative z-10 flex items-center justify-center">
              {/* Product Image Only, no container */}
              <div className="flex flex-col items-center justify-center w-full">
                <img 
                  src="/banner.png" 
                  alt="Latest Electronics"
                  width={700}
                  height={500}
                  className="object-contain animate-fadein-up"
                  style={{ width: 700, height: 550 }}
                />
                {/* Stats under the image, right column */}
                <div className="grid grid-cols-3 gap-2 w-full pb-15">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">24/7</div>
                    <div className="text-sm text-gray-300">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">1 Year</div>
                    <div className="text-sm text-gray-300">Warranty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">30 Day</div>
                    <div className="text-sm text-gray-300">Returns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              Handpicked selection of our most popular and innovative electronic products
            </p>
          </div>
          
           {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {products.map((product) => (
              <Card
                key={product.productId}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 h-100 x flex-col justify-between items-center bg-white border border-gray-100 rounded-xl"
                onClick={() => handleProductClick(product.productId)}
              >
                <CardContent className="p-0 flex flex-col items-center w-full h-full">
                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-t-xl bg-gray-50 min-h-[140px]">
                    <img
                      src={product.productImageUrl}
                      alt={product.productName}
                      className="object-contain max-h-40 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 w-full flex flex-col items-center">
                    <h3 className="font-semibold text-gray-900 text-center mb-1 line-clamp-1">
                      {product.productName}
                    </h3>
                    <span className="text-sm mb-1 font-mono">
                      {product.productUnitPrice != null ? `NPR-${product.productUnitPrice}` : "N/A"}
                    </span>
                    <span className="text-xs text-gray-500">{categories.find((c) => c.categoryId === product.categoryId)?.categoryName || product.categoryId}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      {/* Product Details Dialog (shared component) */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
      />
      {dialogLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-lg font-semibold text-primary">Loading...</div>
        </div>
      )}
      {dialogError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-lg font-semibold text-red-600">{dialogError}</div>
        </div>
      )}
          </div>
        )}

          
          <div className="text-center">
            <Link to="/products">
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Samsonix?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-balance">
              We provide the best shopping experience with premium quality products and services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Truck className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Free shipping on orders over $50. Get your products delivered quickly and safely to your doorstep.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Shield className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quality Guarantee
              </h3>
              <p className="text-gray-600">
                All products come with manufacturer warranty and our 30-day money-back guarantee.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Headphones className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our customer service team is available around the clock to help you with any questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-xl opacity-90 mb-8 text-balance">
            Browse our extensive collection of premium electronic products and find the perfect device for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explore Products
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to="/contact">
                  <Button variant="outline" size="lg" className="w-full text-white sm:w-auto border-2 border-primary/20 bg-transparent hover:bg-white hover:text-gray-900 transition-colors">
                    Contact Us
                  </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Add this to your global CSS (e.g., index.css or App.css):
@keyframes fadein-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadein-up {
  animation: fadein-up 1.2s cubic-bezier(0.4,0,0.2,1) both;
}
*/
