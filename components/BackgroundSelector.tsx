'use client';

import { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface BackgroundSelectorProps {
  backgroundImage?: string;
  backgroundFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onImageChange: (url: string) => void;
  onFitChange: (fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down') => void;
}

interface GoogleImage {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
}

export function BackgroundSelector({
  backgroundImage,
  backgroundFit = 'cover',
  onImageChange,
  onFitChange,
}: BackgroundSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('visual novel cg');
  const [allImages, setAllImages] = useState<GoogleImage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imagesPerPage = 10;
  const currentImages = allImages.slice(currentPage * imagesPerPage, (currentPage + 1) * imagesPerPage);
  const totalPages = Math.ceil(allImages.length / imagesPerPage);

  const fetchImages = async (query: string, startIndex: number = 0) => {
    setLoading(true);
    setError(null);
    
    const perPage = 10;
    const page = Math.floor(startIndex / perPage) + 1;

    // Strategy 1: Try VNDB API (Visual Novel Database - public API)
    try {
      // VNDB uses JSON-RPC 2.0 format
      // Filter for safe content: rating = "safe" or exclude adult content
      const vndbRequest = {
        id: 1,
        method: 'get',
        params: {
          q: query || '',
          filters: ['and', ['rating', '=', 'safe'], ['image', '!=', null]], // Safe content with images
          fields: 'id,title,image,rating',
          results: perPage,
          page: page,
        },
      };

      const response = await fetch('https://api.vndb.org/kana/vn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify(vndbRequest),
      });

      if (response.ok) {
        const data = await response.json();
        // VNDB returns { results: [...] } format
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const vndbImages: GoogleImage[] = data.results
            .filter((vn: any) => {
              // Double check: only safe rating and has image
              const rating = (vn.rating || '').toLowerCase();
              const isSafe = rating === 'safe' || rating === 'all ages' || rating === '' || !rating;
              return isSafe && vn.image;
            })
            .slice(0, perPage)
            .map((vn: any, idx: number) => {
              // VNDB image URL format: https://vndb.org/i/[id].jpg or use image field directly
              const imageUrl = vn.image || `https://vndb.org/i/${vn.id}.jpg`;
              return {
                id: `vndb-${vn.id || startIndex + idx}`,
                url: imageUrl,
                thumbnail: imageUrl,
                title: vn.title || `Visual Novel ${startIndex + idx + 1}`,
              };
            });
          
          if (vndbImages.length > 0) {
            console.log(`[VNDB] Successfully loaded ${vndbImages.length} images`);
            if (startIndex === 0) {
              setAllImages(vndbImages);
              setCurrentPage(0);
            } else {
              setAllImages(prev => [...prev, ...vndbImages]);
            }
            setError(null);
            setLoading(false);
            return;
          }
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.warn('VNDB API response not ok:', response.status, errorText.substring(0, 100));
      }
    } catch (err) {
      console.warn('VNDB API failed, trying next:', err);
    }

    // Strategy 2: Try Hitomi.la API (public gallery search with safe filter)
    try {
      // Hitomi.la uses a specific endpoint for gallery search
      // We'll search for "visual novel" tag and filter NSFW
      const searchQuery = encodeURIComponent('visual novel');
      const response = await fetch(
        `https://ltn.hitomi.la/galleries.json?query=${searchQuery}&offset=${startIndex}&limit=${perPage}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://hitomi.la/',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const hitomiImages: GoogleImage[] = data
            .filter((gallery: any) => {
              // Filter NSFW content - check tags and type
              const tags = gallery.tags || [];
              const type = (gallery.type || '').toLowerCase();
              const hasNsfwTag = tags.some((tag: any) => {
                const tagStr = (typeof tag === 'string' ? tag : tag.name || '').toLowerCase();
                return tagStr.includes('nsfw') || tagStr.includes('explicit') || tagStr.includes('adult');
              });
              return !hasNsfwTag && type !== 'doujinshi'; // Exclude doujinshi
            })
            .slice(0, perPage)
            .map((gallery: any, idx: number) => {
              // Hitomi.la image URL format
              const galleryId = gallery.id || startIndex + idx;
              const imageUrl = `https://a.hitomi.la/galleries/${galleryId}/cover.jpg`;
              return {
                id: `hitomi-${galleryId}`,
                url: imageUrl,
                thumbnail: imageUrl,
                title: gallery.title || gallery.name || `Gallery ${startIndex + idx + 1}`,
              };
            });
          
          if (hitomiImages.length > 0) {
            console.log(`[Hitomi.la] Successfully loaded ${hitomiImages.length} images`);
            if (startIndex === 0) {
              setAllImages(hitomiImages);
              setCurrentPage(0);
            } else {
              setAllImages(prev => [...prev, ...hitomiImages]);
            }
            setError(null);
            setLoading(false);
            return;
          }
        }
      } else {
        console.warn('Hitomi.la API response not ok:', response.status);
      }
    } catch (err) {
      console.warn('Hitomi.la API failed, trying next:', err);
    }

    // Strategy 3: Use curated safe visual novel backgrounds (always works)
    try {
      // Curated list of safe, beautiful backgrounds suitable for visual novel style
      const curatedImages: GoogleImage[] = [
        {
          id: 'curated-1',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=250&fit=crop&q=80',
          title: 'Anime style background',
        },
        {
          id: 'curated-2',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=250&fit=crop&q=80',
          title: 'Fantasy landscape',
        },
        {
          id: 'curated-3',
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=250&fit=crop&q=80',
          title: 'Abstract gradient',
        },
        {
          id: 'curated-4',
          url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=250&fit=crop&q=80',
          title: 'Colorful gradient',
        },
        {
          id: 'curated-5',
          url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=250&fit=crop&q=80',
          title: 'Abstract art',
        },
        {
          id: 'curated-6',
          url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=250&fit=crop&q=80',
          title: 'Mountain landscape',
        },
        {
          id: 'curated-7',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=250&fit=crop&q=80',
          title: 'Ocean view',
        },
        {
          id: 'curated-8',
          url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=250&fit=crop&q=80',
          title: 'Sunset sky',
        },
        {
          id: 'curated-9',
          url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&h=250&fit=crop&q=80',
          title: 'Forest path',
        },
        {
          id: 'curated-10',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=250&fit=crop&q=80',
          title: 'Nature scene',
        },
      ];
      
      // Paginate curated images
      const startIdx = startIndex % curatedImages.length;
      const paginatedImages = curatedImages.slice(startIdx, startIdx + perPage);
      if (paginatedImages.length < perPage) {
        // Wrap around if needed
        const remaining = perPage - paginatedImages.length;
        paginatedImages.push(...curatedImages.slice(0, remaining));
      }
      
      if (startIndex === 0) {
        setAllImages(paginatedImages);
        setCurrentPage(0);
      } else {
        setAllImages(prev => [...prev, ...paginatedImages]);
      }
      setError(null);
      setLoading(false);
      return;
    } catch (err) {
      console.warn('Curated images failed:', err);
    }

    // Final Fallback: Use curated safe visual novel backgrounds
    try {
      const fallbackImages: GoogleImage[] = [
        {
          id: 'vn1',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=250&fit=crop&q=80',
          title: 'Anime style background',
        },
        {
          id: 'vn2',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=250&fit=crop&q=80',
          title: 'Fantasy landscape',
        },
        {
          id: 'vn3',
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=250&fit=crop&q=80',
          title: 'Abstract gradient',
        },
        {
          id: 'vn4',
          url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=250&fit=crop&q=80',
          title: 'Colorful gradient',
        },
        {
          id: 'vn5',
          url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1080&h=1350&fit=crop&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=250&fit=crop&q=80',
          title: 'Abstract art',
        },
      ];
      setAllImages(fallbackImages);
      setCurrentPage(0);
      setError(null);
    } catch (err) {
      setError('Failed to load images. Please try again.');
      setAllImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(searchQuery);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(0);
      fetchImages(searchQuery, 0);
    }
  };

  const handleNext = () => {
    if ((currentPage + 1) * imagesPerPage < allImages.length) {
      setCurrentPage(prev => prev + 1);
    } else {
      // Load more images
      fetchImages(searchQuery, allImages.length);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const fitOptions: Array<{ value: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'; label: string }> = [
    { value: 'cover', label: 'Cover' },
    { value: 'contain', label: 'Contain' },
    { value: 'fill', label: 'Fill' },
    { value: 'none', label: 'None' },
    { value: 'scale-down', label: 'Scale Down' },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 space-y-3">
      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Background Selector
      </h4>

      {/* Custom URL Input */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Custom Image URL (optional)
        </label>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url && url.startsWith('http')) {
              onImageChange(url);
            }
          }}
          className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visual novel backgrounds..."
            className="w-full pl-9 pr-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Background Fit Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Background Fit
        </label>
        <select
          value={backgroundFit}
          onChange={(e) => onFitChange(e.target.value as typeof backgroundFit)}
          className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {fitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Image Grid with Pagination */}
      <div className="space-y-2">
        <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-800">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-xs text-amber-600 dark:text-amber-400 py-4 text-center">
              {error}
            </div>
          ) : currentImages.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              No images found. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {currentImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onImageChange(image.url)}
                  className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${
                    backgroundImage === image.url
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.title || 'Background'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback jika gambar gagal load
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x250?text=Image';
                    }}
                  />
                  {backgroundImage === image.url && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {allImages.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0 || loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Page {currentPage + 1} {totalPages > 0 && `of ${totalPages}`}
            </span>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Current Selection Preview */}
      {backgroundImage && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium">Selected:</span> Background image loaded
        </div>
      )}
    </div>
  );
}

