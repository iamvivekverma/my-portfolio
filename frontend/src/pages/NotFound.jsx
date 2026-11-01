import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-4 text-slate-700 leading-relaxed">
        The page you are looking for doesn’t exist.
      </p>
      <div className="mt-6">
        <Link className="text-primary font-semibold" to="/">
          Go back home
        </Link>
      </div>
    </div>
  );
}
