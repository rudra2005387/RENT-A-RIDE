import { signInFailure } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

function VendorOAuth() {
  const dispatch = useDispatch();

  const handleVendorGoogleClick = async () => {
    dispatch(
      signInFailure({
        message: "Google login is not available. Please use email/password to sign in.",
      })
    );
  };
  return (
    <div className={`px-5`}>
      <button
        className="flex w-full gap-3 justify-center border  py-3 rounded-md  items-center  border-black mb-4"
        type="button"
        onClick={handleVendorGoogleClick}
      >
        <span className="icon-[devicon--google]"></span>
        <span>Continue with Google</span>
      </button>
     
    </div>
  );
}

export default VendorOAuth;
