import { redirect } from "next/navigation";

export default function Home() {
  // Later: check session and send to /chat or /signin conditionally
  redirect("/signin");
}
