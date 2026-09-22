import Sidebar from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AllDrivers } from "../components/AllDrivers";

export const DisplayAllDrivers = () => {
  return (
    <>
    <Navbar />
    <div className="flex h-fit">
        <Sidebar />
        <div className="flex-grow p-4 overflow-auto">
        <AllDrivers />
        </div>
    </div>
    </>
  );
};