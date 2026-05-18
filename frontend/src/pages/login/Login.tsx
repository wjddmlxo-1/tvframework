import { Link } from "react-router-dom";

import LoginContent from "@/pages/login/LoginContent";
import URL from "@/constants/url";

function Login(props) {
  const onChangeLogin = (user) => {
    props.onChangeLogin(user);
  };

  return (
    <div className="md-login-standalone">
      <div className="md-login-standalone__inner">
        <LoginContent onChangeLogin={onChangeLogin} />
      </div>
    </div>
  );
}
export default Login;