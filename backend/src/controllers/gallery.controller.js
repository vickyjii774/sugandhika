import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { toSlug } from '../utils/slug.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

/** GET /api/gallery — public */
export async function getPublishedAlbums(_req, res, next) {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { images: true } } },
    });
    return sendSuccess(res, albums);
  } catch (err) { next(err); }
}

/** GET /api/gallery/:slug — public */
export async function getAlbumBySlug(req, res, next) {
  try {
    const album = await prisma.galleryAlbum.findUnique({
      where: { slug: req.params.slug, isPublished: true },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!album) return sendError(res, 'Album not found', 404);
    return sendSuccess(res, album);
  } catch (err) { next(err); }
}

/** GET /api/gallery/featured — public */
export async function getFeaturedImages(_req, res, next) {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isFeatured: true, album: { isPublished: true } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return sendSuccess(res, images);
  } catch (err) { next(err); }
}

/** GET /api/admin/gallery/albums — all */
export async function getAllAlbums(_req, res, next) {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { images: true } } },
    });
    return sendSuccess(res, albums);
  } catch (err) { next(err); }
}

/** POST /api/admin/gallery/albums */
export async function createAlbum(req, res, next) {
  try {
    const { title, description, isPublished, sortOrder, coverImageUrl: suppliedCoverUrl } = req.body;
    if (!title) return sendError(res, 'title required', 400);
    const slug = toSlug(title);
    let coverImageUrl = suppliedCoverUrl || null, coverImagePath;
    if (req.file) {
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'gallery/covers', `cover-${Date.now()}`);
      coverImageUrl = r.url; coverImagePath = r.path;
    }
    const album = await prisma.galleryAlbum.create({
      data: { title, slug, description, coverImageUrl, coverImagePath, isPublished: isPublished !== false, sortOrder: parseInt(sortOrder) || 0 },
    });
    return sendSuccess(res, album, 'Album created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/gallery/albums/:id */
export async function updateAlbum(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Album not found', 404);
    const { title, description, isPublished, sortOrder, coverImageUrl: suppliedCoverUrl } = req.body;
    let coverImageUrl = suppliedCoverUrl !== undefined ? suppliedCoverUrl : existing.coverImageUrl, coverImagePath = existing.coverImagePath;
    if (req.file) {
      if (coverImagePath) await deleteFile(coverImagePath).catch(() => {});
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'gallery/covers', `cover-${Date.now()}`);
      coverImageUrl = r.url; coverImagePath = r.path;
    }
    const data = { description, coverImageUrl, coverImagePath };
    if (title) { data.title = title; data.slug = toSlug(title); }
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    const album = await prisma.galleryAlbum.update({ where: { id }, data });
    return sendSuccess(res, album, 'Album updated');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/gallery/albums/:id */
export async function deleteAlbum(req, res, next) {
  try {
    const album = await prisma.galleryAlbum.findUnique({ where: { id: req.params.id }, include: { images: true } });
    if (!album) return sendError(res, 'Album not found', 404);
    if (album.coverImagePath) await deleteFile(album.coverImagePath).catch(() => {});
    await Promise.all(album.images.map(img => img.storagePath ? deleteFile(img.storagePath).catch(() => {}) : null));
    await prisma.galleryAlbum.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Album deleted');
  } catch (err) { next(err); }
}

/** POST /api/admin/gallery/albums/:id/images */
export async function uploadImages(req, res, next) {
  try {
    if (!req.files?.length) return sendError(res, 'No files uploaded', 400);
    const images = await Promise.all(
      req.files.map(async (file, i) => {
        const r = await uploadFile(file.buffer, file.mimetype, `gallery/${req.params.id}`, `img-${Date.now()}-${i}`);
        return prisma.galleryImage.create({ data: { albumId: req.params.id, url: r.url, storagePath: r.path, sortOrder: i } });
      })
    );
    return sendSuccess(res, images, 'Images uploaded', 201);
  } catch (err) { next(err); }
}

/** POST /api/admin/gallery/albums/:id/images/url — add an externally hosted image */
export async function addImageByUrl(req, res, next) {
  try {
    const { url, title, description } = req.body;
    if (!url || !/^https?:\/\//i.test(url)) return sendError(res, 'A valid http(s) image URL is required', 400);
    const image = await prisma.galleryImage.create({ data: { albumId: req.params.id, url, title, description } });
    return sendSuccess(res, image, 'Image URL added', 201);
  } catch (err) { next(err); }
}

/** DELETE /api/admin/gallery/images/:id */
export async function deleteImage(req, res, next) {
  try {
    const image = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
    if (!image) return sendError(res, 'Image not found', 404);
    if (image.storagePath) await deleteFile(image.storagePath).catch(() => {});
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Image deleted');
  } catch (err) { next(err); }
}

/** PUT /api/admin/gallery/albums/:id/reorder */
export async function reorderImages(req, res, next) {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ id, sortOrder }) =>
      prisma.galleryImage.update({ where: { id }, data: { sortOrder } })
    ));
    return sendSuccess(res, null, 'Images reordered');
  } catch (err) { next(err); }
}


/** GET /api/admin/gallery/albums/:id */
export async function getAlbumById(req, res, next) {
  try {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: req.params.id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!album) return sendError(res, 'Album not found', 404);
    return sendSuccess(res, album);
  } catch (err) { next(err); }
}
