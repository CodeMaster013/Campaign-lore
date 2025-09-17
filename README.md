# Campaign-lore

Campaign-lore is a web application for organizing, exploring, and managing the lore and worldbuilding of a sci-fi tabletop DND world. The app provides a beautiful, production-ready interface for both players and game masters to interact with campaign lore, missions, star systems, NPCs, and more, with features for managing user authentication, access control, and collaborative content creation.

## Features

- **Dashboard:** Welcome interface showing campaign briefings, quick stats, and access level information.
- **Lore Database:** Central database of lore entries, including star systems, corporations, historical events, and more, organized by clearance level.
- **Star Map:** Interactive 2D/3D visualization of star systems, rendered on canvas, with access control based on user clearance.
- **Mission Board:** Track, assign, and view campaign missions, objectives, and rewards.
- **NPC Database:** Detailed records of notable non-player characters, their factions, relationships, and statuses.
- **Session Notes:** Record and review summaries, key events, player actions, and outcomes of campaign sessions.
- **Communication Hub:** In-universe messaging and transmissions system.
- **Terminal:** Immersive, themed command-line interface for deeper interaction or roleplay.
- **Admin Features:** Approval queue for new lore, session management, and user settings.
- **Authentication & Access Control:** User login, roles (player/admin), and clearance levels (Beta, Alpha, Omega).
- **Modern UI:** Built with React, Tailwind CSS, and Lucide icons for a sleek, responsive design.

## Tech Stack

- **Frontend:** TypeScript, React, Tailwind CSS, Lucide React
- **Backend/Storage:** Supabase for database and authentication
- **Tooling:** Vite, Vercel Analytics, Vercel Speed Insights

## Data Model Overview

The application uses a structured data model for all content, including:

- **User:** id, username, display name, clearance level, role, avatar, join/last active dates, etc.
- **LoreEntry:** id, name, type, classification, description, clearance level, details, relations, status, etc.
- **Mission:** id, title, description, status, priority, objectives, rewards, assigned users, etc.
- **NPC:** id, name, faction, description, relationships, status, tags, image, etc.
- **StarSystem:** id, name, coordinates, type, planets, description, control/faction, hazards, POIs, etc.
- **SessionNote:** id, session number, title, summary, key events, player actions, etc.
- **Communication:** id, sender/recipient, channel, message, type, clearance, etc.

## Example Lore Entries

The included lore database features entries such as:
- **Alpha Centauri System:** Humanity's first extrasolar foothold; home to several colonies and research enclaves.
- **United Laboratories:** Megacorporation leading R&D across the galaxy, with special privileges and a complex legacy.
- **Historic Corporations:** RDA and Faro Automated Solutions, with detailed histories and campaign relevance.

## Design Philosophy

- **Production-Ready:** All designs aim for a beautiful, highly-polished interface.
- **Role-Based Access:** Most content and features are gated by player/admin role and clearance level, supporting secret or restricted lore.
- **Extensible & Immersive:** Modular components for different campaign needs, with an immersive sci-fi terminal aesthetic.

## Development

- Clone the repository and install dependencies.
- Configure environment variables for Supabase.
- Run the app with your preferred development server (e.g., Vite).

> Note: This project is under development and may not include all features yet. For details or to see more files, check the [GitHub repository file browser](https://github.com/CodeMaster013/Campaign-lore)

## Contributors
I thank all contributors who help me improve and fix my project

Contributors include:
- **Sehnya**

And once again, Thanks!
