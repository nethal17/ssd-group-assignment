import { FaShopify } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { MdAddBusiness } from "react-icons/md";

const categories = [
  {
    name: "Marketplace",
    icon: <FaShopify size={60}/>,
  },
  {
    name: "List Agriculural Waste",
    icon: <MdAddBusiness size={60}/>,
  },
  {
    name: "Pickup and Delivery",
    icon: <TbTruckDelivery size={60}/>,
  },
];
export const Services = () => {
  return (
    <>
      <div className="lg:px-36 lg:pt-5 lg:pb-[90px]">
        <div className="container mx-auto">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
                <span className="block mb-2 text-lg font-semibold text-zinc-900">
                  Our Services
                </span>
                <h2 className="text-green-600 mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">
                  What We Offer
                </h2>
                <p className="text-base text-zinc-900">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Quaerat reprehenderit autem ea ab repellat eum, quasi modi,
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 -mx-4 lg:grid-cols-3">
            {categories.map((category) => (
              <div className="mb-8 rounded-[20px] bg-white p-2 shadow-md  hover:shadow-lg md:px-7  grid grid-cols-2 justify-center">
                <div className=" text-zinc-900 text-3xl mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl">
                  {category.icon}
                </div>
                <h4 className="mt-5 mb-3 text-lg font-semibold text-zinc-900">
                  {category.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
