import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import { galleryService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryService.getAlbums()
      .then(res => setAlbums(res.data?.albums || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Our Gallery</h1>
          <p className="text-brand-cream/80 text-lg">Explore our products and moments</p>
    
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner /></div>
        ) : albums.length === 0 ? (
          <EmptyState icon={Image} title="No albums yet" description="Gallery content is coming soon." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <Link
                key={album.id}
                to={`/gallery/${album.slug}`}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-video bg-brand-cream overflow-hidden">
                  {album.coverImageUrl ? (
                    <img src={album.coverImageUrl} alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-brand/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-brand transition-colors">{album.title}</h3>
                  {album.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{album.description}</p>}
                  {album._count?.images != null && (
                    <p className="text-xs text-gray-400 mt-2">{album._count.images} photos</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
