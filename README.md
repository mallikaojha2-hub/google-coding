Problem statement2 : Community Hero - Hyperlocal Problem Solver


Solution Overview:Community hero app is a collaboration between government and community local people. It ensures Both party put efforts to solve all kinds of social problem through seamless communication and ensures transparency between both party
1.Communities frequently face issues such as potholes, water leakages, damaged streetlights, waste management concerns, and public infrastructure challenges. Reporting these issues is often fragmented, difficult to track, and lacks transparency.This application solves these challenges by providing an interactive, location-tagged tracking hub.It routes verified incidents directly to responsible government desks, monitors ongoing repair milestones, and drives long-term citizen engagement through a secure, cheat-resistant milestone gamification framework.
Key features:
This app consists of 4 tab:
1.Homepage/Hub map : 
 
* A map connected to google map to show the affected area with a search bar where user can search a place by pincode.
* On the left panel divide the all the issues in 4 categories - 1.Ongoing work 2.Under Review 3.Fixed and monitoring 4.New/submitted. Each tab is clickable  and after  clicking it will show the list of issues of that category. 
* Each ongoing issue will show a progress bar estimated time of completion of the task.  There is a chat section between users and working officers to address ongoing problems occurring due to construction/works.
* Each under-review tab will show whom the current workflow is pending with
* Fixed and New tickets will show 30 days monitoring status . If till 30 days no one files a new complaint or the solution works then the tracker will close the task permanently.
2.Report Wizard:
A form for community people to log a complaint.
* Automatic mobile GPS location lock-ins or manual pin-drops on an interactive mini-map,
* Issue with automated target routing to reach needed department 
* Description area, video, photo insert slot, submit button, cancel button
3. Admin tab
AI and Human in the loop tab
* First Ai will analyse the description , photo, videos and give it a category, and an urgency number .Humans can always manually edit that. Accept and reject button only available for humans.Only  after accepting the form  the request will go to the que        .
4.Civic guild
This is for games, points and community engagement. 
* A section showing total points of the user, Leaderboard.
* A fund raising panel for small community works showing full spending and remaining
* A notice board for Arrange small tasks like cleaning neighbourhood, fixing street light and posting notices
* An area to insert photos as a proof of community work.
Technologies used:
* Frontend and client-side
     React(v19),Tailwind CSS (v4),Motion, Lucide React
* Backend and API services
    Node.js & Express ,Google GenAI SDK, tsx & esbuild
* Maps and Location features
     @vis.gl/react-google-maps
Google Technologies utilised 
* Google Gemini API
* Google Maps Platform
* Google Cloud Run and AI studio Development Infrastructure