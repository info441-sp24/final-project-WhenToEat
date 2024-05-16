import { NavLink } from "react-router-dom"

const Navbar = () => {
    return (
        <nav className='navigation'>
            <ul className='navlinks'>
              <li>
                <NavLink to='/'>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to='/wheel'>
                  Wheel
                </NavLink>
              </li>
            </ul>
        </nav>
        )
}

export default Navbar;