
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Download, Loader2, FolderTree, Folder } from 'lucide-react';
import { masterDataService, type MasterProductCategory } from '@/services/MasterDataService';
import ImportPreviewModal from './ImportPreviewModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryTreeItemProps {
  category: MasterProductCategory & { children?: any[] };
  level: number;
  selectedCategories: Set<string>;
  onToggleSelect: (categoryId: string, checked: boolean) => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  selectedCategories,
  onToggleSelect,
}) => {
  const [expanded, setExpanded] = useState(level === 0);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.has(category.id);

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "group flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/40",
          isSelected && "bg-primary/5 border-l-2 border-primary",
          "cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "p-1 rounded-md transition-all duration-200",
              "hover:bg-primary/10 hover:scale-110",
              expanded && "rotate-0",
              !expanded && "-rotate-90"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>
        ) : (
          <div className="w-[26px] flex items-center justify-center">
            <Folder className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}

        <Checkbox
          id={`category-${category.id}`}
          checked={isSelected}
          onCheckedChange={(checked) => onToggleSelect(category.id, checked as boolean)}
          className="transition-transform hover:scale-110"
        />

        <label
          htmlFor={`category-${category.id}`}
          className={cn(
            "flex-1 text-sm font-medium cursor-pointer transition-colors",
            isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
          )}
        >
          {category.name}
        </label>

        {hasChildren && (
          <Badge 
            variant={isHovered ? "default" : "secondary"} 
            className={cn(
              "text-xs font-semibold transition-all duration-200",
              isHovered && "scale-110"
            )}
          >
            {category.children.length}
          </Badge>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="animate-fade-in">
          {category.children.map((child: any) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategories={selectedCategories}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function MasterCategoryBrowser() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const { data: categoryTree, isLoading } = useQuery({
    queryKey: ['master-category-tree'],
    queryFn: () => masterDataService.getCategoryTree(),
  });

  const { data: allCategories } = useQuery({
    queryKey: ['master-categories-all'],
    queryFn: () => masterDataService.getCategories(),
  });

  const handleToggleSelect = (categoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    if (allCategories) {
      setSelectedCategories(new Set(allCategories.map(c => c.id)));
    }
  };

  const handleClearAll = () => {
    setSelectedCategories(new Set());
  };

  const selectedCategoriesList = allCategories?.filter(c => selectedCategories.has(c.id)) || [];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Category Catalog</CardTitle>
                {selectedCategories.size > 0 && (
                  <Badge variant="default" className="mt-1 animate-scale-in">
                    {selectedCategories.size} selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="hover:bg-primary/5 hover:border-primary transition-all"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedCategories.size === 0}
                className="hover:bg-destructive/5 hover:border-destructive transition-all"
              >
                Clear
              </Button>
              <Button
                onClick={() => setShowPreview(true)}
                disabled={selectedCategories.size === 0}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-md hover:shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Import ({selectedCategories.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-1">
                {categoryTree?.map((category: any) => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    level={0}
                    selectedCategories={selectedCategories}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {showPreview && (
        <ImportPreviewModal
          type="category"
          items={selectedCategoriesList}
          onClose={() => setShowPreview(false)}
          onSuccess={() => {
            setSelectedCategories(new Set());
            setShowPreview(false);
          }}
        />
      )}
    </div>
  );
}
