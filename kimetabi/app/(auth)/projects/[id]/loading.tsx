import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* ヘッダー部分 */}
      <div className="mb-8 border-b pb-4 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ))}
        </div>

        {/* 下部のボタンエリア */}
        <div className="bg-gray-50 border rounded-lg p-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
