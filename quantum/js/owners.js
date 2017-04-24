
//Please keep the owner names consistent with phonebook names

var OWNERS = {
  "AudioChannel": "Blake Wu", // Firefox OS
  "B2gInstaller": "Gregor Wagner (Alex Lissy, Dale Harvey)",
  "BetaTriage": "?", // Firefox OS
  "Bluetooth": "Ben Tian", // Firefox OS
  "Build Config": "Dylan Oliver", // Core
  "Canvas: 2D": "Milan Sreckovic (Benoit Jacob, Jeff Muizelaar)",
  "Canvas: WebGL": "Milan Sreckovic (Benoit Jacob, Jeff Gilbert)",
  "Certification Suite": "Kevin Hu",
  "CSS Parsing and Computation": "Jet Villegas",
  "Developer Tools": "Jan Keromnes (Alexandre Poirot, Ryan Stinnett)",
  "Emulator": "Thomas Zimmermann (Edgar Chen)", // Firefox OS
  "FindMyDevice": "Alexandre Lissy, Mark Goodwin, Jared Hirsch",
  "FxA": "Chris Karlof", // Firefox OS
  "DOM: Apps": "Fabrice Desré",
  "DOM: Core & HTML": "Andrew Overholt (Johnny Stenback)", // DOM
  "DOM": "Andrew Overholt (2nd: Johnny Stenback)", // DOM
  "DOM: Contacts": "David Scravaglieri (Francisco Jordano)", // DOM
  "DOM: Device Interfaces": "Andrew Overholt (Johnny Stenback)", // DOM
  "DOM: Events": "Andrew Overholt (Johnny Stenback)",
  "Gaia": "David Scravaglieri (Francisco Jordano)",
  // "Gaia:: Achievements": "?",
  "Gaia::Bluetooth": "Tim Guan-tin Chien",
  "Gaia::Bookmark": "Gregor Wagner (Ben Francis)",
  "Gaia::Browser": "Gregor Wagner (Ben Francis)",
  "Gaia::Bugzilla Lite": "Dale Harvey",
  "Gaia::Build": "Tim Guan-tin Chien (Ricky Chien)",
  "Gaia::Calendar": "Dylan Oliver (Gareth Aye)",
  "Gaia::Camera": "Hema Koka (David Flanagan)",
  "Gaia::Clock": "Dylan Oliver (Marcus Cavanaugh)",
  "Gaia::Components": "Wilson Page",
  "Gaia::Contacts": "David Scravaglieri (Francisco Jordano)",
  "Gaia::Cost Control": "David Scravaglieri (Francisco Jordano)",
  "Gaia::Customizer": "Doug Sherk",
  "Gaia::Dialer": "David Scravaglieri (Francisco Jordano)",
  "Gaia::E-Mail": "Dylan Oliver (Andrew Sutherland)",
  "Gaia::Everything.me": "Gregor Wagner (Chris Lord)",
  // "Gaia:: Feedback": "?",
  "Gaia::First Time Experience": "Gregor Wagner (Sam Foster)",
  "Gaia::FMRadio": "Hema Koka (David Flanagan)",
  "Gaia::Foxfooding": "Jean Gong",
  "Gaia::Gallery": "Hema Koka (David Flanagan)",
  "Gaia::GithubBot": "Kevin Grandon",
  "Gaia::Hackerplace": "Michael Henretty",
  "Gaia::Homescreen": "Gregor Wagner (Chris Lord)",
  "Gaia::Keyboard": "Tim Guan-tin Chien",
  "Gaia::L10n": "Zibi Braniecki (Stas Malolepszy)",
  // "Gaia:: Loop": "?",
  "Gaia::Music": "Hema Koka (David Flanagan)",
  "Gaia::Network Alerts": "Steve Chung (Julien Wajsberg, Aleh Zasypkin)",
  "Gaia::Notes": "Dylan Oliver",
  // "Gaia::P2P Sharing": "?",
  // "Gaia::PDF Viewer": "?",
  "Gaia::PerformanceTest": "Eli Perelman (Rob Wood, TingYu Chou)",
  "Gaia::Project Infrastructure": "Gareth Aye (Ghislain Locroix, Eli Perelman, Kevin Grandon)",
  "Gaia::Ringtones": "Hema Koka (David Flanagan)",
  "Gaia::Search": "Gregor Wagner (Kevin Grandon)",
  "Gaia::Settings": "Tim Guan-tin Chien (Fred Lin)",
  "Gaia::Shared": "David Flanagan (Kevin Grandon)",
  "Gaia::SMS": "David Scravaglieri (Francisco Jordano)",
  "Gaia::System": "Michael Henretty (Gregor Wagner, Tim Guan-tin Chien)", //  Tim to rely on Gregor to actively throwing bugs over.
  "Gaia::System::Accessibility": "Eithan Isaacson, Yura Zenevich",
  "Gaia::System::Audio Mgmt": "Tim Guan-tin Chien (Evan Tesng)",
  "Gaia::System::Browser Chrome": "Gregor Wagner (Ben Francis)",
  "Gaia::System::Download": "Gregor Wagner (Aus Lacroix)",
  "Gaia::System::Input Mgmt": "Tim Guan-tin Chien",
  "Gaia::System::Lockscreen": "Tim Guan-tin Chien (Greg Weng)",
  "Gaia::System::Mobile Connection": "Etienne Segonzac, Sean McArthur",
  "Gaia::System::MobileID": "Fernando Jiménez Moreno",
  "Gaia::System::Music Control": "Hema Koka & Tim Guan-tin Chien",
  "Gaia::System::Payments": "Fernando Jiménez Moreno",
  // "Gaia::System::Power Mgmt": "?",
  // "Gaia::System::SIM Tool Kit": "?",
  "Gaia::System::Status Bar, Utility tray, Notification": "Michael Henretty",
  // "Gaia::System::Storage Mgmt": "?",
  "Gaia::System::System UI": "Michael Henretty",
  "Gaia::System::Task Manager": "Gregor Wagner (Sam Foster)",
  "Gaia::System::WebRTC": "Tim Guan-tin Chien (Fred Lin)",
  "Gaia::System::Wifi": "Tim Guan-tin Chien",
  "Gaia::System::Window Mgmt": "Tim Guan-tin Chien",
  // "Gaia::TestAgent": "Garreth Aye, Aus Lacroix",
  // "Gaia::Theme Editor": "?",
  "Gaia::TV": "Evelyn Hung (Rex Lee)",
  "Gaia::TV::Home": "Evelyn Hung (Rex Lee)",
  "Gaia::TV::System": "Evelyn Hung (Rex Lee)",
  "Gaia::UI Tests": "Dylan Oliver (Gareth Aye)",
  "Gaia::Video": "Hema Koka (David Flanagan)",
  "Gaia::VoiceControl": "Dylan Oliver (Kelly Davis)",
  "Gaia::Wallpaper": "David Flanagan (Punam Dahiya)",
  "Gaia::Wappush": "David Scravaglieri (Francisco Jordano)",
  "General (Firefox OS)": "Mahendranadh Potharaju",
  "General (Core)": "Lawrence Mandel",
  "General (Loop+)": "Lawrence Mandel",
  // "GonkIntegration": "?", // Firefox OS
  "General Automation": "Jonathan Griffin", // Release Engineering
  "Geolocation": "Doug Turner", // Core
  "Graphics": "Milan Sreckovic (Jeff Muizelaar, Benoit Girard)", // Core
  "Graphics: Layers": "Milan Sreckovic (Bas Schouten, Benoit Girard)", // Core
  // "Hardware": "?", // Firefox OS
  "Hardware Abstraction Layer (HAL)": "Dave Hylands", // Core
  "ImageLib": "Milan Sreckovic (Jeff Muizelaar, Seth Fowler)",
  // "Infrastructure": "?", // Firefox OS
  "IPC": "Andrew Overholt (Johnny Stenback)",
  "JavaScript Engine": "Naveed Ihsanullah", // Core
  "JavaScript: GC": "Naveed Ihsanullah", // Core
  "Layout": "Jet Villegas", // Core
  // "MCTS Waiver Request": "?", // Firefox OS
  // "Metrics": "?", // Firefox OS
  "MTP/UMS": "Ben Tian", // Firefox OS
  // "MTBF": "?", // Firefox OS
  "MFBT": "Naveed Ihsanullah", // Core
  "Networking": "Jason Duell", // Core
  "NFC": "Ethan Tseng", // Firefox OS
  "RTSP": "Ethan Tseng", // Firefox OS
  "Panning and Zooming": "Milan Sreckovic (Kartikaya Gupta, Botond Ballo)", // Core
  "Performance": "Everyone", // Firefox OS
  "Runtime": "Gregor Wagner (Fabrice Desré)", // Firefox OS
  // "Simulator": "?", // Firefox OS
  "RIL": "Hsinyi Tsai", // Firefox OS
  // "Runtime": "?",
  // "Stimulator": "?",
  // "Stability": "Al Tsai",
  // "Sync": "Fernando Jimenez"
  "Video/Audio": "Jet Villegas", // Core
  "Video/Audio: Recording": "Blake Wu", // Core
  "Vendcom": "Vance Chen", // Firefox OS
  "Widget: Gonk": "Mike Wu",
  "Wifi": "Ethan Tseng" // Firefox OS
  // "WMF": "?" // Firefox OS
};
