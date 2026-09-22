import { Navbar } from "../components/Navbar";

export const StartList = () => {
  return (
    <>
      <Navbar/>
      <div class="md:px-36 px-8 md:py-28 py-5 mt-[40px]">
        <div class="flex lg:flex-row flex-col grid-cols-2 gap-10">
          <div class="flex flex-col gap-3 justify-center p-3">
            <h1 class="text-4xl md:text-5xl font-bold text-left">List</h1>
            <h1 class="text-4xl md:text-5xl font-bold text-left">Your</h1>
            <h1 class="text-4xl md:text-6xl font-bold text-green-600 text-left">
              Agri-Waste
            </h1>
            <p class="mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <button className="px-2 py-3 mt-4 text-white bg-black rounded-lg hover:bg-white hover:border hover:text-black hover:font-bold">
              Get started
            </button>
          </div>
          <div class="">
            <img
              src="https://i.pinimg.com/736x/fd/3d/8e/fd3d8e2a1dd4f09b4170d31e26913bab.jpg?w=1060"
              alt="heroimg"
              class="rounded-lg h-[100%] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};
