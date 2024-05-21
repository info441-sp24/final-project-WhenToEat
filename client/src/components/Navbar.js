import { NavLink } from "react-router-dom"
import '../styles/Navbar.css';
import logo from '../assets/Logo.png'

const Navbar = () => {
    return (
        <nav className='navigation'>
			<div className="navcontent">
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
					<li>
						<NavLink to='/explore'>
							Explore
						</NavLink>
					</li>
					<li>
						<NavLink to="/profile">
							Profile
						</NavLink>
					</li>
				</ul>
			</div>
			<div className="authBtns">
				<a href="http://localhost:8080/signin">Sign in</a>
			</div>
        </nav>
        )
}

export default Navbar;