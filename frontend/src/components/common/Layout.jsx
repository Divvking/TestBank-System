import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-gray-100 dark:border dark:border-gray-700',
          duration: 3500,
          style: { borderRadius: '10px', fontSize: '14px' }
        }}
      />
    </div>
  )
}
