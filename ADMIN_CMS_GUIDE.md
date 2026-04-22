# 🏆 Efren Billiards CMS: The Ultimate Admin Guide

This guide is your master manual for managing the Efren Billiards & Events platform. It combines a comprehensive feature list with "Deep Dive" explanations of the technology—written for humans.

---

## 🎨 1. Branding & Visuals (The "Face" of the Site)
*Manage how the world sees your club.*

### **Modules:**
- **Hero Section**: Directly edit the homepage headline. It uses **Database Syncing**, meaning you change text once and it updates across all devices instantly.
- **Site Images**: Swaps backgrounds and logos. 💡 *Layman's Tip: Use high-quality direct image links from your storage.*
- **Image Gallery & Videos**: Add/Remove visual content. The video section supports **Embed Logic**, which means you only need to paste a YouTube link.

---

## 🍽️ 2. Services & Menu (The "Engine" of the Business)
*Control your offerings and live pricing.*

### **Modules:**
- **Event Pricing (The Price Engine)**: 
    - **Technical Deep Dive**: This isn't just text. It’s a variable used by the "Price Estimator" code. When you change the "Corporate Base Price," the website's calculator automatically re-calibrates its math for the next user.
- **Membership Plans**: Controls the Bronze, Silver, and Gold landing pages. You change the benefits here, and they update in the metallic pricing cards on the site.
- **Food Menu**: A digital category system. 💡 *Layman's Tip: Organize by 'Espresso Bar', 'Snacks', etc.*

---

## 📅 3. Operations (Day-to-Day Management)
*Keeping the schedule and contact info fresh.*

### **Modules:**
- **Weekly Schedule**: Where you define daily offers.
    - **Technical Deep Dive**: These are "Time-Stamped Events." The system displays them based on the day of the week, so "Industry Night" automatically feels relevant to a user visiting on a Monday.
- **Contact & Social Links**: Centralized control for every phone number and social media button on the site.

---

## 🏆 4. Club Management (The Competition Engine)
*The most powerful part of the system.*

### **Module: Tournament Brackets & Elimination Logic**
- **How it works (Technical Deep Dive)**: 
    - **Parent-Child Logic**: Matches are linked together like branches. When you mark a "Winner," the system identifies the "Parent" match (the next round) and "moves" the player data into the correct slot (Slot 1 or 2) based on whether the match ID is even or odd.
    - **The Confirmation Safety**: Once a winner is set, the match is "Finalized" in the database to prevent manual tampering with history.

### **Module: Rankings (The Hall of Fame)**
- **How it works (Technical Deep Dive)**:
    - **Hybrid Linking**: We use "Null-Safe Lookups." This means a ranking can belong to a registered member (linking their full profile stats) OR it can be a "Guest Record" for legacy players who don't have an online account.
- **Corporate Rivalry**: Use the "Company" tag to activate the filtering feature on the live Darts/Billiards pages.

### **Module: Member Directory & Security**
- **The "Gatekeeper" (Technical Deep Dive)**:
    - Every user has a **Role Flag** (Guest, Admin). The CMS uses "Conditional Rendering"—a security check that hides all these admin buttons from anyone who doesn't have the "Admin Flag" on their account.

---

## 🧼 5. Maintenance & Blueprints (Migrations)
- **Concept**: Sometimes we need to change the "Database Blueprint" to add a new category or feature. 
- **Action**: You will be provided with `.sql` files. To apply them, simply copy the text into the **Supabase SQL Editor** and click **Run**. This is like "upgrading the foundation" of your digital club.

---

> [!TIP]
> **Pro Management**: Most modules have a **Preview Window**. Always look at the preview before saving to ensure your headlines and images fit perfectly in the site's premium layouts.
