import { FarmerSidebar } from "../components/FarmerSidebar"
import { Navbar } from "../components/Navbar"
import { ListingReviews } from "../components/ListingReviews"

export const DisplayFarmerReviews = () => {
  return (
    <>
    <Navbar />
    <div className="flex h-fit">
      <FarmerSidebar/>  
      <div className="flex-grow p-4 overflow-auto">
      <ListingReviews />
      </div>
    </div>
    </>
  )
}


