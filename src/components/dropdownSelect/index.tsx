import { Id } from "@convex/_generated/dataModel";
import { faCaretDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";

interface DropdownSelectProps {
  selected: any;
  users: any;
  assigneHandler: (id: Id<"users">) => void;
  unnasignHandler: () => void;
}

export default function DropdownSelect(props: DropdownSelectProps) {
  const { selected, users, assigneHandler, unnasignHandler } = props;
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
      <div className="inline-flex" role="group">
        <button
          className={`${selected ? 'text-zinc-400 border-zinc-300 hover:bg-zinc-50' : 'text-pink-300 border-pink-300 hover:bg-pink-50'} border-dotted border-2 focus:ring-4 focus:outline-none font-medium rounded-lg ${selected ? 'border-r-0 rounded-r-none' : ''} text-sm px-2 py-1.5 text-center inline-block items-center`}
          type="button"
          onClick={() => setClicked(!clicked)}
        >
          {selected ? (
            <div className="flex w-40 truncate text-ellipsis items-center">
              <Image
                width={14}
                height={14}
                className="w-6 h-6 me-2 rounded-full"
                src={selected.avatar}
                alt={selected.name}
              />
              {selected.name}
            </div>
          ) : (
            <div className="flex items-center">
              Assign to a member
              <FontAwesomeIcon icon={faCaretDown} className="ml-4"/>
            </div>
          )}
        </button>
        {selected && (
          <button
            onClick={() => unnasignHandler()}
            type="button"
            className="text-zinc-300 mr-4 border-dotted border-2 border-zinc-300 rounded-l-none font-medium rounded-lg text-sm px-2 py-1.5 text-center hover:bg-zinc-50">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

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
                  user?._id === selected?._id
                    ? "bg-gray-200 border-zinc-400 border-s-4"
                    : "hover:bg-gray-100 dark:hover:bg-gray-600"
                } flex items-center px-4 py-2 dark:hover:text-white`}
              >
                <Image
                  width={14}
                  height={14}
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
