export default function AdvancedFilters() {
  return (
    <div className="bg-white border rounded-2xl p-5">

      <h2 className="font-bold mb-4">
        Filters
      </h2>

      <select className="w-full border p-2 rounded mb-3">
        <option>Price</option>
      </select>

      <select className="w-full border p-2 rounded mb-3">
        <option>RAM</option>
      </select>

      <select className="w-full border p-2 rounded">
        <option>Storage</option>
      </select>

    </div>
  );
}