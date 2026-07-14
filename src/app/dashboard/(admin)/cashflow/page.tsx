import { redirect } from "next/navigation";

// "Kunlik kassa" endi "Kassa" sahifasining "Kunlik oqim" tabiga birlashtirildi.
export default function CashflowRedirect() {
  redirect("/dashboard/kassa");
}
