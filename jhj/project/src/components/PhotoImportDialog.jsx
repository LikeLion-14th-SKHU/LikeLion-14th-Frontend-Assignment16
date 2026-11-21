import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_SIZE, GRID_SIZES } from '../data/patterns.js'
import { convertImageToWool } from '../api/mcApi.js'
import { loadImageFile, toSquarePng } from '../utils/imageTools.js'
import { countMaterials } from '../utils/countMaterials.js'
import Modal from './Modal.jsx'
import DesignThumb from './DesignThumb.jsx'

// 사진 → 양털 도안. 변환은 mc-api /v1/mapart 가 양털 16색 팔레트로 해 준다.
function PhotoImportForm({ onCreate, onCredits }) {
  const [file, setFile] = useState(null)
  const [image, setImage] = useState(null) // { img, url }
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [fit, setFit] = useState('crop')
  const [dither, setDither] = useState(false)
  const [status, setStatus] = useState('idle') // idle | converting | done | error
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { grid, size }

  useEffect(() => {
    const url = image?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [image])

  const pickFile = async (f) => {
    setResult(null)
    setError('')
    setStatus('idle')
    if (!f) return
    try {
      setImage(await loadImageFile(f))
      setFile(f)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const convert = async () => {
    if (!image) return
    setStatus('converting')
    setError('')
    try {
      const blob = await toSquarePng(image.img, fit)
      const { grid, credits } = await convertImageToWool(blob, { size, dither })
      setResult({ grid, size })
      setStatus('done')
      onCredits(credits)
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof TypeError
          ? 'mc-api에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.'
          : err.message,
      )
    }
  }

  const total = useMemo(
    () => (result ? Object.values(countMaterials(result.grid)).reduce((a, b) => a + b, 0) : 0),
    [result],
  )
  // 옵션을 바꾸면 결과가 지금 옵션과 다를 수 있다
  const outdated = result && result.size !== size

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
            {result ? (
              <DesignThumb
                grid={result.grid}
                size={result.size}
                className={`aspect-square w-full rounded border border-gray-200 ${outdated ? 'opacity-40' : ''}`}
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded border border-dashed border-gray-300 p-2 text-center text-xs text-gray-500">
                {status === 'converting' ? 'mc-api가 양털로 바꾸는 중…' : '변환하면 여기에 나와요'}
              </div>
            )}
            <figcaption className="text-xs text-gray-500">
              {result ? `양털 도안 · ${result.size}×${result.size} · ${total}개` : '양털 도안'}
            </figcaption>
          </figure>
        </div>
      )}

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">크기 (한 칸 = 양털 1개)</legend>
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

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="radio" name="fit" checked={fit === 'crop'} onChange={() => setFit('crop')} />
          가운데 잘라 꽉 채우기
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="fit" checked={fit === 'contain'} onChange={() => setFit('contain')} />
          전체 보이기 (남는 곳은 빈칸)
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={dither} onChange={(e) => setDither(e.target.checked)} />
          디더링 (사진처럼 부드럽게, 대신 칸이 지저분해짐)
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-gray-100 p-2 text-sm text-gray-800">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={convert}
          disabled={!image || status === 'converting'}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {result ? '다시 변환' : '양털로 변환'} <span className="text-xs font-normal text-gray-500">(1 크레딧)</span>
        </button>
        <button
          type="button"
          onClick={() =>
            onCreate({
              name: (file?.name ?? '사진').replace(/\.[^.]+$/, '').slice(0, 40) || '사진 도안',
              size: result.size,
              grid: result.grid,
            })
          }
          disabled={!result || status === 'converting'}
          className="flex-1 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          새 도안으로 저장
        </button>
      </div>
      <p className="text-xs text-gray-500">
        사진은 mc-api로 보내져 양털 16색으로 변환돼요. 저장된 뒤에는 그림판에서 자유롭게 고칠 수 있어요.
      </p>
    </div>
  )
}

function PhotoImportDialog({ open, onClose, onCreate, onCredits }) {
  return (
    <Modal open={open} onClose={onClose} title="사진으로 도안 만들기">
      <PhotoImportForm onCreate={onCreate} onCredits={onCredits} />
    </Modal>
  )
}

export default PhotoImportDialog
