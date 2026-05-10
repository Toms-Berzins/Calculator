const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

const MODEL_EXTS = new Set(['glb', 'gltf', 'obj', 'stl', 'fbx', '3ds'])

export function is3DFile(file: File): boolean {
  return MODEL_EXTS.has(file.name.split('.').pop()?.toLowerCase() ?? '')
}

export function imageUrl(publicId: string, opts: { width?: number; height?: number } = {}): string {
  const transforms: string[] = ['q_auto', 'f_auto']
  if (opts.width)  transforms.push(`w_${opts.width}`)
  if (opts.height) transforms.push(`h_${opts.height}`)
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`
}

export function rawUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${publicId}`
}

export interface UploadResult {
  public_id: string
  secure_url: string
  resource_type: string
}

export function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<UploadResult> {
  const resourceType = is3DFile(file) ? 'raw' : 'image'

  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadResult)
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(fd)
  })
}
