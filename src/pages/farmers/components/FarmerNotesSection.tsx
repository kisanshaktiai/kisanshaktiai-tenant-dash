
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Tag, FileText, AlertCircle, Calendar } from 'lucide-react';
import { useFarmerNotesQuery, useAddFarmerNoteMutation, useFarmerTagsQuery, useAddFarmerTagMutation } from '@/hooks/data/useEnhancedFarmerQuery';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FarmerNotesSectionProps {
  farmerId: string;
}

export const FarmerNotesSection: React.FC<FarmerNotesSectionProps> = ({ farmerId }) => {
  const [newNote, setNewNote] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');

  const { data: notes = [], refetch: refetchNotes } = useFarmerNotesQuery(farmerId);
  const { data: tags = [], refetch: refetchTags } = useFarmerTagsQuery(farmerId);
  const addNoteMutation = useAddFarmerNoteMutation();
  const addTagMutation = useAddFarmerTagMutation();

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await addNoteMutation.mutateAsync({
        farmerId,
        noteData: {
          note_content: newNote,
          is_important: isImportant,
          is_private: false
        }
      });
      
      setNewNote('');
      setIsImportant(false);
      refetchNotes();
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    try {
      await addTagMutation.mutateAsync({
        farmerId,
        tagData: {
          tag_name: newTag,
          tag_color: tagColor
        }
      });
      
      setNewTag('');
      refetchTags();
      toast.success('Tag added successfully');
    } catch (error) {
      toast.error('Failed to add tag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} style={{ backgroundColor: tag.tag_color }}>
                {tag.tag_name}
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-gray-500 text-sm">No tags added yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1"
            />
            <input
              type="color"
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value)}
              className="w-10 h-10 rounded border"
            />
            <Button onClick={handleAddTag} disabled={addTagMutation.isPending}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Note */}
          <div className="space-y-3">
            <Textarea
              id="farmerNote"
              name="farmerNote"
              placeholder="Add a note about this farmer..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isImportant}
                  onCheckedChange={setIsImportant}
                />
                <label className="text-sm">Mark as important</label>
              </div>
              <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className={note.is_important ? 'border-orange-200 bg-orange-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {note.is_important && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-sm text-gray-500">
                        {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {note.is_important && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Important
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700">{note.note_content}</p>
                </CardContent>
              </Card>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notes added yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
