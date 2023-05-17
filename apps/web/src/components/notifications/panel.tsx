import { InboxIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { useSuspenseQuery } from "../../hooks/useSuspenseQuery";
import api from "../../lib/api";
import { Notification, Paginated } from "../../types";

export default function NotificationsPanel() {
  const { data } = useSuspenseQuery(
    ["notifications", "unread"],
    (): Promise<Paginated<Notification>> =>
      api.get("/notifications", {
        query: {
          filter: "unread",
        },
      }),
  );

  const unreadNotificationCount = data && data.results.length;

  return (
    <Link
      className="focus:ring-highlight relative flex max-w-xs items-center rounded text-sm text-white hover:bg-slate-800 focus:outline-none focus:ring"
      to="/notifications"
    >
      <span className="sr-only">Open user menu</span>
      <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded text-slate-500 sm:h-10 sm:w-10">
        <InboxIcon className="h-9 w-9" />
      </span>
      {unreadNotificationCount > 0 && (
        <div className="bg-highlight absolute right-0 top-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-black">
          {unreadNotificationCount.toLocaleString()}
        </div>
      )}
    </Link>
  );
}
