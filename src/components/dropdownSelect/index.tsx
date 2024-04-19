import { Id } from "@convex/_generated/dataModel";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface DropdownSelectProps {
  selected: any;
  users: any;
  assigneHandler: (id: Id<"users">) => void;
}

export default function DropdownSelect(props: DropdownSelectProps) {
  const { selected, users, assigneHandler } = props;
  const [clicked, setClicked] = useState(false);

  const ref = useRef(null);

  const selectHandler = (e: any, id: Id<"users">) => {
    e.preventDefault();
    assigneHandler(id);
    setClicked(false);
  };

  const handleClick = () => {
    setClicked(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        ref.current &&
        !(ref.current as unknown as HTMLElement).contains(event.target)
      ) {
        handleClick && handleClick();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="text-zinc-300 mr-4 border-dotted border-2 border-zinc-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-2 py-1.5 text-center inline-flex items-center"
        type="button"
        onClick={() => setClicked(!clicked)}
      >
        {selected ? (
          <div className="flex w-40 truncate text-ellipsis items-center">
            <Image
              width={24}
              height={24}
              className="w-6 h-6 me-2 rounded-full"
              src={selected.avatar}
              alt={selected.name}
            />
            {selected.name}
          </div>
        ) : (
          <div className="flex items-center">
            Assign to a member
            <svg
              className="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </div>
        )}
      </button>

      <div
        className={`z-10 bg-white absolute rounded-lg shadow w-60 dark:bg-gray-700 ${
          !clicked && "hidden"
        }`}
      >
        <ul className="h-auto py-2 overflow-y-auto text-gray-700 dark:text-gray-200">
          {users?.map((user: any) => (
            <li key={user._id}>
              <a
                href="#"
                onClick={(e) => selectHandler(e, user._id)}
                className={`${
                  user._id === selected._id
                    ? "bg-gray-200 border-zinc-400 border-s-4"
                    : "hover:bg-gray-100 dark:hover:bg-gray-600"
                } flex items-center px-4 py-2 dark:hover:text-white`}
              >
                <Image
                  width={24}
                  height={24}
                  className="w-6 h-6 me-2 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                {user.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
