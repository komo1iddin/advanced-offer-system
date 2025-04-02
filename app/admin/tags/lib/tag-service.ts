// Define the Tag interface
export interface Tag {
  _id: string;
  name: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cache mechanism
interface TagsCache {
  data: Tag[] | null;
  timestamp: number;
}

// Initialize cache
const tagsCache: TagsCache = {
  data: null,
  timestamp: 0
};

// Validate cache
function isCacheValid(cache: TagsCache): boolean {
  const CACHE_TTL = 60 * 1000; // 1 minute
  return !!cache.data && (Date.now() - cache.timestamp < CACHE_TTL);
}

// Invalidate cache
function invalidateCache() {
  tagsCache.data = null;
  tagsCache.timestamp = 0;
}

// Fetch all tags with caching
export const fetchTags = async (activeOnly: boolean = false, category?: string): Promise<Tag[]> => {
  if (isCacheValid(tagsCache)) {
    let result = tagsCache.data!;
    
    // Apply filters to cached data
    if (activeOnly) {
      result = result.filter(tag => tag.active);
    }
    
    if (category) {
      result = result.filter(tag => tag.category === category);
    }
    
    return result;
  }
  
  try {
    console.log("Fetching tags from API...");
    
    // Build query parameters
    const params = new URLSearchParams();
    if (activeOnly) {
      params.append('activeOnly', 'true');
    }
    if (category) {
      params.append('category', category);
    }
    
    const response = await fetch(`/api/tags?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Failed to fetch tags: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("API response data count:", data?.length || 0);
    
    if (!Array.isArray(data)) {
      console.error("Invalid data format received:", data);
      throw new Error("Invalid data format received from API");
    }

    tagsCache.data = data;
    tagsCache.timestamp = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    invalidateCache();
    throw error;
  }
};

// Add a new tag
export async function addTag(newTag: Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  try {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTag),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add tag');
    }
    
    invalidateCache();
    
    return await response.json();
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
}

// Update an existing tag
export async function updateTag(
  tagId: string,
  updates: Partial<Omit<Tag, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Tag> {
  try {
    // Optimistic update
    if (tagsCache.data) {
      const updatedTags = tagsCache.data.map(tag => 
        tag._id === tagId ? { ...tag, ...updates } : tag
      );
      tagsCache.data = updatedTags;
    }
    
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tag');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating tag:', error);
    invalidateCache();
    throw error;
  }
}

// Delete a tag
export async function deleteTag(tagId: string): Promise<void> {
  try {
    // Optimistic update
    if (tagsCache.data) {
      tagsCache.data = tagsCache.data.filter(tag => tag._id !== tagId);
    }
    
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete tag');
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    invalidateCache();
    throw error;
  }
} 