# Group Project Proposal 
By: Jackie Chen, Kayla Doan, Quang Nguyen, Kaiden Ong, Ryan Nguyen

# Project Description

## Who is our target audidence?
Our target audience is indecisive individuals who want to socialize over food but cannot get an idea of their wants. I envision college students bringing up this website before going out and making a choice quickly to limit the time planning and focus on the time together.

## Why does your audience want to use your application? Please provide some sort of reasoning. 
Our audience wants to use our application because it allows them to save time and make choices for them. It also allows people to have better communication between users and make everyone’s choices and opinions heard.

## Why do you as developers want to build this application?
As people who love eating and trying out new places, it can be incredibly difficult to all agree on a location. Thus we wish there was a web app that made it easy and enjoyable to find a spot that the whole group agrees on. So logically it made sense for us to create this web app. As developers this app drew us in because while not extremely difficult, it still provides great opportunities to apply everything we learned in this class to an app we will actually use.

# Technical Description

## Architectural Diagram
We will use rest API to take user input as well as mongodb as the database to store user and restaurant information.

![User Flow Chart](public\img\User Flow Chart.jpg)

## API Endpoints:
POST /user/register - Registers a new user.
POST /user/login - Allows users to log into their account.
GET /user/logout - Ends the user's session.
GET /user/:id/profile - Retrieves the profile of a user based on their ID.
GET /restaurants/explore - Retrieves a list of all restaurants in the specified area, potentially using third-party APIs like Yelp or Google.
POST /restaurant/add - Allows a user to add a restaurant to the random selection wheel.
GET /restaurant/random - Returns a randomly selected restaurant from the wheel, with weighted choices based on user preferences.
POST /friends/add - Send a friend request to another user.
GET /friends/list/:id - Lists all friends of a specific user.

## Database Schemas 