import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import { toast } from "react-hot-toast";

export const AllFarmers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiService
      .get(`/api/auth/getAllUsers`)
      .then((response) => {
        setAllUsers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter users to show only farmers
  const farmers = allUsers.filter((user) => user.role === "farmer");

  const handleUserDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      await apiService.delete(`/api/auth/userDelete/${selectedUser._id}`);

      setAllUsers((prevUsers) => prevUsers.filter((user) => user._id !== selectedUser._id));
      toast.success("Successfully deactivated user account");

      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to deactivate user account");
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl px-8 py-8 mx-auto mt-6 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-3xl font-semibold text-center text-gray-900">All Farmers</h2>
        <div className="flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-lg font-semibold text-gray-900 sm:pl-6">Name</th>
                      <th className="px-3 py-3.5 text-left text-lg font-semibold text-gray-900">Created At</th>
                      <th className="px-3 py-3.5 text-left text-lg font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-lg font-semibold text-gray-900">Telephone</th>
                      <th className="px-3 py-3.5 text-left text-lg font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmers.length > 0 ? (
                      farmers.map((user) => (
                        <tr key={user._id} className="cursor-pointer hover:bg-green-300">
                          <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap sm:pl-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <img className="object-cover w-10 h-10 rounded-full" src={user.profilePic} alt="profile" />
                              </div>
                              <div className="ml-4">
                                <div className="text-lg font-light text-black">{user.name}</div>
                                <div className="font-semibold text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-md whitespace-nowrap">
                            {new Date(user?.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </td>
                          <td className="px-3 py-4 text-sm whitespace-nowrap">
                            <span className={`inline-flex px-2 font-bold leading-5 rounded-full text-md ${user.isVerified ? "text-green-700" : "text-red-700"}`}>
                              {user.isVerified ? "Verified" : "Not Verified"}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-black text-md whitespace-nowrap">{user.phone}</td>
                          <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowModal(true);
                              }}
                              className="justify-center w-full h-[35px] text-center text-white bg-red-600 border rounded-md cursor-pointer"
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center">No farmers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-900">Confirm Deactivation</h3>
            <p className="mt-2 text-gray-600">Are you sure you want to deactivate <span className="font-bold">{selectedUser.name}</span>?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleUserDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md"
              >
                {loading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
