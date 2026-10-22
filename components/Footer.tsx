import Link from "next/link";
import {site} from "@/lib/site";
import Image from "next/image";


const Footer = () => (
    <footer className="site-footer">
        <div className="footer-inner">
            <div>
                <p className="footer-name">{site.name}</p>
                <p className="footer-tag">{site.tagline}</p>
            </div>

            <div>
                <h4>Explore</h4>
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/#events">Browse events</Link></li>
                    <li><Link href="/my-events">My events</Link></li>
                </ul>
            </div>

            <div>
                <h4>Contact</h4>
                <ul>
                    <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                    {site.socials.map((s) => (
                        <li key={s.label}>
                            <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h4>Privacy & Terms</h4>
                <ul>
                    <li><Link href="/privacy">Privacy Polices</Link></li>
                    <li><Link href="/terms">Terms & Conditions</Link></li>
                </ul>
            </div>
        </div>

        {site.sponsors.length > 0 && (
            <div className="footer-sponsors">
                <h4>Supported by</h4>
                <div className="sponsor-row">
                    {site.sponsors.map((s) => (
                        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                            {s.logo ? <Image src={s.logo} alt={s.name} width={120} height={40} /> : s.name}
                        </a>
                    ))}
                </div>
            </div>
            )}
        <div className="footer-bottom">
            <p>© {site.name}. Built for developers, by developers.</p>
        </div>
    </footer>
);

export default Footer;