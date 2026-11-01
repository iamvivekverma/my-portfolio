import { Link, useRouteError } from 'react-router-dom'
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: 'rgb(247 239 228)'}}>
      <div className="text-center max-w-md">
        <div className="mb-8">
          <FaExclamationTriangle 
            className="mx-auto text-6xl mb-4"
            style={{color: 'rgb(133, 64, 45)'}}
          />
          <h1 
            className="text-6xl font-bold mb-4"
            style={{fontFamily: 'Quali, sans-serif', color: 'rgb(133, 64, 45)'}}
          >
            Oops!
          </h1>
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{fontFamily: 'BalooBhai2, cursive', color: '#111111'}}
          >
            Something went wrong
          </h2>
        </div>

        <div className="mb-8 p-4 rounded-lg" style={{backgroundColor: 'hsla(0,0%,9%,.1)'}}>
          <p className="text-gray-700 mb-2">
            We couldn't load this page. Don't worry, it's not your fault!
          </p>
          {error && (
            <details className="text-left text-sm text-gray-600 mt-4">
              <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {error.statusText || error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: '#ff4081',
              color: '#FFFFFF'
            }}
          >
            <FaHome />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 border-2"
            style={{
              borderColor: 'rgb(133, 64, 45)',
              color: 'rgb(133, 64, 45)'
            }}
          >
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-600">
            Still having trouble? 
            <Link 
              to="/contact" 
              className="ml-1 font-semibold"
              style={{color: 'rgb(133, 64, 45)'}}
            >
              Contact me
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
