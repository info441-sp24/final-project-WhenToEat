import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom"
import '../styles/Navbar.css';
import logo from '../assets/Logo.png'
import axios from "axios";

const Navbar = () => {
	const [loading, setLoading] = useState(true);
	const [identityInfo, setIdentityInfo] = useState(null);

    useEffect(() => {
		const fetchIdentityInfo = async () => {
			try {
				const response = await axios.get('http://localhost:8080/api/users/myIdentity');
				console.log("API Response:", response.data);
				setIdentityInfo(response.data);
			} catch (error) {
				console.error("Error fetching identity info:", error);
			} finally {
				setLoading(false);
			}
		};
	
		fetchIdentityInfo();
	}, []);

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
				{loading ? (
					<p>Loading...</p>
				) : (
					identityInfo && identityInfo.status === 'loggedin' ? (
						<a href="http://localhost:3001/signout">Log out</a>
					) : (
						<a href="http://localhost:3001/signin">Sign in</a>
					)
				)}
			</div>
        </nav>
        )
}

export default Navbar;
