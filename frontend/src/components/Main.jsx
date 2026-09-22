export const Main = () => {
  return (
    <div className="px-8 py-5 md:px-36 md:py-28">
      <div className="flex flex-col justify-between gap-10 lg:flex-row">
        {/* Left Content */}
        <div className="flex flex-col justify-center gap-2 p-1 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-left md:text-4xl">Lorem</h1>
          <h1 className="text-4xl font-bold text-left md:text-4xl">ipsum Dolor sit</h1>
          <h1 className="text-4xl font-bold text-left text-green-600 md:text-5xl">
            Amet Consectetur
          </h1>
          
          <p className="mt-4 text-zinc-900">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt tempora recusandae aliquid libero natus, placeat ratione qui, expedita, pariatur maxime in.
          </p>
          <button className="px-4 py-3 mt-4 text-white transition rounded-lg bg-zinc-900 hover:bg-white hover:border hover:border-zinc-900 hover:text-zinc-900 hover:font-bold">
            Get started
          </button>
        </div>
        {/* Right Image Section */}
        <div className="flex items-center">
          <img
            src="https://i.pinimg.com/736x/fd/3d/8e/fd3d8e2a1dd4f09b4170d31e26913bab.jpg?w=1060"
            alt="Sri Lanka Nature"
            className="object-cover w-full h-auto rounded-md"
          />
        </div>
      </div>
    </div>
  );
};