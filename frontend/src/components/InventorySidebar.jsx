import { Link } from "react-router-dom";

export const InventorySidebar = ({ setActiveComponent }) => {
  return (
    <div className="p-8 text-white bg-zinc-900 w-[225px] text-lg">
      <ul>
        <div>
          <li className="mb-4">
            <button 
              onClick={() => setActiveComponent('dashboard')}
              className="hover:text-green-600 w-full text-left"
            >
              Dashboard
            </button>
          </li>

          <li className="mb-4">
            <button 
              onClick={() => setActiveComponent('inventory')}
              className="hover:text-green-600 w-full text-left"
            >
              Inventory Details
            </button>
          </li>
        </div>
        <div className="mt-[475px]">
          <li className="mb-4">
            <Link to="/profile" className="hover:text-green-600">
              Profile Settings
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/login" className="hover:text-green-600">
              Log Out
            </Link>
          </li>
        </div>
      </ul>
    </div>
  );
};