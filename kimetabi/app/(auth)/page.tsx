import { auth } from "@/auth"
import HostedProjects from "@/components/main/HostedProjects"
import { NotificationCancelButton } from "@/components/notification/NotificationCancelButton"
import { NotificationPleaseButton } from "@/components/notification/PleaseNotificationButton"
import MyProjectsList from "@/components/project/MyProjectList"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"

// Helper function to fetch hosted projects
function getHostedProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: userId,
          role: "MASTER",
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          status: "desc",
        },
      },
    },
    orderBy: {
      departureDate: "asc",
    },
  })
}

// Helper function to fetch user's project memberships
function getMyProjectMemberships(userId: string) {
  return prisma.projectMember.findMany({
    where: {
      userId: userId,
      status: {
        in: ["PENDING", "ACCEPTED"],
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      project: { departureDate: "asc" },
    },
  })
}

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    return redirect("/login")
  }

  const userId = session.user.id

  // Fetch all data in parallel
  const [hostedProjects, myProjectMemberships] = await Promise.all([
    getHostedProjects(userId),
    getMyProjectMemberships(userId),
  ])

  return (
    <div>
      <div className="ml-5 mt-4 mr-5">
        <NotificationPleaseButton />
      </div>
      <div className="ml-5 mt-4">
        <NotificationCancelButton />
      </div>
      <div className="flex justify-between">
        <div className="mx-2 px-3 mt-4 flex "></div>
        <div className="mx-5 pl-2"></div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Suspense fallback={<div className="text-center p-8">主催旅行を読み込み中...</div>}>
            <HostedProjects
              hostedProjects={hostedProjects}
              userId={userId}
              userName={session.user.name}
            />
          </Suspense>
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Suspense fallback={<div className="text-center p-8">参加旅行を読み込み中...</div>}>
            <MyProjectsList memberships={myProjectMemberships} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
