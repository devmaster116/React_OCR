import NotAuthorized from "@/components/not-authorized"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { currentUser } from "@clerk/nextjs/server"
import { ReactNode } from "react"
import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"

export default async function DashboardLayout({ children }: { children: ReactNode }) {

  const user = await currentUser()

  // const { authorized, message } = await isAuthorized(user?.id!)

  // if (!authorized) {
  //   return <NotAuthorized />
  // }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardTopNav />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
