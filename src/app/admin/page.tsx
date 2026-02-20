import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface StatCard {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  color: string;
}

async function getDashboardData() {
  const supabase = await createClient();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [stories, products, travel, monthlyOrders, recentOrders, recentContent] =
    await Promise.all([
      supabase.from("stories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("travel_programs").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstOfMonth),
      supabase
        .from("orders")
        .select("id, order_number, buyer_name, total_amount, payment_status, order_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("stories")
        .select("id, title, slug, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    counts: {
      stories: stories.count ?? 0,
      products: products.count ?? 0,
      travel: travel.count ?? 0,
      monthlyOrders: monthlyOrders.count ?? 0,
    },
    recentOrders: recentOrders.data ?? [],
    recentContent: recentContent.data ?? [],
  };
}

const PAYMENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "대기", className: "bg-yellow-100 text-yellow-700" },
  paid: { label: "결제완료", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-600" },
  refunded: { label: "환불", className: "bg-red-100 text-red-600" },
};

const CONTENT_STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: { label: "임시저장", className: "bg-gray-100 text-gray-600" },
  published: { label: "게시됨", className: "bg-emerald-100 text-emerald-700" },
  archived: { label: "보관", className: "bg-yellow-100 text-yellow-700" },
};

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboard() {
  const { counts, recentOrders, recentContent } = await getDashboardData();

  const stats: StatCard[] = [
    {
      label: "총 스토리",
      value: counts.stories,
      href: "/admin/stories",
      color: "bg-blue-500",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: "총 상품",
      value: counts.products,
      href: "/admin/products",
      color: "bg-emerald-500",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "총 여행프로그램",
      value: counts.travel,
      href: "/admin/travel",
      color: "bg-violet-500",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
        </svg>
      ),
    },
    {
      label: "이번 달 주문",
      value: counts.monthlyOrders,
      href: "/admin/orders",
      color: "bg-amber-500",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">로컬홀릭 관리자 현황</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">최근 주문</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              전체보기
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order: Record<string, string | number>) => {
                const status =
                  PAYMENT_STATUS_MAP[order.payment_status as string] ??
                  PAYMENT_STATUS_MAP.pending;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {order.buyer_name} &middot;{" "}
                        {order.order_type === "travel" ? "여행" : "상품"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.total_amount as number)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(order.created_at as string)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              아직 주문이 없습니다
            </div>
          )}
        </div>

        {/* Recent Content */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">최근 콘텐츠</h2>
            <Link
              href="/admin/stories"
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              전체보기
            </Link>
          </div>
          {recentContent.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentContent.map((item: Record<string, string>) => {
                const status =
                  CONTENT_STATUS_MAP[item.status] ?? CONTENT_STATUS_MAP.draft;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">
                          {item.title}
                        </span>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <span className="ml-4 flex-shrink-0 text-xs text-gray-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              아직 등록된 콘텐츠가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
