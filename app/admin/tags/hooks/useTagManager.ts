import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import {
  Tag,
  fetchTags,
  addTag,
  updateTag,
  deleteTag
} from "../lib/tag-service";
import { TagRow, processTagsForTable } from "../lib/utils";

export function useTagManager() {
  // Data states
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagRows, setTagRows] = useState<TagRow[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  
  // Submission state
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if data is being loaded to prevent duplicate requests
  const isLoadingRef = useRef(false);

  const { toast } = useToast();

  // Add effect for cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Update tag rows when tags change
  useEffect(() => {
    setTagRows(processTagsForTable(tags));
  }, [tags]);

  // Load all tag data
  const loadData = useCallback(async () => {
    // Prevent duplicate loading
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Fetching tags data...");
      const tagsData = await fetchTags();
      console.log("Tags data received:", tagsData);
      
      if (isMounted.current) {
        setTags(tagsData || []); // Ensure we always set an array even if response is null
        // Tag rows will be updated in the effect
      }
    } catch (error) {
      console.error("Error in loadData:", error);
      if (isMounted.current) {
        // Set empty array to prevent infinite loading
        setTags([]);
        
        toast({
          title: "Error",
          description: "Failed to load tags. Please refresh the page.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [toast]);

  // Tag operations
  const handleAddTag = useCallback(async (data: { name: string; category?: string; active: boolean }) => {
    setIsSubmittingTag(true);
    
    try {
      await addTag(data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag added successfully" });
        setIsAddingTag(false);
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add tag",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingTag(false);
      }
    }
  }, [toast]);

  const handleUpdateTag = useCallback(async (data: { name?: string; category?: string; active?: boolean }) => {
    if (!selectedTag) return;
    
    setIsSubmittingTag(true);
    
    try {
      await updateTag(selectedTag._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag updated successfully" });
        setIsEditingTag(false);
        setSelectedTag(null);
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update tag",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingTag(false);
      }
    }
  }, [selectedTag, toast]);

  const handleDeleteTag = useCallback(async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }
    
    try {
      await deleteTag(tagId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Tag deleted successfully" });
        
        // Reload tags
        const updatedTags = await fetchTags();
        setTags(updatedTags);
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete tag",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleEditTag = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    setIsEditingTag(true);
  }, []);

  // Dialog controls
  const dialogControls = {
    add: {
      isOpen: isAddingTag,
      setOpen: setIsAddingTag,
      isSubmitting: isSubmittingTag
    },
    edit: {
      isOpen: isEditingTag,
      setOpen: setIsEditingTag,
      isSubmitting: isSubmittingTag,
      selected: selectedTag
    }
  };

  return {
    // Data
    tags,
    tagRows,
    isLoading,
    
    // Operations
    loadData,
    handleAddTag,
    handleUpdateTag,
    handleDeleteTag,
    handleEditTag,
    
    // Dialog controls
    dialogControls
  };
} 