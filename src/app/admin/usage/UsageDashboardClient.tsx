"use client";

import { useRouter } from "next/navigation";

interface TableStat {
  table_name: string;
  size_bytes: number;
  size_pretty: string;
  row_estimate: number;
}

interface StorageBucket {
  name: string;
  is_public: boolean;
  file_count: number;
  total_size_bytes: number;
}

interface UsageStats {
  db_size_bytes: number;
  db_size_pretty: string;
  tables: TableStat[];
  storage_buckets: StorageBucket[];
  auth_user_count: number;
  queried_at: string;
}

interface FreeLimits {
  db_size_bytes: number;
  storage_bytes: number;
  auth_mau: number;
  edge_function_invocations: number;
  realtime_concurrent: number;
  realtime_messages: number;
}

interface Props {
  stats: UsageStats | null;
  freeLimits: FreeLimits;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + " " + units[i];
}

function getUsageLevel(percent: number): {
  color: string;
  bg: string;
  bar: string;
  label: string;
} {
  if (percent >= 80) return { color: "text-red-600", bg: "bg-red-50", bar: "bg-red-500", label: "위험" };
  if (percent >= 50) return { color: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500", label: "주의" };
  return { color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500", label: "양호" };
}

function UsageCard({
  title,
  icon,
  current,
  currentLabel,
  limit,
  limitLabel,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  current: number;
  currentLabel: string;
  limit: number;
  limitLabel: string;
  description?: string;
}) {
  const percent = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const level = getUsageLevel(percent);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${level.bg} ${level.color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${level.bg} ${level.color}`}>
          {level.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-gray-900">{currentLabel}</span>
          <span className="text-xs text-gray-400">/ {limitLabel}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${level.bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-gray-400">{percent.toFixed(1)}%</p>
      </div>
    </div>
  );
}

function TableRow({ table }: { table: TableStat }) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-3 pl-5 pr-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
          {table.table_name}
        </span>
      </td>
      <td className="px-3 py-3 text-right text-sm text-gray-600">
        {table.row_estimate.toLocaleString("ko-KR")}
      </td>
      <td className="py-3 pl-3 pr-5 text-right text-sm text-gray-600">
        {table.size_pretty}
      </td>
    </tr>
  );
}

function StorageRow({ bucket }: { bucket: StorageBucket }) {
  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
            {bucket.name}
          </span>
          {bucket.is_public && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              public
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-right text-sm text-gray-600">
        {bucket.file_count.toLocaleString("ko-KR")}
      </td>
      <td className="py-3 pl-3 pr-5 text-right text-sm text-gray-600">
        {formatBytes(bucket.total_size_bytes)}
      </td>
    </tr>
  );
}

export default function UsageDashboardClient({ stats, freeLimits }: Props) {
  const router = useRouter();

  if (!stats) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">사용량 모니터링</h1>
          <p className="mt-1 text-sm text-gray-500">Supabase 리소스 사용 현황</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-700">사용량 데이터를 불러올 수 없습니다</p>
          <p className="mt-1 text-xs text-gray-400">관리자 권한으로 로그인 후 다시 시도해주세요</p>
        </div>
      </div>
    );
  }

  const totalStorageBytes = stats.storage_buckets.reduce(
    (sum, b) => sum + b.total_size_bytes, 0
  );
  const totalFiles = stats.storage_buckets.reduce(
    (sum, b) => sum + b.file_count, 0
  );
  const totalRows = stats.tables.reduce(
    (sum, t) => sum + t.row_estimate, 0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">사용량 모니터링</h1>
          <p className="mt-1 text-sm text-gray-500">Supabase Free 플랜 리소스 사용 현황</p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          새로고침
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UsageCard
          title="데이터베이스"
          description="PostgreSQL 저장 용량"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          }
          current={stats.db_size_bytes}
          currentLabel={stats.db_size_pretty}
          limit={freeLimits.db_size_bytes}
          limitLabel="500 MB"
        />

        <UsageCard
          title="스토리지"
          description="파일 저장 용량"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
          current={totalStorageBytes}
          currentLabel={formatBytes(totalStorageBytes)}
          limit={freeLimits.storage_bytes}
          limitLabel="1 GB"
        />

        <UsageCard
          title="인증 사용자"
          description="월간 활성 사용자(MAU)"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          current={stats.auth_user_count}
          currentLabel={stats.auth_user_count.toLocaleString("ko-KR") + "명"}
          limit={freeLimits.auth_mau}
          limitLabel="50,000명"
        />
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "총 테이블", value: stats.tables.length + "개" },
          { label: "총 행 수", value: totalRows.toLocaleString("ko-KR") },
          { label: "스토리지 버킷", value: stats.storage_buckets.length + "개" },
          { label: "총 파일 수", value: totalFiles.toLocaleString("ko-KR") },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-4"
          >
            <span className="text-xs text-gray-400">{item.label}</span>
            <span className="mt-1 text-lg font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Detail tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Table details */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">테이블별 사용량</h2>
            <span className="text-xs text-gray-400">{stats.tables.length}개 테이블</span>
          </div>
          {stats.tables.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">
                  <th className="py-2 pl-5 pr-3 text-left font-medium">테이블</th>
                  <th className="px-3 py-2 text-right font-medium">행 수</th>
                  <th className="py-2 pl-3 pr-5 text-right font-medium">크기</th>
                </tr>
              </thead>
              <tbody>
                {stats.tables.map((table) => (
                  <TableRow key={table.table_name} table={table} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              아직 생성된 테이블이 없습니다
            </div>
          )}
        </div>

        {/* Storage details */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">스토리지 버킷</h2>
            <span className="text-xs text-gray-400">{stats.storage_buckets.length}개 버킷</span>
          </div>
          {stats.storage_buckets.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">
                  <th className="py-2 pl-5 pr-3 text-left font-medium">버킷</th>
                  <th className="px-3 py-2 text-right font-medium">파일 수</th>
                  <th className="py-2 pl-3 pr-5 text-right font-medium">크기</th>
                </tr>
              </thead>
              <tbody>
                {stats.storage_buckets.map((bucket) => (
                  <StorageRow key={bucket.name} bucket={bucket} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              아직 생성된 버킷이 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Free tier info */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Free 플랜 한도 안내</h2>
        <div className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "데이터베이스", value: "500 MB" },
            { label: "스토리지", value: "1 GB" },
            { label: "대역폭", value: "5 GB / 월" },
            { label: "인증 MAU", value: "50,000명" },
            { label: "Edge Functions", value: "500,000 호출 / 월" },
            { label: "Realtime", value: "동시 200 연결" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between border-b border-gray-50 py-2">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-gray-700">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-center text-xs text-gray-300">
        마지막 조회: {new Date(stats.queried_at).toLocaleString("ko-KR")}
      </p>
    </div>
  );
}
