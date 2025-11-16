import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pr-12 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <span
        className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
        onClick={() => setShow(!show)}
      >
        {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
      </span>
    </div>
  );
}
