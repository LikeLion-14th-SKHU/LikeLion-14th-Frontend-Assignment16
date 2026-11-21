import { useEffect, useMemo, useState } from 'react'
import { GRID_SIZES } from '../data/patterns.js'
import { imageToWool } from '../utils/woolConvert.js'
import { loadImageFile } from '../utils/imageTools.js'
import { countMaterials } from '../utils/countMaterials.js'
import { countColors } from '../utils/colors.js'
import Modal from './Modal.jsx'
import DesignThumb from './DesignThumb.jsx'

const PHOTO_SIZE = 48 // 사진은 칸이 많을수록 알아보기 쉬워서 기본을 크게

// 사진 → 양털 도안. 변환은 이 브라우저 안에서 바로 계산하므로 옵션을 바꾸면 결과가 즉시 바뀐다.
// (사진은 어디로도 보내지 않는다. 색 기준은 mc-api 텍스처에서 구한 실제 양털 색)
function PhotoImportForm({ onCreate }) {
  const [file, setFile] = useState(null)
  const [image, setImage] = useState(null) // { img, url }
  const [size, setSize] = useState(PHOTO_SIZE)
  const [fit, setFit] = useState('crop')
  const [boost, setBoost] = useState(true)
  const [dither, setDither] = useState(false)
  const [maxColors, setMaxColors] = useState(16)
  const [error, setError] = useState('')

  useEffect(() => {
    const url = image?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [image])

  const pickFile = async (f) => {
    setError('')
    if (!f) return
    try {
      setImage(await loadImageFile(f))
      setFile(f)
    } catch (err) {
      setError(err.message)
    }
  }

  const grid = useMemo(() => {
    if (!image) return null
    try {
      return imageToWool(image.img, size, { fit, dither, boost, maxColors })
    } catch {
      return null
    }
  }, [image, size, fit, dither, boost, maxColors])

  const stats = useMemo(() => {
    if (!grid) return null
    return {
      total: Object.values(countMaterials(grid)).reduce((a, b) => a + b, 0),
      colors: countColors(grid),
    }
  }, [grid])

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        사진 고르기
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => pickFile(e.target.files?.[0])}
          className="rounded-md border border-gray-300 p-1.5 text-sm font-normal file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1"
        />
      </label>

      {image && (
        <div className="grid grid-cols-2 gap-3">
          <figure className="flex flex-col items-center gap-1">
            <div className="checker aspect-square w-full overflow-hidden rounded border border-gray-200">
              <img
                src={image.url}
                alt="고른 사진"
                className={`size-full ${fit === 'crop' ? 'object-cover' : 'object-contain'}`}
              />
            </div>
            <figcaption className="text-xs text-gray-500">원본</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1">
            {grid ? (
              <DesignThumb
                grid={grid}
                size={size}
                className="aspect-square w-full rounded border border-gray-200"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 p-2 text-center text-xs text-gray-500">
                변환하지 못했어요
              </div>
            )}
            <figcaption className="text-xs text-gray-500">
              {stats ? `양털 도안 · ${size}×${size} · ${stats.total}개 · ${stats.colors}색` : '양털 도안'}
            </figcaption>
          </figure>
        </div>
      )}

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">
          크기 <span className="font-normal text-gray-500">(한 칸 = 양털 1개 · 사진은 48 이상이 알아보기 쉬워요)</span>
        </legend>
        <div className="flex gap-1">
          {GRID_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={`flex-1 rounded-md border-2 py-1 text-sm ${size === s ? 'border-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">
          최대 색상 <span className="tabular-nums">{maxColors}</span>가지
          <span className="font-normal text-gray-500"> (적을수록 모을 양털 종류가 줄어요)</span>
        </span>
        <input
          type="range"
          min={2}
          max={16}
          step={1}
          value={maxColors}
          onChange={(e) => setMaxColors(Number(e.target.value))}
          className="w-full accent-gray-800"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="fit" checked={fit === 'crop'} onChange={() => setFit('crop')} />
            가운데 잘라 꽉 채우기
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="fit" checked={fit === 'contain'} onChange={() => setFit('contain')} />
            전체 보이기 (남는 곳은 빈칸)
          </label>
        </div>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} />
          선명하게 (밝기 범위를 넓히고 색을 또렷하게)
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={dither} onChange={(e) => setDither(e.target.checked)} />
          디더링 (그라데이션을 격자무늬로 표현)
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-gray-100 p-2 text-sm text-gray-800">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          onCreate({
            name: (file?.name ?? '사진').replace(/\.[^.]+$/, '').slice(0, 40) || '사진 도안',
            size,
            grid,
          })
        }
        disabled={!grid}
        className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        새 도안으로 저장
      </button>
      <p className="text-xs text-gray-500">
        변환은 이 브라우저 안에서 이뤄지고 사진은 어디로도 보내지지 않아요. 저장한 뒤에는 그림판에서 자유롭게 고칠 수
        있어요.
      </p>
    </div>
  )
}

function PhotoImportDialog({ open, onClose, onCreate }) {
  return (
    <Modal open={open} onClose={onClose} title="사진으로 도안 만들기">
      <PhotoImportForm onCreate={onCreate} />
    </Modal>
  )
}

export default PhotoImportDialog
