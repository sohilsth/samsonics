import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Upload, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { toast } from "sonner";
import { productApi, Product, ProductFormData, PaginatedProductResponse, ProductFilter, ProductAttributeInput } from "@/services/productAPI.ts";
import { categoryApi, Category, CategoryAttribute } from "@/services/categoryAPI.ts";

// Form schema aligned with ProductFormData
const productSchema = z.object({
  productName: z.string().min(2, "Name must be at least 2 characters"),
  productUnitPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Price must be a positive number"),
  productDescription: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  productQuantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Quantity must be a non-negative number"),
  hotDeals: z.boolean(),
  productImage: z.instanceof(File).nullable(),
  productAttributes: z.array(
    z.object({
      categoryAttributeId: z.string().min(1, "Attribute ID is required"),
      attributeValue: z.string().min(1, "Attribute value is required"),
    })
  ).optional(),
});

type FormData = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      productUnitPrice: "",
      productDescription: "",
      categoryId: "",
      productQuantity: "",
      hotDeals: false,
      productImage: null,
      productAttributes: [],
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryApi.getAllCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
        const response = await productApi.getAllProducts(filter);
        setProducts(
          response.items.filter(
            (product) =>
              product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [pageNumber, selectedCategory, searchTerm]);

  const filteredProducts = products;

  const onSubmit = async (data: FormData) => {
    try {
      const productData: ProductFormData = {
        productName: data.productName,
        productUnitPrice: Number(data.productUnitPrice),
        productDescription: data.productDescription,
        categoryId: data.categoryId,
        productQuantity: Number(data.productQuantity),
        hotDeals: data.hotDeals,
        productImage: data.productImage,
        productAttributes: data.productAttributes || [],
      };

      setIsLoading(true);
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.productId, productData);
      } else {
        await productApi.createProduct(productData);
      }
      handleCloseDialog();
      const response = await productApi.getAllProducts({ pageNumber, pageSize });
      setProducts(response.items);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    console.log("Editing product:", product);
    setEditingProduct(product);
    
    // Convert ProductAttribute[] to ProductAttributeInput[] for the form
    const formAttributes: ProductAttributeInput[] = product.productAttributes.map(attr => ({
      categoryAttributeId: attr.categoryAttributeId,
      attributeValue: attr.attributeValue,
    }));
    
    form.reset({
      productName: product.productName || "",
      productUnitPrice: product.productUnitPrice != null ? product.productUnitPrice.toString() : "",
      productDescription: product.productDescription || "",
      categoryId: product.categoryId || "",
      productQuantity: product.productQuantity != null ? product.productQuantity.toString() : "",
      hotDeals: product.hotDeals || false,
      productImage: null,
      productAttributes: formAttributes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.deleteProduct(productId);
        const response = await productApi.getAllProducts({ pageNumber, pageSize });
        setProducts(response.items);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  // Get attributes for the selected category
  const selectedCategoryAttributes = categories.find((c) => c.categoryId === form.watch("categoryId"))?.categoryAttributes || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products Management</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="size-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="iPhone 15 Pro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productUnitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Npr.)</FormLabel>
                          <FormControl>
                            <Input placeholder="999" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="100" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.categoryId} value={category.categoryId!}>
                                {category.categoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product description..." className="min-h-24" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                            />
                            <Button type="button" variant="outline" size="sm">
                              <Upload className="size-4" />
                            </Button>
                          </div>
                        </FormControl>
                        {editingProduct && (
                          <div className="mt-2">
                            <img
                              src={editingProduct.productImageUrl}
                              alt="Current product"
                              className="w-24 h-24 object-cover rounded-md"
                            />
                            <p className="text-sm text-muted-foreground">Current Cloudinary Image</p>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hotDeals"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} id="hotDeals" />
                        </FormControl>
                        <FormLabel htmlFor="hotDeals" className="text-sm font-medium">
                          Hot Deals
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic attributes based on selected category */}
                  {selectedCategoryAttributes.length > 0 && (
                    <FormField
                      control={form.control}
                      name="productAttributes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Attributes</FormLabel>
                          {selectedCategoryAttributes.map((attr, index) => (
                            <div key={attr.attributeId} className="space-y-2">
                              <FormLabel>
                                {attr.attributeName} {attr.isRequired && <span className="text-red-500">*</span>}
                              </FormLabel>
                              {attr.type === "dropdown" ? (
                                <Select
                                  value={field.value?.[index]?.attributeValue || ""}
                                  onValueChange={(value) => {
                                    const newAttributes = [...(field.value || [])];
                                    newAttributes[index] = {
                                      categoryAttributeId: attr.attributeId!,
                                      attributeValue: value,
                                    };
                                    field.onChange(newAttributes);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${attr.attributeName}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {attr.possibleValuesJson.map((value) => (
                                      <SelectItem key={value} value={value}>
                                        {value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : attr.type === "checkbox" ? (
                                <Checkbox
                                  checked={field.value?.[index]?.attributeValue === "true"}
                                  onCheckedChange={(checked) => {
                                    const newAttributes = [...(field.value || [])];
                                    newAttributes[index] = {
                                      categoryAttributeId: attr.attributeId!,
                                      attributeValue: checked ? "true" : "false",
                                    };
                                    field.onChange(newAttributes);
                                  }}
                                />
                              ) : (
                                <Input
                                  value={field.value?.[index]?.attributeValue || ""}
                                  onChange={(e) => {
                                    const newAttributes = [...(field.value || [])];
                                    newAttributes[index] = {
                                      categoryAttributeId: attr.attributeId!,
                                      attributeValue: e.target.value,
                                    };
                                    field.onChange(newAttributes);
                                  }}
                                  placeholder={`Enter ${attr.attributeName}`}
                                />
                              )}
                            </div>
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        editingProduct ? "Update Product" : "Create Product"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId} value={category.categoryId!}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <img
                          src={product.productImageUrl}
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.productDescription}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{product.productUnitPrice != null ? `NRS.${product.productUnitPrice.toLocaleString()}` : "N/A"}</TableCell>
                      <TableCell>{product.productQuantity != null ? product.productQuantity : "N/A"}</TableCell>
                      <TableCell>
                        {product.hotDeals && (
                          <Badge className="bg-yellow-100 text-yellow-800">Hot Deal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.productId)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                disabled={pageNumber === 1 || isLoading}
                onClick={() => handlePageChange(pageNumber - 1)}
              >
                Previous
              </Button>
              <span>
                Page {pageNumber} of {Math.ceil(totalCount / pageSize)}
              </span>
              <Button
                disabled={pageNumber * pageSize >= totalCount || isLoading}
                onClick={() => handlePageChange(pageNumber + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
