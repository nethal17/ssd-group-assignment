import Sidebar from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AllFarmers } from "../components/AllFarmers";

export const DisplayAllFarmers = () => {
  return (
    <>
    <Navbar />
    <div className="flex h-fit">
        <Sidebar />
        <div className="flex-grow p-4 overflow-auto">
        <AllFarmers />
        </div>
    </div>
    </>
  );
};