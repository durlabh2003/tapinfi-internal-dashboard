type Props = {
  title: string;
  total: number;
  used: number;
  unused: number;
};

export default function CountBar({
  title,
  total,
  used,
  unused,
}: Props) {
  return (
    <div className="bg-[#141428] border border-cyan-500/20 rounded-2xl p-6 shadow-xl transition hover:shadow-cyan-500/30">

      <h2 className="text-lg font-semibold text-cyan-400 mb-6">
        {title}
      </h2>

      <div className="space-y-4">

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-bold">
            {total.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Used</span>
          <span className="text-purple-400 font-bold">
            {used.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Unused</span>
          <span className="text-green-400 font-bold">
            {unused.toLocaleString()}
          </span>
        </div>

      </div>

      <div className="mt-6 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          style={{
            width:
              total > 0
                ? `${(used / total) * 100}%`
                : "0%",
          }}
        />
      </div>

    </div>
  );
}
