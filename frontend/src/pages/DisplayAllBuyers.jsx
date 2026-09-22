import Sidebar from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AllBuyers } from "../components/AllBuyers";

export const DisplayAllBuyers = () => {
  return (
    <>
    <Navbar />
    <div className="flex h-fit">
        <Sidebar />
        <div className="flex-grow p-4 overflow-auto">
        <AllBuyers />
        </div>
    </div>
    </>
  );
};