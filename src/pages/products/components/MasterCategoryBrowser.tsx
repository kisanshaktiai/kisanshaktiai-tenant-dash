
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Download, Loader2, FolderTree } from 'lucide-react';
import { masterDataService, type MasterProductCategory } from '@/services/MasterDataService';
import ImportPreviewModal from './ImportPreviewModal';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-accent/50 rounded-md transition-colors"
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-accent rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <Checkbox
          id={`category-${category.id}`}
          checked={selectedCategories.has(category.id)}
          onCheckedChange={(checked) => onToggleSelect(category.id, checked as boolean)}
        />

        <label
          htmlFor={`category-${category.id}`}
          className="flex-1 text-sm font-medium cursor-pointer"
        >
          {category.name}
        </label>

        {hasChildren && (
          <Badge variant="secondary" className="text-xs">
            {category.children.length}
          </Badge>
        )}
      </div>

      {hasChildren && expanded && (
        <div>
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              <CardTitle>Category Tree</CardTitle>
              {selectedCategories.size > 0 && (
                <Badge variant="secondary">{selectedCategories.size} selected</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedCategories.size === 0}
              >
                Clear
              </Button>
              <Button
                onClick={() => setShowPreview(true)}
                disabled={selectedCategories.size === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Import Selected ({selectedCategories.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
