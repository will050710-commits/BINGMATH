import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="card"><Link href="/">SECTION 1</Link></div>
      <div className="card"><Link href="/section2-page">SECTION 2</Link></div>
      <div className="card"><Link href="/section3-page">SECTION 3</Link></div>
    </footer>
  );
}