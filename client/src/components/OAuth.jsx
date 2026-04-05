import { signInFailure } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";

function OAuth() {
  const dispatch = useDispatch();

  const handleGoogleClick = async () => {
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
        onClick={handleGoogleClick}
      >
        <span className="icon-[devicon--google]"></span>
        <span>Continue with Google</span>
      </button>
      <button
        className="flex w-full gap-3 justify-center pl-4 border  py-3 rounded-md  items-center border-black"
        type="button"
      >
        <span className="icon-[logos--facebook]"></span>
        <span>Continue with Facebook</span>
      </button>
    </div>
  );
}

export default OAuth;
