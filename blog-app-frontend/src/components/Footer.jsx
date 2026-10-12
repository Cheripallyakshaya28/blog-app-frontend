function Footer() {
  return (
    <footer className="bg-white border-t border-[#e8e8ed] mt-10">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* LEFT */}
        <p className="text-sm text-[#6e6e73]">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </p>

        {/* RIGHT LINKS */}
        <div className="flex gap-4 text-sm">
          <a href="/" className="text-[#0066cc] hover:underline">
            Home
          </a>
          <a href="/articles" className="text-[#0066cc] hover:underline">
            Articles
          </a>
          <a href="/authors" className="text-[#0066cc] hover:underline">
            Authors
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;