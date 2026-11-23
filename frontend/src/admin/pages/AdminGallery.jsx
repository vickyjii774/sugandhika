import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react';
import { galleryService } from '../../services/api.service.js';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ImageUpload from '../../components/ui/ImageUpload.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import useToast from '../../hooks/useToast.js';

const EMPTY_ALBUM_FORM = { title: '', description: '', slug: '' };

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminGallery() {
  const toast = useToast();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlbum, setExpandedAlbum] = useState(null); // albumId
  const [albumImages, setAlbumImages] = useState({}); // { albumId: images[] }
  const [loadingImages, setLoadingImages] = useState({}); // { albumId: bool }

  // Album modal
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState(null);
  const [albumForm, setAlbumForm] = useState(EMPTY_ALBUM_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Upload images modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadAlbum, setUploadAlbum] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Deletes
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(null); // { albumId, imageId }

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await galleryService.adminGetAlbums();
      const data = res?.data;
      setAlbums(Array.isArray(data) ? data : data?.items ?? data?.albums ?? []);
    } catch {
      toast.error('Failed to load albums.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const toggleExpand = async (album) => {
    if (expandedAlbum === album.id) {
      setExpandedAlbum(null);
      return;
    }
    setExpandedAlbum(album.id);
    if (!albumImages[album.id]) {
      setLoadingImages((prev) => ({ ...prev, [album.id]: true }));
      try {
        const res = await galleryService.getAlbumById(album.id);
        const data = res?.data?.album ?? res?.data;
        setAlbumImages((prev) => ({ ...prev, [album.id]: data?.images ?? [] }));
      } catch {
        toast.error('Failed to load images.');
      } finally {
        setLoadingImages((prev) => ({ ...prev, [album.id]: false }));
      }
    }
  };

  const openAddAlbum = () => {
    setEditAlbum(null);
    setAlbumForm(EMPTY_ALBUM_FORM);
    setCoverFile(null);
    setCoverPreview('');
    setSlugEdited(false);
    setAlbumModalOpen(true);
  };

  const openEditAlbum = (album) => {
    setEditAlbum(album);
    setAlbumForm({ title: album.title ?? '', description: album.description ?? '' });
    setCoverFile(null);
    setCoverPreview(album.coverImageUrl ?? '');
    setSlugEdited(true);
    setAlbumModalOpen(true);
  };

  const handleAlbumFormChange = (e) => {
    const { name, value } = e.target;
    setAlbumForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !slugEdited) updated.slug = slugify(value);
      return updated;
    });
  };

  const handleSaveAlbum = async () => {
    if (!albumForm.title) { toast.error('Album name is required.'); return; }
    setSavingAlbum(true);
    try {
      let albumId = editAlbum?.id;
      const payload = { title: albumForm.title, description: albumForm.description };
      if (editAlbum) {
        await galleryService.updateAlbum(editAlbum.id, payload);
      } else {
        const res = await galleryService.createAlbum(payload);
        albumId = res?.data?.id;
      }
      if (coverFile && albumId) {
        const fd = new FormData();
        fd.append('cover', coverFile);
        await galleryService.uploadCover(albumId, fd);
      }
      toast.success(editAlbum ? 'Album updated!' : 'Album created!');
      setAlbumModalOpen(false);
      setAlbumImages((prev) => { const n = { ...prev }; delete n[albumId]; return n; });
      fetchAlbums();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to save album.');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!confirmDeleteAlbum) return;
    try {
      await galleryService.deleteAlbum(confirmDeleteAlbum.id);
      toast.success('Album deleted.');
      setConfirmDeleteAlbum(null);
      if (expandedAlbum === confirmDeleteAlbum.id) setExpandedAlbum(null);
      fetchAlbums();
    } catch {
      toast.error('Failed to delete album.');
    }
  };

  const openUploadImages = (album) => {
    setUploadAlbum(album);
    setUploadFiles([]);
    setUploadModalOpen(true);
  };

  const handleUploadImages = async () => {
    if (!uploadFiles.length || !uploadAlbum) return;
    setUploading(true);
    try {
      const fd = new FormData();
      uploadFiles.forEach((f) => fd.append('images', f));
      await galleryService.uploadImages(uploadAlbum.id, fd);
      toast.success('Images uploaded!');
      setUploadModalOpen(false);
      setAlbumImages((prev) => { const n = { ...prev }; delete n[uploadAlbum.id]; return n; });
      if (expandedAlbum === uploadAlbum.id) {
        const res = await galleryService.getAlbumById(uploadAlbum.id);
        const data = res?.data?.album ?? res?.data;
        setAlbumImages((prev) => ({ ...prev, [uploadAlbum.id]: data?.images ?? [] }));
      }
      fetchAlbums();
    } catch {
      toast.error('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirmDeleteImage) return;
    try {
      await galleryService.deleteImage(confirmDeleteImage.albumId, confirmDeleteImage.imageId);
      toast.success('Image deleted.');
      setAlbumImages((prev) => ({
        ...prev,
        [confirmDeleteImage.albumId]: (prev[confirmDeleteImage.albumId] ?? []).filter(
          (img) => img.id !== confirmDeleteImage.imageId
        ),
      }));
      setConfirmDeleteImage(null);
    } catch {
      toast.error('Failed to delete image.');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <button onClick={openAddAlbum} className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Album
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24"><LoadingSpinner /></div>
      ) : albums.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-lg border border-gray-200">No albums yet.</div>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <div key={album.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Album Header Row */}
              <div className="flex items-center gap-4 p-4">
                {album.coverImageUrl ? (
                  <img src={album.coverImageUrl} alt={album.title} className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{album.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {album._count?.images ?? 0} images
                    {album.isPublished === false && (
                      <span className="ml-2 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs">Draft</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openUploadImages(album)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-cream text-brand text-xs font-medium rounded-lg hover:bg-brand hover:text-white transition">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <button onClick={() => openEditAlbum(album)} className="text-brand hover:text-brand-dark transition" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDeleteAlbum(album)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleExpand(album)} className="text-gray-400 hover:text-gray-700 transition ml-1">
                    {expandedAlbum === album.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Images */}
              {expandedAlbum === album.id && (
                <div className="border-t border-gray-100 p-4">
                  {loadingImages[album.id] ? (
                    <div className="flex justify-center py-6"><LoadingSpinner /></div>
                  ) : (albumImages[album.id] ?? []).length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-6">No images in this album.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {(albumImages[album.id] ?? []).map((img) => {
                        const imgId = img.id;
                        const imgUrl = img.url ?? img.src ?? img;
                        return (
                          <div key={imgId} className="relative group aspect-square">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                            <button
                              onClick={() => setConfirmDeleteImage({ albumId: album.id, imageId: imgId })}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              title="Delete image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Album Modal */}
      <Modal isOpen={albumModalOpen} onClose={() => setAlbumModalOpen(false)} title={editAlbum ? 'Edit Album' : 'Add Album'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Album Name <span className="text-red-500">*</span></label>
            <input name="title" value={albumForm.title} onChange={handleAlbumFormChange} className={inputClass} placeholder="Album name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              value={albumForm.slug}
              onChange={(e) => { setSlugEdited(true); setAlbumForm((p) => ({ ...p, slug: e.target.value })); }}
              className={inputClass}
              placeholder="auto-generated"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={albumForm.description} onChange={handleAlbumFormChange} rows={2} className={inputClass} placeholder="Optional description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <ImageUpload preview={coverPreview} onFileSelect={(f, p) => { setCoverFile(f); setCoverPreview(p); }} label="Upload cover" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAlbumModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
            <button onClick={handleSaveAlbum} disabled={savingAlbum} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-60 flex items-center gap-2">
              {savingAlbum && <LoadingSpinner size="sm" />}
              {savingAlbum ? 'Saving…' : editAlbum ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Images Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title={`Upload Images to "${uploadAlbum?.title}"`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setUploadFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-cream file:text-brand hover:file:bg-brand hover:file:text-white transition"
            />
          </div>
          {uploadFiles.length > 0 && (
            <p className="text-sm text-gray-500">{uploadFiles.length} file(s) selected.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setUploadModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
            <button onClick={handleUploadImages} disabled={uploading || uploadFiles.length === 0} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition disabled:opacity-60 flex items-center gap-2">
              {uploading && <LoadingSpinner size="sm" />}
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Album */}
      <ConfirmDialog
        isOpen={!!confirmDeleteAlbum}
        title="Delete Album"
        message={`Delete album "${confirmDeleteAlbum?.title}" and all its images?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteAlbum}
        onCancel={() => setConfirmDeleteAlbum(null)}
        danger
      />

      {/* Confirm Delete Image */}
      <ConfirmDialog
        isOpen={!!confirmDeleteImage}
        title="Delete Image"
        message="Delete this image permanently?"
        confirmLabel="Delete"
        onConfirm={handleDeleteImage}
        onCancel={() => setConfirmDeleteImage(null)}
        danger
      />
    </div>
  );
}
