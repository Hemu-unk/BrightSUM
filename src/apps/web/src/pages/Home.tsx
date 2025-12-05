import React from 'react'
import { Link } from 'react-router-dom'
const logo = new URL('../assets/brightsumlogo.svg', import.meta.url).href

{/* MAIN Landing page */}
const Home: React.FC = () => {
  return (
	<main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff, #fffaf6)] flex items-center justify-center px-4">
	  <div className="w-full max-w-2xl text-center">
		{/* Logo */}
		<div className="flex justify-center mb-6">
		  <img src={logo} alt="BrightSUM logo" className="h-16 w-auto" />
		</div>

		{/*Welcome*/}
		<h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6">Welcome to BrightSUM</h1>

		{/*Center box for login and create account*/}
		<section className="mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-slate-200 p-6 sm:p-10 max-w-md">

					<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
									<Link
										to="/login"
										className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 text-white px-6 py-3 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors"
									>
										Login
									</Link>

						<Link
							to="/signup"
							className="inline-flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-900 px-6 py-3 text-sm font-medium hover:shadow-md transition-shadow"
						>
							Sign Up
						</Link>
					</div>
		</section>


	  </div>
	</main>
  )
}

export default Home
