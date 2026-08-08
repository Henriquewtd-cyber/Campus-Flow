import Link from "next/dist/client/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <Link href="/slides">Go to Slides</Link>
    </div>
  );
}
