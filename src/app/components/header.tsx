import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-[#2196F3] text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="OrtoQBank Logo"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="text-2xl font-bold">OrtoQBank</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="#sobre" className="hover:text-opacity-80">
                Sobre
              </Link>
            </li>
            <li>
              <Link href="#precos" className="hover:text-opacity-80">
                Preços
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-opacity-80">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
