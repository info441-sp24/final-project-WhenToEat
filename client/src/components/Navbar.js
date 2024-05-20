import { NavLink } from "react-router-dom"
import '../styles/Navbar.css';
import logo from '../assets/Logo.png'

const Navbar = () => {
    return (
        <nav className='navigation'>
			<img src={logo} alt="When2Eat Logo" />
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