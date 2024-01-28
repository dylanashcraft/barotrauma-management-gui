import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/players">Players</Link>
      </div>
    </nav>
  );
};

export default NavBar;