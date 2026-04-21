const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { Readable } = require("stream");

/**
 * Sube una imagen a Cloudinary.
 * @param {Object} file - Archivo de multer o {buffer, mimetype}
 * @param {string} folder - Carpeta en Cloudinary (ej: "cursos", "obras")
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadImage(file, folder = "maraleste") {
  // Si tiene buffer (viene de base64), usar stream upload
  if (file.buffer) {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer);
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
        }
      );

      stream.pipe(upload);
    });
  }

  // Si tiene path (viene de multer), usar la forma tradicional
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 1200, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
    ],
  });

  // Limpiar archivo temporal de multer
  fs.unlinkSync(file.path);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Sube un video a Cloudinary.
 * @param {Object} file - Archivo de multer
 * @param {string} folder - Carpeta en Cloudinary
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadVideo(file, folder = "maraleste/videos") {
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: "video",
    chunk_size: 6000000, // 6MB chunks para videos grandes
  });

  // Limpiar archivo temporal de multer
  fs.unlinkSync(file.path);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Elimina un recurso de Cloudinary por su public_id.
 * @param {string} publicId
 * @param {string} resourceType - "image" o "video"
 */
async function deleteResource(publicId, resourceType = "image") {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = {
  uploadImage,
  uploadVideo,
  deleteResource,
};
