import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
          NewDandasLetter
        </h1>
        <p className="text-xl text-indigo-200 mb-8 max-w-md mx-auto">
          Your AI-powered daily news digest, curated just for you.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/subscribe"
            className="bg-white text-indigo-900 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-100 transition"
          >
            Subscribe
          </Link>
          <Link
            href="/archive"
            className="border border-indigo-300 text-indigo-200 font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
          >
            Past Issues
          </Link>
        </div>
      </div>
    </div>
  );
}
