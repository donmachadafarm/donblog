import Link from "next/link"

function Header() {
  return (
    <header className="flex justify-between p-5 max-w-7xl mx-auto">
        <div className="flex items-center space-x-5">
            <Link href='/'>
                <img src='/logo.png' alt="home logo" className="w-44 object-contain cursor-pointer" />
            </Link>
            <div className="hidden md:inline-flex items-center space-x-5">
                <h3>About</h3>
                <h3>Contact</h3>
                <h3 className="text-white bg-gray-800 px-4 py-1 rounded-full">Follow</h3>
            </div>
        </div>

        <div className="flex items-center space-x-5 text-gray-600">
            <h3>Sign in</h3>
            <h3  className="border px-4 py-1 rounded-full border-gray-800">Get Started</h3>
        </div>
        
    </header>
  )
}

export default Header