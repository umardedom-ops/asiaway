import { redirect } from "next/navigation";

// "Kirim kassasi" endi "Kassa" sahifasining "Kirim" tabiga birlashtirildi.
export default function IncomeRedirect() {
  redirect("/dashboard/kassa");
}
