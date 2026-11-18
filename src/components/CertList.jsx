import { Link } from 'react-router'
import FavoriteButton from './FavoriteButton.jsx'
import { certPath, hasSchedule, scheduleLabel } from '../lib/certs.js'

// 검색 결과, 등급별 둘러보기, 공유 받은 목록에서 같이 써요
function CertList({ certs }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {certs.map((cert) => (
        <li key={cert.name} className="flex items-center pr-2 transition-colors hover:bg-canvas">
          <Link
            to={certPath(cert)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3.5 pr-1 pl-4"
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold">{cert.name}</span>
              <span className="text-xs text-ink-muted">
                {cert.qualgbNm}
                {cert.grade && ` · ${scheduleLabel(cert)}`}
              </span>
            </span>
            {hasSchedule(cert) ? (
              <span aria-hidden="true" className="shrink-0 text-ink-muted">
                ›
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-muted">
                일정 미제공
              </span>
            )}
          </Link>
          <FavoriteButton name={cert.name} />
        </li>
      ))}
    </ul>
  )
}

export default CertList
