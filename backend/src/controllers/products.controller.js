import { prisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { toSlug } from '../utils/slug.js';
import { uploadFile, deleteFile } from '../services/storage.service.js';

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  variants: { where: { isActive: true } },
};

/** GET /api/products — public, with filters */
export async function getPublishedProducts(req, res, next) {
  try {
    const { category, search, sort, featured, page = 1, limit = 20 } = req.query;
    const where = { isPublished: true };
    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];
    const orderBy = sort === 'price-asc' ? { price: 'asc' }
      : sort === 'price-desc' ? { price: 'desc' }
      : sort === 'newest' ? { createdAt: 'desc' }
      : { sortOrder: 'asc' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: parseInt(limit), include: productInclude }),
      prisma.product.count({ where }),
    ]);
    return sendSuccess(res, { products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

/** GET /api/products/featured */
export async function getFeaturedProducts(_req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: productInclude,
    });
    return sendSuccess(res, products);
  } catch (err) { next(err); }
}

/** GET /api/products/:slug — public */
export async function getProductBySlug(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug, isPublished: true },
      include: productInclude,
    });
    if (!product) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, product);
  } catch (err) { next(err); }
}

/** GET /api/admin/products — all */
export async function getAllProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.categoryId = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit), include: productInclude }),
      prisma.product.count({ where }),
    ]);
    return sendSuccess(res, { products, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

/** POST /api/admin/products */
export async function createProduct(req, res, next) {
  try {
    const { name, sku, shortDescription, description, price, discountPrice, categoryId, ingredients, benefits, directions, isFeatured, isPublished, stockQty, availability, seoTitle, seoDescription } = req.body;
    if (!name || !price || !categoryId) return sendError(res, 'name, price, categoryId required', 400);
    const slug = toSlug(name);
    let mainImage, mainImagePath;
    if (req.file) {
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'products', `prod-${Date.now()}`);
      mainImage = r.url; mainImagePath = r.path;
    }
    const product = await prisma.product.create({
      data: { name, slug, sku, shortDescription, description, price: parseFloat(price), discountPrice: discountPrice ? parseFloat(discountPrice) : null, categoryId, mainImage, mainImagePath, ingredients, benefits, directions, isFeatured: isFeatured === 'true', isPublished: isPublished === 'true', stockQty: parseInt(stockQty) || 0, availability: availability || 'IN_STOCK', seoTitle, seoDescription },
      include: productInclude,
    });
    return sendSuccess(res, product, 'Product created', 201);
  } catch (err) { next(err); }
}

/** PUT /api/admin/products/:id */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Product not found', 404);
    const { name, sku, shortDescription, description, price, discountPrice, categoryId, ingredients, benefits, directions, isFeatured, isPublished, stockQty, availability, seoTitle, seoDescription } = req.body;
    let mainImage = existing.mainImage, mainImagePath = existing.mainImagePath;
    if (req.file) {
      if (mainImagePath) await deleteFile(mainImagePath).catch(() => {});
      const r = await uploadFile(req.file.buffer, req.file.mimetype, 'products', `prod-${Date.now()}`);
      mainImage = r.url; mainImagePath = r.path;
    }
    const data = { mainImage, mainImagePath, sku, shortDescription, description, categoryId, ingredients, benefits, directions, seoTitle, seoDescription };
    if (name) { data.name = name; data.slug = toSlug(name); }
    if (price) data.price = parseFloat(price);
    if (discountPrice !== undefined) data.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (isFeatured !== undefined) data.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isPublished !== undefined) data.isPublished = isPublished === 'true' || isPublished === true;
    if (stockQty !== undefined) data.stockQty = parseInt(stockQty);
    if (availability) data.availability = availability;
    const product = await prisma.product.update({ where: { id }, data, include: productInclude });
    return sendSuccess(res, product, 'Product updated');
  } catch (err) { next(err); }
}

/** PUT /api/admin/products/:id/publish */
export async function togglePublish(req, res, next) {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Product not found', 404);
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { isPublished: !existing.isPublished } });
    return sendSuccess(res, product, `Product ${product.isPublished ? 'published' : 'unpublished'}`);
  } catch (err) { next(err); }
}

/** POST /api/admin/products/:id/images */
export async function uploadProductImages(req, res, next) {
  try {
    if (!req.files?.length) return sendError(res, 'No files uploaded', 400);
    const images = await Promise.all(
      req.files.map(async (file, i) => {
        const r = await uploadFile(file.buffer, file.mimetype, 'products', `prod-${req.params.id}-${Date.now()}-${i}`);
        return prisma.productImage.create({ data: { productId: req.params.id, url: r.url, storagePath: r.path, sortOrder: i } });
      })
    );
    return sendSuccess(res, images, 'Images uploaded', 201);
  } catch (err) { next(err); }
}

/** DELETE /api/admin/products/:id/images/:imageId */
export async function deleteProductImage(req, res, next) {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });
    if (!image) return sendError(res, 'Image not found', 404);
    if (image.storagePath) await deleteFile(image.storagePath).catch(() => {});
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    return sendSuccess(res, null, 'Image deleted');
  } catch (err) { next(err); }
}

/** DELETE /api/admin/products/:id */
export async function deleteProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { images: true } });
    if (!product) return sendError(res, 'Product not found', 404);
    if (product.mainImagePath) await deleteFile(product.mainImagePath).catch(() => {});
    await Promise.all(product.images.map(img => img.storagePath ? deleteFile(img.storagePath).catch(() => {}) : null));
    await prisma.product.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Product deleted');
  } catch (err) { next(err); }
}
