# LifeLog

**LifeLog** is a personal activity logger designed to track and manage various activities, such as vaping, gaming, driving, and more. Originally conceived as a habit tracker, the project has evolved into a comprehensive tool that serves as an external brain or memory, helping users monitor their daily activities, finances, and overall well-being. LifeLog integrates a backend server hosted on DigitalOcean and uses Siri Shortcuts for an intuitive user interface on iOS devices.

### Features

- **Activity Logging:** Log a wide range of activities with accurate timestamps and descriptions.
- **Editing Logs:** Edit existing log entries to correct timings or details.
- **Pagination:** View logged activities in paginated lists to manage large volumes of data.
- **Predictive Logging:** Uses machine learning to predict and suggest the next likely activity for easier logging (planned).
- **Financial Tracking:** Track bills, payments, and income, with reminders for due dates and budgeting suggestions (planned).
- **Context-Aware Suggestions:** Provides personalized advice based on your current activities, mood, and environment (planned).
- **Web Dashboard (Future):** Planned web interface for visualizing trends, managing settings, and analyzing data on a larger screen (planned).

### Getting Started

#### Prerequisites

- Node.js (version X.X.X or later)
- SQLite
- npm
- DigitalOcean Droplet (or any preferred hosting solution)

#### Installation

1. **Clone the Repository:**

   ```sh
   git clone https://github.com/yourusername/LifeLog.git
   cd LifeLog
   ```

2. **Install Dependencies:**

   ```sh
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add your API key and other necessary environment variables.

   ```
   API_KEY=your_generated_api_key
   ```

4. **Start the Server:**

   ```sh
   node index.js
   ```

5. **Set Up Siri Shortcuts:**
   - Configure Siri Shortcuts on your iOS device to interact with the LifeLog API.

### Usage

- **Logging an Activity:** Use the Siri Shortcut to log an activity. The backend API will store the entry in the database.
- **Viewing Activities:** Retrieve a paginated list of activities using the Siri Shortcut, which displays the time since the last logged activity.
- **Editing an Activity:** Edit a previously logged activity via the API, either through the Shortcut or directly via an HTTP request.

### Development

- **Contributing:** While this is currently a personal project, contributions are welcome. Please open an issue or submit a pull request if you have ideas or improvements.
- **Testing:** Testing is not yet setup at this time.

### Roadmap

- **Advanced Financial Management:** Deeper integration with financial tools for tracking and budgeting.
- **Machine Learning Enhancements:** Improved activity prediction models and smarter reminders.
- **Web Dashboard:** Development of a web interface for broader data analysis and management.
- **Context-Aware LLM Integration:** Implementing a language model to provide context-aware advice and insights, similar to JARVIS from Iron Man.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
