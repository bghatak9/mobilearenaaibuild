export default function Navbar() {
  const items = [
    "Home",
    "News",
    "Reviews",
    "Videos",
    "Compare",
    "Deals",
    "Brands",
  ];

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex gap-8 py-3 text-sm text-zinc-300">
          {items.map((item) => (
            <li
              key={item}
              className="cursor-pointer hover:text-white transition"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}