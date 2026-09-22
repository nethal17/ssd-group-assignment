import Sidebar from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { AllUsers } from "../components/AllUsers";

export const DisplayAllUsers = () => {
  return (
    <>
    <Navbar />
    <div className="flex h-fit">
        <div className="flex-grow overflow-auto">
        <AllUsers />
        </div>
    </div>
    </>
  );
};