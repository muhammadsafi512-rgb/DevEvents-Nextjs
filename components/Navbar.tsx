import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import NavMenu from "@/components/NavMenu";
import {getSession} from "@/lib/session";

//Reads the cookies, so it must render inside <suspense> (Cache Components)
const NavMenuWithSession = async () => {
    const session = await getSession();
    const user = session ? { name: session.name, role: session.role } : null;
    return <NavMenu user={user}/>
};

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href='/' className="logo">
                    <Image src="/icons/logo.png" alt="logo"  width={24} height={24} />
                    <p>DevEvents</p>
                </Link>

                <Suspense fallback={<ul><li><Link href="/">Home</Link></li></ul>}>
                    <NavMenuWithSession/>
                </Suspense>
            </nav>
        </header>
    );
};
export default Navbar
