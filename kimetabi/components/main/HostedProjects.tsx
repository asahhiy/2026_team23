import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { CircleCheck } from "lucide-react"
import { Prisma } from "@prisma/client"

// Define the type for the project with its relations
type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: {
    members: {
      include: {
        user: true
      }
    }
  }
}>

interface HostedProjectsProps {
  hostedProjects: ProjectWithMembers[]
  userId: string
  userName: string | null | undefined
}

export default function HostedProjects({
  hostedProjects,
  userId,
  userName,
}: HostedProjectsProps) {
  // 3. 主催している旅行がない場合の表示
  if (hostedProjects.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6 text-center text-muted-foreground">
          現在主催している旅行はありません。新しい旅行を計画しましょう！
        </CardContent>
      </Card>
    )
  }

  // 4. データがある場合のリスト表示
  return (
    <div className="space-y-6 mx-5">
      <h2 className="text-2xl font-bold mb-4">
        {userName ?? ""}主催旅行の回答状況
      </h2>

      {hostedProjects.map((project) => {
        const isAllAccepted = project.members.every(
          (member) => member.status === "ACCEPTED"
        )
        return (
          <Card
            key={project.id}
            className={
              isAllAccepted ? "bg-green-200 border-green-500 shadow-sm" : ""
            }
          >
            <Link href={`/projects/${project.id}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center ml-2">
                    {isAllAccepted && <CircleCheck className="mr-2" />}
                    <span>{project.title}</span>
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    出発日: {project.departureDate.toLocaleDateString("ja-JP")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul
                  className={
                    isAllAccepted
                      ? "bg-green-200 border-green-500 shadow-sm"
                      : ""
                  }
                >
                  {project.members.map((member) => {
                    const isMe = member.userId === userId

                    return (
                      <li
                        key={member.id}
                        className={
                          isAllAccepted
                            ? "bg-green-200 flex items-center justify-between p-2 rounded-md"
                            : "flex  justify-between p-2 bg-slate-50 rounded-md"
                        }
                      >
                        <div
                          className={
                            isAllAccepted
                              ? "bg-green-200 flex items-center space-x-4"
                              : "flex items-center space-x-4"
                          }
                        >
                          <Avatar>
                            <AvatarImage src={member.user.image || undefined} />
                            <AvatarFallback>
                              {member.user.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.name || "名称未設定"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isMe ? "主催者 (あなた)" : "参加者"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* ステータスバッジの表示 */}
                          {member.status === "ACCEPTED" && (
                            <Badge className="bg-green-500">参加</Badge>
                          )}
                          {member.status === "DECLINED" && (
                            <Badge variant="destructive">不参加</Badge>
                          )}
                          {member.status === "PENDING" && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              未回答
                            </Badge>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
