import { createClient } from "@/lib/supabase/server";
import UsageDashboardClient from "./UsageDashboardClient";

export const metadata = {
  title: "사용량 모니터링 - 관리자",
};

// Free tier limits
const FREE_LIMITS = {
  db_size_bytes: 500 * 1024 * 1024, // 500MB
  storage_bytes: 1 * 1024 * 1024 * 1024, // 1GB
  auth_mau: 50000,
  edge_function_invocations: 500000,
  realtime_concurrent: 200,
  realtime_messages: 2000000,
};

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

async function getUsageStats(): Promise<UsageStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_usage_stats");

  if (error) {
    console.error("Failed to fetch usage stats:", error);
    return null;
  }

  return data as UsageStats;
}

export default async function UsagePage() {
  const stats = await getUsageStats();

  return (
    <UsageDashboardClient stats={stats} freeLimits={FREE_LIMITS} />
  );
}
