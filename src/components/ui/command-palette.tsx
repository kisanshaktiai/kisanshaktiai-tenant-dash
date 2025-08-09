
import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Building, Package, BarChart3, Settings, Plus } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect(() => navigate('/dashboard'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/farmers'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Farmers</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/dealers'))}>
            <Building className="mr-2 h-4 w-4" />
            <span>Dealers</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/products'))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/analytics'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect(() => navigate('/farmers?action=create'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Farmer</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/dealers?action=create'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Dealer</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate('/products?action=create'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Product</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => handleSelect(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
