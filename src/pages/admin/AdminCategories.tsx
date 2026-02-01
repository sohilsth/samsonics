import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Search, Package, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { categoryApi, Category, CategoryAttribute, CategoryFormData as ApiCategoryFormData } from "@/services/categoryAPI";

// Define form schema with attributes (checkbox type removed)
const attributeSchema = z.object({
  attributeName: z.string().min(1, "Attribute name is required"),
  type: z.enum(["dropdown", "string"]),
  isRequired: z.boolean(),
  possibleValuesJson: z.array(z.string()).optional(),
});

const categorySchema = z.object({
  categoryName: z.string().min(2, "Name must be at least 2 characters"),
  categoryAttributes: z.array(attributeSchema),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type AttributeField = keyof CategoryAttribute;
type AttributeValue = string | boolean | string[];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      categoryAttributes: [],
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const categoriesData = await categoryApi.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: CategoryFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const apiData: ApiCategoryFormData = {
        categoryName: data.categoryName,
        categoryAttributes: data.categoryAttributes.map(attr => ({
          attributeName: attr.attributeName,
          type: attr.type,
          isRequired: attr.isRequired,
          possibleValuesJson: attr.possibleValuesJson || [],
        })),
      };

      if (editingCategory && editingCategory.categoryId) {
        await categoryApi.updateCategory(editingCategory.categoryId, apiData);
      } else {
        await categoryApi.createCategory(apiData);
      }

      await fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category): void => {
    setEditingCategory(category);
    form.reset({
      categoryName: category.categoryName,
      categoryAttributes: category.categoryAttributes.map(attr => ({
        attributeName: attr.attributeName,
        type: attr.type,
        isRequired: attr.isRequired,
        possibleValuesJson: attr.possibleValuesJson || [],
      })),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string, categoryName: string): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        await categoryApi.deleteCategory(categoryId);
        await fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset({
      categoryName: "",
      categoryAttributes: [],
    });
  };

  const handleAddNew = (): void => {
    setEditingCategory(null);
    form.reset({
      categoryName: "",
      categoryAttributes: [],
    });
    setIsDialogOpen(true);
  };

  const addAttribute = (): void => {
    const currentAttributes = form.getValues("categoryAttributes") || [];
    form.setValue("categoryAttributes", [
      ...currentAttributes,
      { attributeName: "", type: "string", isRequired: false, possibleValuesJson: [] }
    ]);
  };

  const removeAttribute = (index: number): void => {
    const currentAttributes = form.getValues("categoryAttributes") || [];
    form.setValue("categoryAttributes", currentAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: AttributeField, value: AttributeValue): void => {
    const currentAttributes = form.getValues("categoryAttributes") || [];
    const updatedAttributes = [...currentAttributes];

    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value,
    };

    form.setValue("categoryAttributes", updatedAttributes);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
            <p className="text-muted-foreground">Organize your products into categories</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="size-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Refrigerator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Attributes</FormLabel>
                    <div className="space-y-4 mt-2">
                      {form.watch("categoryAttributes")?.map((attribute, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Attribute #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAttribute(index)}
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem>
                              <FormLabel>Attribute Name</FormLabel>
                              <FormControl>
                                <Input
                                  value={attribute.attributeName}
                                  onChange={(e) => updateAttribute(index, "attributeName", e.target.value)}
                                  placeholder="Number of doors"
                                />
                              </FormControl>
                            </FormItem>

                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <select
                                  value={attribute.type}
                                  onChange={(e) => updateAttribute(
                                    index,
                                    "type",
                                    e.target.value as "dropdown" | "string"
                                  )}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="dropdown">Dropdown</option>
                                  <option value="string">Text</option>
                                </select>
                              </FormControl>
                            </FormItem>
                          </div>

                          <FormItem>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`required-${index}`}
                                checked={attribute.isRequired}
                                onChange={(e) => updateAttribute(index, "isRequired", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`required-${index}`} className="text-sm font-medium">
                                Required field
                              </label>
                            </div>
                          </FormItem>

                          {attribute.type === "dropdown" && (
                            <FormItem>
                              <FormLabel>Possible Values (one per line)</FormLabel>
                              <FormControl>
                                <Textarea
                                  value={attribute.possibleValuesJson?.join("\n") || ""}
                                  onChange={(e) => updateAttribute(
                                    index,
                                    "possibleValuesJson",
                                    e.target.value.split("\n").filter(v => v.trim())
                                  )}
                                  placeholder="Single&#10;Double&#10;Triple"
                                  className="min-h-20"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        </div>
                      ))}

                      <Button type="button" variant="outline" onClick={addAttribute}>
                        <Plus className="size-4 mr-2" />
                        Add Attribute
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.map((category) => (
            <Card key={category.categoryId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.categoryName}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {category.categoryAttributes.length} attributes
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => category.categoryId && handleDelete(category.categoryId, category.categoryName)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-3">
                  Attributes:
                </div>
                <div className="space-y-2">
                  {category.categoryAttributes.map((attr, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-medium">{attr.attributeName}</span>
                      <span className="text-muted-foreground"> ({attr.type})</span>
                      {attr.isRequired && (
                        <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categories Table View */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Attributes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.categoryId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="size-4 text-primary" />
                          </div>
                          <div className="font-medium">{category.categoryName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {category.categoryAttributes.length} attributes
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => category.categoryId && handleDelete(category.categoryId, category.categoryName)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No categories found</p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Total Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {categories.reduce((total, cat) => total + cat.categoryAttributes.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Attributes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-foreground">
                {categories.length > 0
                  ? Math.round(categories.reduce((total, cat) => total + cat.categoryAttributes.length, 0) / categories.length)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Attributes/Category</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
