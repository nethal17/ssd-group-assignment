import { Link } from "react-router-dom";

export const FarmerSidebar = () => {
  return (
    <div className="p-8 text-white bg-zinc-900 w-[225px] text-lg">
      <ul>
        <div>
        <Link to="/farmer-listings">
        <li className="mb-4">
          <a href="#" className="hover:text-green-600">My Listings</a>
        </li>
        </Link>

        <Link to="/farmer-reviews">
        <li className="mb-4">
          <a href="#" className="hover:text-green-600">My Reviews</a>
        </li>
        </Link>
        </div>
        <div className="mt-[475px]">
        <li className="mb-4">
          <a href="#" className="hover:text-green-600">Profile Settings</a>
        </li>
        <li className="mb-4">
          <a href="#" className="hover:text-green-600">Log Out</a>
        </li>
        </div>

      </ul>
    </div>
  );
};