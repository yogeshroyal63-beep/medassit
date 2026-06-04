import { useAuth } from "../hooks/useAuth";

const Navbar = () => {

  const { logout } = useAuth();

  return (
    <header className="navbar">
      <h3>MedAssist</h3>
      <button onClick={logout}>Logout</button>
    </header>
  );

};

export default Navbar;