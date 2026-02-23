import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GroupLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* ヘッダー部分 */}
      <div className="space-y-4 mb-5">
        <div className="h-10 w-24">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左側カラム: 概要スケルトン */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="pt-4 border-t space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側カラム: メンバー一覧スケルトン */}
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
