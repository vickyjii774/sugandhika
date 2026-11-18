import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import { galleryService } from '../services/api.service.js';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import Lightbox from '../components/ui/Lightbox.jsx';

export default function GalleryAlbumPage() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    setLoading(true);
    galleryService.getAlbum(slug)
      .then(res => setAlbum(res.data?.album || res.data))
      .catch(() => setError('Album not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (error || !album) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500 text-lg">{error || 'Album not found'}</p>
      <Link to="/gallery" className="text-brand hover:underline">Back to Gallery</Link>
    </div>
  );

  const images = album.images || [];
  const lightboxImages = images.map(img => ({ url: img.url || img, alt: img.caption || album.name }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-brand-dark to-brand text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">{album.name}</h1>
          {album.description && <p className="text-brand-cream/80 text-lg">{album.description}</p>}
          <nav className="mt-4 text-sm text-brand-cream/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/gallery" className="hover:text-white">Gallery</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{album.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {images.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Image className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No images in this album yet.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setLightbox({ open: true, index: i })}
                className="break-inside-avoid w-full block overflow-hidden rounded-lg group"
              >
                <img
                  src={img.url || img}
                  alt={img.caption || album.name}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        images={lightboxImages}
        initialIndex={lightbox.index}
        isOpen={lightbox.open}
        onClose={() => setLightbox(l => ({ ...l, open: false }))}
      />
    </div>
  );
}
